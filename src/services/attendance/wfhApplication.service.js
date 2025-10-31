/**
 * Work From Home (WFH) Application Service
 * Business logic for WFH applications
 * Supports Date Range and Specific Dates modes
 */

const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const workflowExecutionService = require('../workflow/workflowExecution.service');
const moment = require('moment');

/**
 * Apply for WFH (Date Range or Specific Dates mode)
 * @param {Object} wfhData - WFH application data
 * @param {number} employee_id - Employee ID
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} Created WFH request
 */
const applyWFH = async (wfhData, employee_id, user_id) => {
    const {
        from_date,
        to_date,
        specific_dates,
        day_type,  // For date range mode: 'full_day' | 'first_half' | 'second_half'
        duration,
        reason,
        work_plan,
        attachment
    } = wfhData;

    // Determine WFH application mode
    const isDateRangeMode = from_date && to_date;
    const isSpecificDatesMode = specific_dates && Array.isArray(specific_dates) && specific_dates.length > 0;

    // Validation - either date range OR specific dates is required
    if (!reason) {
        throw new Error('Required field: reason');
    }

    if (!isDateRangeMode && !isSpecificDatesMode) {
        throw new Error('Either provide date range (from_date, to_date) OR specific_dates array');
    }

    if (isDateRangeMode && isSpecificDatesMode) {
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
    let wfhDates = [];

    // Handle Date Range Mode
    if (isDateRangeMode) {
        const rangeResult = handleDateRangeMode({
            from_date,
            to_date,
            day_type: day_type || 'full_day',
            duration,
            reason,
            work_plan,
            attachment
        });

        requestData = rangeResult.requestData;
        calculatedDuration = rangeResult.duration;
        wfhDates = rangeResult.dates;
    }

    // Handle Specific Dates Mode
    if (isSpecificDatesMode) {
        const specificDatesResult = handleSpecificDatesMode({
            specific_dates,
            duration,
            reason,
            work_plan,
            attachment
        });

        requestData = specificDatesResult.requestData;
        calculatedDuration = specificDatesResult.duration;
        wfhDates = specificDatesResult.dates;
    }

    // Submit workflow request (workflow_master_id = 3 for WFH)
    const request = await workflowExecutionService.submitRequest(
        employee_id,
        user_id,
        3,
        requestData
    );

    // Create daily attendance entries for each date
    await createDailyAttendanceEntries({
        request_id: request.id,
        workflow_master_id: 3,  // WFH
        employee_id: employee_id,
        company_id: employee.company_id,
        dates: wfhDates,
        is_date_range: isDateRangeMode,
        from_date: requestData.from_date,
        to_date: requestData.to_date,
        specific_dates: requestData.specific_dates,
        day_type: requestData.day_type,
        status: 'pending'
    });

    return {
        request,
        wfh_mode: requestData.wfh_mode,
        dates: wfhDates,
        duration: calculatedDuration
    };
};

/**
 * Handle Date Range Mode (Continuous dates with same day_type)
 * @param {Object} data - Date range data
 * @returns {Object} Processed request data
 */
const handleDateRangeMode = (data) => {
    const { from_date, to_date, day_type, duration, reason, work_plan, attachment } = data;

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
        wfh_mode: 'date_range',
        from_date,
        to_date,
        specific_dates: null,
        day_type: day_type || 'full_day',
        duration: calculatedDuration,
        reason,
        work_plan: work_plan || null,
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
 * Handle Specific Dates Mode (Non-continuous dates with per-date day_type)
 * @param {Object} data - Specific dates data
 * @returns {Object} Processed request data
 *
 * specific_dates format:
 * Array of objects: [{ date: 'YYYY-MM-DD', day_type: 'full_day' | 'first_half' | 'second_half' }]
 * OR
 * Array of strings: ['YYYY-MM-DD', 'YYYY-MM-DD'] (defaults to full_day)
 */
const handleSpecificDatesMode = (data) => {
    const { specific_dates, duration, reason, work_plan, attachment } = data;

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
        throw new Error(`Cannot apply WFH for past dates: ${pastDates.map(d => d.date).join(', ')}`);
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
        wfh_mode: 'specific_dates',
        from_date: uniqueDates[0].date,  // First date for reference
        to_date: uniqueDates[uniqueDates.length - 1].date,  // Last date for reference
        specific_dates: uniqueDates,  // Array of { date, day_type }
        day_type: null,  // Not applicable for specific dates mode
        duration: calculatedDuration,
        reason,
        work_plan: work_plan || null,
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
        day_type,
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
        // Calculate pay_day based on day_type
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
            status,  // pending
            punch_in: null,
            punch_out: null,
            punch_in_location: null,
            punch_out_location: null
        });
    }
};

module.exports = {
    applyWFH
};
