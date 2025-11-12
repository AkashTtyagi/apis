/**
 * Company Package Service
 * Business logic for assigning packages to companies
 */

const { HrmsCompanyPackage, HrmsPackage, HrmsModule } = require('../../models/package');
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
const updateCompanyPackage = async (companyId, updateData, userId) => {
    const companyPackage = await HrmsCompanyPackage.findOne({
        where: {
            company_id: companyId,
            is_active: true
        }
    });

    if (!companyPackage) {
        throw new Error('No active package found for this company');
    }

    const allowedFields = ['end_date', 'is_active'];
    const updateFields = {};

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    });

    await companyPackage.update(updateFields);

    return companyPackage;
};

/**
 * Get company's accessible modules (based on package)
 */
const getCompanyModules = async (companyId) => {
    const companyPackage = await getCompanyPackage(companyId);

    if (!companyPackage || !companyPackage.package) {
        return [];
    }

    return companyPackage.package.modules || [];
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

module.exports = {
    assignPackageToCompany,
    getCompanyPackage,
    getCompanyPackageHistory,
    updateCompanyPackage,
    getCompanyModules,
    hasModuleAccess,
    getAllParentCompanies
};
