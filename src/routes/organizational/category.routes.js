/**
 * Category Routes
 * Manages company categories
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/organizational/category.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Category routes (all POST)
router.post('/create', categoryController.create);
router.post('/update/:id', categoryController.update);
router.post('/list', categoryController.list);

module.exports = router;
