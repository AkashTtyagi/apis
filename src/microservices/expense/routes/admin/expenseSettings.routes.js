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
 * @params  section - general, violation, audit
 */
router.patch('/section/:section', expenseSettingsController.updateSettingsSection);

module.exports = router;
