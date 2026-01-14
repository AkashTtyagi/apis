/**
 * Leave Balance Service
 * Handles leave balance calculations and ledger management
 */

const { HrmsEmployee } = require('../models/HrmsEmployee');
const { HrmsLeaveMaster } = require('../models/HrmsLeaveMaster');
const { HrmsLeaveLedger } = require('../models/HrmsLeaveLedger');
const { HrmsEmployeeLeaveBalance } = require('../models/HrmsEmployeeLeaveBalance');
const { HrmsLeavePolicyMapping } = require('../models/HrmsLeavePolicyMapping');
const { sequelize } = require('../utils/database');
const { Op } = require('sequelize');

/**
 * Get employee leave balance with leave type details
 * @param {number} employee_id - Employee ID
 * @param {number} leave_cycle_year - Leave cycle year (optional, defaults to current year)
 * @returns {Array} Leave balance with leave type details
 */
const getEmployeeLeaveBalance = async (employee_id, leave_cycle_year = null) => {
    try {
        // Get employee details with leave policy
        const employee = await HrmsEmployee.findOne({
            where: { id: employee_id, status: { [Op.in]: [0, 1, 2] } },
            attributes: ['id', 'company_id', 'leave_policy_id', 'status'],
            raw: true
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        if (!employee.leave_policy_id) {
            throw new Error('No leave policy assigned to employee');
        }

        // Use current year if not provided
        const cycleYear = leave_cycle_year || new Date().getFullYear();

        // Get all leave types mapped to employee's policy
        const policyMappings = await HrmsLeavePolicyMapping.findAll({
            where: {
                policy_id: employee.leave_policy_id,
                is_active: true
            },
            include: [{
                model: HrmsLeaveMaster,
                as: 'leaveType',
                where: { is_active: true },
                required: true
            }],
            order: [['display_order', 'ASC']]
        });

        if (!policyMappings || policyMappings.length === 0) {
            return [];
        }

        // Get balances for each leave type
        const leaveBalances = [];

        for (const mapping of policyMappings) {
            const leaveType = mapping.leaveType;

            // Get latest ledger entry to get current balance
            const latestLedger = await HrmsLeaveLedger.findOne({
                where: {
                    employee_id,
                    leave_type_id: leaveType.id,
                    leave_cycle_year: cycleYear
                },
                order: [['transaction_date', 'DESC'], ['id', 'DESC']],
                attributes: ['balance_after_transaction'],
                raw: true
            });

            const available_balance = latestLedger?.balance_after_transaction || 0;

            leaveBalances.push({
                leave_type_id: leaveType.id,
                leave_code: leaveType.leave_code,
                leave_name: leaveType.leave_name,
                leave_type: leaveType.leave_type,
                is_encashment_allowed: leaveType.is_encashment_allowed,

                // Balance details
                available_balance: parseFloat(available_balance),

                // Leave type configuration
                can_request_half_day: leaveType.can_request_half_day,
                can_employee_request: leaveType.can_employee_request,
                max_continuous_leave: leaveType.max_continuous_leave,
                max_leaves_per_month: leaveType.max_leaves_per_month,
                backdated_leave_allowed: leaveType.backdated_leave_allowed,
                days_allowed_for_backdated_leave: leaveType.days_allowed_for_backdated_leave,
                future_dated_leave_allowed: leaveType.future_dated_leave_allowed,
                document_required: leaveType.document_required
            });
        }

        return leaveBalances;
    } catch (error) {
        console.error('Error fetching employee leave balance:', error.message);
        throw error;
    }
};

/**
 * Credit leaves to employee (add to ledger)
 * @param {Object} creditData - Credit transaction data
 * @returns {Object} Created ledger entry and updated balance
 */
const creditLeaves = async (creditData) => {
    const {
        employee_id,
        leave_type_id,
        leave_cycle_year,
        amount,
        transaction_type = 'credit',
        reference_type = 'system_credit',
        reference_id = null,
        remarks = null,
        created_by = null
    } = creditData;

    const transaction = await sequelize.transaction();

    try {
        // Get current balance from latest ledger entry
        const latestLedger = await HrmsLeaveLedger.findOne({
            where: {
                employee_id,
                leave_type_id,
                leave_cycle_year
            },
            order: [['transaction_date', 'DESC'], ['id', 'DESC']],
            attributes: ['balance_after_transaction'],
            raw: true,
            transaction
        });

        const previousBalance = latestLedger?.balance_after_transaction || 0;
        const newBalance = parseFloat(previousBalance) + parseFloat(amount);

        // Create ledger entry
        const ledgerEntry = await HrmsLeaveLedger.create({
            employee_id,
            leave_type_id,
            leave_cycle_year,
            transaction_type,
            amount: parseFloat(amount),
            balance_after_transaction: newBalance,
            transaction_date: new Date(),
            reference_type,
            reference_id,
            remarks,
            created_by
        }, { transaction });

        await transaction.commit();

        return {
            ledgerEntry,
            previousBalance: parseFloat(previousBalance),
            newBalance: parseFloat(newBalance),
            credited: parseFloat(amount)
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error crediting leaves:', error.message);
        throw error;
    }
};

/**
 * Debit leaves from employee (add to ledger)
 * @param {Object} debitData - Debit transaction data
 * @returns {Object} Created ledger entry and updated balance
 */
const debitLeaves = async (debitData) => {
    const {
        employee_id,
        leave_type_id,
        leave_cycle_year,
        amount,
        transaction_type = 'debit',
        reference_type = 'leave_request',
        reference_id = null,
        remarks = null,
        created_by = null
    } = debitData;

    const transaction = await sequelize.transaction();

    try {
        // Get current balance from latest ledger entry
        const latestLedger = await HrmsLeaveLedger.findOne({
            where: {
                employee_id,
                leave_type_id,
                leave_cycle_year
            },
            order: [['transaction_date', 'DESC'], ['id', 'DESC']],
            attributes: ['balance_after_transaction'],
            raw: true,
            transaction
        });

        if (!latestLedger) {
            throw new Error('No leave balance found for this employee and leave type');
        }

        const previousBalance = parseFloat(latestLedger.balance_after_transaction);
        const debitAmount = Math.abs(parseFloat(amount));

        // Check if sufficient balance
        if (previousBalance < debitAmount) {
            throw new Error(`Insufficient leave balance. Available: ${previousBalance}, Required: ${debitAmount}`);
        }

        const newBalance = previousBalance - debitAmount;

        // Create ledger entry (amount should be negative for debit)
        const ledgerEntry = await HrmsLeaveLedger.create({
            employee_id,
            leave_type_id,
            leave_cycle_year,
            transaction_type,
            amount: -debitAmount,
            balance_after_transaction: newBalance,
            transaction_date: new Date(),
            reference_type,
            reference_id,
            remarks,
            created_by
        }, { transaction });

        await transaction.commit();

        return {
            ledgerEntry,
            previousBalance,
            newBalance,
            debited: debitAmount
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error debiting leaves:', error.message);
        throw error;
    }
};

/**
 * Reverse a leave transaction (for cancellations)
 * @param {number} original_transaction_id - Original transaction ID to reverse
 * @param {number} created_by - User ID who is reversing
 * @returns {Object} Reversal ledger entry
 */
const reverseLeaveTransaction = async (original_transaction_id, created_by = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Get original transaction
        const originalTransaction = await HrmsLeaveLedger.findByPk(original_transaction_id, { transaction });

        if (!originalTransaction) {
            throw new Error('Original transaction not found');
        }

        // Check if already reversed
        const existingReversal = await HrmsLeaveLedger.findOne({
            where: { reverses_transaction_id: original_transaction_id },
            transaction
        });

        if (existingReversal) {
            throw new Error('Transaction already reversed');
        }

        // Only debit transactions can be reversed
        if (!['debit', 'adjustment_debit', 'penalty'].includes(originalTransaction.transaction_type)) {
            throw new Error('Only debit transactions can be reversed');
        }

        // Get current balance from latest ledger entry
        const latestLedger = await HrmsLeaveLedger.findOne({
            where: {
                employee_id: originalTransaction.employee_id,
                leave_type_id: originalTransaction.leave_type_id,
                leave_cycle_year: originalTransaction.leave_cycle_year
            },
            order: [['transaction_date', 'DESC'], ['id', 'DESC']],
            attributes: ['balance_after_transaction'],
            raw: true,
            transaction
        });

        const previousBalance = parseFloat(latestLedger?.balance_after_transaction || 0);
        const reversalAmount = Math.abs(parseFloat(originalTransaction.amount)); // Convert negative to positive
        const newBalance = previousBalance + reversalAmount;

        // Create reversal entry (positive amount to add back)
        const reversalEntry = await HrmsLeaveLedger.create({
            employee_id: originalTransaction.employee_id,
            leave_type_id: originalTransaction.leave_type_id,
            leave_cycle_year: originalTransaction.leave_cycle_year,
            transaction_type: 'reversal',
            amount: reversalAmount,
            balance_after_transaction: newBalance,
            transaction_date: new Date(),
            reference_type: 'leave_cancellation',
            reference_id: originalTransaction.reference_id,
            remarks: `Reversal of transaction #${original_transaction_id}`,
            created_by,
            reverses_transaction_id: original_transaction_id
        }, { transaction });

        await transaction.commit();

        return {
            reversalEntry,
            previousBalance,
            newBalance,
            reversedAmount: reversalAmount
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error reversing leave transaction:', error.message);
        throw error;
    }
};

/**
 * Get leave ledger history for an employee
 * @param {number} employee_id - Employee ID
 * @param {number} leave_type_id - Leave type ID (optional)
 * @param {number} leave_cycle_year - Leave cycle year (optional)
 * @param {number} limit - Limit number of records (optional)
 * @param {string} reference_type - Reference type filter (optional)
 * @returns {Array} Ledger entries
 */
const getEmployeeLeaveLedger = async (employee_id, leave_type_id = null, leave_cycle_year = null, limit = 100, reference_type = null) => {
    try {
        const whereClause = { employee_id };

        if (leave_type_id) {
            whereClause.leave_type_id = leave_type_id;
        }

        if (leave_cycle_year) {
            whereClause.leave_cycle_year = leave_cycle_year;
        } else {
            whereClause.leave_cycle_year = new Date().getFullYear();
        }

        if (reference_type) {
            whereClause.reference_type = reference_type;
        }

        const ledgerEntries = await HrmsLeaveLedger.findAll({
            where: whereClause,
            include: [{
                model: HrmsLeaveMaster,
                as: 'leaveType',
                attributes: ['id', 'leave_code', 'leave_name', 'leave_type']
            }],
            order: [['transaction_date', 'DESC'], ['id', 'DESC']],
            limit
        });

        return ledgerEntries;
    } catch (error) {
        console.error('Error fetching leave ledger:', error.message);
        throw error;
    }
};

/**
 * Get detailed balance breakdown from ledger
 * @param {number} employee_id - Employee ID
 * @param {number} leave_type_id - Leave type ID
 * @param {number} leave_cycle_year - Leave cycle year
 * @returns {Object} Detailed balance breakdown
 */
const getDetailedBalanceBreakdown = async (employee_id, leave_type_id, leave_cycle_year) => {
    try {
        // Get all ledger entries
        const ledgerEntries = await HrmsLeaveLedger.findAll({
            where: {
                employee_id,
                leave_type_id,
                leave_cycle_year
            },
            order: [['transaction_date', 'ASC'], ['id', 'ASC']],
            raw: true
        });

        let total_credited = 0;
        let total_debited = 0;
        let carried_forward = 0;
        let encashed = 0;
        let lapsed = 0;
        let reversals = 0;

        ledgerEntries.forEach(entry => {
            const amount = parseFloat(entry.amount);

            switch (entry.transaction_type) {
                case 'credit':
                case 'adjustment_credit':
                    total_credited += amount;
                    break;

                case 'debit':
                case 'adjustment_debit':
                    total_debited += Math.abs(amount);
                    break;

                case 'carry_forward':
                    carried_forward += amount;
                    break;

                case 'encashment':
                    encashed += Math.abs(amount);
                    break;

                case 'lapse':
                    lapsed += Math.abs(amount);
                    break;

                case 'penalty':
                    total_debited += Math.abs(amount);
                    break;

                case 'reversal':
                    reversals += amount;
                    total_debited -= amount; // Reduce from debited
                    break;
            }
        });

        // Get current balance from latest entry
        const latestEntry = ledgerEntries[ledgerEntries.length - 1];
        const available_balance = latestEntry?.balance_after_transaction || 0;

        return {
            available_balance: parseFloat(available_balance),
            carried_forward: parseFloat(carried_forward),
            total_credited: parseFloat(total_credited),
            total_debited: parseFloat(total_debited),
            encashed: parseFloat(encashed),
            lapsed: parseFloat(lapsed),
            reversals: parseFloat(reversals),
            transaction_count: ledgerEntries.length
        };
    } catch (error) {
        console.error('Error getting detailed balance breakdown:', error.message);
        throw error;
    }
};

/**
 * Get saved leave balance from HrmsEmployeeLeaveBalance table
 * @param {number} employee_id - Employee ID
 * @param {number} leave_cycle_year - Leave cycle year (optional)
 * @param {number} year - Year (optional)
 * @param {number} month - Month (optional)
 * @returns {Array} Saved leave balances
 */
const getSavedLeaveBalance = async (employee_id, leave_cycle_year = null, year = null, month = null) => {
    try {
        const whereClause = { employee_id };

        if (leave_cycle_year) {
            whereClause.leave_cycle_year = leave_cycle_year;
        }

        if (year) {
            whereClause.year = year;
        } else {
            whereClause.year = new Date().getFullYear();
        }

        if (month) {
            whereClause.month = month;
        } else {
            whereClause.month = new Date().getMonth() + 1;
        }

        const balances = await HrmsEmployeeLeaveBalance.findAll({
            where: whereClause,
            attributes: [
                'id',
                'employee_id',
                'leave_type_id',
                'leave_cycle_year',
                'month',
                'year',
                'available_balance',
                'opening_balance',
                'total_credited',
                'total_debited',
                'carried_forward',
                'encashed',
                'lapsed',
                'last_transaction_id',
                'last_updated_date',
                [sequelize.literal('`leaveType`.`leave_code`'), 'leave_code'],
                [sequelize.literal('`leaveType`.`leave_name`'), 'leave_name'],
                [sequelize.literal('`leaveType`.`leave_type`'), 'leave_type']
            ],
            include: [{
                model: HrmsLeaveMaster,
                as: 'leaveType',
                attributes: []
            }],
            order: [['leave_type_id', 'ASC']],
            raw: true
        });

        return balances;
    } catch (error) {
        console.error('Error fetching saved leave balance:', error.message);
        throw error;
    }
};

module.exports = {
    getEmployeeLeaveBalance,
    creditLeaves,
    debitLeaves,
    reverseLeaveTransaction,
    getEmployeeLeaveLedger,
    getDetailedBalanceBreakdown,
    getSavedLeaveBalance
};
