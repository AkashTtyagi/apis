/**
 * User Permission Service
 * Business logic for user-specific permission overrides
 */

const {
    HrmsUserRole,
    HrmsUserMenuPermission,
    HrmsRole,
    HrmsMenu,
    HrmsPermissionMaster,
    HrmsRolePermissionAuditLog
} = require('../../models/role_permission');
const sequelize = require('../../config/database');
const { Op } = require('sequelize');

/**
 * Assign role to user
 */
const assignRoleToUser = async (assignmentData, assignedBy) => {
    const {
        user_id,
        company_id,
        application_id,
        role_id
    } = assignmentData;

    // Validate role exists and belongs to the company
    const role = await HrmsRole.findOne({
        where: {
            id: role_id,
            company_id,
            application_id,
            is_active: true
        }
    });

    if (!role) {
        throw new Error('Role not found or does not belong to this company and application');
    }

    // Check if user already has this role active
    const existing = await HrmsUserRole.findOne({
        where: {
            user_id,
            role_id,
            is_active: true
        }
    });

    if (existing) {
        throw new Error('User already has this role assigned');
    }

    const userRole = await HrmsUserRole.create({
        user_id,
        role_id,
        company_id,
        application_id,
        is_active: true,
        assigned_at: new Date(),
        assigned_by: assignedBy
    });

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id,
        user_id,
        action: 'role_assigned',
        entity_type: 'user_role',
        entity_id: userRole.id,
        changed_by: assignedBy,
        change_details: JSON.stringify({
            role_id,
            role_name: role.role_name
        })
    });

    return userRole;
};

/**
 * Revoke role from user
 */
const revokeRoleFromUser = async (userRoleId, revokedBy) => {
    const userRole = await HrmsUserRole.findByPk(userRoleId);

    if (!userRole) {
        throw new Error('User role assignment not found');
    }

    if (!userRole.is_active) {
        throw new Error('User role is already revoked');
    }

    await userRole.update({
        is_active: false,
        revoked_at: new Date(),
        revoked_by: revokedBy
    });

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id: userRole.company_id,
        user_id: userRole.user_id,
        action: 'role_revoked',
        entity_type: 'user_role',
        entity_id: userRole.id,
        changed_by: revokedBy,
        change_details: JSON.stringify({
            role_id: userRole.role_id
        })
    });

    return { message: 'Role revoked from user successfully' };
};

/**
 * Get user roles for an application
 */
const getUserRoles = async (userId, companyId, applicationId) => {
    const userRoles = await HrmsUserRole.findAll({
        where: {
            user_id: userId,
            company_id: companyId,
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsRole,
                as: 'role',
                where: { is_active: true }
            }
        ],
        order: [['assigned_at', 'DESC']]
    });

    return userRoles;
};

/**
 * Grant additional permission to user (override)
 */
const grantPermissionToUser = async (permissionData, grantedBy) => {
    const {
        user_id,
        company_id,
        application_id,
        menu_id,
        permission_id
    } = permissionData;

    // Validate menu exists
    const menu = await HrmsMenu.findByPk(menu_id);
    if (!menu) {
        throw new Error('Menu not found');
    }

    // Validate permission exists
    const permission = await HrmsPermissionMaster.findByPk(permission_id);
    if (!permission) {
        throw new Error('Permission not found');
    }

    const transaction = await sequelize.transaction();

    try {
        // Check if user already has this permission override
        const existing = await HrmsUserMenuPermission.findOne({
            where: {
                user_id,
                menu_id,
                permission_id,
                is_active: true
            }
        });

        let userPermission;

        if (existing) {
            if (existing.permission_type === 'grant') {
                throw new Error('User already has this permission granted');
            }
            // If it was revoked, change it to grant
            await existing.update({
                permission_type: 'grant',
                updated_by: grantedBy
            }, { transaction });
            userPermission = existing;
        } else {
            // Create new grant permission
            userPermission = await HrmsUserMenuPermission.create({
                user_id,
                company_id,
                application_id,
                menu_id,
                permission_id,
                permission_type: 'grant',
                is_active: true,
                created_by: grantedBy
            }, { transaction });
        }

        // Log audit
        await HrmsRolePermissionAuditLog.create({
            company_id,
            user_id,
            action: 'permission_granted',
            entity_type: 'user_permission',
            entity_id: userPermission.id,
            changed_by: grantedBy,
            change_details: JSON.stringify({
                menu_id,
                menu_name: menu.menu_name,
                permission_id,
                permission_code: permission.permission_code
            })
        }, { transaction });

        await transaction.commit();

        return userPermission;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Revoke permission from user (override)
 */
const revokePermissionFromUser = async (permissionData, revokedBy) => {
    const {
        user_id,
        company_id,
        application_id,
        menu_id,
        permission_id
    } = permissionData;

    // Validate menu exists
    const menu = await HrmsMenu.findByPk(menu_id);
    if (!menu) {
        throw new Error('Menu not found');
    }

    // Validate permission exists
    const permission = await HrmsPermissionMaster.findByPk(permission_id);
    if (!permission) {
        throw new Error('Permission not found');
    }

    const transaction = await sequelize.transaction();

    try {
        // Check if user already has this permission override
        const existing = await HrmsUserMenuPermission.findOne({
            where: {
                user_id,
                menu_id,
                permission_id,
                is_active: true
            }
        });

        let userPermission;

        if (existing) {
            if (existing.permission_type === 'revoke') {
                throw new Error('User already has this permission revoked');
            }
            // If it was granted, change it to revoke
            await existing.update({
                permission_type: 'revoke',
                updated_by: revokedBy
            }, { transaction });
            userPermission = existing;
        } else {
            // Create new revoke permission
            userPermission = await HrmsUserMenuPermission.create({
                user_id,
                company_id,
                application_id,
                menu_id,
                permission_id,
                permission_type: 'revoke',
                is_active: true,
                created_by: revokedBy
            }, { transaction });
        }

        // Log audit
        await HrmsRolePermissionAuditLog.create({
            company_id,
            user_id,
            action: 'permission_revoked',
            entity_type: 'user_permission',
            entity_id: userPermission.id,
            changed_by: revokedBy,
            change_details: JSON.stringify({
                menu_id,
                menu_name: menu.menu_name,
                permission_id,
                permission_code: permission.permission_code
            })
        }, { transaction });

        await transaction.commit();

        return userPermission;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Remove user permission override (restore to role permissions)
 */
const removeUserPermissionOverride = async (userPermissionId, removedBy) => {
    const userPermission = await HrmsUserMenuPermission.findByPk(userPermissionId);

    if (!userPermission) {
        throw new Error('User permission override not found');
    }

    await userPermission.update({
        is_active: false,
        updated_by: removedBy
    });

    // Log audit
    await HrmsRolePermissionAuditLog.create({
        company_id: userPermission.company_id,
        user_id: userPermission.user_id,
        action: 'permission_override_removed',
        entity_type: 'user_permission',
        entity_id: userPermission.id,
        changed_by: removedBy,
        change_details: JSON.stringify({
            menu_id: userPermission.menu_id,
            permission_id: userPermission.permission_id,
            permission_type: userPermission.permission_type
        })
    });

    return { message: 'User permission override removed successfully' };
};

/**
 * Get user permission overrides
 */
const getUserPermissionOverrides = async (userId, companyId, applicationId) => {
    const overrides = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            company_id: companyId,
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsMenu,
                as: 'menu',
                attributes: ['id', 'menu_code', 'menu_name', 'menu_type']
            },
            {
                model: HrmsPermissionMaster,
                as: 'permission',
                attributes: ['id', 'permission_code', 'permission_name']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return overrides;
};

/**
 * Bulk grant permissions to user
 */
const bulkGrantPermissionsToUser = async (bulkData, grantedBy) => {
    const { user_id, company_id, application_id, permissions } = bulkData;

    const transaction = await sequelize.transaction();

    try {
        const grantedPermissions = [];

        for (const perm of permissions) {
            const { menu_id, permission_id } = perm;

            const userPermission = await grantPermissionToUser({
                user_id,
                company_id,
                application_id,
                menu_id,
                permission_id
            }, grantedBy);

            grantedPermissions.push({
                menu_id,
                permission_id,
                id: userPermission.id
            });
        }

        await transaction.commit();

        return {
            message: 'Permissions granted successfully',
            count: grantedPermissions.length,
            permissions: grantedPermissions
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Bulk revoke permissions from user
 */
const bulkRevokePermissionsFromUser = async (bulkData, revokedBy) => {
    const { user_id, company_id, application_id, permissions } = bulkData;

    const transaction = await sequelize.transaction();

    try {
        const revokedPermissions = [];

        for (const perm of permissions) {
            const { menu_id, permission_id } = perm;

            const userPermission = await revokePermissionFromUser({
                user_id,
                company_id,
                application_id,
                menu_id,
                permission_id
            }, revokedBy);

            revokedPermissions.push({
                menu_id,
                permission_id,
                id: userPermission.id
            });
        }

        await transaction.commit();

        return {
            message: 'Permissions revoked successfully',
            count: revokedPermissions.length,
            permissions: revokedPermissions
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get audit logs for user permissions
 */
const getUserPermissionAuditLogs = async (userId, companyId, filters = {}) => {
    const where = {
        company_id: companyId,
        user_id: userId
    };

    if (filters.action) {
        where.action = filters.action;
    }

    if (filters.entity_type) {
        where.entity_type = filters.entity_type;
    }

    if (filters.from_date) {
        where.created_at = {
            [Op.gte]: new Date(filters.from_date)
        };
    }

    const logs = await HrmsRolePermissionAuditLog.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit: filters.limit || 100
    });

    return logs;
};

module.exports = {
    assignRoleToUser,
    revokeRoleFromUser,
    getUserRoles,
    grantPermissionToUser,
    revokePermissionFromUser,
    removeUserPermissionOverride,
    getUserPermissionOverrides,
    bulkGrantPermissionsToUser,
    bulkRevokePermissionsFromUser,
    getUserPermissionAuditLogs
};
