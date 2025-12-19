/**
 * Business Unit Service
 */

const { HrmsBusinessUnitMaster } = require('../../models/HrmsBusinessUnitMaster');
const { HrmsDivisionMaster } = require('../../models/HrmsDivisionMaster');
const { HrmsCostCenterMaster } = require('../../models/HrmsCostCenterMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

const createBusinessUnit = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const businessUnit = await HrmsBusinessUnitMaster.create(data, { transaction });
        await transaction.commit();
        return businessUnit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateBusinessUnit = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const businessUnit = await HrmsBusinessUnitMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!businessUnit) {
            throw new Error('Business unit not found');
        }

        await businessUnit.update(data, { transaction });
        await transaction.commit();
        return businessUnit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getBusinessUnits = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { business_unit_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { business_unit_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.division_id) {
        whereClause.division_id = filters.division_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const businessUnits = await HrmsBusinessUnitMaster.findAll({
        attributes: [
            'id',
            'company_id',
            'business_unit_code',
            'business_unit_name',
            'description',
            // Division
            'division_id',
            [sequelize.literal('`division`.`division_code`'), 'division_code'],
            [sequelize.literal('`division`.`division_name`'), 'division_name'],
            // Cost Center
            'cost_center_id',
            [sequelize.literal('`costCenter`.`cost_center_code`'), 'cost_center_code'],
            [sequelize.literal('`costCenter`.`cost_center_name`'), 'cost_center_name'],
            // Business Unit Head
            'business_unit_head_id',
            [sequelize.literal('`businessUnitHead`.`employee_code`'), 'business_unit_head_code'],
            [sequelize.literal("CONCAT(`businessUnitHead`.`first_name`, ' ', COALESCE(`businessUnitHead`.`middle_name`, ''), ' ', `businessUnitHead`.`last_name`)"), 'business_unit_head_name'],
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
                model: HrmsDivisionMaster,
                as: 'division',
                attributes: [],
                required: false
            },
            {
                model: HrmsCostCenterMaster,
                as: 'costCenter',
                attributes: [],
                required: false
            },
            {
                model: HrmsEmployee,
                as: 'businessUnitHead',
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
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['business_unit_name', 'ASC']
        ]
    });

    return businessUnits;
};

module.exports = {
    createBusinessUnit,
    updateBusinessUnit,
    getBusinessUnits
};
