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
 * Manage category to workflow mapping
 * POST /api/expense/admin/workflows/category-mapping/manage
 */
router.post('/category-mapping/manage', expenseWorkflowController.manageCategoryMapping);

/**
 * Get applicable workflow for expense
 * POST /api/expense/admin/workflows/get-applicable
 */
router.post('/get-applicable', expenseWorkflowController.getApplicableWorkflow);

module.exports = router;
