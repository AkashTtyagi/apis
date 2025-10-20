/**
 * Business Unit Routes
 * Manages company business units
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const businessUnitController = require('../../controllers/organizational/businessUnit.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Business unit routes (all POST)
router.post('/create', businessUnitController.create);
router.post('/update/:id', businessUnitController.update);
router.post('/list', businessUnitController.list);

module.exports = router;
