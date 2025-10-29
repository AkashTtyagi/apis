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
            }
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
                await HrmsLeavePolicyMapping.update(
                    {
                        display_order: leave_type_ids.indexOf(leave_type_id) + 1,
                        is_active: true,
                        deleted_at: null // Restore if soft deleted
                    },
                    {
                        where: { id: mapping.id },
                        paranoid: false,
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

module.exports = {
    createLeavePolicy,
    updateLeavePolicy,
    toggleLeaveTypeInPolicy,
    getLeavePolicies,
    getPolicyById,
    deleteLeavePolicy
};
