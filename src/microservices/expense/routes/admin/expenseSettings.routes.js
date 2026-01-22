/**
 * Expense Settings Admin Routes
 * Routes for managing expense module settings
 */

const express = require('express');
const router = express.Router();
const expenseSettingsController = require('../../controllers/admin/expenseSettings.controller');

// ==================== GENERAL SETTINGS ====================

/**
 * @route   GET /api/expense/admin/settings
 * @desc    Get expense settings for company
 * @access  Admin
 */
router.get('/', expenseSettingsController.getSettings);

/**
 * @route   PUT /api/expense/admin/settings
 * @desc    Update expense settings
 * @access  Admin
 */
router.put('/', expenseSettingsController.updateSettings);

/**
 * @route   PATCH /api/expense/admin/settings/section/:section
 * @desc    Update specific settings section
 * @access  Admin
 * @params  section - general, submission_window, date_time, mileage, per_diem,
 *                   receipt, violation, approval, payment, notification, audit, integration, ui
 */
router.patch('/section/:section', expenseSettingsController.updateSettingsSection);

// ==================== MILEAGE RATES ====================

/**
 * @route   GET /api/expense/admin/settings/mileage-rates
 * @desc    Get all mileage rates
 * @access  Admin
 * @query   vehicle_type, is_active
 */
router.get('/mileage-rates', expenseSettingsController.getMileageRates);

/**
 * @route   POST /api/expense/admin/settings/mileage-rates
 * @desc    Create mileage rate
 * @access  Admin
 */
router.post('/mileage-rates', expenseSettingsController.createMileageRate);

/**
 * @route   PUT /api/expense/admin/settings/mileage-rates/:id
 * @desc    Update mileage rate
 * @access  Admin
 */
router.put('/mileage-rates/:id', expenseSettingsController.updateMileageRate);

/**
 * @route   DELETE /api/expense/admin/settings/mileage-rates/:id
 * @desc    Delete mileage rate
 * @access  Admin
 */
router.delete('/mileage-rates/:id', expenseSettingsController.deleteMileageRate);

/**
 * @route   GET /api/expense/admin/settings/mileage-rates/applicable/:employee_id
 * @desc    Get applicable mileage rate for employee
 * @access  Admin
 * @query   vehicle_type (required), date
 */
router.get('/mileage-rates/applicable/:employee_id', expenseSettingsController.getApplicableMileageRate);

// ==================== PER DIEM RATES ====================

/**
 * @route   GET /api/expense/admin/settings/per-diem-rates
 * @desc    Get all per diem rates
 * @access  Admin
 * @query   city_tier, is_active
 */
router.get('/per-diem-rates', expenseSettingsController.getPerDiemRates);

/**
 * @route   POST /api/expense/admin/settings/per-diem-rates
 * @desc    Create per diem rate
 * @access  Admin
 */
router.post('/per-diem-rates', expenseSettingsController.createPerDiemRate);

/**
 * @route   PUT /api/expense/admin/settings/per-diem-rates/:id
 * @desc    Update per diem rate
 * @access  Admin
 */
router.put('/per-diem-rates/:id', expenseSettingsController.updatePerDiemRate);

/**
 * @route   DELETE /api/expense/admin/settings/per-diem-rates/:id
 * @desc    Delete per diem rate
 * @access  Admin
 */
router.delete('/per-diem-rates/:id', expenseSettingsController.deletePerDiemRate);

/**
 * @route   GET /api/expense/admin/settings/per-diem-rates/applicable/:employee_id
 * @desc    Get applicable per diem rate for employee
 * @access  Admin
 * @query   city_tier (required), date
 */
router.get('/per-diem-rates/applicable/:employee_id', expenseSettingsController.getApplicablePerDiemRate);

// ==================== UTILITY ENDPOINTS ====================

/**
 * @route   GET /api/expense/admin/settings/submission-window/check
 * @desc    Check submission window status
 * @access  Admin
 * @query   date
 */
router.get('/submission-window/check', expenseSettingsController.checkSubmissionWindow);

module.exports = router;
