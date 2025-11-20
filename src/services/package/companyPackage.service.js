/**
 * Company Package Service
 * Business logic for assigning packages to companies
 */

const { HrmsCompanyPackage, HrmsPackage, HrmsModule, HrmsCompanyAddonModule } = require('../../models/package');
const { HrmsCompany } = require('../../models/HrmsCompany');
const { Op } = require('sequelize');

/**
 * Assign package to company
 */
const assignPackageToCompany = async (companyId, packageData, userId) => {
    const {
        package_id,
        start_date,
        end_date
    } = packageData;

    // Validate package exists
    const package = await HrmsPackage.findByPk(package_id);
    if (!package) {
        throw new Error('Package not found');
    }

    // Deactivate existing active packages for this company
    await HrmsCompanyPackage.update(
        { is_active: false },
        {
            where: {
                company_id: companyId,
                is_active: true
            }
        }
    );

    // Create new company package assignment
    const companyPackage = await HrmsCompanyPackage.create({
        company_id: companyId,
        package_id,
        start_date,
        end_date: end_date || null,
        is_active: true,
        assigned_by: userId
    });

    return companyPackage;
};

/**
 * Get company's current active package
 */
const getCompanyPackage = async (companyId) => {
    const companyPackage = await HrmsCompanyPackage.findOne({
        where: {
            company_id: companyId,
            is_active: true,
            start_date: {
                [Op.lte]: new Date()
            },
            [Op.or]: [
                { end_date: null },
                { end_date: { [Op.gte]: new Date() } }
            ]
        },
        include: [
            {
                model: HrmsPackage,
                as: 'package',
                include: [
                    {
                        model: HrmsModule,
                        as: 'modules',
                        through: { attributes: [] },
                        where: { is_active: true },
                        required: false
                    }
                ]
            }
        ]
    });

    if (!companyPackage) {
        throw new Error('No active package found for this company');
    }

    return companyPackage;
};

/**
 * Get all company package history
 */
const getCompanyPackageHistory = async (companyId) => {
    const history = await HrmsCompanyPackage.findAll({
        where: {
            company_id: companyId
        },
        include: [
            {
                model: HrmsPackage,
                as: 'package'
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return history;
};

/**
 * Update company package
 */
const updateCompanyPackage = async (updateData, userId) => {
    const { id, package_id } = updateData;

    if (!id) {
        throw new Error('Company package ID is required');
    }

    const companyPackage = await HrmsCompanyPackage.findByPk(id);

    if (!companyPackage) {
        throw new Error('Company package not found');
    }

    // If package_id is being changed, validate it exists
    if (package_id && package_id !== companyPackage.package_id) {
        const packageExists = await HrmsPackage.findByPk(package_id);
        if (!packageExists) {
            throw new Error('Package not found');
        }
    }

    const allowedFields = ['package_id', 'start_date', 'end_date', 'notes', 'is_active'];
    const updateFields = {};

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    });

    updateFields.updated_by = userId;
    updateFields.updated_at = new Date();

    await companyPackage.update(updateFields);

    return companyPackage;
};

/**
 * Get company's accessible modules (based on package + addon modules)
 */
const getCompanyModules = async (companyId) => {
    // Get base package modules
    let baseModules = [];
    try {
        const companyPackage = await getCompanyPackage(companyId);
        if (companyPackage && companyPackage.package) {
            baseModules = companyPackage.package.modules || [];
        }
    } catch (error) {
        // If no active package, base modules remain empty
        console.log(`No active package for company ${companyId}`);
    }

    // Get addon modules
    const addonModules = await HrmsCompanyAddonModule.findAll({
        where: {
            company_id: companyId,
            is_active: true
        },
        include: [
            {
                model: HrmsModule,
                as: 'module',
                where: { is_active: true }
            }
        ]
    });

    // Extract module objects from addons
    const addonModuleObjects = addonModules.map(addon => addon.module);

    // Combine base + addon modules (remove duplicates by module id)
    const allModules = [...baseModules, ...addonModuleObjects];
    const uniqueModules = allModules.filter((module, index, self) =>
        index === self.findIndex((m) => m.id === module.id)
    );

    return uniqueModules;
};

/**
 * Check if company has access to a specific module
 */
const hasModuleAccess = async (companyId, moduleId) => {
    const modules = await getCompanyModules(companyId);
    return modules.some(module => module.id === moduleId);
};

/**
 * Get all parent companies (is_parent_company = 1)
 */
const getAllParentCompanies = async () => {
    const companies = await HrmsCompany.findAll({
        where: {
            is_parent_company: 1
        },
        attributes: [
            'id',
            'org_name',
            'country_id',
            'currency_id',
            'org_industry',
            'registered_address',
            'pin_code',
            'state_id',
            'city_id',
            'phone_number',
            'fax_number',
            'timezone_id',
            'company_profile_path',
            'created_at',
            'updated_at'
        ],
        order: [['created_at', 'DESC']]
    });

    return companies;
};

/**
 * Add addon module to company
 */
const addAddonModule = async (companyId, moduleId, userId) => {
    // Check if module exists and is active
    const module = await HrmsModule.findOne({
        where: { id: moduleId, is_active: true }
    });

    if (!module) {
        throw new Error('Module not found or inactive');
    }

    // Check if addon already exists
    const existingAddon = await HrmsCompanyAddonModule.findOne({
        where: {
            company_id: companyId,
            module_id: moduleId
        }
    });

    if (existingAddon) {
        if (existingAddon.is_active) {
            throw new Error('This addon module is already assigned to the company');
        } else {
            // Reactivate if was inactive
            existingAddon.is_active = true;
            existingAddon.added_by = userId;
            await existingAddon.save();
            return existingAddon;
        }
    }

    // Create new addon
    const addon = await HrmsCompanyAddonModule.create({
        company_id: companyId,
        module_id: moduleId,
        is_active: true,
        added_by: userId
    });

    return addon;
};

/**
 * Remove addon module from company
 */
const removeAddonModule = async (companyId, moduleId) => {
    const addon = await HrmsCompanyAddonModule.findOne({
        where: {
            company_id: companyId,
            module_id: moduleId,
            is_active: true
        }
    });

    if (!addon) {
        throw new Error('Addon module not found or already inactive');
    }

    // Soft delete: set is_active to false
    addon.is_active = false;
    await addon.save();

    return addon;
};

/**
 * Get all addon modules for a company
 */
const getCompanyAddonModules = async (companyId) => {
    const addons = await HrmsCompanyAddonModule.findAll({
        where: {
            company_id: companyId,
            is_active: true
        },
        include: [
            {
                model: HrmsModule,
                as: 'module',
                where: { is_active: true }
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return addons;
};

module.exports = {
    assignPackageToCompany,
    getCompanyPackage,
    getCompanyPackageHistory,
    updateCompanyPackage,
    getCompanyModules,
    hasModuleAccess,
    getAllParentCompanies,
    addAddonModule,
    removeAddonModule,
    getCompanyAddonModules
};
