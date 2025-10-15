/**
 * Master Data Routes
 * Provides unified endpoints for all master_select fields
 * All routes use POST method for consistency
 */

const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Get master data
 * POST /api/master/data
 *
 * Body (all optional):
 * {
 *   master_type: "country" | "state" | "city" | "department" | "designation" | "level" | "grade" | "skill" | "leave_type" | "sub_department" | "timezone" | "currency" | "shift" | "leave_policy",
 *   filters: { country_id: 101 }  // For related data (state by country, city by state, etc.)
 * }
 *
 * Note: company_id is automatically taken from authenticated user (req.user.company_id)
 * If master_type not provided, returns all masters
 */
router.post('/data', masterController.getMasterData);

/**
 * Get multiple masters in one request
 * POST /api/master/multiple
 *
 * Body:
 * {
 *   master_types: ["country", "state", "designation", "timezone", "currency", "shift", "leave_policy"]
 * }
 *
 * Note: company_id is automatically taken from authenticated user (req.user.company_id)
 */
router.post('/multiple', masterController.getMultipleMasterData);

/**
 * Get hierarchical master data
 * POST /api/master/hierarchical
 *
 * Body examples:
 * 1. Country -> State -> City (default):
 *    {} or { type: "geographic" }
 *
 * 2. Custom hierarchy (e.g., Department -> Sub-Department):
 *    {
 *      type: "custom",
 *      parent_type: "department",
 *      child_type: "sub_department"
 *    }
 *
 * Note: company_id is automatically taken from authenticated user (req.user.company_id)
 */
router.post('/hierarchical', masterController.getHierarchicalMasterData);

module.exports = router;
