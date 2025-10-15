/**
 * Shift Management Routes
 * Provides endpoints for shift configuration and management
 */

const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Create a new shift
 * POST /api/shift/create
 *
 * Body:
 * {
 *   company_id: 1,
 *   shift_code: "SHIFT_DAY",
 *   shift_name: "Day Shift",
 *   shift_colour: "#3498db",
 *   description: "Standard day shift",
 *   shift_start_time: "09:00:00",
 *   first_half_duration: "04:30:00",  // API accepts TIME format
 *   second_half_duration: "04:30:00",
 *   checkin_allowed_before_minutes: 120,
 *   grace_time_late_minutes: 15,
 *   grace_time_early_minutes: 15,
 *   min_minutes_half_day: 270,
 *   min_minutes_full_day: 540,
 *   absent_half_day_after_minutes: 120,
 *   has_shift_allowance: 0,
 *   restrict_manager_backdate: 1,
 *   manager_backdate_days_allowed: 7,
 *   enable_break_deduction: 1,
 *   has_custom_weekly_off: 0,
 *   breaks: [
 *     {
 *       break_name: "Lunch Break",
 *       break_start_after_minutes: 240,
 *       break_duration_minutes: 60,
 *       break_order: 1,
 *       is_paid: 0,
 *       is_mandatory: 1
 *     }
 *   ],
 *   weekly_off: [
 *     {
 *       week_number: 1,
 *       day_of_week: "sunday",
 *       off_type: "full_day"
 *     }
 *   ]
 * }
 */
router.post('/create', shiftController.createShift);

/**
 * Get all shifts for a company
 * POST /api/shift/list
 *
 * Body:
 * {
 *   company_id: 1,
 *   filters: {
 *     is_active: 1,
 *     is_night_shift: 0,
 *     has_shift_allowance: 1
 *   },
 *   page: 1,
 *   limit: 50
 * }
 */
router.post('/list', shiftController.getAllShifts);

/**
 * Get shift by ID
 * POST /api/shift/details
 *
 * Body:
 * {
 *   shift_id: 1
 * }
 */
router.post('/details', shiftController.getShiftById);

/**
 * Update shift
 * POST /api/shift/update
 *
 * Body:
 * {
 *   shift_id: 1,
 *   shift_name: "Updated Shift",
 *   ... other fields to update
 * }
 */
router.post('/update', shiftController.updateShift);

/**
 * Activate/Deactivate shift
 * POST /api/shift/status
 *
 * Body:
 * {
 *   shift_id: 1,
 *   is_active: 1  // 1 = activate, 0 = deactivate
 * }
 */
router.post('/status', shiftController.toggleShiftStatus);

/**
 * Get employees assigned to a shift
 * POST /api/shift/employees
 *
 * Body:
 * {
 *   shift_id: 1
 * }
 */
router.post('/employees', shiftController.getShiftEmployees);

/**
 * Get shift audit logs
 * POST /api/shift/audit-logs
 *
 * Body:
 * {
 *   shift_id: 1,
 *   page: 1,
 *   limit: 50
 * }
 */
router.post('/audit-logs', shiftController.getShiftAuditLogs);

module.exports = router;
