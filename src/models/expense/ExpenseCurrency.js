/**
 * Expense Currency Model
 * Defines supported currencies for the organization
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseCurrency = sequelize.define('ExpenseCurrency', {
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
    currency_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        comment: 'ISO 4217 currency code (e.g., INR, USD, EUR)'
    },
    currency_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Full currency name (e.g., Indian Rupee)'
    },
    currency_symbol: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Currency symbol (e.g., ₹, $, €)'
    },
    currency_symbol_position: {
        type: DataTypes.ENUM('Before', 'After'),
        allowNull: false,
        defaultValue: 'Before',
        comment: 'Symbol position relative to amount'
    },
    decimal_places: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: 'Number of decimal places (0-4)'
    },
    decimal_separator: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: '.',
        comment: 'Decimal separator character'
    },
    thousands_separator: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: ',',
        comment: 'Thousands separator character'
    },
    is_base_currency: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Base/reporting currency for the company'
    },
    is_default_expense_currency: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1=Default currency for new expenses'
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_countries - Primary country for this currency'
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
    tableName: 'hrms_expense_currencies',
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
            name: 'idx_currency_code',
            fields: ['currency_code']
        },
        {
            name: 'idx_base_currency',
            fields: ['company_id', 'is_base_currency']
        },
        {
            name: 'idx_company_currency',
            unique: true,
            fields: ['company_id', 'currency_code']
        }
    ]
});

module.exports = { ExpenseCurrency };
