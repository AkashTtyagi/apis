/**
 * Expense Category Limit Model
 * Defines expense limits (global, location-based, grade-based, department-based)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCategoryLimit = sequelize.define('ExpenseCategoryLimit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_categories'
    },

    // Limit Scope
    limit_type: {
        type: DataTypes.ENUM('Global', 'Location_Based', 'Grade_Based', 'Department_Based'),
        allowNull: false,
        defaultValue: 'Global'
    },

    // Location-based (when limit_type = 'Location_Based')
    location_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_expense_location_groups'
    },

    // Grade-based (when limit_type = 'Grade_Based')
    grade_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_grades'
    },

    // Department-based (when limit_type = 'Department_Based')
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_departments'
    },

    // Limit Values
    limit_per_transaction: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per single expense'
    },
    limit_per_day: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per day'
    },
    limit_per_week: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per week'
    },
    limit_per_month: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per month'
    },
    limit_per_quarter: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per quarter'
    },
    limit_per_year: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Maximum amount per year'
    },

    // Transaction Limits
    max_transactions_per_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum number of transactions per day'
    },
    max_transactions_per_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum number of transactions per month'
    },

    // Mileage Limits (for Mileage type categories)
    max_km_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum kilometers per day'
    },
    max_km_per_month: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum kilometers per month'
    },

    // Override Settings
    allow_limit_override: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Allow managers to override'
    },
    override_approval_required: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Requires special approval if limit exceeded'
    },

    // Effective Dates
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Limit effective from date'
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Limit effective to date (null = no end)'
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Active, 0=Inactive'
    },

    // Audit fields
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    }
}, {
    tableName: 'hrms_expense_category_limits',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_category',
            fields: ['category_id']
        },
        {
            name: 'idx_location_group',
            fields: ['location_group_id']
        },
        {
            name: 'idx_grade',
            fields: ['grade_id']
        },
        {
            name: 'idx_department',
            fields: ['department_id']
        },
        {
            name: 'idx_limit_type',
            fields: ['limit_type']
        },
        {
            name: 'idx_effective_dates',
            fields: ['effective_from', 'effective_to']
        }
    ]
});

module.exports = { ExpenseCategoryLimit };
