/**
 * Attendance Calendar Controller
 * Employee APIs for viewing attendance calendar with derived status
 */

const attendanceCalendarService = require('../../services/attendance/attendanceCalendar.service');
const moment = require('moment');

/**
 * Get Attendance Calendar (Common API for Employee/Manager/Admin)
 * POST /api/attendance/calendar
 * @body employee_id - Employee ID (optional - for manager/admin to view others)
 * @body from_date - Start date (YYYY-MM-DD) - default: first day of current month
 * @body to_date - End date (YYYY-MM-DD) - default: last day of current month
 */
const getAttendanceCalendar = async (req, res) => {
    try {
        // If employee_id provided in body, use it (Manager/Admin view)
        // Otherwise, use logged-in user's employee_id (Employee self-view)
        const employee_id = req.body.employee_id ? parseInt(req.body.employee_id) : req.user.employee_id;

        // Default to current month if not provided
        const from_date = req.body.from_date || moment().startOf('month').format('YYYY-MM-DD');
        const to_date = req.body.to_date || moment().endOf('month').format('YYYY-MM-DD');

        // Validate date format
        if (!moment(from_date, 'YYYY-MM-DD', true).isValid() || !moment(to_date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD format.'
            });
        }

        // Validate date range (max 3 months)
        const daysDiff = moment(to_date).diff(moment(from_date), 'days');
        if (daysDiff < 0) {
            return res.status(400).json({
                success: false,
                message: 'to_date must be after from_date'
            });
        }
        if (daysDiff > 90) {
            return res.status(400).json({
                success: false,
                message: 'Date range cannot exceed 90 days'
            });
        }

        // Delegate to service layer
        const calendar = await attendanceCalendarService.getAttendanceCalendar(
            employee_id,
            from_date,
            to_date
        );

        return res.status(200).json({
            success: true,
            data: {
                from_date,
                to_date,
                employee_id,
                calendar
            }
        });

    } catch (error) {
        console.error('Error getting attendance calendar:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get attendance calendar'
        });
    }
};

/**
 * Get Attendance Summary (Common API for Employee/Manager/Admin)
 * POST /api/attendance/calendar/summary
 * @body employee_id - Employee ID (optional - for manager/admin to view others)
 * @body from_date - Start date (YYYY-MM-DD) - default: first day of current month
 * @body to_date - End date (YYYY-MM-DD) - default: last day of current month
 */
const getAttendanceSummary = async (req, res) => {
    try {
        // If employee_id provided in body, use it (Manager/Admin view)
        // Otherwise, use logged-in user's employee_id (Employee self-view)
        const employee_id = req.body.employee_id ? parseInt(req.body.employee_id) : req.user.employee_id;

        // Default to current month if not provided
        const from_date = req.body.from_date || moment().startOf('month').format('YYYY-MM-DD');
        const to_date = req.body.to_date || moment().endOf('month').format('YYYY-MM-DD');

        // Validate date format
        if (!moment(from_date, 'YYYY-MM-DD', true).isValid() || !moment(to_date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD format.'
            });
        }

        // Validate date range
        const daysDiff = moment(to_date).diff(moment(from_date), 'days');
        if (daysDiff < 0) {
            return res.status(400).json({
                success: false,
                message: 'to_date must be after from_date'
            });
        }
        if (daysDiff > 90) {
            return res.status(400).json({
                success: false,
                message: 'Date range cannot exceed 90 days'
            });
        }

        // Delegate to service layer
        const summary = await attendanceCalendarService.getAttendanceSummary(
            employee_id,
            from_date,
            to_date
        );

        return res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error getting attendance summary:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get attendance summary'
        });
    }
};

module.exports = {
    getAttendanceCalendar,
    getAttendanceSummary
};
