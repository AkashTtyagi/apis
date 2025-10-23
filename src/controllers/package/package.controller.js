/**
 * Package Controller
 * HTTP handlers for package management
 */

const packageService = require('../../services/package/package.service');

/**
 * Get all packages
 * GET /api/packages
 */
const getAllPackages = async (req, res, next) => {
    try {
        const filters = {
            is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
        };

        const packages = await packageService.getAllPackages(filters);

        res.status(200).json({
            success: true,
            data: packages,
            count: packages.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get package by ID
 * POST /api/packages/get-by-id
 */
const getPackageById = async (req, res, next) => {
    try {
        const { id } = req.body;
        const package = await packageService.getPackageById(id);

        res.status(200).json({
            success: true,
            data: package
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create package
 * POST /api/packages
 */
const createPackage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const package = await packageService.createPackage(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: package
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update package
 * POST /api/packages/update
 */
const updatePackage = async (req, res, next) => {
    try {
        const { id, ...updateData } = req.body;
        const userId = req.user.id;
        const package = await packageService.updatePackage(id, updateData, userId);

        res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            data: package
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete package
 * POST /api/packages/delete
 */
const deletePackage = async (req, res, next) => {
    try {
        const { id } = req.body;
        const result = await packageService.deletePackage(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Assign modules to package
 * POST /api/packages/assign-modules
 */
const assignModulesToPackage = async (req, res, next) => {
    try {
        const { package_id, module_ids } = req.body;
        const userId = req.user.id;

        if (!module_ids || !Array.isArray(module_ids) || module_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'module_ids array is required'
            });
        }

        const result = await packageService.assignModulesToPackage(package_id, module_ids, userId);

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
 * Remove module from package
 * POST /api/packages/remove-module
 */
const removeModuleFromPackage = async (req, res, next) => {
    try {
        const { package_id, module_id } = req.body;
        const result = await packageService.removeModuleFromPackage(package_id, module_id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get package modules
 * POST /api/packages/get-modules
 */
const getPackageModules = async (req, res, next) => {
    try {
        const { package_id } = req.body;
        const modules = await packageService.getPackageModules(package_id);

        res.status(200).json({
            success: true,
            data: modules,
            count: modules.length
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    assignModulesToPackage,
    removeModuleFromPackage,
    getPackageModules
};
