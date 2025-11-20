/**
 * Menu Controller
 * HTTP handlers for menu management and user menu access
 */

const menuService = require('../../services/role_permission/menu.service');

/**
 * Get all menus for an application
 * POST /api/menus/get-by-application
 */
const getMenusByApplication = async (req, res, next) => {
    try {
        const { application_id, module_id, is_active } = req.body;
        const filters = {
            module_id,
            is_active
        };

        const menus = await menuService.getMenusByApplication(application_id, filters);

        res.status(200).json({
            success: true,
            data: menus,
            count: menus.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get menu by ID
 * POST /api/menus/get-by-id
 */
const getMenuById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const menu = await menuService.getMenuById(id);

        res.status(200).json({
            success: true,
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create menu
 * POST /api/menus/create
 */
const createMenu = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const menu = await menuService.createMenu(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Menu created successfully',
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update menu
 * POST /api/menus/update
 */
const updateMenu = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const menu = await menuService.updateMenu(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Menu updated successfully',
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete menu
 * POST /api/menus/delete
 */
const deleteMenu = async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await menuService.deleteMenu(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user menus with permissions
 * POST /api/menus/get-user-menus
 */
const getUserMenus = async (req, res, next) => {
    try {
        const { user_id, application_id, company_id } = req.body;

        const menus = await menuService.getUserMenus(user_id, company_id, application_id);

        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user permissions for a specific screen
 * POST /api/menus/get-user-screen-permissions
 */
const getUserScreenPermissions = async (req, res, next) => {
    try {
        const { user_id, application_id, menu_id, company_id } = req.body;

        const permissions = await menuService.getUserScreenPermissions(
            user_id,
            company_id,
            application_id,
            menu_id
        );

        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user menu list (structure only, no permissions)
 * POST /api/menus/get-user-menus-list
 */
const getUserMenusList = async (req, res, next) => {
    try {
        const { user_id, application_id, company_id } = req.body;

        const menus = await menuService.getUserMenusList(user_id, company_id, application_id);

        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user menu permissions (permissions only, grouped by menu)
 * POST /api/menus/get-user-menus-permissions
 */
const getUserMenusPermissions = async (req, res, next) => {
    try {
        const { user_id, application_id, company_id } = req.body;

        const permissions = await menuService.getUserMenuPermissions(user_id, company_id, application_id);

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
 * Get menus for logged-in user (using auth token)
 * POST /api/menus/my-menus
 */
const getMyMenus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.company_id;
        const { application_id = 1 } = req.body;

        const menus = await menuService.getUserMenus(userId, companyId, application_id);

        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (error) {
        next(error);
    }
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
    getUserMenusPermissions,
    getMyMenus
};
