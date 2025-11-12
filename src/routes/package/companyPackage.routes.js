/**
 * Company Package Routes
 * API routes for company package assignments
 */

const express = require('express');
const router = express.Router();
const companyPackageController = require('../../controllers/package/companyPackage.controller');

// All routes are POST type
router.post('/assign', companyPackageController.assignPackageToCompany);
router.post('/get-active', companyPackageController.getCompanyPackage);
router.post('/get-history', companyPackageController.getCompanyPackageHistory);
router.post('/update', companyPackageController.updateCompanyPackage);
router.post('/get-modules', companyPackageController.getCompanyModules);
router.post('/check-module-access', companyPackageController.checkModuleAccess);
router.post('/get-all-companies', companyPackageController.getAllParentCompanies);

module.exports = router;
