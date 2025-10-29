/**
 * Business Unit Controller
 */

const businessUnitService = require('../../services/organizational/businessUnit.service');

/**
 * Create business unit
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const businessUnit = await businessUnitService.createBusinessUnit(data);

        res.status(201).json({
            success: true,
            message: 'Business unit created successfully',
            data: businessUnit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create business unit',
            error: error.message
        });
    }
};

/**
 * Update business unit
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const businessUnit = await businessUnitService.updateBusinessUnit(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Business unit updated successfully',
            data: businessUnit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update business unit',
            error: error.message
        });
    }
};

/**
 * Get business unit list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            division_id: req.body.division_id,
            id: req.body.id
        };

        const businessUnits = await businessUnitService.getBusinessUnits(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Business units retrieved successfully',
            data: businessUnits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve business units',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
