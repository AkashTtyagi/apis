/**
 * Roster Controller
 * Handles HTTP requests for roster management
 */

const rosterService = require('../../services/roster/roster.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Create roster with date-shift pattern
 * POST /api/roster/create
 */
const createRoster = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { company_id } = req.user;
        const rosterData = { ...req.body, company_id };

        const result = await rosterService.createRoster(rosterData, user_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in createRoster controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update roster
 * POST /api/roster/update
 */
const updateRoster = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { roster_id, ...updateData } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        const result = await rosterService.updateRoster(roster_id, updateData, user_id);

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in updateRoster controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Assign roster to employees
 * POST /api/roster/assign-employees
 */
const assignRosterToEmployees = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { roster_id, employee_ids } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        if (!employee_ids || !Array.isArray(employee_ids)) {
            return errorResponse(res, 'employee_ids must be an array', 400);
        }

        const result = await rosterService.assignRosterToEmployees(roster_id, employee_ids, user_id);

        return successResponse(res, result.data, result.message, 201, result.summary);

    } catch (error) {
        console.error('Error in assignRosterToEmployees controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get roster by ID
 * POST /api/roster/details
 */
const getRosterById = async (req, res) => {
    try {
        const { roster_id } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        const result = await rosterService.getRosterById(roster_id);

        return successResponse(res, result.data, 'Roster retrieved successfully');

    } catch (error) {
        console.error('Error in getRosterById controller:', error);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get rosters with filters
 * POST /api/roster/list
 */
const getRosters = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            company_id,
            is_active: req.body.is_active,
            search: req.body.search,
            page: req.body.page || 1,
            limit: req.body.limit || 50
        };

        const result = await rosterService.getRosters(filters);

        return successResponse(res, result.data, 'Rosters retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getRosters controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get employees assigned to roster
 * POST /api/roster/employees
 */
const getRosterEmployees = async (req, res) => {
    try {
        const { roster_id } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        const result = await rosterService.getRosterEmployees(roster_id);

        return successResponse(res, result.data, 'Roster employees retrieved successfully', 200, { total: result.total });

    } catch (error) {
        console.error('Error in getRosterEmployees controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Remove employees from roster
 * POST /api/roster/remove-employees
 */
const removeEmployeesFromRoster = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { roster_id, employee_ids } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        if (!employee_ids || !Array.isArray(employee_ids)) {
            return errorResponse(res, 'employee_ids must be an array', 400);
        }

        const result = await rosterService.removeEmployeesFromRoster(roster_id, employee_ids, user_id);

        return successResponse(res, result.data, result.message, 200, result.summary);

    } catch (error) {
        console.error('Error in removeEmployeesFromRoster controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete roster
 * POST /api/roster/delete
 */
const deleteRoster = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { roster_id } = req.body;

        if (!roster_id) {
            return errorResponse(res, 'roster_id is required', 400);
        }

        const result = await rosterService.deleteRoster(roster_id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteRoster controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    createRoster,
    updateRoster,
    assignRosterToEmployees,
    getRosterById,
    getRosters,
    getRosterEmployees,
    removeEmployeesFromRoster,
    deleteRoster
};
