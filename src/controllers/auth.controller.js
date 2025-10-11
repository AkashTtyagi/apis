/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Set password for first time
 * POST /api/auth/set-password
 */
const setPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const result = await authService.setPassword({ token, password });

        return sendSuccess(res, 'Password set successfully', result.user);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login({ email, password });

        return sendSuccess(res, result.message, {
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await authService.forgotPassword({ email });

        return sendSuccess(res, result.message);
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const result = await authService.resetPassword({ token, password });

        return sendSuccess(res, result.message);
    } catch (error) {
        next(error);
    }
};

/**
 * Resend password set email
 * POST /api/auth/resend-set-password
 */
const resendPasswordSetEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await authService.resendPasswordSetEmail({ email });

        return sendSuccess(res, result.message);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setPassword,
    login,
    forgotPassword,
    resetPassword,
    resendPasswordSetEmail
};
