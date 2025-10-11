/**
 * Authentication Routes
 * Defines authentication-related API endpoints
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const {
    validateSetPassword,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateResendPasswordSetEmail,
    handleValidationErrors
} = require('../middlewares/validators/auth.validator');

/**
 * POST /api/auth/set-password
 * Set password for first time (after onboarding)
 */
router.post(
    '/set-password',
    validateSetPassword,
    handleValidationErrors,
    authController.setPassword
);

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post(
    '/login',
    validateLogin,
    handleValidationErrors,
    authController.login
);

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post(
    '/forgot-password',
    validateForgotPassword,
    handleValidationErrors,
    authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post(
    '/reset-password',
    validateResetPassword,
    handleValidationErrors,
    authController.resetPassword
);

/**
 * POST /api/auth/resend-set-password
 * Resend password set email to user
 */
router.post(
    '/resend-set-password',
    validateResendPasswordSetEmail,
    handleValidationErrors,
    authController.resendPasswordSetEmail
);

module.exports = router;
