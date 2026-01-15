/**
 * Shift Calculation Service
 *
 * Purpose: Calculate which shift applies to an employee on a specific date
 *
 * Priority Order (lowest to highest):
 * 1. Default Shift (hrms_employees.shift_id)
 * 2. Rotating Shift (pattern-based)
 * 3. Roster Assignment (date-based override)
 * 4. Shift Swap (approved swaps)
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsRoster } = require('../../models/HrmsRoster');
const { HrmsRosterDetail } = require('../../models/HrmsRosterDetail');
const { HrmsRosterEmployee } = require('../../models/HrmsRosterEmployee');
const { HrmsRotatingShift } = require('../../models/HrmsRotatingShift');
const { HrmsRotatingShiftApplicability } = require('../../models/HrmsRotatingShiftApplicability');
const { HrmsShiftSwapRequest } = require('../../models/HrmsShiftSwapRequest');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { Op } = require('sequelize');

/**
 * Get employee shift for a specific date
 * @param {number} employee_id - Employee ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Shift details with source information
 */
async function getEmployeeShift(employee_id, date) {
    try {
        // Step 1: Get employee default shift
        const employee = await HrmsEmployee.findOne({
            where: {
                id: employee_id,
                status: { [Op.in]: [0, 1, 2] } // Active, Probation, Internship
            },
            include: [
                {
                    model: HrmsShiftMaster,
                    as: 'shift',
                    required: false
                }
            ],
            raw: true,
            nest:true
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        let resultShift = {
            shift_id: employee.shift_id,
            shift: employee.shift,
            source: 'default',
            priority: 1,
            details: 'Employee primary shift'
        };

        // Step 2: Check for rotating shift pattern
        const rotatingShift = await getApplicableRotatingShift(employee, date);
        if (rotatingShift) {
            resultShift = {
                shift_id: rotatingShift.shift_id,
                shift: rotatingShift.shift,
                source: 'rotating_shift',
                priority: 2,
                details: `Rotating pattern: ${rotatingShift.pattern_name}`,
                pattern_id: rotatingShift.pattern_id
            };
        }

        // Step 3: Check for roster assignment (new roster system)
        // Only consider published rosters (status: 1)
        const rosterEmployee = await HrmsRosterEmployee.findOne({
            where: {
                employee_id: employee_id,
                is_active: true
            },
            include: [
                {
                    model: HrmsRoster,
                    as: 'roster',
                    where: {
                        is_active: true,
                        status: 1  // Only published rosters
                    },
                    required: true,
                    include: [
                        {
                            model: HrmsRosterDetail,
                            as: 'details',
                            where: {
                                roster_date: date,
                                is_active: true
                            },
                            required: true,
                            include: [
                                {
                                    model: HrmsShiftMaster,
                                    as: 'shift',
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (rosterEmployee && rosterEmployee.roster && rosterEmployee.roster.details.length > 0) {
            const rosterDetail = rosterEmployee.roster.details[0];
            resultShift = {
                shift_id: rosterDetail.shift_id,
                shift: rosterDetail.shift,
                source: 'roster',
                priority: 3,
                details: `Roster: ${rosterEmployee.roster.roster_name}`,
                roster_id: rosterEmployee.roster.id,
                roster_name: rosterEmployee.roster.roster_name
            };
        }

        // Step 4: Check for approved shift swap (highest priority)
        const shiftSwap = await HrmsShiftSwapRequest.findOne({
            where: {
                swap_date: date,
                is_active: true,
                target_consent: 1, // Approved by target
                approval_status: 1, // Approved by workflow
                [Op.or]: [
                    { requester_employee_id: employee_id },
                    { target_employee_id: employee_id }
                ]
            },
            include: [
                {
                    model: HrmsShiftMaster,
                    as: 'requesterShift',
                    required: false
                },
                {
                    model: HrmsShiftMaster,
                    as: 'targetShift',
                    required: false
                }
            ]
        });

        if (shiftSwap) {
            // If this employee is the requester, they get target's shift
            // If this employee is the target, they get requester's shift
            const isRequester = shiftSwap.requester_employee_id === employee_id;

            resultShift = {
                shift_id: isRequester ? shiftSwap.target_current_shift_id : shiftSwap.requester_current_shift_id,
                shift: isRequester ? shiftSwap.targetShift : shiftSwap.requesterShift,
                source: 'shift_swap',
                priority: 4,
                details: `Shift swapped with employee ${isRequester ? shiftSwap.target_employee_id : shiftSwap.requester_employee_id}`,
                swap_id: shiftSwap.id,
                swap_reason: shiftSwap.swap_reason
            };
        }

        // Check if shift details were found
        if (!resultShift.shift_id || !resultShift.shift) {
            throw new Error('Shift details not found');
        }

        return resultShift;

    } catch (error) {
        console.error('Error calculating employee shift:', error);
        throw error;
    }
}

/**
 * Get applicable rotating shift for employee on specific date
 * @param {Object} employee - Employee object with all fields
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object|null} Shift details from rotating pattern or null
 */
async function getApplicableRotatingShift(employee, date) {
    try {
        const targetDate = new Date(date);

        // Find all active rotating shift patterns for this date range
        const patterns = await HrmsRotatingShift.findAll({
            where: {
                company_id: employee.company_id,
                is_active: true,
                start_date: { [Op.lte]: date },
                [Op.or]: [
                    { end_date: { [Op.gte]: date } },
                    { end_date: null }
                ]
            },
            include: [
                {
                    model: HrmsRotatingShiftApplicability,
                    as: 'applicability',
                    where: { is_active: true },
                    required: true
                }
            ],
            order: [['applicability', 'priority', 'ASC']]
        });

        // Check each pattern's applicability
        for (const pattern of patterns) {
            const isApplicable = await checkPatternApplicability(employee, pattern.applicability);

            if (isApplicable) {
                // Calculate which shift in rotation applies on this date
                const shiftId = calculateRotatingShiftForDate(pattern, targetDate);

                if (shiftId) {
                    const shift = await HrmsShiftMaster.findByPk(shiftId);
                    return {
                        shift_id: shiftId,
                        shift: shift,
                        pattern_id: pattern.id,
                        pattern_name: pattern.pattern_name
                    };
                }
            }
        }

        return null;

    } catch (error) {
        console.error('Error getting applicable rotating shift:', error);
        return null;
    }
}

/**
 * Check if rotating shift pattern applies to employee
 * @param {Object} employee - Employee object
 * @param {Array} applicabilityRules - Array of applicability rules
 * @returns {boolean} True if pattern applies
 */
async function checkPatternApplicability(employee, applicabilityRules) {
    for (const rule of applicabilityRules) {
        let primaryMatch = false;
        let advancedMatch = true;

        // Check primary applicability
        const applicabilityValues = rule.applicability_value
            ? rule.applicability_value.split(',').map(v => parseInt(v.trim()))
            : [];

        switch (rule.applicability_type) {
            case 'company':
                primaryMatch = applicabilityValues.includes(employee.company_id);
                break;
            case 'department':
                primaryMatch = applicabilityValues.includes(employee.department_id);
                break;
            case 'sub_department':
                primaryMatch = applicabilityValues.includes(employee.sub_department_id);
                break;
            case 'designation':
                primaryMatch = applicabilityValues.includes(employee.designation_id);
                break;
            case 'branch':
                primaryMatch = applicabilityValues.includes(employee.branch_id);
                break;
            case 'location':
                primaryMatch = applicabilityValues.includes(employee.location_id);
                break;
            case 'employee_type':
                primaryMatch = applicabilityValues.includes(employee.employee_type_id);
                break;
            case 'grade':
                primaryMatch = applicabilityValues.includes(employee.grade_id);
                break;
            case 'level':
                primaryMatch = applicabilityValues.includes(employee.level_id);
                break;
            case 'employee':
                primaryMatch = applicabilityValues.includes(employee.id);
                break;
        }

        // Check advanced applicability if defined
        if (rule.advanced_applicability_type && rule.advanced_applicability_type !== 'none') {
            const advancedValues = rule.advanced_applicability_value
                ? rule.advanced_applicability_value.split(',').map(v => parseInt(v.trim()))
                : [];

            switch (rule.advanced_applicability_type) {
                case 'employee_type':
                    advancedMatch = advancedValues.includes(employee.employee_type_id);
                    break;
                case 'branch':
                    advancedMatch = advancedValues.includes(employee.branch_id);
                    break;
                case 'region':
                    advancedMatch = advancedValues.includes(employee.region_id);
                    break;
                case 'zone':
                    advancedMatch = advancedValues.includes(employee.zone_id);
                    break;
                case 'location':
                    advancedMatch = advancedValues.includes(employee.location_id);
                    break;
            }
        }

        // Apply is_excluded logic
        const finalMatch = primaryMatch && advancedMatch;
        if (rule.is_excluded) {
            // If excluded and matches, skip this employee
            if (finalMatch) {
                return false;
            }
        } else {
            // If included and matches, apply this pattern
            if (finalMatch) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Calculate which shift in rotation applies on specific date
 * @param {Object} pattern - Rotating shift pattern object
 * @param {Date} targetDate - Date to calculate shift for
 * @returns {number|null} Shift ID or null
 */
function calculateRotatingShiftForDate(pattern, targetDate) {
    try {
        const shiftOrder = pattern.shift_order; // JSON array [1, 2, 3]
        if (!shiftOrder || shiftOrder.length === 0) {
            return null;
        }

        const startDate = new Date(pattern.start_date);
        const diffTime = targetDate - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return null; // Date is before pattern starts
        }

        let cycleIndex;

        switch (pattern.frequency) {
            case 'daily':
                // Each day rotates to next shift
                cycleIndex = diffDays % shiftOrder.length;
                break;

            case 'weekly':
                // Each week rotates to next shift
                const diffWeeks = Math.floor(diffDays / 7);
                cycleIndex = diffWeeks % shiftOrder.length;
                break;

            case 'bi-weekly':
                // Every 2 weeks rotates to next shift
                const diffBiWeeks = Math.floor(diffDays / 14);
                cycleIndex = diffBiWeeks % shiftOrder.length;
                break;

            case 'monthly':
                // Each month rotates to next shift
                const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12
                    + (targetDate.getMonth() - startDate.getMonth());
                cycleIndex = monthsDiff % shiftOrder.length;
                break;

            default:
                return null;
        }

        return shiftOrder[cycleIndex];

    } catch (error) {
        console.error('Error calculating rotating shift for date:', error);
        return null;
    }
}

/**
 * Get shift details for multiple employees and dates
 * @param {Array} employee_ids - Array of employee IDs
 * @param {Array} dates - Array of dates in YYYY-MM-DD format
 * @returns {Array} Array of shift details
 */
async function getEmployeeShiftsBulk(employee_ids, dates) {
    try {
        const results = [];

        for (const employee_id of employee_ids) {
            for (const date of dates) {
                const shiftData = await getEmployeeShift(employee_id, date);
                results.push(shiftData);
            }
        }

        return {
            success: true,
            data: results,
            total: results.length
        };

    } catch (error) {
        console.error('Error in bulk shift calculation:', error);
        throw error;
    }
}

module.exports = {
    getEmployeeShift,
    getApplicableRotatingShift,
    checkPatternApplicability,
    calculateRotatingShiftForDate,
    getEmployeeShiftsBulk
};
