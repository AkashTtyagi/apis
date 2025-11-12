/**
 * Role & Permission Management Models
 * Export all models and define associations
 */

const { HrmsApplication } = require('./HrmsApplication');
const { HrmsMenu } = require('./HrmsMenu');
const { HrmsPermissionMaster } = require('./HrmsPermissionMaster');
const { HrmsRoleMaster } = require('./HrmsRoleMaster');
const { HrmsRoleMasterMenuPermission } = require('./HrmsRoleMasterMenuPermission');
const { HrmsRole } = require('./HrmsRole');
const { HrmsRoleMenuPermission } = require('./HrmsRoleMenuPermission');
const { HrmsUserRole } = require('./HrmsUserRole');
const { HrmsUserMenuPermission } = require('./HrmsUserMenuPermission');
const { HrmsRolePermissionAuditLog } = require('./HrmsRolePermissionAuditLog');
const { HrmsModuleMenu } = require('./HrmsModuleMenu');

// Import package models for cross-module associations
const { HrmsModule } = require('../package/HrmsModule');

// =====================================================
// DEFINE ASSOCIATIONS
// =====================================================

// Application -> Menus (One-to-Many)
HrmsApplication.hasMany(HrmsMenu, { foreignKey: 'application_id', as: 'menus' });
HrmsMenu.belongsTo(HrmsApplication, { foreignKey: 'application_id', as: 'application' });

// Module <-> Menu (Many-to-Many through HrmsModuleMenu)
HrmsModule.belongsToMany(HrmsMenu, {
    through: HrmsModuleMenu,
    foreignKey: 'module_id',
    otherKey: 'menu_id',
    as: 'menus'
});

HrmsMenu.belongsToMany(HrmsModule, {
    through: HrmsModuleMenu,
    foreignKey: 'menu_id',
    otherKey: 'module_id',
    as: 'modules'
});

// Direct access to junction table
HrmsModule.hasMany(HrmsModuleMenu, { foreignKey: 'module_id', as: 'moduleMenus' });
HrmsMenu.hasMany(HrmsModuleMenu, { foreignKey: 'menu_id', as: 'menuModules' });
HrmsModuleMenu.belongsTo(HrmsModule, { foreignKey: 'module_id', as: 'module' });
HrmsModuleMenu.belongsTo(HrmsMenu, { foreignKey: 'menu_id', as: 'menu' });

// Menu -> Parent Menu (Self-referencing for N-level hierarchy)
HrmsMenu.hasMany(HrmsMenu, { foreignKey: 'parent_menu_id', as: 'children' });
HrmsMenu.belongsTo(HrmsMenu, { foreignKey: 'parent_menu_id', as: 'parent' });

// Application -> Role Master (One-to-Many)
HrmsApplication.hasMany(HrmsRoleMaster, { foreignKey: 'application_id', as: 'roleMasters' });
HrmsRoleMaster.belongsTo(HrmsApplication, { foreignKey: 'application_id', as: 'application' });

// Role Master -> Role Master Menu Permissions (One-to-Many)
HrmsRoleMaster.hasMany(HrmsRoleMasterMenuPermission, { foreignKey: 'role_master_id', as: 'permissions' });
HrmsRoleMasterMenuPermission.belongsTo(HrmsRoleMaster, { foreignKey: 'role_master_id', as: 'roleMaster' });

// Menu -> Role Master Menu Permissions (One-to-Many)
HrmsMenu.hasMany(HrmsRoleMasterMenuPermission, { foreignKey: 'menu_id', as: 'roleMasterPermissions' });
HrmsRoleMasterMenuPermission.belongsTo(HrmsMenu, { foreignKey: 'menu_id', as: 'menu' });

// Permission Master -> Role Master Menu Permissions (One-to-Many)
HrmsPermissionMaster.hasMany(HrmsRoleMasterMenuPermission, { foreignKey: 'permission_id', as: 'roleMasterPermissions' });
HrmsRoleMasterMenuPermission.belongsTo(HrmsPermissionMaster, { foreignKey: 'permission_id', as: 'permission' });

// Application -> Roles (One-to-Many)
HrmsApplication.hasMany(HrmsRole, { foreignKey: 'application_id', as: 'roles' });
HrmsRole.belongsTo(HrmsApplication, { foreignKey: 'application_id', as: 'application' });

// Role Master -> Roles (One-to-Many)
HrmsRoleMaster.hasMany(HrmsRole, { foreignKey: 'role_master_id', as: 'companyRoles' });
HrmsRole.belongsTo(HrmsRoleMaster, { foreignKey: 'role_master_id', as: 'roleMaster' });

// Role -> Role Menu Permissions (One-to-Many)
HrmsRole.hasMany(HrmsRoleMenuPermission, { foreignKey: 'role_id', as: 'permissions' });
HrmsRoleMenuPermission.belongsTo(HrmsRole, { foreignKey: 'role_id', as: 'role' });

// Menu -> Role Menu Permissions (One-to-Many)
HrmsMenu.hasMany(HrmsRoleMenuPermission, { foreignKey: 'menu_id', as: 'rolePermissions' });
HrmsRoleMenuPermission.belongsTo(HrmsMenu, { foreignKey: 'menu_id', as: 'menu' });

// Permission Master -> Role Menu Permissions (One-to-Many)
HrmsPermissionMaster.hasMany(HrmsRoleMenuPermission, { foreignKey: 'permission_id', as: 'rolePermissions' });
HrmsRoleMenuPermission.belongsTo(HrmsPermissionMaster, { foreignKey: 'permission_id', as: 'permission' });

// Role -> User Roles (One-to-Many)
HrmsRole.hasMany(HrmsUserRole, { foreignKey: 'role_id', as: 'userRoles' });
HrmsUserRole.belongsTo(HrmsRole, { foreignKey: 'role_id', as: 'role' });

// Application -> User Roles (One-to-Many)
HrmsApplication.hasMany(HrmsUserRole, { foreignKey: 'application_id', as: 'userRoles' });
HrmsUserRole.belongsTo(HrmsApplication, { foreignKey: 'application_id', as: 'application' });

// Application -> User Menu Permissions (One-to-Many)
HrmsApplication.hasMany(HrmsUserMenuPermission, { foreignKey: 'application_id', as: 'userPermissions' });
HrmsUserMenuPermission.belongsTo(HrmsApplication, { foreignKey: 'application_id', as: 'application' });

// Menu -> User Menu Permissions (One-to-Many)
HrmsMenu.hasMany(HrmsUserMenuPermission, { foreignKey: 'menu_id', as: 'userPermissions' });
HrmsUserMenuPermission.belongsTo(HrmsMenu, { foreignKey: 'menu_id', as: 'menu' });

// Permission Master -> User Menu Permissions (One-to-Many)
HrmsPermissionMaster.hasMany(HrmsUserMenuPermission, { foreignKey: 'permission_id', as: 'userPermissions' });
HrmsUserMenuPermission.belongsTo(HrmsPermissionMaster, { foreignKey: 'permission_id', as: 'permission' });

module.exports = {
    HrmsApplication,
    HrmsMenu,
    HrmsModuleMenu,
    HrmsPermissionMaster,
    HrmsRoleMaster,
    HrmsRoleMasterMenuPermission,
    HrmsRole,
    HrmsRoleMenuPermission,
    HrmsUserRole,
    HrmsUserMenuPermission,
    HrmsRolePermissionAuditLog
};
