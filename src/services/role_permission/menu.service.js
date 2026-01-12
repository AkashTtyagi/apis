/**
 * Menu Service
 * Business logic for menu management and user menu access
 */

const {
    HrmsMenu,
    HrmsModuleMenu,
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
 * Get all menus for an application (returns tree structure)
 */
const getMenusByApplication = async (applicationId, filters = {}) => {
    const where = { application_id: applicationId };

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const includeOptions = [
        {
            model: HrmsModule,
            as: 'modules',
            through: {
                model: HrmsModuleMenu,
                where: { is_active: true },
                attributes: []
            },
            attributes: ['id', 'module_code', 'module_name'],
            required: false
        }
    ];

    // If filtering by module_id, add it to the through clause
    if (filters.module_id) {
        includeOptions[0].through.where.module_id = filters.module_id;
        includeOptions[0].required = true;
    }

    // Get all menus for this application
    const menus = await HrmsMenu.findAll({
        where,
        include: includeOptions,
        order: [['display_order', 'ASC']],
        raw:true
    });

    // Build tree structure (returns only root menus with nested children)
    const menuTree = buildMenuTree(menus);

    return menuTree;
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
                as: 'modules',
                through: {
                    model: HrmsModuleMenu,
                    where: { is_active: true },
                    attributes: []
                },
                attributes: ['id', 'module_code', 'module_name'],
                required: false
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
 * Note: Menu-module mapping should be done separately via HrmsModuleMenu
 */
const createMenu = async (menuData, userId) => {
    const {
        application_id,
        parent_menu_id,
        menu_code,
        menu_name,
        menu_type,
        menu_icon,
        route_path,
        component_path,
        menu_description,
        display_order,
        module_ids  // Optional array of module IDs to map this menu to
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

    // If module_ids provided, create module-menu mappings
    if (module_ids && Array.isArray(module_ids) && module_ids.length > 0) {
        const mappings = module_ids.map(moduleId => ({
            module_id: moduleId,
            menu_id: menu.id,
            is_active: true,
            created_by: userId
        }));

        await HrmsModuleMenu.bulkCreate(mappings);
    }

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

    // Handle module_ids update if provided
    if (updateData.module_ids !== undefined && Array.isArray(updateData.module_ids)) {
        // Get existing active module mappings
        const existingMappings = await HrmsModuleMenu.findAll({
            where: {
                menu_id: menuId,
                is_active: true
            },
            attributes: ['module_id']
        });

        const existingModuleIds = existingMappings.map(m => m.module_id);

        // Find new modules to add (modules in request but not in existing)
        const newModuleIds = updateData.module_ids.filter(
            moduleId => !existingModuleIds.includes(moduleId)
        );

        // Add only new modules
        if (newModuleIds.length > 0) {
            const mappings = newModuleIds.map(moduleId => ({
                module_id: moduleId,
                menu_id: menuId,
                is_active: true,
                created_by: userId
            }));

            await HrmsModuleMenu.bulkCreate(mappings);
        }
    }

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
        .map(menu => {
            // Handle both Sequelize instances and plain objects
            const menuObj = menu.toJSON ? menu.toJSON() : menu;
            return {
                ...menuObj,
                children: buildMenuTree(menus, menu.id)
            };
        });
};

/**
 * Get user menus with permissions for an application
 * This is the MAIN function that implements package + role + user permission logic
 */
const getUserMenus = async (userId, companyId, applicationId) => {
    const { isUserSuperAdmin } = require('./role.service');

    // Check if user is super admin
    const isSuperAdmin = await isUserSuperAdmin(userId, companyId);

    // Step 1: Get company's accessible modules (based on package + addons)
    // NOTE: Super admin RESPECTS package restrictions
    // Super admin = all permissions within package modules, not unlimited modules
    const companyModules = await getCompanyModules(companyId);
    const moduleIds = companyModules.map(m => m.id);

    if (moduleIds.length === 0) {
        return [];
    }

    // Step 2: Get menu IDs that are mapped to company's accessible modules
    const moduleMenuMappings = await HrmsModuleMenu.findAll({
        where: {
            module_id: { [Op.in]: moduleIds },
            is_active: true
        },
        attributes: ['menu_id']
    });

    const accessibleMenuIds = [...new Set(moduleMenuMappings.map(mm => mm.menu_id))];

    if (accessibleMenuIds.length === 0) {
        return [];
    }

    // Step 3: Get all menus for this application that are accessible
    const allMenus = await HrmsMenu.findAll({
        where: {
            id: { [Op.in]: accessibleMenuIds },
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: {
                    model: HrmsModuleMenu,
                    where: {
                        module_id: { [Op.in]: moduleIds },
                        is_active: true
                    }
                },
                attributes: ['id', 'module_code', 'module_name'],
                required: false
            }
        ],
        order: [['display_order', 'ASC']]
    });

    // Step 4: Get user's roles for this application (including super admin with NULL)
    const userRoles = await HrmsUserRole.findAll({
        where: {
            user_id: userId,
            [Op.or]: [
                { application_id: applicationId },
                { application_id: null }  // Include super admin roles
            ],
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

    // Step 5: Get user-specific permission overrides (including super admin with NULL)
    const userPermissions = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            [Op.or]: [
                { application_id: applicationId },
                { application_id: null }  // Include super admin overrides
            ],
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

    // Step 6: Build permission map for each menu
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

    // Step 7: Attach permissions to menus
    const menusWithPermissions = allMenus.map(menu => {
        const menuJson = menu.toJSON();
        let permissions = menuPermissionMap[menu.id]
            ? Array.from(menuPermissionMap[menu.id])
            : [];

        // Super admin gets ALL permissions
        if (isSuperAdmin && menu.menu_type === 'screen') {
            const allPermissionCodes = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT', 'PRINT'];
            permissions = allPermissionCodes;
        }

        return {
            ...menuJson,
            permissions: menu.menu_type === 'screen' ? permissions : [],
            has_access: isSuperAdmin || menu.menu_type === 'container' || permissions.length > 0
        };
    });

    // Step 8: Filter out menus without access and build tree
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
        },
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: {
                    model: HrmsModuleMenu,
                    where: { is_active: true }
                },
                attributes: ['id', 'module_code', 'module_name'],
                required: false
            }
        ]
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

    // Check if company has access to any of this menu's modules
    const companyModules = await getCompanyModules(companyId);
    const companyModuleIds = companyModules.map(m => m.id);
    const menuModuleIds = menu.modules.map(m => m.id);

    const hasAccess = menuModuleIds.some(moduleId => companyModuleIds.includes(moduleId));

    if (!hasAccess) {
        throw new Error('Company does not have access to any module for this menu');
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

/**
 * Get user menu list (structure only, no permissions)
 * Returns hierarchical menu tree based on package + role access
 */
const getUserMenusList = async (userId, companyId, applicationId) => {
    const { isUserSuperAdmin } = require('./role.service');

    // Check if user is super admin
    const isSuperAdmin = await isUserSuperAdmin(userId, companyId);

    // Step 1: Get company's accessible modules (based on package + addons)
    // NOTE: Super admin RESPECTS package restrictions
    const companyModules = await getCompanyModules(companyId);
    const moduleIds = companyModules.map(m => m.id);

    if (moduleIds.length === 0) {
        return [];
    }

    // Step 2: Get menu IDs that are mapped to company's accessible modules
    const moduleMenuMappings = await HrmsModuleMenu.findAll({
        where: {
            module_id: { [Op.in]: moduleIds },
            is_active: true
        },
        attributes: ['menu_id']
    });

    const accessibleMenuIds = [...new Set(moduleMenuMappings.map(mm => mm.menu_id))];

    if (accessibleMenuIds.length === 0) {
        return [];
    }

    // Step 3: Get all menus for this application that are accessible
    const allMenus = await HrmsMenu.findAll({
        where: {
            id: { [Op.in]: accessibleMenuIds },
            application_id: applicationId,
            is_active: true
        },
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: {
                    model: HrmsModuleMenu,
                    where: {
                        module_id: { [Op.in]: moduleIds },
                        is_active: true
                    }
                },
                attributes: ['id', 'module_code', 'module_name'],
                required: false
            }
        ],
        order: [['display_order', 'ASC']]
    });

    // Step 4: Get user's roles for this application (including super admin with NULL)
    const userRoles = await HrmsUserRole.findAll({
        where: {
            user_id: userId,
            [Op.or]: [
                { application_id: applicationId },
                { application_id: null }  // Include super admin roles
            ],
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
                        required: false
                    }
                ]
            }
        ]
    });

    // Step 5: Get user-specific permission overrides
    const userPermissions = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            application_id: applicationId,
            is_active: true
        }
    });

    // Step 6: Build accessible menu set (filtered by role permissions)
    const userAccessibleMenuIds = new Set();

    // Add menus from role permissions
    userRoles.forEach(userRole => {
        if (userRole.role && userRole.role.permissions) {
            userRole.role.permissions.forEach(perm => {
                userAccessibleMenuIds.add(perm.menu_id);
            });
        }
    });

    // Apply user-specific overrides
    userPermissions.forEach(userPerm => {
        if (userPerm.permission_type === 'grant') {
            userAccessibleMenuIds.add(userPerm.menu_id);
        } else if (userPerm.permission_type === 'revoke') {
            // Don't add to accessible set
        }
    });

    // Step 7: Attach access info to menus
    const menusWithAccess = allMenus.map(menu => {
        const menuJson = menu.toJSON();
        const hasAccess = isSuperAdmin || menu.menu_type === 'container' || userAccessibleMenuIds.has(menu.id);

        return {
            ...menuJson,
            has_access: hasAccess
        };
    });

    // Step 8: Filter accessible menus and build tree
    const accessibleMenus = filterAccessibleMenus(menusWithAccess);
    const menuTree = buildMenuTree(accessibleMenus);

    return menuTree;
};

/**
 * Get user menu permissions (permissions only, grouped by menu)
 * Returns permissions for all accessible menus
 */
const getUserMenuPermissions = async (userId, companyId, applicationId) => {
    const { isUserSuperAdmin } = require('./role.service');

    // Check if user is super admin
    const isSuperAdmin = await isUserSuperAdmin(userId, companyId);

    // Step 1: Get company's accessible modules
    // NOTE: Super admin RESPECTS package restrictions
    const companyModules = await getCompanyModules(companyId);
    const moduleIds = companyModules.map(m => m.id);

    if (moduleIds.length === 0) {
        return [];
    }

    // Step 2: Get menu IDs that are mapped to company's accessible modules
    const moduleMenuMappings = await HrmsModuleMenu.findAll({
        where: {
            module_id: { [Op.in]: moduleIds },
            is_active: true
        },
        attributes: ['menu_id']
    });

    const accessibleMenuIds = [...new Set(moduleMenuMappings.map(mm => mm.menu_id))];

    if (accessibleMenuIds.length === 0) {
        return [];
    }

    // Step 3: Get all screen menus for this application
    const screenMenus = await HrmsMenu.findAll({
        where: {
            id: { [Op.in]: accessibleMenuIds },
            application_id: applicationId,
            menu_type: 'screen',
            is_active: true
        },
        attributes: ['id', 'menu_code', 'menu_name', 'route_path']
    });

    // Step 4: Get user's roles with permissions
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

    // Step 5: Get user-specific permission overrides (including super admin with NULL)
    const userPermissions = await HrmsUserMenuPermission.findAll({
        where: {
            user_id: userId,
            [Op.or]: [
                { application_id: applicationId },
                { application_id: null }  // Include super admin overrides
            ],
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

    // Step 6: Build permission map for each menu
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
            menuPermissionMap[userPerm.menu_id].add(userPerm.permission.permission_code);
        } else if (userPerm.permission_type === 'revoke') {
            menuPermissionMap[userPerm.menu_id].delete(userPerm.permission.permission_code);
        }
    });

    // Step 7: Build result with only menus that have permissions
    const result = screenMenus
        .filter(menu => isSuperAdmin || (menuPermissionMap[menu.id] && menuPermissionMap[menu.id].size > 0))
        .map(menu => {
            let permissions;
            if (isSuperAdmin) {
                // Super admin gets all permissions
                permissions = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT', 'PRINT'];
            } else {
                permissions = Array.from(menuPermissionMap[menu.id]);
            }

            return {
                menu_id: menu.id,
                menu_code: menu.menu_code,
                menu_name: menu.menu_name,
                route_path: menu.route_path,
                permissions: permissions
            };
        });

    return result;
};

module.exports = {
    getMenusByApplication,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getUserMenus,
    getUserScreenPermissions,
    getUserMenusList,
    getUserMenuPermissions
};
