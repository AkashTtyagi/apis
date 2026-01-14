/**
 * Holiday Validation Middleware
 * Validates holiday-related requests
 */

const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

// ========================================
// HOLIDAY BANK VALIDATORS
// ========================================

/**
 * Validation for getting holiday by ID
 */
const validateHolidayDetail = [
    body('id')
        .notEmpty()
        .withMessage('Holiday ID is required')
        .isInt({ min: 1 })
        .withMessage('Holiday ID must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation for creating holiday
 */
const validateCreateHoliday = [
    body('holiday_name')
        .notEmpty()
        .withMessage('Holiday name is required')
        .isString()
        .withMessage('Holiday name must be a string'),
    body('holiday_date')
        .notEmpty()
        .withMessage('Holiday date is required')
        .isDate()
        .withMessage('Holiday date must be a valid date'),
    body('is_national_holiday')
        .optional()
        .isBoolean()
        .withMessage('is_national_holiday must be a boolean'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    handleValidationErrors
];

/**
 * Validation for updating holiday
 */
const validateUpdateHoliday = [
    body('id')
        .notEmpty()
        .withMessage('Holiday ID is required')
        .isInt({ min: 1 })
        .withMessage('Holiday ID must be a positive integer'),
    body('holiday_name')
        .optional()
        .isString()
        .withMessage('Holiday name must be a string'),
    body('holiday_date')
        .optional()
        .isDate()
        .withMessage('Holiday date must be a valid date'),
    body('is_national_holiday')
        .optional()
        .isBoolean()
        .withMessage('is_national_holiday must be a boolean'),
    handleValidationErrors
];

/**
 * Validation for deleting holiday
 */
const validateDeleteHoliday = [
    body('id')
        .notEmpty()
        .withMessage('Holiday ID is required')
        .isInt({ min: 1 })
        .withMessage('Holiday ID must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation for bulk create holidays
 */
const validateBulkCreateHolidays = [
    body('holidays')
        .notEmpty()
        .withMessage('Holidays array is required')
        .isArray({ min: 1 })
        .withMessage('Holidays must be a non-empty array'),
    body('holidays.*.holiday_name')
        .notEmpty()
        .withMessage('Holiday name is required')
        .isString()
        .withMessage('Holiday name must be a string'),
    body('holidays.*.holiday_date')
        .notEmpty()
        .withMessage('Holiday date is required')
        .isDate()
        .withMessage('Holiday date must be a valid date'),
    handleValidationErrors
];

// ========================================
// HOLIDAY POLICY VALIDATORS
// ========================================

/**
 * Validation for getting policy by ID
 */
const validatePolicyDetail = [
    body('id')
        .notEmpty()
        .withMessage('Policy ID is required')
        .isInt({ min: 1 })
        .withMessage('Policy ID must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation for creating policy
 */
const validateCreatePolicy = [
    body('calendar_name')
        .notEmpty()
        .withMessage('Calendar name is required')
        .isString()
        .withMessage('Calendar name must be a string'),
    body('year')
        .notEmpty()
        .withMessage('Year is required')
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Year must be a valid year'),
    body('is_restricted_holiday_applicable')
        .optional()
        .isBoolean()
        .withMessage('is_restricted_holiday_applicable must be a boolean'),
    body('restricted_holiday_count')
        .optional()
        .isInt({ min: 0 })
        .withMessage('restricted_holiday_count must be a non-negative integer'),
    body('holiday_ids')
        .optional()
        .isArray()
        .withMessage('holiday_ids must be an array'),
    body('applicability')
        .optional()
        .isArray()
        .withMessage('applicability must be an array'),
    handleValidationErrors
];

/**
 * Validation for updating policy
 */
const validateUpdatePolicy = [
    body('id')
        .notEmpty()
        .withMessage('Policy ID is required')
        .isInt({ min: 1 })
        .withMessage('Policy ID must be a positive integer'),
    body('calendar_name')
        .optional()
        .isString()
        .withMessage('Calendar name must be a string'),
    body('year')
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Year must be a valid year'),
    handleValidationErrors
];

/**
 * Validation for deleting policy
 */
const validateDeletePolicy = [
    body('id')
        .notEmpty()
        .withMessage('Policy ID is required')
        .isInt({ min: 1 })
        .withMessage('Policy ID must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation for adding holidays to policy
 */
const validateAddHolidaysToPolicy = [
    body('policy_id')
        .notEmpty()
        .withMessage('Policy ID is required')
        .isInt({ min: 1 })
        .withMessage('Policy ID must be a positive integer'),
    body('holiday_ids')
        .notEmpty()
        .withMessage('Holiday IDs array is required')
        .isArray({ min: 1 })
        .withMessage('Holiday IDs must be a non-empty array'),
    handleValidationErrors
];

/**
 * Validation for removing holiday from policy
 */
const validateRemoveHolidayFromPolicy = [
    body('policy_id')
        .notEmpty()
        .withMessage('Policy ID is required')
        .isInt({ min: 1 })
        .withMessage('Policy ID must be a positive integer'),
    body('holiday_id')
        .notEmpty()
        .withMessage('Holiday ID is required')
        .isInt({ min: 1 })
        .withMessage('Holiday ID must be a positive integer'),
    handleValidationErrors
];

module.exports = {
    // Holiday Bank
    validateHolidayDetail,
    validateCreateHoliday,
    validateUpdateHoliday,
    validateDeleteHoliday,
    validateBulkCreateHolidays,
    // Holiday Policy
    validatePolicyDetail,
    validateCreatePolicy,
    validateUpdatePolicy,
    validateDeletePolicy,
    validateAddHolidaysToPolicy,
    validateRemoveHolidayFromPolicy
};
