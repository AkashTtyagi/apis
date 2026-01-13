/**
 * Email Notification Service
 * Sends workflow-related email notifications
 * Uses hrms_workflow_email_templates for config and hrms_email_templates for content
 */

const { HrmsWorkflowEmailTemplate, HrmsWorkflowRequest, HrmsWorkflowAction } = require('../../models/workflow');
const { HrmsEmailTemplate } = require('../../models/HrmsEmailTemplate');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsSmtpConfig } = require('../../models/HrmsSmtpConfig');
const nodemailer = require('nodemailer');

/**
 * Get SMTP transporter for company
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Nodemailer transporter
 */
const getTransporter = async (companyId) => {
    try {
        const smtpConfig = await HrmsSmtpConfig.findOne({
            where: { company_id: companyId, is_active: 1 }
        });

        if (smtpConfig) {
            return nodemailer.createTransport({
                host: smtpConfig.smtp_host,
                port: smtpConfig.smtp_port,
                secure: smtpConfig.smtp_encryption === 'ssl',
                auth: {
                    user: smtpConfig.smtp_username,
                    pass: smtpConfig.smtp_password
                }
            });
        }

        // Fallback to environment config
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } catch (error) {
        console.error('Error getting transporter:', error);
        throw error;
    }
};

/**
 * Send workflow notification email
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @param {string} eventType - Event type (on_submission, on_approval, etc.)
 * @param {Object} additionalContext - Additional context data
 * @returns {Promise<Object>} Email send result
 */
const sendNotification = async (requestId, stageId, eventType, additionalContext = {}) => {
    try {
        // Get request details with related data
        const request = await HrmsWorkflowRequest.findByPk(requestId, {
            include: [
                { association: 'workflowConfig' },
                { association: 'workflowMaster' },
                { association: 'currentStage' }
            ]
        });

        if (!request) {
            throw new Error('Request not found');
        }

        // Get employee details
        const employee = await HrmsEmployee.findByPk(request.employee_id, {
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email', 'employee_code', 'designation_id', 'department_id', 'reporting_manager_id']
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Get email config for this stage and event
        const emailConfig = await HrmsWorkflowEmailTemplate.findOne({
            where: {
                stage_id: stageId,
                event_type: eventType
            }
        });

        // Check if email is enabled
        if (!emailConfig || !emailConfig.enabled) {
            console.log(`Email disabled for event: ${eventType}, stage: ${stageId}`);
            return { sent: false, reason: 'Email disabled for this event' };
        }

        // Get email template from hrms_email_templates
        let emailTemplate = null;
        if (emailConfig.email_template_id) {
            emailTemplate = await HrmsEmailTemplate.findByPk(emailConfig.email_template_id);
        }

        if (!emailTemplate) {
            console.log(`No email template configured for event: ${eventType}`);
            return { sent: false, reason: 'No email template configured' };
        }

        // Get latest action (if any)
        const latestAction = await HrmsWorkflowAction.findOne({
            where: { request_id: requestId },
            order: [['action_taken_at', 'DESC']]
        });

        // Build context for placeholder replacement
        const context = await buildEmailContext(request, employee, latestAction, additionalContext);

        // Replace placeholders in subject and body
        const subject = replacePlaceholders(emailTemplate.subject, context);
        const bodyHtml = replacePlaceholders(emailTemplate.body_html, context);

        // Resolve recipients
        const toRecipients = await resolveRecipients(
            emailConfig.to_recipients,
            emailConfig.custom_emails,
            context,
            request
        );
        const ccRecipients = await resolveRecipients(
            emailConfig.cc_recipients,
            emailConfig.custom_emails,
            context,
            request
        );
        const bccRecipients = await resolveRecipients(
            emailConfig.bcc_recipients,
            emailConfig.custom_emails,
            context,
            request
        );

        if (toRecipients.length === 0) {
            console.log(`No recipients resolved for event: ${eventType}`);
            return { sent: false, reason: 'No recipients' };
        }

        // Send email
        const transporter = await getTransporter(request.company_id);
        const emailResult = await sendEmail(transporter, toRecipients, ccRecipients, bccRecipients, subject, bodyHtml, request.company_id);

        // Log email sent
        await logEmailSent(requestId, eventType, toRecipients, emailResult);

        console.log(`✓ Email sent for request ${request.request_number}, event: ${eventType}`);

        return {
            sent: true,
            to: toRecipients,
            cc: ccRecipients,
            subject: subject,
            messageId: emailResult.messageId
        };

    } catch (error) {
        console.error('Error sending notification:', error);
        return { sent: false, error: error.message };
    }
};

/**
 * Build email context for placeholder replacement
 * @param {Object} request - Request object
 * @param {Object} employee - Employee object
 * @param {Object} action - Latest action object
 * @param {Object} additionalContext - Additional context
 * @returns {Promise<Object>} Context object
 */
const buildEmailContext = async (request, employee, action = null, additionalContext = {}) => {
    try {
        const context = {
            // Employee details
            employee_name: `${employee.first_name} ${employee.last_name}`,
            employee_first_name: employee.first_name,
            employee_last_name: employee.last_name,
            employee_code: employee.employee_code,
            employee_email: employee.email,

            // Request details
            request_number: request.request_number,
            request_date: request.submitted_at ? request.submitted_at.toLocaleDateString() : 'N/A',
            request_status: request.request_status,
            workflow_type: request.workflowMaster?.workflow_for_name || 'N/A',
            workflow_name: request.workflowConfig?.workflow_name || 'N/A',

            // Stage details
            current_stage: request.currentStage?.stage_name || 'N/A',
            stage_name: request.currentStage?.stage_name || 'N/A',

            // Action details
            action_type: action?.action_type || 'N/A',
            action_date: action?.action_taken_at ? action.action_taken_at.toLocaleDateString() : 'N/A',
            remarks: action?.remarks || '',

            // Request data (from JSON field)
            leave_type: request.request_data?.leave_type || 'N/A',
            leave_from_date: request.request_data?.from_date || 'N/A',
            leave_to_date: request.request_data?.to_date || 'N/A',
            leave_days: request.request_data?.duration || 'N/A',
            claim_amount: request.request_data?.claim_amount || 'N/A',
            claim_type: request.request_data?.claim_type || 'N/A',

            // System details
            current_date: new Date().toLocaleDateString(),
            current_time: new Date().toLocaleTimeString(),
            system_url: process.env.APP_URL || 'http://localhost:3000',

            // Company details
            company_name: 'Company Name',

            // Merge additional context
            ...additionalContext
        };

        // Get approver details if action exists
        if (action && action.approver_user_id) {
            const approver = await HrmsEmployee.findOne({
                where: { user_id: action.approver_user_id },
                attributes: ['first_name', 'last_name', 'email']
            });

            if (approver) {
                context.approver_name = `${approver.first_name} ${approver.last_name}`;
                context.approver_email = approver.email;
            }
        }

        // Get RM details
        if (employee.reporting_manager_id) {
            const rm = await HrmsEmployee.findByPk(employee.reporting_manager_id, {
                attributes: ['first_name', 'last_name', 'email']
            });

            if (rm) {
                context.rm_name = `${rm.first_name} ${rm.last_name}`;
                context.rm_email = rm.email;
            }
        }

        return context;

    } catch (error) {
        console.error('Error building email context:', error);
        return {};
    }
};

/**
 * Replace placeholders in template
 * @param {string} text - Template text with placeholders
 * @param {Object} context - Context data
 * @returns {string} Text with replaced placeholders
 */
const replacePlaceholders = (text, context) => {
    if (!text) return '';

    let result = text;

    // Replace all placeholders in format {{placeholder_name}}
    for (const [key, value] of Object.entries(context)) {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        result = result.replace(regex, value || '');
    }

    return result;
};

/**
 * Resolve email recipients based on recipient types
 * @param {Array} recipientConfig - Array of recipient objects [{"type": "approver"}, {"type": "hr"}]
 * @param {Array} customEmails - Array of custom email addresses
 * @param {Object} context - Context data with emails
 * @param {Object} request - Request object
 * @returns {Promise<Array>} Array of email addresses
 */
const resolveRecipients = async (recipientConfig, customEmails = [], context, request) => {
    try {
        if (!recipientConfig || !Array.isArray(recipientConfig)) return [];

        const recipients = new Set();

        for (const recipient of recipientConfig) {
            const recipientType = recipient.type;

            switch (recipientType) {
                case 'requester':
                    if (context.employee_email) {
                        recipients.add(context.employee_email);
                    }
                    break;

                case 'approver':
                    if (context.approver_email) {
                        recipients.add(context.approver_email);
                    }
                    break;

                case 'next_approver':
                    // TODO: Get next stage approver email
                    break;

                case 'hr':
                    // Get HR admin email
                    const hrAdmin = await HrmsEmployee.findOne({
                        where: {
                            company_id: request.company_id,
                            // Add HR role condition if needed
                        },
                        attributes: ['email']
                    });
                    if (hrAdmin?.email) {
                        recipients.add(hrAdmin.email);
                    }
                    break;

                case 'finance':
                    // TODO: Get finance team email
                    break;

                case 'delegatee':
                    if (context.delegatee_email) {
                        recipients.add(context.delegatee_email);
                    }
                    break;

                case 'original_approver':
                    if (context.original_approver_email) {
                        recipients.add(context.original_approver_email);
                    }
                    break;

                case 'escalation_approver':
                    if (context.escalation_approver_email) {
                        recipients.add(context.escalation_approver_email);
                    }
                    break;

                case 'approver_manager':
                    if (context.approver_manager_email) {
                        recipients.add(context.approver_manager_email);
                    }
                    break;

                case 'custom':
                    // Add custom emails
                    if (customEmails && Array.isArray(customEmails)) {
                        for (const email of customEmails) {
                            if (isValidEmail(email)) {
                                recipients.add(email);
                            }
                        }
                    }
                    break;

                default:
                    console.warn(`Unknown recipient type: ${recipientType}`);
            }
        }

        return Array.from(recipients);

    } catch (error) {
        console.error('Error resolving recipients:', error);
        return [];
    }
};

/**
 * Send email using nodemailer
 * @param {Object} transporter - Nodemailer transporter
 * @param {Array|string} to - To recipients
 * @param {Array|string} cc - CC recipients
 * @param {Array|string} bcc - BCC recipients
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (transporter, to, cc, bcc, subject, html, companyId) => {
    try {
        // Get sender info
        const smtpConfig = await HrmsSmtpConfig.findOne({
            where: { company_id: companyId, is_active: 1 }
        });

        const fromEmail = smtpConfig?.from_email || process.env.SMTP_FROM || 'noreply@company.com';
        const fromName = smtpConfig?.from_name || 'HRMS System';

        // Convert arrays to comma-separated strings
        const toStr = Array.isArray(to) ? to.join(', ') : to;
        const ccStr = Array.isArray(cc) ? cc.join(', ') : cc;
        const bccStr = Array.isArray(bcc) ? bcc.join(', ') : bcc;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: toStr,
            cc: ccStr || undefined,
            bcc: bccStr || undefined,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✓ Email sent: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Log email sent action
 * @param {number} requestId - Request ID
 * @param {string} eventType - Event type
 * @param {Array} recipients - Recipients
 * @param {Object} emailResult - Email send result
 */
const logEmailSent = async (requestId, eventType, recipients, emailResult) => {
    try {
        // Update the latest action to mark email as sent
        await HrmsWorkflowAction.update({
            email_sent: emailResult.success,
            email_sent_at: emailResult.success ? new Date() : null
        }, {
            where: { request_id: requestId },
            order: [['action_taken_at', 'DESC']],
            limit: 1
        });

        console.log(`✓ Email log updated for request ${requestId}`);

    } catch (error) {
        console.error('Error logging email sent:', error);
    }
};

/**
 * Validate email address
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
};

/**
 * Send bulk notifications
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<Array>} Results
 */
const sendBulkNotifications = async (notifications) => {
    const results = [];

    for (const notification of notifications) {
        const result = await sendNotification(
            notification.requestId,
            notification.stageId,
            notification.eventType,
            notification.additionalContext
        );
        results.push(result);
    }

    return results;
};

/**
 * Send reminder email for pending approval
 * @param {number} requestId - Request ID
 * @param {number} stageId - Stage ID
 * @returns {Promise<Object>} Send result
 */
const sendReminderEmail = async (requestId, stageId) => {
    return await sendNotification(requestId, stageId, 'on_pending_reminder');
};

module.exports = {
    sendNotification,
    buildEmailContext,
    replacePlaceholders,
    resolveRecipients,
    sendEmail,
    logEmailSent,
    sendBulkNotifications,
    sendReminderEmail,
    getTransporter
};
