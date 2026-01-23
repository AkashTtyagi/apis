/**
 * Email Template Routes
 * Manages email template library
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplate.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Email Template routes (all POST)
router.post('/create', emailTemplateController.createEmailTemplate);
router.post('/update', emailTemplateController.updateEmailTemplate);
router.post('/list', emailTemplateController.getEmailTemplates);
router.post('/details', emailTemplateController.getEmailTemplateById);
router.post('/by-slug', emailTemplateController.getEmailTemplateBySlug);
router.post('/by-category', emailTemplateController.getTemplatesByCategory);
router.post('/categories', emailTemplateController.getCategoryList);
router.post('/delete', emailTemplateController.deleteEmailTemplate);
router.post('/clone', emailTemplateController.cloneTemplateForCompany);
router.post('/send-test', emailTemplateController.sendTestEmail);

module.exports = router;
