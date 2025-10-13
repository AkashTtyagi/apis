/**
 * Employee Attendance Request Controller
 * Employee-side APIs for applying Leave, On Duty, WFH, Short Leave, and Regularization
 * Thin controller - delegates to service layer
 */

const leaveApplicationService = require('../../services/attendance/leaveApplication.service');
const workflowExecutionService = require('../../services/workflow/workflowExecution.service');
const { HrmsWorkflowRequest } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const moment = require('moment');

/**
 * Apply for Leave
 * POST /api/employee/leave/apply
 *
 * Supports two modes:
 * 1. Date Range Mode: from_date + to_date (continuous dates)
 * 2. Multiple Dates Mode: specific_dates array (non-continuous dates)
 */
const applyLeave = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const result = await leaveApplicationService.applyLeave(req.body, employee_id, user_id);

        return res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
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
 * Apply for On Duty
 * POST /api/employee/onduty/apply
 */
const applyOnDuty = async (req, res) => {
    try {
        const {
            from_date,
            to_date,
            from_time,
            to_time,
            duration,
            purpose,
            location,
            attachment
        } = req.body;

        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Validation
        if (!from_date || !to_date || !purpose || !location) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: from_date, to_date, purpose, location'
            });
        }

        // Prepare request data
        const requestData = {
            from_date,
            to_date,
            from_time: from_time || null,
            to_time: to_time || null,
            duration: parseFloat(duration) || 1,
            purpose,
            location,
            attachment: attachment || null,
            applied_at: new Date()
        };

        // Submit workflow request (workflow_master_id = 2 for On Duty)
        const request = await workflowExecutionService.submitRequest(
            employee_id,
            user_id,
            2,
            requestData
        );

        return res.status(201).json({
            success: true,
            message: 'On Duty request submitted successfully',
            data: {
                request_number: request.request_number,
                request_id: request.id,
                request_status: request.request_status,
                from_date,
                to_date,
                purpose,
                location
            }
        });

    } catch (error) {
        console.error('Error applying on duty:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to apply on duty'
        });
    }
};

/**
 * Apply for Work From Home (WFH)
 * POST /api/employee/wfh/apply
 */
const applyWFH = async (req, res) => {
    try {
        const {
            from_date,
            to_date,
            duration,
            reason,
            work_plan,
            attachment
        } = req.body;

        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Validation
        if (!from_date || !to_date || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: from_date, to_date, reason'
            });
        }

        // Prepare request data
        const requestData = {
            from_date,
            to_date,
            duration: parseFloat(duration) || 1,
            reason,
            work_plan: work_plan || null,
            attachment: attachment || null,
            applied_at: new Date()
        };

        // Submit workflow request (workflow_master_id = 3 for WFH)
        const request = await workflowExecutionService.submitRequest(
            employee_id,
            user_id,
            3,
            requestData
        );

        return res.status(201).json({
            success: true,
            message: 'WFH request submitted successfully',
            data: {
                request_number: request.request_number,
                request_id: request.id,
                request_status: request.request_status,
                from_date,
                to_date,
                duration,
                reason
            }
        });

    } catch (error) {
        console.error('Error applying WFH:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to apply WFH'
        });
    }
};

/**
 * Apply for Short Leave
 * POST /api/employee/short-leave/apply
 */
const applyShortLeave = async (req, res) => {
    try {
        const {
            leave_date,
            from_time,
            to_time,
            duration_hours,
            reason
        } = req.body;

        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Validation
        if (!leave_date || !from_time || !to_time || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: leave_date, from_time, to_time, reason'
            });
        }

        // Calculate hours
        const start = moment(from_time, 'HH:mm');
        const end = moment(to_time, 'HH:mm');
        const calculatedHours = end.diff(start, 'hours', true);

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
            user_id,
            5,
            requestData
        );

        return res.status(201).json({
            success: true,
            message: 'Short Leave request submitted successfully',
            data: {
                request_number: request.request_number,
                request_id: request.id,
                request_status: request.request_status,
                leave_date,
                from_time,
                to_time,
                duration_hours: requestData.duration_hours
            }
        });

    } catch (error) {
        console.error('Error applying short leave:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to apply short leave'
        });
    }
};

/**
 * Apply for Regularization
 * POST /api/employee/regularization/apply
 */
const applyRegularization = async (req, res) => {
    try {
        const {
            attendance_date,
            punch_in,
            punch_out,
            reason,
            attachment
        } = req.body;

        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Validation
        if (!attendance_date || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: attendance_date, reason'
            });
        }

        if (!punch_in && !punch_out) {
            return res.status(400).json({
                success: false,
                message: 'At least one of punch_in or punch_out is required'
            });
        }

        // Validate date is not future
        if (moment(attendance_date).isAfter(moment(), 'day')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot apply regularization for future dates'
            });
        }

        // Calculate working hours
        let working_hours = null;
        if (punch_in && punch_out) {
            const start = moment(punch_in);
            const end = moment(punch_out);
            working_hours = end.diff(start, 'hours', true);
        }

        // Prepare request data
        const requestData = {
            attendance_date,
            punch_in: punch_in || null,
            punch_out: punch_out || null,
            working_hours,
            reason,
            attachment: attachment || null,
            applied_at: new Date()
        };

        // Submit workflow request (workflow_master_id = 4 for Regularization)
        const request = await workflowExecutionService.submitRequest(
            employee_id,
            user_id,
            4,
            requestData
        );

        return res.status(201).json({
            success: true,
            message: 'Regularization request submitted successfully',
            data: {
                request_number: request.request_number,
                request_id: request.id,
                request_status: request.request_status,
                attendance_date,
                punch_in,
                punch_out,
                working_hours
            }
        });

    } catch (error) {
        console.error('Error applying regularization:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to apply regularization'
        });
    }
};

/**
 * Get My Requests (All Types)
 * GET /api/employee/requests/my-requests
 */
const getMyRequests = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;

        // Delegate to service layer
        const result = await leaveApplicationService.getEmployeeLeaveRequests(employee_id, req.query);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting requests:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get requests'
        });
    }
};

/**
 * Get Request Details
 * GET /api/employee/requests/:requestId
 */
const getRequestDetails = async (req, res) => {
    try {
        const { requestId } = req.params;
        const employee_id = req.user.employee_id;

        // Delegate to service layer
        const request = await leaveApplicationService.getLeaveRequestDetails(requestId, employee_id);

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error('Error getting request details:', error);
        const statusCode = error.message === 'Request not found' ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to get request details'
        });
    }
};

/**
 * Withdraw Request
 * POST /api/employee/requests/:requestId/withdraw
 */
const withdrawRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const employee_id = req.user.employee_id;
        const { remarks } = req.body;

        // Delegate to service layer
        const request = await leaveApplicationService.withdrawLeaveRequest(requestId, employee_id, remarks);

        return res.status(200).json({
            success: true,
            message: 'Request withdrawn successfully',
            data: {
                request_number: request.request_number,
                request_status: request.request_status
            }
        });

    } catch (error) {
        console.error('Error withdrawing request:', error);
        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('Cannot') || error.message.includes('already') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to withdraw request'
        });
    }
};

/**
 * Get Leave Balance
 * GET /api/employee/leave/balance
 */
const getLeaveBalance = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;

        // Delegate to service layer
        const result = await leaveApplicationService.getLeaveBalance(employee_id);

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
    getMyRequests,
    getRequestDetails,
    withdrawRequest,
    getLeaveBalance
};
