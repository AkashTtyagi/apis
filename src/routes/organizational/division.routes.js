/**
 * Division Routes
 * Manages company divisions
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const divisionController = require('../../controllers/organizational/division.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Division routes (all POST)
router.post('/create', divisionController.create);
router.post('/update/:id', divisionController.update);
router.post('/list', divisionController.list);

module.exports = router;
