/**
 * Level Routes
 * Manages company levels
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const levelController = require('../controllers/level.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Level routes (all POST)
router.post('/create', levelController.createLevel);
router.post('/update', levelController.updateLevel);
router.post('/list', levelController.getLevelsByCompany);

module.exports = router;
