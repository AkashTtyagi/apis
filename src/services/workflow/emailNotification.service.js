/**
 * Email Notification Service
 * Sends workflow-related email notifications
 */

const { HrmsWorkflowEmailTemplate, HrmsWorkflowRequest, HrmsWorkflowAction } = require('../../models/workflow');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const nodemailer = require('nodemailer');

// Configure email transporter (update with your SMTP settings)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * Send workflow notification email
 * @param {number} requestId - Request ID
 * @param {string} eventType - Event type (submission, approval, rejection, etc.)
 * @param {Array|string} customRecipients - Custom recipients (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendNotification = async (requestId, eventType, customRecipients = null) => {
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
            attributes: ['id', 'user_id', 'first_name', 'last_name', 'email', 'employee_code', 'designation_id', 'department_id']
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Get email template
        const template = await getEmailTemplate(request.workflow_master_id, eventType, request.company_id);

        if (!template) {
            console.log(`No email template found for event: ${eventType}`);
            return { sent: false, reason: 'No template configured' };
        }

        // Get latest action (if any)
        const latestAction = await HrmsWorkflowAction.findOne({
            where: { request_id: requestId },
            order: [['action_taken_at', 'DESC']]
        });

        // Build context for placeholder replacement
        const context = await buildEmailContext(request, employee, latestAction);

        // Replace placeholders in subject and body
        const subject = replacePlaceholders(template.subject, context);
        const bodyHtml = replacePlaceholders(template.body_html, context);

        // Resolve recipients
        const toRecipients = customRecipients || await resolveRecipients(template.to_recipients, context, request);
        const ccRecipients = await resolveRecipients(template.cc_recipients, context, request);
        const bccRecipients = await resolveRecipients(template.bcc_recipients, context, request);

        // Send email
        const emailResult = await sendEmail(toRecipients, ccRecipients, bccRecipients, subject, bodyHtml);

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
 * Get email template for event type
 * @param {number} workflowMasterId - Workflow master ID
 * @param {string} eventType - Event type
 * @param {number} companyId - Company ID
 * @returns {Promise<Object>} Email template
 */
const getEmailTemplate = async (workflowMasterId, eventType, companyId) => {
    try {
        // Try to find workflow-specific template
        let template = await HrmsWorkflowEmailTemplate.findOne({
            where: {
                company_id: companyId,
                workflow_master_id: workflowMasterId,
                event_type: eventType,
                is_active: true
            }
        });

        // If not found, try global template (workflow_master_id = NULL)
        if (!template) {
            template = await HrmsWorkflowEmailTemplate.findOne({
                where: {
                    company_id: companyId,
                    workflow_master_id: null,
                    event_type: eventType,
                    is_active: true,
                    is_default: true
                }
            });
        }

        return template;

    } catch (error) {
        console.error('Error getting email template:', error);
        return null;
    }
};

/**
 * Build email context for placeholder replacement
 * @param {Object} request - Request object
 * @param {Object} employee - Employee object
 * @param {Object} action - Latest action object
 * @returns {Promise<Object>} Context object
 */
const buildEmailContext = async (request, employee, action = null) => {
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

            // Company details (to be populated if needed)
            company_name: 'Company Name', // TODO: Get from company table
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

        // Get RM details for cc
        if (employee.reporting_manager_id) {
            const rm = await HrmsEmployee.findByPk(employee.reporting_manager_id, {
                attributes: ['first_name', 'last_name', 'email']
            });

            if (rm) {
                context.rm_name = `${rm.first_name} ${rm.last_name}`;
                context.rm_email = rm.email;
            }
        }

        // Get HR admin email (placeholder - implement based on your HR structure)
        context.hr_email = 'hr@company.com'; // TODO: Get from HR admin table

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
 * Resolve email recipients
 * @param {Array|string} recipientConfig - Recipient configuration (can include placeholders)
 * @param {Object} context - Context data
 * @param {Object} request - Request object
 * @returns {Promise<Array>} Array of email addresses
 */
const resolveRecipients = async (recipientConfig, context, request) => {
    try {
        if (!recipientConfig) return [];

        let recipients = [];

        // If string, convert to array
        if (typeof recipientConfig === 'string') {
            recipientConfig = [recipientConfig];
        }

        // If not array, return empty
        if (!Array.isArray(recipientConfig)) {
            return [];
        }

        for (const recipient of recipientConfig) {
            // Replace placeholders in recipient
            const resolvedRecipient = replacePlaceholders(recipient, context);

            // Validate email format
            if (isValidEmail(resolvedRecipient)) {
                recipients.push(resolvedRecipient);
            } else {
                console.warn(`Invalid email address: ${resolvedRecipient}`);
            }
        }

        return recipients;

    } catch (error) {
        console.error('Error resolving recipients:', error);
        return [];
    }
};

/**
 * Send email using nodemailer
 * @param {Array|string} to - To recipients
 * @param {Array|string} cc - CC recipients
 * @param {Array|string} bcc - BCC recipients
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (to, cc, bcc, subject, html) => {
    try {
        // Convert arrays to comma-separated strings
        const toStr = Array.isArray(to) ? to.join(', ') : to;
        const ccStr = Array.isArray(cc) ? cc.join(', ') : cc;
        const bccStr = Array.isArray(bcc) ? bcc.join(', ') : bcc;

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@company.com',
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
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
            notification.eventType,
            notification.customRecipients
        );
        results.push(result);
    }

    return results;
};

/**
 * Send reminder email for pending approval
 * @param {number} requestId - Request ID
 * @returns {Promise<Object>} Send result
 */
const sendReminderEmail = async (requestId) => {
    return await sendNotification(requestId, 'pending_reminder');
};

module.exports = {
    sendNotification,
    getEmailTemplate,
    buildEmailContext,
    replacePlaceholders,
    resolveRecipients,
    sendEmail,
    logEmailSent,
    sendBulkNotifications,
    sendReminderEmail
};
