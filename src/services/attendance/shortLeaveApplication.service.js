/**
 * Short Leave Application Service
 * Business logic for short leave applications
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { getEmployeeShift } = require('../roster/shiftCalculation.service');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Apply for Short Leave
 * @param {Object} shortLeaveData - Short leave application data
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} Created short leave request
 */
const applyShortLeave = async (shortLeaveData, employee_id, user_id) => {
    const {
        leave_date,
        from_time,
        to_time,
        duration_hours,
        reason
    } = shortLeaveData;

    // Validation
    if (!leave_date || !from_time || !to_time || !reason) {
        throw new Error('Required fields: leave_date, from_time, to_time, reason');
    }

    // Validate date format
    if (!moment(leave_date, 'YYYY-MM-DD', true).isValid()) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Validate time format
    if (!moment(from_time, 'HH:mm', true).isValid()) {
        throw new Error('Invalid from_time format. Use HH:mm format (e.g., 09:00).');
    }
    if (!moment(to_time, 'HH:mm', true).isValid()) {
        throw new Error('Invalid to_time format. Use HH:mm format (e.g., 13:00).');
    }

    // Check if date is in the past
    if (moment(leave_date).isBefore(moment().startOf('day'))) {
        throw new Error('Cannot apply short leave for past dates');
    }

    // Get employee details
    const employee = await HrmsEmployee.findByPk(employee_id, { raw: true });
    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get employee's shift for the leave date (handles roster, rotating, swap, default)
    const shiftResult = await getEmployeeShift(employee_id, leave_date);

    if (!shiftResult || !shiftResult.shift) {
        throw new Error('No shift assigned for this date. Please contact HR.');
    }

    const shift = shiftResult.shift;

    // Calculate hours
    const start = moment(from_time, 'HH:mm');
    const end = moment(to_time, 'HH:mm');
    const calculatedHours = end.diff(start, 'hours', true);

    // Validate time range
    if (calculatedHours <= 0) {
        throw new Error('to_time must be after from_time');
    }

    // Validate short leave duration (typically should be less than 4 hours)
    if (calculatedHours > 4) {
        throw new Error('Short leave cannot exceed 4 hours. Please apply for regular leave instead.');
    }

    // Check for existing short leave requests on same date
    await validateMultipleShortLeaves(employee_id, leave_date, from_time, to_time, calculatedHours);

    // Prepare request data
    const requestData = {
        leave_date,
        from_time,
        to_time,
        duration_hours: duration_hours || calculatedHours,
        reason,
        applied_at: new Date()
    };

    // Submit workflow request (workflow_master_id = 5 for Short Leave)
    const request = await workflowExecutionService.submitRequest(
        employee_id,
        5,  // workflow_master_id for Short Leave
        requestData,
        user_id  // submittedBy
    );

    // Create daily attendance entry
    await createDailyAttendanceEntry({
        request_id: request.id,
        workflow_master_id: 5,  // Short Leave
        employee_id: employee_id,
        company_id: employee.company_id,
        leave_date,
        from_time,
        to_time,
        shift,
        status: 'pending'
    });

    return {
        request,
        leave_date,
        from_time,
        to_time,
        duration_hours: requestData.duration_hours
    };
};

/**
 * Validate multiple short leaves on same date
 * Allows multiple short leaves but ensures:
 * 1. No time overlap between requests
 * 2. Total duration doesn't exceed 4 hours
 * 3. Only pending/approved requests are considered (not withdrawn/rejected)
 *
 * @param {number} employee_id - Employee ID
 * @param {string} leave_date - Leave date (YYYY-MM-DD)
 * @param {string} new_from_time - New request from time (HH:mm)
 * @param {string} new_to_time - New request to time (HH:mm)
 * @param {number} new_duration_hours - New request duration in hours
 * @throws {Error} If validation fails
 */
const validateMultipleShortLeaves = async (employee_id, leave_date, new_from_time, new_to_time, new_duration_hours) => {
    // Get all existing short leave requests for same date
    // workflow_master_id = 5 for Short Leave
    const existingRequests = await HrmsWorkflowRequest.findAll({
        where: {
            employee_id: employee_id,
            workflow_master_id: 5,
            request_status: {
                [Op.in]: ['pending', 'approved']  // Only check active requests
            }
        }
    });

    if (!existingRequests || existingRequests.length === 0) {
        return; // No existing requests, validation passed
    }

    // Filter requests for same date
    const sameDateRequests = existingRequests.filter(req => {
        const requestData = req.request_data;
        return requestData && requestData.leave_date === leave_date;
    });

    if (sameDateRequests.length === 0) {
        return; // No requests on same date, validation passed
    }

    // Convert new times to moment objects
    const newStart = moment(new_from_time, 'HH:mm');
    const newEnd = moment(new_to_time, 'HH:mm');

    // Check for time overlap and calculate total duration
    let totalDuration = new_duration_hours;

    for (const existingReq of sameDateRequests) {
        const existingData = existingReq.request_data;
        const existingStart = moment(existingData.from_time, 'HH:mm');
        const existingEnd = moment(existingData.to_time, 'HH:mm');
        const existingDuration = existingData.duration_hours || 0;

        // Check for time overlap
        // Overlap occurs if:
        // - New start is between existing start and end
        // - New end is between existing start and end
        // - New request completely covers existing request
        // - Existing request completely covers new request
        const hasOverlap = (
            newStart.isBetween(existingStart, existingEnd, null, '[)') ||
            newEnd.isBetween(existingStart, existingEnd, null, '(]') ||
            (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd)) ||
            (existingStart.isSameOrBefore(newStart) && existingEnd.isSameOrAfter(newEnd))
        );

        if (hasOverlap) {
            throw new Error(
                `Time overlap detected with existing short leave request (${existingData.from_time} - ${existingData.to_time}). ` +
                `Please choose a different time slot.`
            );
        }

        // Add to total duration
        totalDuration += existingDuration;
    }

    // Check if total duration exceeds 4 hours
    if (totalDuration > 4) {
        throw new Error(
            `Total short leave duration for ${leave_date} would be ${totalDuration.toFixed(2)} hours, ` +
            `which exceeds the maximum limit of 4 hours per day. ` +
            `You already have ${(totalDuration - new_duration_hours).toFixed(2)} hours of short leave on this date.`
        );
    }
};

/**
 * Calculate pay_day based on time for short leave using employee's actual shift timings
 * @param {string} from_time - Start time (HH:mm format)
 * @param {string} to_time - End time (HH:mm format)
 * @param {Object} shift - Employee's shift object with shift_start_time, shift_end_time, first_half_duration_minutes, second_half_duration_minutes
 * @returns {number} pay_day value (2=Late Come, 3=Early Go, 4=Specific Time Mid Day)
 */
const calculatePayDayFromTime = (from_time, to_time, shift) => {
    const shortLeaveStart = moment(from_time, 'HH:mm');
    const shortLeaveEnd = moment(to_time, 'HH:mm');

    // Get shift timings
    const shiftStart = moment(shift.shift_start_time, 'HH:mm:ss');
    const shiftEnd = moment(shift.shift_end_time, 'HH:mm:ss');

    // Calculate first half end time (shift_start + first_half_duration_minutes)
    const firstHalfEnd = shiftStart.clone().add(shift.first_half_duration_minutes || 270, 'minutes');

    // Calculate second half start time (shift_end - second_half_duration_minutes)
    const secondHalfStart = shiftEnd.clone().subtract(shift.second_half_duration_minutes || 270, 'minutes');

    // Calculate tolerance (1 hour buffer for classification)
    const toleranceMinutes = 60;

    // Late Come: Short leave overlaps with shift start time (within first hour + tolerance)
    // Example: Shift starts at 09:00, short leave is 09:00-11:00 (coming late to office)
    const shiftStartWithTolerance = shiftStart.clone().add(toleranceMinutes, 'minutes');
    if (shortLeaveStart.isBetween(shiftStart, shiftStartWithTolerance, null, '[]')) {
        return 2;  // Late Come
    }

    // Early Go: Short leave overlaps with shift end time (within last 2 hours)
    // Example: Shift ends at 18:00, short leave is 16:00-18:00 (leaving early from office)
    const shiftEndWithTolerance = shiftEnd.clone().subtract(120, 'minutes'); // 2 hours before end
    if (shortLeaveEnd.isBetween(shiftEndWithTolerance, shiftEnd, null, '[]')) {
        return 3;  // Early Go
    }

    // Specific Time Mid Day: Short leave is during middle of the day (between first half end and second half start)
    // Example: Shift is 09:00-18:00, first half ends at 13:30, second half starts at 13:30
    // Short leave is 12:00-14:00 (personal work during office hours)
    if (shortLeaveStart.isSameOrAfter(firstHalfEnd.clone().subtract(toleranceMinutes, 'minutes')) &&
        shortLeaveEnd.isSameOrBefore(secondHalfStart.clone().add(toleranceMinutes, 'minutes'))) {
        return 4;  // Specific Time Mid Day
    }

    // Default to Specific Time Mid Day for any other case
    return 4;  // Specific Time Mid Day
};

/**
 * Create daily attendance entry for short leave
 * Creates one entry with status "pending"
 *
 * @param {Object} data - Attendance data
 * @returns {Promise<void>}
 */
const createDailyAttendanceEntry = async (data) => {
    const {
        request_id,
        workflow_master_id,
        employee_id,
        company_id,
        leave_date,
        from_time,
        to_time,
        shift,
        status
    } = data;

    // Calculate pay_day based on time and shift
    const pay_day = calculatePayDayFromTime(from_time, to_time, shift);

    await HrmsDailyAttendance.create({
        employee_id,
        company_id,
        attendance_date: leave_date,
        request_id,
        workflow_master_id,
        pay_day,  // 2=Late Come, 3=Early Go, 4=Specific Time Mid Day
        status,  // pending
        punch_in: null,
        punch_out: null,
        punch_in_location: null,
        punch_out_location: null
    });
};

module.exports = {
    applyShortLeave,
    calculatePayDayFromTime
};
