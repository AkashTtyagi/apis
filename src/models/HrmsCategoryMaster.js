/**
 * HRMS Category Master Model
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsCategoryMaster = sequelize.define('HrmsCategoryMaster', {
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

    category_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: { msg: 'Category code is required' },
            notEmpty: { msg: 'Category code cannot be empty' }
        }
    },

    category_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: 'Category name is required' },
            notEmpty: { msg: 'Category name cannot be empty' }
        }
    },

    description: {
        type: DataTypes.TEXT,
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
    tableName: 'hrms_category_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    indexes: [
        { fields: ['company_id'] },
        { fields: ['category_code'] },
        { fields: ['is_active'] },
        { fields: ['deleted_at'] },
        {
            unique: true,
            fields: ['company_id', 'category_code'],
            name: 'unique_company_category'
        }
    ]
});

HrmsCategoryMaster.associate = (models) => {
    HrmsCategoryMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });
};

module.exports = {
    HrmsCategoryMaster
};
