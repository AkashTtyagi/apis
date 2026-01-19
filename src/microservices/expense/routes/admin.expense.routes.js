/**
 * Admin Expense Routes
 * Routes for expense management admin APIs
 */

const express = require('express');
const router = express.Router();
const locationGroupController = require('../controllers/admin/locationGroup.controller');
const expenseCategoryController = require('../controllers/admin/expenseCategory.controller');

// ==================== LOCATION GROUP MANAGEMENT ====================

/**
 * Create a new location group
 * POST /api/expense/admin/location-groups/create
 */
router.post('/location-groups/create', locationGroupController.createLocationGroup);

/**
 * Get all location groups with filters
 * POST /api/expense/admin/location-groups/list
 */
router.post('/location-groups/list', locationGroupController.getAllLocationGroups);

/**
 * Get location group details
 * POST /api/expense/admin/location-groups/details
 */
router.post('/location-groups/details', locationGroupController.getLocationGroupDetails);

/**
 * Update location group
 * POST /api/expense/admin/location-groups/update
 */
router.post('/location-groups/update', locationGroupController.updateLocationGroup);

/**
 * Delete location group
 * POST /api/expense/admin/location-groups/delete
 */
router.post('/location-groups/delete', locationGroupController.deleteLocationGroup);

/**
 * Get location dropdown data (countries, states, cities)
 * POST /api/expense/admin/location-groups/locations/dropdown
 */
router.post('/location-groups/locations/dropdown', locationGroupController.getLocationDropdownData);

// ==================== EXPENSE CATEGORY MANAGEMENT ====================

/**
 * Create a new expense category
 * POST /api/expense/admin/categories/create
 */
router.post('/categories/create', expenseCategoryController.createCategory);

/**
 * Get all expense categories with filters
 * POST /api/expense/admin/categories/list
 */
router.post('/categories/list', expenseCategoryController.getAllCategories);

/**
 * Get expense category details
 * POST /api/expense/admin/categories/details
 */
router.post('/categories/details', expenseCategoryController.getCategoryDetails);

/**
 * Update expense category
 * POST /api/expense/admin/categories/update
 */
router.post('/categories/update', expenseCategoryController.updateCategory);

/**
 * Delete expense category
 * POST /api/expense/admin/categories/delete
 */
router.post('/categories/delete', expenseCategoryController.deleteCategory);

/**
 * Get dropdown data for category forms
 * POST /api/expense/admin/categories/dropdown
 */
router.post('/categories/dropdown', expenseCategoryController.getCategoryDropdownData);

/**
 * Manage category limits (add/update/delete)
 * POST /api/expense/admin/categories/limits/manage
 */
router.post('/categories/limits/manage', expenseCategoryController.manageCategoryLimits);

/**
 * Manage custom fields (add/update/delete)
 * POST /api/expense/admin/categories/custom-fields/manage
 */
router.post('/categories/custom-fields/manage', expenseCategoryController.manageCustomFields);

/**
 * Update filing rules for a category
 * POST /api/expense/admin/categories/filing-rules/update
 */
router.post('/categories/filing-rules/update', expenseCategoryController.updateFilingRules);

/**
 * Clone an existing category
 * POST /api/expense/admin/categories/clone
 */
router.post('/categories/clone', expenseCategoryController.cloneCategory);

/**
 * Reorder categories
 * POST /api/expense/admin/categories/reorder
 */
router.post('/categories/reorder', expenseCategoryController.reorderCategories);

/**
 * Get category hierarchy (tree structure)
 * POST /api/expense/admin/categories/hierarchy
 */
router.post('/categories/hierarchy', expenseCategoryController.getCategoryHierarchy);

module.exports = router;
