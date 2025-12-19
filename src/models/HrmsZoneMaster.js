/**
 * HRMS Zone Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsZoneMaster = sequelize.define('HrmsZoneMaster', {
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

    region_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Optional parent region'
    },

    zone_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Zone code is required' },
            notEmpty: { msg: 'Zone code cannot be empty' }
        }
    },

    zone_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Zone name is required' },
            notEmpty: { msg: 'Zone name cannot be empty' }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    zone_head_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'hrms_zone_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['region_id'] },
        { fields: ['zone_code'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'zone_code'],
            name: 'unique_company_zone'
        }
    ]
});

HrmsZoneMaster.associate = (models) => {
    HrmsZoneMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsZoneMaster.belongsTo(models.HrmsRegionMaster, {
        foreignKey: 'region_id',
        as: 'region'
    });

    // Zone Head
    HrmsZoneMaster.belongsTo(models.HrmsEmployee, {
        foreignKey: 'zone_head_id',
        as: 'zoneHead',
        constraints: false
    });

    // Created By User
    HrmsZoneMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'created_by',
        as: 'createdByUser',
        constraints: false
    });

    // Updated By User
    HrmsZoneMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'updated_by',
        as: 'updatedByUser',
        constraints: false
    });
};

module.exports = {
    HrmsZoneMaster
};
