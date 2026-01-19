/**
 * Expense Currency Policy Model
 * Defines currency conversion and rounding policies
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCurrencyPolicy = sequelize.define('ExpenseCurrencyPolicy', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Foreign key to hrms_companies (one policy per company)'
    },
    allow_multi_currency_expenses: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Allow expenses in multiple currencies'
    },
    auto_convert_to_base: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Auto convert all expenses to base currency'
    },
    conversion_timing: {
        type: DataTypes.ENUM('Submission', 'Approval', 'Payment'),
        allowNull: false,
        defaultValue: 'Submission',
        comment: 'When to apply conversion'
    },
    rate_tolerance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5.00,
        comment: 'Allowed variance from system rate (%)'
    },
    allow_manual_rate_override: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Allow users to enter custom rate'
    },
    require_rate_justification: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Require justification for manual rate'
    },
    rounding_method: {
        type: DataTypes.ENUM('Round', 'Floor', 'Ceiling', 'Truncate'),
        allowNull: false,
        defaultValue: 'Round',
        comment: 'Method for rounding converted amounts'
    },
    rounding_precision: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: 'Decimal places for rounding'
    },
    use_expense_date_rate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Use rate from expense date, 0=Use current rate'
    },
    fallback_to_nearest_rate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Use nearest available rate if exact date not found'
    },
    max_rate_age_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7,
        comment: 'Maximum age of rate to use (days)'
    },
    show_original_amount: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Show original amount alongside converted'
    },
    show_conversion_rate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        comment: '1=Show applied conversion rate'
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
    }
}, {
    tableName: 'hrms_expense_currency_policy',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company',
            unique: true,
            fields: ['company_id']
        }
    ]
});

module.exports = { ExpenseCurrencyPolicy };
