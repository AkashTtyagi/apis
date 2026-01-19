/**
 * Expense Category Filing Rule Model
 * Defines filing rules and restrictions per expense category
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCategoryFilingRule = sequelize.define('ExpenseCategoryFilingRule', {
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

    // Date Restrictions
    allow_past_date_filing: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Allow past date expenses'
    },
    max_past_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30,
        comment: 'Maximum days in past for filing'
    },
    allow_future_date_filing: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Allow future date expenses'
    },
    max_future_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Maximum days in future for filing'
    },

    // Filing Window
    filing_window_start_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Day of month filing window opens (1-31)'
    },
    filing_window_end_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Day of month filing window closes (1-31)'
    },

    // Frequency Restrictions
    min_gap_between_claims_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Minimum days between two claims'
    },
    max_claims_per_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Maximum claims allowed'
    },
    claims_period: {
        type: DataTypes.ENUM('Day', 'Week', 'Month', 'Quarter', 'Year'),
        allowNull: true,
        comment: 'Period for max_claims_per_period'
    },

    // Documentation Requirements
    require_project_code: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    require_cost_center: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    require_client_name: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0
    },
    require_purpose_description: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    min_purpose_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
        comment: 'Minimum characters for purpose'
    },

    // Auto-Approval Settings
    auto_approve_below_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Auto-approve if amount below this'
    },
    auto_approve_for_grades: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Grade IDs eligible for auto-approval'
    },

    // Holiday/Weekend Rules
    allow_weekend_expenses: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    allow_holiday_expenses: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    require_justification_for_holiday: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },

    // Duplicate Detection
    check_duplicate_expenses: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1
    },
    duplicate_check_fields: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '["amount", "date", "vendor"]'
    },
    duplicate_check_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 7,
        comment: 'Days to check for duplicates'
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
    tableName: 'hrms_expense_category_filing_rules',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_category_unique',
            unique: true,
            fields: ['category_id']
        }
    ]
});

module.exports = { ExpenseCategoryFilingRule };
