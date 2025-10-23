/**
 * Permission Service
 * Business logic for permission master management
 */

const {
    HrmsPermissionMaster,
    HrmsRoleMenuPermission,
    HrmsUserMenuPermission
} = require('../../models/role_permission');

/**
 * Get all permissions
 */
const getAllPermissions = async (filters = {}) => {
    const where = {};

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const permissions = await HrmsPermissionMaster.findAll({
        where,
        order: [['display_order', 'ASC']]
    });

    return permissions;
};

/**
 * Get permission by ID
 */
const getPermissionById = async (permissionId) => {
    const permission = await HrmsPermissionMaster.findByPk(permissionId);

    if (!permission) {
        throw new Error('Permission not found');
    }

    return permission;
};

/**
 * Get permission by code
 */
const getPermissionByCode = async (permissionCode) => {
    const permission = await HrmsPermissionMaster.findOne({
        where: { permission_code: permissionCode }
    });

    if (!permission) {
        throw new Error('Permission not found');
    }

    return permission;
};

/**
 * Create permission
 */
const createPermission = async (permissionData, userId) => {
    const {
        permission_code,
        permission_name,
        permission_description,
        display_order
    } = permissionData;

    // Check if permission code already exists
    const existing = await HrmsPermissionMaster.findOne({
        where: { permission_code }
    });

    if (existing) {
        throw new Error(`Permission with code '${permission_code}' already exists`);
    }

    const permission = await HrmsPermissionMaster.create({
        permission_code,
        permission_name,
        permission_description,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return permission;
};

/**
 * Update permission
 */
const updatePermission = async (permissionId, updateData, userId) => {
    const permission = await HrmsPermissionMaster.findByPk(permissionId);

    if (!permission) {
        throw new Error('Permission not found');
    }

    const allowedFields = [
        'permission_name',
        'permission_description',
        'display_order',
        'is_active'
    ];

    const updateFields = {};
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    });

    updateFields.updated_by = userId;

    await permission.update(updateFields);

    return permission;
};

/**
 * Delete permission
 */
const deletePermission = async (permissionId) => {
    const permission = await HrmsPermissionMaster.findByPk(permissionId);

    if (!permission) {
        throw new Error('Permission not found');
    }

    // Check if permission is in use
    const rolePermissionCount = await HrmsRoleMenuPermission.count({
        where: { permission_id: permissionId }
    });

    const userPermissionCount = await HrmsUserMenuPermission.count({
        where: { permission_id: permissionId }
    });

    if (rolePermissionCount > 0 || userPermissionCount > 0) {
        throw new Error('Cannot delete permission. It is being used in role or user permissions.');
    }

    await permission.destroy();

    return { message: 'Permission deleted successfully' };
};

module.exports = {
    getAllPermissions,
    getPermissionById,
    getPermissionByCode,
    createPermission,
    updatePermission,
    deletePermission
};
