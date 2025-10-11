/**
 * Auth Validation Middleware
 * Validates authentication-related requests
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation rules for set password
 */
const validateSetPassword = [
    body('token')
        .notEmpty()
        .withMessage('Token is required')
        .isString()
        .withMessage('Token must be a string'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Validation rules for login
 */
const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for forgot password
 */
const validateForgotPassword = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address')
];

/**
 * Validation rules for reset password
 */
const validateResetPassword = [
    body('token')
        .notEmpty()
        .withMessage('Token is required')
        .isString()
        .withMessage('Token must be a string'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Validation rules for resend password set email
 */
const validateResendPasswordSetEmail = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email address')
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            timestamp: new Date().toISOString(),
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = {
    validateSetPassword,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateResendPasswordSetEmail,
    handleValidationErrors
};
