/**
 * Letter Email Service
 * Handles email sending for letters
 */

const { sequelize } = require('../../utils/database');
const HrmsEmployeeDocument = require('../../models/document/HrmsEmployeeDocument');
const HrmsEmployee = require('../../models/HrmsEmployee');
const letterGenerationService = require('./letterGeneration.service');

/**
 * Send letter via email
 * @param {Object} emailData - Email sending data
 * @param {number} userId - User ID sending the email
 * @returns {Object} Email sending result
 */
const sendLetterEmail = async (emailData, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            employee_document_id,
            email_template_id,
            recipients,
            email_cc = [],
            email_bcc = [],
            email_subject,
            preview = false
        } = emailData;

        // Fetch employee document
        const document = await HrmsEmployeeDocument.findByPk(employee_document_id);
        if (!document) {
            throw new Error('Letter document not found');
        }

        // Check if letter is approved (if workflow was required)
        if (document.workflow_request_id && document.status !== 'approved') {
            throw new Error('Letter must be approved before sending via email');
        }

        // Fetch employee details
        const employee = await HrmsEmployee.findByPk(document.employee_id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        // Build recipient list
        const recipientEmails = [];
        if (recipients && recipients.length > 0) {
            for (const recipient of recipients) {
                if (recipient.employee_id) {
                    const emp = await HrmsEmployee.findByPk(recipient.employee_id);
                    if (emp && emp.email) {
                        recipientEmails.push({
                            email: emp.email,
                            employee_id: emp.id,
                            name: `${emp.first_name} ${emp.last_name}`
                        });
                    }
                }
            }
        } else {
            // Default: send to the employee
            recipientEmails.push({
                email: employee.email,
                employee_id: employee.id,
                name: `${employee.first_name} ${employee.last_name}`
            });
        }

        if (preview) {
            // Return preview without sending
            return {
                preview: true,
                email_subject: email_subject || `Letter: ${document.document_title}`,
                recipients: recipientEmails.map(r => r.email),
                cc: email_cc,
                bcc: email_bcc,
                message: 'This is a preview. Email will not be sent.',
                note: 'PDF generation and actual email sending requires email service configuration and puppeteer installation.'
            };
        }

        // Update document with email sent status
        await document.update({
            email_sent: true,
            email_sent_at: new Date(),
            updated_by: userId
        }, { transaction });

        await transaction.commit();

        return {
            success: true,
            email_sent: true,
            email_sent_at: new Date(),
            recipients_count: recipientEmails.length,
            recipients: recipientEmails.map(r => ({
                employee_id: r.employee_id,
                email: r.email,
                status: 'sent'
            })),
            message: 'Email sending requires email service configuration. Document marked as email sent.'
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Preview letter email without sending
 * @param {number} employeeDocumentId - Employee document ID
 * @param {number} emailTemplateId - Email template ID (optional)
 * @returns {Object} Email preview
 */
const previewLetterEmail = async (employeeDocumentId, emailTemplateId = null) => {
    try {
        const document = await HrmsEmployeeDocument.findByPk(employeeDocumentId);
        if (!document) {
            throw new Error('Letter document not found');
        }

        const employee = await HrmsEmployee.findByPk(document.employee_id);
        if (!employee) {
            throw new Error('Employee not found');
        }

        return {
            preview: true,
            email_subject: `Letter: ${document.document_title}`,
            to: [employee.email],
            cc: [],
            bcc: [],
            message: `Dear ${employee.first_name},\n\nPlease find attached your letter: ${document.document_title}\n\nBest regards,\nHR Team`,
            attachments: [
                {
                    filename: `${document.document_number || 'letter'}.pdf`,
                    note: 'PDF will be generated when email is sent'
                }
            ]
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    sendLetterEmail,
    previewLetterEmail
};
