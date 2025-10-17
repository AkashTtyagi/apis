/**
 * HRMS Division Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsDivisionMaster = sequelize.define('HrmsDivisionMaster', {
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

    division_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Division code is required' },
            notEmpty: { msg: 'Division code cannot be empty' }
        }
    },

    division_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Division name is required' },
            notEmpty: { msg: 'Division name cannot be empty' }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    division_head_id: {
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
    tableName: 'hrms_division_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['division_code'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'division_code'],
            name: 'unique_company_division'
        }
    ]
});

HrmsDivisionMaster.associate = (models) => {
    HrmsDivisionMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });
};

module.exports = {
    HrmsDivisionMaster
};
