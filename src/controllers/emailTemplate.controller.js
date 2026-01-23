/**
 * Email Template Controller
 * Handles HTTP requests for email template library operations
 * All routes use POST method
 */

const emailTemplateService = require('../services/emailTemplate.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create email template
 * POST /api/email-templates/create
 */
const createEmailTemplate = async (req, res, next) => {
    try {
        const { category, slug, action_type, name, subject, body, variables, is_active } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.id;

        // Validate required fields
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const template = await emailTemplateService.createEmailTemplate({
            company_id,
            category,
            slug,
            action_type,
            name,
            subject,
            body,
            variables,
            is_active,
            user_id
        });

        return sendCreated(res, 'Email template created successfully', template);
    } catch (error) {
        next(error);
    }
};

/**
 * Update email template
 * POST /api/email-templates/update
 */
const updateEmailTemplate = async (req, res, next) => {
    try {
        const { template_id, name, subject, body, variables, is_active } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.id;

        const template = await emailTemplateService.updateEmailTemplate(template_id, company_id, {
            name,
            subject,
            body,
            variables,
            is_active,
            user_id
        });

        return sendSuccess(res, 'Email template updated successfully', template);
    } catch (error) {
        next(error);
    }
};

/**
 * Get email templates list
 * POST /api/email-templates/list
 */
const getEmailTemplates = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const { is_active, search, slug } = req.body;

        const filters = {
            is_active,
            search,
            slug
        };

        const templates = await emailTemplateService.getEmailTemplates(company_id, filters);

        return sendSuccess(res, 'Email templates retrieved successfully', templates);
    } catch (error) {
        next(error);
    }
};

/**
 * Get email template by ID
 * POST /api/email-templates/details
 */
const getEmailTemplateById = async (req, res, next) => {
    try {
        const { template_id } = req.body;
        const company_id = req.user.company_id;

        if (!template_id || isNaN(template_id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid template_id is required'
            });
        }

        const template = await emailTemplateService.getEmailTemplateById(parseInt(template_id), company_id);

        return sendSuccess(res, 'Email template retrieved successfully', template);
    } catch (error) {
        next(error);
    }
};

/**
 * Get email template by slug
 * POST /api/email-templates/by-slug
 */
const getEmailTemplateBySlug = async (req, res, next) => {
    try {
        const { slug } = req.body;
        const company_id = req.user.company_id;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: 'Template slug is required'
            });
        }

        const template = await emailTemplateService.getEmailTemplateBySlug(slug, company_id);

        return sendSuccess(res, 'Email template retrieved successfully', template);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete email template
 * POST /api/email-templates/delete
 */
const deleteEmailTemplate = async (req, res, next) => {
    try {
        const { template_id } = req.body;
        const company_id = req.user.company_id;

        if (!template_id || isNaN(template_id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid template_id is required'
            });
        }

        await emailTemplateService.deleteEmailTemplate(parseInt(template_id), company_id);

        return sendSuccess(res, 'Email template deleted successfully', { deleted: true });
    } catch (error) {
        next(error);
    }
};

/**
 * Clone template for company customization
 * POST /api/email-templates/clone
 */
const cloneTemplateForCompany = async (req, res, next) => {
    try {
        const { template_id } = req.body;
        const company_id = req.user.company_id;
        const user_id = req.user.id;

        if (!template_id || isNaN(template_id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid template_id is required'
            });
        }

        const clonedTemplate = await emailTemplateService.cloneTemplateForCompany(
            parseInt(template_id),
            company_id,
            user_id
        );

        return sendCreated(res, 'Email template cloned successfully for customization', clonedTemplate);
    } catch (error) {
        next(error);
    }
};

/**
 * Get category list with slugs
 * POST /api/email-templates/categories
 */
const getCategoryList = async (req, res, next) => {
    try {
        const categories = await emailTemplateService.getCategoryList();

        return sendSuccess(res, 'Categories retrieved successfully', categories);
    } catch (error) {
        next(error);
    }
};

/**
 * Get templates by category
 * POST /api/email-templates/by-category
 */
const getTemplatesByCategory = async (req, res, next) => {
    try {
        const { category } = req.body;
        const company_id = req.user.company_id;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const templates = await emailTemplateService.getTemplatesByCategory(category, company_id);

        return sendSuccess(res, 'Templates retrieved successfully', templates);
    } catch (error) {
        next(error);
    }
};


/**
 * Send test email
 * POST /api/email-templates/send-test
 */
const sendTestEmail = async (req, res, next) => {
    try {
        const { template_id, recipient_email, recipient_name, placeholder_values } = req.body;
        const company_id = req.user.company_id;

        if (!template_id || isNaN(template_id)) {
            return res.status(400).json({
                success: false,
                message: 'Valid template_id is required'
            });
        }

        if (!recipient_email) {
            return res.status(400).json({
                success: false,
                message: 'recipient_email is required'
            });
        }

        const result = await emailTemplateService.sendTestEmail(
            parseInt(template_id),
            company_id,
            recipient_email,
            recipient_name || 'Test User',
            placeholder_values || {}
        );

        return sendSuccess(res, 'Test email sent successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmailTemplate,
    updateEmailTemplate,
    getEmailTemplates,
    getEmailTemplateById,
    getEmailTemplateBySlug,
    deleteEmailTemplate,
    cloneTemplateForCompany,
    getCategoryList,
    getTemplatesByCategory,
    sendTestEmail
};
