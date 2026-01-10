/**
 * Permission Routes
 * API routes for permission master management and user permissions
 */

const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/role_permission/permission.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// Permission Master routes
router.post('/get-all', permissionController.getAllPermissions);
router.post('/get-by-id', permissionController.getPermissionById);
router.post('/get-by-code', permissionController.getPermissionByCode);
router.post('/create', permissionController.createPermission);
router.post('/update', permissionController.updatePermission);
router.post('/delete', permissionController.deletePermission);

// User Role Assignment routes
router.post('/users/assign-role', permissionController.assignRoleToUser);
router.post('/users/revoke-role', permissionController.revokeRoleFromUser);
router.post('/users/get-roles', permissionController.getUserRoles);

// User Permission Override routes
router.post('/users/grant-permission', permissionController.grantPermissionToUser);
router.post('/users/revoke-permission', permissionController.revokePermissionFromUser);
router.post('/users/remove-override', permissionController.removeUserPermissionOverride);
router.post('/users/get-overrides', permissionController.getUserPermissionOverrides);

// Bulk Operations
router.post('/users/bulk-grant', permissionController.bulkGrantPermissionsToUser);
router.post('/users/bulk-revoke', permissionController.bulkRevokePermissionsFromUser);

// Audit Logs
router.post('/users/audit-logs', permissionController.getUserPermissionAuditLogs);

// Get all users with roles
router.post('/users/with-roles', permissionController.getUsersWithRoles);

module.exports = router;
