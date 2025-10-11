/**
 * Authentication Middleware
 * Verifies JWT token and attaches user details to request object
 */

const jwt = require('jsonwebtoken');
const { HrmsUserDetails } = require('../models/HrmsUserDetails');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user details from database
        const user = await HrmsUserDetails.findOne({
            where: {
                id: decoded.id
            },
            attributes: ['id', 'email', 'first_name', 'last_name', 'company_id', 'is_password_set'],
            raw: true
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found'
            });
        }

        // Attach user details to request object
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Optional authentication - attaches user if token exists but doesn't fail if missing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const user = await HrmsUserDetails.findOne({
            where: {
                id: decoded.id
            },
            attributes: ['id', 'email', 'first_name', 'last_name', 'company_id', 'is_password_set'],
            raw: true
        });

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
