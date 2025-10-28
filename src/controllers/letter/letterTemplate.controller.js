/**
 * Letter Template Controller
 * Handles HTTP requests for letter template management
 */

const letterTemplateService = require('../../services/letter/letterTemplate.service');

/**
 * Create a new letter template
 * POST /api/letters/templates
 */
const createTemplate = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const companyId = req.user?.company_id || req.headers['x-organization-id'];

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        // Add company_id to template data
        const templateData = {
            ...req.body,
            company_id: parseInt(companyId)
        };

        const template = await letterTemplateService.createLetterTemplate(templateData, userId);

        return res.status(201).json({
            success: true,
            message: 'Letter template created successfully',
            data: template
        });
    } catch (error) {
        console.error('Controller - Create letter template error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create letter template'
        });
    }
};

/**
 * Update letter template
 * PUT /api/letters/templates/:id
 */
const updateTemplate = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const companyId = req.user?.company_id || req.headers['x-organization-id'];
        const templateId = parseInt(req.params.id);

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const template = await letterTemplateService.updateLetterTemplate(
            templateId,
            req.body,
            parseInt(companyId),
            userId
        );

        return res.status(200).json({
            success: true,
            message: 'Letter template updated successfully',
            data: template
        });
    } catch (error) {
        console.error('Controller - Update letter template error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update letter template'
        });
    }
};

/**
 * Get all letter templates
 * GET /api/letters/templates
 */
const getAllTemplates = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.headers['x-organization-id'];

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        // Extract filters from query params
        const filters = {
            category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
            is_draft: req.query.is_draft !== undefined ? req.query.is_draft === 'true' : undefined,
            search: req.query.search || null
        };

        const templates = await letterTemplateService.getAllLetterTemplates(parseInt(companyId), filters);

        return res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Controller - Get all letter templates error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch letter templates'
        });
    }
};

/**
 * Get letter template by ID
 * GET /api/letters/templates/:id
 */
const getTemplateById = async (req, res) => {
    try {
        const templateId = parseInt(req.params.id);

        const template = await letterTemplateService.getLetterTemplateById(templateId);

        return res.status(200).json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Controller - Get letter template by ID error:', error.message);
        return res.status(404).json({
            success: false,
            message: error.message || 'Letter template not found'
        });
    }
};

/**
 * Delete letter template
 * DELETE /api/letters/templates/:id
 */
const deleteTemplate = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.user_id;
        const companyId = req.user?.company_id || req.headers['x-organization-id'];
        const templateId = parseInt(req.params.id);

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Company ID is required'
            });
        }

        const result = await letterTemplateService.deleteLetterTemplate(
            templateId,
            parseInt(companyId),
            userId
        );

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Controller - Delete letter template error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete letter template'
        });
    }
};

/**
 * Get all letter categories
 * GET /api/letters/categories
 */
const getAllCategories = async (req, res) => {
    try {
        const categories = await letterTemplateService.getAllCategories();

        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Controller - Get all categories error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};

module.exports = {
    createTemplate,
    updateTemplate,
    getAllTemplates,
    getTemplateById,
    deleteTemplate,
    getAllCategories
};
