/**
 * Company Package Routes
 * API routes for company package assignments
 */

const express = require('express');
const router = express.Router();
const companyPackageController = require('../../controllers/package/companyPackage.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const {
    validateAssignPackage,
    validateCompanyId,
    validateUpdatePackage,
    validateModuleAccess,
    validateAddAddon,
    validateRemoveAddon,
    handleValidationErrors
} = require('../../middlewares/validators/companyPackage.validator');

// All routes require authentication
router.use(authenticate);

// All routes are POST type with validation middleware
router.post('/assign', validateAssignPackage, handleValidationErrors, companyPackageController.assignPackageToCompany);
router.post('/get-active', validateCompanyId, handleValidationErrors, companyPackageController.getCompanyPackage);
router.post('/get-history', validateCompanyId, handleValidationErrors, companyPackageController.getCompanyPackageHistory);
router.post('/update', validateUpdatePackage, handleValidationErrors, companyPackageController.updateCompanyPackage);
router.post('/get-modules', validateCompanyId, handleValidationErrors, companyPackageController.getCompanyModules);
router.post('/check-module-access', validateModuleAccess, handleValidationErrors, companyPackageController.checkModuleAccess);
router.post('/get-all-companies', companyPackageController.getAllParentCompanies);

// Addon module routes with validation
router.post('/add-addon', validateAddAddon, handleValidationErrors, companyPackageController.addAddonModule);
router.post('/remove-addon', validateRemoveAddon, handleValidationErrors, companyPackageController.removeAddonModule);
router.post('/get-addons', validateCompanyId, handleValidationErrors, companyPackageController.getCompanyAddonModules);

module.exports = router;
