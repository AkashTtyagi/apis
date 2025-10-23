/**
 * Package Routes
 * API routes for package management
 */

const express = require('express');
const router = express.Router();
const packageController = require('../../controllers/package/package.controller');

// All routes are POST type
router.post('/get-all', packageController.getAllPackages);
router.post('/get-by-id', packageController.getPackageById);
router.post('/create', packageController.createPackage);
router.post('/update', packageController.updatePackage);
router.post('/delete', packageController.deletePackage);

// Package modules
router.post('/assign-modules', packageController.assignModulesToPackage);
router.post('/remove-module', packageController.removeModuleFromPackage);
router.post('/get-modules', packageController.getPackageModules);

module.exports = router;
