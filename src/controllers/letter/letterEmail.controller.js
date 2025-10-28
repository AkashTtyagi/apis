/**
 * Letter Email Controller
 * Handles HTTP requests for letter email sending
 */

const letterEmailService = require('../../services/letter/letterEmail.service');

/**
 * Send letter via email
 * POST /api/letters/send-email
 */
const sendEmail = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;

        const emailData = {
            ...req.body
        };

        const result = await letterEmailService.sendLetterEmail(emailData, userId);

        if (emailData.preview) {
            return res.status(200).json({
                success: true,
                message: 'Email preview generated',
                data: result
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Letter email sent successfully',
            data: result
        });

    } catch (error) {
        console.error('Controller - Send email error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to send letter email'
        });
    }
};

/**
 * Preview letter email without sending
 * POST /api/letters/preview-email
 */
const previewEmail = async (req, res) => {
    try {
        const { employee_document_id, email_template_id } = req.body;

        if (!employee_document_id) {
            return res.status(400).json({
                success: false,
                message: 'Employee document ID is required'
            });
        }

        const preview = await letterEmailService.previewLetterEmail(
            employee_document_id,
            email_template_id || null
        );

        return res.status(200).json({
            success: true,
            data: preview
        });

    } catch (error) {
        console.error('Controller - Preview email error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to preview email'
        });
    }
};

module.exports = {
    sendEmail,
    previewEmail
};
