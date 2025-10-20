/**
 * Rotating Shift Controller
 * Handles HTTP requests for frequency-based shift rotation patterns
 */

const rotatingShiftService = require('../../services/roster/rotatingShift.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Create rotating shift pattern
 * POST /api/roster/rotating-shifts
 */
const createRotatingShiftPattern = async (req, res) => {
    try {
        const user_id = req.user.id;
        const patternData = req.body;

        const result = await rotatingShiftService.createRotatingShiftPattern(patternData, user_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in createRotatingShiftPattern controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get rotating shift pattern by ID
 * GET /api/roster/rotating-shifts/:id
 */
const getRotatingShiftPatternById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await rotatingShiftService.getRotatingShiftPatternById(id);

        return successResponse(res, result.data, 'Rotating shift pattern retrieved successfully');

    } catch (error) {
        console.error('Error in getRotatingShiftPatternById controller:', error);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get rotating shift patterns with filters
 * GET /api/roster/rotating-shifts
 */
const getRotatingShiftPatterns = async (req, res) => {
    try {
        const filters = {
            company_id: req.query.company_id,
            frequency: req.query.frequency,
            is_active: req.query.is_active,
            active_on_date: req.query.active_on_date,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await rotatingShiftService.getRotatingShiftPatterns(filters);

        return successResponse(res, result.data, 'Rotating shift patterns retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getRotatingShiftPatterns controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update rotating shift pattern
 * PUT /api/roster/rotating-shifts/:id
 */
const updateRotatingShiftPattern = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const updateData = req.body;

        const result = await rotatingShiftService.updateRotatingShiftPattern(id, updateData, user_id);

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in updateRotatingShiftPattern controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete rotating shift pattern
 * DELETE /api/roster/rotating-shifts/:id
 */
const deleteRotatingShiftPattern = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await rotatingShiftService.deleteRotatingShiftPattern(id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteRotatingShiftPattern controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Add applicability rule to pattern
 * POST /api/roster/rotating-shifts/:pattern_id/applicability
 */
const addApplicabilityRule = async (req, res) => {
    try {
        const { pattern_id } = req.params;
        const user_id = req.user.id;
        const ruleData = req.body;

        const result = await rotatingShiftService.addApplicabilityRule(pattern_id, ruleData, user_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in addApplicabilityRule controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update applicability rule
 * PUT /api/roster/rotating-shifts/applicability/:rule_id
 */
const updateApplicabilityRule = async (req, res) => {
    try {
        const { rule_id } = req.params;
        const user_id = req.user.id;
        const updateData = req.body;

        const result = await rotatingShiftService.updateApplicabilityRule(rule_id, updateData, user_id);

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in updateApplicabilityRule controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete applicability rule
 * DELETE /api/roster/rotating-shifts/applicability/:rule_id
 */
const deleteApplicabilityRule = async (req, res) => {
    try {
        const { rule_id } = req.params;
        const user_id = req.user.id;

        const result = await rotatingShiftService.deleteApplicabilityRule(rule_id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteApplicabilityRule controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    createRotatingShiftPattern,
    getRotatingShiftPatternById,
    getRotatingShiftPatterns,
    updateRotatingShiftPattern,
    deleteRotatingShiftPattern,
    addApplicabilityRule,
    updateApplicabilityRule,
    deleteApplicabilityRule
};
