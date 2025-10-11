/**
 * Sub-Department Routes
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Sub-department routes (all POST) - only 3 APIs
router.post('/create', departmentController.createSubDepartment);
router.post('/update', departmentController.updateSubDepartment); // Handles update, activate, deactivate
router.post('/list', departmentController.getSubDepartmentsByOrgDepartment);

module.exports = router;
