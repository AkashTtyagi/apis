/**
 * Skill Routes
 * Manages company skills
 * All routes use POST method
 */

const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Skill routes (all POST)
router.post('/create', skillController.createSkill);
router.post('/update', skillController.updateSkill);
router.post('/list', skillController.getSkillsByCompany);

module.exports = router;
