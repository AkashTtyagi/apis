/**
 * Category Service
 */

const { HrmsCategoryMaster } = require('../../models/HrmsCategoryMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
const { sequelize } = require('../../utils/database');

const createCategory = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const category = await HrmsCategoryMaster.create(data, { transaction });
        await transaction.commit();
        return category;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateCategory = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const category = await HrmsCategoryMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!category) {
            throw new Error('Category not found');
        }

        await category.update(data, { transaction });
        await transaction.commit();
        return category;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getCategories = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { category_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { category_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const categories = await HrmsCategoryMaster.findAll({
        attributes: [
            'id',
            'company_id',
            'category_code',
            'category_name',
            'description',
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
            ['category_name', 'ASC']
        ]
    });

    return categories;
};

module.exports = {
    createCategory,
    updateCategory,
    getCategories
};
