/**
 * Holiday Management Routes
 * Routes for holiday bank and holiday policy operations
 */

const express = require('express');
const router = express.Router();

// Controllers
const holidayBankController = require('../controllers/holiday/holidayBank.controller');
const holidayPolicyController = require('../controllers/holiday/holidayPolicy.controller');

// Middleware (add authentication/authorization as needed)
// const { authenticate } = require('../middleware/auth.middleware');

// ========================================
// HOLIDAY BANK ROUTES
// ========================================

/**
 * @route   GET /api/holiday/bank
 * @desc    Get all holidays from holiday bank
 * @access  Private
 * @query   year, is_national_holiday, start_date, end_date
 */
router.get('/bank', holidayBankController.getAllHolidays);

/**
 * @route   GET /api/holiday/bank/:id
 * @desc    Get holiday by ID
 * @access  Private
 */
router.get('/bank/:id', holidayBankController.getHolidayById);

/**
 * @route   POST /api/holiday/bank
 * @desc    Create new holiday
 * @access  Private (Admin only)
 * @body    { holiday_name, holiday_date, is_national_holiday, description }
 */
router.post('/bank', holidayBankController.createHoliday);

/**
 * @route   POST /api/holiday/bank/bulk
 * @desc    Bulk create holidays
 * @access  Private (Admin only)
 * @body    { holidays: [{ holiday_name, holiday_date, is_national_holiday, description }] }
 */
router.post('/bank/bulk', holidayBankController.bulkCreateHolidays);

/**
 * @route   PUT /api/holiday/bank/:id
 * @desc    Update holiday
 * @access  Private (Admin only)
 * @body    { holiday_name, holiday_date, is_national_holiday, description }
 */
router.put('/bank/:id', holidayBankController.updateHoliday);

/**
 * @route   DELETE /api/holiday/bank/:id
 * @desc    Delete holiday (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/bank/:id', holidayBankController.deleteHoliday);

// ========================================
// HOLIDAY POLICY ROUTES
// ========================================

/**
 * @route   GET /api/holiday/policy
 * @desc    Get all holiday policies
 * @access  Private
 * @query   company_id, year
 */
router.get('/policy', holidayPolicyController.getAllPolicies);

/**
 * @route   GET /api/holiday/policy/:id
 * @desc    Get holiday policy by ID
 * @access  Private
 */
router.get('/policy/:id', holidayPolicyController.getPolicyById);

/**
 * @route   POST /api/holiday/policy
 * @desc    Create new holiday policy
 * @access  Private (Admin only)
 * @body    {
 *            company_id,
 *            calendar_name,
 *            year,
 *            is_restricted_holiday_applicable,
 *            restricted_holiday_count,
 *            notes,
 *            holiday_ids: [],
 *            applicability: [{
 *              applicability_type,
 *              applicability_value,
 *              advanced_applicability_type,
 *              advanced_applicability_value,
 *              is_excluded,
 *              priority
 *            }]
 *          }
 */
router.post('/policy', holidayPolicyController.createPolicy);

/**
 * @route   PUT /api/holiday/policy/:id
 * @desc    Update holiday policy
 * @access  Private (Admin only)
 * @body    Same as create, all fields optional
 */
router.put('/policy/:id', holidayPolicyController.updatePolicy);

/**
 * @route   DELETE /api/holiday/policy/:id
 * @desc    Delete holiday policy (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/policy/:id', holidayPolicyController.deletePolicy);

/**
 * @route   POST /api/holiday/policy/:id/holidays
 * @desc    Add holidays to policy
 * @access  Private (Admin only)
 * @body    { holiday_ids: [] }
 */
router.post('/policy/:id/holidays', holidayPolicyController.addHolidaysToPolicy);

/**
 * @route   DELETE /api/holiday/policy/:policyId/holidays/:holidayId
 * @desc    Remove holiday from policy
 * @access  Private (Admin only)
 */
router.delete('/policy/:policyId/holidays/:holidayId', holidayPolicyController.removeHolidayFromPolicy);

module.exports = router;
