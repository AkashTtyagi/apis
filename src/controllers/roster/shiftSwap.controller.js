/**
 * Shift Swap Controller
 * Handles HTTP requests for employee shift swap requests
 */

const shiftSwapService = require('../../services/roster/shiftSwap.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Create shift swap request
 * POST /api/roster/shift-swaps
 */
const createShiftSwapRequest = async (req, res) => {
    try {
        const requester_employee_id = req.user.employee_id || req.body.requester_employee_id;
        const swapData = req.body;

        const result = await shiftSwapService.createShiftSwapRequest(swapData, requester_employee_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in createShiftSwapRequest controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Target employee responds to swap request
 * POST /api/shift-swap/respond
 */
const respondToSwapRequest = async (req, res) => {
    try {
        const { swap_id, consent, rejection_reason } = req.body;
        const target_employee_id = req.user.employee_id;

        if (!swap_id) {
            return errorResponse(res, 'swap_id is required', 400);
        }

        if (![1, 2].includes(consent)) {
            return errorResponse(res, 'consent must be 1 (approve) or 2 (reject)', 400);
        }

        const result = await shiftSwapService.respondToSwapRequest(
            swap_id,
            target_employee_id,
            consent,
            rejection_reason
        );

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in respondToSwapRequest controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Workflow approver approves/rejects swap request
 * POST /api/roster/shift-swaps/:swap_id/approve
 */
const handleWorkflowApproval = async (req, res) => {
    try {
        const { swap_id } = req.params;
        const approver_user_id = req.user.id;
        const { approval_status, rejection_reason } = req.body;

        if (![1, 2].includes(approval_status)) {
            return errorResponse(res, 'approval_status must be 1 (approve) or 2 (reject)', 400);
        }

        const result = await shiftSwapService.handleWorkflowApproval(
            swap_id,
            approval_status,
            approver_user_id,
            rejection_reason
        );

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in handleWorkflowApproval controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get swap request by ID
 * GET /api/roster/shift-swaps/:id
 */
const getSwapRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await shiftSwapService.getSwapRequestById(id);

        return successResponse(res, result.data, 'Shift swap request retrieved successfully');

    } catch (error) {
        console.error('Error in getSwapRequestById controller:', error);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get swap requests with filters
 * GET /api/roster/shift-swaps
 */
const getSwapRequests = async (req, res) => {
    try {
        const filters = {
            company_id: req.query.company_id,
            requester_employee_id: req.query.requester_employee_id,
            target_employee_id: req.query.target_employee_id,
            employee_id: req.query.employee_id,
            swap_date: req.query.swap_date,
            target_consent: req.query.target_consent ? parseInt(req.query.target_consent) : undefined,
            approval_status: req.query.approval_status ? parseInt(req.query.approval_status) : undefined,
            is_active: req.query.is_active,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await shiftSwapService.getSwapRequests(filters);

        return successResponse(res, result.data, 'Shift swap requests retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getSwapRequests controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Cancel swap request
 * DELETE /api/roster/shift-swaps/:swap_id
 */
const cancelSwapRequest = async (req, res) => {
    try {
        const { swap_id } = req.params;
        const requester_employee_id = req.user.employee_id;

        const result = await shiftSwapService.cancelSwapRequest(swap_id, requester_employee_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in cancelSwapRequest controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get pending swap requests for target employee
 * GET /api/roster/shift-swaps/pending/for-me
 */
const getPendingSwapRequestsForTarget = async (req, res) => {
    try {
        const target_employee_id = req.user.employee_id;

        const result = await shiftSwapService.getPendingSwapRequestsForTarget(target_employee_id);

        return successResponse(res, result.data, 'Pending swap requests retrieved successfully', 200, { total: result.total });

    } catch (error) {
        console.error('Error in getPendingSwapRequestsForTarget controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    createShiftSwapRequest,
    respondToSwapRequest,
    getSwapRequestById,
    getSwapRequests,
    cancelSwapRequest,
    getPendingSwapRequestsForTarget
};
