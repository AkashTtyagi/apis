/**
 * Region Service
 */

const { HrmsRegionMaster } = require('../../models/HrmsRegionMaster');
const { sequelize } = require('../../utils/database');

const createRegion = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const region = await HrmsRegionMaster.create(data, { transaction });
        await transaction.commit();
        return region;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateRegion = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const region = await HrmsRegionMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!region) {
            throw new Error('Region not found');
        }

        await region.update(data, { transaction });
        await transaction.commit();
        return region;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getRegions = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { region_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { region_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const regions = await HrmsRegionMaster.findAll({
        where: whereClause,
        order: [
            ['display_order', 'ASC'],
            ['region_name', 'ASC']
        ]
    });

    return regions;
};

module.exports = {
    createRegion,
    updateRegion,
    getRegions
};
