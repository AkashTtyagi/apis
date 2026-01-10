/**
 * Workflow Request Controller
 * Handles end-user workflow operations
 * - Submit workflow requests
 * - Approve/Reject requests
 * - Withdraw requests
 * - View request status and history
 */

const workflowExecutionService = require('../../services/workflow/workflowExecution.service');
const { HrmsWorkflowRequest, HrmsWorkflowAction, HrmsWorkflowStageAssignment } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { Op } = require('sequelize');

/**
 * Submit new workflow request
 * POST /api/workflow/requests/submit
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const submitRequest = async (req, res) => {
    try {
        const {
            workflow_master_id,
            request_data,
            employee_id // Optional - defaults to logged-in user's employee_id
        } = req.body;

        // Get employee_id from session or body
        const employeeId = employee_id || req.user.employee_id;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID is required'
            });
        }

        if (!workflow_master_id) {
            return res.status(400).json({
                success: false,
                message: 'Workflow master ID is required'
            });
        }

        if (!request_data) {
            return res.status(400).json({
                success: false,
                message: 'Request data is required'
            });
        }

        // Submit request
        const request = await workflowExecutionService.submitRequest(
            employeeId,
            workflow_master_id,
            request_data,
            req.user.id
        );

        return res.status(201).json({
            success: true,
            message: 'Workflow request submitted successfully',
            data: request
        });

    } catch (error) {
        console.error('Error submitting workflow request:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit workflow request',
            error: error.toString()
        });
    }
};

/**
 * Get request details by ID
 * GET /api/workflow/requests/:requestId
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await workflowExecutionService.getRequestDetails(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Check access permission
        const hasAccess = await checkRequestAccess(requestId, req.user.id);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error('Error getting request details:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get request details',
            error: error.toString()
        });
    }
};

/**
 * Get my submitted requests
 * GET /api/workflow/requests/my-requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getMyRequests = async (req, res) => {
    try {
        const { status, workflow_master_id, page = 1, limit = 20 } = req.query;

        // Get employee ID from logged-in user
        const employee = await HrmsEmployee.findOne({
            where: { user_id: req.user.id }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const where = { employee_id: employee.id };

        if (status) {
            where.request_status = status;
        }

        if (workflow_master_id) {
            where.workflow_master_id = workflow_master_id;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsWorkflowRequest.findAndCountAll({
            where,
            include: [
                { association: 'workflowMaster' },
                { association: 'workflowConfig' },
                { association: 'currentStage' }
            ],
            order: [['submitted_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            success: true,
            data: {
                requests: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting my requests:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get requests',
            error: error.toString()
        });
    }
};

/**
 * Get pending approvals for logged-in user
 * GET /api/workflow/requests/pending-approvals
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getPendingApprovals = async (req, res) => {
    try {
        const { workflow_master_id, page = 1, limit = 20 } = req.query;

        const where = {
            assigned_to_user_id: req.user.id,
            assignment_status: 'pending'
        };

        const offset = (page - 1) * limit;

        const { count, rows } = await HrmsWorkflowStageAssignment.findAndCountAll({
            where,
            include: [
                {
                    association: 'request',
                    include: [
                        { association: 'workflowMaster' },
                        { association: 'workflowConfig' },
                        { association: 'currentStage' },
                        { association: 'employee' }
                    ],
                    where: workflow_master_id ? { workflow_master_id } : {}
                },
                { association: 'stage' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            success: true,
            data: {
                pendingApprovals: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error getting pending approvals:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pending approvals',
            error: error.toString()
        });
    }
};

/**
 * Approve request
 * POST /api/workflow/requests/approve
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const approveRequest = async (req, res) => {
    try {
        const { request_id, remarks, attachments } = req.body;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Get IP address
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await workflowExecutionService.handleApproval(
            request_id,
            req.user.id,
            remarks,
            attachments || [],
            { ip_address: ipAddress, user_agent: req.headers['user-agent'] }
        );

        return res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error approving request:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to approve request',
            error: error.toString()
        });
    }
};

/**
 * Reject request
 * POST /api/workflow/requests/reject
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const rejectRequest = async (req, res) => {
    try {
        const { request_id, remarks, attachments } = req.body;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        if (!remarks) {
            return res.status(400).json({
                success: false,
                message: 'Remarks are required for rejection'
            });
        }

        // Get IP address
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await workflowExecutionService.handleRejection(
            request_id,
            req.user.id,
            remarks,
            attachments || [],
            { ip_address: ipAddress, user_agent: req.headers['user-agent'] }
        );

        return res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data: result
        });

    } catch (error) {
        console.error('Error rejecting request:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject request',
            error: error.toString()
        });
    }
};

/**
 * Withdraw request
 * POST /api/workflow/requests/withdraw
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const withdrawRequest = async (req, res) => {
    try {
        const { request_id, reason } = req.body;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Check if user is the request owner
        const request = await HrmsWorkflowRequest.findByPk(request_id, {
            include: [{ association: 'employee' }]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.employee.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the request owner can withdraw the request'
            });
        }

        if (!['pending', 'in_progress'].includes(request.request_status)) {
            return res.status(400).json({
                success: false,
                message: 'Only pending or in-progress requests can be withdrawn'
            });
        }

        // Check if workflow allows withdrawal
        const workflowConfig = await request.getWorkflowConfig();
        if (!workflowConfig.allow_withdrawal) {
            return res.status(400).json({
                success: false,
                message: 'This workflow does not allow withdrawal'
            });
        }

        // Create withdrawal action
        await HrmsWorkflowAction.create({
            request_id: request_id,
            stage_id: request.current_stage_id,
            action_type: 'withdraw',
            action_by_user_id: req.user.id,
            action_by_type: 'employee',
            approver_type: 'employee',
            remarks: reason || 'Request withdrawn by employee',
            action_taken_at: new Date(),
            ip_address: req.ip || req.connection.remoteAddress
        });

        // Update request status
        await request.update({
            request_status: 'withdrawn',
            overall_status: 'withdrawn',
            completed_at: new Date()
        });

        // Update pending assignments
        await HrmsWorkflowStageAssignment.update(
            { assignment_status: 'withdrawn' },
            {
                where: {
                    request_id: request_id,
                    assignment_status: 'pending'
                }
            }
        );

        console.log(`✓ Request withdrawn: ${request.request_number}`);

        return res.status(200).json({
            success: true,
            message: 'Request withdrawn successfully',
            data: {
                request_id: request_id,
                request_number: request.request_number,
                request_status: 'withdrawn'
            }
        });

    } catch (error) {
        console.error('Error withdrawing request:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to withdraw request',
            error: error.toString()
        });
    }
};

/**
 * Get request history/audit trail
 * GET /api/workflow/requests/:requestId/history
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getRequestHistory = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Check access permission
        const hasAccess = await checkRequestAccess(requestId, req.user.id);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const actions = await HrmsWorkflowAction.findAll({
            where: { request_id: requestId },
            include: [
                { association: 'stage' },
                {
                    association: 'actionByUser',
                    include: [{ association: 'employee' }]
                }
            ],
            order: [['action_taken_at', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: actions
        });

    } catch (error) {
        console.error('Error getting request history:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get request history',
            error: error.toString()
        });
    }
};

/**
 * Get Approval List (Unified API)
 * POST /api/workflow/requests/approval-list
 *
 * Filters based on assignment_status from HrmsWorkflowStageAssignment:
 * - pending: Requests pending for the logged-in user
 * - approved: Requests approved by the logged-in user
 * - rejected: Requests rejected by the logged-in user
 * - (empty/null): All requests assigned to the logged-in user
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getApprovalList = async (req, res) => {
    try {
        const {
            assignment_status, // pending, approved, rejected (optional - if not passed, returns all)
            workflow_master_id,
            from_date,
            to_date,
            limit = 20,
            offset = 0
        } = req.body;

        const userId = req.user.id;

        // Build assignment where clause
        const assignmentWhere = {
            assigned_to_user_id: userId
        };

        // Filter by assignment_status if provided
        if (assignment_status) {
            assignmentWhere.assignment_status = assignment_status;
        }

        // Build request where clause for nested filtering
        const requestWhere = {};
        if (workflow_master_id) {
            requestWhere.workflow_master_id = workflow_master_id;
        }
        if (from_date) {
            requestWhere.submitted_at = {
                ...requestWhere.submitted_at,
                [Op.gte]: new Date(from_date)
            };
        }
        if (to_date) {
            requestWhere.submitted_at = {
                ...requestWhere.submitted_at,
                [Op.lte]: new Date(to_date + ' 23:59:59')
            };
        }

        const { count, rows } = await HrmsWorkflowStageAssignment.findAndCountAll({
            where: assignmentWhere,
            include: [
                {
                    association: 'request',
                    where: Object.keys(requestWhere).length > 0 ? requestWhere : undefined,
                    attributes: ['id', 'request_number', 'workflow_master_id', 'request_status', 'from_date', 'to_date', 'submitted_at'],
                    include: [
                        { association: 'workflowMaster', attributes: ['id', 'workflow_for_name', 'workflow_code'] },
                        {
                            association: 'employee',
                            attributes: ['id', 'first_name', 'last_name', 'employee_code']
                        }
                    ]
                }
            ],
            attributes: ['id', 'assignment_status', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error getting approval list:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get approval list',
            error: error.toString()
        });
    }
};

/**
 * Get Request Details with all approvers
 * POST /api/workflow/requests/details
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getRequestDetailsWithApprovers = async (req, res) => {
    try {
        const { request_id } = req.body;

        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: 'request_id is required'
            });
        }

        // Get request details
        const request = await HrmsWorkflowRequest.findByPk(request_id, {
            include: [
                { association: 'workflowMaster', attributes: ['id', 'workflow_for_name', 'workflow_code'] },
                { association: 'workflowConfig', attributes: ['id', 'workflow_name'] },
                { association: 'currentStage', attributes: ['id', 'stage_name', 'stage_order'] },
                {
                    association: 'employee',
                    attributes: ['id', 'first_name', 'last_name', 'employee_code', 'email']
                }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Get all stage assignments (approvers)
        const assignments = await HrmsWorkflowStageAssignment.findAll({
            where: { request_id },
            include: [
                { association: 'stage', attributes: ['id', 'stage_name', 'stage_order'] },
                {
                    association: 'assignedToUser',
                    attributes: ['id', 'email'],
                    include: [{
                        association: 'employee',
                        attributes: ['id', 'first_name', 'last_name', 'employee_code']
                    }]
                }
            ],
            order: [['created_at', 'ASC']]
        });

        // Get all actions (approval/rejection history)
        const actions = await HrmsWorkflowAction.findAll({
            where: { request_id },
            include: [
                { association: 'stage', attributes: ['id', 'stage_name', 'stage_order'] },
                {
                    association: 'actionByUser',
                    attributes: ['id', 'email'],
                    include: [{
                        association: 'employee',
                        attributes: ['id', 'first_name', 'last_name', 'employee_code']
                    }]
                }
            ],
            order: [['action_taken_at', 'ASC']]
        });

        // Format approvers list
        const approvers = assignments.map(a => ({
            assignment_id: a.id,
            stage_id: a.stage?.id,
            stage_name: a.stage?.stage_name,
            stage_order: a.stage?.stage_order,
            approver_type: a.approver_type, // RM, HR_ADMIN, HOD, etc.
            approver_id: a.assignedToUser?.id,
            approver_name: a.assignedToUser?.employee
                ? `${a.assignedToUser.employee.first_name} ${a.assignedToUser.employee.last_name}`.trim()
                : a.assignedToUser?.email,
            approver_code: a.assignedToUser?.employee?.employee_code,
            assignment_status: a.assignment_status, // pending, approved, rejected, delegated, skipped, expired
            is_delegated: a.is_delegated,
            requires_all_approval: a.requires_all_approval,
            approval_order: a.approval_order,
            assigned_at: a.assigned_at,
            action_taken_at: a.action_taken_at,
            sla_due_date: a.sla_due_date,
            is_sla_breached: a.is_sla_breached
        }));

        // Format actions list
        const actionHistory = actions.map(a => ({
            action_id: a.id,
            stage_id: a.stage?.id,
            stage_name: a.stage?.stage_name,
            action_type: a.action_type,
            action_by_type: a.action_by_type, // employee, approver, system, admin
            action_by_id: a.actionByUser?.id || null,
            action_by_name: a.action_by_type === 'system'
                ? 'System'
                : (a.actionByUser?.employee
                    ? `${a.actionByUser.employee.first_name} ${a.actionByUser.employee.last_name}`.trim()
                    : a.actionByUser?.email || 'Unknown'),
            action_by_code: a.actionByUser?.employee?.employee_code || null,
            remarks: a.remarks,
            action_result: a.action_result,
            action_taken_at: a.action_taken_at
        }));

        return res.status(200).json({
            success: true,
            data: {
                request: {
                    id: request.id,
                    request_number: request.request_number,
                    workflow_master_id: request.workflow_master_id,
                    workflow_name: request.workflowMaster?.workflow_for_name,
                    workflow_code: request.workflowMaster?.workflow_code,
                    request_status: request.request_status,
                    overall_status: request.overall_status,
                    current_stage: request.currentStage?.stage_name,
                    from_date: request.from_date,
                    to_date: request.to_date,
                    request_data: request.request_data,
                    employee_remarks: request.employee_remarks,
                    submitted_at: request.submitted_at,
                    completed_at: request.completed_at,
                    employee: {
                        id: request.employee?.id,
                        name: `${request.employee?.first_name || ''} ${request.employee?.last_name || ''}`.trim(),
                        employee_code: request.employee?.employee_code,
                        email: request.employee?.email
                    }
                },
                approvers,
                action_history: actionHistory
            }
        });

    } catch (error) {
        console.error('Error getting request details:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get request details',
            error: error.toString()
        });
    }
};

/**
 * Get dashboard statistics
 * GET /api/workflow/requests/dashboard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getDashboard = async (req, res) => {
    try {
        // Get employee ID from logged-in user
        const employee = await HrmsEmployee.findOne({
            where: { user_id: req.user.id }
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // My requests statistics
        const myRequestsStats = await HrmsWorkflowRequest.findAll({
            where: { employee_id: employee.id },
            attributes: [
                'request_status',
                [db.fn('COUNT', db.col('id')), 'count']
            ],
            group: ['request_status'],
            raw: true
        });

        // Pending approvals count
        const pendingApprovalsCount = await HrmsWorkflowStageAssignment.count({
            where: {
                assigned_to_user_id: req.user.id,
                assignment_status: 'pending'
            }
        });

        // SLA breached count (my pending approvals)
        const slaBreachedCount = await HrmsWorkflowStageAssignment.count({
            where: {
                assigned_to_user_id: req.user.id,
                assignment_status: 'pending',
                sla_due_date: {
                    [Op.lt]: new Date()
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                myRequests: myRequestsStats,
                pendingApprovals: pendingApprovalsCount,
                slaBreached: slaBreachedCount
            }
        });

    } catch (error) {
        console.error('Error getting dashboard:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get dashboard',
            error: error.toString()
        });
    }
};

/**
 * Check if user has access to view a request
 * @param {number} requestId - Request ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if has access
 */
const checkRequestAccess = async (requestId, userId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId, {
            include: [{ association: 'employee' }]
        });

        if (!request) {
            return false;
        }

        // Request owner has access
        if (request.employee.user_id === userId) {
            return true;
        }

        // Check if user is an approver (current or past)
        const assignment = await HrmsWorkflowStageAssignment.findOne({
            where: {
                request_id: requestId,
                assigned_to_user_id: userId
            }
        });

        if (assignment) {
            return true;
        }

        // Check if user is an action taker (past approver)
        const action = await HrmsWorkflowAction.findOne({
            where: {
                request_id: requestId,
                action_by_user_id: userId
            }
        });

        if (action) {
            return true;
        }

        // TODO: Add HR admin check

        return false;

    } catch (error) {
        console.error('Error checking request access:', error);
        return false;
    }
};

module.exports = {
    submitRequest,
    getRequestById,
    getMyRequests,
    getPendingApprovals,
    getApprovalList,
    getRequestDetailsWithApprovers,
    approveRequest,
    rejectRequest,
    withdrawRequest,
    getRequestHistory,
    getDashboard
};
