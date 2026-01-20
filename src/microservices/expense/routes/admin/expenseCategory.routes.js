/**
 * Expense Category Routes
 * Routes for expense category management
 */

const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../../controllers/admin/expenseCategory.controller');

/**
 * Create a new expense category
 * POST /api/expense/admin/categories/create
 */
router.post('/create', expenseCategoryController.createCategory);

/**
 * Get all expense categories with filters
 * POST /api/expense/admin/categories/list
 */
router.post('/list', expenseCategoryController.getAllCategories);

/**
 * Get expense category details
 * POST /api/expense/admin/categories/details
 */
router.post('/details', expenseCategoryController.getCategoryDetails);

/**
 * Update expense category
 * POST /api/expense/admin/categories/update
 */
router.post('/update', expenseCategoryController.updateCategory);

/**
 * Delete expense category
 * POST /api/expense/admin/categories/delete
 */
router.post('/delete', expenseCategoryController.deleteCategory);

/**
 * Get dropdown data for category forms
 * POST /api/expense/admin/categories/dropdown
 */
router.post('/dropdown', expenseCategoryController.getCategoryDropdownData);

/**
 * Manage category limits (add/update/delete)
 * POST /api/expense/admin/categories/limits/manage
 */
router.post('/limits/manage', expenseCategoryController.manageCategoryLimits);

/**
 * Manage custom fields (add/update/delete)
 * POST /api/expense/admin/categories/custom-fields/manage
 */
router.post('/custom-fields/manage', expenseCategoryController.manageCustomFields);

/**
 * Update filing rules for a category
 * POST /api/expense/admin/categories/filing-rules/update
 */
router.post('/filing-rules/update', expenseCategoryController.updateFilingRules);

/**
 * Clone an existing category
 * POST /api/expense/admin/categories/clone
 */
router.post('/clone', expenseCategoryController.cloneCategory);

/**
 * Reorder categories
 * POST /api/expense/admin/categories/reorder
 */
router.post('/reorder', expenseCategoryController.reorderCategories);

/**
 * Get category hierarchy (tree structure)
 * POST /api/expense/admin/categories/hierarchy
 */
router.post('/hierarchy', expenseCategoryController.getCategoryHierarchy);

module.exports = router;
