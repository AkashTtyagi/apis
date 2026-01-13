/**
 * ESS Break Routes
 * Employee Self Service - Break operations
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const breakController = require('../controllers/break.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Toggle Break (Start/End automatically)
 * POST /api/ess/break/toggle
 * Auto-detects: if on break -> end it, if not on break -> start it
 */
router.post('/toggle', breakController.toggleBreak);

/**
 * Get Break Status
 * POST /api/ess/break/status
 * Returns current break status and available breaks
 */
router.post('/status', breakController.getBreakStatus);

/**
 * Get Break History
 * POST /api/ess/break/history
 * Returns break history with date range filter
 */
router.post('/history', breakController.getBreakHistory);

module.exports = router;
