/**
 * Zone Routes
 * Manages company zones
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const zoneController = require('../../controllers/organizational/zone.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Zone routes (all POST)
router.post('/create', zoneController.create);
router.post('/update/:id', zoneController.update);
router.post('/list', zoneController.list);

module.exports = router;
