/**
 * Designation Routes
 * Manages company designations
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designation.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Designation routes (all POST)
router.post('/create', designationController.createDesignation);
router.post('/update', designationController.updateDesignation);
router.post('/list', designationController.getDesignationsByCompany);

module.exports = router;
