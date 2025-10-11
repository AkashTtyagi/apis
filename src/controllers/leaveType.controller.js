/**
 * Leave Type Controller
 * Handles HTTP requests for leave type operations
 */

const leaveTypeService = require('../services/leaveType.service');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create leave type
 * POST /api/leave-types
 */
const createLeaveType = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const company_id = req.user.company_id;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('user-agent');

        const leaveType = await leaveTypeService.createLeaveType({
            ...req.body,
            company_id,
            user_id,
            ip_address,
            user_agent
        });

        return sendCreated(res, 'Leave type created successfully', { leaveType });
    } catch (error) {
        next(error);
    }
};

/**
 * Update leave type
 * PUT /api/leave-types/:id
 */
const updateLeaveType = async (req, res, next) => {
    try {
        const leave_type_id = parseInt(req.params.id);
        const user_id = req.user.id;
        const company_id = req.user.company_id;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('user-agent');

        const result = await leaveTypeService.updateLeaveType(leave_type_id, {
            ...req.body,
            user_id,
            company_id,
            ip_address,
            user_agent
        });

        return sendSuccess(res, 'Leave type updated successfully', result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all leave types for company
 * GET /api/leave-types
 */
const getLeaveTypes = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const { is_active } = req.query;

        const leaveTypes = await leaveTypeService.getLeaveTypes(company_id, is_active);

        return sendSuccess(res, 'Leave types fetched successfully', { leaveTypes });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single leave type by ID
 * GET /api/leave-types/:id
 */
const getLeaveTypeById = async (req, res, next) => {
    try {
        const leave_type_id = parseInt(req.params.id);
        const company_id = req.user.company_id;

        const leaveType = await leaveTypeService.getLeaveTypeById(leave_type_id, company_id);

        return sendSuccess(res, 'Leave type fetched successfully', { leaveType });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete leave type (soft delete)
 * DELETE /api/leave-types/:id
 */
const deleteLeaveType = async (req, res, next) => {
    try {
        const leave_type_id = parseInt(req.params.id);
        const company_id = req.user.company_id;
        const user_id = req.user.id;
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('user-agent');

        await leaveTypeService.deleteLeaveType(leave_type_id, company_id, user_id, ip_address, user_agent);

        return sendSuccess(res, 'Leave type deleted successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Get audit logs for a leave type
 * GET /api/leave-types/:id/audit-logs
 */
const getLeaveTypeAuditLogs = async (req, res, next) => {
    try {
        const leave_type_id = parseInt(req.params.id);
        const company_id = req.user.company_id;

        const auditLogs = await leaveTypeService.getLeaveTypeAuditLogs(leave_type_id, company_id);

        return sendSuccess(res, 'Audit logs fetched successfully', { auditLogs });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLeaveType,
    updateLeaveType,
    getLeaveTypes,
    getLeaveTypeById,
    deleteLeaveType,
    getLeaveTypeAuditLogs
};
