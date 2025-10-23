/**
 * Module Controller
 * HTTP handlers for module management
 */

const moduleService = require('../../services/package/module.service');

/**
 * Get all modules
 * GET /api/modules
 */
const getAllModules = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
        };

        const modules = await moduleService.getAllModules(filters);

        res.status(200).json({
            success: true,
            data: modules,
            count: modules.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get module by ID
 * POST /api/modules/get-by-id
 */
const getModuleById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const module = await moduleService.getModuleById(id);

        res.status(200).json({
            success: true,
            data: module
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create module
 * POST /api/modules
 */
const createModule = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const module = await moduleService.createModule(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: module
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update module
 * POST /api/modules/update
 */
const updateModule = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const module = await moduleService.updateModule(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Module updated successfully',
            data: module
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete module
 * POST /api/modules/delete
 */
const deleteModule = async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await moduleService.deleteModule(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule
};
