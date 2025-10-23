/**
 * Module Routes
 * API routes for module management
 */

const express = require('express');
const router = express.Router();
const moduleController = require('../../controllers/package/module.controller');

// All routes are POST type
router.post('/get-all', moduleController.getAllModules);
router.post('/get-by-id', moduleController.getModuleById);
router.post('/create', moduleController.createModule);
router.post('/update', moduleController.updateModule);
router.post('/delete', moduleController.deleteModule);

module.exports = router;
