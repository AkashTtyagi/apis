/**
 * User Activation Service
 * Handles user account activation and sending login credentials
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { HrmsUserDetails } = require('../models/HrmsUserDetails');
const { sendEmail } = require('../utils/email');

/**
 * Generate random password
 * @returns {string} Random password
 */
const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString('hex');
};

/**
 * Activate user and send login credentials via email
 *
 * @param {number} user_id - User ID to activate
 * @returns {Object} Activation result
 */
const activateUser = async (user_id) => {
    // Get user details
    const user = await HrmsUserDetails.findOne({
        where: { id: user_id },
        raw: true
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.is_password_set) {
        throw new Error('User is already activated');
    }

    // Generate random password
    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Update user with password
    await HrmsUserDetails.update(
        {
            password: hashedPassword,
            is_password_set: true
        },
        {
            where: { id: user_id }
        }
    );

    // Send activation email with credentials
    const emailData = {
        to: user.email,
        subject: 'Account Activation - Login Credentials',
        template: 'user_activation',
        replacements: {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.email,
            password: plainPassword,
            login_url: process.env.FRONTEND_URL || 'http://localhost:3000/login'
        },
        company_id: user.company_id
    };

    await sendEmail(emailData);

    return {
        message: 'User activated successfully. Login credentials sent to email.',
        email: user.email
    };
};

/**
 * Resend activation email with new password
 *
 * @param {number} user_id - User ID
 * @returns {Object} Resend result
 */
const resendActivationEmail = async (user_id) => {
    // Get user details
    const user = await HrmsUserDetails.findOne({
        where: { id: user_id },
        raw: true
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Generate new random password
    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Update user with new password
    await HrmsUserDetails.update(
        {
            password: hashedPassword,
            is_password_set: true
        },
        {
            where: { id: user_id }
        }
    );

    // Send activation email with new credentials
    const emailData = {
        to: user.email,
        subject: 'Account Activation - New Login Credentials',
        template: 'user_activation',
        replacements: {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.email,
            password: plainPassword,
            login_url: process.env.FRONTEND_URL || 'http://localhost:3000/login'
        },
        company_id: user.company_id
    };

    await sendEmail(emailData);

    return {
        message: 'Activation email resent successfully with new credentials.',
        email: user.email
    };
};

module.exports = {
    activateUser,
    resendActivationEmail
};
