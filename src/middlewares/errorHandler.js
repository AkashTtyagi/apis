/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const { HTTP_STATUS } = require('../utils/response');

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    next(error);
};

/**
 * Global error handler
 * Catches all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Handle specific error types
    let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Internal Server Error';

    // Handle duplicate entry errors (already exists)
    if (err.message && err.message.includes('already exists')) {
        statusCode = HTTP_STATUS.CONFLICT;
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation failed';
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(statusCode).json({
            success: false,
            message,
            timestamp: new Date().toISOString(),
            errors
        });
    }

    // Handle database errors
    if (err.sqlMessage || err.parent?.sqlMessage || err.name === 'SequelizeDatabaseError') {
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = 'We are facing some technical difficulties. Please try again later.';
    }

    // Send error response
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    // Include error details only in development mode
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    notFoundHandler,
    errorHandler
};
