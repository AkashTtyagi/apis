/**
 * Response Handler Utility
 * Standardized response functions for controllers
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (pagination, summary, etc.)
 * @returns {Object} - Express response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message,
        ...(data !== null && { data }),
        ...(meta !== null && { meta })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @returns {Object} - Express response
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    successResponse,
    errorResponse
};
