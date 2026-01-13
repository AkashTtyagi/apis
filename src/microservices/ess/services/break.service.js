/**
 * ESS Break Service
 * Handles employee break operations
 */

const { HrmsBreakLog } = require('../models/HrmsBreakLog');
const { HrmsEmployee } = require('../../../models/HrmsEmployee');
const { HrmsTimezoneMaster } = require('../../../models/HrmsTimezoneMaster');
const { HrmsShiftBreakRules } = require('../../../models/HrmsShiftBreakRules');
const { HrmsDailyAttendance } = require('../../../models/HrmsDailyAttendance');
const { getEmployeeShift } = require('../../../services/roster/shiftCalculation.service');
const { sequelize } = require('../../../utils/database');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const timezoneUtil = require('../../shared/utils/timezone.util');

/**
 * Toggle Break (Start/End automatically)
 * @param {number} employee_id
 * @param {number} company_id
 * @param {object} breakData - { break_rule_id, remarks }
 */
const toggleBreak = async (employee_id, company_id, breakData = {}) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Get employee with timezone
        const employee = await HrmsEmployee.findOne({
            where: {
                id: employee_id,
                company_id: company_id,
                status: { [Op.in]: [0, 1, 2] }
            },
            attributes: ['id', 'employee_code', 'first_name', 'last_name', 'timezone_id'],
            include: [{
                model: HrmsTimezoneMaster,
                as: 'timezone',
                attributes: ['timezone_name'],
                required: false
            }],
            raw: true
        });

        if (!employee) {
            throw new Error('Employee not found or inactive');
        }

        if (!employee['timezone.timezone_name']) {
            throw new Error('Timezone not mapped for employee');
        }

        const employeeTimezone = employee['timezone.timezone_name'];
        const currentDatetime = timezoneUtil.getCurrentDateTimeInTimezone(employeeTimezone);
        const today = moment(currentDatetime).tz(employeeTimezone).format('YYYY-MM-DD');

        // 2. Check if employee has clocked in today
        const dailyAttendance = await HrmsDailyAttendance.findOne({
            where: {
                employee_id: employee_id,
                company_id: company_id,
                attendance_date: today,
                punch_in: { [Op.ne]: null },
                workflow_master_id: null
            }
        });

        if (!dailyAttendance) {
            throw new Error('You must clock in before taking a break');
        }

        if (dailyAttendance.punch_out) {
            throw new Error('You have already clocked out for the day');
        }

        // 3. Check if already on break - if yes, end it; if no, start new one
        const ongoingBreak = await HrmsBreakLog.findOne({
            where: {
                employee_id: employee_id,
                company_id: company_id,
                break_date: today,
                status: 'ongoing'
            }
        });

        if (ongoingBreak) {
            // END BREAK
            const breakStartTime = moment(ongoingBreak.break_start_time);
            const breakEndTime = moment(currentDatetime);
            const durationMinutes = breakEndTime.diff(breakStartTime, 'minutes');

            await ongoingBreak.update({
                break_end_time: currentDatetime,
                break_duration_minutes: durationMinutes,
                status: 'completed'
            }, { transaction });

            await transaction.commit();

            return {
                success: true,
                action: 'end',
                message: 'Break ended successfully',
                data: {
                    break_id: ongoingBreak.id,
                    break_start_time: timezoneUtil.formatDateTimeInTimezone(ongoingBreak.break_start_time, employeeTimezone),
                    break_end_time: timezoneUtil.formatDateTimeInTimezone(currentDatetime, employeeTimezone),
                    break_duration_minutes: durationMinutes,
                    status: 'completed'
                }
            };
        } else {
            // START BREAK
            let breakRule = null;
            if (breakData.break_rule_id) {
                const shiftResult = await getEmployeeShift(employee_id, today);
                if (shiftResult && shiftResult.shift) {
                    breakRule = await HrmsShiftBreakRules.findOne({
                        where: {
                            id: breakData.break_rule_id,
                            shift_id: shiftResult.shift.id,
                            is_active: 1
                        },
                        raw: true
                    });
                }
            }

            const breakLog = await HrmsBreakLog.create({
                employee_id: employee_id,
                company_id: company_id,
                break_date: today,
                shift_break_rule_id: breakRule ? breakRule.id : null,
                break_start_time: currentDatetime,
                break_end_time: null,
                break_duration_minutes: null,
                status: 'ongoing',
                remarks: breakData.remarks || null,
                created_by: employee_id
            }, { transaction });

            await transaction.commit();

            return {
                success: true,
                action: 'start',
                message: 'Break started successfully',
                data: {
                    break_id: breakLog.id,
                    break_start_time: timezoneUtil.formatDateTimeInTimezone(currentDatetime, employeeTimezone),
                    break_name: breakRule ? breakRule.break_name : 'Ad-hoc Break',
                    status: 'ongoing'
                }
            };
        }
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get Break Status
 * @param {number} employee_id
 * @param {number} company_id
 */
const getBreakStatus = async (employee_id, company_id) => {
    const employee = await HrmsEmployee.findOne({
        where: { id: employee_id, company_id: company_id },
        attributes: ['id', 'timezone_id'],
        include: [{
            model: HrmsTimezoneMaster,
            as: 'timezone',
            attributes: ['timezone_name'],
            required: false
        }],
        raw: true
    });

    if (!employee || !employee['timezone.timezone_name']) {
        throw new Error('Employee not found or timezone not mapped');
    }

    const employeeTimezone = employee['timezone.timezone_name'];
    const today = moment().tz(employeeTimezone).format('YYYY-MM-DD');

    // Check ongoing break
    const ongoingBreak = await HrmsBreakLog.findOne({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            break_date: today,
            status: 'ongoing'
        },
        raw: true
    });

    // Get today's breaks
    const todayBreaks = await HrmsBreakLog.findAll({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            break_date: today
        },
        order: [['break_start_time', 'ASC']],
        raw: true
    });

    // Calculate total break time
    const totalBreakMinutes = todayBreaks.reduce((sum, b) => {
        return sum + (b.break_duration_minutes || 0);
    }, 0);

    // Get available break rules from shift
    const shiftResult = await getEmployeeShift(employee_id, today);
    let availableBreaks = [];

    if (shiftResult && shiftResult.shift) {
        availableBreaks = await HrmsShiftBreakRules.findAll({
            where: {
                shift_id: shiftResult.shift.id,
                is_active: 1
            },
            order: [['break_order', 'ASC']],
            attributes: ['id', 'break_name', 'break_start_after_minutes', 'break_duration_minutes', 'is_paid', 'is_mandatory'],
            raw: true
        });
    }

    return {
        is_on_break: !!ongoingBreak,
        ongoing_break: ongoingBreak ? {
            break_id: ongoingBreak.id,
            break_start_time: timezoneUtil.formatDateTimeInTimezone(ongoingBreak.break_start_time, employeeTimezone),
            duration_so_far: moment().diff(moment(ongoingBreak.break_start_time), 'minutes')
        } : null,
        today_breaks: todayBreaks.map(b => ({
            break_id: b.id,
            break_start_time: timezoneUtil.formatDateTimeInTimezone(b.break_start_time, employeeTimezone),
            break_end_time: b.break_end_time ? timezoneUtil.formatDateTimeInTimezone(b.break_end_time, employeeTimezone) : null,
            duration_minutes: b.break_duration_minutes,
            status: b.status
        })),
        total_break_minutes: totalBreakMinutes,
        available_breaks: availableBreaks
    };
};

/**
 * Get Break History
 * @param {number} employee_id
 * @param {number} company_id
 * @param {object} filters - { from_date, to_date, limit, offset }
 */
const getBreakHistory = async (employee_id, company_id, filters = {}) => {
    const {
        from_date = moment().subtract(30, 'days').format('YYYY-MM-DD'),
        to_date = moment().format('YYYY-MM-DD'),
        limit = 50,
        offset = 0
    } = filters;

    const employee = await HrmsEmployee.findOne({
        where: { id: employee_id, company_id: company_id },
        attributes: ['id', 'timezone_id'],
        include: [{
            model: HrmsTimezoneMaster,
            as: 'timezone',
            attributes: ['timezone_name'],
            required: false
        }],
        raw: true
    });

    if (!employee || !employee['timezone.timezone_name']) {
        throw new Error('Employee not found or timezone not mapped');
    }

    const employeeTimezone = employee['timezone.timezone_name'];

    const { count, rows } = await HrmsBreakLog.findAndCountAll({
        where: {
            employee_id: employee_id,
            company_id: company_id,
            break_date: {
                [Op.between]: [from_date, to_date]
            }
        },
        order: [['break_start_time', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        raw: true
    });

    return {
        total: count,
        records: rows.map(b => ({
            break_id: b.id,
            break_date: b.break_date,
            break_start_time: timezoneUtil.formatDateTimeInTimezone(b.break_start_time, employeeTimezone),
            break_end_time: b.break_end_time ? timezoneUtil.formatDateTimeInTimezone(b.break_end_time, employeeTimezone) : null,
            duration_minutes: b.break_duration_minutes,
            status: b.status,
            remarks: b.remarks
        })),
        from_date,
        to_date
    };
};

module.exports = {
    toggleBreak,
    getBreakStatus,
    getBreakHistory
};
