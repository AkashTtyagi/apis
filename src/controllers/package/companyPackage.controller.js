/**
 * Company Package Controller
 * HTTP handlers for company package assignments
 */

const companyPackageService = require('../../services/package/companyPackage.service');

/**
 * Assign package to company
 * POST /api/company-packages/assign
 */
const assignPackageToCompany = async (req, res, next) => {
    try {
        const { company_id, ...packageData } = req.body;
        const userId = req.user.id;

        const companyPackage = await companyPackageService.assignPackageToCompany(
            company_id,
            packageData,
            userId
        );

        res.status(201).json({
            success: true,
            message: 'Package assigned to company successfully',
            data: companyPackage
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get company's active package
 * POST /api/company-packages/get-active
 */
const getCompanyPackage = async (req, res, next) => {
    try {
        const { company_id } = req.body;
        const companyPackage = await companyPackageService.getCompanyPackage(company_id);

        res.status(200).json({
            success: true,
            data: companyPackage
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get company package history
 * POST /api/company-packages/get-history
 */
const getCompanyPackageHistory = async (req, res, next) => {
    try {
        const { company_id } = req.body;
        const history = await companyPackageService.getCompanyPackageHistory(company_id);

        res.status(200).json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update company package
 * POST /api/company-packages/update
 */
const updateCompanyPackage = async (req, res, next) => {
    try {
        const { company_id, ...updateData } = req.body;
        const userId = req.user.id;

        const companyPackage = await companyPackageService.updateCompanyPackage(
            company_id,
            updateData,
            userId
        );

        res.status(200).json({
            success: true,
            message: 'Company package updated successfully',
            data: companyPackage
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get company's accessible modules
 * POST /api/company-packages/get-modules
 */
const getCompanyModules = async (req, res, next) => {
    try {
        const { company_id } = req.body;
        const modules = await companyPackageService.getCompanyModules(company_id);

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
 * Check if company has access to module
 * POST /api/company-packages/check-module-access
 */
const checkModuleAccess = async (req, res, next) => {
    try {
        const { company_id, module_id } = req.body;
        const hasAccess = await companyPackageService.hasModuleAccess(company_id, module_id);

        res.status(200).json({
            success: true,
            data: {
                company_id: company_id,
                module_id: module_id,
                has_access: hasAccess
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    assignPackageToCompany,
    getCompanyPackage,
    getCompanyPackageHistory,
    updateCompanyPackage,
    getCompanyModules,
    checkModuleAccess
};
