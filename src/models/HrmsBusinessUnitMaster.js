/**
 * HRMS Business Unit Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsBusinessUnitMaster = sequelize.define('HrmsBusinessUnitMaster', {
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

    division_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Optional parent division'
    },

    business_unit_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Business unit code is required' },
            notEmpty: { msg: 'Business unit code cannot be empty' }
        }
    },

    business_unit_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Business unit name is required' },
            notEmpty: { msg: 'Business unit name cannot be empty' }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    business_unit_head_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    cost_center_id: {
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
    tableName: 'hrms_business_unit_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['division_id'] },
        { fields: ['cost_center_id'] },
        { fields: ['business_unit_code'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'business_unit_code'],
            name: 'unique_company_bu'
        }
    ]
});

HrmsBusinessUnitMaster.associate = (models) => {
    HrmsBusinessUnitMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    HrmsBusinessUnitMaster.belongsTo(models.HrmsDivisionMaster, {
        foreignKey: 'division_id',
        as: 'division'
    });

    HrmsBusinessUnitMaster.belongsTo(models.HrmsCostCenterMaster, {
        foreignKey: 'cost_center_id',
        as: 'costCenter'
    });

    // Business Unit Head
    HrmsBusinessUnitMaster.belongsTo(models.HrmsEmployee, {
        foreignKey: 'business_unit_head_id',
        as: 'businessUnitHead',
        constraints: false
    });

    // Created By User
    HrmsBusinessUnitMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'created_by',
        as: 'createdByUser',
        constraints: false
    });

    // Updated By User
    HrmsBusinessUnitMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'updated_by',
        as: 'updatedByUser',
        constraints: false
    });
};

module.exports = {
    HrmsBusinessUnitMaster
};
