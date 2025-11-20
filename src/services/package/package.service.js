/**
 * Package Service
 * Business logic for package management
 */

const { HrmsPackage, HrmsPackageModule, HrmsModule } = require('../../models/package');

/**
 * Get all packages
 */
const getAllPackages = async (filters = {}) => {
    const where = {};

    if (filters.is_active !== undefined) {
        where.is_active = filters.is_active;
    }

    const packages = await HrmsPackage.findAll({
        where,
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: { attributes: [] },
                where: { is_active: true },
                required: false
            }
        ],
        order: [['display_order', 'ASC']]
    });

    return packages;
};

/**
 * Get package by ID
 */
const getPackageById = async (packageId) => {
    const package = await HrmsPackage.findByPk(packageId, {
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: { attributes: [] },
                order: [['display_order', 'ASC']]
            }
        ]
    });

    if (!package) {
        throw new Error('Package not found');
    }

    return package;
};

/**
 * Create new package
 */
const createPackage = async (packageData, userId) => {
    const {
        package_code,
        package_name,
        package_description,
        price_monthly,
        price_yearly,
        max_users,
        max_entities,
        display_order
    } = packageData;

    // Check if package code already exists
    const existing = await HrmsPackage.findOne({ where: { package_code } });
    if (existing) {
        throw new Error(`Package with code '${package_code}' already exists`);
    }

    const package = await HrmsPackage.create({
        package_code,
        package_name,
        package_description,
        price_monthly,
        price_yearly,
        max_users,
        max_entities,
        display_order: display_order || 0,
        is_active: true,
        created_by: userId
    });

    return package;
};

/**
 * Update package
 */
const updatePackage = async (packageId, updateData, userId) => {
    const package = await HrmsPackage.findByPk(packageId);

    if (!package) {
        throw new Error('Package not found');
    }

    const allowedFields = [
        'package_name',
        'package_description',
        'price_monthly',
        'price_yearly',
        'max_users',
        'max_entities',
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

    await package.update(updateFields);

    return package;
};

/**
 * Delete package
 */
const deletePackage = async (packageId) => {
    const package = await HrmsPackage.findByPk(packageId);

    if (!package) {
        throw new Error('Package not found');
    }

    await package.destroy();

    return { message: 'Package deleted successfully' };
};

/**
 * Assign modules to package
 */
const assignModulesToPackage = async (packageId, moduleIds, userId) => {
    const package = await HrmsPackage.findByPk(packageId);

    if (!package) {
        throw new Error('Package not found');
    }

    // Validate all module IDs exist
    const modules = await HrmsModule.findAll({
        where: { id: moduleIds }
    });

    if (modules.length !== moduleIds.length) {
        throw new Error('One or more modules not found');
    }

    // Get existing package-module mappings
    const existingMappings = await HrmsPackageModule.findAll({
        where: {
            package_id: packageId,
            is_active: true
        },
        attributes: ['module_id']
    });

    const existingModuleIds = existingMappings.map(m => m.module_id);

    // Find new modules to add (modules in request but not in existing)
    const newModuleIds = moduleIds.filter(
        moduleId => !existingModuleIds.includes(moduleId)
    );

    // Add only new modules
    if (newModuleIds.length === 0) {
        return {
            message: 'All modules are already assigned to this package',
            count: 0,
            skipped: existingModuleIds.length
        };
    }

    const mappings = newModuleIds.map(moduleId => ({
        package_id: packageId,
        module_id: moduleId,
        is_active: true,
        created_by: userId
    }));

    await HrmsPackageModule.bulkCreate(mappings);

    return {
        message: `${newModuleIds.length} module(s) assigned to package successfully`,
        count: newModuleIds.length,
        skipped: existingModuleIds.length
    };
};

/**
 * Remove module from package
 */
const removeModuleFromPackage = async (packageId, moduleId) => {
    const deleted = await HrmsPackageModule.destroy({
        where: {
            package_id: packageId,
            module_id: moduleId
        }
    });

    if (!deleted) {
        throw new Error('Package-module mapping not found');
    }

    return { message: 'Module removed from package successfully' };
};

/**
 * Get modules in package
 */
const getPackageModules = async (packageId) => {
    const package = await HrmsPackage.findByPk(packageId, {
        include: [
            {
                model: HrmsModule,
                as: 'modules',
                through: { attributes: ['is_active', 'created_at'] },
                order: [['display_order', 'ASC']]
            }
        ]
    });

    if (!package) {
        throw new Error('Package not found');
    }

    return package.modules;
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
