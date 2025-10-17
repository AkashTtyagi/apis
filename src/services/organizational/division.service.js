/**
 * Division Service
 */

const { HrmsDivisionMaster } = require('../../models/HrmsDivisionMaster');
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
        where: whereClause,
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
