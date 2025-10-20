/**
 * Branch Routes
 * Manages company branches
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const branchController = require('../../controllers/organizational/branch.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Branch routes (all POST)
router.post('/create', branchController.create);
router.post('/update/:id', branchController.update);
router.post('/list', branchController.list);

module.exports = router;
