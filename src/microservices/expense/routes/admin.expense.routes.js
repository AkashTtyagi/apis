/**
 * Admin Expense Routes
 * Routes for expense management admin APIs
 */

const express = require('express');
const router = express.Router();
const locationGroupController = require('../controllers/admin/locationGroup.controller');

// ==================== LOCATION GROUP MANAGEMENT ====================

/**
 * Create a new location group
 * POST /api/expense/admin/location-groups/create
 */
router.post('/location-groups/create', locationGroupController.createLocationGroup);

/**
 * Get all location groups with filters
 * POST /api/expense/admin/location-groups/list
 */
router.post('/location-groups/list', locationGroupController.getAllLocationGroups);

/**
 * Get location group details
 * POST /api/expense/admin/location-groups/details
 */
router.post('/location-groups/details', locationGroupController.getLocationGroupDetails);

/**
 * Update location group
 * POST /api/expense/admin/location-groups/update
 */
router.post('/location-groups/update', locationGroupController.updateLocationGroup);

/**
 * Delete location group
 * POST /api/expense/admin/location-groups/delete
 */
router.post('/location-groups/delete', locationGroupController.deleteLocationGroup);

/**
 * Get location dropdown data (countries, states, cities)
 * POST /api/expense/admin/location-groups/locations/dropdown
 */
router.post('/location-groups/locations/dropdown', locationGroupController.getLocationDropdownData);

module.exports = router;
