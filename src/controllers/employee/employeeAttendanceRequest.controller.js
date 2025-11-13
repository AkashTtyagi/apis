/**
 * Employee Attendance Request Controller
 * Employee-side APIs for applying Leave, On Duty, WFH, Short Leave, and Regularization
 * Thin controller - delegates to service layer
 */

const leaveApplicationService = require('../../services/attendance/leaveApplication.service');
const onDutyApplicationService = require('../../services/attendance/onDutyApplication.service');
const wfhApplicationService = require('../../services/attendance/wfhApplication.service');
const shortLeaveApplicationService = require('../../services/attendance/shortLeaveApplication.service');
const workflowExecutionService = require('../../services/workflow/workflowExecution.service');
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
 *
 * Supports two modes:
 * 1. Date Range Mode: from_date + to_date + from_time + to_time (same time for all dates)
 * 2. Specific Dates Mode: specific_dates array with per-date time (non-continuous dates)
 */
const applyOnDuty = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const result = await onDutyApplicationService.applyOnDuty(req.body, employee_id, user_id);

        return res.status(201).json({
            success: true,
            message: 'On Duty request submitted successfully',
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
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
 * Apply for Work From Home (WFH)
 * POST /api/employee/wfh/apply
 *
 * Supports two modes:
 * 1. Date Range Mode: from_date + to_date + day_type (same day_type for all dates)
 * 2. Specific Dates Mode: specific_dates array with per-date day_type (non-continuous dates)
 */
const applyWFH = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const result = await wfhApplicationService.applyWFH(req.body, employee_id, user_id);

        return res.status(201).json({
            success: true,
            message: 'WFH request submitted successfully',
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
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
 * Apply for Short Leave
 * POST /api/employee/short-leave/apply
 */
const applyShortLeave = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const result = await shortLeaveApplicationService.applyShortLeave(req.body, employee_id, user_id);

        return res.status(201).json({
            success: true,
            message: 'Short Leave request submitted successfully',
            data: {
                request_number: result.request.request_number,
                request_id: result.request.id,
                request_status: result.request.request_status,
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
 * POST /api/attendance/employee/requests/my-requests
 */
const getMyRequests = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;

        // Extract filters from request body
        const filters = {
            request_type: req.body.request_type, // 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave
            status: req.body.status,
            from_date: req.body.from_date,
            to_date: req.body.to_date,
            limit: req.body.limit || 20,
            offset: req.body.offset || 0
        };

        // Delegate to service layer
        const result = await leaveApplicationService.getEmployeeLeaveRequests(employee_id, filters);

        return res.status(200).json({
            success: true,
            data: result.data || result,
            pagination: result.pagination || {
                limit: filters.limit,
                offset: filters.offset,
                total: result.total || (result.data ? result.data.length : result.length)
            }
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
 * POST /api/attendance/employee/requests/details
 */
const getRequestDetails = async (req, res) => {
    try {
        const { request_id } = req.body;
        const employee_id = req.user.employee_id;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Delegate to service layer
        const request = await leaveApplicationService.getLeaveRequestDetails(request_id, employee_id);

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
 * POST /api/attendance/employee/requests/withdraw
 */
const withdrawRequest = async (req, res) => {
    try {
        const { request_id, withdrawal_reason } = req.body;
        const employee_id = req.user.employee_id;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Delegate to service layer
        const request = await leaveApplicationService.withdrawLeaveRequest(request_id, employee_id, withdrawal_reason);

        return res.status(200).json({
            success: true,
            message: 'Request withdrawn successfully',
            data: {
                request_id: request.id,
                request_number: request.request_number,
                request_status: request.request_status,
                withdrawn_date: new Date()
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
 * POST /api/attendance/employee/leave/balance
 */
const getLeaveBalance = async (req, res) => {
    try {
        const employee_id = req.user.employee_id;

        // Delegate to service layer
        const result = await leaveApplicationService.getLeaveBalance(employee_id);

        return res.status(200).json({
            success: true,
            data: result
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
