/**
 * Leave Credit Cron Routes
 * Routes for manually triggering leave credit cron jobs (for testing/admin)
 */

const express = require('express');
const router = express.Router();
const leaveCreditCronController = require('../../controllers/cron/leaveCreditCron.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Run leave credit cron for specific frequency
router.post('/run', leaveCreditCronController.runLeaveCreditByFrequency);

module.exports = router;
