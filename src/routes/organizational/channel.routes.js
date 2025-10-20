/**
 * Channel Routes
 * Manages company channels
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const channelController = require('../../controllers/organizational/channel.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Channel routes (all POST)
router.post('/create', channelController.create);
router.post('/update/:id', channelController.update);
router.post('/list', channelController.list);

module.exports = router;
