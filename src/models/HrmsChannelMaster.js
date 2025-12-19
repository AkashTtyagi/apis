/**
 * HRMS Channel Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsChannelMaster = sequelize.define('HrmsChannelMaster', {
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

    channel_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Channel code is required' },
            notEmpty: { msg: 'Channel code cannot be empty' }
        }
    },

    channel_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Channel name is required' },
            notEmpty: { msg: 'Channel name cannot be empty' }
        }
    },

    channel_type: {
        type: DataTypes.ENUM('direct', 'retail', 'online', 'partner', 'distributor', 'franchise', 'other'),
        allowNull: true
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    channel_head_id: {
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
    tableName: 'hrms_channel_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['channel_code'] },
        { fields: ['channel_type'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'channel_code'],
            name: 'unique_company_channel'
        }
    ]
});

HrmsChannelMaster.associate = (models) => {
    HrmsChannelMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Channel Head
    HrmsChannelMaster.belongsTo(models.HrmsEmployee, {
        foreignKey: 'channel_head_id',
        as: 'channelHead',
        constraints: false
    });

    // Created By User
    HrmsChannelMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'created_by',
        as: 'createdByUser',
        constraints: false
    });

    // Updated By User
    HrmsChannelMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'updated_by',
        as: 'updatedByUser',
        constraints: false
    });
};

module.exports = {
    HrmsChannelMaster
};
