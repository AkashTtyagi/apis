/**
 * Category Service
 */

const { HrmsCategoryMaster } = require('../../models/HrmsCategoryMaster');
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
        where: whereClause,
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
