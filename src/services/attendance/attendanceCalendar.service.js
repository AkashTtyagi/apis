/**
 * Attendance Calendar Service
 * Handles complex attendance derivation logic combining:
 * - Leave (L), WFH (W), On-Duty (O), Regularization (R), Short Leave (S)
 * - Actual Attendance (A) from punch logs
 *
 * Priority Order: Leave > WFH > On-Duty > Regularization > Short Leave > Attendance
 */

const { HrmsDailyAttendance } = require('../../models/HrmsDailyAttendance');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsShiftMaster } = require('../../models/HrmsShiftMaster');
const { getEmployeeShift } = require('../roster/shiftCalculation.service');
const { Op } = require('sequelize');
const moment = require('moment');

// Workflow Master IDs
const WORKFLOW_TYPES = {
    LEAVE: 1,
    ON_DUTY: 2,
    WFH: 3,
    REGULARIZATION: 4,
    SHORT_LEAVE: 5
};

// Pay Day Types
const PAY_DAY = {
    FULL_DAY: 1,
    FIRST_HALF: 2,
    SECOND_HALF: 3,
    LATE_COME: 2,
    EARLY_GO: 3,
    MID_DAY: 4
};

/**
 * Get Attendance Calendar for employee
 * @param {number} employee_id - Employee ID
 * @param {string} from_date - Start date (YYYY-MM-DD)
 * @param {string} to_date - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Attendance calendar with derived status
 */
const getAttendanceCalendar = async (employee_id, from_date, to_date) => {
    // Validate employee
    const employee = await HrmsEmployee.findByPk(employee_id);
    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get date range
    const startDate = moment(from_date);
    const endDate = moment(to_date);
    const calendar = [];

    // Get all attendance records in range
    const attendanceRecords = await HrmsDailyAttendance.findAll({
        where: {
            employee_id: employee_id,
            attendance_date: {
                [Op.between]: [from_date, to_date]
            }
        },
        order: [['attendance_date', 'ASC']]
    });

    // Group by date
    const attendanceByDate = {};
    attendanceRecords.forEach(record => {
        const dateKey = moment(record.attendance_date).format('YYYY-MM-DD');
        if (!attendanceByDate[dateKey]) {
            attendanceByDate[dateKey] = [];
        }
        attendanceByDate[dateKey].push(record);
    });

    // Process each date
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
        const dateKey = currentDate.format('YYYY-MM-DD');
        const dateRecords = attendanceByDate[dateKey] || [];

        // Get employee shift for this date
        const shiftResult = await getEmployeeShift(employee_id, dateKey);
        const shift = shiftResult?.shift;

        // Derive attendance for this date
        const derivedAttendance = await deriveAttendanceForDate(
            employee_id,
            dateKey,
            dateRecords,
            shift
        );

        calendar.push(derivedAttendance);
        currentDate.add(1, 'day');
    }

    return calendar;
};

/**
 * Derive attendance for a single date
 * Applies all combination rules from the markdown table
 */
const deriveAttendanceForDate = async (employee_id, date, records, shift) => {
    // Separate records by type
    const leave = records.filter(r => r.workflow_master_id === WORKFLOW_TYPES.LEAVE && r.status === 'approved');
    const wfh = records.filter(r => r.workflow_master_id === WORKFLOW_TYPES.WFH && r.status === 'approved');
    const onDuty = records.filter(r => r.workflow_master_id === WORKFLOW_TYPES.ON_DUTY && r.status === 'approved');
    const regularization = records.filter(r => r.workflow_master_id === WORKFLOW_TYPES.REGULARIZATION && r.status === 'approved');
    const shortLeave = records.filter(r => r.workflow_master_id === WORKFLOW_TYPES.SHORT_LEAVE && r.status === 'approved');
    const attendance = records.filter(r => !r.workflow_master_id); // Regular attendance (punch in/out)

    // Calculate actual working hours from punch logs
    let actualWorkingHours = 0;
    let punchIn = null;
    let punchOut = null;

    if (attendance.length > 0) {
        const att = attendance[0];
        punchIn = att.punch_in;
        punchOut = att.punch_out;

        if (punchIn && punchOut) {
            actualWorkingHours = moment(punchOut).diff(moment(punchIn), 'hours', true);
        }
    }

    // Check pay_day types
    const hasFullLeave = leave.some(l => l.pay_day === PAY_DAY.FULL_DAY);
    const hasHalfLeave = leave.some(l => l.pay_day === PAY_DAY.FIRST_HALF || l.pay_day === PAY_DAY.SECOND_HALF);

    const hasFullWFH = wfh.some(w => w.pay_day === PAY_DAY.FULL_DAY);
    const hasHalfWFH = wfh.some(w => w.pay_day === PAY_DAY.FIRST_HALF || w.pay_day === PAY_DAY.SECOND_HALF);

    const hasFullOD = onDuty.some(o => o.pay_day === PAY_DAY.FULL_DAY);
    const hasHalfOD = onDuty.some(o => o.pay_day === PAY_DAY.FIRST_HALF || o.pay_day === PAY_DAY.SECOND_HALF);

    const hasRegularization = regularization.length > 0;
    const hasShortLeave = shortLeave.length > 0;
    const hasAttendance = attendance.length > 0;

    // Min hours for full/half day (from shift or default)
    const minHoursFullDay = shift?.min_minutes_full_day ? shift.min_minutes_full_day / 60 : 8;
    const minHoursHalfDay = shift?.min_minutes_half_day ? shift.min_minutes_half_day / 60 : 4;

    let finalStatus = '';
    let finalWorkingHours = 0;
    let remarks = '';
    let statusType = 'absent'; // absent, present, half_day, leave, wfh, on_duty

    // Apply combination rules (Priority: Leave > WFH > On-Duty > Regularization > Short Leave > Attendance)

    // Rule 1, 6, 16, 18: Full Leave overrides everything
    if (hasFullLeave) {
        finalStatus = 'Full Day Leave';
        finalWorkingHours = 0;
        statusType = 'leave';
        remarks = 'Leave overrides all other entries';
    }
    // Rule 13: On-Duty + Leave (Full Leave wins)
    else if (hasFullOD && hasFullLeave) {
        finalStatus = 'Full Day Leave';
        finalWorkingHours = 0;
        statusType = 'leave';
        remarks = 'Leave overrides On-Duty';
    }
    // Rule 11: Full On-Duty overrides attendance
    else if (hasFullOD) {
        finalStatus = 'Full Day On-Duty';
        finalWorkingHours = 8;
        statusType = 'on_duty';
        remarks = 'On-Duty overrides punches';
    }
    // Rule 3, 7, 17: Full WFH overrides attendance/regularization
    else if (hasFullWFH) {
        finalStatus = 'Full Day WFH';
        finalWorkingHours = 8;
        statusType = 'wfh';
        remarks = hasRegularization ? 'WFH overrides regularization' : 'WFH overrides punches';
    }
    // Rule 2: Half Leave + Attendance (Combine)
    else if (hasHalfLeave && hasAttendance && actualWorkingHours >= minHoursHalfDay) {
        finalStatus = 'Half Day Leave + Half Day Present';
        finalWorkingHours = actualWorkingHours;
        statusType = 'half_day';
        remarks = 'Combine half-day leave with attendance';
    }
    // Rule 10: Half Leave + Short Leave (Leave overrides)
    else if (hasHalfLeave && hasShortLeave) {
        finalStatus = 'Half Day Leave';
        finalWorkingHours = 0;
        statusType = 'leave';
        remarks = 'Leave overrides short leave';
    }
    // Rule 4: Half WFH + Attendance (Combine)
    else if (hasHalfWFH && hasAttendance && actualWorkingHours >= minHoursHalfDay) {
        finalStatus = 'Half Day WFH + Half Day Present';
        finalWorkingHours = 8;
        statusType = 'present';
        remarks = 'Combine half-day WFH with office attendance';
    }
    // Rule 5: Half WFH + Half Leave (Combine)
    else if (hasHalfWFH && hasHalfLeave) {
        finalStatus = 'Half Day WFH + Half Day Leave';
        finalWorkingHours = 4;
        statusType = 'present';
        remarks = 'Combine WFH and Leave';
    }
    // Rule 12: Half On-Duty + Attendance (Combine)
    else if (hasHalfOD && hasAttendance && actualWorkingHours >= minHoursHalfDay) {
        finalStatus = 'Half Day On-Duty + Half Day Present';
        finalWorkingHours = 8;
        statusType = 'present';
        remarks = 'Combine half-day on-duty with attendance';
    }
    // Rule 14: Half On-Duty + Half Leave (Combine)
    else if (hasHalfOD && hasHalfLeave) {
        finalStatus = 'Half Day On-Duty + Half Day Leave';
        finalWorkingHours = 4;
        statusType = 'present';
        remarks = 'Combine on-duty and leave';
    }
    // Rule 8: Full WFH + Short Leave (WFH overrides)
    else if (hasFullWFH && hasShortLeave) {
        finalStatus = 'Full Day WFH';
        finalWorkingHours = 8;
        statusType = 'wfh';
        remarks = 'Short leave invalid with full-day WFH';
    }
    // Rule 9: Half WFH + Short Leave (Apply within half)
    else if (hasHalfWFH && hasShortLeave) {
        const shortLeaveHours = shortLeave.reduce((sum, sl) => {
            const slData = sl.request?.request_data || {};
            return sum + (slData.duration_hours || 0);
        }, 0);
        finalStatus = 'Half Day WFH (adjusted for short leave)';
        finalWorkingHours = Math.max(3, 4 - shortLeaveHours);
        statusType = 'wfh';
        remarks = 'Short leave applied within WFH half';
    }
    // Rule 15: Regularization (Approved)
    else if (hasRegularization) {
        const reg = regularization[0];
        const regData = reg.request?.request_data || {};
        finalStatus = 'Full Day Present (Regularized)';
        finalWorkingHours = regData.working_hours || 8;
        statusType = 'present';
        remarks = 'Regularization applied';
    }
    // Rule 18: Short Leave (Late Come) + Attendance
    else if (hasShortLeave && hasAttendance) {
        const shortLeaveHours = shortLeave.reduce((sum, sl) => {
            const slData = sl.request?.request_data || {};
            return sum + (slData.duration_hours || 0);
        }, 0);
        finalStatus = 'Present (with Short Leave)';
        finalWorkingHours = Math.max(0, actualWorkingHours - shortLeaveHours);
        statusType = 'present';
        remarks = 'Short leave deducted from working hours';
    }
    // Rule 19: Short Leave (Early Go) + Attendance
    // (Same as Rule 18, handled above)

    // Normal Attendance (No special cases)
    else if (hasAttendance) {
        if (actualWorkingHours >= minHoursFullDay) {
            // Rule: Full day present
            finalStatus = 'Full Day Present';
            finalWorkingHours = actualWorkingHours;
            statusType = 'present';
            remarks = 'Sufficient working hours';
        } else if (actualWorkingHours >= minHoursHalfDay) {
            // Rule 21: Half day present
            finalStatus = 'Half Day Present';
            finalWorkingHours = actualWorkingHours;
            statusType = 'half_day';
            remarks = 'Worked minimum half-day hours';
        } else if (actualWorkingHours >= 2) {
            // Rule 21: Half day absent (worked 2-4 hours)
            finalStatus = 'Half Day Absent';
            finalWorkingHours = actualWorkingHours;
            statusType = 'half_day';
            remarks = 'Insufficient hours for half day';
        } else {
            // Rule 22: Full day absent (worked < 2 hours)
            finalStatus = 'Absent';
            finalWorkingHours = actualWorkingHours;
            statusType = 'absent';
            remarks = 'Very short presence';
        }
    }
    // Rule 20: Nothing applied or punched
    else {
        finalStatus = 'Absent';
        finalWorkingHours = 0;
        statusType = 'absent';
        remarks = 'No attendance record';
    }

    return {
        date: date,
        employee_id: employee_id,
        final_status: finalStatus,
        status_type: statusType,
        working_hours: parseFloat(finalWorkingHours.toFixed(2)),
        remarks: remarks,
        punch_in: punchIn,
        punch_out: punchOut,
        actual_working_hours: parseFloat(actualWorkingHours.toFixed(2)),
        has_leave: leave.length > 0,
        has_wfh: wfh.length > 0,
        has_on_duty: onDuty.length > 0,
        has_regularization: hasRegularization,
        has_short_leave: hasShortLeave,
        shift_name: shift?.shift_name || null,
        shift_start: shift?.shift_start_time || null,
        shift_end: shift?.shift_end_time || null
    };
};

/**
 * Get attendance summary for a period
 * @param {number} employee_id - Employee ID
 * @param {string} from_date - Start date
 * @param {string} to_date - End date
 * @returns {Promise<Object>} Summary statistics
 */
const getAttendanceSummary = async (employee_id, from_date, to_date) => {
    const calendar = await getAttendanceCalendar(employee_id, from_date, to_date);

    const summary = {
        total_days: calendar.length,
        present_days: calendar.filter(d => d.status_type === 'present').length,
        half_days: calendar.filter(d => d.status_type === 'half_day').length,
        absent_days: calendar.filter(d => d.status_type === 'absent').length,
        leave_days: calendar.filter(d => d.status_type === 'leave').length,
        wfh_days: calendar.filter(d => d.status_type === 'wfh').length,
        on_duty_days: calendar.filter(d => d.status_type === 'on_duty').length,
        total_working_hours: calendar.reduce((sum, d) => sum + d.working_hours, 0).toFixed(2)
    };

    return {
        from_date,
        to_date,
        employee_id,
        summary,
        calendar
    };
};

module.exports = {
    getAttendanceCalendar,
    getAttendanceSummary,
    deriveAttendanceForDate
};
