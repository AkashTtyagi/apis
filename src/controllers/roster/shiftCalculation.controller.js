/**
 * Shift Calculation Controller
 * Handles HTTP requests for calculating employee shifts with priority logic
 */

const shiftCalculationService = require('../../services/roster/shiftCalculation.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Get employee shift for a specific date
 * GET /api/roster/shift-calculation/employee/:employee_id
 * Query params: date (YYYY-MM-DD)
 *
 * Priority order: default shift < rotating_shift < roster < shift_swap
 */
const getEmployeeShift = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const { date } = req.query;

        if (!date) {
            return errorResponse(res, 'date query parameter is required (format: YYYY-MM-DD)', 400);
        }

        const result = await shiftCalculationService.getEmployeeShift(employee_id, date);

        return successResponse(res, result.data, 'Employee shift calculated successfully');

    } catch (error) {
        console.error('Error in getEmployeeShift controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get employee shifts for multiple dates
 * POST /api/roster/shift-calculation/bulk
 * Body: { employee_ids: [1,2,3], dates: ['2025-01-20', '2025-01-21'] }
 */
const getEmployeeShiftsBulk = async (req, res) => {
    try {
        const { employee_ids, dates } = req.body;

        if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
            return errorResponse(res, 'employee_ids must be a non-empty array', 400);
        }

        if (!Array.isArray(dates) || dates.length === 0) {
            return errorResponse(res, 'dates must be a non-empty array', 400);
        }

        const result = await shiftCalculationService.getEmployeeShiftsBulk(employee_ids, dates);

        return successResponse(res, result.data, 'Employee shifts calculated successfully', 200, { total: result.total });

    } catch (error) {
        console.error('Error in getEmployeeShiftsBulk controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    getEmployeeShift,
    getEmployeeShiftsBulk
};
