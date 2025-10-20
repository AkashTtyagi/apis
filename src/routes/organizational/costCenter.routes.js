/**
 * Cost Center Routes
 * Manages company cost centers
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const costCenterController = require('../../controllers/organizational/costCenter.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Cost center routes (all POST)
router.post('/create', costCenterController.create);
router.post('/update/:id', costCenterController.update);
router.post('/list', costCenterController.list);

module.exports = router;
