/**
 * Role Routes
 * API routes for role management and permission assignment
 */

const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/role_permission/role.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Role Master routes
router.post('/masters/get-all', roleController.getAllRoleMasters);
router.post('/masters/get-by-id', roleController.getRoleMasterById);
router.post('/masters/create', roleController.createRoleMaster);
router.post('/masters/update', roleController.updateRoleMaster);
router.post('/masters/delete', roleController.deleteRoleMaster);

// Company Role routes
router.post('/get-company-roles', roleController.getCompanyRoles);
router.post('/get-by-id', roleController.getRoleById);
router.post('/create', roleController.createRole);  // Unified API
router.post('/create-from-master', roleController.createRoleFromMaster);  // Backward compatibility
router.post('/create-custom', roleController.createCustomRole);  // Backward compatibility
router.post('/update', roleController.updateRole);
router.post('/delete', roleController.deleteRole);

// Role Permission routes
router.post('/assign-permissions', roleController.assignPermissionsToRole);
router.post('/revoke-permissions', roleController.revokePermissionsFromRole);
router.post('/get-permissions', roleController.getRolePermissions);

module.exports = router;
