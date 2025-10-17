/**
 * Location Service
 */

const { HrmsLocationMaster } = require('../../models/HrmsLocationMaster');
const { HrmsBranchMaster } = require('../../models/HrmsBranchMaster');
const { HrmsCountryMaster } = require('../../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../../models/HrmsCityMaster');
const { sequelize } = require('../../utils/database');

const createLocation = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const location = await HrmsLocationMaster.create(data, { transaction });
        await transaction.commit();
        return location;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateLocation = async (id, company_id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const location = await HrmsLocationMaster.findOne({
            where: { id, company_id },
            transaction
        });

        if (!location) {
            throw new Error('Location not found');
        }

        await location.update(data, { transaction });
        await transaction.commit();
        return location;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getLocations = async (company_id, filters = {}) => {
    const whereClause = { company_id };

    if (filters.is_active !== undefined) {
        whereClause.is_active = filters.is_active;
    }

    if (filters.search) {
        whereClause[sequelize.Sequelize.Op.or] = [
            { location_code: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
            { location_name: { [sequelize.Sequelize.Op.like]: `%${filters.search}%` } }
        ];
    }

    if (filters.location_type) {
        whereClause.location_type = filters.location_type;
    }

    if (filters.branch_id) {
        whereClause.branch_id = filters.branch_id;
    }

    if (filters.id) {
        whereClause.id = filters.id;
    }

    const locations = await HrmsLocationMaster.findAll({
        where: whereClause,
        include: [
            {
                model: HrmsBranchMaster,
                as: 'branch',
                attributes: ['id', 'branch_code', 'branch_name'],
                required: false
            },
            {
                model: HrmsCountryMaster,
                as: 'country',
                attributes: ['id', 'country_name', 'country_code'],
                required: false
            },
            {
                model: HrmsStateMaster,
                as: 'state',
                attributes: ['id', 'state_name', 'state_code'],
                required: false
            },
            {
                model: HrmsCityMaster,
                as: 'city',
                attributes: ['id', 'city_name'],
                required: false
            }
        ],
        order: [
            ['display_order', 'ASC'],
            ['location_name', 'ASC']
        ]
    });

    return locations;
};

module.exports = {
    createLocation,
    updateLocation,
    getLocations
};
