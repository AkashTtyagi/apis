/**
 * Leave Policy Controller
 * Handles HTTP requests for leave policy operations
 */

const leavePolicyService = require('../services/leavePolicy.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create leave policy
 * POST /api/leave-policies
 */
const createLeavePolicy = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const company_id = req.user.company_id;

        const policy = await leavePolicyService.createLeavePolicy({
            ...req.body,
            company_id,
            user_id
        });

        return sendCreated(res, 'Leave policy created successfully', { policy });
    } catch (error) {
        next(error);
    }
};

/**
 * Update leave policy
 * PUT /api/leave-policies/:id
 */
const updateLeavePolicy = async (req, res, next) => {
    try {
        const policy_id = parseInt(req.params.id) || parseInt(req.body.policy_id);
        const user_id = req.user.id;
        const company_id = req.user.company_id;

        const policy = await leavePolicyService.updateLeavePolicy(policy_id, {
            ...req.body,
            user_id,
            company_id
        });

        return sendSuccess(res, 'Leave policy updated successfully', { policy });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle leave type active status in policy
 * PATCH /api/leave-policies/:policyId/leave-types/:leaveTypeId/toggle
 */
const toggleLeaveTypeInPolicy = async (req, res, next) => {
    try {
        const policy_id = parseInt(req.params.policyId);
        const leave_type_id = parseInt(req.params.leaveTypeId);
        const company_id = req.user.company_id;
        const { is_active } = req.body;

        const result = await leavePolicyService.toggleLeaveTypeInPolicy(
            policy_id,
            leave_type_id,
            is_active,
            company_id
        );

        return sendSuccess(res, 'Leave type status updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all leave policies for company
 * GET /api/leave-policies
 */
const getLeavePolicies = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const { is_active, include_inactive_leave_types } = req.query;

        const policies = await leavePolicyService.getLeavePolicies(
            company_id,
            is_active,
            include_inactive_leave_types === 'true'
        );

        return sendSuccess(res, 'Leave policies fetched successfully', { policies });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single leave policy by ID
 * GET /api/leave-policies/:id
 */
const getLeavePolicyById = async (req, res, next) => {
    try {
        const policy_id = parseInt(req.params.id);
        const company_id = req.user.company_id;
        const { include_inactive_leave_types } = req.query;

        const policy = await leavePolicyService.getPolicyById(
            policy_id,
            company_id,
            include_inactive_leave_types === 'true'
        );

        return sendSuccess(res, 'Leave policy fetched successfully', { policy });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete leave policy (soft delete)
 * DELETE /api/leave-policies/:id
 */
const deleteLeavePolicy = async (req, res, next) => {
    try {
        const policy_id = parseInt(req.params.id);
        const company_id = req.user.company_id;

        await leavePolicyService.deleteLeavePolicy(policy_id, company_id);

        return sendSuccess(res, 'Leave policy deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLeavePolicy,
    updateLeavePolicy,
    toggleLeaveTypeInPolicy,
    getLeavePolicies,
    getLeavePolicyById,
    deleteLeavePolicy
};
