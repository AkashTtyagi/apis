/**
 * Manager/Admin Attendance Request Controller
 * Manager and Admin APIs for applying attendance requests on behalf of employees
 * Thin controller - delegates to service layer
 */

const managerAttendanceRequestService = require('../../services/attendance/managerAttendanceRequest.service');

/**
 * Apply for Leave on behalf of employee
 * POST /api/attendance/manager/leave/apply
 * POST /api/attendance/admin/leave/apply
 */
const applyLeave = async (req, res) => {
    try {
        const { target_employee_id } = req.body;
        const requester_user_id = req.user.user_id;
        const requester_employee_id = req.user.employee_id;
        const requester_role = req.user.role || 'manager'; // 'manager' or 'admin'

        if (!target_employee_id) {
            return res.status(400).json({
                success: false,
                message: 'target_employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.applyLeaveOnBehalf(
            req.body,
            target_employee_id,
            requester_user_id,
            requester_employee_id,
            requester_role
        );

        return res.status(201).json({
            success: true,
            message: `Leave request submitted successfully for employee ID ${target_employee_id}`,
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
                employee_id: target_employee_id,
                leave_type: req.body.leave_type,
                leave_mode: result.leave_mode,
                dates: result.dates,
                duration: result.duration
            }
        });

    } catch (error) {
        console.error('Error applying leave:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply leave'
        });
    }
};

/**
 * Apply for On Duty on behalf of employee
 * POST /api/attendance/manager/onduty/apply
 * POST /api/attendance/admin/onduty/apply
 */
const applyOnDuty = async (req, res) => {
    try {
        const { target_employee_id } = req.body;
        const requester_user_id = req.user.user_id;
        const requester_employee_id = req.user.employee_id;
        const requester_role = req.user.role || 'manager';

        if (!target_employee_id) {
            return res.status(400).json({
                success: false,
                message: 'target_employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.applyOnDutyOnBehalf(
            req.body,
            target_employee_id,
            requester_user_id,
            requester_employee_id,
            requester_role
        );

        return res.status(201).json({
            success: true,
            message: `On Duty request submitted successfully for employee ID ${target_employee_id}`,
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
                employee_id: target_employee_id,
                on_duty_mode: result.on_duty_mode,
                dates: result.dates,
                duration: result.duration
            }
        });

    } catch (error) {
        console.error('Error applying on duty:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply on duty'
        });
    }
};

/**
 * Apply for WFH on behalf of employee
 * POST /api/attendance/manager/wfh/apply
 * POST /api/attendance/admin/wfh/apply
 */
const applyWFH = async (req, res) => {
    try {
        const { target_employee_id } = req.body;
        const requester_user_id = req.user.user_id;
        const requester_employee_id = req.user.employee_id;
        const requester_role = req.user.role || 'manager';

        if (!target_employee_id) {
            return res.status(400).json({
                success: false,
                message: 'target_employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.applyWFHOnBehalf(
            req.body,
            target_employee_id,
            requester_user_id,
            requester_employee_id,
            requester_role
        );

        return res.status(201).json({
            success: true,
            message: `WFH request submitted successfully for employee ID ${target_employee_id}`,
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
                employee_id: target_employee_id,
                wfh_mode: result.wfh_mode,
                dates: result.dates,
                duration: result.duration
            }
        });

    } catch (error) {
        console.error('Error applying WFH:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply WFH'
        });
    }
};

/**
 * Apply for Short Leave on behalf of employee
 * POST /api/attendance/manager/short-leave/apply
 * POST /api/attendance/admin/short-leave/apply
 */
const applyShortLeave = async (req, res) => {
    try {
        const { target_employee_id } = req.body;
        const requester_user_id = req.user.user_id;
        const requester_employee_id = req.user.employee_id;
        const requester_role = req.user.role || 'manager';

        if (!target_employee_id) {
            return res.status(400).json({
                success: false,
                message: 'target_employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.applyShortLeaveOnBehalf(
            req.body,
            target_employee_id,
            requester_user_id,
            requester_employee_id,
            requester_role
        );

        return res.status(201).json({
            success: true,
            message: `Short Leave request submitted successfully for employee ID ${target_employee_id}`,
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
                employee_id: target_employee_id,
                leave_date: result.leave_date,
                from_time: result.from_time,
                to_time: result.to_time,
                duration_hours: result.duration_hours
            }
        });

    } catch (error) {
        console.error('Error applying short leave:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply short leave'
        });
    }
};

/**
 * Apply for Regularization on behalf of employee
 * POST /api/attendance/manager/regularization/apply
 * POST /api/attendance/admin/regularization/apply
 */
const applyRegularization = async (req, res) => {
    try {
        const { target_employee_id } = req.body;
        const requester_user_id = req.user.user_id;
        const requester_employee_id = req.user.employee_id;
        const requester_role = req.user.role || 'manager';

        if (!target_employee_id) {
            return res.status(400).json({
                success: false,
                message: 'target_employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.applyRegularizationOnBehalf(
            req.body,
            target_employee_id,
            requester_user_id,
            requester_employee_id,
            requester_role
        );

        return res.status(201).json({
            success: true,
            message: `Regularization request submitted successfully for employee ID ${target_employee_id}`,
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
                employee_id: target_employee_id,
                attendance_date: result.attendance_date,
                punch_in: result.punch_in,
                punch_out: result.punch_out,
                working_hours: result.working_hours
            }
        });

    } catch (error) {
        console.error('Error applying regularization:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply regularization'
        });
    }
};

/**
 * Get Leave Balance for an employee
 * GET /api/attendance/manager/leave/balance/:employee_id
 * GET /api/attendance/admin/leave/balance/:employee_id
 */
const getEmployeeLeaveBalance = async (req, res) => {
    try {
        const { employee_id } = req.params;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: 'employee_id is required'
            });
        }

        // Delegate to service layer
        const result = await managerAttendanceRequestService.getEmployeeLeaveBalance(employee_id);

        return res.status(200).json({
            success: true,
            data: result,
            message: 'TODO: Implement actual leave balance calculation'
        });

    } catch (error) {
        console.error('Error getting leave balance:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get leave balance'
        });
    }
};

module.exports = {
    applyLeave,
    applyOnDuty,
    applyWFH,
    applyShortLeave,
    applyRegularization,
    getEmployeeLeaveBalance
};
