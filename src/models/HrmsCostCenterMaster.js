/**
 * HRMS Cost Center Master Model
 * Sequelize model for hrms_cost_center_master table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCostCenterMaster = sequelize.define('HrmsCostCenterMaster', {
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

    cost_center_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Cost center code is required' },
            notEmpty: { msg: 'Cost center code cannot be empty' }
        }
    },

    cost_center_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Cost center name is required' },
            notEmpty: { msg: 'Cost center name cannot be empty' }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    parent_cost_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Parent cost center for hierarchical structure'
    },

    cost_center_head_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Employee ID of cost center head'
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
    tableName: 'hrms_cost_center_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['cost_center_code'] },
        { fields: ['parent_cost_center_id'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'cost_center_code'],
            name: 'unique_company_cost_center'
        }
    ]
});

HrmsCostCenterMaster.associate = (models) => {
    HrmsCostCenterMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Self-referencing for parent cost center
    HrmsCostCenterMaster.belongsTo(models.HrmsCostCenterMaster, {
        foreignKey: 'parent_cost_center_id',
        as: 'parentCostCenter'
    });

    HrmsCostCenterMaster.hasMany(models.HrmsCostCenterMaster, {
        foreignKey: 'parent_cost_center_id',
        as: 'childCostCenters'
    });

    // Association with HrmsUserDetails for created_by and updated_by
    HrmsCostCenterMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'created_by',
        as: 'createdByUser',
        constraints: false
    });

    HrmsCostCenterMaster.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'updated_by',
        as: 'updatedByUser',
        constraints: false
    });

    // Association with cost center head (employee)
    HrmsCostCenterMaster.belongsTo(models.HrmsEmployee, {
        foreignKey: 'cost_center_head_id',
        as: 'costCenterHead',
        constraints: false
    });
};

module.exports = {
    HrmsCostCenterMaster
};
