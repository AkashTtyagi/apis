/**
 * Template Routes
 */

const express = require('express');
const router = express.Router();
const templateService = require('../services/template.service');
const { sendSuccess, sendCreated } = require('../utils/response');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all templates
router.get('/', async (req, res, next) => {
    try {
        const templates = await templateService.getAllTemplates();
        return sendSuccess(res, 'Templates retrieved successfully', { templates });
    } catch (error) {
        next(error);
    }
});

// Get template by slug with sections and fields
router.get('/:template_slug', async (req, res, next) => {
    try {
        const { template_slug } = req.params;
        const company_id = req.user.company_id;

        const result = await templateService.getTemplateBySlug(template_slug, company_id);
        return sendSuccess(res, 'Template retrieved successfully', result);
    } catch (error) {
        next(error);
    }
});

// Create section
router.post('/sections', async (req, res, next) => {
    try {
        const section = await templateService.createSection(req.body);
        return sendCreated(res, 'Section created successfully', { section });
    } catch (error) {
        next(error);
    }
});

// Update section
router.put('/sections/:id', async (req, res, next) => {
    try {
        const section_id = parseInt(req.params.id);
        const result = await templateService.updateSection(section_id, req.body);
        return sendSuccess(res, 'Section updated successfully', result);
    } catch (error) {
        next(error);
    }
});

// Delete section
router.delete('/sections/:id', async (req, res, next) => {
    try {
        const section_id = parseInt(req.params.id);
        const result = await templateService.deleteSection(section_id);
        return sendSuccess(res, 'Section deleted successfully', result);
    } catch (error) {
        next(error);
    }
});

// Create field
router.post('/fields', async (req, res, next) => {
    try {
        const field = await templateService.createField(req.body);
        return sendCreated(res, 'Field created successfully', { field });
    } catch (error) {
        next(error);
    }
});

// Update field
router.put('/fields/:id', async (req, res, next) => {
    try {
        const field_id = parseInt(req.params.id);
        const result = await templateService.updateField(field_id, req.body);
        return sendSuccess(res, 'Field updated successfully', result);
    } catch (error) {
        next(error);
    }
});

// Delete field
router.delete('/fields/:id', async (req, res, next) => {
    try {
        const field_id = parseInt(req.params.id);
        const result = await templateService.deleteField(field_id);
        return sendSuccess(res, 'Field deleted successfully', result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
