/**
 * Restricted Holiday Application Service
 * Business logic for restricted holiday applications
 *
 * Restricted holidays are optional holidays that employees can choose to take.
 * When an employee opts for a restricted holiday, entry is created in HrmsDailyAttendance.
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowMaster } = require('../../models/workflow');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const { HrmsHolidayBank } = require('../../models/holiday/HrmsHolidayBank');
const { HrmsHolidayPolicy } = require('../../models/holiday/HrmsHolidayPolicy');
const { HrmsHolidayPolicyMapping } = require('../../models/holiday/HrmsHolidayPolicyMapping');
const { HrmsHolidayPolicyApplicability } = require('../../models/holiday/HrmsHolidayPolicyApplicability');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');
const { Op } = require('sequelize');

// Workflow code for Restricted Holiday
const RESTRICTED_HOLIDAY_WORKFLOW_CODE = 'RESTRICTED_HOLIDAY';

// Cache for workflow_master_id
let cachedWorkflowMasterId = null;

/**
 * Get workflow_master_id for Restricted Holiday from database
 * Uses caching to avoid repeated DB calls
 */
const getRestrictedHolidayWorkflowId = async () => {
    if (cachedWorkflowMasterId) {
        return cachedWorkflowMasterId;
    }

    const workflow = await HrmsWorkflowMaster.findOne({
        where: { workflow_code: RESTRICTED_HOLIDAY_WORKFLOW_CODE },
        attributes: ['id'],
        raw: true
    });

    if (!workflow) {
        throw new Error('Restricted Holiday workflow not configured. Please run migration to add RESTRICTED_HOLIDAY workflow.');
    }

    cachedWorkflowMasterId = workflow.id;
    return cachedWorkflowMasterId;
};

/**
 * Apply for restricted holiday
 * @param {Object} data - Application data
 * @param {number} data.holiday_id - Holiday ID from hrms_holiday_bank
 * @param {string} data.reason - Reason for opting this holiday (optional)
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} Created request
 */
const applyRestrictedHoliday = async (data, employee_id, user_id) => {
    const { holiday_id, reason } = data;

    // Validate holiday_id is required
    if (!holiday_id) {
        throw new Error('holiday_id is required');
    }

    // Get workflow_master_id for restricted holiday
    const workflowMasterId = await getRestrictedHolidayWorkflowId();

    // Get employee details with all attributes needed for applicability check
    const employee = await HrmsEmployee.findByPk(employee_id, {
        attributes: [
            'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
            'designation_id', 'level_id', 'grade_id', 'location_id'
        ],
        raw: true
    });
    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get holiday details from holiday bank
    const holiday = await HrmsHolidayBank.findOne({
        where: {
            id: holiday_id,
            is_national_holiday: 0,  // Must be restricted holiday (not national)
            is_active: 1
        },
        raw: true
    });

    if (!holiday) {
        throw new Error('Invalid holiday_id. Restricted holiday not found or not active.');
    }

    // Check if holiday date is in the future or today
    if (moment(holiday.holiday_date).isBefore(moment(), 'day')) {
        throw new Error('Cannot apply for past restricted holidays');
    }

    // Find applicable holiday policy for the employee
    const currentYear = moment(holiday.holiday_date).year();
    const applicablePolicy = await findApplicableHolidayPolicy(employee, currentYear);

    if (!applicablePolicy) {
        throw new Error('No holiday policy configured for you. Please contact HR.');
    }

    // Check if restricted holidays are applicable for this policy
    if (!applicablePolicy.is_restricted_holiday_applicable) {
        throw new Error('Restricted holidays are not applicable for your holiday policy.');
    }

    // Check if this holiday is mapped to the employee's policy
    const holidayMapping = await HrmsHolidayPolicyMapping.findOne({
        where: {
            policy_id: applicablePolicy.id,
            holiday_id: holiday_id,
            is_active: 1
        }
    });

    if (!holidayMapping) {
        throw new Error('This restricted holiday is not applicable to your holiday policy.');
    }

    // Check if employee already has a pending/approved request for this holiday
    const existingRequest = await HrmsDailyAttendance.findOne({
        where: {
            employee_id,
            attendance_date: holiday.holiday_date,
            workflow_master_id: workflowMasterId,
            status: {
                [Op.in]: ['pending', 'approved']
            }
        }
    });

    if (existingRequest) {
        throw new Error(`You already have a ${existingRequest.status} request for this restricted holiday (${holiday.holiday_name})`);
    }

    // Check if employee has exceeded their restricted holiday limit
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const appliedHolidays = await HrmsDailyAttendance.findAll({
        where: {
            employee_id,
            workflow_master_id: workflowMasterId,
            attendance_date: {
                [Op.between]: [startOfYear, endOfYear]
            },
            status: {
                [Op.in]: ['pending', 'approved']
            }
        },
        attributes: ['status'],
        raw: true
    });

    const approvedCount = appliedHolidays.filter(h => h.status === 'approved').length;
    const pendingCount = appliedHolidays.filter(h => h.status === 'pending').length;
    const maxAllowed = applicablePolicy.restricted_holiday_count || 0;

    if (approvedCount + pendingCount >= maxAllowed) {
        throw new Error(`You have already used/applied for all ${maxAllowed} restricted holidays allowed for this year.`);
    }

    // Determine pay_day based on holiday day_type
    const dayType = holiday.day_type || 'full_day';
    let pay_day;
    if (dayType === 'first_half') {
        pay_day = 2;  // First Half
    } else if (dayType === 'second_half') {
        pay_day = 3;  // Second Half
    } else {
        pay_day = 1;  // Full Day
    }

    // Prepare request data
    const requestData = {
        holiday_id: holiday.id,
        holiday_name: holiday.holiday_name,
        holiday_date: holiday.holiday_date,
        day_type: dayType,
        policy_id: applicablePolicy.id,
        policy_name: applicablePolicy.calendar_name,
        reason: reason || null,
        applied_at: new Date()
    };

    // Submit workflow request
    const request = await workflowExecutionService.submitRequest(
        employee_id,
        workflowMasterId,
        requestData,
        user_id
    );

    // Create daily attendance entry
    await HrmsDailyAttendance.create({
        employee_id,
        company_id: employee.company_id,
        attendance_date: holiday.holiday_date,
        request_id: request.id,
        workflow_master_id: workflowMasterId,
        pay_day,  // 1=Full Day, 2=First Half, 3=Second Half
        is_paid: true,  // Restricted holidays are paid
        status: 'pending',
        remarks: `Restricted Holiday: ${holiday.holiday_name} (${dayType})`,
        punch_in: null,
        punch_out: null
    });

    return {
        request,
        holiday_name: holiday.holiday_name,
        holiday_date: holiday.holiday_date,
        day_type: dayType,
        remaining_count: maxAllowed - approvedCount - pendingCount - 1
    };
};

/**
 * Get built-in priority based on applicability type
 * Lower number = Higher priority
 */
const getBuiltInPriority = (applicabilityType) => {
    const priorityMap = {
        'employee': 1,
        'sub_department': 2,
        'department': 3,
        'designation': 4,
        'level': 5,
        'location': 6,
        'entity': 7,
        'company': 8,
        'grade': 9
    };
    return priorityMap[applicabilityType] || 999;
};

/**
 * Check if an applicability rule matches the employee
 */
const checkApplicabilityRule = (rule, employee) => {
    const isInList = (commaSeparatedValues, employeeValue) => {
        if (!commaSeparatedValues || !employeeValue) return false;
        const values = commaSeparatedValues.split(',').map(v => parseInt(v.trim()));
        return values.includes(parseInt(employeeValue));
    };

    const applicabilityValue = rule.applicability_value;

    switch (rule.applicability_type) {
        case 'company':
            if (!applicabilityValue || applicabilityValue === null) {
                return (rule.company_id === employee.company_id);
            }
            return isInList(applicabilityValue, employee.company_id);
        case 'entity':
            return isInList(applicabilityValue, employee.entity_id);
        case 'location':
            return isInList(applicabilityValue, employee.location_id);
        case 'level':
            return isInList(applicabilityValue, employee.level_id);
        case 'designation':
            return isInList(applicabilityValue, employee.designation_id);
        case 'department':
            return isInList(applicabilityValue, employee.department_id);
        case 'sub_department':
            return isInList(applicabilityValue, employee.sub_department_id);
        case 'employee':
            return isInList(applicabilityValue, employee.id);
        case 'grade':
            return isInList(applicabilityValue, employee.grade_id);
        default:
            return false;
    }
};

/**
 * Find applicable holiday policy for an employee
 * @param {Object} employee - Employee object with all attributes
 * @param {number} year - Year to find policy for
 * @returns {Promise<Object|null>} Applicable holiday policy
 */
const findApplicableHolidayPolicy = async (employee, year) => {
    // Get all active holiday policies for this company and year
    const policies = await HrmsHolidayPolicy.findAll({
        where: {
            company_id: employee.company_id,
            year: year,
            is_active: 1
        },
        include: [{
            model: HrmsHolidayPolicyApplicability,
            as: 'applicability',
            where: { is_active: 1 },
            required: false
        }],
        raw: false
    });

    if (!policies || policies.length === 0) {
        return null;
    }

    let applicablePolicy = null;
    let highestPriority = 999999;

    for (const policy of policies) {
        const plainPolicy = policy.get({ plain: true });
        const applicabilityRules = plainPolicy.applicability || [];

        // If no applicability rules, this is company-wide (lowest priority)
        if (applicabilityRules.length === 0) {
            const defaultPriority = 1000;
            if (defaultPriority < highestPriority) {
                applicablePolicy = plainPolicy;
                highestPriority = defaultPriority;
            }
            continue;
        }

        // Check each applicability rule
        for (const rule of applicabilityRules) {
            const matches = checkApplicabilityRule(rule, employee);

            if (matches && !rule.is_excluded) {
                const builtInPriority = getBuiltInPriority(rule.applicability_type);

                if (builtInPriority < highestPriority) {
                    applicablePolicy = plainPolicy;
                    highestPriority = builtInPriority;
                }
            }
        }
    }

    return applicablePolicy;
};

/**
 * Get available restricted holidays for employee
 * Returns restricted holidays applicable to the employee based on their holiday policy
 * @param {number} employee_id - Employee ID
 * @returns {Promise<Object>} List of available restricted holidays with policy info
 */
const getAvailableRestrictedHolidays = async (employee_id) => {
    // Get workflow_master_id for restricted holiday
    const workflowMasterId = await getRestrictedHolidayWorkflowId();

    // Get current year
    const currentYear = moment().year();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    // Get employee details with all attributes needed for applicability check
    const employee = await HrmsEmployee.findByPk(employee_id, {
        attributes: [
            'id', 'company_id', 'entity_id', 'department_id', 'sub_department_id',
            'designation_id', 'level_id', 'grade_id', 'location_id'
        ],
        raw: true
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Find applicable holiday policy for the employee
    const applicablePolicy = await findApplicableHolidayPolicy(employee, currentYear);

    if (!applicablePolicy) {
        return {
            policy: null,
            restricted_holiday_count: 0,
            holidays: [],
            message: 'No holiday policy configured for this employee'
        };
    }

    // Check if restricted holidays are applicable for this policy
    if (!applicablePolicy.is_restricted_holiday_applicable) {
        return {
            policy: {
                id: applicablePolicy.id,
                calendar_name: applicablePolicy.calendar_name
            },
            restricted_holiday_count: 0,
            holidays: [],
            message: 'Restricted holidays are not applicable for your holiday policy'
        };
    }

    // Get restricted holidays mapped to this policy
    const policyMappings = await HrmsHolidayPolicyMapping.findAll({
        where: {
            policy_id: applicablePolicy.id,
            is_active: 1
        },
        include: [{
            model: HrmsHolidayBank,
            as: 'holiday',
            where: {
                is_national_holiday: 0,  // Only restricted holidays
                is_active: 1,
                holiday_date: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            required: true
        }],
        raw: false
    });

    // Get employee's already applied restricted holidays
    const appliedHolidays = await HrmsDailyAttendance.findAll({
        where: {
            employee_id,
            workflow_master_id: workflowMasterId,
            attendance_date: {
                [Op.between]: [startOfYear, endOfYear]
            },
            status: {
                [Op.in]: ['pending', 'approved']
            }
        },
        attributes: ['attendance_date', 'status'],
        raw: true
    });

    const appliedDatesMap = {};
    appliedHolidays.forEach(h => {
        appliedDatesMap[h.attendance_date] = h.status;
    });

    // Count approved restricted holidays
    const approvedCount = appliedHolidays.filter(h => h.status === 'approved').length;
    const pendingCount = appliedHolidays.filter(h => h.status === 'pending').length;
    const maxAllowed = applicablePolicy.restricted_holiday_count || 0;
    const remainingCount = Math.max(0, maxAllowed - approvedCount - pendingCount);

    // Mark holidays as available or already applied
    const holidays = policyMappings.map(mapping => {
        const holiday = mapping.get({ plain: true }).holiday;
        const holidayDate = moment(holiday.holiday_date).format('YYYY-MM-DD');
        const appliedStatus = appliedDatesMap[holidayDate];
        const isPast = moment(holidayDate).isBefore(moment(), 'day');

        return {
            id: holiday.id,
            holiday_name: holiday.holiday_name,
            holiday_date: holidayDate,
            day_type: holiday.day_type || 'full_day',  // full_day, first_half, second_half
            description: holiday.description,
            is_past: isPast,
            is_applied: !!appliedStatus,
            applied_status: appliedStatus || null,
            can_apply: !appliedStatus && !isPast && remainingCount > 0
        };
    });

    // Sort by date
    holidays.sort((a, b) => moment(a.holiday_date).diff(moment(b.holiday_date)));

    return {
        policy: {
            id: applicablePolicy.id,
            calendar_name: applicablePolicy.calendar_name
        },
        restricted_holiday_count: maxAllowed,
        used_count: approvedCount,
        pending_count: pendingCount,
        remaining_count: remainingCount,
        holidays: holidays
    };
};

module.exports = {
    applyRestrictedHoliday,
    getAvailableRestrictedHolidays,
    getRestrictedHolidayWorkflowId
};
