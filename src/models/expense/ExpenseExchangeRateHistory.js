/**
 * Expense Exchange Rate History Model
 * Audit log for exchange rate changes
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseExchangeRateHistory = sequelize.define('ExpenseExchangeRateHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    exchange_rate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_exchange_rates'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key to hrms_companies'
    },
    action: {
        type: DataTypes.ENUM('Create', 'Update', 'Deactivate'),
        allowNull: false,
        comment: 'Type of action performed'
    },
    old_rate: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: true,
        comment: 'Previous exchange rate'
    },
    new_rate: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: true,
        comment: 'New exchange rate'
    },
    old_effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Previous effective from date'
    },
    new_effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'New effective from date'
    },
    old_effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Previous effective to date'
    },
    new_effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'New effective to date'
    },
    change_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for the change'
    },
    changed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User ID who made the change'
    },
    changed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Timestamp of the change'
    }
}, {
    tableName: 'hrms_expense_exchange_rate_history',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'idx_exchange_rate',
            fields: ['exchange_rate_id']
        },
        {
            name: 'idx_company',
            fields: ['company_id']
        },
        {
            name: 'idx_changed_at',
            fields: ['changed_at']
        }
    ]
});

module.exports = { ExpenseExchangeRateHistory };
