/**
 * Module Service
 * Business logic for module management
 */

const { HrmsModule, HrmsPackage, HrmsModuleMenu } = require('../../models/package');
const { HrmsMenu } = require('../../models/role_permission');

/**
 * Get all modules
 */
const getAllModules = async (filters = {}) => {
    const where = {};

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const modules = await HrmsModule.findAll({
        where,
        include: [
            {
                model: HrmsPackage,
                as: 'packages',
                through: { attributes: [] },
                where: { is_active: true },
                required: false
            }
        ],
        order: [['display_order', 'ASC']]
    });

    return modules;
};

/**
 * Get module by ID
 */
const getModuleById = async (moduleId) => {
    const module = await HrmsModule.findByPk(moduleId, {
        include: [
            {
                model: HrmsPackage,
                as: 'packages',
                through: { attributes: [] }
            }
        ]
    });

    if (!module) {
        throw new Error('Module not found');
    }

    return module;
};

/**
 * Create new module
 */
const createModule = async (moduleData, userId) => {
    const {
        module_code,
        module_name,
        module_description,
        module_icon,
        display_order
    } = moduleData;

    // Check if module code already exists
    const existing = await HrmsModule.findOne({ where: { module_code } });
    if (existing) {
        throw new Error(`Module with code '${module_code}' already exists`);
    }

    const module = await HrmsModule.create({
        module_code,
        module_name,
        module_description,
        module_icon,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return module;
};

/**
 * Update module
 */
const updateModule = async (moduleId, updateData, userId) => {
    const module = await HrmsModule.findByPk(moduleId);

    if (!module) {
        throw new Error('Module not found');
    }

    const allowedFields = [
        'module_name',
        'module_description',
        'module_icon',
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

    await module.update(updateFields);

    return module;
};

/**
 * Delete module
 */
const deleteModule = async (moduleId) => {
    const module = await HrmsModule.findByPk(moduleId);

    if (!module) {
        throw new Error('Module not found');
    }

    await module.destroy();

    return { message: 'Module deleted successfully' };
};

/**
 * Build menu tree from flat array
 */
const buildMenuTree = (menus, parentId = null) => {
    return menus
        .filter(menu => menu.parent_menu_id === parentId)
        .map(menu => {
            const menuObj = menu.toJSON ? menu.toJSON() : menu;
            return {
                ...menuObj,
                children: buildMenuTree(menus, menu.id)
            };
        });
};

/**
 * Get menus mapped to a module
 */
const getModuleMenus = async (moduleId) => {
    const module = await HrmsModule.findByPk(moduleId);

    if (!module) {
        throw new Error('Module not found');
    }

    // Get all menus mapped to this module
    const moduleMenus = await HrmsModuleMenu.findAll({
        where: {
            module_id: moduleId,
            is_active: true
        },
        include: [
            {
                model: HrmsMenu,
                as: 'menu',
                where: { is_active: true },
                required: true,
                attributes: [
                    'id',
                    'application_id',
                    'parent_menu_id',
                    'menu_code',
                    'menu_name',
                    'menu_type',
                    'menu_icon',
                    'route_path',
                    'display_order'
                ]
            }
        ],
        order: [[{ model: HrmsMenu, as: 'menu' }, 'display_order', 'ASC']]
    });

    // Extract menu objects
    const menus = moduleMenus.map(mm => mm.menu);

    // Build hierarchical tree structure
    const menuTree = buildMenuTree(menus);

    return {
        module_id: moduleId,
        module_code: module.module_code,
        module_name: module.module_name,
        menus: menuTree,
        count: menus.length
    };
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    getModuleMenus
};
