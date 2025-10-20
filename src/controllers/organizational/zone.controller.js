/**
 * Zone Controller
 */

const zoneService = require('../../services/organizational/zone.service');

/**
 * Create zone
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const zone = await zoneService.createZone(data);

        res.status(201).json({
            success: true,
            message: 'Zone created successfully',
            data: zone
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create zone',
            error: error.message
        });
    }
};

/**
 * Update zone
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const zone = await zoneService.updateZone(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Zone updated successfully',
            data: zone
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update zone',
            error: error.message
        });
    }
};

/**
 * Get zone list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.query.is_active,
            search: req.query.search,
            region_id: req.query.region_id,
            id: req.query.id
        };

        const zones = await zoneService.getZones(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Zones retrieved successfully',
            data: zones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve zones',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
