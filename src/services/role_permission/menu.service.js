/**
 * Menu Service
 * Business logic for menu management and user menu access
 */

const {
    HrmsMenu,
    HrmsApplication,
    HrmsRole,
    HrmsRoleMenuPermission,
    HrmsUserRole,
    HrmsUserMenuPermission,
    HrmsPermissionMaster
} = require('../../models/role_permission');
const { HrmsModule } = require('../../models/package');
const { getCompanyModules } = require('../package/companyPackage.service');
const { Op } = require('sequelize');

/**
 * Get all menus for an application
 */
const getMenusByApplication = async (applicationId, filters = {}) => {
    const where = { application_id: applicationId };

    if (filters.module_id) {
        where.module_id = filters.module_id;
    }

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const menus = await HrmsMenu.findAll({
        where,
        include: [
            {
                model: HrmsModule,
                as: 'module',
                attributes: ['id', 'module_code', 'module_name']
            },
            {
                model: HrmsMenu,
                as: 'children',
                required: false
            }
        ],
        order: [['display_order', 'ASC']]
    });

    return menus;
};

/**
 * Get menu by ID with full hierarchy
 */
const getMenuById = async (menuId) => {
    const menu = await HrmsMenu.findByPk(menuId, {
        include: [
            {
                model: HrmsApplication,
                as: 'application'
            },
            {
                model: HrmsModule,
                as: 'module'
            },
            {
                model: HrmsMenu,
                as: 'parent'
            },
            {
                model: HrmsMenu,
                as: 'children'
            }
        ]
    });

    if (!menu) {
        throw new Error('Menu not found');
    }

    return menu;
};

/**
 * Create menu
 */
const createMenu = async (menuData, userId) => {
    const {
        application_id,
        module_id,
        parent_menu_id,
        menu_code,
        menu_name,
        menu_type,
        menu_icon,
        route_path,
        component_path,
        menu_description,
        display_order
    } = menuData;

    // Check if menu code already exists for this application
    const existing = await HrmsMenu.findOne({
        where: {
            application_id,
            menu_code
        }
    });

    if (existing) {
        throw new Error(`Menu with code '${menu_code}' already exists in this application`);
    }

    const menu = await HrmsMenu.create({
        application_id,
        module_id,
        parent_menu_id: parent_menu_id || null,
        menu_code,
        menu_name,
        menu_type,
        menu_icon,
        route_path: menu_type === 'screen' ? route_path : null,
        component_path: menu_type === 'screen' ? component_path : null,
        menu_description,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return menu;
};

/**
 * Update menu
 */
const updateMenu = async (menuId, updateData, userId) => {
    const menu = await HrmsMenu.findByPk(menuId);

    if (!menu) {
        throw new Error('Menu not found');
    }

    const allowedFields = [
        'menu_name',
        'menu_icon',
        'route_path',
        'component_path',
        'menu_description',
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

    await menu.update(updateFields);

    return menu;
};

/**
 * Delete menu
 */
const deleteMenu = async (menuId) => {
    const menu = await HrmsMenu.findByPk(menuId);

    if (!menu) {
        throw new Error('Menu not found');
    }

    // Check if menu has children
    const childCount = await HrmsMenu.count({
        where: { parent_menu_id: menuId }
    });

    if (childCount > 0) {
        throw new Error('Cannot delete menu with children. Delete children first.');
    }

    await menu.destroy();

    return { message: 'Menu deleted successfully' };
};

/**
 * Build menu tree from flat array
 */
const buildMenuTree = (menus, parentId = null) => {
    return menus
        .filter(menu => menu.parent_menu_id === parentId)
        .map(menu => ({
            ...menu.toJSON(),
            children: buildMenuTree(menus, menu.id)
        }));
};

/**
 * Get user menus with permissions for an application
 * This is the MAIN function that implements package + role + user permission logic
 */
const getUserMenus = async (userId, companyId, applicationId) => {
    // Step 1: Get company's accessible modules (based on package)
    const companyModules = await getCompanyModules(companyId);
    const moduleIds = companyModules.map(m => m.id);

    if (moduleIds.length === 0) {
        return [];
    }

    // Step 2: Get all menus for this application in company's modules
    const allMenus = await HrmsMenu.findAll({
        where: {
            application_id: applicationId,
            module_id: { [Op.in]: moduleIds },
            is_active: true
        },
        include: [
            {
                model: HrmsModule,
                as: 'module',
                attributes: ['id', 'module_code', 'module_name']
            }
        ],
        order: [['display_order', 'ASC']]
    });

    // Step 3: Get user's roles for this application
    const userRoles = await HrmsUserRole.findAll({
        where: {
            user_id: userId,
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsRole,
                as: 'role',
                where: { is_active: true },
                include: [
                    {
                        model: HrmsRoleMenuPermission,
                        as: 'permissions',
                        where: { is_granted: true },
                        required: false,
                        include: [
                            {
                                model: HrmsPermissionMaster,
                                as: 'permission',
                                attributes: ['id', 'permission_code', 'permission_name']
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // Step 4: Get user-specific permission overrides
    const userPermissions = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsPermissionMaster,
                as: 'permission',
                attributes: ['id', 'permission_code', 'permission_name']
            }
        ]
    });

    // Step 5: Build permission map for each menu
    const menuPermissionMap = {};

    // Add role permissions
    userRoles.forEach(userRole => {
        if (userRole.role && userRole.role.permissions) {
            userRole.role.permissions.forEach(perm => {
                if (!menuPermissionMap[perm.menu_id]) {
                    menuPermissionMap[perm.menu_id] = new Set();
                }
                menuPermissionMap[perm.menu_id].add(perm.permission.permission_code);
            });
        }
    });

    // Apply user-specific overrides
    userPermissions.forEach(userPerm => {
        if (!menuPermissionMap[userPerm.menu_id]) {
            menuPermissionMap[userPerm.menu_id] = new Set();
        }

        if (userPerm.permission_type === 'grant') {
            // Add extra permission
            menuPermissionMap[userPerm.menu_id].add(userPerm.permission.permission_code);
        } else if (userPerm.permission_type === 'revoke') {
            // Remove permission
            menuPermissionMap[userPerm.menu_id].delete(userPerm.permission.permission_code);
        }
    });

    // Step 6: Attach permissions to menus
    const menusWithPermissions = allMenus.map(menu => {
        const menuJson = menu.toJSON();
        const permissions = menuPermissionMap[menu.id]
            ? Array.from(menuPermissionMap[menu.id])
            : [];

        return {
            ...menuJson,
            permissions: menu.menu_type === 'screen' ? permissions : [],
            has_access: menu.menu_type === 'container' || permissions.length > 0
        };
    });

    // Step 7: Filter out menus without access and build tree
    const accessibleMenus = filterAccessibleMenus(menusWithPermissions);
    const menuTree = buildMenuTree(accessibleMenus);

    return menuTree;
};

/**
 * Filter menus - keep containers if they have accessible children
 */
const filterAccessibleMenus = (menus) => {
    const hasAccessibleChild = (menuId) => {
        const children = menus.filter(m => m.parent_menu_id === menuId);
        return children.some(child =>
            child.has_access || hasAccessibleChild(child.id)
        );
    };

    return menus.filter(menu => {
        if (menu.menu_type === 'screen') {
            return menu.has_access;
        } else {
            // Container - keep if it has accessible children
            return hasAccessibleChild(menu.id);
        }
    });
};

/**
 * Get user permissions for a specific screen
 */
const getUserScreenPermissions = async (userId, companyId, applicationId, menuId) => {
    const menu = await HrmsMenu.findOne({
        where: {
            id: menuId,
            application_id: applicationId
        }
    });

    if (!menu) {
        throw new Error('Menu not found');
    }

    if (menu.menu_type !== 'screen') {
        return {
            menu_id: menuId,
            menu_name: menu.menu_name,
            menu_type: 'container',
            permissions: []
        };
    }

    // Check if company has access to this menu's module
    const hasAccess = await require('../package/companyPackage.service').hasModuleAccess(
        companyId,
        menu.module_id
    );

    if (!hasAccess) {
        throw new Error('Company does not have access to this module');
    }

    // Get role permissions
    const userRoles = await HrmsUserRole.findAll({
        where: {
            user_id: userId,
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsRole,
                as: 'role',
                where: { is_active: true },
                include: [
                    {
                        model: HrmsRoleMenuPermission,
                        as: 'permissions',
                        where: {
                            menu_id: menuId,
                            is_granted: true
                        },
                        required: false,
                        include: [
                            {
                                model: HrmsPermissionMaster,
                                as: 'permission'
                            }
                        ]
                    }
                ]
            }
        ]
    });

    // Get user-specific overrides
    const userPermissions = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            application_id: applicationId,
            menu_id: menuId,
            is_active: true
        },
        include: [
            {
                model: HrmsPermissionMaster,
                as: 'permission'
            }
        ]
    });

    // Merge permissions
    const permissionSet = new Set();

    // Add role permissions
    userRoles.forEach(userRole => {
        if (userRole.role && userRole.role.permissions) {
            userRole.role.permissions.forEach(perm => {
                permissionSet.add(perm.permission.permission_code);
            });
        }
    });

    // Apply user overrides
    userPermissions.forEach(userPerm => {
        if (userPerm.permission_type === 'grant') {
            permissionSet.add(userPerm.permission.permission_code);
        } else if (userPerm.permission_type === 'revoke') {
            permissionSet.delete(userPerm.permission.permission_code);
        }
    });

    return {
        menu_id: menuId,
        menu_name: menu.menu_name,
        menu_type: 'screen',
        route_path: menu.route_path,
        permissions: Array.from(permissionSet)
    };
};

module.exports = {
    getMenusByApplication,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getUserMenus,
    getUserScreenPermissions
};
