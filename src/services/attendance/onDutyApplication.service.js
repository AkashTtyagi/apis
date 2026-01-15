/**
 * On Duty Application Service
 * Business logic for on duty applications
 * Supports Date Range and Specific Dates modes
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');

/**
 * Apply for On Duty (Date Range or Specific Dates mode)
 * @param {Object} onDutyData - On duty application data
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} Created on duty request
 */
const applyOnDuty = async (onDutyData, employee_id, user_id) => {
    const {
        from_date,
        to_date,
        specific_dates,
        from_time,  // For date range mode: "09:00"
        to_time,    // For date range mode: "13:00"
        duration,
        purpose,
        location,
        attachment
    } = onDutyData;

    // Determine on duty application mode
    const isDateRangeMode = from_date && to_date;
    const isSpecificDatesMode = specific_dates && Array.isArray(specific_dates) && specific_dates.length > 0;

    // Validation - either date range OR specific dates is required
    if (!purpose || !location) {
        throw new Error('Required fields: purpose, location');
    }

    if (!isDateRangeMode && !isSpecificDatesMode) {
        throw new Error('Either provide date range (from_date, to_date) OR specific_dates array');
    }

    if (isDateRangeMode && isSpecificDatesMode) {
        throw new Error('Cannot use both date range and specific_dates. Choose one mode.');
    }

    // Get employee details
    const employee = await HrmsEmployee.findByPk(employee_id, { raw: true });
    if (!employee) {
        throw new Error('Employee not found');
    }

    let requestData;
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    let onDutyDates = [];

    // Handle Date Range Mode
    if (isDateRangeMode) {
        const rangeResult = handleDateRangeMode({
            from_date,
            to_date,
            from_time,
            to_time,
            duration,
            purpose,
            location,
            attachment
        });

        requestData = rangeResult.requestData;
        calculatedDuration = rangeResult.duration;
        onDutyDates = rangeResult.dates;
    }

    // Handle Specific Dates Mode
    if (isSpecificDatesMode) {
        const specificDatesResult = handleSpecificDatesMode({
            specific_dates,
            duration,
            purpose,
            location,
            attachment
        });

        requestData = specificDatesResult.requestData;
        calculatedDuration = specificDatesResult.duration;
        onDutyDates = specificDatesResult.dates;
    }

    // Submit workflow request (workflow_master_id = 2 for On Duty)
    const request = await workflowExecutionService.submitRequest(
        employee_id,
        2,  // workflow_master_id for On Duty
        requestData,
        user_id  // submittedBy
    );

    // Create daily attendance entries for each date
    await createDailyAttendanceEntries({
        request_id: request.id,
        workflow_master_id: 2,  // On Duty
        employee_id: employee_id,
        company_id: employee.company_id,
        dates: onDutyDates,
        is_date_range: isDateRangeMode,
        from_date: requestData.from_date,
        to_date: requestData.to_date,
        specific_dates: requestData.specific_dates,
        from_time: requestData.from_time,
        to_time: requestData.to_time,
        status: 'pending'
    });

    return {
        request,
        on_duty_mode: requestData.on_duty_mode,
        dates: onDutyDates,
        duration: calculatedDuration
    };
};

/**
 * Handle Date Range Mode (Continuous dates with same time)
 * @param {Object} data - Date range data
 * @returns {Object} Processed request data
 */
const handleDateRangeMode = (data) => {
    const { from_date, to_date, from_time, to_time, duration, purpose, location, attachment } = data;

    // Validate dates
    if (moment(to_date).isBefore(from_date)) {
        throw new Error('to_date cannot be before from_date');
    }

    // Validate date format
    if (!moment(from_date, 'YYYY-MM-DD', true).isValid() || !moment(to_date, 'YYYY-MM-DD', true).isValid()) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Validate time format if provided
    if (from_time && !moment(from_time, 'HH:mm', true).isValid()) {
        throw new Error('Invalid from_time format. Use HH:mm format (e.g., 09:00).');
    }
    if (to_time && !moment(to_time, 'HH:mm', true).isValid()) {
        throw new Error('Invalid to_time format. Use HH:mm format (e.g., 13:00).');
    }

    // Auto-calculate duration if not provided
    let calculatedDuration = duration ? parseFloat(duration) : 0;
    if (!duration) {
        const totalDays = moment(to_date).diff(moment(from_date), 'days') + 1;
        calculatedDuration = totalDays;
    }

    const requestData = {
        on_duty_mode: 'date_range',
        from_date,
        to_date,
        specific_dates: null,
        from_time: from_time || null,
        to_time: to_time || null,
        duration: calculatedDuration,
        purpose,
        location,
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
 * Handle Specific Dates Mode (Non-continuous dates with per-date time)
 * @param {Object} data - Specific dates data
 * @returns {Object} Processed request data
 *
 * specific_dates format:
 * Array of objects: [{ date: 'YYYY-MM-DD', from_time: 'HH:mm', to_time: 'HH:mm' }]
 * OR
 * Array of strings: ['YYYY-MM-DD', 'YYYY-MM-DD'] (no time specified)
 */
const handleSpecificDatesMode = (data) => {
    const { specific_dates, duration, purpose, location, attachment } = data;

    // Validate dates array
    if (specific_dates.length === 0) {
        throw new Error('specific_dates array cannot be empty');
    }

    // Normalize specific_dates to object format
    const normalizedDates = specific_dates.map(item => {
        if (typeof item === 'string') {
            // String format - no time specified
            return { date: item, from_time: null, to_time: null };
        } else if (typeof item === 'object' && item.date) {
            // Object format with date and optional time
            const fromTime = item.from_time || null;
            const toTime = item.to_time || null;

            // Validate time format if provided
            if (fromTime && !moment(fromTime, 'HH:mm', true).isValid()) {
                throw new Error(`Invalid from_time for date ${item.date}. Use HH:mm format.`);
            }
            if (toTime && !moment(toTime, 'HH:mm', true).isValid()) {
                throw new Error(`Invalid to_time for date ${item.date}. Use HH:mm format.`);
            }

            return { date: item.date, from_time: fromTime, to_time: toTime };
        } else {
            throw new Error('specific_dates must be array of strings or objects with { date, from_time, to_time }');
        }
    });

    // Validate each date format
    const invalidDates = normalizedDates.filter(item => !moment(item.date, 'YYYY-MM-DD', true).isValid());
    if (invalidDates.length > 0) {
        throw new Error(`Invalid date format in specific_dates: ${invalidDates.map(d => d.date).join(', ')}. Use YYYY-MM-DD format.`);
    }

    // Sort dates in ascending order
    const sortedDates = normalizedDates.sort((a, b) => moment(a.date).diff(moment(b.date)));

    // Remove duplicate dates (keep first occurrence)
    const uniqueDatesMap = new Map();
    sortedDates.forEach(item => {
        if (!uniqueDatesMap.has(item.date)) {
            uniqueDatesMap.set(item.date, { from_time: item.from_time, to_time: item.to_time });
        }
    });

    const uniqueDates = Array.from(uniqueDatesMap.entries()).map(([date, times]) => ({
        date,
        from_time: times.from_time,
        to_time: times.to_time
    }));

    // Check for past dates
    const today = moment().startOf('day');
    const pastDates = uniqueDates.filter(item => moment(item.date).isBefore(today));
    if (pastDates.length > 0) {
        throw new Error(`Cannot apply on duty for past dates: ${pastDates.map(d => d.date).join(', ')}`);
    }

    // Auto-calculate duration if not provided
    let calculatedDuration = duration ? parseFloat(duration) : uniqueDates.length;

    const requestData = {
        on_duty_mode: 'specific_dates',
        from_date: uniqueDates[0].date,  // First date for reference
        to_date: uniqueDates[uniqueDates.length - 1].date,  // Last date for reference
        specific_dates: uniqueDates,  // Array of { date, from_time, to_time }
        from_time: null,  // Not applicable for specific dates mode
        to_time: null,    // Not applicable for specific dates mode
        duration: calculatedDuration,
        purpose,
        location,
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
 * Calculate pay_day based on time duration
 * @param {string} from_time - Start time (HH:mm format)
 * @param {string} to_time - End time (HH:mm format)
 * @returns {number} pay_day value (1=Full Day, 2=First Half, 3=Second Half)
 */
const calculatePayDayFromTime = (from_time, to_time) => {
    // If no time specified, default to full day
    if (!from_time || !to_time) {
        return 1;  // Full Day
    }

    const start = moment(from_time, 'HH:mm');
    const end = moment(to_time, 'HH:mm');
    const durationHours = end.diff(start, 'hours', true);

    // Less than or equal to 4 hours = half day
    // More than 4 hours = full day
    if (durationHours <= 4) {
        // Determine if first half or second half based on start time
        const startHour = start.hour();

        // Before 1 PM (13:00) = First Half
        // After 1 PM = Second Half
        if (startHour < 13) {
            return 2;  // First Half
        } else {
            return 3;  // Second Half
        }
    }

    return 1;  // Full Day
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
        from_time,
        to_time,
        status
    } = data;

    const datesToProcess = [];

    if (is_date_range) {
        // Generate all dates from from_date to to_date with same time
        const currentDate = moment(from_date);
        const endDate = moment(to_date);

        // Calculate pay_day once for date range mode
        const pay_day = calculatePayDayFromTime(from_time, to_time);

        while (currentDate.isSameOrBefore(endDate)) {
            datesToProcess.push({
                date: currentDate.format('YYYY-MM-DD'),
                pay_day: pay_day
            });
            currentDate.add(1, 'day');
        }
    } else {
        // Use specific dates (each with its own time)
        datesToProcess.push(...specific_dates.map(item => {
            if (typeof item === 'string') {
                return { date: item, pay_day: 1 };  // Full day if no time
            }
            // Calculate pay_day based on time for each date
            const pay_day = calculatePayDayFromTime(item.from_time, item.to_time);
            return { date: item.date, pay_day: pay_day };
        }));
    }

    // Create attendance entry for each date
    for (const dateItem of datesToProcess) {
        await HrmsDailyAttendance.create({
            employee_id,
            company_id,
            attendance_date: dateItem.date,
            request_id,
            workflow_master_id,
            pay_day: dateItem.pay_day,  // 1=Full Day, 2=First Half, 3=Second Half
            status,  // pending
            punch_in: null,
            punch_out: null,
            punch_in_location: null,
            punch_out_location: null
        });
    }
};

module.exports = {
    applyOnDuty,
    calculatePayDayFromTime
};
