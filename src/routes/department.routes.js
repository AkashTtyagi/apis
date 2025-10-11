/**
 * Department Routes
 * Manages organization department mappings (HrmsOrgDepartments)
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const orgDepartmentController = require('../controllers/orgDepartment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Organization Department routes (all POST)
router.post('/create', orgDepartmentController.createOrgDepartment);
router.post('/update', orgDepartmentController.updateOrgDepartment);
router.post('/list', orgDepartmentController.getOrgDepartments);

module.exports = router;
