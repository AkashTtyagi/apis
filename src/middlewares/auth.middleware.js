/**
 * Authentication Middleware
 * Verifies JWT token and attaches user details to request object
 */

const jwt = require('jsonwebtoken');
const { HrmsUserDetails } = require('../models/HrmsUserDetails');
const { HrmsEmployee } = require('../models/HrmsEmployee');
const { Sequelize, Op } = require('sequelize');

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

        // Get user and employee details in a single query
        const user = await HrmsUserDetails.findOne({
            where: {
                id: decoded.id
            },
            attributes: [
                'id',
                'email',
                'phone',
                'company_id',
                [Sequelize.literal('`employee`.`id`'), 'employee_id'],
                [Sequelize.literal('`employee`.`employee_code`'), 'employee_code'],
                [Sequelize.literal('`employee`.`first_name`'), 'first_name'],
                [Sequelize.literal('`employee`.`middle_name`'), 'middle_name'],
                [Sequelize.literal('`employee`.`last_name`'), 'last_name'],
                [Sequelize.literal('`employee`.`date_of_birth`'), 'date_of_birth'],
                [Sequelize.literal('`employee`.`gender`'), 'gender'],
                [Sequelize.literal('`employee`.`date_of_joining`'), 'date_of_joining'],
                [Sequelize.literal('`employee`.`department_id`'), 'department_id'],
                [Sequelize.literal('`employee`.`sub_department_id`'), 'sub_department_id'],
                [Sequelize.literal('`employee`.`designation_id`'), 'designation_id'],
                [Sequelize.literal('`employee`.`level_id`'), 'level_id'],
                [Sequelize.literal('`employee`.`reporting_manager_id`'), 'reporting_manager_id'],
                [Sequelize.literal('`employee`.`leave_policy_id`'), 'leave_policy_id'],
                [Sequelize.literal('`employee`.`shift_id`'), 'shift_id'],
                [Sequelize.literal('`employee`.`timezone_id`'), 'timezone_id'],
                [Sequelize.literal('`employee`.`employee_type_id`'), 'employee_type_id'],
                [Sequelize.literal('`employee`.`notice_period`'), 'notice_period'],
                [Sequelize.literal('`employee`.`status`'), 'status'],
                [Sequelize.literal('`employee`.`profile_picture`'), 'profile_picture']
            ],
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    where: {
                        status: { [Op.notIn]: [3, 4, 5, 6] }
                    },
                    attributes: [],
                    required: true
                }
            ],
            raw: true
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User or employee not found'
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
            attributes: [
                'id',
                'email',
                'phone',
                'company_id',
                [Sequelize.literal('`employee`.`id`'), 'employee_id'],
                [Sequelize.literal('`employee`.`employee_code`'), 'employee_code'],
                [Sequelize.literal('`employee`.`first_name`'), 'first_name'],
                [Sequelize.literal('`employee`.`middle_name`'), 'middle_name'],
                [Sequelize.literal('`employee`.`last_name`'), 'last_name'],
                [Sequelize.literal('`employee`.`date_of_birth`'), 'date_of_birth'],
                [Sequelize.literal('`employee`.`gender`'), 'gender'],
                [Sequelize.literal('`employee`.`date_of_joining`'), 'date_of_joining'],
                [Sequelize.literal('`employee`.`department_id`'), 'department_id'],
                [Sequelize.literal('`employee`.`sub_department_id`'), 'sub_department_id'],
                [Sequelize.literal('`employee`.`designation_id`'), 'designation_id'],
                [Sequelize.literal('`employee`.`level_id`'), 'level_id'],
                [Sequelize.literal('`employee`.`reporting_manager_id`'), 'reporting_manager_id'],
                [Sequelize.literal('`employee`.`leave_policy_id`'), 'leave_policy_id'],
                [Sequelize.literal('`employee`.`shift_id`'), 'shift_id'],
                [Sequelize.literal('`employee`.`timezone_id`'), 'timezone_id'],
                [Sequelize.literal('`employee`.`employee_type_id`'), 'employee_type_id'],
                [Sequelize.literal('`employee`.`notice_period`'), 'notice_period'],
                [Sequelize.literal('`employee`.`status`'), 'status'],
                [Sequelize.literal('`employee`.`profile_picture`'), 'profile_picture']
            ],
            include: [
                {
                    model: HrmsEmployee,
                    as: 'employee',
                    where: {
                        status: { [Op.notIn]: [3, 4, 5, 6] }
                    },
                    attributes: [],
                    required: false
                }
            ],
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
