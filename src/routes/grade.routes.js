/**
 * Grade Routes
 * Manages company grades
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Grade routes (all POST)
router.post('/create', gradeController.createGrade);
router.post('/update', gradeController.updateGrade);
router.post('/list', gradeController.getGradesByCompany);

module.exports = router;
