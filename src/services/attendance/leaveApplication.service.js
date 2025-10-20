/**
 * Leave Application Service
 * Business logic for leave applications
 * Supports Date Range and Multiple Dates modes
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const { HrmsLeaveMaster } = require('../../models/HrmsLeaveMaster');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');

/**
 * Apply for leave (Date Range or Multiple Dates mode)
 * @param {Object} leaveData - Leave application data
 * @param {number} leaveData.leave_type - Leave type ID (FK to hrms_leave_master)
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} Created leave request
 */
const applyLeave = async (leaveData, employee_id, user_id) => {
    const {
        leave_type,
        from_date,
        to_date,
        specific_dates,
        duration,
        reason,
        is_paid,
        attachment
    } = leaveData;

    // Determine leave application mode
    const isDateRangeMode = from_date && to_date;
    const isMultipleDatesMode = specific_dates && Array.isArray(specific_dates) && specific_dates.length > 0;

    // Validation - either date range OR specific dates is required
    if (!leave_type || !reason) {
        throw new Error('Required fields: leave_type (leave master ID), reason');
    }

    // Validate leave_type is valid leave master ID
    const leaveMaster = await HrmsLeaveMaster.findByPk(leave_type);
    if (!leaveMaster) {
        throw new Error('Invalid leave_type. Must be valid leave master ID.');
    }

    if (!isDateRangeMode && !isMultipleDatesMode) {
        throw new Error('Either provide date range (from_date, to_date) OR specific_dates array');
    }

    if (isDateRangeMode && isMultipleDatesMode) {
        throw new Error('Cannot use both date range and specific_dates. Choose one mode.');
    }

    // Get employee details
    const employee = await HrmsEmployee.findByPk(employee_id);
    if (!employee) {
        throw new Error('Employee not found');
    }

    let requestData;
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    let leaveDates = [];

    // Handle Date Range Mode
    if (isDateRangeMode) {
        const rangeResult = handleDateRangeMode({
            from_date,
            to_date,
            duration,
            leave_type,
            reason,
            is_paid,
            attachment
        });

        requestData = rangeResult.requestData;
        calculatedDuration = rangeResult.duration;
        leaveDates = rangeResult.dates;
    }

    // Handle Multiple Dates Mode
    if (isMultipleDatesMode) {
        const multipleDatesResult = handleMultipleDatesMode({
            specific_dates,
            duration,
            leave_type,
            reason,
            is_paid,
            attachment
        });

        requestData = multipleDatesResult.requestData;
        calculatedDuration = multipleDatesResult.duration;
        leaveDates = multipleDatesResult.dates;
    }

    // Submit workflow request (workflow_master_id = 1 for Leave)
    const request = await workflowExecutionService.submitRequest(
        employee_id,
        user_id,
        1,
        requestData
    );

    // Create daily attendance entries for each date
    await createDailyAttendanceEntries({
        request_id: request.id,
        workflow_master_id: 1,  // Leave
        employee_id: employee_id,
        company_id: employee.company_id,
        dates: leaveDates,
        is_date_range: isDateRangeMode,
        from_date: requestData.from_date,
        to_date: requestData.to_date,
        specific_dates: requestData.specific_dates,
        pay_day: requestData.is_paid ? 1 : 4,  // 1=Full Day Paid, 4=Unpaid
        status: 'pending'
    });

    return {
        request,
        leave_mode: requestData.leave_mode,
        dates: leaveDates,
        duration: calculatedDuration
    };
};

/**
 * Handle Date Range Mode (Continuous dates)
 * @param {Object} data - Date range data
 * @returns {Object} Processed request data
 */
const handleDateRangeMode = (data) => {
    const { from_date, to_date, duration, leave_type, reason, is_paid, attachment } = data;

    // Validate dates
    if (moment(to_date).isBefore(from_date)) {
        throw new Error('to_date cannot be before from_date');
    }

    // Validate date format
    if (!moment(from_date, 'YYYY-MM-DD', true).isValid() || !moment(to_date, 'YYYY-MM-DD', true).isValid()) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Auto-calculate duration if not provided
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    if (!duration) {
        calculatedDuration = moment(to_date).diff(moment(from_date), 'days') + 1;
    }

    const requestData = {
        leave_type,
        leave_mode: 'date_range',
        from_date,
        to_date,
        specific_dates: null,
        duration: calculatedDuration,
        reason,
        is_paid: is_paid !== false,
        attachment: attachment || null,
        applied_at: new Date()
    };

    return {
        requestData,
        duration: calculatedDuration,
        dates: [from_date, to_date]
    };
};

/**
 * Handle Multiple Dates Mode (Specific non-continuous dates)
 * @param {Object} data - Multiple dates data
 * @returns {Object} Processed request data
 */
const handleMultipleDatesMode = (data) => {
    const { specific_dates, duration, leave_type, reason, is_paid, attachment } = data;

    // Validate dates array
    if (specific_dates.length === 0) {
        throw new Error('specific_dates array cannot be empty');
    }

    // Validate each date format
    const invalidDates = specific_dates.filter(date => !moment(date, 'YYYY-MM-DD', true).isValid());
    if (invalidDates.length > 0) {
        throw new Error(`Invalid date format in specific_dates: ${invalidDates.join(', ')}. Use YYYY-MM-DD format.`);
    }

    // Sort dates in ascending order
    const sortedDates = specific_dates.sort((a, b) => moment(a).diff(moment(b)));

    // Remove duplicate dates
    const uniqueDates = [...new Set(sortedDates)];

    // Check for past dates
    const today = moment().startOf('day');
    const pastDates = uniqueDates.filter(date => moment(date).isBefore(today));
    if (pastDates.length > 0) {
        throw new Error(`Cannot apply leave for past dates: ${pastDates.join(', ')}`);
    }

    // Auto-calculate duration if not provided (count of dates)
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    if (!duration) {
        calculatedDuration = uniqueDates.length;
    }

    const requestData = {
        leave_type,
        leave_mode: 'multiple_dates',
        from_date: uniqueDates[0],  // First date for reference
        to_date: uniqueDates[uniqueDates.length - 1],  // Last date for reference
        specific_dates: uniqueDates,
        duration: calculatedDuration,
        reason,
        is_paid: is_paid !== false,
        attachment: attachment || null,
        applied_at: new Date()
    };

    return {
        requestData,
        duration: calculatedDuration,
        dates: uniqueDates
    };
};

/**
 * Get employee's leave requests
 * @param {number} employee_id - Employee ID
 * @param {Object} filters - Filter options (type, status, limit, offset)
 * @returns {Promise<Object>} Leave requests with pagination
 */
const getEmployeeLeaveRequests = async (employee_id, filters = {}) => {
    const { type, status, limit = 20, offset = 0 } = filters;

    const where = { employee_id };

    // Filter by workflow type
    if (type) {
        const typeMap = {
            'leave': 1,
            'onduty': 2,
            'wfh': 3,
            'regularization': 4,
            'short-leave': 5
        };
        where.workflow_master_id = typeMap[type.toLowerCase()];
    }

    // Filter by status
    if (status) {
        where.request_status = status;
    }

    const requests = await HrmsWorkflowRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']],
        include: [
            {
                model: require('../../models/workflow').HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['workflow_for_name', 'workflow_code']
            }
        ]
    });

    return {
        total: requests.count,
        requests: requests.rows,
        pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(requests.count / limit)
        }
    };
};

/**
 * Get leave request details
 * @param {number} request_id - Request ID
 * @param {number} employee_id - Employee ID
 * @returns {Promise<Object>} Request details
 */
const getLeaveRequestDetails = async (request_id, employee_id) => {
    const request = await HrmsWorkflowRequest.findOne({
        where: {
            id: request_id,
            employee_id
        },
        include: [
            {
                model: require('../../models/workflow').HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['workflow_for_name', 'workflow_code']
            },
            {
                model: require('../../models/workflow').HrmsWorkflowAction,
                as: 'actions',
                order: [['action_taken_at', 'DESC']]
            }
        ]
    });

    if (!request) {
        throw new Error('Request not found');
    }

    return request;
};

/**
 * Withdraw leave request
 * @param {number} request_id - Request ID
 * @param {number} employee_id - Employee ID
 * @param {string} remarks - Withdrawal remarks
 * @returns {Promise<Object>} Updated request
 */
const withdrawLeaveRequest = async (request_id, employee_id, remarks = null) => {
    const request = await HrmsWorkflowRequest.findOne({
        where: {
            id: request_id,
            employee_id
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Check if already completed
    if (request.overall_status === 'completed') {
        throw new Error('Cannot withdraw completed request');
    }

    if (request.request_status === 'withdrawn') {
        throw new Error('Request already withdrawn');
    }

    // Update request status
    await request.update({
        request_status: 'withdrawn',
        overall_status: 'withdrawn',
        admin_remarks: remarks || 'Request withdrawn by employee'
    });

    return request;
};

/**
 * Check leave balance (placeholder - to be implemented)
 * @param {number} employee_id - Employee ID
 * @returns {Promise<Object>} Leave balance data
 */
const getLeaveBalance = async (employee_id) => {
    // TODO: Implement actual leave balance calculation
    return {
        employee_id,
        leave_balances: [
            { leave_type: 'Annual Leave', total: 15, used: 3, remaining: 12 },
            { leave_type: 'Sick Leave', total: 10, used: 2, remaining: 8 },
            { leave_type: 'Casual Leave', total: 12, used: 5, remaining: 7 }
        ]
    };
};

/**
 * Create daily attendance entries for all dates in the request
 * Creates one entry per unique date with status "pending"
 *
 * @param {Object} data - Attendance data
 * @returns {Promise<void>}
 */
const createDailyAttendanceEntries = async (data) => {
    const {
        request_id,
        workflow_master_id,
        employee_id,
        company_id,
        is_date_range,
        from_date,
        to_date,
        specific_dates,
        pay_day,
        status
    } = data;

    const datesToProcess = [];

    if (is_date_range) {
        // Generate all dates from from_date to to_date
        const currentDate = moment(from_date);
        const endDate = moment(to_date);

        while (currentDate.isSameOrBefore(endDate)) {
            datesToProcess.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
    } else {
        // Use specific dates
        datesToProcess.push(...specific_dates);
    }

    // Create attendance entry for each date
    for (const dateStr of datesToProcess) {
        await HrmsDailyAttendance.create({
            employee_id,
            company_id,
            attendance_date: dateStr,
            request_id,
            workflow_master_id,
            pay_day,
            status,  // pending
            punch_in: null,
            punch_out: null,
            punch_in_location: null,
            punch_out_location: null
        });
    }
};

module.exports = {
    applyLeave,
    getEmployeeLeaveRequests,
    getLeaveRequestDetails,
    withdrawLeaveRequest,
    getLeaveBalance
};
