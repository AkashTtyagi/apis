/**
 * Roster Controller
 * Handles HTTP requests for roster management
 */

const rosterService = require('../../services/roster/roster.service');

/**
 * Create roster with date-shift pattern
 * POST /api/roster/create
 */
const createRoster = async (req, res) => {
    try {
        const user_id = req.user.id;
        const rosterData = req.body;

        const result = await rosterService.createRoster(rosterData, user_id);

        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in createRoster controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        const result = await rosterService.updateRoster(roster_id, updateData, user_id);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in updateRoster controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        if (!employee_ids || !Array.isArray(employee_ids)) {
            return errorResponse(res, 'employee_ids must be an array', 400);
        }

        const result = await rosterService.assignRosterToEmployees(roster_id, employee_ids, user_id);

        return successResponse(res, result.data, result.message, 201, result.summary);

    } catch (error) {
        console.error('Error in assignRosterToEmployees controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        const result = await rosterService.getRosterById(roster_id);

        return successResponse(res, result.data, 'Roster retrieved successfully');

    } catch (error) {
        console.error('Error in getRosterById controller:', error);
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get rosters with filters
 * POST /api/roster/list
 */
const getRosters = async (req, res) => {
    try {
        const filters = {
            company_id: req.body.company_id,
            is_active: req.body.is_active,
            search: req.body.search,
            page: req.body.page || 1,
            limit: req.body.limit || 50
        };

        const result = await rosterService.getRosters(filters);

        return successResponse(res, result.data, 'Rosters retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getRosters controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        const result = await rosterService.getRosterEmployees(roster_id);

        return successResponse(res, result.data, 'Roster employees retrieved successfully', 200, { total: result.total });

    } catch (error) {
        console.error('Error in getRosterEmployees controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        if (!employee_ids || !Array.isArray(employee_ids)) {
            return errorResponse(res, 'employee_ids must be an array', 400);
        }

        const result = await rosterService.removeEmployeesFromRoster(roster_id, employee_ids, user_id);

        return successResponse(res, result.data, result.message, 200, result.summary);

    } catch (error) {
        console.error('Error in removeEmployeesFromRoster controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
            return res.status(400).json({
                success: false,
                message: 'roster_id is required'
            });
        }

        const result = await rosterService.deleteRoster(roster_id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteRoster controller:', error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
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
