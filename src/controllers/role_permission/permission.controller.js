/**
 * Permission Controller
 * HTTP handlers for permission master management and user permissions
 */

const permissionService = require('../../services/role_permission/permission.service');
const userPermissionService = require('../../services/role_permission/userPermission.service');

/**
 * Get all permissions
 * POST /api/permissions/get-all
 */
const getAllPermissions = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.body.is_active
        };

        const permissions = await permissionService.getAllPermissions(filters);

        res.status(200).json({
            success: true,
            data: permissions,
            count: permissions.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get permission by ID
 * POST /api/permissions/get-by-id
 */
const getPermissionById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const permission = await permissionService.getPermissionById(id);

        res.status(200).json({
            success: true,
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get permission by code
 * POST /api/permissions/get-by-code
 */
const getPermissionByCode = async (req, res, next) => {
    try {
        const { code } = req.body;
        const permission = await permissionService.getPermissionByCode(code);

        res.status(200).json({
            success: true,
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create permission
 * POST /api/permissions/create
 */
const createPermission = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const permission = await permissionService.createPermission(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Permission created successfully',
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update permission
 * POST /api/permissions/update
 */
const updatePermission = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const permission = await permissionService.updatePermission(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Permission updated successfully',
            data: permission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete permission
 * POST /api/permissions/delete
 */
const deletePermission = async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await permissionService.deletePermission(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Assign role to user
 * POST /api/permissions/users/assign-role
 */
const assignRoleToUser = async (req, res, next) => {
    try {
        const assignedBy = req.user.id;
        const companyId = req.user.company_id;
        const assignmentData = {
            ...req.body,
            company_id: companyId
        };

        const userRole = await userPermissionService.assignRoleToUser(assignmentData, assignedBy);

        res.status(201).json({
            success: true,
            message: 'Role assigned to user successfully',
            data: userRole
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke role from user
 * POST /api/permissions/users/revoke-role
 */
const revokeRoleFromUser = async (req, res, next) => {
    try {
        const { user_role_id } = req.body;
        const revokedBy = req.user.id;

        const result = await userPermissionService.revokeRoleFromUser(user_role_id, revokedBy);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user roles
 * POST /api/permissions/users/get-roles
 */
const getUserRoles = async (req, res, next) => {
    try {
        const { user_id, application_id } = req.body;
        const companyId = req.user.company_id;

        const roles = await userPermissionService.getUserRoles(user_id, companyId, application_id);

        res.status(200).json({
            success: true,
            data: roles,
            count: roles.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Grant permission to user (override)
 * POST /api/permissions/users/grant-permission
 */
const grantPermissionToUser = async (req, res, next) => {
    try {
        const grantedBy = req.user.id;
        const companyId = req.user.company_id;
        const permissionData = {
            ...req.body,
            company_id: companyId
        };

        const userPermission = await userPermissionService.grantPermissionToUser(
            permissionData,
            grantedBy
        );

        res.status(201).json({
            success: true,
            message: 'Permission granted to user successfully',
            data: userPermission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke permission from user (override)
 * POST /api/permissions/users/revoke-permission
 */
const revokePermissionFromUser = async (req, res, next) => {
    try {
        const revokedBy = req.user.id;
        const companyId = req.user.company_id;
        const permissionData = {
            ...req.body,
            company_id: companyId
        };

        const userPermission = await userPermissionService.revokePermissionFromUser(
            permissionData,
            revokedBy
        );

        res.status(201).json({
            success: true,
            message: 'Permission revoked from user successfully',
            data: userPermission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove user permission override
 * POST /api/permissions/users/remove-override
 */
const removeUserPermissionOverride = async (req, res, next) => {
    try {
        const { user_permission_id } = req.body;
        const removedBy = req.user.id;

        const result = await userPermissionService.removeUserPermissionOverride(
            user_permission_id,
            removedBy
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user permission overrides
 * POST /api/permissions/users/get-overrides
 */
const getUserPermissionOverrides = async (req, res, next) => {
    try {
        const { user_id, application_id } = req.body;
        const companyId = req.user.company_id;

        const overrides = await userPermissionService.getUserPermissionOverrides(
            user_id,
            companyId,
            application_id
        );

        res.status(200).json({
            success: true,
            data: overrides,
            count: overrides.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk grant permissions to user
 * POST /api/permissions/users/bulk-grant
 */
const bulkGrantPermissionsToUser = async (req, res, next) => {
    try {
        const grantedBy = req.user.id;
        const companyId = req.user.company_id;
        const bulkData = {
            ...req.body,
            company_id: companyId
        };

        const result = await userPermissionService.bulkGrantPermissionsToUser(bulkData, grantedBy);

        res.status(200).json({
            success: true,
            message: result.message,
            count: result.count,
            data: result.permissions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk revoke permissions from user
 * POST /api/permissions/users/bulk-revoke
 */
const bulkRevokePermissionsFromUser = async (req, res, next) => {
    try {
        const revokedBy = req.user.id;
        const companyId = req.user.company_id;
        const bulkData = {
            ...req.body,
            company_id: companyId
        };

        const result = await userPermissionService.bulkRevokePermissionsFromUser(bulkData, revokedBy);

        res.status(200).json({
            success: true,
            message: result.message,
            count: result.count,
            data: result.permissions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user permission audit logs
 * POST /api/permissions/users/audit-logs
 */
const getUserPermissionAuditLogs = async (req, res, next) => {
    try {
        const { user_id, action, entity_type, from_date, limit } = req.body;
        const companyId = req.user.company_id;

        const filters = {
            action,
            entity_type,
            from_date,
            limit: limit ? parseInt(limit) : undefined
        };

        const logs = await userPermissionService.getUserPermissionAuditLogs(
            user_id,
            companyId,
            filters
        );

        res.status(200).json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users with their roles
 * POST /api/permissions/users/with-roles
 */
const getUsersWithRoles = async (req, res, next) => {
    try {
        const { application_id, search, limit, offset } = req.body;
        const companyId = req.user.company_id;

        const filters = {
            search,
            limit: limit || 100,
            offset: offset || 0
        };

        const result = await userPermissionService.getUsersWithRoles(
            companyId,
            application_id,
            filters
        );

        res.status(200).json({
            success: true,
            data: result.users,
            total: result.total,
            limit: result.limit,
            offset: result.offset
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPermissions,
    getPermissionById,
    getPermissionByCode,
    createPermission,
    updatePermission,
    deletePermission,
    assignRoleToUser,
    revokeRoleFromUser,
    getUserRoles,
    grantPermissionToUser,
    revokePermissionFromUser,
    removeUserPermissionOverride,
    getUserPermissionOverrides,
    bulkGrantPermissionsToUser,
    bulkRevokePermissionsFromUser,
    getUserPermissionAuditLogs,
    getUsersWithRoles
};
