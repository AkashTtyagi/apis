/**
 * Division Controller
 */

const divisionService = require('../../services/organizational/division.service');

/**
 * Create division
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const division = await divisionService.createDivision(data);

        res.status(201).json({
            success: true,
            message: 'Division created successfully',
            data: division
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create division',
            error: error.message
        });
    }
};

/**
 * Update division
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const division = await divisionService.updateDivision(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Division updated successfully',
            data: division
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update division',
            error: error.message
        });
    }
};

/**
 * Get division list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            id: req.body.id
        };

        const divisions = await divisionService.getDivisions(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Divisions retrieved successfully',
            data: divisions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve divisions',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
