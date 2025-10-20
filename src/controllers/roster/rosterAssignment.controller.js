/**
 * Roster Assignment Controller
 * Handles HTTP requests for date-based roster shift assignments
 */

const rosterAssignmentService = require('../../services/roster/rosterAssignment.service');
const { successResponse, errorResponse } = require('../../utils/responseHandler');

/**
 * Create roster assignment
 * POST /api/roster/assignments
 */
const createRosterAssignment = async (req, res) => {
    try {
        const user_id = req.user.id;
        const assignmentData = req.body;

        const result = await rosterAssignmentService.createRosterAssignment(assignmentData, user_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in createRosterAssignment controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Create bulk roster assignments
 * POST /api/roster/assignments/bulk
 */
const createBulkRosterAssignments = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { assignments } = req.body;

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return errorResponse(res, 'assignments must be a non-empty array', 400);
        }

        const result = await rosterAssignmentService.createBulkRosterAssignments(assignments, user_id);

        return successResponse(res, result.data, result.message, 201);

    } catch (error) {
        console.error('Error in createBulkRosterAssignments controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get roster assignment by ID
 * GET /api/roster/assignments/:id
 */
const getRosterAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await rosterAssignmentService.getRosterAssignmentById(id);

        return successResponse(res, result.data, 'Roster assignment retrieved successfully');

    } catch (error) {
        console.error('Error in getRosterAssignmentById controller:', error);
        return errorResponse(res, error.message, 404);
    }
};

/**
 * Get roster assignments with filters
 * GET /api/roster/assignments
 */
const getRosterAssignments = async (req, res) => {
    try {
        const filters = {
            company_id: req.query.company_id,
            employee_id: req.query.employee_id,
            shift_id: req.query.shift_id,
            date_from: req.query.date_from,
            date_to: req.query.date_to,
            is_active: req.query.is_active,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await rosterAssignmentService.getRosterAssignments(filters);

        return successResponse(res, result.data, 'Roster assignments retrieved successfully', 200, result.pagination);

    } catch (error) {
        console.error('Error in getRosterAssignments controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Update roster assignment
 * PUT /api/roster/assignments/:id
 */
const updateRosterAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const updateData = req.body;

        const result = await rosterAssignmentService.updateRosterAssignment(id, updateData, user_id);

        return successResponse(res, result.data, result.message);

    } catch (error) {
        console.error('Error in updateRosterAssignment controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Delete roster assignment
 * DELETE /api/roster/assignments/:id
 */
const deleteRosterAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await rosterAssignmentService.deleteRosterAssignment(id, user_id);

        return successResponse(res, null, result.message);

    } catch (error) {
        console.error('Error in deleteRosterAssignment controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

/**
 * Get employee roster for date range
 * GET /api/roster/assignments/employee/:employee_id/range
 */
const getEmployeeRosterByDateRange = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const { date_from, date_to } = req.query;

        if (!date_from || !date_to) {
            return errorResponse(res, 'date_from and date_to are required', 400);
        }

        const result = await rosterAssignmentService.getEmployeeRosterByDateRange(
            employee_id,
            date_from,
            date_to
        );

        return successResponse(res, result.data, 'Employee roster retrieved successfully', 200, { total: result.total });

    } catch (error) {
        console.error('Error in getEmployeeRosterByDateRange controller:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = {
    createRosterAssignment,
    createBulkRosterAssignments,
    getRosterAssignmentById,
    getRosterAssignments,
    updateRosterAssignment,
    deleteRosterAssignment,
    getEmployeeRosterByDateRange
};
