/**
 * Holiday Policy Controller
 * Handles HTTP requests for holiday policy operations
 */

const holidayPolicyService = require('../../services/holiday/holidayPolicy.service');

/**
 * Get all holiday policies
 * POST /api/holiday/policy/list
 */
const getAllPolicies = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const { year } = req.body;

        const filters = { company_id };
        if (year) filters.year = year;

        const policies = await holidayPolicyService.getAllPolicies(filters);

        res.status(200).json({
            success: true,
            data: policies,
            message: 'Holiday policies fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching holiday policies:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch holiday policies'
        });
    }
};

/**
 * Get holiday policy by ID
 * POST /api/holiday/policy/detail
 */
const getPolicyById = async (req, res) => {
    try {
        const { id } = req.body;
        const policy = await holidayPolicyService.getPolicyById(id);

        res.status(200).json({
            success: true,
            data: policy,
            message: 'Holiday policy fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching holiday policy:', error);
        res.status(error.message === 'Holiday policy not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to fetch holiday policy'
        });
    }
};

/**
 * Create new holiday policy
 * POST /api/holiday-policy
 */
const createPolicy = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const company_id = req.user.company_id;
        const policyData = { ...req.body, company_id };

        const policy = await holidayPolicyService.createPolicy(policyData, userId);

        res.status(201).json({
            success: true,
            data: policy,
            message: 'Holiday policy created successfully'
        });
    } catch (error) {
        console.error('Error creating holiday policy:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create holiday policy'
        });
    }
};

/**
 * Update holiday policy
 * POST /api/holiday/policy/update
 */
const updatePolicy = async (req, res) => {
    try {
        const { id, ...policyData } = req.body;
        const userId = req.user?.id || null;
        const policy = await holidayPolicyService.updatePolicy(id, policyData, userId);

        res.status(200).json({
            success: true,
            data: policy,
            message: 'Holiday policy updated successfully'
        });
    } catch (error) {
        console.error('Error updating holiday policy:', error);
        res.status(error.message === 'Holiday policy not found' ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to update holiday policy'
        });
    }
};

/**
 * Delete holiday policy
 * POST /api/holiday/policy/delete
 */
const deletePolicy = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await holidayPolicyService.deletePolicy(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting holiday policy:', error);
        res.status(error.message === 'Holiday policy not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to delete holiday policy'
        });
    }
};

/**
 * Add holidays to policy
 * POST /api/holiday/policy/add-holidays
 */
const addHolidaysToPolicy = async (req, res) => {
    try {
        const { policy_id, holiday_ids } = req.body;
        const result = await holidayPolicyService.addHolidaysToPolicy(policy_id, holiday_ids);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error adding holidays to policy:', error);
        res.status(error.message === 'Holiday policy not found' ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to add holidays to policy'
        });
    }
};

/**
 * Remove holiday from policy
 * POST /api/holiday/policy/remove-holiday
 */
const removeHolidayFromPolicy = async (req, res) => {
    try {
        const { policy_id, holiday_id } = req.body;
        const result = await holidayPolicyService.removeHolidayFromPolicy(policy_id, holiday_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error removing holiday from policy:', error);
        res.status(error.message === 'Holiday mapping not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to remove holiday from policy'
        });
    }
};

module.exports = {
    getAllPolicies,
    getPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    addHolidaysToPolicy,
    removeHolidayFromPolicy
};
