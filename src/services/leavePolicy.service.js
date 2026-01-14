/**
 * Leave Policy Service
 * Handles leave policy operations with soft delete support for mappings
 */

const { HrmsLeavePolicyMaster } = require('../models/HrmsLeavePolicyMaster');
const { HrmsLeavePolicyMapping } = require('../models/HrmsLeavePolicyMapping');
const { HrmsLeaveMaster } = require('../models/HrmsLeaveMaster');
const { sequelize } = require('../utils/database');

/**
 * Create leave policy
 *
 * @param {Object} policyData - Policy data
 * @returns {Object} Created policy with mappings
 */
const createLeavePolicy = async (policyData) => {
    const { company_id, policy_name, policy_description, leave_type_ids, user_id } = policyData;

    const transaction = await sequelize.transaction();

    try {
        // Check if policy name already exists for this company
        const existingPolicy = await HrmsLeavePolicyMaster.findOne({
            where: {
                company_id,
                policy_name
            }
        });

        if (existingPolicy) {
            throw new Error(`Leave policy with name '${policy_name}' already exists for this company`);
        }

        // Create policy
        const policy = await HrmsLeavePolicyMaster.create({
            company_id,
            policy_name,
            policy_description: policy_description || null,
            is_active: true,
            created_by: user_id || null
        }, { transaction });

        // Create policy mappings if leave_type_ids provided
        if (leave_type_ids && Array.isArray(leave_type_ids) && leave_type_ids.length > 0) {
            const mappings = leave_type_ids.map((leave_type_id, index) => ({
                policy_id: policy.id,
                leave_type_id,
                display_order: index + 1,
                is_active: true
            }));

            await HrmsLeavePolicyMapping.bulkCreate(mappings, { transaction });
        }

        await transaction.commit();

        // Fetch complete policy with leave types
        const completePolicy = await getPolicyById(policy.id, company_id);

        return completePolicy;
    } catch (error) {
        await transaction.rollback();

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`Leave policy with name '${policy_name}' already exists for this company`);
        }

        throw error;
    }
};

/**
 * Update leave policy
 *
 * @param {number} policy_id - Policy ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated policy
 */
const updateLeavePolicy = async (policy_id, updateData) => {
    const { company_id, policy_name, policy_description, is_active, leave_type_ids, user_id } = updateData;

    const transaction = await sequelize.transaction();

    try {
        // Check if policy exists
        const existingPolicy = await HrmsLeavePolicyMaster.findOne({
            where: {
                id: policy_id,
                company_id
            },
            raw:true
        });

        if (!existingPolicy) {
            throw new Error('Policy not found');
        }

        // Update policy
        await HrmsLeavePolicyMaster.update(
            {
                ...(policy_name !== undefined && { policy_name }),
                ...(policy_description !== undefined && { policy_description }),
                ...(is_active !== undefined && { is_active }),
                updated_by: user_id || null
            },
            {
                where: {
                    id: policy_id,
                    company_id
                },
                transaction
            }
        );

        // Update policy mappings if leave_type_ids provided
        if (leave_type_ids && Array.isArray(leave_type_ids)) {
            // Get existing mappings (including soft deleted)
            const existingMappings = await HrmsLeavePolicyMapping.findAll({
                where: { policy_id },
                paranoid: false, // Include soft deleted
                raw: true,
                transaction
            });

            const existingLeaveTypeIds = existingMappings.map(m => m.leave_type_id);

            // Determine which to add, keep, or remove
            const toAdd = leave_type_ids.filter(id => !existingLeaveTypeIds.includes(id));
            const toKeep = leave_type_ids.filter(id => existingLeaveTypeIds.includes(id));
            const toRemove = existingLeaveTypeIds.filter(id => !leave_type_ids.includes(id));

            // Add new mappings
            if (toAdd.length > 0) {
                const newMappings = toAdd.map((leave_type_id, index) => ({
                    policy_id,
                    leave_type_id,
                    display_order: leave_type_ids.indexOf(leave_type_id) + 1,
                    is_active: true
                }));
                await HrmsLeavePolicyMapping.bulkCreate(newMappings, { transaction });
            }

            // Update display order for existing mappings and restore if deleted
            for (const leave_type_id of toKeep) {
                const mapping = existingMappings.find(m => m.leave_type_id === leave_type_id);

                // If mapping was soft-deleted, restore it first
                // if (mapping.deleted_at) {
                //     await HrmsLeavePolicyMapping.restore({
                //         where: { id: mapping.id },
                //         transaction
                //     });
                // }

                // Update display order and is_active
                await HrmsLeavePolicyMapping.update(
                    {
                        display_order: leave_type_ids.indexOf(leave_type_id) + 1,
                        is_active: true
                    },
                    {
                        where: { id: mapping.id },
                        transaction
                    }
                );
            }

            // Soft delete removed mappings (maintains history)
            if (toRemove.length > 0) {
                await HrmsLeavePolicyMapping.destroy({
                    where: {
                        policy_id,
                        leave_type_id: toRemove
                    },
                    transaction
                });
            }
        }

        await transaction.commit();

        // Fetch complete updated policy
        const updatedPolicy = await getPolicyById(policy_id, company_id);

        return updatedPolicy;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Toggle leave type active status in policy (without deleting)
 *
 * @param {number} policy_id - Policy ID
 * @param {number} leave_type_id - Leave type ID
 * @param {boolean} is_active - Active status
 * @param {number} company_id - Company ID
 * @returns {Object} Updated mapping
 */
const toggleLeaveTypeInPolicy = async (policy_id, leave_type_id, is_active, company_id) => {
    const transaction = await sequelize.transaction();

    try {
        // Verify policy belongs to company
        const policy = await HrmsLeavePolicyMaster.findOne({
            where: { id: policy_id, company_id }
        });

        if (!policy) {
            throw new Error('Policy not found');
        }

        // Update mapping
        const [updatedRows] = await HrmsLeavePolicyMapping.update(
            { is_active },
            {
                where: {
                    policy_id,
                    leave_type_id
                },
                transaction
            }
        );

        if (updatedRows === 0) {
            throw new Error('Leave type not found in this policy');
        }

        await transaction.commit();

        return { success: true, updatedRows };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all leave policies for a company
 *
 * @param {number} company_id - Company ID
 * @param {boolean} is_active - Filter by active status
 * @param {boolean} includeInactiveLeaveTypes - Include inactive leave types in policy
 * @returns {Array} List of policies
 */
const getLeavePolicies = async (company_id, is_active = null, includeInactiveLeaveTypes = false) => {
    const whereClause = { company_id };

    if (is_active !== null && is_active !== undefined) {
        whereClause.is_active = is_active === 'true' || is_active === true;
    }

    const mappingWhere = includeInactiveLeaveTypes ? {} : { is_active: true };

    const policies = await HrmsLeavePolicyMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsLeavePolicyMapping,
                as: 'policyMappings',
                where: mappingWhere,
                required: false,
                include: [
                    {
                        model: HrmsLeaveMaster,
                        as: 'leaveType',
                        attributes: ['id', 'leave_code', 'leave_name', 'leave_type', 'is_active']
                    }
                ]
            }
        ],
        order: [
            ['policy_name', 'ASC'],
            [{ model: HrmsLeavePolicyMapping, as: 'policyMappings' }, 'display_order', 'ASC']
        ]
    });

    return policies;
};

/**
 * Get single leave policy by ID
 *
 * @param {number} policy_id - Policy ID
 * @param {number} company_id - Company ID
 * @param {boolean} includeInactiveLeaveTypes - Include inactive leave types
 * @returns {Object} Policy with leave types
 */
const getPolicyById = async (policy_id, company_id, includeInactiveLeaveTypes = false) => {
    const mappingWhere = includeInactiveLeaveTypes ? {} : { is_active: true };

    const policy = await HrmsLeavePolicyMaster.findOne({
        where: {
            id: policy_id,
            company_id
        },
        include: [
            {
                model: HrmsLeavePolicyMapping,
                as: 'policyMappings',
                where: mappingWhere,
                required: false,
                include: [
                    {
                        model: HrmsLeaveMaster,
                        as: 'leaveType'
                    }
                ]
            }
        ],
        order: [
            [{ model: HrmsLeavePolicyMapping, as: 'policyMappings' }, 'display_order', 'ASC']
        ]
    });

    if (!policy) {
        throw new Error('Policy not found');
    }

    return policy;
};

/**
 * Delete leave policy (soft delete)
 *
 * @param {number} policy_id - Policy ID
 * @param {number} company_id - Company ID
 * @returns {boolean} Success
 */
const deleteLeavePolicy = async (policy_id, company_id) => {
    const transaction = await sequelize.transaction();

    try {
        // Check if policy exists
        const policy = await HrmsLeavePolicyMaster.findOne({
            where: {
                id: policy_id,
                company_id
            }
        });

        if (!policy) {
            throw new Error('Policy not found');
        }

        // Soft delete policy mappings
        await HrmsLeavePolicyMapping.destroy({
            where: { policy_id },
            transaction
        });

        // Soft delete policy
        await HrmsLeavePolicyMaster.destroy({
            where: {
                id: policy_id,
                company_id
            },
            transaction
        });

        await transaction.commit();

        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Assign leave policy to employees
 * Updates employee records and initializes leave balances
 *
 * @param {number} policy_id - Leave policy ID
 * @param {Array} employee_ids - Array of employee IDs
 * @param {number} company_id - Company ID
 * @param {boolean} initialize_balance - Whether to initialize leave balance (default: true)
 * @param {number} user_id - User performing the action
 * @returns {Object} Assignment result
 */
const assignLeavePolicyToEmployees = async (policy_id, employee_ids, company_id, initialize_balance = true, user_id = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Validate policy exists and belongs to company
        const policy = await HrmsLeavePolicyMaster.findOne({
            where: { id: policy_id, company_id },
            include: [{
                model: HrmsLeavePolicyMapping,
                as: 'policyMappings',
                where: { is_active: true },
                required: false,
                include: [{
                    model: HrmsLeaveMaster,
                    as: 'leaveType',
                    where: { is_active: true },
                    required: true
                }]
            }]
        });

        if (!policy) {
            throw new Error('Leave policy not found');
        }

        // Import models here to avoid circular dependency
        const { HrmsEmployee } = require('../models/HrmsEmployee');
        const { HrmsLeaveLedger } = require('../models/HrmsLeaveLedger');
        const { Op } = require('sequelize');

        // Validate employees exist and belong to company
        const employees = await HrmsEmployee.findAll({
            where: {
                id: { [Op.in]: employee_ids },
                company_id,
                status: { [Op.in]: [0, 1, 2] } // Active, Probation, Internship
            },
            attributes: ['id', 'employee_code', 'first_name', 'last_name', 'status', 'leave_policy_id'],
            raw: true,
            transaction
        });

        if (employees.length === 0) {
            throw new Error('No valid employees found');
        }

        const validEmployeeIds = employees.map(e => e.id);
        const invalidEmployeeIds = employee_ids.filter(id => !validEmployeeIds.includes(id));

        // Update employees with leave policy
        await HrmsEmployee.update(
            { leave_policy_id: policy_id },
            {
                where: { id: { [Op.in]: validEmployeeIds } },
                transaction
            }
        );

        // Initialize leave balances if requested
        let balanceResults = [];
        if (initialize_balance && policy.policyMappings && policy.policyMappings.length > 0) {
            const currentYear = new Date().getFullYear();
            const currentDate = new Date();

            for (const employee of employees) {
                for (const mapping of policy.policyMappings) {
                    const leaveType = mapping.leaveType;

                    // Check if balance already exists for this employee and leave type
                    const existingLedger = await HrmsLeaveLedger.findOne({
                        where: {
                            employee_id: employee.id,
                            leave_type_id: leaveType.id,
                            leave_cycle_year: currentYear
                        },
                        transaction
                    });

                    // Skip if balance already exists
                    if (existingLedger) {
                        continue;
                    }

                    // Determine credit amount based on employee status
                    let creditAmount = parseFloat(leaveType.number_of_leaves_to_credit) || 0;

                    switch (employee.status) {
                        case 0: // Active
                            if (leaveType.active_leaves_to_credit !== null) {
                                creditAmount = parseFloat(leaveType.active_leaves_to_credit);
                            }
                            break;
                        case 1: // Probation
                            if (leaveType.probation_leaves_to_credit !== null) {
                                creditAmount = parseFloat(leaveType.probation_leaves_to_credit);
                            }
                            break;
                        case 2: // Internship
                            if (leaveType.intern_leaves_to_credit !== null) {
                                creditAmount = parseFloat(leaveType.intern_leaves_to_credit);
                            }
                            break;
                    }

                    // Create initial ledger entry
                    if (creditAmount > 0) {
                        await HrmsLeaveLedger.create({
                            employee_id: employee.id,
                            leave_type_id: leaveType.id,
                            leave_cycle_year: currentYear,
                            transaction_type: 'credit',
                            amount: creditAmount,
                            balance_after_transaction: creditAmount,
                            transaction_date: currentDate,
                            reference_type: 'policy_assignment',
                            reference_id: policy_id,
                            remarks: `Initial balance on policy assignment: ${policy.policy_name}`,
                            created_by: user_id
                        }, { transaction });

                        balanceResults.push({
                            employee_id: employee.id,
                            leave_type_id: leaveType.id,
                            leave_code: leaveType.leave_code,
                            credited: creditAmount
                        });
                    }
                }
            }
        }

        await transaction.commit();

        return {
            success: true,
            policy_id,
            policy_name: policy.policy_name,
            assigned_count: validEmployeeIds.length,
            assigned_employees: validEmployeeIds,
            invalid_employees: invalidEmployeeIds,
            balance_initialized: initialize_balance,
            balance_credits: balanceResults
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Remove leave policy from employees
 *
 * @param {Array} employee_ids - Array of employee IDs
 * @param {number} company_id - Company ID
 * @returns {Object} Removal result
 */
const removeLeavePolicyFromEmployees = async (employee_ids, company_id) => {
    const transaction = await sequelize.transaction();

    try {
        const { HrmsEmployee } = require('../models/HrmsEmployee');
        const { Op } = require('sequelize');

        const [updatedCount] = await HrmsEmployee.update(
            { leave_policy_id: null },
            {
                where: {
                    id: { [Op.in]: employee_ids },
                    company_id
                },
                transaction
            }
        );

        await transaction.commit();

        return {
            success: true,
            removed_count: updatedCount
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get employees by leave policy
 *
 * @param {number} policy_id - Leave policy ID
 * @param {number} company_id - Company ID
 * @returns {Array} Employees with the policy
 */
const getEmployeesByPolicy = async (policy_id, company_id) => {
    const { HrmsEmployee } = require('../models/HrmsEmployee');
    const { Op } = require('sequelize');

    const employees = await HrmsEmployee.findAll({
        where: {
            leave_policy_id: policy_id,
            company_id,
            status: { [Op.in]: [0, 1, 2] }
        },
        attributes: ['id', 'employee_code', 'first_name', 'last_name', 'email', 'department_id', 'designation_id', 'status'],
        order: [['first_name', 'ASC']]
    });

    return employees;
};

module.exports = {
    createLeavePolicy,
    updateLeavePolicy,
    toggleLeaveTypeInPolicy,
    getLeavePolicies,
    getPolicyById,
    deleteLeavePolicy,
    assignLeavePolicyToEmployees,
    removeLeavePolicyFromEmployees,
    getEmployeesByPolicy
};
