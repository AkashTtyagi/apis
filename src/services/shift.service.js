/**
 * Shift Management Service
 * Handles all business logic for shift configuration
 * Includes: CRUD operations, validations, time conversions, and audit logging
 */

const { HrmsShiftMaster } = require('../models/HrmsShiftMaster');
const { HrmsShiftBreakRules } = require('../models/HrmsShiftBreakRules');
const { HrmsShiftWeeklyOff } = require('../models/HrmsShiftWeeklyOff');
const { HrmsShiftAuditLog } = require('../models/HrmsShiftAuditLog');
const { HrmsEmployee } = require('../models/HrmsEmployee');
const { sequelize } = require('../utils/database');

/**
 * Helper: Convert TIME string to minutes
 * @param {string} timeString - Time in HH:MM or HH:MM:SS format
 * @returns {number} Minutes
 */
const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return (hours * 60) + minutes;
};

/**
 * Helper: Convert minutes to TIME string
 * @param {number} minutes - Minutes
 * @returns {string} Time in HH:MM:SS format
 */
const minutesToTime = (minutes) => {
    if (!minutes && minutes !== 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};

/**
 * Helper: Format shift data for API response (convert minutes to TIME)
 * @param {Object} shift - Shift record
 * @returns {Object} Formatted shift
 */
const formatShiftForResponse = (shift) => {
    if (!shift) return null;

    const formatted = { ...shift };

    // Convert duration minutes to TIME format for client
    if (formatted.first_half_duration_minutes !== undefined) {
        formatted.first_half_duration = minutesToTime(formatted.first_half_duration_minutes);
    }
    if (formatted.second_half_duration_minutes !== undefined) {
        formatted.second_half_duration = minutesToTime(formatted.second_half_duration_minutes);
    }
    if (formatted.total_shift_duration_minutes !== undefined) {
        formatted.total_shift_duration = minutesToTime(formatted.total_shift_duration_minutes);
    }

    // Convert other minute fields
    if (formatted.checkin_allowed_before_minutes !== undefined) {
        formatted.checkin_allowed_before = minutesToTime(formatted.checkin_allowed_before_minutes);
    }
    if (formatted.grace_time_late_minutes !== undefined) {
        formatted.grace_time_late = minutesToTime(formatted.grace_time_late_minutes);
    }
    if (formatted.grace_time_early_minutes !== undefined) {
        formatted.grace_time_early = minutesToTime(formatted.grace_time_early_minutes);
    }
    if (formatted.min_minutes_half_day !== undefined) {
        formatted.min_hours_half_day = minutesToTime(formatted.min_minutes_half_day);
    }
    if (formatted.min_minutes_full_day !== undefined) {
        formatted.min_hours_full_day = minutesToTime(formatted.min_minutes_full_day);
    }
    if (formatted.absent_half_day_after_minutes !== undefined && formatted.absent_half_day_after_minutes !== null) {
        formatted.absent_half_day_after = minutesToTime(formatted.absent_half_day_after_minutes);
    }
    if (formatted.absent_full_day_after_minutes !== undefined && formatted.absent_full_day_after_minutes !== null) {
        formatted.absent_full_day_after = minutesToTime(formatted.absent_full_day_after_minutes);
    }
    if (formatted.absent_second_half_before_minutes !== undefined && formatted.absent_second_half_before_minutes !== null) {
        formatted.absent_second_half_before = minutesToTime(formatted.absent_second_half_before_minutes);
    }
    if (formatted.work_cutoff_after_minutes !== undefined && formatted.work_cutoff_after_minutes !== null) {
        formatted.work_cutoff_after = minutesToTime(formatted.work_cutoff_after_minutes);
    }

    return formatted;
};

/**
 * Helper: Log audit trail
 * @param {number} shiftId - Shift ID
 * @param {string} actionType - Action type
 * @param {number} userId - User ID who made the change
 * @param {Object} oldValues - Old values
 * @param {Object} newValues - New values
 * @param {string} description - Change description
 * @param {string} ipAddress - IP address
 * @param {Object} transaction - Sequelize transaction
 */
const logAuditTrail = async (shiftId, actionType, userId, oldValues = null, newValues = null, description = null, ipAddress = null, transaction = null) => {
    try {
        await HrmsShiftAuditLog.create({
            shift_id: shiftId,
            action_type: actionType,
            changed_by: userId,
            old_values: oldValues,
            new_values: newValues,
            change_description: description,
            ip_address: ipAddress
        }, { transaction });
    } catch (error) {
        console.error('Error logging audit trail:', error.message);
        // Don't throw - audit logging failure shouldn't break the main operation
    }
};

/**
 * Create a new shift
 * @param {Object} shiftData - Shift configuration data
 * @param {number} userId - User ID creating the shift
 * @param {string} ipAddress - IP address
 * @returns {Object} Created shift
 */
const createShift = async (shiftData, userId, ipAddress = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Check if shift with same name already exists in the company
        const existingShift = await HrmsShiftMaster.findOne({
            where: {
                company_id: shiftData.company_id,
                shift_name: shiftData.shift_name,
                is_active: 1
            }
        });

        if (existingShift) {
            throw new Error(`Shift with name "${shiftData.shift_name}" already exists in this company`);
        }

        // Convert TIME strings to minutes for storage
        const shiftToCreate = { ...shiftData };

        if (shiftData.first_half_duration) {
            shiftToCreate.first_half_duration_minutes = timeToMinutes(shiftData.first_half_duration);
            delete shiftToCreate.first_half_duration;
        }
        if (shiftData.second_half_duration) {
            shiftToCreate.second_half_duration_minutes = timeToMinutes(shiftData.second_half_duration);
            delete shiftToCreate.second_half_duration;
        }

        // Set created_by
        shiftToCreate.created_by = userId;

        // Create shift master
        const shift = await HrmsShiftMaster.create(shiftToCreate, { transaction });

        // Create break rules if provided
        if (shiftData.breaks && Array.isArray(shiftData.breaks) && shiftData.breaks.length > 0) {
            const breaksToCreate = shiftData.breaks.map((breakRule, index) => ({
                shift_id: shift.id,
                break_name: breakRule.break_name,
                break_start_after_minutes: breakRule.break_start_after_minutes || 0,
                break_duration_minutes: breakRule.break_duration_minutes || 30,
                break_order: breakRule.break_order || (index + 1),
                is_paid: breakRule.is_paid !== undefined ? breakRule.is_paid : 1,
                is_mandatory: breakRule.is_mandatory !== undefined ? breakRule.is_mandatory : 1,
                is_active: 1
            }));

            await HrmsShiftBreakRules.bulkCreate(breaksToCreate, { transaction });
        }

        // Create weekly off configuration if provided
        if (shiftData.weekly_off && Array.isArray(shiftData.weekly_off) && shiftData.weekly_off.length > 0) {
            const weeklyOffToCreate = shiftData.weekly_off.map(config => ({
                shift_id: shift.id,
                week_number: config.week_number,
                day_of_week: config.day_of_week,
                off_type: config.off_type || 'working',
                is_active: 1
            }));

            await HrmsShiftWeeklyOff.bulkCreate(weeklyOffToCreate, { transaction });
        }

        // Log audit trail (pass transaction to avoid lock timeout)
        await logAuditTrail(
            shift.id,
            'created',
            userId,
            null,
            shift.toJSON(),
            `Shift created: ${shift.shift_name}`,
            ipAddress,
            transaction
        );

        await transaction.commit();

        // Fetch complete shift with associations
        return await getShiftById(shift.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get shift by ID with all associations
 * @param {number} shiftId - Shift ID
 * @returns {Object} Shift details
 */
const getShiftById = async (shiftId) => {
    const shift = await HrmsShiftMaster.findOne({
        where: { id: shiftId },
        include: [
            {
                model: HrmsShiftBreakRules,
                as: 'breakRules',
                where: { is_active: 1 },
                required: false,
                order: [['break_order', 'ASC']]
            },
            {
                model: HrmsShiftWeeklyOff,
                as: 'weeklyOffConfig',
                where: { is_active: 1 },
                required: false,
                order: [['week_number', 'ASC'], ['day_of_week', 'ASC']]
            }
        ]
    });

    if (!shift) {
        throw new Error('Shift not found');
    }

    // Format for response
    const formatted = formatShiftForResponse(shift.toJSON());
    return formatted;
};

/**
 * Get all shifts for a company
 * @param {number} companyId - Company ID
 * @param {Object} filters - Additional filters (is_active, is_night_shift, etc.)
 * @param {Object} pagination - Pagination options
 * @returns {Object} List of shifts with pagination
 */
const getAllShifts = async (companyId, filters = {}, pagination = {}) => {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const whereClause = { company_id: companyId };

    // Apply filters
    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }
    if (filters.is_night_shift !== undefined) {
        whereClause.is_night_shift = filters.is_night_shift;
    }
    if (filters.has_shift_allowance !== undefined) {
        whereClause.has_shift_allowance = filters.has_shift_allowance;
    }
    if (filters.shift_code) {
        whereClause.shift_code = filters.shift_code;
    }

    const { count, rows } = await HrmsShiftMaster.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: HrmsShiftBreakRules,
                as: 'breakRules',
                where: { is_active: 1 },
                required: false
            },
            {
                model: HrmsShiftWeeklyOff,
                as: 'weeklyOffConfig',
                where: { is_active: 1 },
                required: false
            }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
        distinct: true
    });

    return {
        shifts: rows.map(shift => formatShiftForResponse(shift.toJSON())),
        pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(count / limit)
        }
    };
};

/**
 * Update shift
 * @param {number} shiftId - Shift ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID making the update
 * @param {number} companyId - Company ID (for validation)
 * @param {string} ipAddress - IP address
 * @returns {Object} Updated shift
 */
const updateShift = async (shiftId, updateData, userId, companyId, ipAddress = null) => {
    const transaction = await sequelize.transaction();

    try {
        // Get existing shift for audit and validate company ownership
        const existingShift = await HrmsShiftMaster.findOne({
            where: {
                id: shiftId,
                company_id: companyId
            }
        });

        if (!existingShift) {
            throw new Error('Shift not found or you do not have permission to update this shift');
        }

        const oldValues = existingShift.toJSON();

        // Convert TIME strings to minutes
        const dataToUpdate = { ...updateData };

        if (updateData.first_half_duration) {
            dataToUpdate.first_half_duration_minutes = timeToMinutes(updateData.first_half_duration);
            delete dataToUpdate.first_half_duration;
        }
        if (updateData.second_half_duration) {
            dataToUpdate.second_half_duration_minutes = timeToMinutes(updateData.second_half_duration);
            delete dataToUpdate.second_half_duration;
        }

        // Set updated_by
        dataToUpdate.updated_by = userId;

        // Update shift master (with company_id validation)
        await HrmsShiftMaster.update(dataToUpdate, {
            where: {
                id: shiftId,
                company_id: companyId
            },
            transaction
        });

        // Update break rules if provided
        if (updateData.breaks) {
            // Delete existing breaks
            await HrmsShiftBreakRules.destroy({
                where: { shift_id: shiftId },
                transaction
            });

            // Create new breaks
            if (Array.isArray(updateData.breaks) && updateData.breaks.length > 0) {
                const breaksToCreate = updateData.breaks.map((breakRule, index) => ({
                    shift_id: shiftId,
                    break_name: breakRule.break_name,
                    break_start_after_minutes: breakRule.break_start_after_minutes || 0,
                    break_duration_minutes: breakRule.break_duration_minutes || 30,
                    break_order: breakRule.break_order || (index + 1),
                    is_paid: breakRule.is_paid !== undefined ? breakRule.is_paid : 1,
                    is_mandatory: breakRule.is_mandatory !== undefined ? breakRule.is_mandatory : 1,
                    is_active: 1
                }));

                await HrmsShiftBreakRules.bulkCreate(breaksToCreate, { transaction });
            }
        }

        // Update weekly off if provided
        if (updateData.weekly_off) {
            // Delete existing weekly off config
            await HrmsShiftWeeklyOff.destroy({
                where: { shift_id: shiftId },
                transaction
            });

            // Create new weekly off config
            if (Array.isArray(updateData.weekly_off) && updateData.weekly_off.length > 0) {
                const weeklyOffToCreate = updateData.weekly_off.map(config => ({
                    shift_id: shiftId,
                    week_number: config.week_number,
                    day_of_week: config.day_of_week,
                    off_type: config.off_type || 'working',
                    is_active: 1
                }));

                await HrmsShiftWeeklyOff.bulkCreate(weeklyOffToCreate, { transaction });
            }
        }

        // Get updated shift
        const updatedShift = await HrmsShiftMaster.findByPk(shiftId);

        // Log audit trail (pass transaction to avoid lock timeout)
        await logAuditTrail(
            shiftId,
            'updated',
            userId,
            oldValues,
            updatedShift.toJSON(),
            `Shift updated: ${updatedShift.shift_name}`,
            ipAddress,
            transaction
        );

        await transaction.commit();

        // Return complete shift with associations
        return await getShiftById(shiftId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete shift (soft delete)
 * @param {number} shiftId - Shift ID
 * @param {number} userId - User ID performing the deletion
 * @param {string} ipAddress - IP address
 */
const deleteShift = async (shiftId, userId, ipAddress = null) => {
    const transaction = await sequelize.transaction();

    try {
        const shift = await HrmsShiftMaster.findByPk(shiftId);
        if (!shift) {
            throw new Error('Shift not found');
        }

        // Check if any employees are assigned to this shift
        const employeeCount = await HrmsEmployee.count({
            where: { shift_id: shiftId, is_active: 1 }
        });

        if (employeeCount > 0) {
            throw new Error(`Cannot delete shift. ${employeeCount} employee(s) are currently assigned to this shift.`);
        }

        // Soft delete shift
        await shift.destroy({ transaction });

        // Log audit trail (pass transaction to avoid lock timeout)
        await logAuditTrail(
            shiftId,
            'deleted',
            userId,
            shift.toJSON(),
            null,
            `Shift deleted: ${shift.shift_name}`,
            ipAddress,
            transaction
        );

        await transaction.commit();

        return { message: 'Shift deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Activate/Deactivate shift
 * @param {number} shiftId - Shift ID
 * @param {boolean} isActive - Active status
 * @param {number} userId - User ID
 * @param {number} companyId - Company ID (for validation)
 * @param {string} ipAddress - IP address
 */
const toggleShiftStatus = async (shiftId, isActive, userId, companyId, ipAddress = null) => {
    const transaction = await sequelize.transaction();

    try {
        const shift = await HrmsShiftMaster.findOne({
            where: {
                id: shiftId,
                company_id: companyId
            }
        });

        if (!shift) {
            throw new Error('Shift not found or you do not have permission to modify this shift');
        }

        const oldValues = shift.toJSON();

        await HrmsShiftMaster.update(
            { is_active: isActive ? 1 : 0, updated_by: userId },
            {
                where: {
                    id: shiftId,
                    company_id: companyId
                },
                transaction
            }
        );

        const updatedShift = await HrmsShiftMaster.findByPk(shiftId);

        // Log audit trail (pass transaction to avoid lock timeout)
        await logAuditTrail(
            shiftId,
            isActive ? 'activated' : 'deactivated',
            userId,
            oldValues,
            updatedShift.toJSON(),
            `Shift ${isActive ? 'activated' : 'deactivated'}: ${shift.shift_name}`,
            ipAddress,
            transaction
        );

        await transaction.commit();

        return await getShiftById(shiftId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get employees assigned to a shift
 * @param {number} shiftId - Shift ID
 * @returns {Array} List of employees
 */
const getShiftEmployees = async (shiftId) => {
    const employees = await HrmsEmployee.findAll({
        where: { shift_id: shiftId, is_active: 1 },
        attributes: ['id', 'employee_code', 'first_name', 'last_name', 'email', 'department_id', 'designation_id']
    });

    return employees;
};

/**
 * Assign shift to employees
 * @param {number} shiftId - Shift ID
 * @param {Array} employeeIds - Array of employee IDs
 * @param {number} userId - User ID performing the assignment
 * @returns {Object} Result
 */
const assignShiftToEmployees = async (shiftId, employeeIds, userId) => {
    const transaction = await sequelize.transaction();

    try {
        // Verify shift exists
        const shift = await HrmsShiftMaster.findByPk(shiftId);
        if (!shift) {
            throw new Error('Shift not found');
        }

        // Update employees
        await HrmsEmployee.update(
            { shift_id: shiftId, updated_by: userId },
            {
                where: { id: employeeIds },
                transaction
            }
        );

        await transaction.commit();

        return {
            message: `Shift assigned to ${employeeIds.length} employee(s) successfully`,
            shift_id: shiftId,
            employee_count: employeeIds.length
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get shift audit logs
 * @param {number} shiftId - Shift ID
 * @param {Object} pagination - Pagination options
 * @returns {Object} Audit logs with pagination
 */
const getShiftAuditLogs = async (shiftId, pagination = {}) => {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows } = await HrmsShiftAuditLog.findAndCountAll({
        where: { shift_id: shiftId },
        limit,
        offset,
        order: [['changed_at', 'DESC']]
    });

    return {
        logs: rows,
        pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(count / limit)
        }
    };
};

module.exports = {
    createShift,
    getShiftById,
    getAllShifts,
    updateShift,
    deleteShift,
    toggleShiftStatus,
    getShiftEmployees,
    assignShiftToEmployees,
    getShiftAuditLogs,
    timeToMinutes,
    minutesToTime,
    formatShiftForResponse
};
