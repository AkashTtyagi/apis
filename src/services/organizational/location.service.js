/**
 * Location Service
 */

const { HrmsLocationMaster } = require('../../models/HrmsLocationMaster');
const { HrmsBranchMaster } = require('../../models/HrmsBranchMaster');
const { HrmsCountryMaster } = require('../../models/HrmsCountryMaster');
const { HrmsStateMaster } = require('../../models/HrmsStateMaster');
const { HrmsCityMaster } = require('../../models/HrmsCityMaster');
const { HrmsEmployee } = require('../../models/HrmsEmployee');
const { HrmsUserDetails } = require('../../models/HrmsUserDetails');
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
        attributes: [
            'id',
            'company_id',
            'location_code',
            'location_name',
            'location_type',
            'description',
            'capacity',
            // Branch
            'branch_id',
            [sequelize.literal('`branch`.`branch_code`'), 'branch_code'],
            [sequelize.literal('`branch`.`branch_name`'), 'branch_name'],
            // Address
            'address_line1',
            'address_line2',
            'postal_code',
            'latitude',
            'longitude',
            // Country
            'country_id',
            [sequelize.literal('`country`.`country_code`'), 'country_code'],
            [sequelize.literal('`country`.`country_name`'), 'country_name'],
            // State
            'state_id',
            [sequelize.literal('`state`.`state_code`'), 'state_code'],
            [sequelize.literal('`state`.`state_name`'), 'state_name'],
            // City
            'city_id',
            [sequelize.literal('`city`.`city_name`'), 'city_name'],
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
                model: HrmsBranchMaster,
                as: 'branch',
                attributes: [],
                required: false
            },
            {
                model: HrmsCountryMaster,
                as: 'country',
                attributes: [],
                required: false
            },
            {
                model: HrmsStateMaster,
                as: 'state',
                attributes: [],
                required: false
            },
            {
                model: HrmsCityMaster,
                as: 'city',
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
