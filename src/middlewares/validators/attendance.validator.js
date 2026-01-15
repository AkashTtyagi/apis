/**
 * Attendance Request Validation Middleware
 * Validates leave, on-duty, wfh, short-leave, regularization requests
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
// LEAVE VALIDATORS
// ========================================

/**
 * Validation for applying leave
 */
const validateApplyLeave = [
    body('leave_type')
        .notEmpty()
        .withMessage('leave_type is required')
        .isInt({ min: 1 })
        .withMessage('leave_type must be a valid leave master ID'),

    body('reason')
        .notEmpty()
        .withMessage('reason is required')
        .isString()
        .withMessage('reason must be a string'),

    body('leave_mode')
        .optional()
        .isIn(['full_day', 'first_half', 'second_half'])
        .withMessage('leave_mode must be one of: full_day, first_half, second_half'),

    body('from_date')
        .optional()
        .isDate()
        .withMessage('from_date must be a valid date (YYYY-MM-DD)'),

    body('to_date')
        .optional()
        .isDate()
        .withMessage('to_date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (req.body.from_date && value) {
                const fromDate = new Date(req.body.from_date);
                const toDate = new Date(value);
                if (toDate < fromDate) {
                    throw new Error('to_date cannot be before from_date');
                }
            }
            return true;
        }),

    body('specific_dates')
        .optional()
        .isArray()
        .withMessage('specific_dates must be an array'),

    body('attachments')
        .optional()
        .isArray()
        .withMessage('attachments must be an array'),

    body('contact_number')
        .optional()
        .isString()
        .withMessage('contact_number must be a string'),

    // Custom validation: Either date range OR specific_dates required
    body()
        .custom((_, { req }) => {
            const { from_date, to_date, specific_dates } = req.body;
            const isDateRangeMode = from_date && to_date;
            const isMultipleDatesMode = specific_dates && Array.isArray(specific_dates) && specific_dates.length > 0;

            if (!isDateRangeMode && !isMultipleDatesMode) {
                throw new Error('Either provide date range (from_date, to_date) OR specific_dates array');
            }

            if (isDateRangeMode && isMultipleDatesMode) {
                throw new Error('Cannot use both date range and specific_dates. Choose one mode.');
            }

            return true;
        }),

    handleValidationErrors
];

/**
 * Validation for getting request details
 */
const validateRequestDetails = [
    body('request_id')
        .notEmpty()
        .withMessage('request_id is required')
        .isInt({ min: 1 })
        .withMessage('request_id must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation for withdrawing request
 */
const validateWithdrawRequest = [
    body('request_id')
        .notEmpty()
        .withMessage('request_id is required')
        .isInt({ min: 1 })
        .withMessage('request_id must be a positive integer'),
    body('withdrawal_reason')
        .optional()
        .isString()
        .withMessage('withdrawal_reason must be a string'),
    handleValidationErrors
];

// ========================================
// ON DUTY VALIDATORS
// ========================================

/**
 * Validation for applying on duty
 */
const validateApplyOnDuty = [
    body('reason')
        .notEmpty()
        .withMessage('reason is required')
        .isString()
        .withMessage('reason must be a string'),

    body('from_date')
        .optional()
        .isDate()
        .withMessage('from_date must be a valid date (YYYY-MM-DD)'),

    body('to_date')
        .optional()
        .isDate()
        .withMessage('to_date must be a valid date (YYYY-MM-DD)'),

    body('from_time')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('from_time must be a valid time (HH:MM or HH:MM:SS)'),

    body('to_time')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('to_time must be a valid time (HH:MM or HH:MM:SS)'),

    body('purpose')
        .optional()
        .isString()
        .withMessage('purpose must be a string'),

    body('location')
        .optional()
        .isString()
        .withMessage('location must be a string'),

    handleValidationErrors
];

// ========================================
// WFH VALIDATORS
// ========================================

/**
 * Validation for applying WFH
 */
const validateApplyWFH = [
    body('reason')
        .notEmpty()
        .withMessage('reason is required')
        .isString()
        .withMessage('reason must be a string'),

    body('from_date')
        .optional()
        .isDate()
        .withMessage('from_date must be a valid date (YYYY-MM-DD)'),

    body('to_date')
        .optional()
        .isDate()
        .withMessage('to_date must be a valid date (YYYY-MM-DD)'),

    body('day_type')
        .optional()
        .isIn(['full_day', 'first_half', 'second_half'])
        .withMessage('day_type must be one of: full_day, first_half, second_half'),

    handleValidationErrors
];

// ========================================
// SHORT LEAVE VALIDATORS
// ========================================

/**
 * Validation for applying short leave
 */
const validateApplyShortLeave = [
    body('leave_date')
        .notEmpty()
        .withMessage('leave_date is required')
        .isDate()
        .withMessage('leave_date must be a valid date (YYYY-MM-DD)'),

    body('from_time')
        .notEmpty()
        .withMessage('from_time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('from_time must be a valid time (HH:MM or HH:MM:SS)'),

    body('to_time')
        .notEmpty()
        .withMessage('to_time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('to_time must be a valid time (HH:MM or HH:MM:SS)'),

    body('reason')
        .notEmpty()
        .withMessage('reason is required')
        .isString()
        .withMessage('reason must be a string'),

    handleValidationErrors
];

// ========================================
// REGULARIZATION VALIDATORS
// ========================================

/**
 * Validation for applying regularization
 */
const validateApplyRegularization = [
    body('attendance_date')
        .notEmpty()
        .withMessage('attendance_date is required')
        .isDate()
        .withMessage('attendance_date must be a valid date (YYYY-MM-DD)'),

    body('reason')
        .notEmpty()
        .withMessage('reason is required')
        .isString()
        .withMessage('reason must be a string'),

    body('punch_in')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('punch_in must be a valid time (HH:MM or HH:MM:SS)'),

    body('punch_out')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('punch_out must be a valid time (HH:MM or HH:MM:SS)'),

    // Custom: At least one of punch_in or punch_out required
    body()
        .custom((_, { req }) => {
            const { punch_in, punch_out } = req.body;
            if (!punch_in && !punch_out) {
                throw new Error('At least one of punch_in or punch_out is required');
            }
            return true;
        }),

    handleValidationErrors
];

module.exports = {
    // Leave
    validateApplyLeave,
    validateRequestDetails,
    validateWithdrawRequest,
    // On Duty
    validateApplyOnDuty,
    // WFH
    validateApplyWFH,
    // Short Leave
    validateApplyShortLeave,
    // Regularization
    validateApplyRegularization
};
