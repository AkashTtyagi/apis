/**
 * Shift Management Controller
 * Handles HTTP requests for shift configuration operations
 */

const shiftService = require('../services/shift.service');
const { sendSuccess } = require('../utils/response');

/**
 * Create a new shift
 * POST /api/shift/create
 */
const createShift = async (req, res, next) => {
    try {
        const shiftData = req.body;
        const userId = req.user?.id;
        const ipAddress = req.ip || req.connection.remoteAddress;

        const shift = await shiftService.createShift(shiftData, userId, ipAddress);

        return sendSuccess(res, 'Shift created successfully', { shift }, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get shift by ID
 * POST /api/shift/details
 */
const getShiftById = async (req, res, next) => {
    try {
        const { shift_id } = req.body;

        if (!shift_id) {
            throw new Error('shift_id is required');
        }

        const shift = await shiftService.getShiftById(parseInt(shift_id, 10));

        return sendSuccess(res, 'Shift retrieved successfully', { shift });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all shifts for a company
 * POST /api/shift/list
 */
const getAllShifts = async (req, res, next) => {
    try {
        const { company_id, filters = {}, page = 1, limit = 50 } = req.body;

        if (!company_id) {
            throw new Error('company_id is required');
        }

        const result = await shiftService.getAllShifts(
            company_id,
            filters,
            { page, limit }
        );

        return sendSuccess(res, 'Shifts retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Update shift
 * POST /api/shift/update
 */
const updateShift = async (req, res, next) => {
    try {
        const { shift_id, ...updateData } = req.body;
        const userId = req.user?.id;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!shift_id) {
            throw new Error('shift_id is required');
        }

        const shift = await shiftService.updateShift(
            parseInt(shift_id, 10),
            updateData,
            userId,
            ipAddress
        );

        return sendSuccess(res, 'Shift updated successfully', { shift });
    } catch (error) {
        next(error);
    }
};

/**
 * Activate/Deactivate shift
 * POST /api/shift/status
 */
const toggleShiftStatus = async (req, res, next) => {
    try {
        const { shift_id, is_active } = req.body;
        const userId = req.user?.id;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (!shift_id) {
            throw new Error('shift_id is required');
        }

        if (is_active === undefined) {
            throw new Error('is_active is required');
        }

        const shift = await shiftService.toggleShiftStatus(
            parseInt(shift_id, 10),
            is_active,
            userId,
            ipAddress
        );

        const message = is_active ? 'Shift activated successfully' : 'Shift deactivated successfully';
        return sendSuccess(res, message, { shift });
    } catch (error) {
        next(error);
    }
};

/**
 * Get employees assigned to a shift
 * POST /api/shift/employees
 */
const getShiftEmployees = async (req, res, next) => {
    try {
        const { shift_id } = req.body;

        if (!shift_id) {
            throw new Error('shift_id is required');
        }

        const employees = await shiftService.getShiftEmployees(parseInt(shift_id, 10));

        return sendSuccess(res, 'Shift employees retrieved successfully', {
            shift_id: parseInt(shift_id, 10),
            employee_count: employees.length,
            employees
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get shift audit logs
 * POST /api/shift/audit-logs
 */
const getShiftAuditLogs = async (req, res, next) => {
    try {
        const { shift_id, page = 1, limit = 50 } = req.body;

        if (!shift_id) {
            throw new Error('shift_id is required');
        }

        const result = await shiftService.getShiftAuditLogs(
            parseInt(shift_id, 10),
            { page: parseInt(page, 10), limit: parseInt(limit, 10) }
        );

        return sendSuccess(res, 'Audit logs retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createShift,
    getShiftById,
    getAllShifts,
    updateShift,
    toggleShiftStatus,
    getShiftEmployees,
    getShiftAuditLogs
};
