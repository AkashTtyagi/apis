/**
 * Roster Assignment Service
 *
 * Purpose: Date-based roster shift assignment
 * Admin assigns different shift to employee on specific date
 * Overrides employee's primary shift for that date only
 */

const { HrmsRosterAssignment } = require('../../models/HrmsRosterAssignment');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { Op } = require('sequelize');

/**
 * Create roster assignment
 * @param {Object} data - Roster assignment data
 * @param {number} user_id - User creating the assignment
 * @returns {Object} Created roster assignment
 */
async function createRosterAssignment(data, user_id) {
    try {
        const { company_id, employee_id, roster_date, shift_id, notes } = data;

        // Validate employee exists
        const employee = await HrmsEmployee.findOne({
            where: { id: employee_id, company_id: company_id, is_active: true }
        });

        if (!employee) {
            throw new Error('Employee not found or inactive');
        }

        // Validate shift exists
        const shift = await HrmsShiftMaster.findOne({
            where: { id: shift_id, company_id: company_id, is_active: true }
        });

        if (!shift) {
            throw new Error('Shift not found or inactive');
        }

        // Check for existing roster assignment on this date
        const existingRoster = await HrmsRosterAssignment.findOne({
            where: {
                employee_id: employee_id,
                roster_date: roster_date
            }
        });

        if (existingRoster) {
            throw new Error('Roster assignment already exists for this employee on this date');
        }

        // Create roster assignment
        const rosterAssignment = await HrmsRosterAssignment.create({
            company_id,
            employee_id,
            roster_date,
            shift_id,
            notes,
            is_active: true,
            created_by: user_id
        });

        // Fetch complete data with associations
        const completeRoster = await HrmsRosterAssignment.findByPk(rosterAssignment.id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: 'Roster assignment created successfully',
            data: completeRoster
        };

    } catch (error) {
        console.error('Error creating roster assignment:', error);
        throw error;
    }
}

/**
 * Create bulk roster assignments
 * @param {Array} assignments - Array of roster assignment data
 * @param {number} user_id - User creating the assignments
 * @returns {Object} Created roster assignments
 */
async function createBulkRosterAssignments(assignments, user_id) {
    try {
        const created = [];
        const errors = [];

        for (const assignment of assignments) {
            try {
                const result = await createRosterAssignment(assignment, user_id);
                created.push(result.data);
            } catch (error) {
                errors.push({
                    assignment,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            message: `Created ${created.length} roster assignments, ${errors.length} failed`,
            data: {
                created,
                errors,
                total_created: created.length,
                total_failed: errors.length
            }
        };

    } catch (error) {
        console.error('Error creating bulk roster assignments:', error);
        throw error;
    }
}

/**
 * Get roster assignment by ID
 * @param {number} id - Roster assignment ID
 * @returns {Object} Roster assignment details
 */
async function getRosterAssignmentById(id) {
    try {
        const rosterAssignment = await HrmsRosterAssignment.findByPk(id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                },
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                }
            ]
        });

        if (!rosterAssignment) {
            throw new Error('Roster assignment not found');
        }

        return {
            success: true,
            data: rosterAssignment
        };

    } catch (error) {
        console.error('Error getting roster assignment:', error);
        throw error;
    }
}

/**
 * Get roster assignments with filters
 * @param {Object} filters - Filter criteria
 * @returns {Object} List of roster assignments
 */
async function getRosterAssignments(filters = {}) {
    try {
        const {
            company_id,
            employee_id,
            shift_id,
            date_from,
            date_to,
            is_active,
            page = 1,
            limit = 50
        } = filters;

        const where = {};

        if (company_id) where.company_id = company_id;
        if (employee_id) where.employee_id = employee_id;
        if (shift_id) where.shift_id = shift_id;
        if (is_active !== undefined) where.is_active = is_active;

        if (date_from && date_to) {
            where.roster_date = {
                [Op.between]: [date_from, date_to]
            };
        } else if (date_from) {
            where.roster_date = { [Op.gte]: date_from };
        } else if (date_to) {
            where.roster_date = { [Op.lte]: date_to };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsRosterAssignment.findAndCountAll({
            where,
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ],
            order: [['roster_date', 'DESC'], ['id', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                total_pages: Math.ceil(count / limit)
            }
        };

    } catch (error) {
        console.error('Error getting roster assignments:', error);
        throw error;
    }
}

/**
 * Update roster assignment
 * @param {number} id - Roster assignment ID
 * @param {Object} updateData - Data to update
 * @param {number} user_id - User updating the assignment
 * @returns {Object} Updated roster assignment
 */
async function updateRosterAssignment(id, updateData, user_id) {
    try {
        const rosterAssignment = await HrmsRosterAssignment.findByPk(id);

        if (!rosterAssignment) {
            throw new Error('Roster assignment not found');
        }

        // Validate shift if being updated
        if (updateData.shift_id) {
            const shift = await HrmsShiftMaster.findOne({
                where: {
                    id: updateData.shift_id,
                    company_id: rosterAssignment.company_id,
                    is_active: true
                }
            });

            if (!shift) {
                throw new Error('Shift not found or inactive');
            }
        }

        // Update the roster assignment
        await rosterAssignment.update({
            ...updateData,
            updated_by: user_id
        });

        // Fetch updated data with associations
        const updatedRoster = await HrmsRosterAssignment.findByPk(id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: 'Roster assignment updated successfully',
            data: updatedRoster
        };

    } catch (error) {
        console.error('Error updating roster assignment:', error);
        throw error;
    }
}

/**
 * Delete roster assignment (soft delete)
 * @param {number} id - Roster assignment ID
 * @param {number} user_id - User deleting the assignment
 * @returns {Object} Success message
 */
async function deleteRosterAssignment(id, user_id) {
    try {
        const rosterAssignment = await HrmsRosterAssignment.findByPk(id);

        if (!rosterAssignment) {
            throw new Error('Roster assignment not found');
        }

        // Soft delete
        await rosterAssignment.update({
            is_active: false,
            updated_by: user_id
        });

        await rosterAssignment.destroy();

        return {
            success: true,
            message: 'Roster assignment deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting roster assignment:', error);
        throw error;
    }
}

/**
 * Get employee roster for date range
 * @param {number} employee_id - Employee ID
 * @param {string} date_from - Start date
 * @param {string} date_to - End date
 * @returns {Object} Employee roster for date range
 */
async function getEmployeeRosterByDateRange(employee_id, date_from, date_to) {
    try {
        const roster = await HrmsRosterAssignment.findAll({
            where: {
                employee_id: employee_id,
                roster_date: {
                    [Op.between]: [date_from, date_to]
                },
                is_active: true
            },
            include: [
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ],
            order: [['roster_date', 'ASC']]
        });

        return {
            success: true,
            data: roster,
            total: roster.length
        };

    } catch (error) {
        console.error('Error getting employee roster by date range:', error);
        throw error;
    }
}

/**
 * Create or update roster assignment
 * If assignment exists for employee on date, update it; otherwise create new
 * @param {Object} data - Roster assignment data
 * @param {number} user_id - User creating/updating the assignment
 * @returns {Object} Created or updated roster assignment
 */
async function createOrUpdateRosterAssignment(data, user_id) {
    try {
        const { company_id, employee_id, roster_date, shift_id, notes } = data;

        // Validate employee exists
        const employee = await HrmsEmployee.findOne({
            where: { id: employee_id, company_id: company_id, is_active: true }
        });

        if (!employee) {
            throw new Error('Employee not found or inactive');
        }

        // Validate shift exists
        const shift = await HrmsShiftMaster.findOne({
            where: { id: shift_id, company_id: company_id, is_active: true }
        });

        if (!shift) {
            throw new Error('Shift not found or inactive');
        }

        // Check for existing roster assignment on this date
        const existingRoster = await HrmsRosterAssignment.findOne({
            where: {
                employee_id: employee_id,
                roster_date: roster_date
            }
        });

        let rosterAssignment;
        let isNew = false;

        if (existingRoster) {
            // Update existing
            await existingRoster.update({
                shift_id,
                notes,
                updated_by: user_id
            });
            rosterAssignment = existingRoster;
        } else {
            // Create new
            rosterAssignment = await HrmsRosterAssignment.create({
                company_id,
                employee_id,
                roster_date,
                shift_id,
                notes,
                is_active: true,
                created_by: user_id
            });
            isNew = true;
        }

        // Fetch complete data with associations
        const completeRoster = await HrmsRosterAssignment.findByPk(rosterAssignment.id, {
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                },
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    attributes: ['id', 'shift_name', 'shift_code', 'start_time', 'end_time']
                }
            ]
        });

        return {
            success: true,
            message: isNew ? 'Roster assignment created successfully' : 'Roster assignment updated successfully',
            data: completeRoster,
            isNew
        };

    } catch (error) {
        console.error('Error creating/updating roster assignment:', error);
        throw error;
    }
}

/**
 * Assign shift to multiple employees on specific date
 * @param {Object} data - Assignment data
 * @param {number} user_id - User creating the assignments
 * @returns {Object} Assignment results
 */
async function assignShiftToEmployees(data, user_id) {
    try {
        const { company_id, roster_date, shift_id, employee_ids, notes } = data;

        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            throw new Error('employee_ids must be a non-empty array');
        }

        // Validate shift exists
        const shift = await HrmsShiftMaster.findOne({
            where: { id: shift_id, company_id: company_id, is_active: true }
        });

        if (!shift) {
            throw new Error('Shift not found or inactive');
        }

        const results = {
            created: [],
            updated: [],
            failed: []
        };

        for (const employee_id of employee_ids) {
            try {
                const result = await createOrUpdateRosterAssignment({
                    company_id,
                    employee_id,
                    roster_date,
                    shift_id,
                    notes
                }, user_id);

                if (result.isNew) {
                    results.created.push(result.data);
                } else {
                    results.updated.push(result.data);
                }
            } catch (error) {
                results.failed.push({
                    employee_id,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            message: `Assigned shift to ${employee_ids.length} employees. Created: ${results.created.length}, Updated: ${results.updated.length}, Failed: ${results.failed.length}`,
            data: results,
            summary: {
                total: employee_ids.length,
                created: results.created.length,
                updated: results.updated.length,
                failed: results.failed.length
            }
        };

    } catch (error) {
        console.error('Error assigning shift to employees:', error);
        throw error;
    }
}

module.exports = {
    createRosterAssignment,
    createBulkRosterAssignments,
    createOrUpdateRosterAssignment,
    assignShiftToEmployees,
    getRosterAssignmentById,
    getRosterAssignments,
    updateRosterAssignment,
    deleteRosterAssignment,
    getEmployeeRosterByDateRange
};
