/**
 * Cost Center Service
 */

const { HrmsCostCenterMaster } = require('../../models/HrmsCostCenterMaster');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
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
        attributes: [
            'id',
            'company_id',
            'cost_center_code',
            'cost_center_name',
            'description',
            // Parent Cost Center
            'parent_cost_center_id',
            [sequelize.literal('`parentCostCenter`.`cost_center_code`'), 'parent_cost_center_code'],
            [sequelize.literal('`parentCostCenter`.`cost_center_name`'), 'parent_cost_center_name'],
            // Cost Center Head
            'cost_center_head_id',
            [sequelize.literal('`costCenterHead`.`employee_code`'), 'cost_center_head_code'],
            [sequelize.literal("CONCAT(`costCenterHead`.`first_name`, ' ', COALESCE(`costCenterHead`.`middle_name`, ''), ' ', `costCenterHead`.`last_name`)"), 'cost_center_head_name'],
            // Status & Order
            'is_active',
            'display_order',
            // Created By
            'created_by',
            [sequelize.literal('`createdByUser`.`email`'), 'created_by_email'],
            [sequelize.literal('`createdByUser->employee`.`employee_code`'), 'created_by_code'],
            [sequelize.literal("CONCAT(`createdByUser->employee`.`first_name`, ' ', COALESCE(`createdByUser->employee`.`middle_name`, ''), ' ', `createdByUser->employee`.`last_name`)"), 'created_by_name'],
            // Updated By
            'updated_by',
            [sequelize.literal('`updatedByUser`.`email`'), 'updated_by_email'],
            [sequelize.literal('`updatedByUser->employee`.`employee_code`'), 'updated_by_code'],
            [sequelize.literal("CONCAT(`updatedByUser->employee`.`first_name`, ' ', COALESCE(`updatedByUser->employee`.`middle_name`, ''), ' ', `updatedByUser->employee`.`last_name`)"), 'updated_by_name'],
            // Timestamps
            'created_at',
            'updated_at'
        ],
        where: whereClause,
        include: [
            {
                model: HrmsCostCenterMaster,
                as: 'parentCostCenter',
                attributes: [],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'createdByUser',
                attributes: [],
                include: [
                    {
                        model: HrmsEmployee,
                        as: 'employee',
                        attributes: [],
                        required: false
                    }
                ],
                required: false
            },
            {
                model: HrmsUserDetails,
                as: 'updatedByUser',
                attributes: [],
                include: [
                    {
                        model: HrmsEmployee,
                        as: 'employee',
                        attributes: [],
                        required: false
                    }
                ],
                required: false
            },
            {
                model: HrmsEmployee,
                as: 'costCenterHead',
                attributes: [],
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
