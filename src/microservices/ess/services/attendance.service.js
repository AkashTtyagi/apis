/**
 * ESS Attendance Service
 * Handles employee clock in/out operations
 * Microservice: ESS (Employee Self Service)
 *
 * Clock IN/OUT Logic:
 * - Auto-detect IN/OUT based on shift configuration (using getEmployeeShift)
 * - Validate against shift timing (checkin_allowed_before_minutes, grace period)
 * - Store every punch in hrms_punch_log
 * - Update hrms_daily_attendance with first/last punch
 * - Support multiple punches (breaks, overtime)
 */

const { HrmsPunchLog } = require('../models/HrmsPunchLog');
const { HrmsDailyAttendance } = require('../../../models/HrmsDailyAttendance');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { HrmsCompany } = require('../../../models/HrmsCompany');
const { getEmployeeShift } = require('../../../services/roster/shiftCalculation.service');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const timezoneUtil = require('../../shared/utils/timezone.util');

/**
 * Handle Web Punch (Clock IN/OUT)
 * Web-based punch - no location validation
 *
 * @param {number} employee_id - Employee ID
 * @param {number} company_id - Company ID
 * @param {object} punchData - Punch data from request
 * @returns {object} Punch result with action (in/out)
 */
const handleWebPunch = async (employee_id, company_id, punchData = {}) => {
    return handlePunch(employee_id, company_id, { ...punchData, punch_source: 'web' });
};

/**
 * Handle Mobile Punch (Clock IN/OUT)
 * Mobile-based punch - with location validation
 *
 * @param {number} employee_id - Employee ID
 * @param {number} company_id - Company ID
 * @param {object} punchData - Punch data from request (must include location)
 * @returns {object} Punch result with action (in/out)
 */
const handleMobilePunch = async (employee_id, company_id, punchData = {}) => {
    // Validate location is provided for mobile
    if (!punchData.location || !punchData.location.latitude || !punchData.location.longitude) {
        throw new Error('Location (latitude, longitude) is required for mobile punch');
    }

    return handlePunch(employee_id, company_id, { ...punchData, punch_source: 'mobile' });
};

/**
 * Handle Punch (Clock IN/OUT) - Internal function
 * Auto-detects IN/OUT based on daily attendance entry
 *
 * @param {number} employee_id - Employee ID
 * @param {number} company_id - Company ID
 * @param {object} punchData - Punch data from request
 * @returns {object} Punch result with action (in/out)
 */
const handlePunch = async (employee_id, company_id, punchData = {}) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Get employee with timezone
        const employee = await HrmsEmployee.findOne({
            where: {
                id: employee_id,
                company_id: company_id,
                is_active: true
            },
            attributes: ['id', 'employee_code', 'first_name', 'last_name', 'timezone']
        });

        if (!employee) {
            throw new Error('Employee not found or inactive');
        }

        const employeeTimezone = employee.timezone || 'Asia/Kolkata';

        // 2. Get company settings for biometric UTC
        const company = await HrmsCompany.findByPk(company_id, {
            attributes: ['id', 'biometric_utc_enabled']
        });

        // 3. Determine punch datetime
        let punchDatetime;
        let isUTCConverted = false;
        let originalUTCDatetime = null;

        if (punchData.punch_source === 'biometric' && punchData.is_utc && company?.biometric_utc_enabled) {
            // Biometric sent UTC, need to convert
            originalUTCDatetime = punchData.punch_datetime || new Date();
            punchDatetime = timezoneUtil.convertUTCToEmployeeTimezone(originalUTCDatetime, employeeTimezone);
            isUTCConverted = true;
        } else {
            // Web/Mobile or biometric already in employee TZ
            punchDatetime = timezoneUtil.getCurrentDateTimeInTimezone(employeeTimezone);
        }

        const punchDate = moment(punchDatetime).tz(employeeTimezone).format('YYYY-MM-DD');

        // 4. Get employee's shift for punch date (handles roster, rotating, swap, default)
        const shiftResult = await getEmployeeShift(employee_id, punchDate);

        if (!shiftResult || !shiftResult.shift) {
            throw new Error('No shift assigned for this date. Please contact HR.');
        }

        const shift = shiftResult.shift;

        // 5. Check if daily attendance entry exists (to determine IN/OUT)
        // No entry = IN, Entry exists = OUT
        let dailyAttendance = await HrmsDailyAttendance.findOne({
            where: {
                employee_id: employee_id,
                company_id: company_id,
                attendance_date: punchDate,
                workflow_master_id: null // Only regular attendance
            }
        });

        const action = !dailyAttendance ? 'in' : 'out';

        // 6. Validate punch timing against shift
        const validation = validatePunchTiming(
            punchDatetime,
            action,
            shift,
            employeeTimezone
        );

        if (!validation.is_allowed) {
            throw new Error(validation.message);
        }

        // 7. Check for duplicate punch (within 1 minute)
        const isDuplicate = await checkDuplicatePunch(
            employee_id,
            punchDatetime,
            1 // within 1 minute
        );

        if (isDuplicate) {
            throw new Error('Duplicate punch detected. Please wait at least 1 minute between punches.');
        }

        // 8. Create punch log entry
        const punchLog = await HrmsPunchLog.create({
            employee_id: employee_id,
            company_id: company_id,
            punch_datetime: punchDatetime,
            punch_source: punchData.punch_source || 'web',
            is_utc_converted: isUTCConverted,
            original_utc_datetime: originalUTCDatetime,
            biometric_device_id: punchData.biometric_device_id || null,
            biometric_device_name: punchData.biometric_device_name || null,
            device_id: punchData.device_id || null,
            device_name: punchData.device_name || null,
            device_info: punchData.device_info || null,
            latitude: punchData.location?.latitude || null,
            longitude: punchData.location?.longitude || null,
            location_accuracy: punchData.location?.accuracy || null,
            location_address: punchData.location?.address || null,
            ip_address: punchData.ip_address || null,
            user_agent: punchData.user_agent || null,
            timezone: employeeTimezone,
            utc_offset: timezoneUtil.getUTCOffset(employeeTimezone),
            photo_url: punchData.photo_url || null,
            photo_verified: punchData.photo_verified || false,
            is_valid: true,
            is_outside_geofence: punchData.is_outside_geofence || false,
            is_late: action === 'in' ? validation.is_late : false,
            is_early_out: action === 'out' ? validation.is_early : false,
            is_duplicate: false,
            is_manual_entry: false,
            created_by: employee_id
        }, { transaction });

        // 9. Update daily attendance
        await updateDailyAttendance(
            employee_id,
            company_id,
            punchDate,
            punchDatetime,
            action,
            punchLog.id,
            dailyAttendance,
            transaction
        );

        await transaction.commit();

        // 10. Return response
        return {
            success: true,
            action: action,
            message: `Clocked ${action} successfully${validation.is_late ? ' (Late)' : ''}${validation.is_early ? ' (Early departure)' : ''}`,
            data: {
                punch_id: punchLog.id,
                punch_datetime: timezoneUtil.formatDateTimeInTimezone(punchDatetime, employeeTimezone),
                punch_type: action,
                is_late: validation.is_late,
                is_early_out: validation.is_early,
                shift_name: shift.shift_name,
                shift_start: shift.shift_start_time,
                shift_end: shift.shift_end_time,
                shift_source: shiftResult.source,
                status: validation.is_late ? 'late' : (validation.is_early ? 'early_out' : 'on_time'),
                timezone: employeeTimezone
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Validate punch timing against shift configuration
 */
const validatePunchTiming = (punchDatetime, action, shift, timezone) => {
    const result = {
        is_allowed: true,
        is_late: false,
        is_early: false,
        message: ''
    };

    const punchTime = moment(punchDatetime).tz(timezone).format('HH:mm:ss');
    const shiftStart = shift.shift_start_time;
    const shiftEnd = shift.shift_end_time;

    if (action === 'in') {
        // Check if punch is within allowed check-in window
        const earliestAllowed = moment(shiftStart, 'HH:mm:ss')
            .subtract(shift.checkin_allowed_before_minutes || 120, 'minutes')
            .format('HH:mm:ss');

        if (punchTime < earliestAllowed) {
            result.is_allowed = false;
            result.message = `Clock-in not allowed before ${earliestAllowed}. You can clock in ${shift.checkin_allowed_before_minutes || 120} minutes before shift start.`;
            return result;
        }

        // Check if late (after shift_start + grace_time)
        const lateThreshold = moment(shiftStart, 'HH:mm:ss')
            .add(shift.grace_time_late_minutes || 0, 'minutes')
            .format('HH:mm:ss');

        if (punchTime > lateThreshold) {
            result.is_late = true;
            result.message = 'Late clock-in';
        }
    }

    if (action === 'out') {
        // Check if early out (before shift_end - grace_time)
        const earlyThreshold = moment(shiftEnd, 'HH:mm:ss')
            .subtract(shift.grace_time_early_minutes || 0, 'minutes')
            .format('HH:mm:ss');

        if (punchTime < earlyThreshold) {
            result.is_early = true;
            result.message = 'Early clock-out';
        }
    }

    return result;
};

/**
 * Check for duplicate punch within specified minutes
 */
const checkDuplicatePunch = async (employee_id, punchDatetime, withinMinutes = 1) => {
    const startTime = moment(punchDatetime).subtract(withinMinutes, 'minutes').toDate();
    const endTime = moment(punchDatetime).add(withinMinutes, 'minutes').toDate();

    const duplicate = await HrmsPunchLog.findOne({
        where: {
            employee_id: employee_id,
            punch_datetime: {
                [Op.between]: [startTime, endTime]
            },
            is_valid: true
        }
    });

    return !!duplicate;
};

/**
 * Update daily attendance record
 */
const updateDailyAttendance = async (
    employee_id,
    company_id,
    attendanceDate,
    punchDatetime,
    action,
    punchLogId,
    dailyAttendance,
    transaction
) => {
    if (action === 'in') {
        // First punch - create with punch_in
        const attendance = await HrmsDailyAttendance.create({
            employee_id: employee_id,
            company_id: company_id,
            attendance_date: attendanceDate,
            punch_in: punchDatetime,
            attendance_status: 'present',
            pay_day: 1, // Full day by default
            workflow_master_id: null,
            request_id: null
        }, { transaction });

        // Link punch log to daily attendance
        await HrmsPunchLog.update(
            { daily_attendance_id: attendance.id },
            { where: { id: punchLogId }, transaction }
        );
    }

    if (action === 'out' && dailyAttendance) {
        // Last punch - update with punch_out and calculate hours
        const totalMinutes = timezoneUtil.getMinutesDifference(dailyAttendance.punch_in, punchDatetime);
        const totalHours = (totalMinutes / 60).toFixed(2);

        await dailyAttendance.update({
            punch_out: punchDatetime,
            total_hours: totalHours,
            worked_hours: totalHours // Can be adjusted for breaks later
        }, { transaction });

        // Link punch log
        await HrmsPunchLog.update(
            { daily_attendance_id: dailyAttendance.id },
            { where: { id: punchLogId }, transaction }
        );
    }
};

/**
 * Get today's punch status
 */
const getTodayPunchStatus = async (employee_id, company_id) => {
    const employee = await HrmsEmployee.findByPk(employee_id, {
        attributes: ['timezone']
    });

    const timezone = employee?.timezone || 'Asia/Kolkata';
    const today = moment().tz(timezone).format('YYYY-MM-DD');

    // Get employee's shift for today
    const shiftResult = await getEmployeeShift(employee_id, today);

    // Check daily attendance entry to determine if clocked in
    const dailyAttendance = await HrmsDailyAttendance.findOne({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            attendance_date: today,
            workflow_master_id: null
        }
    });

    const isClockedIn = dailyAttendance && !dailyAttendance.punch_out;

    // Get all punches for today from punch log
    const punches = await HrmsPunchLog.findAll({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            is_valid: true,
            daily_attendance_id: dailyAttendance?.id || null
        },
        order: [['punch_datetime', 'ASC']],
        attributes: ['id', 'punch_datetime', 'punch_source', 'is_late', 'is_early_out']
    });

    const firstPunch = punches[0];
    const lastPunch = punches[punches.length - 1];

    return {
        date: today,
        punch_count: punches.length,
        is_clocked_in: isClockedIn,
        first_punch: dailyAttendance?.punch_in ? {
            time: timezoneUtil.formatDateTimeInTimezone(dailyAttendance.punch_in, timezone),
            is_late: firstPunch?.is_late || false
        } : null,
        last_punch: lastPunch ? {
            time: timezoneUtil.formatDateTimeInTimezone(lastPunch.punch_datetime, timezone),
            is_early_out: lastPunch.is_early_out
        } : null,
        punches: punches.map(p => ({
            id: p.id,
            time: timezoneUtil.formatDateTimeInTimezone(p.punch_datetime, timezone),
            source: p.punch_source
        })),
        next_action: !dailyAttendance ? 'in' : 'out',
        shift: shiftResult ? {
            name: shiftResult.shift?.shift_name,
            start: shiftResult.shift?.shift_start_time,
            end: shiftResult.shift?.shift_end_time,
            source: shiftResult.source
        } : null
    };
};

/**
 * Get punch history
 */
const getPunchHistory = async (employee_id, company_id, filters = {}) => {
    const {
        from_date = moment().subtract(30, 'days').format('YYYY-MM-DD'),
        to_date = moment().format('YYYY-MM-DD'),
        limit = 50,
        offset = 0
    } = filters;

    const employee = await HrmsEmployee.findByPk(employee_id, {
        attributes: ['timezone']
    });
    const timezone = employee?.timezone || 'Asia/Kolkata';

    const startDatetime = moment.tz(from_date, timezone).startOf('day').toDate();
    const endDatetime = moment.tz(to_date, timezone).endOf('day').toDate();

    const { count, rows } = await HrmsPunchLog.findAndCountAll({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            is_valid: true,
            punch_datetime: {
                [Op.between]: [startDatetime, endDatetime]
            }
        },
        order: [['punch_datetime', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
            'id', 'punch_datetime', 'punch_source', 'is_late', 'is_early_out',
            'latitude', 'longitude', 'location_address', 'photo_url', 'remarks'
        ]
    });

    return {
        total: count,
        records: rows.map(punch => ({
            ...punch.toJSON(),
            punch_datetime: timezoneUtil.formatDateTimeInTimezone(punch.punch_datetime, timezone)
        })),
        from_date,
        to_date,
        limit: parseInt(limit),
        offset: parseInt(offset)
    };
};

/**
 * Push Biometric Punch
 * Biometric device pushes punch - only saves to HrmsPunchLog
 * Does NOT update daily attendance (handled by cron)
 *
 * @param {object} biometricData - Biometric punch data from client
 * @returns {object} Success response
 */
const pushBiometricPunch = async (biometricData) => {
    try {
        const {
            biometric_device_id,
            punch_datetime,
            is_utc = false,
            device_id,
            device_name,
            company_id
        } = biometricData;

        // Validate required fields
        if (!biometric_device_id) {
            throw new Error('biometric_device_id is required');
        }
        if (!punch_datetime) {
            throw new Error('punch_datetime is required');
        }
        if (!company_id) {
            throw new Error('company_id is required');
        }

        // 1. Find employee by biometric_device_id
        const employee = await HrmsEmployee.findOne({
            where: {
                biometric_device_id: biometric_device_id,
                company_id: company_id,
                is_active: true
            },
            attributes: ['id', 'employee_code', 'first_name', 'last_name', 'timezone']
        });

        if (!employee) {
            throw new Error(`Employee not found for biometric_device_id: ${biometric_device_id}`);
        }

        const employeeTimezone = employee.timezone || 'Asia/Kolkata';

        // 2. Get company settings for UTC conversion
        const company = await HrmsCompany.findByPk(company_id, {
            attributes: ['id', 'biometric_utc_enabled']
        });

        // 3. Convert punch datetime if UTC
        let finalPunchDatetime;
        let isUTCConverted = false;
        let originalUTCDatetime = null;

        if (is_utc && company?.biometric_utc_enabled) {
            // Convert UTC to employee timezone
            originalUTCDatetime = new Date(punch_datetime);
            finalPunchDatetime = timezoneUtil.convertUTCToEmployeeTimezone(originalUTCDatetime, employeeTimezone);
            isUTCConverted = true;
        } else {
            // Already in employee timezone
            finalPunchDatetime = new Date(punch_datetime);
        }

        // 4. Check for duplicate punch (within 1 minute)
        const isDuplicate = await checkDuplicatePunch(employee.id, finalPunchDatetime, 1);

        if (isDuplicate) {
            throw new Error('Duplicate punch detected. Punch already exists within 1 minute window.');
        }

        // 5. Create punch log entry (NO daily attendance update)
        const punchLog = await HrmsPunchLog.create({
            employee_id: employee.id,
            company_id: company_id,
            punch_datetime: finalPunchDatetime,
            punch_source: 'biometric',
            is_utc_converted: isUTCConverted,
            original_utc_datetime: originalUTCDatetime,
            biometric_device_id: biometric_device_id,
            biometric_device_name: device_name || null,
            device_id: device_id || null,
            timezone: employeeTimezone,
            utc_offset: timezoneUtil.getUTCOffset(employeeTimezone),
            is_valid: true,
            is_duplicate: false,
            is_manual_entry: false,
            daily_attendance_id: null, // Will be set by cron
            created_by: employee.id
        });

        return {
            success: true,
            message: 'Biometric punch recorded successfully',
            data: {
                punch_id: punchLog.id,
                punch_datetime: timezoneUtil.formatDateTimeInTimezone(finalPunchDatetime, employeeTimezone),
                employee_id: employee.id,
                employee_code: employee.employee_code,
                employee_name: `${employee.first_name} ${employee.last_name || ''}`.trim(),
                biometric_device_id: biometric_device_id,
                is_utc_converted: isUTCConverted
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Process Punch Logs and Update Daily Attendance
 * Cron job function - processes unlinked punch logs
 * Creates/updates daily attendance based on min/max punches and shift config
 *
 * @param {object} filters - { company_id, employee_id, date_from, date_to }
 * @returns {object} Processing result
 */
const processPunchLogs = async (filters = {}) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            company_id = null,
            employee_id = null,
            date_from = moment().subtract(1, 'days').format('YYYY-MM-DD'),
            date_to = moment().format('YYYY-MM-DD')
        } = filters;

        // Build where clause
        const whereClause = {
            punch_source: 'biometric',
            is_valid: true,
            daily_attendance_id: null, // Only unprocessed punches
            punch_datetime: {
                [Op.between]: [
                    moment(date_from).startOf('day').toDate(),
                    moment(date_to).endOf('day').toDate()
                ]
            }
        };

        if (company_id) whereClause.company_id = company_id;
        if (employee_id) whereClause.employee_id = employee_id;

        // Get all unprocessed punch logs
        const punchLogs = await HrmsPunchLog.findAll({
            where: whereClause,
            order: [['employee_id', 'ASC'], ['punch_datetime', 'ASC']],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['id', 'timezone']
            }]
        });

        if (punchLogs.length === 0) {
            return {
                success: true,
                message: 'No unprocessed punches found',
                processed_count: 0
            };
        }

        // Group punches by employee and date
        const groupedPunches = {};

        for (const punch of punchLogs) {
            const employeeTimezone = punch.employee?.timezone || 'Asia/Kolkata';
            const punchDate = moment(punch.punch_datetime).tz(employeeTimezone).format('YYYY-MM-DD');
            const key = `${punch.employee_id}_${punchDate}`;

            if (!groupedPunches[key]) {
                groupedPunches[key] = {
                    employee_id: punch.employee_id,
                    company_id: punch.company_id,
                    punch_date: punchDate,
                    timezone: employeeTimezone,
                    punches: []
                };
            }

            groupedPunches[key].punches.push(punch);
        }

        let processedCount = 0;

        // Process each employee-date group
        for (const [key, group] of Object.entries(groupedPunches)) {
            const { employee_id, company_id, punch_date, timezone, punches } = group;

            // Get employee's shift for the date
            const shiftResult = await getEmployeeShift(employee_id, punch_date);

            if (!shiftResult || !shiftResult.shift) {
                console.log(`No shift found for employee ${employee_id} on ${punch_date}`);
                continue;
            }

            const shift = shiftResult.shift;

            // Find min (first punch = IN) and max (last punch = OUT) punches
            const sortedPunches = punches.sort((a, b) =>
                new Date(a.punch_datetime) - new Date(b.punch_datetime)
            );

            const firstPunch = sortedPunches[0];
            const lastPunch = sortedPunches[sortedPunches.length - 1];

            const punchInTime = firstPunch.punch_datetime;
            const punchOutTime = sortedPunches.length > 1 ? lastPunch.punch_datetime : null;

            // Validate first punch against shift
            const inValidation = validatePunchTiming(punchInTime, 'in', shift, timezone);

            let outValidation = { is_early: false };
            if (punchOutTime) {
                outValidation = validatePunchTiming(punchOutTime, 'out', shift, timezone);
            }

            // Update punch log flags
            await HrmsPunchLog.update(
                {
                    is_late: inValidation.is_late || false,
                    is_early_out: false
                },
                {
                    where: { id: firstPunch.id },
                    transaction
                }
            );

            if (punchOutTime && lastPunch.id !== firstPunch.id) {
                await HrmsPunchLog.update(
                    {
                        is_late: false,
                        is_early_out: outValidation.is_early || false
                    },
                    {
                        where: { id: lastPunch.id },
                        transaction
                    }
                );
            }

            // Check if daily attendance already exists
            let dailyAttendance = await HrmsDailyAttendance.findOne({
                where: {
                    employee_id: employee_id,
                    company_id: company_id,
                    attendance_date: punch_date,
                    workflow_master_id: null
                }
            });

            // Calculate total hours if punch out exists
            let totalHours = null;
            if (punchOutTime) {
                const totalMinutes = timezoneUtil.getMinutesDifference(punchInTime, punchOutTime);
                totalHours = (totalMinutes / 60).toFixed(2);
            }

            if (!dailyAttendance) {
                // Create new daily attendance
                dailyAttendance = await HrmsDailyAttendance.create({
                    employee_id: employee_id,
                    company_id: company_id,
                    attendance_date: punch_date,
                    punch_in: punchInTime,
                    punch_out: punchOutTime,
                    total_hours: totalHours,
                    worked_hours: totalHours,
                    attendance_status: 'present',
                    pay_day: 1,
                    workflow_master_id: null,
                    request_id: null
                }, { transaction });
            } else {
                // Update existing daily attendance
                await dailyAttendance.update({
                    punch_in: punchInTime,
                    punch_out: punchOutTime,
                    total_hours: totalHours,
                    worked_hours: totalHours,
                    attendance_status: 'present'
                }, { transaction });
            }

            // Link all punches to daily attendance
            await HrmsPunchLog.update(
                { daily_attendance_id: dailyAttendance.id },
                {
                    where: { id: punches.map(p => p.id) },
                    transaction
                }
            );

            processedCount++;
        }

        await transaction.commit();

        return {
            success: true,
            message: `Successfully processed ${processedCount} employee-date groups`,
            processed_count: processedCount,
            total_punches: punchLogs.length
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    handleWebPunch,
    handleMobilePunch,
    handlePunch, // Keep for admin use
    pushBiometricPunch,
    processPunchLogs,
    getTodayPunchStatus,
    getPunchHistory
};
