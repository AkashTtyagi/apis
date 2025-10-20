/**
 * Location Routes
 * Manages company locations
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/organizational/location.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Location routes (all POST)
router.post('/create', locationController.create);
router.post('/update/:id', locationController.update);
router.post('/list', locationController.list);

module.exports = router;
