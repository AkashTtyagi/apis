/**
 * Admin Leave Management Service
 * Business logic for admin-side leave management
 * Separate from employee service for different permissions and operations
 */

const { HrmsWorkflowRequest, HrmsWorkflowAction, HrmsWorkflowMaster } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Get all leave requests (unified for all workflow types)
 * @param {number} company_id - Company ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Leave requests with pagination
 */
const getAllLeaveRequests = async (company_id, filters = {}) => {
    const { type, status, employee_id, from_date, to_date, limit = 50, offset = 0 } = filters;

    const where = { company_id };

    // Filter by workflow type
    if (type) {
        const workflowTypeMap = {
            'leave': 1,
            'onduty': 2,
            'wfh': 3,
            'regularization': 4,
            'short-leave': 5
        };

        const workflow_master_id = workflowTypeMap[type.toLowerCase()];

        if (workflow_master_id) {
            where.workflow_master_id = workflow_master_id;
        } else {
            throw new Error('Invalid type. Valid values: leave, onduty, wfh, regularization, short-leave');
        }
    }

    // Filter by status
    if (status) {
        where.request_status = status;
    }

    // Filter by employee
    if (employee_id) {
        where.employee_id = employee_id;
    }

    // Filter by date range
    if (from_date && to_date) {
        where.submitted_at = {
            [Op.between]: [from_date, to_date]
        };
    }

    const requests = await HrmsWorkflowRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']],
        include: [
            {
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['id', 'first_name', 'last_name', 'employee_code', 'email']
            },
            {
                model: HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['workflow_for_name', 'workflow_code']
            }
        ]
    });

    return {
        total: requests.count,
        requests: requests.rows,
        pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total_pages: Math.ceil(requests.count / limit)
        },
        filters_applied: {
            type: type || 'all',
            status: status || 'all',
            employee_id: employee_id || 'all'
        }
    };
};

/**
 * Get leave request details
 * @param {number} request_id - Request ID
 * @param {number} company_id - Company ID
 * @returns {Promise<Object>} Request details
 */
const getLeaveRequestDetails = async (request_id, company_id) => {
    const request = await HrmsWorkflowRequest.findOne({
        where: {
            id: request_id,
            company_id
        },
        include: [
            {
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['id', 'first_name', 'last_name', 'employee_code', 'email', 'department_id', 'designation_id']
            },
            {
                model: HrmsWorkflowMaster,
                as: 'workflowMaster',
                attributes: ['workflow_for_name', 'workflow_code']
            },
            {
                model: HrmsWorkflowAction,
                as: 'actions',
                order: [['action_taken_at', 'DESC']]
            }
        ]
    });

    if (!request) {
        throw new Error('Request not found');
    }

    return request;
};

/**
 * Approve or reject leave request (Admin override)
 * @param {number} request_id - Request ID
 * @param {number} company_id - Company ID
 * @param {number} user_id - Admin user ID
 * @param {string} action - 'approve' or 'reject'
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Updated request
 */
const adminActionOnRequest = async (request_id, company_id, user_id, action, remarks = null) => {
    // Validation
    if (!action || !['approve', 'reject'].includes(action)) {
        throw new Error('action must be either "approve" or "reject"');
    }

    // Get request
    const request = await HrmsWorkflowRequest.findOne({
        where: {
            id: request_id,
            company_id
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Check if already completed
    if (request.overall_status === 'completed' || request.overall_status === 'rejected') {
        throw new Error('Request already completed');
    }

    // Get workflow type name
    const workflowType = getWorkflowTypeName(request.workflow_master_id);

    if (action === 'approve') {
        await request.update({
            request_status: 'approved',
            overall_status: 'completed',
            admin_remarks: remarks || `${workflowType} approved by admin`,
            completed_at: new Date()
        });

        // Log action
        await HrmsWorkflowAction.create({
            request_id: request_id,
            stage_id: request.current_stage_id,
            action_type: 'approved',
            action_by_user_id: user_id,
            remarks: remarks || `${workflowType} approved by admin (override)`,
            action_taken_at: new Date()
        });

        return {
            request,
            workflow_type: workflowType,
            action: 'approved'
        };

    } else {
        await request.update({
            request_status: 'rejected',
            overall_status: 'rejected',
            admin_remarks: remarks || `${workflowType} rejected by admin`,
            completed_at: new Date()
        });

        // Log action
        await HrmsWorkflowAction.create({
            request_id: request_id,
            stage_id: request.current_stage_id,
            action_type: 'rejected',
            action_by_user_id: user_id,
            remarks: remarks || `${workflowType} rejected by admin (override)`,
            action_taken_at: new Date()
        });

        return {
            request,
            workflow_type: workflowType,
            action: 'rejected'
        };
    }
};

/**
 * Get dashboard statistics for all request types
 * @param {number} company_id - Company ID
 * @param {Object} filters - Date range filters
 * @returns {Promise<Object>} Statistics by workflow type
 */
const getDashboardStats = async (company_id, filters = {}) => {
    const { from_date, to_date } = filters;

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

    return {
        ...stats,
        overall: {
            total_requests: totalCount,
            pending_approvals: pendingCount
        }
    };
};

/**
 * Bulk approve multiple requests
 * @param {Array<number>} request_ids - Array of request IDs
 * @param {number} company_id - Company ID
 * @param {number} user_id - Admin user ID
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Success and failed results
 */
const bulkApproveRequests = async (request_ids, company_id, user_id, remarks = null) => {
    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
        throw new Error('request_ids array is required');
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

    return results;
};

/**
 * Bulk reject multiple requests
 * @param {Array<number>} request_ids - Array of request IDs
 * @param {number} company_id - Company ID
 * @param {number} user_id - Admin user ID
 * @param {string} remarks - Rejection remarks (required)
 * @returns {Promise<Object>} Success and failed results
 */
const bulkRejectRequests = async (request_ids, company_id, user_id, remarks) => {
    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
        throw new Error('request_ids array is required');
    }

    if (!remarks) {
        throw new Error('remarks is required for rejection');
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

    return results;
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
    getAllLeaveRequests,
    getLeaveRequestDetails,
    adminActionOnRequest,
    getDashboardStats,
    bulkApproveRequests,
    bulkRejectRequests
};
