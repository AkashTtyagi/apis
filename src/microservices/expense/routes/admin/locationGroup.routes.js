/**
 * Location Group Routes
 * Routes for expense location group management
 */

const express = require('express');
const router = express.Router();
const locationGroupController = require('../../controllers/admin/locationGroup.controller');

/**
 * Generate a unique location group code
 * GET /api/expense/admin/location-groups/generate-code
 */
router.get('/generate-code', locationGroupController.generateCode);

/**
 * Create a new location group
 * POST /api/expense/admin/location-groups/create
 */
router.post('/create', locationGroupController.createLocationGroup);

/**
 * Get all location groups with filters
 * POST /api/expense/admin/location-groups/list
 */
router.post('/list', locationGroupController.getAllLocationGroups);

/**
 * Get location group details
 * POST /api/expense/admin/location-groups/details
 */
router.post('/details', locationGroupController.getLocationGroupDetails);

/**
 * Update location group
 * POST /api/expense/admin/location-groups/update
 */
router.post('/update', locationGroupController.updateLocationGroup);

/**
 * Delete location group
 * POST /api/expense/admin/location-groups/delete
 */
router.post('/delete', locationGroupController.deleteLocationGroup);

/**
 * Get location dropdown data (countries, states, cities)
 * POST /api/expense/admin/location-groups/locations/dropdown
 */
router.post('/locations/dropdown', locationGroupController.getLocationDropdownData);

/**
 * Check location group usage in other modules
 * POST /api/expense/admin/location-groups/check-usage
 */
router.post('/check-usage', locationGroupController.checkUsage);

module.exports = router;
