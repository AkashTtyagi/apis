/**
 * Shift Swap Routes
 * Provides endpoints for employee shift swap requests with workflow
 */

const express = require('express');
const router = express.Router();
const shiftSwapController = require('../controllers/roster/shiftSwap.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * Create shift swap request
 * POST /api/shift-swap/create
 *
 * Body:
 * {
 *   company_id: 1,
 *   target_employee_id: 20,
 *   swap_date: "2025-06-15",
 *   swap_reason: "Personal commitment"
 * }
 */
router.post('/create', shiftSwapController.createShiftSwapRequest);

/**
 * Target employee responds to swap request
 * POST /api/shift-swap/respond
 *
 * Body:
 * {
 *   swap_id: 1,
 *   consent: 1,                    // 1=Approve, 2=Reject
 *   rejection_reason: "..."        // Required if consent=2
 * }
 */
router.post('/respond', shiftSwapController.respondToSwapRequest);

// Note: Workflow approval is handled by common workflow API
// Use /api/workflows/approve with workflow_master_id for SHIFT_SWAP

/**
 * Get swap request by ID
 * POST /api/shift-swap/details
 *
 * Body:
 * {
 *   swap_id: 1
 * }
 */
router.post('/details', shiftSwapController.getSwapRequestById);

/**
 * Get swap requests list
 * POST /api/shift-swap/list
 *
 * Body:
 * {
 *   company_id: 1,
 *   requester_employee_id: 10,
 *   target_employee_id: 20,
 *   employee_id: 10,               // Either requester or target
 *   swap_date: "2025-06-15",
 *   target_consent: 0,             // 0=Pending, 1=Approved, 2=Rejected
 *   approval_status: 1,            // 0=Pending, 1=Approved, 2=Rejected
 *   is_active: true,
 *   page: 1,
 *   limit: 50
 * }
 */
router.post('/list', shiftSwapController.getSwapRequests);

/**
 * Get pending swap requests for current user
 * POST /api/shift-swap/pending
 */
router.post('/pending', shiftSwapController.getPendingSwapRequestsForTarget);

/**
 * Cancel swap request (before target consent)
 * POST /api/shift-swap/cancel
 *
 * Body:
 * {
 *   swap_id: 1
 * }
 */
router.post('/cancel', shiftSwapController.cancelSwapRequest);

module.exports = router;
