/**
 * Currency Routes
 * Routes for expense currency and exchange rate management
 */

const express = require('express');
const router = express.Router();
const currencyController = require('../../controllers/admin/currency.controller');

// ==================== CURRENCY MANAGEMENT ====================

/**
 * Create a new currency
 * POST /api/expense/admin/currencies/create
 */
router.post('/create', currencyController.createCurrency);

/**
 * Get all currencies with filters
 * POST /api/expense/admin/currencies/list
 */
router.post('/list', currencyController.getAllCurrencies);

/**
 * Get currency details
 * POST /api/expense/admin/currencies/details
 */
router.post('/details', currencyController.getCurrencyDetails);

/**
 * Update currency
 * POST /api/expense/admin/currencies/update
 */
router.post('/update', currencyController.updateCurrency);

/**
 * Delete currency
 * POST /api/expense/admin/currencies/delete
 */
router.post('/delete', currencyController.deleteCurrency);

/**
 * Set base currency
 * POST /api/expense/admin/currencies/set-base
 */
router.post('/set-base', currencyController.setBaseCurrency);

/**
 * Set default expense currency
 * POST /api/expense/admin/currencies/set-default
 */
router.post('/set-default', currencyController.setDefaultExpenseCurrency);

/**
 * Get dropdown data for currency forms
 * POST /api/expense/admin/currencies/dropdown
 */
router.post('/dropdown', currencyController.getDropdownData);

/**
 * Check currency usage in other modules
 * POST /api/expense/admin/currencies/check-usage
 */
router.post('/check-usage', currencyController.checkUsage);

// ==================== EXCHANGE RATE MANAGEMENT ====================

/**
 * Add/Update exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/upsert
 */
router.post('/exchange-rates/upsert', currencyController.upsertExchangeRate);

/**
 * Get exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/list
 */
router.post('/exchange-rates/list', currencyController.getExchangeRates);

/**
 * Delete exchange rate
 * POST /api/expense/admin/currencies/exchange-rates/delete
 */
router.post('/exchange-rates/delete', currencyController.deleteExchangeRate);

/**
 * Bulk update exchange rates
 * POST /api/expense/admin/currencies/exchange-rates/bulk-update
 */
router.post('/exchange-rates/bulk-update', currencyController.bulkUpdateRates);

/**
 * Get exchange rate history (audit log)
 * POST /api/expense/admin/currencies/exchange-rates/history
 */
router.post('/exchange-rates/history', currencyController.getExchangeRateHistory);

// ==================== CURRENCY POLICY MANAGEMENT ====================

/**
 * Get currency policy
 * POST /api/expense/admin/currencies/policy/get
 */
router.post('/policy/get', currencyController.getCurrencyPolicy);

/**
 * Update currency policy
 * POST /api/expense/admin/currencies/policy/update
 */
router.post('/policy/update', currencyController.updateCurrencyPolicy);

// ==================== CURRENCY CONVERSION ====================

/**
 * Convert amount between currencies
 * POST /api/expense/admin/currencies/convert
 */
router.post('/convert', currencyController.convertAmount);

module.exports = router;
