/**
 * Admin Leave Application Controller
 * Admin-side APIs for managing leave applications
 * Thin controller - delegates to service layer
 * Separate from attendance request controller for better organization
 */

const adminLeaveManagementService = require('../../services/attendance/adminLeaveManagement.service');

/**
 * Get All Leave Requests (Unified API for all types)
 * GET /api/admin/leave/requests
 */
const getAllRequests = async (req, res) => {
    try {
        const company_id = req.user.company_id;

        // Delegate to service layer
        const result = await adminLeaveManagementService.getAllLeaveRequests(company_id, req.query);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting requests:', error);
        const statusCode = error.message.includes('Invalid type') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to get requests'
        });
    }
};

/**
 * Get Request Details
 * GET /api/admin/leave/requests/:requestId
 */
const getRequestDetails = async (req, res) => {
    try {
        const { requestId } = req.params;
        const company_id = req.user.company_id;

        // Delegate to service layer
        const request = await adminLeaveManagementService.getLeaveRequestDetails(requestId, company_id);

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
 * Approve/Reject Request (Admin Override)
 * POST /api/admin/leave/requests/:requestId/action
 */
const adminActionOnRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const result = await adminLeaveManagementService.adminActionOnRequest(
            requestId,
            company_id,
            user_id,
            action,
            remarks
        );

        const message = action === 'approve' ?
            `${result.workflow_type} request approved successfully` :
            `${result.workflow_type} request rejected successfully`;

        return res.status(200).json({
            success: true,
            message: message,
            data: {
                request_number: result.request.request_number,
                request_status: result.request.request_status,
                workflow_type: result.workflow_type
            }
        });

    } catch (error) {
        console.error('Error performing admin action:', error);
        const statusCode = error.message === 'Request not found' ? 404 :
                          error.message.includes('action must be') || error.message.includes('already') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to perform action'
        });
    }
};

/**
 * Get Dashboard Statistics
 * GET /api/admin/leave/dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const company_id = req.user.company_id;

        // Delegate to service layer
        const result = await adminLeaveManagementService.getDashboardStats(company_id, req.query);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get dashboard stats'
        });
    }
};

/**
 * Bulk Approve Requests
 * POST /api/admin/leave/bulk-approve
 */
const bulkApprove = async (req, res) => {
    try {
        const { request_ids, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const results = await adminLeaveManagementService.bulkApproveRequests(
            request_ids,
            company_id,
            user_id,
            remarks
        );

        return res.status(200).json({
            success: true,
            message: `Approved ${results.success.length} requests, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        console.error('Error bulk approving:', error);
        const statusCode = error.message.includes('required') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to bulk approve'
        });
    }
};

/**
 * Bulk Reject Requests
 * POST /api/admin/leave/bulk-reject
 */
const bulkReject = async (req, res) => {
    try {
        const { request_ids, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        // Delegate to service layer
        const results = await adminLeaveManagementService.bulkRejectRequests(
            request_ids,
            company_id,
            user_id,
            remarks
        );

        return res.status(200).json({
            success: true,
            message: `Rejected ${results.success.length} requests, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        console.error('Error bulk rejecting:', error);
        const statusCode = error.message.includes('required') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to bulk reject'
        });
    }
};

module.exports = {
    getAllRequests,
    getRequestDetails,
    adminActionOnRequest,
    getDashboardStats,
    bulkApprove,
    bulkReject
};
