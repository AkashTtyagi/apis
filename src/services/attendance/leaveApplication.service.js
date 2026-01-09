/**
 * Leave Application Service
 * Business logic for leave applications
 * Supports Date Range and Multiple Dates modes
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const { HrmsLeaveMaster } = require('../../models/HrmsLeaveMaster');
const { HrmsEmployeeLeaveBalance } = require('../../models/HrmsEmployeeLeaveBalance');
const { validateLeaveRequest } = require('../../validations/attendance/leaveValidation');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');
const { Op } = require('sequelize');

/**
 * Apply for leave (Date Range or Multiple Dates mode)
 * @param {Object} leaveData - Leave application data
 * @param {number} leaveData.leave_type - Leave type ID (FK to hrms_leave_master)
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @param {string} requested_by_role - 'employee', 'manager', or 'admin'
 * @returns {Promise<Object>} Created leave request
 */
const applyLeave = async (leaveData, employee_id, user_id, requested_by_role = 'employee') => {
    const {
        leave_type,
        from_date,
        to_date,
        specific_dates,
        duration,
        reason,
        attachment,
        day_type  // 'full_day' | 'first_half' | 'second_half' (for date range mode)
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

    // Derive is_paid from leave master (NOT from user input)
    const is_paid = leaveMaster.leave_type === 'paid';

    if (!isDateRangeMode && !isMultipleDatesMode) {
        throw new Error('Either provide date range (from_date, to_date) OR specific_dates array');
    }

    if (isDateRangeMode && isMultipleDatesMode) {
        throw new Error('Cannot use both date range and specific_dates. Choose one mode.');
    }

    // Validate day_type for date range mode
    if (isDateRangeMode && day_type && !['full_day', 'first_half', 'second_half'].includes(day_type)) {
        throw new Error('day_type must be one of: full_day, first_half, second_half');
    }

    // Get employee details
    const employee = await HrmsEmployee.findByPk(employee_id);
    if (!employee) {
        throw new Error('Employee not found');
    }

    let requestData;
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    let leaveDates = [];

    // Calculate from_date for validation (use first specific_date if multiple dates mode)
    const validationFromDate = isDateRangeMode ? from_date :
                               (specific_dates && specific_dates.length > 0 ?
                                (typeof specific_dates[0] === 'string' ? specific_dates[0] : specific_dates[0].date) :
                                null);

    const validationToDate = isDateRangeMode ? to_date :
                             (specific_dates && specific_dates.length > 0 ?
                              (typeof specific_dates[specific_dates.length - 1] === 'string' ? specific_dates[specific_dates.length - 1] : specific_dates[specific_dates.length - 1].date) :
                              null);

    // Auto-calculate duration for validation if not provided
    if (!calculatedDuration && isDateRangeMode) {
        const totalDays = moment(to_date).diff(moment(from_date), 'days') + 1;
        if (day_type === 'first_half' || day_type === 'second_half') {
            calculatedDuration = totalDays * 0.5;
        } else {
            calculatedDuration = totalDays;
        }
    } else if (!calculatedDuration && isMultipleDatesMode) {
        calculatedDuration = specific_dates.reduce((total, item) => {
            const itemDayType = typeof item === 'string' ? 'full_day' : (item.day_type || 'full_day');
            return total + (itemDayType === 'first_half' || itemDayType === 'second_half' ? 0.5 : 1);
        }, 0);
    }

    // Validate leave request using HrmsLeaveMaster rules
    await validateLeaveRequest({
        leave_type: leaveMaster.leave_code,
        employee_id: employee_id,
        company_id: employee.company_id,
        from_date: validationFromDate,
        to_date: validationToDate,
        specific_dates: isMultipleDatesMode ? specific_dates : null,
        duration: calculatedDuration,
        requested_by_role: requested_by_role,
        attachment: attachment
    });

    // Handle Date Range Mode
    if (isDateRangeMode) {
        const rangeResult = handleDateRangeMode({
            from_date,
            to_date,
            duration,
            leave_type,
            reason,
            is_paid,
            attachment,
            day_type: day_type || 'full_day'  // Default to full_day
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
        1,  // workflow_master_id for Leave
        requestData,
        user_id  // submittedBy
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
        is_paid: requestData.is_paid,
        day_type: requestData.day_type,  // For date range mode
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
    const { from_date, to_date, duration, leave_type, reason, is_paid, attachment, day_type } = data;

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
        const totalDays = moment(to_date).diff(moment(from_date), 'days') + 1;

        // Calculate duration based on day_type
        if (day_type === 'first_half' || day_type === 'second_half') {
            // Half day for each date in range
            calculatedDuration = totalDays * 0.5;
        } else {
            // Full day
            calculatedDuration = totalDays;
        }
    }

    const requestData = {
        leave_type,
        leave_mode: 'date_range',
        from_date,
        to_date,
        specific_dates: null,
        duration: calculatedDuration,
        reason,
        is_paid: is_paid,
        day_type: day_type || 'full_day',  // Store day_type in request
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
 *
 * specific_dates format:
 * Array of objects: [{ date: 'YYYY-MM-DD', day_type: 'full_day' | 'first_half' | 'second_half' }]
 * OR
 * Array of strings: ['YYYY-MM-DD', 'YYYY-MM-DD'] (defaults to full_day)
 */
const handleMultipleDatesMode = (data) => {
    const { specific_dates, duration, leave_type, reason, is_paid, attachment } = data;

    // Validate dates array
    if (specific_dates.length === 0) {
        throw new Error('specific_dates array cannot be empty');
    }

    // Normalize specific_dates to object format
    const normalizedDates = specific_dates.map(item => {
        if (typeof item === 'string') {
            // String format - default to full_day
            return { date: item, day_type: 'full_day' };
        } else if (typeof item === 'object' && item.date) {
            // Object format with date and day_type
            const dayType = item.day_type || 'full_day';
            if (!['full_day', 'first_half', 'second_half'].includes(dayType)) {
                throw new Error(`Invalid day_type for date ${item.date}. Must be: full_day, first_half, second_half`);
            }
            return { date: item.date, day_type: dayType };
        } else {
            throw new Error('specific_dates must be array of strings or objects with { date, day_type }');
        }
    });

    // Validate each date format
    const invalidDates = normalizedDates.filter(item => !moment(item.date, 'YYYY-MM-DD', true).isValid());
    if (invalidDates.length > 0) {
        throw new Error(`Invalid date format in specific_dates: ${invalidDates.map(d => d.date).join(', ')}. Use YYYY-MM-DD format.`);
    }

    // Sort dates in ascending order
    const sortedDates = normalizedDates.sort((a, b) => moment(a.date).diff(moment(b.date)));

    // Remove duplicate dates (keep first occurrence with its day_type)
    const uniqueDatesMap = new Map();
    sortedDates.forEach(item => {
        if (!uniqueDatesMap.has(item.date)) {
            uniqueDatesMap.set(item.date, item.day_type);
        }
    });

    const uniqueDates = Array.from(uniqueDatesMap.entries()).map(([date, day_type]) => ({
        date,
        day_type
    }));

    // Check for past dates
    const today = moment().startOf('day');
    const pastDates = uniqueDates.filter(item => moment(item.date).isBefore(today));
    if (pastDates.length > 0) {
        throw new Error(`Cannot apply leave for past dates: ${pastDates.map(d => d.date).join(', ')}`);
    }

    // Auto-calculate duration if not provided
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    if (!duration) {
        // Calculate based on day_type of each date
        calculatedDuration = uniqueDates.reduce((total, item) => {
            if (item.day_type === 'first_half' || item.day_type === 'second_half') {
                return total + 0.5;
            }
            return total + 1;
        }, 0);
    }

    const requestData = {
        leave_type,
        leave_mode: 'multiple_dates',
        from_date: uniqueDates[0].date,  // First date for reference
        to_date: uniqueDates[uniqueDates.length - 1].date,  // Last date for reference
        specific_dates: uniqueDates,  // Array of { date, day_type }
        duration: calculatedDuration,
        reason,
        is_paid: is_paid,
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
 * Get employee's leave requests (Simple List)
 * @param {number} employee_id - Employee ID
 * @param {Object} filters - Filter options (type, status, limit, offset)
 * @returns {Promise<Object>} Leave requests with pagination
 */
const getEmployeeLeaveRequests = async (employee_id, filters = {}) => {
    const { request_type, status, from_date, to_date, limit = 20, offset = 0 } = filters;

    const where = { employee_id };

    // Filter by workflow type (request_type: 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave)
    if (request_type) {
        where.workflow_master_id = request_type;
    }

    // Filter by status
    if (status) {
        where.request_status = status;
    }

    // Filter by date range
    if (from_date && to_date) {
        where.from_date = { [Op.between]: [from_date, to_date] };
    } else if (from_date) {
        where.from_date = { [Op.gte]: from_date };
    } else if (to_date) {
        where.from_date = { [Op.lte]: to_date };
    }

    const requests = await HrmsWorkflowRequest.findAndCountAll({
        where,
        attributes: ['id', 'request_number', 'workflow_master_id', 'leave_type', 'request_status', 'from_date', 'to_date', 'submitted_at'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']],
        include: [
            {
                model: require('../../models/workflow').HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['id', 'workflow_for_name', 'workflow_code']
            },
            {
                model: HrmsLeaveMaster,
                as: 'leaveMaster',
                attributes: ['id', 'leave_code', 'leave_name'],
                required: false
            }
        ]
    });

    // Format simple response
    const formattedRequests = requests.rows.map(request => ({
        id: request.id,
        request_number: request.request_number,
        workflow_master_id: request.workflow_master_id,
        workflow_name: request.workflowMaster?.workflow_for_name,
        workflow_code: request.workflowMaster?.workflow_code,
        leave_type_id: request.leave_type,
        leave_code: request.leaveMaster?.leave_code || null,
        leave_name: request.leaveMaster?.leave_name || null,
        request_status: request.request_status,
        from_date: request.from_date,
        to_date: request.to_date,
        submitted_at: request.submitted_at
    }));

    return {
        total: requests.count,
        requests: formattedRequests,
        pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(requests.count / limit)
        }
    };
};

/**
 * Get leave request details with approvers and action history
 * @param {number} request_id - Request ID
 * @param {number} employee_id - Employee ID
 * @returns {Promise<Object>} Request details with approvers and actions
 */
const getLeaveRequestDetails = async (request_id, employee_id) => {
    const { HrmsWorkflowMaster, HrmsWorkflowAction, HrmsWorkflowStageAssignment, HrmsWorkflowStage } = require('../../models/workflow');
    const { HrmsUserDetails } = require('../../models/HrmsUserDetails');

    // Get request details
    const request = await HrmsWorkflowRequest.findOne({
        where: {
            id: request_id,
            employee_id
        },
        include: [
            {
                model: HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['id', 'workflow_for_name', 'workflow_code']
            },
            {
                model: HrmsLeaveMaster,
                as: 'leaveMaster',
                attributes: ['id', 'leave_code', 'leave_name'],
                required: false
            },
            {
                model: HrmsWorkflowStage,
                as: 'currentStage',
                attributes: ['id', 'stage_name', 'stage_order'],
                required: false
            }
        ]
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Get all stage assignments (approvers)
    const assignments = await HrmsWorkflowStageAssignment.findAll({
        where: { request_id },
        include: [
            {
                model: HrmsWorkflowStage,
                as: 'stage',
                attributes: ['id', 'stage_name', 'stage_order']
            },
            {
                model: HrmsUserDetails,
                as: 'assignedToUser',
                attributes: ['id', 'email'],
                include: [{
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                }],
                required: false
            }
        ],
        order: [['created_at', 'ASC']]
    });

    // Get all actions (approval/rejection history)
    const actions = await HrmsWorkflowAction.findAll({
        where: { request_id },
        include: [
            {
                model: HrmsWorkflowStage,
                as: 'stage',
                attributes: ['id', 'stage_name', 'stage_order']
            },
            {
                model: HrmsUserDetails,
                as: 'actionByUser',
                attributes: ['id', 'email'],
                include: [{
                    model: HrmsEmployee,
                    as: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code']
                }],
                required: false
            }
        ],
        order: [['action_taken_at', 'ASC']]
    });

    // Format approvers list
    const approvers = assignments.map(a => ({
        assignment_id: a.id,
        stage_id: a.stage?.id,
        stage_name: a.stage?.stage_name,
        stage_order: a.stage?.stage_order,
        approver_type: a.approver_type,
        approver_id: a.assignedToUser?.id,
        approver_name: a.assignedToUser?.employee
            ? `${a.assignedToUser.employee.first_name} ${a.assignedToUser.employee.last_name}`.trim()
            : a.assignedToUser?.email,
        approver_code: a.assignedToUser?.employee?.employee_code,
        assignment_status: a.assignment_status,
        is_delegated: a.is_delegated,
        assigned_at: a.assigned_at,
        action_taken_at: a.action_taken_at,
        sla_due_date: a.sla_due_date,
        is_sla_breached: a.is_sla_breached
    }));

    // Format actions list
    const actionHistory = actions.map(a => ({
        action_id: a.id,
        stage_id: a.stage?.id,
        stage_name: a.stage?.stage_name,
        action_type: a.action_type,
        action_by_type: a.action_by_type,
        action_by_id: a.actionByUser?.id || null,
        action_by_name: a.action_by_type === 'system'
            ? 'System'
            : (a.actionByUser?.employee
                ? `${a.actionByUser.employee.first_name} ${a.actionByUser.employee.last_name}`.trim()
                : a.actionByUser?.email || 'Unknown'),
        action_by_code: a.actionByUser?.employee?.employee_code || null,
        remarks: a.remarks,
        action_result: a.action_result,
        action_taken_at: a.action_taken_at
    }));

    return {
        request: {
            id: request.id,
            request_number: request.request_number,
            workflow_master_id: request.workflow_master_id,
            workflow_name: request.workflowMaster?.workflow_for_name,
            workflow_code: request.workflowMaster?.workflow_code,
            leave_type_id: request.leave_type,
            leave_code: request.leaveMaster?.leave_code,
            leave_name: request.leaveMaster?.leave_name,
            request_status: request.request_status,
            overall_status: request.overall_status,
            current_stage: request.currentStage?.stage_name || null,
            from_date: request.from_date,
            to_date: request.to_date,
            request_data: request.request_data,
            employee_remarks: request.employee_remarks,
            submitted_at: request.submitted_at,
            completed_at: request.completed_at
        },
        approvers,
        action_history: actionHistory
    };
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
 * Get leave balance for an employee
 * @param {number} employee_id - Employee ID
 * @param {number} company_id - Company ID
 * @returns {Promise<Object>} Leave balance data
 */
const getLeaveBalance = async (employee_id, company_id) => {
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1; // moment months are 0-indexed

    // Fetch leave balances for current month with leave type details
    const balances = await HrmsEmployeeLeaveBalance.findAll({
        where: {
            employee_id,
            year: currentYear,
            month: currentMonth
        },
        include: [{
            model: HrmsLeaveMaster,
            as: 'leaveType',
            attributes: ['id', 'master_id', 'leave_name', 'leave_code', 'leave_type'],
            where: {
                company_id: { [Op.in]: [0, company_id] }, // 0 = system default, company_id = company specific
                is_active: true
            },
            required: true
        }],
        order: [['leave_type_id', 'ASC']]
    });

    // Format the response (same as old hardcoded format + extra keys)
    const leave_balances = balances.map(balance => ({
        leave_type_id: balance.leave_type_id,
        master_id: balance.leaveType?.master_id || balance.leaveType?.id,
        leave_type: balance.leaveType?.leave_name || 'Unknown',
        leave_code: balance.leaveType?.leave_code || '',
        total: parseFloat(balance.opening_balance) + parseFloat(balance.total_credited) || 0,
        used: parseFloat(balance.total_debited) || 0,
        remaining: parseFloat(balance.available_balance) || 0
    }));

    return {
        employee_id,
        leave_balances
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
        is_paid,
        day_type,  // For date range mode: 'full_day' | 'first_half' | 'second_half'
        status
    } = data;

    const datesToProcess = [];

    if (is_date_range) {
        // Generate all dates from from_date to to_date with same day_type
        const currentDate = moment(from_date);
        const endDate = moment(to_date);

        while (currentDate.isSameOrBefore(endDate)) {
            datesToProcess.push({
                date: currentDate.format('YYYY-MM-DD'),
                day_type: day_type || 'full_day'
            });
            currentDate.add(1, 'day');
        }
    } else {
        // Use specific dates (each with its own day_type)
        datesToProcess.push(...specific_dates.map(item => {
            if (typeof item === 'string') {
                return { date: item, day_type: 'full_day' };
            }
            return item;  // Already { date, day_type }
        }));
    }

    // Create attendance entry for each date
    for (const dateItem of datesToProcess) {
        // Calculate pay_day based ONLY on day_type (NOT is_paid)
        // is_paid field separately indicates if it's paid or unpaid
        let pay_day;

        if (dateItem.day_type === 'first_half') {
            pay_day = 2;  // First Half
        } else if (dateItem.day_type === 'second_half') {
            pay_day = 3;  // Second Half
        } else {
            pay_day = 1;  // Full Day (default)
        }

        await HrmsDailyAttendance.create({
            employee_id,
            company_id,
            attendance_date: dateItem.date,
            request_id,
            workflow_master_id,
            pay_day,  // 1=Full Day, 2=First Half, 3=Second Half
            is_paid,  // true/false - derived from leave master
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
