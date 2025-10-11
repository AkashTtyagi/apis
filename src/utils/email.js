/**
 * Email Utility
 * Handles email sending with SMTP configuration and template management
 */

const nodemailer = require('nodemailer');
const { HrmsSmtpConfig } = require('../models/HrmsSmtpConfig');
const { HrmsEmailTemplate } = require('../models/HrmsEmailTemplate');

/**
 * Get SMTP configuration for a company
 * @param {number|null} company_id - Company ID (null for default)
 * @returns {Promise<Object>} - SMTP configuration
 */
const getSmtpConfig = async (company_id = null) => {
    try {
        // First try to get company-specific config
        if (company_id) {
            const companyConfig = await HrmsSmtpConfig.findOne({
                where: {
                    company_id: company_id,
                    is_active: true
                },
                raw: true
            });

            if (companyConfig) {
                return companyConfig;
            }
        }

        // Fall back to default config (company_id IS NULL)
        const defaultConfig = await HrmsSmtpConfig.findOne({
            where: {
                company_id: null,
                is_active: true
            },
            raw: true
        });

        if (!defaultConfig) {
            throw new Error('No SMTP configuration found');
        }

        return defaultConfig;
    } catch (error) {
        console.error('Error fetching SMTP config:', error.message);
        throw error;
    }
};

/**
 * Get email template by slug
 * @param {string} slug - Template slug
 * @param {number|null} company_id - Company ID (null for default)
 * @returns {Promise<Object>} - Email template
 */
const getEmailTemplate = async (slug, company_id = null) => {
    try {
        // First try to get company-specific template
        if (company_id) {
            const companyTemplate = await HrmsEmailTemplate.findOne({
                where: {
                    slug: slug,
                    company_id: company_id,
                    is_active: true
                },
                raw: true
            });

            if (companyTemplate) {
                return companyTemplate;
            }
        }

        // Fall back to default template (company_id IS NULL)
        const defaultTemplate = await HrmsEmailTemplate.findOne({
            where: {
                slug: slug,
                company_id: null,
                is_active: true
            },
            raw: true
        });

        if (!defaultTemplate) {
            throw new Error(`Email template '${slug}' not found`);
        }

        return defaultTemplate;
    } catch (error) {
        console.error('Error fetching email template:', error.message);
        throw error;
    }
};

/**
 * Replace variables in template
 * @param {string} template - Template string
 * @param {Object} variables - Key-value pairs of variables
 * @returns {string} - Processed template
 */
const replaceVariables = (template, variables) => {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
};

/**
 * Send email using SMTP configuration
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.slug - Email template slug
 * @param {Object} options.variables - Template variables
 * @param {number|null} options.company_id - Company ID
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async ({ to, slug, variables = {}, company_id = null }) => {
    try {
        // Get SMTP configuration
        const smtpConfig = await getSmtpConfig(company_id);

        // Get email template
        const template = await getEmailTemplate(slug, company_id);

        // Replace variables in subject and body
        const subject = replaceVariables(template.subject, variables);
        const body = replaceVariables(template.body, variables);

        // Create transporter
        // const transporter = nodemailer.createTransport({
        //     host: smtpConfig.smtp_host,
        //     port: smtpConfig.smtp_port,
        //     secure: smtpConfig.smtp_encryption === 'ssl', // true for 465, false for other ports
        //     auth: {
        //         user: smtpConfig.smtp_username,
        //         pass: smtpConfig.smtp_password
        //     },
        //     tls: {
        //         rejectUnauthorized: false
        //     }
        // });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tyagiakash874@gmail.com',
                pass: 'pjzb svqm ypwc hmhj', // Not your Gmail password!
            },
        });


        // Send email
        const info = await transporter.sendMail({
            from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
            to: to,
            subject: subject,
            html: body
        });

        console.log(`✓ Email sent to ${to}: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

module.exports = {
    sendEmail,
    getSmtpConfig,
    getEmailTemplate,
    replaceVariables
};
