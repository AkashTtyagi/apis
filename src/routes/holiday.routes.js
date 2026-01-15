/**
 * Holiday Management Routes
 * Routes for holiday bank and holiday policy operations
 */

const express = require('express');
const router = express.Router();

// Controllers
const holidayBankController = require('../controllers/holiday/holidayBank.controller');
const holidayPolicyController = require('../controllers/holiday/holidayPolicy.controller');

// Validators
const {
    validateHolidayDetail,
    validateCreateHoliday,
    validateUpdateHoliday,
    validateDeleteHoliday,
    validateBulkCreateHolidays,
    validatePolicyDetail,
    validateCreatePolicy,
    validateUpdatePolicy,
    validateDeletePolicy,
    validateAddHolidaysToPolicy,
    validateRemoveHolidayFromPolicy
} = require('../middlewares/validators/holiday.validator');

// Middleware
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(authenticate);

// ========================================
// HOLIDAY BANK ROUTES
// ========================================

/**
 * @route   POST /api/holiday/bank/list
 * @desc    Get all holidays from holiday bank
 * @access  Private
 * @body    { year, is_national_holiday, start_date, end_date }
 */
router.post('/bank/list', holidayBankController.getAllHolidays);

/**
 * @route   POST /api/holiday/bank/detail
 * @desc    Get holiday by ID
 * @access  Private
 * @body    { id }
 */
router.post('/bank/detail', validateHolidayDetail, holidayBankController.getHolidayById);

/**
 * @route   POST /api/holiday/bank/create
 * @desc    Create new holiday
 * @access  Private (Admin only)
 * @body    { holiday_name, holiday_date, is_national_holiday, description }
 */
router.post('/bank/create', validateCreateHoliday, holidayBankController.createHoliday);

/**
 * @route   POST /api/holiday/bank/bulk
 * @desc    Bulk create holidays
 * @access  Private (Admin only)
 * @body    { holidays: [{ holiday_name, holiday_date, is_national_holiday, description }] }
 */
router.post('/bank/bulk', validateBulkCreateHolidays, holidayBankController.bulkCreateHolidays);

/**
 * @route   POST /api/holiday/bank/update
 * @desc    Update holiday
 * @access  Private (Admin only)
 * @body    { id, holiday_name, holiday_date, is_national_holiday, description }
 */
router.post('/bank/update', validateUpdateHoliday, holidayBankController.updateHoliday);

/**
 * @route   POST /api/holiday/bank/delete
 * @desc    Delete holiday (soft delete)
 * @access  Private (Admin only)
 * @body    { id }
 */
router.post('/bank/delete', validateDeleteHoliday, holidayBankController.deleteHoliday);

// ========================================
// HOLIDAY POLICY ROUTES
// ========================================

/**
 * @route   POST /api/holiday/policy/list
 * @desc    Get all holiday policies
 * @access  Private
 * @body    { year }
 */
router.post('/policy/list', holidayPolicyController.getAllPolicies);

/**
 * @route   POST /api/holiday/policy/detail
 * @desc    Get holiday policy by ID
 * @access  Private
 * @body    { id }
 */
router.post('/policy/detail', validatePolicyDetail, holidayPolicyController.getPolicyById);

/**
 * @route   POST /api/holiday/policy/create
 * @desc    Create new holiday policy
 * @access  Private (Admin only)
 * @body    {
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
router.post('/policy/create', validateCreatePolicy, holidayPolicyController.createPolicy);

/**
 * @route   POST /api/holiday/policy/update
 * @desc    Update holiday policy
 * @access  Private (Admin only)
 * @body    { id, ...policyData }
 */
router.post('/policy/update', validateUpdatePolicy, holidayPolicyController.updatePolicy);

/**
 * @route   POST /api/holiday/policy/delete
 * @desc    Delete holiday policy (soft delete)
 * @access  Private (Admin only)
 * @body    { id }
 */
router.post('/policy/delete', validateDeletePolicy, holidayPolicyController.deletePolicy);

/**
 * @route   POST /api/holiday/policy/add-holidays
 * @desc    Add holidays to policy
 * @access  Private (Admin only)
 * @body    { policy_id, holiday_ids: [] }
 */
router.post('/policy/add-holidays', validateAddHolidaysToPolicy, holidayPolicyController.addHolidaysToPolicy);

/**
 * @route   POST /api/holiday/policy/remove-holiday
 * @desc    Remove holiday from policy
 * @access  Private (Admin only)
 * @body    { policy_id, holiday_id }
 */
router.post('/policy/remove-holiday', validateRemoveHolidayFromPolicy, holidayPolicyController.removeHolidayFromPolicy);

module.exports = router;
