/**
 * Workflow Routes
 * Defines all workflow-related API endpoints
 */

const express = require('express');
const router = express.Router();

const workflowRequestController = require('../controllers/workflow/workflowRequest.controller');
const workflowConfigController = require('../controllers/workflow/workflowConfig.controller');

// Middleware
const authMiddleware = require('../middlewares/auth.middleware');
// const adminMiddleware = require('../middleware/admin.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// ==================== END-USER ROUTES (WORKFLOW REQUESTS) ====================

/**
 * Submit new workflow request
 * POST /api/workflow/requests/submit
 * Body: { workflow_master_id, request_data, employee_id }
 */
router.post('/requests/submit', workflowRequestController.submitRequest);

/**
 * Get my submitted requests
 * GET /api/workflow/requests/my-requests
 * Query params: status, workflow_master_id, page, limit
 */
router.get('/requests/my-requests', workflowRequestController.getMyRequests);

/**
 * Get pending approvals for logged-in user
 * GET /api/workflow/requests/pending-approvals
 * Query params: workflow_master_id, page, limit
 */
router.get('/requests/pending-approvals', workflowRequestController.getPendingApprovals);

/**
 * Get approval list (unified API for pending and actioned requests)
 * POST /api/workflow/requests/approval-list
 * Body: {
 *   assignment_status: 'pending' | 'approved' | 'rejected' (optional - if not passed, returns all),
 *   workflow_master_id: number (optional - 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave),
 *   from_date: 'YYYY-MM-DD' (optional),
 *   to_date: 'YYYY-MM-DD' (optional),
 *   limit: number (default 20),
 *   offset: number (default 0)
 * }
 */
router.post('/requests/approval-list', workflowRequestController.getApprovalList);

/**
 * Get dashboard statistics
 * GET /api/workflow/requests/dashboard
 */
router.get('/requests/dashboard', workflowRequestController.getDashboard);

/**
 * Get request details by ID
 * GET /api/workflow/requests/:requestId
 */
router.get('/requests/:requestId', workflowRequestController.getRequestById);

/**
 * Approve request
 * POST /api/workflow/requests/:requestId/approve
 * Body: { remarks, attachments }
 */
router.post('/requests/:requestId/approve', workflowRequestController.approveRequest);

/**
 * Reject request
 * POST /api/workflow/requests/:requestId/reject
 * Body: { remarks, attachments }
 */
router.post('/requests/:requestId/reject', workflowRequestController.rejectRequest);

/**
 * Withdraw request
 * POST /api/workflow/requests/:requestId/withdraw
 * Body: { reason }
 */
router.post('/requests/:requestId/withdraw', workflowRequestController.withdrawRequest);

/**
 * Get request history/audit trail
 * GET /api/workflow/requests/:requestId/history
 */
router.get('/requests/:requestId/history', workflowRequestController.getRequestHistory);

// ==================== ADMIN ROUTES (WORKFLOW CONFIGURATION) ====================

// Apply admin middleware to all admin routes
// router.use('/admin', adminMiddleware.checkAdmin);

/**
 * Get all workflow masters
 * GET /api/workflow/admin/masters
 * Query params: is_active
 */
router.get('/admin/masters', workflowConfigController.getWorkflowMasters);

// ---------- Workflow Config CRUD ----------

/**
 * Create new workflow configuration
 * POST /api/workflow/admin/configs
 * Body: { company_id, workflow_master_id, workflow_name, description, stages, conditions, applicability, ... }
 */
router.post('/admin/configs', workflowConfigController.createConfig);

/**
 * Get all workflow configurations
 * GET /api/workflow/admin/configs
 * Query params: company_id, workflow_master_id, is_active, is_default
 */
router.get('/admin/configs', workflowConfigController.getAllConfigs);

/**
 * Get workflow configuration by ID
 * GET /api/workflow/admin/configs/:configId
 */
router.get('/admin/configs/:configId', workflowConfigController.getConfigById);

/**
 * Update workflow configuration
 * PUT /api/workflow/admin/configs/:configId
 * Body: { workflow_name, description, is_active, ... }
 */
router.put('/admin/configs/:configId', workflowConfigController.updateConfig);

/**
 * Delete workflow configuration
 * DELETE /api/workflow/admin/configs/:configId
 */
router.delete('/admin/configs/:configId', workflowConfigController.deleteConfig);

/**
 * Clone workflow configuration
 * POST /api/workflow/admin/configs/:configId/clone
 * Body: { company_id, workflow_name, cloneApplicability }
 */
router.post('/admin/configs/:configId/clone', workflowConfigController.cloneConfig);

// ---------- Stage Management ----------

/**
 * Create stage
 * POST /api/workflow/admin/configs/:configId/stages
 * Body: { stage_name, stage_order, stage_type, approver_logic, approvers, ... }
 */
router.post('/admin/configs/:configId/stages', workflowConfigController.createStage);

/**
 * Update stage
 * PUT /api/workflow/admin/stages/:stageId
 * Body: { stage_name, stage_order, sla_days, ... }
 */
router.put('/admin/stages/:stageId', workflowConfigController.updateStage);

/**
 * Delete stage
 * DELETE /api/workflow/admin/stages/:stageId
 */
router.delete('/admin/stages/:stageId', workflowConfigController.deleteStage);

// ---------- Stage Approver Management ----------

/**
 * Create stage approver
 * POST /api/workflow/admin/stages/:stageId/approvers
 * Body: { approver_type, custom_user_id, approver_order, has_condition, condition_id }
 */
router.post('/admin/stages/:stageId/approvers', workflowConfigController.createStageApprover);

/**
 * Update stage approver
 * PUT /api/workflow/admin/approvers/:approverId
 * Body: { approver_type, custom_user_id, approver_order }
 */
router.put('/admin/approvers/:approverId', workflowConfigController.updateStageApprover);

/**
 * Delete stage approver
 * DELETE /api/workflow/admin/approvers/:approverId
 */
router.delete('/admin/approvers/:approverId', workflowConfigController.deleteStageApprover);

// ---------- Condition Management ----------

/**
 * Create condition
 * POST /api/workflow/admin/configs/:configId/conditions
 * Body: { condition_name, condition_type, logic_operator, action_type, rules, ... }
 */
router.post('/admin/configs/:configId/conditions', workflowConfigController.createCondition);

/**
 * Update condition
 * PUT /api/workflow/admin/conditions/:conditionId
 * Body: { condition_name, logic_operator, action_type, ... }
 */
router.put('/admin/conditions/:conditionId', workflowConfigController.updateCondition);

/**
 * Delete condition
 * DELETE /api/workflow/admin/conditions/:conditionId
 */
router.delete('/admin/conditions/:conditionId', workflowConfigController.deleteCondition);

/**
 * Create condition rule
 * POST /api/workflow/admin/conditions/:conditionId/rules
 * Body: { field_source, field_name, operator, compare_value, compare_value_type }
 */
router.post('/admin/conditions/:conditionId/rules', workflowConfigController.createConditionRule);

/**
 * Delete condition rule
 * DELETE /api/workflow/admin/rules/:ruleId
 */
router.delete('/admin/rules/:ruleId', workflowConfigController.deleteConditionRule);

// ---------- Applicability Management ----------

/**
 * Create applicability rule
 * POST /api/workflow/admin/configs/:configId/applicability
 * Body: { applicability_type, company_id, entity_id, department_id, designation_id, is_excluded, priority }
 */
router.post('/admin/configs/:configId/applicability', workflowConfigController.createApplicability);

/**
 * Update applicability rule
 * POST /api/workflows/admin/applicability
 * Body: { applicability_id, applicability_type, applicability_value, advanced_applicability_type, advanced_applicability_value, is_excluded, priority }
 */
router.post('/admin/applicability', workflowConfigController.updateApplicability);

/**
 * Delete applicability rule
 * DELETE /api/workflow/admin/applicability/:applicabilityId
 */
router.delete('/admin/applicability/:applicabilityId', workflowConfigController.deleteApplicability);

// ---------- Version Control ----------

/**
 * Get version history
 * GET /api/workflow/admin/configs/:configId/versions
 */
router.get('/admin/configs/:configId/versions', workflowConfigController.getVersionHistory);

/**
 * Restore from version
 * POST /api/workflow/admin/versions/:versionId/restore
 */
router.post('/admin/versions/:versionId/restore', workflowConfigController.restoreFromVersion);

module.exports = router;
