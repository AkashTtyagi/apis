/**
 * Rotating Shift Controller
 * Handles HTTP requests for frequency-based shift rotation patterns
 */

const rotatingShiftService = require('../../services/rotatingShift/rotatingShift.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Create rotating shift pattern
 * POST /api/rotating-shift/create
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
 * Update rotating shift pattern
 * POST /api/rotating-shift/update
 */
const updateRotatingShiftPattern = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { pattern_id, ...updateData } = req.body;

        if (!pattern_id) {
            return errorResponse(res, 'pattern_id is required', 400);
        }

        const result = await rotatingShiftService.updateRotatingShiftPattern(pattern_id, updateData, user_id);

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in updateRotatingShiftPattern controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get rotating shift pattern by ID
 * POST /api/rotating-shift/details
 */
const getRotatingShiftPatternById = async (req, res) => {
    try {
        const { pattern_id } = req.body;

        if (!pattern_id) {
            return errorResponse(res, 'pattern_id is required', 400);
        }

        const result = await rotatingShiftService.getRotatingShiftPatternById(pattern_id);

        return successResponse(res, result.data, 'Rotating shift pattern retrieved successfully');

    } catch (error) {
        console.error('Error in getRotatingShiftPatternById controller:', error);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get rotating shift patterns with filters
 * POST /api/rotating-shift/list
 */
const getRotatingShiftPatterns = async (req, res) => {
    try {
        const filters = {
            company_id: req.body.company_id,
            frequency: req.body.frequency,
            is_active: req.body.is_active,
            active_on_date: req.body.active_on_date,
            search: req.body.search,
            page: req.body.page || 1,
            limit: req.body.limit || 50
        };

        const result = await rotatingShiftService.getRotatingShiftPatterns(filters);

        return successResponse(res, result.data, 'Rotating shift patterns retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getRotatingShiftPatterns controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete rotating shift pattern
 * POST /api/rotating-shift/delete
 */
const deleteRotatingShiftPattern = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { pattern_id } = req.body;

        if (!pattern_id) {
            return errorResponse(res, 'pattern_id is required', 400);
        }

        const result = await rotatingShiftService.deleteRotatingShiftPattern(pattern_id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteRotatingShiftPattern controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    createRotatingShiftPattern,
    updateRotatingShiftPattern,
    getRotatingShiftPatternById,
    getRotatingShiftPatterns,
    deleteRotatingShiftPattern
};
