/**
 * Expense Exchange Rate Model
 * Defines exchange rates for currency conversion
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseExchangeRate = sequelize.define('ExpenseExchangeRate', {
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
    from_currency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_currencies - Source currency'
    },
    to_currency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_currencies - Target currency'
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: false,
        comment: 'Conversion rate (from_currency * rate = to_currency)'
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Rate effective from date'
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Rate effective until date (null = current)'
    },
    rate_source: {
        type: DataTypes.ENUM('Manual', 'API', 'Bank'),
        allowNull: false,
        defaultValue: 'Manual',
        comment: 'How the rate was obtained'
    },
    source_reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Reference for the rate source'
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
    }
}, {
    tableName: 'hrms_expense_exchange_rates',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_company',
            fields: ['company_id']
        },
        {
            name: 'idx_from_currency',
            fields: ['from_currency_id']
        },
        {
            name: 'idx_to_currency',
            fields: ['to_currency_id']
        },
        {
            name: 'idx_effective_dates',
            fields: ['effective_from', 'effective_to']
        },
        {
            name: 'idx_currency_pair_date',
            fields: ['from_currency_id', 'to_currency_id', 'effective_from']
        }
    ]
});

module.exports = { ExpenseExchangeRate };
