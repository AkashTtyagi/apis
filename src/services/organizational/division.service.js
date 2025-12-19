/**
 * Division Service
 */

const { HrmsDivisionMaster } = require('../../models/HrmsDivisionMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

const createDivision = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const division = await HrmsDivisionMaster.create(data, { transaction });
        await transaction.commit();
        return division;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateDivision = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const division = await HrmsDivisionMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!division) {
            throw new Error('Division not found');
        }

        await division.update(data, { transaction });
        await transaction.commit();
        return division;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getDivisions = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { division_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { division_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const divisions = await HrmsDivisionMaster.findAll({
        attributes: [
            'id',
            'company_id',
            'division_code',
            'division_name',
            'description',
            // Division Head
            'division_head_id',
            [sequelize.literal('`divisionHead`.`employee_code`'), 'division_head_code'],
            [sequelize.literal("CONCAT(`divisionHead`.`first_name`, ' ', COALESCE(`divisionHead`.`middle_name`, ''), ' ', `divisionHead`.`last_name`)"), 'division_head_name'],
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
                model: HrmsEmployee,
                as: 'divisionHead',
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
            ['division_name', 'ASC']
        ]
    });

    return divisions;
};

module.exports = {
    createDivision,
    updateDivision,
    getDivisions
};
