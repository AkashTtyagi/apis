/**
 * Admin Expense Routes
 * Routes for expense management admin APIs
 */

const express = require('express');
const router = express.Router();
const locationGroupController = require('../controllers/admin/locationGroup.controller');
const expenseCategoryController = require('../controllers/admin/expenseCategory.controller');
const currencyController = require('../controllers/admin/currency.controller');

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

// ==================== CURRENCY MANAGEMENT ====================

/**
 * Create a new currency
 * POST /api/expense/admin/currencies/create
 */
router.post('/currencies/create', currencyController.createCurrency);

/**
 * Get all currencies with filters
 * POST /api/expense/admin/currencies/list
 */
router.post('/currencies/list', currencyController.getAllCurrencies);

/**
 * Get currency details
 * POST /api/expense/admin/currencies/details
 */
router.post('/currencies/details', currencyController.getCurrencyDetails);

/**
 * Update currency
 * POST /api/expense/admin/currencies/update
 */
router.post('/currencies/update', currencyController.updateCurrency);

/**
 * Delete currency
 * POST /api/expense/admin/currencies/delete
 */
router.post('/currencies/delete', currencyController.deleteCurrency);

/**
 * Set base currency
 * POST /api/expense/admin/currencies/set-base
 */
router.post('/currencies/set-base', currencyController.setBaseCurrency);

/**
 * Get dropdown data for currency forms
 * POST /api/expense/admin/currencies/dropdown
 */
router.post('/currencies/dropdown', currencyController.getDropdownData);

// ==================== EXCHANGE RATE MANAGEMENT ====================

/**
 * Add/Update exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/upsert
 */
router.post('/currencies/exchange-rates/upsert', currencyController.upsertExchangeRate);

/**
 * Get exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/list
 */
router.post('/currencies/exchange-rates/list', currencyController.getExchangeRates);

/**
 * Delete exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/delete
 */
router.post('/currencies/exchange-rates/delete', currencyController.deleteExchangeRate);

/**
 * Bulk update exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/bulk-update
 */
router.post('/currencies/exchange-rates/bulk-update', currencyController.bulkUpdateRates);

/**
 * Get exchange rate history (audit log)
 * POST /api/expense/admin/currencies/exchange-rates/history
 */
router.post('/currencies/exchange-rates/history', currencyController.getExchangeRateHistory);

// ==================== CURRENCY POLICY MANAGEMENT ====================

/**
 * Get currency policy
 * POST /api/expense/admin/currencies/policy/get
 */
router.post('/currencies/policy/get', currencyController.getCurrencyPolicy);

/**
 * Update currency policy
 * POST /api/expense/admin/currencies/policy/update
 */
router.post('/currencies/policy/update', currencyController.updateCurrencyPolicy);

// ==================== CURRENCY CONVERSION ====================

/**
 * Convert amount between currencies
 * POST /api/expense/admin/currencies/convert
 */
router.post('/currencies/convert', currencyController.convertAmount);

module.exports = router;
