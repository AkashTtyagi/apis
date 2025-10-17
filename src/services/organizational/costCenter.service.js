/**
 * Cost Center Service
 */

const { HrmsCostCenterMaster } = require('../../models/HrmsCostCenterMaster');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

/**
 * Create cost center
 */
const createCostCenter = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const costCenter = await HrmsCostCenterMaster.create(data, { transaction });
        await transaction.commit();
        return costCenter;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update cost center (handles both updates and active/inactive)
 */
const updateCostCenter = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();

    try {
        const costCenter = await HrmsCostCenterMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!costCenter) {
            throw new Error('Cost center not found');
        }

        await costCenter.update(data, { transaction });
        await transaction.commit();

        return costCenter;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get cost center list with all details
 */
const getCostCenters = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    // Filter by active/inactive
    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    // Search filter
    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { cost_center_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { cost_center_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    // Filter by parent cost center
    if (filters.parent_cost_center_id) {
        whereClause.parent_cost_center_id = filters.parent_cost_center_id;
    }

    // Filter by specific ID (for single record)
    if (filters.id) {
        whereClause.id = filters.id;
    }

    const costCenters = await HrmsCostCenterMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsCostCenterMaster,
                as: 'parentCostCenter',
                attributes: ['id', 'cost_center_code', 'cost_center_name'],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'createdByUser',
                attributes: ['id', 'email', 'first_name', 'last_name'],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'updatedByUser',
                attributes: ['id', 'email', 'first_name', 'last_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['cost_center_name', 'ASC']
        ]
    });

    return costCenters;
};

module.exports = {
    createCostCenter,
    updateCostCenter,
    getCostCenters
};
