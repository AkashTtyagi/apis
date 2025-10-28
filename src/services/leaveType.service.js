/**
 * Leave Type Service
 * Handles leave type operations with audit logging
 */

const { HrmsLeaveMaster } = require('../models/HrmsLeaveMaster');
const { HrmsLeaveTypeAuditLog } = require('../models/HrmsLeaveTypeAuditLog');
const { sequelize } = require('../utils/database');

/**
 * Log field changes for audit
 */
const logFieldChanges = async (leave_type_id, company_id, oldData, newData, user_id, action, ipAddress = null, userAgent = null, transaction = null) => {
    const changes = [];

    // For create action, log all fields
    if (action === 'create') {
        changes.push({
            leave_type_id,
            company_id,
            action: 'create',
            field_name: null,
            old_value: null,
            new_value: JSON.stringify(newData),
            changed_by: user_id,
            ip_address: ipAddress,
            user_agent: userAgent,
            change_summary: `Leave type '${newData.leave_name}' created`
        });
    }
    // For update action, log only changed fields
    else if (action === 'update' && oldData) {
        const excludeFields = ['updated_at', 'created_at', 'deleted_at', 'id'];

        for (const key in newData) {
            if (excludeFields.includes(key)) continue;
            if (newData[key] === undefined) continue;

            const oldValue = oldData[key];
            const newValue = newData[key];

            // Check if value actually changed
            if (oldValue != newValue) {
                changes.push({
                    leave_type_id,
                    company_id,
                    action: 'update',
                    field_name: key,
                    old_value: oldValue !== null ? String(oldValue) : null,
                    new_value: newValue !== null ? String(newValue) : null,
                    changed_by: user_id,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    change_summary: `Field '${key}' updated`
                });
            }
        }
    }
    // For delete action
    else if (action === 'delete') {
        changes.push({
            leave_type_id,
            company_id,
            action: 'delete',
            field_name: null,
            old_value: JSON.stringify(oldData),
            new_value: null,
            changed_by: user_id,
            ip_address: ipAddress,
            user_agent: userAgent,
            change_summary: `Leave type '${oldData.leave_name}' deleted`
        });
    }

    // Bulk insert audit logs
    if (changes.length > 0) {
        await HrmsLeaveTypeAuditLog.bulkCreate(changes, { transaction });
    }

    return changes.length;
};

/**
 * Create leave type
 *
 * @param {Object} leaveTypeData - Leave type data
 * @returns {Object} Created leave type
 */
const createLeaveType = async (leaveTypeData) => {
    const { company_id, user_id, ip_address, user_agent, ...leaveData } = leaveTypeData;

    // Check if leave code already exists for this company (before transaction)
    const existingLeaveType = await HrmsLeaveMaster.findOne({
        where: {
            company_id,
            leave_code: leaveData.leave_code
        },
        paranoid: false // Include soft-deleted records
    });

    if (existingLeaveType) {
        throw new Error(`Leave type with code '${leaveData.leave_code}' already exists for this company`);
    }

    const transaction = await sequelize.transaction();

    try {

        // Create leave type
        const leaveType = await HrmsLeaveMaster.create({
            ...leaveData,
            company_id,
            is_active: leaveData.is_active !== undefined ? leaveData.is_active : true,
            created_by: user_id || null
        }, { transaction });

        // Log creation
        await logFieldChanges(
            leaveType.id,
            company_id,
            null,
            leaveType.toJSON(),
            user_id,
            'create',
            ip_address,
            user_agent,
            transaction
        );

        await transaction.commit();

        return leaveType;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update leave type
 *
 * @param {number} leave_type_id - Leave type ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated leave type
 */
const updateLeaveType = async (leave_type_id, updateData) => {
    const { user_id, company_id, ip_address, user_agent, ...updateFields } = updateData;

    const transaction = await sequelize.transaction();

    try {
        // Get old data
        const oldLeaveType = await HrmsLeaveMaster.findOne({
            where: {
                id: leave_type_id,
                company_id: company_id
            },
            raw: true
        });

        if (!oldLeaveType) {
            throw new Error('Leave type not found');
        }

        // Update leave type
        const [updatedRows] = await HrmsLeaveMaster.update(
            {
                ...updateFields,
                updated_by: user_id || null
            },
            {
                where: {
                    id: leave_type_id,
                    company_id: company_id
                },
                transaction
            }
        );

        if (updatedRows === 0) {
            throw new Error('No changes made to leave type');
        }

        // Log changes
        await logFieldChanges(
            leave_type_id,
            company_id,
            oldLeaveType,
            updateFields,
            user_id,
            'update',
            ip_address,
            user_agent,
            transaction
        );

        await transaction.commit();

        // Fetch updated leave type
        const updatedLeaveType = await HrmsLeaveMaster.findByPk(leave_type_id);

        return { leaveType: updatedLeaveType, updatedRows };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get all leave types for a company
 *
 * @param {number} company_id - Company ID
 * @param {boolean} is_active - Filter by active status
 * @returns {Array} List of leave types
 */
const getLeaveTypes = async (company_id, is_active = null) => {
    const whereClause = { company_id };

    if (is_active !== null && is_active !== undefined) {
        whereClause.is_active = is_active === 'true' || is_active === true;
    }

    const leaveTypes = await HrmsLeaveMaster.findAll({
        where: whereClause,
        order: [['leave_name', 'ASC']]
    });

    return leaveTypes;
};

/**
 * Get single leave type by ID
 *
 * @param {number} leave_type_id - Leave type ID
 * @param {number} company_id - Company ID
 * @returns {Object} Leave type
 */
const getLeaveTypeById = async (leave_type_id, company_id) => {
    const leaveType = await HrmsLeaveMaster.findOne({
        where: {
            id: leave_type_id,
            company_id: company_id
        }
    });

    if (!leaveType) {
        throw new Error('Leave type not found');
    }

    return leaveType;
};

/**
 * Delete leave type (soft delete)
 *
 * @param {number} leave_type_id - Leave type ID
 * @param {number} company_id - Company ID
 * @param {number} user_id - User ID
 * @param {string} ip_address - IP address
 * @param {string} user_agent - User agent
 * @returns {boolean} Success
 */
const deleteLeaveType = async (leave_type_id, company_id, user_id, ip_address = null, user_agent = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Get leave type before delete
        const leaveType = await HrmsLeaveMaster.findOne({
            where: {
                id: leave_type_id,
                company_id: company_id
            },
            raw: true
        });

        if (!leaveType) {
            throw new Error('Leave type not found');
        }

        // Soft delete
        await HrmsLeaveMaster.destroy({
            where: {
                id: leave_type_id,
                company_id: company_id
            },
            transaction
        });

        // Log deletion
        await logFieldChanges(
            leave_type_id,
            company_id,
            leaveType,
            null,
            user_id,
            'delete',
            ip_address,
            user_agent,
            transaction
        );

        await transaction.commit();

        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get audit logs for a leave type
 *
 * @param {number} leave_type_id - Leave type ID
 * @param {number} company_id - Company ID
 * @returns {Array} Audit logs
 */
const getLeaveTypeAuditLogs = async (leave_type_id, company_id) => {
    const auditLogs = await HrmsLeaveTypeAuditLog.findAll({
        where: {
            leave_type_id,
            company_id
        },
        order: [['created_at', 'DESC']]
    });

    return auditLogs;
};

module.exports = {
    createLeaveType,
    updateLeaveType,
    getLeaveTypes,
    getLeaveTypeById,
    deleteLeaveType,
    getLeaveTypeAuditLogs
};
