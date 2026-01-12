/**
 * Role Controller
 * HTTP handlers for role management and permission assignment
 */

const roleService = require('../../services/role_permission/role.service');

/**
 * Get all role masters (global templates)
 * POST /api/roles/masters/get-all
 */
const getAllRoleMasters = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.body.is_active
        };

        const roleMasters = await roleService.getAllRoleMasters(filters);

        res.status(200).json({
            success: true,
            data: roleMasters,
            count: roleMasters.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get role master by ID
 * POST /api/roles/masters/get-by-id
 */
const getRoleMasterById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const roleMaster = await roleService.getRoleMasterById(id);

        res.status(200).json({
            success: true,
            data: roleMaster
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create role master
 * POST /api/roles/masters/create
 */
const createRoleMaster = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const roleMaster = await roleService.createRoleMaster(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Role master created successfully',
            data: roleMaster
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update role master
 * POST /api/roles/masters/update
 */
const updateRoleMaster = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const roleMaster = await roleService.updateRoleMaster(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Role master updated successfully',
            data: roleMaster
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete role master
 * POST /api/roles/masters/delete
 */
const deleteRoleMaster = async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await roleService.deleteRoleMaster(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all roles for a company and application
 * POST /api/roles/get-company-roles
 */
const getCompanyRoles = async (req, res, next) => {
    try {
        const { application_id, is_active } = req.body;
        const companyId = req.user.company_id;
        const filters = {
            is_active
        };

        const roles = await roleService.getCompanyRoles(companyId, application_id, filters);

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
 * Get role by ID
 * POST /api/roles/get-by-id
 */
const getRoleById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const role = await roleService.getRoleById(id);

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create role (unified API)
 * POST /api/roles/create
 * If role_master_id provided - creates from template
 * If role_master_id not provided - creates custom role
 */
const createRole = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.company_id;
        const roleData = {
            ...req.body,
            company_id: companyId
        };
        const role = await roleService.createRole(roleData, userId);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });
    } catch (error) {
        next(error);
    }
};

// Keep old functions for backward compatibility
const createRoleFromMaster = async (req, res, next) => {
    return createRole(req, res, next);
};

const createCustomRole = async (req, res, next) => {
    return createRole(req, res, next);
};

/**
 * Update role
 * POST /api/roles/update
 */
const updateRole = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const role = await roleService.updateRole(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: role
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete role
 * POST /api/roles/delete
 */
const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user.id;
        const result = await roleService.deleteRole(id, userId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Assign permissions to role
 * POST /api/roles/assign-permissions
 */
const assignPermissionsToRole = async (req, res, next) => {
    try {
        const { role_id, permissions } = req.body;
        const userId = req.user.id;

        if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'permissions array is required'
            });
        }

        const result = await roleService.assignPermissionsToRole(role_id, permissions, userId);

        res.status(200).json({
            success: true,
            message: result.message,
            count: result.count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke permissions from role
 * POST /api/roles/revoke-permissions
 */
const revokePermissionsFromRole = async (req, res, next) => {
    try {
        const { role_id, permissions } = req.body;
        const userId = req.user.id;

        if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'permissions array is required'
            });
        }

        const result = await roleService.revokePermissionsFromRole(role_id, permissions, userId);

        res.status(200).json({
            success: true,
            message: result.message,
            count: result.count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get role permissions
 * POST /api/roles/get-permissions
 */
const getRolePermissions = async (req, res, next) => {
    try {
        const { role_id } = req.body;
        const permissions = await roleService.getRolePermissions(role_id);

        res.status(200).json({
            success: true,
            data: permissions,
            count: permissions.length
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRoleMasters,
    getRoleMasterById,
    createRoleMaster,
    updateRoleMaster,
    deleteRoleMaster,
    getCompanyRoles,
    getRoleById,
    createRole,
    createRoleFromMaster,
    createCustomRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    revokePermissionsFromRole,
    getRolePermissions
};
