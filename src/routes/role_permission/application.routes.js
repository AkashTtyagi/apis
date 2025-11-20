/**
 * Application Routes
 * API routes for application management
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/role_permission/application.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// All routes are POST type
router.post('/get-all', applicationController.getAllApplications);
router.post('/get-by-id', applicationController.getApplicationById);
router.post('/create', applicationController.createApplication);
router.post('/update', applicationController.updateApplication);
router.post('/delete', applicationController.deleteApplication);

module.exports = router;
