/**
 * Holiday Policy Controller
 * Handles HTTP requests for holiday policy operations
 */

const holidayPolicyService = require('../../services/holiday/holidayPolicy.service');

/**
 * Get all holiday policies
 * GET /api/holiday-policy
 */
const getAllPolicies = async (req, res) => {
    try {
        const { company_id, year } = req.query;

        const filters = {};
        if (company_id) filters.company_id = company_id;
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
 * GET /api/holiday-policy/:id
 */
const getPolicyById = async (req, res) => {
    try {
        const { id } = req.params;

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
        const policyData = req.body;

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
 * PUT /api/holiday-policy/:id
 */
const updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || null;
        const policyData = req.body;

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
 * DELETE /api/holiday-policy/:id
 */
const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;

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
 * POST /api/holiday-policy/:id/holidays
 */
const addHolidaysToPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { holiday_ids } = req.body;

        if (!holiday_ids || !Array.isArray(holiday_ids) || holiday_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Holiday IDs array is required'
            });
        }

        const result = await holidayPolicyService.addHolidaysToPolicy(id, holiday_ids);

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
 * DELETE /api/holiday-policy/:policyId/holidays/:holidayId
 */
const removeHolidayFromPolicy = async (req, res) => {
    try {
        const { policyId, holidayId } = req.params;

        const result = await holidayPolicyService.removeHolidayFromPolicy(policyId, holidayId);

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
