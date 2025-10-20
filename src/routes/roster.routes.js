/**
 * Roster Management Routes
 * Provides endpoints for roster creation and employee assignment
 */

const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/roster/roster.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Create roster with date-shift pattern
 * POST /api/roster/create
 *
 * Body:
 * {
 *   company_id: 1,
 *   roster_name: "Week 1 Rotation",
 *   roster_description: "First week rotation pattern",
 *   roster_pattern: [
 *     { date: "2025-06-01", shift_id: 1 },
 *     { date: "2025-06-02", shift_id: 2 },
 *     { date: "2025-06-03", shift_id: 3 }
 *   ]
 * }
 */
router.post('/create', rosterController.createRoster);

/**
 * Update roster
 * POST /api/roster/update
 *
 * Body:
 * {
 *   roster_id: 1,
 *   roster_name: "Updated Week 1 Rotation",
 *   roster_description: "Updated description",
 *   roster_pattern: [
 *     { date: "2025-06-01", shift_id: 1 },
 *     { date: "2025-06-02", shift_id: 2 }
 *   ]
 * }
 */
router.post('/update', rosterController.updateRoster);

/**
 * Assign roster to employees
 * POST /api/roster/assign-employees
 *
 * Body:
 * {
 *   roster_id: 1,
 *   employee_ids: [10, 11, 12, 13]
 * }
 */
router.post('/assign-employees', rosterController.assignRosterToEmployees);

/**
 * Get roster by ID
 * POST /api/roster/details
 *
 * Body:
 * {
 *   roster_id: 1
 * }
 */
router.post('/details', rosterController.getRosterById);

/**
 * Get rosters list
 * POST /api/roster/list
 *
 * Body:
 * {
 *   company_id: 1,
 *   is_active: true,
 *   search: "rotation",
 *   page: 1,
 *   limit: 50
 * }
 */
router.post('/list', rosterController.getRosters);

/**
 * Get employees assigned to roster
 * POST /api/roster/employees
 *
 * Body:
 * {
 *   roster_id: 1
 * }
 */
router.post('/employees', rosterController.getRosterEmployees);

/**
 * Remove employees from roster
 * POST /api/roster/remove-employees
 *
 * Body:
 * {
 *   roster_id: 1,
 *   employee_ids: [10, 11]
 * }
 */
router.post('/remove-employees', rosterController.removeEmployeesFromRoster);

/**
 * Delete roster
 * POST /api/roster/delete
 *
 * Body:
 * {
 *   roster_id: 1
 * }
 */
router.post('/delete', rosterController.deleteRoster);

module.exports = router;
