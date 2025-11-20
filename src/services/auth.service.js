/**
 * Authentication Service
 * Handles user authentication operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { HrmsUserDetails } = require('../models/HrmsUserDetails');
const { HrmsPasswordResetToken } = require('../models/HrmsPasswordResetToken');
const { HrmsEmployee } = require('../models/HrmsEmployee');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

/**
 * Hash password
 * @param {string} password - Plain password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {string} password - Plain password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - Match result
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token
 * @returns {string} - Random token
 */
const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Create password reset/set token
 * @param {number} user_id - User ID
 * @param {string} token_type - Token type (set_password or reset_password)
 * @returns {Promise<string>} - Generated token
 */
const createPasswordToken = async (user_id, token_type = 'reset_password') => {
    try {
        const token = generateRandomToken();
        const hashedToken = await hashPassword(token);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Invalidate all previous tokens for this user
        await HrmsPasswordResetToken.update(
            {
                is_used: true,
                used_at: new Date()
            },
            {
                where: {
                    user_id: user_id,
                    is_used: false
                }
            }
        );

        // Create new token
        await HrmsPasswordResetToken.create({
            user_id: user_id,
            token: hashedToken,
            token_type: token_type,
            expires_at: expiresAt
        });

        return token;
    } catch (error) {
        throw error;
    }
};

/**
 * Verify password token
 * @param {string} token - Plain token
 * @param {string} token_type - Token type
 * @returns {Promise<Object>} - Token record if valid
 */
const verifyPasswordToken = async (token, token_type) => {
    try {
        const { Op } = require('sequelize');

        // Get all unused tokens of this type
        const tokens = await HrmsPasswordResetToken.findAll({
            where: {
                token_type: token_type,
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date()
                }
            },
            raw: true
        });

        if (!tokens || tokens.length === 0) {
            throw new Error('Invalid or expired token');
        }

        // Find matching token
        for (const tokenRecord of tokens) {
            const isMatch = await comparePassword(token, tokenRecord.token);
            if (isMatch) {
                return tokenRecord;
            }
        }

        throw new Error('Invalid or expired token');
    } catch (error) {
        throw error;
    }
};

/**
 * Set password for first time
 * @param {Object} data - Password data
 * @param {string} data.token - Password set token
 * @param {string} data.password - New password
 * @returns {Promise<Object>} - Result
 */
const setPassword = async ({ token, password }) => {
    try {
        // Verify token
        const tokenRecord = await verifyPasswordToken(token, 'set_password');

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Update user password
        await HrmsUserDetails.update(
            {
                password: hashedPassword,
                is_password_set: true
            },
            {
                where: {
                    id: tokenRecord.user_id
                }
            }
        );

        // Mark token as used
        await HrmsPasswordResetToken.update(
            {
                is_used: true,
                used_at: new Date()
            },
            {
                where: {
                    id: tokenRecord.id
                }
            }
        );

        // Get user details with employee name
        const user = await HrmsUserDetails.findOne({
            where: {
                id: tokenRecord.user_id
            },
            attributes: ['id', 'email', 'company_id'],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['first_name', 'last_name'],
                required: false
            }],
            raw: true,
            nest: true
        });

        return {
            success: true,
            message: 'Password set successfully',
            user: user
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Login result with token
 */
const login = async ({ email, password }) => {
    try {
        // Find user by email with employee details
        const user = await HrmsUserDetails.findOne({
            where: {
                email: email
            },
            attributes: ['id', 'email', 'password', 'company_id', 'is_password_set'],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['first_name', 'last_name'],
                required: false
            }],
            raw: true,
            nest: true
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if password is set
        if (!user.is_password_set || !user.password) {
            throw new Error('Password not set. Please set your password first');
        }

        // Compare password
        const isPasswordMatch = await comparePassword(password, user.password);

        if (!isPasswordMatch) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            company_id: user.company_id
        });

        // Remove password from response
        delete user.password;

        return {
            success: true,
            message: 'Login successful',
            token,
            user: user
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Request password reset
 * @param {Object} data - Reset request data
 * @param {string} data.email - User email
 * @returns {Promise<Object>} - Result
 */
const forgotPassword = async ({ email }) => {
    try {
        // Find user by email with employee details
        const user = await HrmsUserDetails.findOne({
            where: {
                email: email
            },
            attributes: ['id', 'email', 'company_id'],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['first_name', 'last_name'],
                required: false
            }],
            raw: true,
            nest: true
        });

        if (!user) {
            // Don't reveal if email exists or not for security
            return {
                success: true,
                message: 'If your email is registered, you will receive a password reset link'
            };
        }

        // Generate reset token
        const token = await createPasswordToken(user.id, 'reset_password');

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Get user name from employee record
        const userName = user.employee && user.employee.first_name
            ? `${user.employee.first_name} ${user.employee.last_name || ''}`.trim()
            : user.email; // Fallback to email if employee record not found

        // Send email
        await sendEmail({
            to: user.email,
            slug: 'reset_password',
            variables: {
                user_name: userName,
                reset_link: resetLink
            },
            company_id: user.company_id
        });

        return {
            success: true,
            message: 'If your email is registered, you will receive a password reset link'
        };
    } catch (error) {
        console.error('Forgot password error:', error.message);
        // Don't expose error details
        return {
            success: true,
            message: 'If your email is registered, you will receive a password reset link'
        };
    }
};

/**
 * Reset password
 * @param {Object} data - Reset password data
 * @param {string} data.token - Reset token
 * @param {string} data.password - New password
 * @returns {Promise<Object>} - Result
 */
const resetPassword = async ({ token, password }) => {
    try {
        // Verify token
        const tokenRecord = await verifyPasswordToken(token, 'reset_password');

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Update user password
        await HrmsUserDetails.update(
            {
                password: hashedPassword,
                is_password_set: true
            },
            {
                where: {
                    id: tokenRecord.user_id
                }
            }
        );

        // Mark token as used
        await HrmsPasswordResetToken.update(
            {
                is_used: true,
                used_at: new Date()
            },
            {
                where: {
                    id: tokenRecord.id
                }
            }
        );

        return {
            success: true,
            message: 'Password reset successfully'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Send password set email to new user
 * @param {number} user_id - User ID
 * @returns {Promise<Object>} - Result
 */
const sendPasswordSetEmail = async (user_id) => {
    try {
        // Get user details with employee name (name is in hrms_employees table)
        const user = await HrmsUserDetails.findOne({
            where: {
                id: user_id
            },
            attributes: ['id', 'email', 'company_id'],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['first_name', 'last_name'],
                required: false
            }],
            raw: true,
            nest: true
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate set password token
        const token = await createPasswordToken(user.id, 'set_password');

        // Create set password link
        const setPasswordLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`;

        // Get user name from employee record
        const userName = user.employee && user.employee.first_name
            ? `${user.employee.first_name} ${user.employee.last_name || ''}`.trim()
            : user.email; // Fallback to email if employee record not found

        // Send email
        await sendEmail({
            to: user.email,
            slug: 'set_password',
            variables: {
                user_name: userName,
                set_password_link: setPasswordLink
            },
            company_id: user.company_id
        });

        return {
            success: true,
            message: 'Password set email sent successfully'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Resend password set email
 * @param {Object} data - User data
 * @param {string} data.email - User email
 * @returns {Promise<Object>} - Result
 */
const resendPasswordSetEmail = async ({ email }) => {
    try {
        // Find user by email with employee details
        const user = await HrmsUserDetails.findOne({
            where: {
                email: email
            },
            attributes: ['id', 'email', 'company_id', 'is_password_set'],
            include: [{
                model: HrmsEmployee,
                as: 'employee',
                attributes: ['first_name', 'last_name'],
                required: false
            }],
            raw: true,
            nest: true
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if password is already set
        if (user.is_password_set) {
            throw new Error('Password already set. Please use forgot password if you need to reset it');
        }

        // Send password set email
        await sendPasswordSetEmail(user.id);

        return {
            success: true,
            message: 'Password set email sent successfully'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user (blacklist token)
 * @param {string} token - JWT token to blacklist
 * @returns {Promise<Object>} - Logout result
 */
const logout = async (token) => {
    try {
        const { setCache } = require('../utils/redis');

        // Decode token to get expiration time
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            throw new Error('Invalid token');
        }

        // Calculate remaining time until token expires
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - currentTime;

        // If token already expired, no need to blacklist
        if (expiresIn <= 0) {
            return {
                success: true,
                message: 'Logged out successfully'
            };
        }

        // Blacklist token in Redis with expiration
        const blacklistKey = `blacklist:${token}`;
        await setCache(blacklistKey, 'logged_out', expiresIn);

        return {
            success: true,
            message: 'Logged out successfully'
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    setPassword,
    login,
    logout,
    forgotPassword,
    resetPassword,
    sendPasswordSetEmail,
    resendPasswordSetEmail,
    generateToken,
    hashPassword,
    comparePassword
};
