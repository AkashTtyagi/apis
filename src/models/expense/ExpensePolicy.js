/**
 * Expense Policy Model
 * Defines expense policies with category access, limits, and submission controls
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpensePolicy = sequelize.define('ExpensePolicy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    policy_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    policy_code: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    policy_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Category Configuration
    allowed_categories: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of category IDs allowed in this policy'
    },
    category_limits_override: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Override limits for specific categories'
    },

    // Overall Spending Caps
    overall_limit_per_transaction: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    overall_limit_per_day: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    overall_limit_per_week: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    overall_limit_per_month: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    overall_limit_per_quarter: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    overall_limit_per_year: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },

    // Submission Controls
    allow_past_date_expense: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    max_past_days: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    allow_future_date_expense: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    max_future_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    submission_window_start_day: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    submission_window_end_day: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    require_receipt_above: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },

    // Post-Submission Controls
    allow_edit_after_submit: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    allow_withdraw_after_submit: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    allow_resubmit_rejected: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    max_resubmit_count: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },

    // Duplicate Detection
    check_duplicates: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    duplicate_check_fields: {
        type: DataTypes.JSON,
        defaultValue: ['amount', 'date', 'category_id']
    },
    duplicate_check_days: {
        type: DataTypes.INTEGER,
        defaultValue: 7
    },

    // Violation Handling
    allow_policy_violation: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    require_justification_on_violation: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    auto_flag_violations: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    // Currency Settings
    default_currency_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    allowed_currencies: {
        type: DataTypes.JSON,
        allowNull: true
    },
    allow_multi_currency: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },

    // Advance Integration
    allow_advance_request: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    max_advance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 80.00
    },
    auto_adjust_advance: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    // Workflow Override
    workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Status
    is_default: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_expense_policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_company_policy_code', unique: true, fields: ['company_id', 'policy_code'] },
        { name: 'idx_company', fields: ['company_id'] },
        { name: 'idx_active', fields: ['is_active'] },
        { name: 'idx_default', fields: ['is_default'] },
        { name: 'idx_deleted', fields: ['deleted_at'] }
    ]
});

module.exports = { ExpensePolicy };
