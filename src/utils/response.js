/**
 * Response Utility
 * Provides standardized API response formatting
 */

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Common response formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Express response
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString(),
        ...(data !== null && { data }),
        ...(meta !== null && { meta })
    };

    return res.status(statusCode).json(response);
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Express response
 */
const sendSuccess = (res, message = 'Success', data = null, meta = null) => {
    return sendResponse(res, HTTP_STATUS.OK, true, message, data, meta);
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Created resource data
 * @returns {Object} - Express response
 */
const sendCreated = (res, message = 'Resource created successfully', data = null) => {
    return sendResponse(res, HTTP_STATUS.CREATED, true, message, data);
};

module.exports = {
    HTTP_STATUS,
    sendResponse,
    sendSuccess,
    sendCreated
};
