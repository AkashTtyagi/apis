/**
 * Admin Attendance Request Controller
 * Admin-side APIs for managing all types of attendance requests
 * Thin controller - delegates to service layer
 */

const adminLeaveManagementService = require('../../services/attendance/adminLeaveManagement.service');

/**
 * Get All Requests (Unified API for all types)
 * POST /api/attendance/admin/requests/list
 *
 * Body params:
 * - request_type: 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave (optional)
 * - status: pending, approved, rejected, withdrawn (optional)
 * - employee_id: filter by employee (optional)
 * - from_date, to_date: date range filter (optional)
 * - limit, offset: pagination (optional)
 */
const getAllRequests = async (req, res) => {
    try {
        const company_id = req.user.company_id;

        // Extract filters from request body
        const filters = {
            request_type: req.body.request_type, // 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave
            status: req.body.status,
            employee_id: req.body.employee_id,
            department_id: req.body.department_id,
            manager_id: req.body.manager_id,
            leave_type: req.body.leave_type,
            from_date: req.body.from_date,
            to_date: req.body.to_date,
            applied_by_role: req.body.applied_by_role,
            search: req.body.search,
            limit: req.body.limit || 50,
            offset: req.body.offset || 0,
            sort_by: req.body.sort_by,
            sort_order: req.body.sort_order
        };

        // Delegate to service layer
        const result = await adminLeaveManagementService.getAllLeaveRequests(company_id, filters);

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
        const statusCode = error.message.includes('Invalid type') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to get requests'
        });
    }
};

/**
 * Get Request Details (Any Type)
 * POST /api/attendance/admin/requests/details
 */
const getRequestDetails = async (req, res) => {
    try {
        const { request_id } = req.body;
        const company_id = req.user.company_id;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Delegate to service layer
        const request = await adminLeaveManagementService.getLeaveRequestDetails(request_id, company_id);

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
 * POST /api/attendance/admin/requests/action
 *
 * Body:
 * - request_id: number (required)
 * - action: "approve" or "reject" (required)
 * - remarks: optional remarks (required for reject)
 */
const adminActionOnRequest = async (req, res) => {
    try {
        const { request_id, action, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'action is required'
            });
        }

        // Delegate to service layer
        const result = await adminLeaveManagementService.adminActionOnRequest(
            request_id,
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
                request_id: request_id,
                request_number: result.request.request_number,
                previous_status: 'pending',
                new_status: result.request.request_status,
                approved_by: action === 'approve' ? req.user.name : undefined,
                rejected_by: action === 'reject' ? req.user.name : undefined,
                action_date: new Date(),
                remarks: remarks,
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
 * POST /api/attendance/admin/requests/dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const { from_date, to_date } = req.body;

        const dateFilter = {};
        if (from_date && to_date) {
            dateFilter.submitted_at = {
                [Op.between]: [from_date, to_date]
            };
        }

        // Get stats for each workflow type
        const stats = {};

        // workflow_master_id: 1=Leave, 2=OnDuty, 3=WFH, 4=Regularization, 5=ShortLeave
        const workflowTypes = [
            { id: 1, name: 'leave' },
            { id: 2, name: 'onduty' },
            { id: 3, name: 'wfh' },
            { id: 4, name: 'regularization' },
            { id: 5, name: 'short_leave' }
        ];

        for (const workflowType of workflowTypes) {
            const typeStats = await HrmsWorkflowRequest.findAll({
                where: {
                    company_id,
                    workflow_master_id: workflowType.id,
                    ...dateFilter
                },
                attributes: [
                    'request_status',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
                ],
                group: ['request_status'],
                raw: true
            });

            stats[workflowType.name] = formatStats(typeStats);
        }

        // Overall pending count
        const pendingCount = await HrmsWorkflowRequest.count({
            where: {
                company_id,
                request_status: 'pending',
                ...dateFilter
            }
        });

        // Total requests count
        const totalCount = await HrmsWorkflowRequest.count({
            where: {
                company_id,
                ...dateFilter
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                ...stats,
                overall: {
                    total_requests: totalCount,
                    pending_approvals: pendingCount
                }
            }
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
 * POST /api/admin/requests/bulk-approve
 *
 * Body:
 * - request_ids: array of request IDs
 * - remarks: optional remarks
 */
const bulkApprove = async (req, res) => {
    try {
        const { request_ids, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'request_ids array is required'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const requestId of request_ids) {
            try {
                const request = await HrmsWorkflowRequest.findOne({
                    where: {
                        id: requestId,
                        company_id,
                        request_status: 'pending'
                    }
                });

                if (request) {
                    const workflowType = getWorkflowTypeName(request.workflow_master_id);

                    await request.update({
                        request_status: 'approved',
                        overall_status: 'completed',
                        admin_remarks: remarks || 'Bulk approved by admin',
                        completed_at: new Date()
                    });

                    await HrmsWorkflowAction.create({
                        request_id: requestId,
                        stage_id: request.current_stage_id,
                        action_type: 'approved',
                        action_by_user_id: user_id,
                        remarks: remarks || 'Bulk approved by admin',
                        action_taken_at: new Date()
                    });

                    results.success.push({
                        request_id: requestId,
                        request_number: request.request_number,
                        workflow_type: workflowType
                    });
                } else {
                    results.failed.push({
                        request_id: requestId,
                        reason: 'Not found or not pending'
                    });
                }
            } catch (error) {
                results.failed.push({
                    request_id: requestId,
                    reason: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Approved ${results.success.length} requests, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        console.error('Error bulk approving:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to bulk approve'
        });
    }
};

/**
 * Bulk Reject Requests
 * POST /api/admin/requests/bulk-reject
 *
 * Body:
 * - request_ids: array of request IDs
 * - remarks: optional remarks
 */
const bulkReject = async (req, res) => {
    try {
        const { request_ids, remarks } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.user_id;

        if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'request_ids array is required'
            });
        }

        if (!remarks) {
            return res.status(400).json({
                success: false,
                message: 'remarks is required for rejection'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const requestId of request_ids) {
            try {
                const request = await HrmsWorkflowRequest.findOne({
                    where: {
                        id: requestId,
                        company_id,
                        request_status: 'pending'
                    }
                });

                if (request) {
                    const workflowType = getWorkflowTypeName(request.workflow_master_id);

                    await request.update({
                        request_status: 'rejected',
                        overall_status: 'rejected',
                        admin_remarks: remarks,
                        completed_at: new Date()
                    });

                    await HrmsWorkflowAction.create({
                        request_id: requestId,
                        stage_id: request.current_stage_id,
                        action_type: 'rejected',
                        action_by_user_id: user_id,
                        remarks: remarks,
                        action_taken_at: new Date()
                    });

                    results.success.push({
                        request_id: requestId,
                        request_number: request.request_number,
                        workflow_type: workflowType
                    });
                } else {
                    results.failed.push({
                        request_id: requestId,
                        reason: 'Not found or not pending'
                    });
                }
            } catch (error) {
                results.failed.push({
                    request_id: requestId,
                    reason: error.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Rejected ${results.success.length} requests, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        console.error('Error bulk rejecting:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to bulk reject'
        });
    }
};

// Helper function to get workflow type name from workflow_master_id
const getWorkflowTypeName = (workflow_master_id) => {
    const typeMap = {
        1: 'Leave',
        2: 'On Duty',
        3: 'WFH',
        4: 'Regularization',
        5: 'Short Leave'
    };
    return typeMap[workflow_master_id] || 'Request';
};

// Helper function to format stats
const formatStats = (statsArray) => {
    const formatted = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        withdrawn: 0
    };

    if (Array.isArray(statsArray)) {
        statsArray.forEach(stat => {
            formatted[stat.request_status] = parseInt(stat.count) || 0;
            formatted.total += parseInt(stat.count) || 0;
        });
    }

    return formatted;
};

module.exports = {
    getAllRequests,
    getRequestDetails,
    adminActionOnRequest,
    getDashboardStats,
    bulkApprove,
    bulkReject
};
