/**
 * Expense Location Group Model
 * Defines geographical groupings for location-based expense policies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseLocationGroup = sequelize.define('ExpenseLocationGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },
    group_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Name of the location group (e.g., Metro Cities Tier 1)'
    },
    group_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Unique code for the location group'
    },
    group_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the location group'
    },
    cost_of_living_index: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Very High'),
        allowNull: false,
        defaultValue: 'Medium',
        comment: 'Cost of living index for this location group'
    },
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who deleted this record'
    }
}, {
    tableName: 'hrms_expense_location_groups',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company_active',
            fields: ['company_id', 'is_active']
        },
        {
            name: 'idx_group_code',
            fields: ['group_code']
        },
        {
            name: 'idx_company_group_code',
            unique: true,
            fields: ['company_id', 'group_code']
        }
    ]
});

module.exports = { ExpenseLocationGroup };
