/**
 * Location Group Controller
 * Handles HTTP requests for location group management
 * Thin controller - delegates to service layer
 */

const locationGroupService = require('../../services/locationGroup.service');

/**
 * Create a new location group
 * POST /api/expense/admin/location-groups/create
 */
const createLocationGroup = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await locationGroupService.createLocationGroup(req.body, companyId, userId);

        return res.status(201).json({
            success: true,
            message: 'Location group created successfully',
            data: result
        });

    } catch (error) {
        console.error('Error creating location group:', error);

        // Handle specific errors
        if (error.message.includes('already exists') ||
            error.message.includes('required') ||
            error.message.includes('must be')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create location group'
        });
    }
};

/**
 * Get all location groups with filters
 * POST /api/expense/admin/location-groups/list
 */
const getAllLocationGroups = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const filters = req.body;

        const result = await locationGroupService.getAllLocationGroups(filters, companyId);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error getting location groups:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get location groups'
        });
    }
};

/**
 * Get location group details
 * POST /api/expense/admin/location-groups/details
 */
const getLocationGroupDetails = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { location_group_id } = req.body;

        const result = await locationGroupService.getLocationGroupDetails(location_group_id, companyId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting location group details:', error);

        if (error.message === 'Location group not found' ||
            error.message.includes('required')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get location group details'
        });
    }
};

/**
 * Update location group
 * POST /api/expense/admin/location-groups/update
 */
const updateLocationGroup = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;

        const result = await locationGroupService.updateLocationGroup(req.body, companyId, userId);

        return res.status(200).json({
            success: true,
            message: 'Location group updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error updating location group:', error);

        if (error.message === 'Location group not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('required') ||
            error.message.includes('cannot be') ||
            error.message.includes('must be')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update location group'
        });
    }
};

/**
 * Delete location group
 * POST /api/expense/admin/location-groups/delete
 */
const deleteLocationGroup = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const userId = req.user.id;
        const { location_group_id } = req.body;

        const result = await locationGroupService.deleteLocationGroup(location_group_id, companyId, userId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error deleting location group:', error);

        if (error.message === 'Location group not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('Cannot delete') ||
            error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete location group'
        });
    }
};

/**
 * Get location dropdown data (countries, states, cities)
 * POST /api/expense/admin/location-groups/locations/dropdown
 */
const getLocationDropdownData = async (req, res) => {
    try {
        const { country_id, state_id } = req.body;

        const result = await locationGroupService.getLocationDropdownData({ country_id, state_id });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting location dropdown data:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to get location dropdown data'
        });
    }
};

module.exports = {
    createLocationGroup,
    getAllLocationGroups,
    getLocationGroupDetails,
    updateLocationGroup,
    deleteLocationGroup,
    getLocationDropdownData
};
