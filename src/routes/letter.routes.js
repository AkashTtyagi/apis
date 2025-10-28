/**
 * Letter Management Routes
 * Handles all letter template and generation related routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const templateController = require('../controllers/letter/letterTemplate.controller');
const generationController = require('../controllers/letter/letterGeneration.controller');
const emailController = require('../controllers/letter/letterEmail.controller');

// ============================================
// Letter Template Management Routes
// ============================================

/**
 * Create new letter template
 * POST /api/letters/templates
 */
router.post('/templates', authenticate, templateController.createTemplate);

/**
 * Update letter template
 * PUT /api/letters/templates/:id
 */
router.put('/templates/:id', authenticate, templateController.updateTemplate);

/**
 * Get all letter templates with filters
 * GET /api/letters/templates
 * Query params: category_id, is_draft, search
 */
router.get('/templates', authenticate, templateController.getAllTemplates);

/**
 * Get letter template by ID
 * GET /api/letters/templates/:id
 */
router.get('/templates/:id', authenticate, templateController.getTemplateById);

/**
 * Delete letter template (soft delete)
 * DELETE /api/letters/templates/:id
 */
router.delete('/templates/:id', authenticate, templateController.deleteTemplate);

/**
 * Get all letter categories with template count
 * GET /api/letters/categories
 */
router.get('/categories', authenticate, templateController.getAllCategories);

// ============================================
// Letter Generation Routes
// ============================================

/**
 * Generate letter for employee
 * POST /api/letters/generate
 */
router.post('/generate', authenticate, generationController.generateLetter);

/**
 * Preview letter HTML
 * POST /api/letters/preview
 */
router.post('/preview', authenticate, generationController.previewLetter);

/**
 * Check if approval is required
 * GET /api/letters/check-approval/:templateId/:employeeId
 */
router.get('/check-approval/:templateId/:employeeId', authenticate, generationController.checkApproval);

/**
 * Get employee letters
 * GET /api/letters/employee/:employeeId/letters
 */
router.get('/employee/:employeeId/letters', authenticate, generationController.getEmployeeLetters);

/**
 * Get letter details by document ID
 * GET /api/letters/letters/:documentId
 */
router.get('/letters/:documentId', authenticate, generationController.getLetterDetails);

/**
 * Download letter PDF
 * GET /api/letters/download/:documentId
 */
router.get('/download/:documentId', authenticate, generationController.downloadPDF);

// ============================================
// Letter Email Routes
// ============================================

/**
 * Send letter via email
 * POST /api/letters/send-email
 */
router.post('/send-email', authenticate, emailController.sendEmail);

/**
 * Preview letter email
 * POST /api/letters/preview-email
 */
router.post('/preview-email', authenticate, emailController.previewEmail);

module.exports = router;
