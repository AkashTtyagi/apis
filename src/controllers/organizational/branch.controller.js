/**
 * Branch Controller
 */

const branchService = require('../../services/organizational/branch.service');

/**
 * Create branch
 */
const create = async (req, res) => {
    try {
        const { company_id } = req.user;
        const data = {
            ...req.body,
            company_id,
            created_by: req.user.id
        };

        const branch = await branchService.createBranch(data);

        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            data: branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create branch',
            error: error.message
        });
    }
};

/**
 * Update branch
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;
        const data = {
            ...req.body,
            updated_by: req.user.id
        };

        const branch = await branchService.updateBranch(id, company_id, data);

        res.status(200).json({
            success: true,
            message: 'Branch updated successfully',
            data: branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update branch',
            error: error.message
        });
    }
};

/**
 * Get branch list
 */
const list = async (req, res) => {
    try {
        const { company_id } = req.user;
        const filters = {
            is_active: req.body.is_active,
            search: req.body.search,
            branch_type: req.body.branch_type,
            region_id: req.body.region_id,
            zone_id: req.body.zone_id,
            id: req.body.id
        };

        const branches = await branchService.getBranches(company_id, filters);

        res.status(200).json({
            success: true,
            message: 'Branches retrieved successfully',
            data: branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve branches',
            error: error.message
        });
    }
};

module.exports = {
    create,
    update,
    list
};
