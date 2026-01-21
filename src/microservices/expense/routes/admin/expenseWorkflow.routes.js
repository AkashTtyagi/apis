/**
 * Expense Workflow Routes
 * Routes for expense approval workflow management
 */

const express = require('express');
const router = express.Router();
const expenseWorkflowController = require('../../controllers/admin/expenseWorkflow.controller');

/**
 * Create a new expense approval workflow
 * POST /api/expense/admin/workflows/create
 */
router.post('/create', expenseWorkflowController.createWorkflow);

/**
 * Get all workflows with filters
 * POST /api/expense/admin/workflows/list
 */
router.post('/list', expenseWorkflowController.getAllWorkflows);

/**
 * Get workflow details
 * POST /api/expense/admin/workflows/details
 */
router.post('/details', expenseWorkflowController.getWorkflowDetails);

/**
 * Update workflow
 * POST /api/expense/admin/workflows/update
 */
router.post('/update', expenseWorkflowController.updateWorkflow);

/**
 * Delete workflow
 * POST /api/expense/admin/workflows/delete
 */
router.post('/delete', expenseWorkflowController.deleteWorkflow);

/**
 * Clone workflow
 * POST /api/expense/admin/workflows/clone
 */
router.post('/clone', expenseWorkflowController.cloneWorkflow);

/**
 * Get dropdown data for workflow forms
 * POST /api/expense/admin/workflows/dropdown
 */
router.post('/dropdown', expenseWorkflowController.getDropdownData);

/**
 * Get applicable workflow for expense
 * POST /api/expense/admin/workflows/get-applicable
 */
router.post('/get-applicable', expenseWorkflowController.getApplicableWorkflow);

// ==================== APPLICABILITY ROUTES ====================

/**
 * Get all applicability rules with filters
 * POST /api/expense/admin/workflows/applicability/list
 */
router.post('/applicability/list', expenseWorkflowController.getApplicabilityList);

/**
 * Get applicability rules for a specific workflow
 * POST /api/expense/admin/workflows/applicability/details
 */
router.post('/applicability/details', expenseWorkflowController.getApplicabilityDetails);

/**
 * Manage applicability (add/update/delete)
 * POST /api/expense/admin/workflows/applicability/manage
 *
 * Body for add:
 * {
 *   "action": "add",
 *   "workflow_id": 1,
 *   "applicability_type": "department",      // company, entity, location, level, designation, department, sub_department, employee, grade
 *   "applicability_value": "1,2,3",          // comma-separated IDs
 *   "advanced_applicability_type": "none",   // none, employee_type, branch, region, cost_center, project
 *   "advanced_applicability_value": null,
 *   "is_excluded": false,
 *   "priority": 3
 * }
 *
 * Body for update:
 * {
 *   "action": "update",
 *   "id": 1,
 *   "applicability_value": "1,2,3,4",
 *   "is_excluded": true
 * }
 *
 * Body for delete:
 * {
 *   "action": "delete",
 *   "id": 1
 * }
 */
router.post('/applicability/manage', expenseWorkflowController.manageApplicability);

module.exports = router;
