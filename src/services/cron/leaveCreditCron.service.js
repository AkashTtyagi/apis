/**
 * Leave Credit Cron Service
 * Handles automatic leave credit disbursement based on credit_frequency
 * Updates HrmsLeaveLedger and HrmsEmployeeLeaveBalance
 *
 * Flow: Companies → Employees → Leave Policy → Leave Types → Credit
 */

const { HrmsCompany } = require('../../models/HrmsCompany');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsLeaveMaster } = require('../../models/HrmsLeaveMaster');
const { HrmsLeavePolicyMaster } = require('../../models/HrmsLeavePolicyMaster');
const { HrmsLeavePolicyMapping } = require('../../models/HrmsLeavePolicyMapping');
const { HrmsLeaveLedger } = require('../../models/HrmsLeaveLedger');
const { HrmsEmployeeLeaveBalance } = require('../../models/HrmsEmployeeLeaveBalance');
const { sequelize } = require('../../utils/database');
const { Op } = require('sequelize');

/**
 * Get credit amount based on employee status
 * @param {Object} leaveType - Leave type object
 * @param {number} employeeStatus - Employee status (0-6)
 * @returns {number} Credit amount
 */
const getCreditAmountByStatus = (leaveType, employeeStatus) => {
    switch (employeeStatus) {
        case 0: // Active
            return leaveType.active_leaves_to_credit || leaveType.number_of_leaves_to_credit;
        case 1: // Probation
            return leaveType.probation_leaves_to_credit || leaveType.number_of_leaves_to_credit;
        case 2: // Internship
            return leaveType.intern_leaves_to_credit || leaveType.number_of_leaves_to_credit;
        case 3: // Separated
            return leaveType.separated_leaves_to_credit || 0;
        case 4: // Absconded
            return 0;
        case 5: // Terminated
            return 0;
        case 6: // Suspended
            return leaveType.suspended_leaves_to_credit || 0;
        default:
            return leaveType.number_of_leaves_to_credit;
    }
};

/**
 * Check if employee is eligible for leave type
 * @param {Object} employee - Employee object
 * @param {Object} leaveType - Leave type object
 * @returns {boolean} True if eligible
 */
const isEmployeeEligible = (employee, leaveType) => {
    // Check if employee status is in applicable_to_status
    const applicableStatuses = leaveType.applicable_to_status.split(',').map(s => parseInt(s.trim()));
    if (!applicableStatuses.includes(employee.status)) {
        return false;
    }

    // Check gender eligibility
    if (leaveType.applicable_to_gender !== 'all') {
        if (employee.gender !== leaveType.applicable_to_gender) {
            return false;
        }
    }

    // Check joining period restriction
    if (leaveType.restrict_after_joining_period && leaveType.restrict_after_joining_period !== 'no_restriction') {
        if (!employee.date_of_joining) {
            return false;
        }

        if (leaveType.restrict_after_joining_period === 'exclude_probation_period') {
            // If still in probation, not eligible
            if (employee.status === 1) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Check if leave should be credited in this frequency run
 * Tracks if leave was already credited in this cycle
 * @param {number} employee_id - Employee ID
 * @param {number} leave_type_id - Leave type ID
 * @param {number} cycleYear - Leave cycle year
 * @param {string} frequency - Credit frequency
 * @param {Object} transaction - Database transaction
 * @returns {boolean} True if should credit
 */
const shouldCreditInThisFrequency = async (employee_id, leave_type_id, cycleYear, frequency, transaction) => {
    // Get last credit entry for this leave type in current cycle
    const lastCredit = await HrmsLeaveLedger.findOne({
        where: {
            employee_id,
            leave_type_id,
            leave_cycle_year: cycleYear,
            transaction_type: 'credit',
            reference_type: 'auto_credit'
        },
        order: [['transaction_date', 'DESC'], ['id', 'DESC']],
        attributes: ['transaction_date', 'remarks'],
        raw: true,
        transaction
    });

    if (!lastCredit) {
        return true; // No previous credit, go ahead
    }

    const today = new Date();
    const lastCreditDate = new Date(lastCredit.transaction_date);

    // Check based on frequency
    switch (frequency) {
        case 'yearly':
            // Should credit only once per year
            return lastCreditDate.getFullYear() < today.getFullYear();

        case 'half_yearly':
            // Should credit twice per year (Jan and Jul)
            const currentHalf = today.getMonth() < 6 ? 1 : 2;
            const lastCreditHalf = lastCreditDate.getMonth() < 6 ? 1 : 2;
            return !(lastCreditDate.getFullYear() === today.getFullYear() && currentHalf === lastCreditHalf);

        case 'quarterly':
            // Should credit 4 times per year
            const currentQuarter = Math.floor(today.getMonth() / 3);
            const lastCreditQuarter = Math.floor(lastCreditDate.getMonth() / 3);
            return !(lastCreditDate.getFullYear() === today.getFullYear() && currentQuarter === lastCreditQuarter);

        case 'monthly':
            // Should credit once per month
            return !(lastCreditDate.getFullYear() === today.getFullYear() &&
                     lastCreditDate.getMonth() === today.getMonth());

        default:
            return true;
    }
};

/**
 * Credit leaves to an employee
 * @param {Object} employee - Employee object
 * @param {Object} leaveType - Leave type object
 * @param {number} amount - Credit amount
 * @param {number} cycleYear - Leave cycle year
 * @param {number} month - Current month
 * @param {string} frequency - Credit frequency
 * @param {Object} transaction - Database transaction
 */
const creditLeavesToEmployee = async (employee, leaveType, amount, cycleYear, month, frequency, transaction) => {
    try {
        // Get current balance from latest ledger entry
        const latestLedger = await HrmsLeaveLedger.findOne({
            where: {
                employee_id: employee.id,
                leave_type_id: leaveType.id,
                leave_cycle_year: cycleYear
            },
            order: [['transaction_date', 'DESC'], ['id', 'DESC']],
            attributes: ['balance_after_transaction'],
            raw: true,
            transaction
        });

        const previousBalance = latestLedger?.balance_after_transaction || 0;
        let creditAmount = parseFloat(amount);

        // Round off if configured
        if (leaveType.round_off_credited_leaves) {
            creditAmount = Math.round(creditAmount);
        }

        const newBalance = parseFloat(previousBalance) + creditAmount;

        // Create ledger entry (even if credit amount is 0)
        await HrmsLeaveLedger.create({
            employee_id: employee.id,
            leave_type_id: leaveType.id,
            leave_cycle_year: cycleYear,
            transaction_type: 'credit',
            amount: creditAmount,
            balance_after_transaction: newBalance,
            transaction_date: new Date(),
            reference_type: 'auto_credit',
            reference_id: null,
            remarks: `Auto credit - ${frequency}`,
            created_by: null // System generated
        }, { transaction });

        // Update or create employee leave balance (always create entry even if balance is 0)
        const [balanceRecord, created] = await HrmsEmployeeLeaveBalance.findOrCreate({
            where: {
                employee_id: employee.id,
                leave_type_id: leaveType.id,
                leave_cycle_year: cycleYear,
                month: month,
                year: cycleYear
            },
            defaults: {
                company_id: employee.company_id,
                available_balance: newBalance
            },
            transaction
        });

        if (!created) {
            await balanceRecord.update({
                available_balance: newBalance
            }, { transaction });
        }

        console.log(`      ✓ Credited ${creditAmount} ${leaveType.leave_code} to ${employee.employee_code} (Balance: ${newBalance})`);

        return {
            employee_id: employee.id,
            employee_code: employee.employee_code,
            leave_type: leaveType.leave_code,
            credited: creditAmount,
            new_balance: newBalance
        };
    } catch (error) {
        console.error(`      ✗ Error crediting leaves to employee ${employee.employee_code}:`, error.message);
        throw error;
    }
};

/**
 * Process leave credits for a specific frequency (company-wise approach)
 * Flow: Companies → Employees → Leave Policy → Leave Types → Credit
 *
 * @param {string} frequency - Credit frequency (monthly, quarterly, half_yearly, yearly)
 * @param {number} dayOfMonth - Day of month to credit (optional, for monthly)
 */
const processLeaveCreditsByFrequency = async (frequency, dayOfMonth = null) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // 1-12

        console.log(`\n📅 Processing ${frequency} leave credits for ${today.toISOString().split('T')[0]}`);

        const results = [];

        // Step 1: Get all companies (HrmsCompany uses soft delete, not is_active)
        const companies = await HrmsCompany.findAll({
            attributes: ['id', 'org_name'],
            raw: true,
            transaction: dbTransaction
        });

        if (!companies || companies.length === 0) {
            console.log('No active companies found');
            await dbTransaction.commit();
            return { success: true, message: 'No companies to process', results: [] };
        }

        console.log(`Found ${companies.length} active company(ies)\n`);

        // Step 2: Process each company
        for (const company of companies) {
            console.log(`\n🏢 Processing Company: ${company.org_name} (ID: ${company.id})`);

            // Step 3: Get all active employees for this company
            const employees = await HrmsEmployee.findAll({
                where: {
                    company_id: company.id,
                    is_active: true,
                    leave_policy_id: { [Op.not]: null }
                },
                attributes: ['id', 'company_id', 'employee_code', 'status', 'gender', 'date_of_joining', 'leave_policy_id'],
                raw: true,
                transaction: dbTransaction
            });

            if (!employees || employees.length === 0) {
                console.log(`  No active employees with leave policy found`);
                continue;
            }

            console.log(`  Found ${employees.length} employee(s) with leave policy`);

            // Step 4: Process each employee
            for (const employee of employees) {
                console.log(`\n  👤 Employee: ${employee.employee_code} (Status: ${employee.status})`);

                // Step 5: Get employee's leave policy with mappings
                const leavePolicy = await HrmsLeavePolicyMaster.findOne({
                    where: {
                        id: employee.leave_policy_id,
                        is_active: true
                    },
                    include: [{
                        model: HrmsLeavePolicyMapping,
                        as: 'policyMappings',
                        where: { is_active: true },
                        required: false,
                        include: [{
                            model: HrmsLeaveMaster,
                            as: 'leaveType',
                            where: {
                                is_active: true,
                                credit_frequency: frequency,
                                ...(dayOfMonth !== null && { credit_day_of_month: dayOfMonth })
                            },
                            required: true
                        }]
                    }],
                    transaction: dbTransaction
                });

                if (!leavePolicy || !leavePolicy.policyMappings || leavePolicy.policyMappings.length === 0) {
                    console.log(`    ⊘ No ${frequency} leave types in policy`);
                    continue;
                }

                console.log(`    Found ${leavePolicy.policyMappings.length} leave type(s) for ${frequency} credit`);

                // Step 6: Process each leave type in employee's policy
                for (const mapping of leavePolicy.policyMappings) {
                    const leaveType = mapping.leaveType;
                    console.log(`\n    📋 ${leaveType.leave_name} (${leaveType.leave_code})`);

                    // Check employee eligibility
                    if (!isEmployeeEligible(employee, leaveType)) {
                        console.log(`      ⊘ Not eligible (status/gender mismatch)`);
                        continue;
                    }

                    // Determine cycle year based on leave cycle
                    const cycleStartMonth = leaveType.leave_cycle_start_month || 1;
                    let cycleYear = currentYear;
                    if (currentMonth < cycleStartMonth) {
                        cycleYear = currentYear - 1;
                    }

                    // Check if already credited in this frequency cycle
                    const shouldCredit = await shouldCreditInThisFrequency(
                        employee.id,
                        leaveType.id,
                        cycleYear,
                        frequency,
                        dbTransaction
                    );

                    if (!shouldCredit) {
                        console.log(`      ⊘ Already credited in this ${frequency} cycle`);
                        continue;
                    }

                    // Get credit amount based on employee status
                    const creditAmount = getCreditAmountByStatus(leaveType, employee.status);

                    console.log(`      Amount: ${creditAmount} (status ${employee.status})`);

                    // Credit leaves (even if amount is 0, create ledger entry and balance record)
                    const result = await creditLeavesToEmployee(
                        employee,
                        leaveType,
                        creditAmount,
                        cycleYear,
                        currentMonth,
                        frequency,
                        dbTransaction
                    );

                    results.push(result);
                }
            }
        }

        await dbTransaction.commit();

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✓ Successfully processed ${results.length} leave credit(s)`);
        console.log(`${'='.repeat(60)}\n`);

        return {
            success: true,
            message: `Processed ${results.length} leave credits`,
            companies_processed: companies.length,
            results
        };
    } catch (error) {
        await dbTransaction.rollback();
        console.error('❌ Error processing leave credits:', error.message);
        throw error;
    }
};

/**
 * Run daily cron job - checks all frequencies
 * This should be scheduled to run daily at a specific time (e.g., 00:01 AM)
 */
const runDailyLeaveCreditCron = async () => {
    try {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1; // 1-12

        console.log('\n' + '='.repeat(60));
        console.log('🔄 DAILY LEAVE CREDIT CRON JOB STARTED');
        console.log(`Date: ${today.toISOString()}`);
        console.log('='.repeat(60));

        const results = {
            monthly: null,
            quarterly: null,
            half_yearly: null,
            yearly: null
        };

        // Process monthly credits on configured day of month
        results.monthly = await processLeaveCreditsByFrequency('monthly', currentDay);

        // Process quarterly credits (every 3 months on day 1)
        if ([1, 4, 7, 10].includes(currentMonth) && currentDay === 1) {
            results.quarterly = await processLeaveCreditsByFrequency('quarterly', 1);
        }

        // Process half-yearly credits (January 1 and July 1)
        if ([1, 7].includes(currentMonth) && currentDay === 1) {
            results.half_yearly = await processLeaveCreditsByFrequency('half_yearly', 1);
        }

        // Process yearly credits (January 1)
        if (currentMonth === 1 && currentDay === 1) {
            results.yearly = await processLeaveCreditsByFrequency('yearly', 1);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✓ DAILY LEAVE CREDIT CRON JOB COMPLETED');
        console.log('='.repeat(60) + '\n');

        return results;
    } catch (error) {
        console.error('❌ Fatal error in daily leave credit cron:', error);
        throw error;
    }
};

module.exports = {
    runDailyLeaveCreditCron,
    processLeaveCreditsByFrequency,
    creditLeavesToEmployee,
    isEmployeeEligible,
    getCreditAmountByStatus,
    shouldCreditInThisFrequency
};
