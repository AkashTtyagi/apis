/**
 * ESS Break Controller
 * Handles HTTP requests for employee break operations
 */

const breakService = require('../services/break.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

/**
 * Toggle Break (Start/End automatically)
 * POST /api/ess/break/toggle
 *
 * Body: {
 *   break_rule_id: number (optional) - Link to shift break rule,
 *   remarks: string (optional) - Break reason
 * }
 */
const toggleBreak = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const company_id = req.user.company_id;

        const breakData = {
            break_rule_id: req.body.break_rule_id || null,
            remarks: req.body.remarks || null
        };

        const result = await breakService.toggleBreak(employee_id, company_id, breakData);

        if (result.action === 'start') {
            return sendCreated(res, result.message, result.data);
        } else {
            return sendSuccess(res, result.message, result.data);
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get Break Status
 * POST /api/ess/break/status
 *
 * Returns current break status, today's breaks, available breaks from shift
 */
const getBreakStatus = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const company_id = req.user.company_id;

        const status = await breakService.getBreakStatus(employee_id, company_id);

        return sendSuccess(res, 'Break status retrieved successfully', status);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Break History
 * POST /api/ess/break/history
 *
 * Body: {
 *   from_date: 'YYYY-MM-DD' (optional),
 *   to_date: 'YYYY-MM-DD' (optional),
 *   limit: number (optional),
 *   offset: number (optional)
 * }
 */
const getBreakHistory = async (req, res, next) => {
    try {
        const employee_id = req.user.employee_id;
        const company_id = req.user.company_id;

        const filters = {
            from_date: req.body.from_date,
            to_date: req.body.to_date,
            limit: req.body.limit,
            offset: req.body.offset
        };

        const history = await breakService.getBreakHistory(employee_id, company_id, filters);

        return sendSuccess(res, 'Break history retrieved successfully', history);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    toggleBreak,
    getBreakStatus,
    getBreakHistory
};
