/**
 * Zone Service
 */

const { HrmsZoneMaster } = require('../../models/HrmsZoneMaster');
const { HrmsRegionMaster } = require('../../models/HrmsRegionMaster');
const { sequelize } = require('../../utils/database');

const createZone = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const zone = await HrmsZoneMaster.create(data, { transaction });
        await transaction.commit();
        return zone;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateZone = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const zone = await HrmsZoneMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!zone) {
            throw new Error('Zone not found');
        }

        await zone.update(data, { transaction });
        await transaction.commit();
        return zone;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getZones = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { zone_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { zone_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.region_id) {
        whereClause.region_id = filters.region_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const zones = await HrmsZoneMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsRegionMaster,
                as: 'region',
                attributes: ['id', 'region_code', 'region_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['zone_name', 'ASC']
        ]
    });

    return zones;
};

module.exports = {
    createZone,
    updateZone,
    getZones
};
