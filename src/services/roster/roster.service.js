/**
 * Roster Service
 *
 * Purpose: Manage roster creation, assignment, and employee management
 *
 * Flow:
 * 1. Create roster with name, description, and date-shift pattern
 * 2. Assign roster to multiple employees
 * 3. List rosters
 * 4. Get employees assigned to roster
 * 5. Remove employees from roster
 */

const { HrmsRoster } = require('../../models/HrmsRoster');
const { HrmsRosterDetail } = require('../../models/HrmsRosterDetail');
const { HrmsRosterEmployee } = require('../../models/HrmsRosterEmployee');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { Op } = require('sequelize');
const { sequelize } = require('../../utils/database');

/**
 * Create roster with date-shift pattern
 * @param {Object} data - Roster data
 * @param {number} user_id - User creating the roster
 * @returns {Object} Created roster with details
 *
 * Input format:
 * {
 *   company_id: 1,
 *   roster_name: "Week 1 Rotation",
 *   roster_description: "First week rotation pattern",
 *   roster_pattern: [
 *     { date: "2025-06-01", shift_id: 1 },
 *     { date: "2025-06-02", shift_id: 2 },
 *     { date: "2025-06-03", shift_id: 3 }
 *   ]
 * }
 */
async function createRoster(data, user_id) {
    const transaction = await sequelize.transaction();

    try {
        const { company_id, roster_name, roster_description, roster_pattern } = data;

        // Validate input
        if (!Array.isArray(roster_pattern) || roster_pattern.length === 0) {
            throw new Error('roster_pattern must be a non-empty array');
        }

        // Validate all shifts in pattern exist
        const shiftIds = [...new Set(roster_pattern.map(r => r.shift_id))];
        const shifts = await HrmsShiftMaster.findAll({
            where: {
                id: { [Op.in]: shiftIds },
                company_id: company_id,
                is_active: true
            }
        });

        if (shifts.length !== shiftIds.length) {
            throw new Error('One or more shifts in roster pattern not found or inactive');
        }

        // Create roster master
        const roster = await HrmsRoster.create({
            company_id,
            roster_name,
            roster_description,
            is_active: true,
            created_by: user_id
        }, { transaction });

        // Create roster details
        const rosterDetails = [];
        for (const entry of roster_pattern) {
            const detail = await HrmsRosterDetail.create({
                roster_id: roster.id,
                roster_date: entry.date,
                shift_id: entry.shift_id,
                is_active: true,
                created_by: user_id
            }, { transaction });
            rosterDetails.push(detail);
        }

        await transaction.commit();

        // Fetch complete roster with details
        const completeRoster = await HrmsRoster.findByPk(roster.id, {
            include: [
                {
                    model: HrmsRosterDetail,
                    as: 'details',
                    include: [
                        {
                            model: HrmsShiftMaster,
                            as: 'shift',
                            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
                        }
                    ]
                }
            ]
        });

        return {
            success: true,
            message: 'Roster created successfully',
            data: completeRoster
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating roster:', error);
        throw error;
    }
}

/**
 * Update roster
 * @param {number} roster_id - Roster ID
 * @param {Object} updateData - Data to update
 * @param {number} user_id - User updating the roster
 * @returns {Object} Updated roster
 */
async function updateRoster(roster_id, updateData, user_id) {
    const transaction = await sequelize.transaction();

    try {
        const roster = await HrmsRoster.findByPk(roster_id);

        if (!roster) {
            throw new Error('Roster not found');
        }

        // Update roster master if name or description provided
        if (updateData.roster_name || updateData.roster_description) {
            await roster.update({
                roster_name: updateData.roster_name || roster.roster_name,
                roster_description: updateData.roster_description !== undefined
                    ? updateData.roster_description
                    : roster.roster_description,
                updated_by: user_id
            }, { transaction });
        }

        // Update roster pattern if provided
        if (updateData.roster_pattern && Array.isArray(updateData.roster_pattern)) {
            // Validate all shifts
            const shiftIds = [...new Set(updateData.roster_pattern.map(r => r.shift_id))];
            const shifts = await HrmsShiftMaster.findAll({
                where: {
                    id: { [Op.in]: shiftIds },
                    company_id: roster.company_id,
                    is_active: true
                }
            });

            if (shifts.length !== shiftIds.length) {
                throw new Error('One or more shifts in roster pattern not found or inactive');
            }

            // Delete existing details
            await HrmsRosterDetail.destroy({
                where: { roster_id: roster_id },
                transaction,
                force: true
            });

            // Create new details
            for (const entry of updateData.roster_pattern) {
                await HrmsRosterDetail.create({
                    roster_id: roster_id,
                    roster_date: entry.date,
                    shift_id: entry.shift_id,
                    is_active: true,
                    created_by: user_id
                }, { transaction });
            }
        }

        await transaction.commit();

        // Fetch updated roster
        const updatedRoster = await HrmsRoster.findByPk(roster_id, {
            include: [
                {
                    model: HrmsRosterDetail,
                    as: 'details',
                    include: [
                        {
                            model: HrmsShiftMaster,
                            as: 'shift',
                            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
                        }
                    ]
                }
            ]
        });

        return {
            success: true,
            message: 'Roster updated successfully',
            data: updatedRoster
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating roster:', error);
        throw error;
    }
}

/**
 * Assign roster to employees
 * @param {number} roster_id - Roster ID
 * @param {Array} employee_ids - Array of employee IDs
 * @param {number} user_id - User assigning the roster
 * @returns {Object} Assignment results
 */
async function assignRosterToEmployees(roster_id, employee_ids, user_id) {
    try {
        const roster = await HrmsRoster.findByPk(roster_id);

        if (!roster) {
            throw new Error('Roster not found');
        }

        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            throw new Error('employee_ids must be a non-empty array');
        }

        // Validate all employees exist
        const employees = await HrmsEmployee.findAll({
            where: {
                id: { [Op.in]: employee_ids },
                company_id: roster.company_id,
                is_active: true
            }
        });

        if (employees.length !== employee_ids.length) {
            throw new Error('One or more employees not found or inactive');
        }

        const results = {
            assigned: [],
            already_assigned: [],
            failed: []
        };

        for (const employee_id of employee_ids) {
            try {
                // Check if already assigned
                const existing = await HrmsRosterEmployee.findOne({
                    where: {
                        roster_id: roster_id,
                        employee_id: employee_id
                    }
                });

                if (existing) {
                    results.already_assigned.push(employee_id);
                } else {
                    await HrmsRosterEmployee.create({
                        roster_id: roster_id,
                        employee_id: employee_id,
                        company_id: roster.company_id,
                        is_active: true,
                        created_by: user_id
                    });
                    results.assigned.push(employee_id);
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
            message: `Roster assigned to ${results.assigned.length} employees`,
            data: results,
            summary: {
                total: employee_ids.length,
                assigned: results.assigned.length,
                already_assigned: results.already_assigned.length,
                failed: results.failed.length
            }
        };

    } catch (error) {
        console.error('Error assigning roster to employees:', error);
        throw error;
    }
}

/**
 * Get roster by ID
 * @param {number} roster_id - Roster ID
 * @returns {Object} Roster details
 */
async function getRosterById(roster_id) {
    try {
        const roster = await HrmsRoster.findByPk(roster_id, {
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRosterDetail,
                    as: 'details',
                    include: [
                        {
                            model: HrmsShiftMaster,
                            as: 'shift',
                            attributes: ['id', 'shift_name', 'shift_code', 'shift_start_time', 'shift_end_time']
                        }
                    ],
                    order: [['roster_date', 'ASC']]
                }
            ]
        });

        if (!roster) {
            throw new Error('Roster not found');
        }

        return {
            success: true,
            data: roster
        };

    } catch (error) {
        console.error('Error getting roster:', error);
        throw error;
    }
}

/**
 * Get rosters with filters
 * @param {Object} filters - Filter criteria
 * @returns {Object} List of rosters
 */
async function getRosters(filters = {}) {
    try {
        const {
            company_id,
            is_active,
            search,
            page = 1,
            limit = 50
        } = filters;

        const where = {};

        if (company_id) where.company_id = company_id;
        if (is_active !== undefined) where.is_active = is_active;
        if (search) {
            where[Op.or] = [
                { roster_name: { [Op.like]: `%${search}%` } },
                { roster_description: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsRoster.findAndCountAll({
            where,
            include: [
                {
                    model: HrmsCompany,
                    as: 'company',
                    attributes: ['id', 'org_name']
                },
                {
                    model: HrmsRosterDetail,
                    as: 'details',
                    include: [
                        {
                            model: HrmsShiftMaster,
                            as: 'shift',
                            attributes: ['id', 'shift_name', 'shift_code']
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']],
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
        console.error('Error getting rosters:', error);
        throw error;
    }
}

/**
 * Get employees assigned to roster
 * @param {number} roster_id - Roster ID
 * @returns {Object} List of employees
 */
async function getRosterEmployees(roster_id) {
    try {
        const roster = await HrmsRoster.findByPk(roster_id);

        if (!roster) {
            throw new Error('Roster not found');
        }

        const rosterEmployees = await HrmsRosterEmployee.findAll({
            where: {
                roster_id: roster_id,
                is_active: true
            },
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code', 'department_id', 'designation_id']
                }
            ]
        });

        return {
            success: true,
            data: rosterEmployees.map(re => re.employee),
            total: rosterEmployees.length
        };

    } catch (error) {
        console.error('Error getting roster employees:', error);
        throw error;
    }
}

/**
 * Remove employees from roster
 * @param {number} roster_id - Roster ID
 * @param {Array} employee_ids - Array of employee IDs to remove
 * @param {number} user_id - User removing the employees
 * @returns {Object} Removal results
 */
async function removeEmployeesFromRoster(roster_id, employee_ids, user_id) {
    try {
        const roster = await HrmsRoster.findByPk(roster_id);

        if (!roster) {
            throw new Error('Roster not found');
        }

        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            throw new Error('employee_ids must be a non-empty array');
        }

        const results = {
            removed: [],
            not_found: [],
            failed: []
        };

        for (const employee_id of employee_ids) {
            try {
                const rosterEmployee = await HrmsRosterEmployee.findOne({
                    where: {
                        roster_id: roster_id,
                        employee_id: employee_id
                    }
                });

                if (rosterEmployee) {
                    await rosterEmployee.destroy();
                    results.removed.push(employee_id);
                } else {
                    results.not_found.push(employee_id);
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
            message: `Removed ${results.removed.length} employees from roster`,
            data: results,
            summary: {
                total: employee_ids.length,
                removed: results.removed.length,
                not_found: results.not_found.length,
                failed: results.failed.length
            }
        };

    } catch (error) {
        console.error('Error removing employees from roster:', error);
        throw error;
    }
}

/**
 * Delete roster (soft delete)
 * @param {number} roster_id - Roster ID
 * @param {number} user_id - User deleting the roster
 * @returns {Object} Success message
 */
async function deleteRoster(roster_id, user_id) {
    try {
        const roster = await HrmsRoster.findByPk(roster_id);

        if (!roster) {
            throw new Error('Roster not found');
        }

        await roster.update({
            is_active: false,
            updated_by: user_id
        });

        await roster.destroy();

        return {
            success: true,
            message: 'Roster deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting roster:', error);
        throw error;
    }
}

module.exports = {
    createRoster,
    updateRoster,
    assignRosterToEmployees,
    getRosterById,
    getRosters,
    getRosterEmployees,
    removeEmployeesFromRoster,
    deleteRoster
};
