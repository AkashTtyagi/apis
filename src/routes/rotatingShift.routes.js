/**
 * Rotating Shift Routes
 * Provides endpoints for frequency-based shift rotation pattern management
 */

const express = require('express');
const router = express.Router();
const rotatingShiftController = require('../controllers/rotatingShift/rotatingShift.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Create rotating shift pattern
 * POST /api/rotating-shift/create
 *
 * Body:
 * {
 *   company_id: 1,
 *   pattern_name: "Day-Evening-Night Rotation",
 *   pattern_description: "Weekly rotation for production team",
 *   shift_order: [1, 2, 3],
 *   frequency: "weekly",
 *   start_date: "2025-01-01",
 *   end_date: "2025-12-31",
 *   applicability_rules: [
 *     {
 *       applicability_type: "department",
 *       applicability_value: "1,2,3",
 *       is_excluded: false,
 *       advanced_applicability_type: "branch",
 *       advanced_applicability_value: "1",
 *       priority: 1
 *     }
 *   ]
 * }
 */
router.post('/create', rotatingShiftController.createRotatingShiftPattern);

/**
 * Update rotating shift pattern
 * POST /api/rotating-shift/update
 *
 * Body:
 * {
 *   pattern_id: 1,
 *   pattern_name: "Updated Pattern Name",
 *   shift_order: [1, 2, 3, 4],
 *   frequency: "bi-weekly",
 *   applicability_rules: [...]
 * }
 */
router.post('/update', rotatingShiftController.updateRotatingShiftPattern);

/**
 * Get rotating shift pattern by ID
 * POST /api/rotating-shift/details
 *
 * Body:
 * {
 *   pattern_id: 1
 * }
 */
router.post('/details', rotatingShiftController.getRotatingShiftPatternById);

/**
 * Get rotating shift patterns list
 * POST /api/rotating-shift/list
 *
 * Body:
 * {
 *   company_id: 1,
 *   frequency: "weekly",
 *   is_active: true,
 *   active_on_date: "2025-06-15",
 *   search: "rotation",
 *   page: 1,
 *   limit: 50
 * }
 */
router.post('/list', rotatingShiftController.getRotatingShiftPatterns);

/**
 * Delete rotating shift pattern
 * POST /api/rotating-shift/delete
 *
 * Body:
 * {
 *   pattern_id: 1
 * }
 */
router.post('/delete', rotatingShiftController.deleteRotatingShiftPattern);

module.exports = router;
