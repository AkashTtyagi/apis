/**
 * Cost Center Controller
 */

const costCenterService = require('../../services/organizational/costCenter.service');

/**
 * Create cost center
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const costCenter = await costCenterService.createCostCenter(data);

        res.status(201).json({
            success: true,
            message: 'Cost center created successfully',
            data: costCenter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create cost center',
            error: error.message
        });
    }
};

/**
 * Update cost center
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const costCenter = await costCenterService.updateCostCenter(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Cost center updated successfully',
            data: costCenter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cost center',
            error: error.message
        });
    }
};

/**
 * Get cost center list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.query.is_active,
            search: req.query.search,
            parent_cost_center_id: req.query.parent_cost_center_id,
            id: req.query.id
        };

        const costCenters = await costCenterService.getCostCenters(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Cost centers retrieved successfully',
            data: costCenters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cost centers',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
