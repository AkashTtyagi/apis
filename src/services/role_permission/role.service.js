/**
 * Role Service
 * Business logic for role management and permission assignment
 */

const {
    HrmsRole,
    HrmsRoleMaster,
    HrmsRoleMenuPermission,
    HrmsMenu,
    HrmsPermissionMaster,
    HrmsUserRole,
    HrmsRolePermissionAuditLog
} = require('../../models/role_permission');
const { Op } = require('sequelize');
const { sequelize } = require('../../utils/database');

/**
 * Get all role masters (global templates)
 */
const getAllRoleMasters = async (filters = {}) => {
    const where = {};

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const roleMasters = await HrmsRoleMaster.findAll({
        where,
        order: [['display_order', 'ASC']]
    });

    return roleMasters;
};

/**
 * Get role master by ID
 */
const getRoleMasterById = async (roleMasterId) => {
    const roleMaster = await HrmsRoleMaster.findByPk(roleMasterId);

    if (!roleMaster) {
        throw new Error('Role master not found');
    }

    return roleMaster;
};

/**
 * Create role master
 */
const createRoleMaster = async (roleData, userId) => {
    const {
        role_code,
        role_name,
        role_description,
        display_order
    } = roleData;

    // Check if role code already exists
    const existing = await HrmsRoleMaster.findOne({ where: { role_code } });
    if (existing) {
        throw new Error(`Role master with code '${role_code}' already exists`);
    }

    const roleMaster = await HrmsRoleMaster.create({
        role_code,
        role_name,
        role_description,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return roleMaster;
};

/**
 * Update role master
 */
const updateRoleMaster = async (roleMasterId, updateData, userId) => {
    const roleMaster = await HrmsRoleMaster.findByPk(roleMasterId);

    if (!roleMaster) {
        throw new Error('Role master not found');
    }

    const allowedFields = ['role_name', 'role_description', 'display_order', 'is_active'];
    const updateFields = {};

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    });

    updateFields.updated_by = userId;

    await roleMaster.update(updateFields);

    return roleMaster;
};

/**
 * Delete role master
 */
const deleteRoleMaster = async (roleMasterId) => {
    const roleMaster = await HrmsRoleMaster.findByPk(roleMasterId);

    if (!roleMaster) {
        throw new Error('Role master not found');
    }

    // Check if any company roles are using this master
    const roleCount = await HrmsRole.count({
        where: { role_master_id: roleMasterId }
    });

    if (roleCount > 0) {
        throw new Error('Cannot delete role master. It is being used by company roles.');
    }

    await roleMaster.destroy();

    return { message: 'Role master deleted successfully' };
};

/**
 * Get all roles for a company and application
 */
const getCompanyRoles = async (companyId, applicationId, filters = {}) => {
    const where = {
        company_id: companyId,
        application_id: applicationId
    };

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const roles = await HrmsRole.findAll({
        where,
        include: [
            {
                model: HrmsRoleMaster,
                as: 'roleMaster',
                attributes: ['id', 'role_code', 'role_name']
            },
            {
                model: HrmsRoleMenuPermission,
                as: 'permissions',
                where: { is_granted: true },
                required: false,
                include: [
                    {
                        model: HrmsMenu,
                        as: 'menu',
                        attributes: ['id', 'menu_code', 'menu_name']
                    },
                    {
                        model: HrmsPermissionMaster,
                        as: 'permission',
                        attributes: ['id', 'permission_code', 'permission_name']
                    }
                ]
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return roles;
};

/**
 * Get role by ID with permissions
 */
const getRoleById = async (roleId) => {
    const role = await HrmsRole.findByPk(roleId, {
        include: [
            {
                model: HrmsRoleMaster,
                as: 'roleMaster'
            },
            {
                model: HrmsRoleMenuPermission,
                as: 'permissions',
                where: { is_granted: true },
                required: false,
                include: [
                    {
                        model: HrmsMenu,
                        as: 'menu'
                    },
                    {
                        model: HrmsPermissionMaster,
                        as: 'permission'
                    }
                ]
            }
        ]
    });

    if (!role) {
        throw new Error('Role not found');
    }

    return role;
};

/**
 * Create company role from role master
 */
const createRoleFromMaster = async (roleData, userId) => {
    const {
        company_id,
        application_id,
        role_master_id,
        role_name,
        role_description
    } = roleData;

    // Validate role master exists
    const roleMaster = await HrmsRoleMaster.findByPk(role_master_id);
    if (!roleMaster) {
        throw new Error('Role master not found');
    }

    // Create company role
    const role = await HrmsRole.create({
        company_id,
        application_id,
        role_master_id,
        role_name: role_name || roleMaster.role_name,
        role_description: role_description || roleMaster.role_description,
        is_active: true,
        created_by: userId
    });

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id,
        action: 'role_created',
        entity_type: 'role',
        entity_id: role.id,
        changed_by: userId,
        change_details: JSON.stringify({
            role_name: role.role_name,
            role_master_id
        })
    });

    return role;
};

/**
 * Create custom company role (without role master)
 */
const createCustomRole = async (roleData, userId) => {
    const {
        company_id,
        application_id,
        role_name,
        role_description
    } = roleData;

    const role = await HrmsRole.create({
        company_id,
        application_id,
        role_master_id: null,
        role_name,
        role_description,
        is_active: true,
        created_by: userId
    });

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id,
        action: 'custom_role_created',
        entity_type: 'role',
        entity_id: role.id,
        changed_by: userId,
        change_details: JSON.stringify({
            role_name: role.role_name
        })
    });

    return role;
};

/**
 * Update role
 */
const updateRole = async (roleId, updateData, userId) => {
    const role = await HrmsRole.findByPk(roleId);

    if (!role) {
        throw new Error('Role not found');
    }

    const allowedFields = ['role_name', 'role_description', 'is_active'];
    const updateFields = {};
    const changes = {};

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== role[field]) {
            changes[field] = { old: role[field], new: updateData[field] };
            updateFields[field] = updateData[field];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        return role;
    }

    updateFields.updated_by = userId;

    await role.update(updateFields);

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id: role.company_id,
        action: 'role_updated',
        entity_type: 'role',
        entity_id: role.id,
        changed_by: userId,
        change_details: JSON.stringify(changes)
    });

    return role;
};

/**
 * Delete role
 */
const deleteRole = async (roleId, userId) => {
    const role = await HrmsRole.findByPk(roleId);

    if (!role) {
        throw new Error('Role not found');
    }

    // Check if any users have this role
    const userCount = await HrmsUserRole.count({
        where: {
            role_id: roleId,
            is_active: true
        }
    });

    if (userCount > 0) {
        throw new Error('Cannot delete role. It is assigned to users. Revoke user assignments first.');
    }

    await role.destroy();

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id: role.company_id,
        action: 'role_deleted',
        entity_type: 'role',
        entity_id: role.id,
        changed_by: userId,
        change_details: JSON.stringify({
            role_name: role.role_name
        })
    });

    return { message: 'Role deleted successfully' };
};

/**
 * Assign permissions to role
 */
const assignPermissionsToRole = async (roleId, permissions, userId) => {
    const role = await HrmsRole.findByPk(roleId);

    if (!role) {
        throw new Error('Role not found');
    }

    const transaction = await sequelize.transaction();

    try {
        const permissionRecords = [];

        for (const perm of permissions) {
            const { menu_id, permission_id } = perm;

            // Validate menu exists
            const menu = await HrmsMenu.findByPk(menu_id);
            if (!menu) {
                throw new Error(`Menu with ID ${menu_id} not found`);
            }

            // Validate permission exists
            const permission = await HrmsPermissionMaster.findByPk(permission_id);
            if (!permission) {
                throw new Error(`Permission with ID ${permission_id} not found`);
            }

            // Check if permission already exists
            const existing = await HrmsRoleMenuPermission.findOne({
                where: {
                    role_id: roleId,
                    menu_id,
                    permission_id
                }
            });

            if (existing) {
                // Update is_granted if it was revoked
                if (!existing.is_granted) {
                    await existing.update({ is_granted: true, updated_by: userId }, { transaction });
                    permissionRecords.push({ menu_id, permission_id, action: 'updated' });
                }
            } else {
                // Create new permission
                await HrmsRoleMenuPermission.create({
                    role_id: roleId,
                    menu_id,
                    permission_id,
                    is_granted: true,
                    created_by: userId
                }, { transaction });
                permissionRecords.push({ menu_id, permission_id, action: 'created' });
            }
        }

        // Log audit
        await HrmsRolePermissionAuditLog.create({
            company_id: role.company_id,
            action: 'permissions_assigned',
            entity_type: 'role',
            entity_id: role.id,
            changed_by: userId,
            change_details: JSON.stringify({
                permissions: permissionRecords
            })
        }, { transaction });

        await transaction.commit();

        return {
            message: 'Permissions assigned successfully',
            count: permissionRecords.length
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Revoke permissions from role
 */
const revokePermissionsFromRole = async (roleId, permissions, userId) => {
    const role = await HrmsRole.findByPk(roleId);

    if (!role) {
        throw new Error('Role not found');
    }

    const transaction = await sequelize.transaction();

    try {
        const revokedRecords = [];

        for (const perm of permissions) {
            const { menu_id, permission_id } = perm;

            const existing = await HrmsRoleMenuPermission.findOne({
                where: {
                    role_id: roleId,
                    menu_id,
                    permission_id,
                    is_granted: true
                }
            });

            if (existing) {
                await existing.update({ is_granted: false, updated_by: userId }, { transaction });
                revokedRecords.push({ menu_id, permission_id });
            }
        }

        // Log audit
        await HrmsRolePermissionAuditLog.create({
            company_id: role.company_id,
            action: 'permissions_revoked',
            entity_type: 'role',
            entity_id: role.id,
            changed_by: userId,
            change_details: JSON.stringify({
                permissions: revokedRecords
            })
        }, { transaction });

        await transaction.commit();

        return {
            message: 'Permissions revoked successfully',
            count: revokedRecords.length
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get role permissions
 */
const getRolePermissions = async (roleId) => {
    const role = await HrmsRole.findByPk(roleId);

    if (!role) {
        throw new Error('Role not found');
    }

    const permissions = await HrmsRoleMenuPermission.findAll({
        where: {
            role_id: roleId,
            is_granted: true
        },
        include: [
            {
                model: HrmsMenu,
                as: 'menu',
                attributes: ['id', 'menu_code', 'menu_name', 'menu_type', 'route_path']
            },
            {
                model: HrmsPermissionMaster,
                as: 'permission',
                attributes: ['id', 'permission_code', 'permission_name']
            }
        ]
    });

    return permissions;
};

module.exports = {
    getAllRoleMasters,
    getRoleMasterById,
    createRoleMaster,
    updateRoleMaster,
    deleteRoleMaster,
    getCompanyRoles,
    getRoleById,
    createRoleFromMaster,
    createCustomRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    revokePermissionsFromRole,
    getRolePermissions
};
