/**
 * Location Controller
 */

const locationService = require('../../services/organizational/location.service');

/**
 * Create location
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const location = await locationService.createLocation(data);

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create location',
            error: error.message
        });
    }
};

/**
 * Update location
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const location = await locationService.updateLocation(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: location
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update location',
            error: error.message
        });
    }
};

/**
 * Get location list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            location_type: req.body.location_type,
            branch_id: req.body.branch_id,
            id: req.body.id
        };

        const locations = await locationService.getLocations(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Locations retrieved successfully',
            data: locations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve locations',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
