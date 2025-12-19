/**
 * HRMS Branch Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsBranchMaster = sequelize.define('HrmsBranchMaster', {
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
        allowNull: true
    },

    zone_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    business_unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    cost_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    branch_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Branch code is required' },
            notEmpty: { msg: 'Branch code cannot be empty' }
        }
    },

    branch_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Branch name is required' },
            notEmpty: { msg: 'Branch name cannot be empty' }
        }
    },

    branch_type: {
        type: DataTypes.ENUM('head_office', 'regional_office', 'branch_office', 'warehouse', 'factory', 'retail_store', 'virtual', 'other'),
        allowNull: false,
        defaultValue: 'branch_office'
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    branch_head_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Address fields
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

    // Contact fields
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: { msg: 'Must be a valid email address' }
        }
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
    tableName: 'hrms_branch_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['region_id'] },
        { fields: ['zone_id'] },
        { fields: ['business_unit_id'] },
        { fields: ['channel_id'] },
        { fields: ['cost_center_id'] },
        { fields: ['branch_code'] },
        { fields: ['branch_type'] },
        { fields: ['country_id'] },
        { fields: ['state_id'] },
        { fields: ['city_id'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'branch_code'],
            name: 'unique_company_branch'
        }
    ]
});

HrmsBranchMaster.associate = (models) => {
    HrmsBranchMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsBranchMaster.belongsTo(models.HrmsRegionMaster, {
        foreignKey: 'region_id',
        as: 'region'
    });

    HrmsBranchMaster.belongsTo(models.HrmsZoneMaster, {
        foreignKey: 'zone_id',
        as: 'zone'
    });

    HrmsBranchMaster.belongsTo(models.HrmsBusinessUnitMaster, {
        foreignKey: 'business_unit_id',
        as: 'businessUnit'
    });

    HrmsBranchMaster.belongsTo(models.HrmsChannelMaster, {
        foreignKey: 'channel_id',
        as: 'channel'
    });

    HrmsBranchMaster.belongsTo(models.HrmsCostCenterMaster, {
        foreignKey: 'cost_center_id',
        as: 'costCenter'
    });

    HrmsBranchMaster.belongsTo(models.HrmsCountryMaster, {
        foreignKey: 'country_id',
        as: 'country'
    });

    HrmsBranchMaster.belongsTo(models.HrmsStateMaster, {
        foreignKey: 'state_id',
        as: 'state'
    });

    HrmsBranchMaster.belongsTo(models.HrmsCityMaster, {
        foreignKey: 'city_id',
        as: 'city'
    });

    // Branch Head
    HrmsBranchMaster.belongsTo(models.HrmsEmployee, {
        foreignKey: 'branch_head_id',
        as: 'branchHead',
        constraints: false
    });

    // Created By User
    HrmsBranchMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'created_by',
        as: 'createdByUser',
        constraints: false
    });

    // Updated By User
    HrmsBranchMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'updated_by',
        as: 'updatedByUser',
        constraints: false
    });
};

module.exports = {
    HrmsBranchMaster
};
