/**
 * Error Logger Utility
 * Provides detailed error logging with file names, line numbers, and stack traces
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

/**
 * Extract file name and line number from stack trace
 * @param {Error} error - Error object
 * @returns {Object} File details
 */
const extractFileDetails = (error) => {
    if (!error.stack) {
        return { file: 'unknown', line: 'unknown', column: 'unknown' };
    }

    // Parse stack trace to find the relevant file
    const stackLines = error.stack.split('\n');

    // Skip the first line (error message) and look for the first relevant stack frame
    for (let i = 1; i < stackLines.length; i++) {
        const line = stackLines[i];

        // Skip node_modules and internal Node.js files
        if (line.includes('node_modules') || line.includes('node:internal')) {
            continue;
        }

        // Extract file path, line number, and column from stack trace
        // Format: "    at functionName (/path/to/file.js:123:45)"
        const match = line.match(/\((.+):(\d+):(\d+)\)/) || line.match(/at\s+(.+):(\d+):(\d+)/);

        if (match) {
            const fullPath = match[1];
            const lineNumber = match[2];
            const column = match[3];

            // Extract just the file name and relative path
            const pathParts = fullPath.split('/');
            const srcIndex = pathParts.findIndex(part => part === 'src');
            const relativePath = srcIndex >= 0
                ? pathParts.slice(srcIndex).join('/')
                : pathParts[pathParts.length - 1];

            return {
                file: relativePath,
                line: lineNumber,
                column: column,
                fullPath: fullPath
            };
        }
    }

    return { file: 'unknown', line: 'unknown', column: 'unknown' };
};

/**
 * Format and log detailed error information
 * @param {Error} error - Error object
 * @param {string} context - Additional context (e.g., 'API', 'Database', 'Service')
 */
const logError = (error, context = '') => {
    const fileDetails = extractFileDetails(error);
    const timestamp = new Date().toISOString();

    console.error('\n' + '═'.repeat(80));
    console.error(`${colors.bright}${colors.red}ERROR OCCURRED${colors.reset}`);
    console.error('═'.repeat(80));

    if (context) {
        console.error(`${colors.cyan}Context:${colors.reset} ${context}`);
    }

    console.error(`${colors.cyan}Time:${colors.reset} ${timestamp}`);
    console.error(`${colors.cyan}File:${colors.reset} ${colors.yellow}${fileDetails.file}${colors.reset}`);
    console.error(`${colors.cyan}Line:${colors.reset} ${colors.yellow}${fileDetails.line}${colors.reset} ${colors.cyan}Column:${colors.reset} ${colors.yellow}${fileDetails.column}${colors.reset}`);

    if (fileDetails.fullPath && fileDetails.fullPath !== 'unknown') {
        console.error(`${colors.cyan}Full Path:${colors.reset} ${colors.gray}${fileDetails.fullPath}${colors.reset}`);
    }

    console.error(`${colors.cyan}Error Type:${colors.reset} ${error.name || 'Error'}`);
    console.error(`${colors.cyan}Message:${colors.reset} ${colors.red}${error.message}${colors.reset}`);

    // Additional error properties
    if (error.code) {
        console.error(`${colors.cyan}Error Code:${colors.reset} ${error.code}`);
    }

    if (error.errno) {
        console.error(`${colors.cyan}Error Number:${colors.reset} ${error.errno}`);
    }

    if (error.sql) {
        console.error(`${colors.cyan}SQL Query:${colors.reset}\n${colors.gray}${error.sql}${colors.reset}`);
    }

    if (error.sqlMessage) {
        console.error(`${colors.cyan}SQL Message:${colors.reset} ${colors.red}${error.sqlMessage}${colors.reset}`);
    }

    // Stack trace
    console.error(`\n${colors.cyan}Stack Trace:${colors.reset}`);
    console.error(colors.gray + error.stack + colors.reset);

    console.error('═'.repeat(80) + '\n');
};

/**
 * Log warning messages
 * @param {string} message - Warning message
 * @param {string} context - Additional context
 */
const logWarning = (message, context = '') => {
    const timestamp = new Date().toISOString();

    console.warn('\n' + '─'.repeat(80));
    console.warn(`${colors.bright}${colors.yellow}WARNING${colors.reset}`);
    console.warn('─'.repeat(80));

    if (context) {
        console.warn(`${colors.cyan}Context:${colors.reset} ${context}`);
    }

    console.warn(`${colors.cyan}Time:${colors.reset} ${timestamp}`);
    console.warn(`${colors.cyan}Message:${colors.reset} ${colors.yellow}${message}${colors.reset}`);
    console.warn('─'.repeat(80) + '\n');
};

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorMiddleware = (err, req, res, next) => {
    // Log the error with context
    const context = `${req.method} ${req.originalUrl || req.url}`;
    logError(err, context);

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Prepare error response
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            error: {
                name: err.name,
                stack: err.stack,
                file: extractFileDetails(err).file,
                line: extractFileDetails(err).line
            }
        })
    };

    res.status(statusCode).json(errorResponse);
};

/**
 * Wrap async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    logError,
    logWarning,
    errorMiddleware,
    asyncHandler,
    extractFileDetails
};
