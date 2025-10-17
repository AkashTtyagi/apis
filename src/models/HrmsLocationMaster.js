/**
 * HRMS Location Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLocationMaster = sequelize.define('HrmsLocationMaster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Company ID is required' }
        }
    },

    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Optional parent branch'
    },

    location_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Location code is required' },
            notEmpty: { msg: 'Location code cannot be empty' }
        }
    },

    location_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Location name is required' },
            notEmpty: { msg: 'Location name cannot be empty' }
        }
    },

    location_type: {
        type: DataTypes.ENUM('office', 'workstation', 'meeting_room', 'production_floor', 'warehouse', 'remote', 'client_site', 'other'),
        allowNull: false,
        defaultValue: 'office'
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Seating/working capacity'
    },

    // Address fields (if different from branch)
    address_line1: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    country_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    state_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    city_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    // GPS coordinates
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },

    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'hrms_location_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['branch_id'] },
        { fields: ['location_code'] },
        { fields: ['location_type'] },
        { fields: ['country_id'] },
        { fields: ['state_id'] },
        { fields: ['city_id'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'location_code'],
            name: 'unique_company_location'
        }
    ]
});

HrmsLocationMaster.associate = (models) => {
    HrmsLocationMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsLocationMaster.belongsTo(models.HrmsBranchMaster, {
        foreignKey: 'branch_id',
        as: 'branch'
    });

    HrmsLocationMaster.belongsTo(models.HrmsCountryMaster, {
        foreignKey: 'country_id',
        as: 'country'
    });

    HrmsLocationMaster.belongsTo(models.HrmsStateMaster, {
        foreignKey: 'state_id',
        as: 'state'
    });

    HrmsLocationMaster.belongsTo(models.HrmsCityMaster, {
        foreignKey: 'city_id',
        as: 'city'
    });
};

module.exports = {
    HrmsLocationMaster
};
