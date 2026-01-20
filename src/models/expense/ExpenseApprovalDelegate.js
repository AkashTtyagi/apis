/**
 * Expense Approval Delegate Model
 * Delegation configuration (approver can delegate to others)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseApprovalDelegate = sequelize.define('ExpenseApprovalDelegate', {
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

    // Delegator
    delegator_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User delegating their approval rights'
    },

    // Delegate
    delegate_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User receiving delegation'
    },

    // Scope
    delegation_scope: {
        type: DataTypes.ENUM('All', 'Specific_Workflows', 'Amount_Based', 'Date_Range'),
        allowNull: false,
        defaultValue: 'All',
        comment: 'Scope of delegation'
    },
    workflow_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Workflow IDs for Specific_Workflows scope'
    },
    max_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'For Amount_Based scope'
    },

    // Validity Period
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Delegation start date'
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Delegation end date'
    },

    // Reason
    delegation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for delegation'
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
    tableName: 'hrms_expense_approval_delegates',
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
            name: 'idx_delegator',
            fields: ['delegator_user_id']
        },
        {
            name: 'idx_delegate',
            fields: ['delegate_user_id']
        },
        {
            name: 'idx_effective_dates',
            fields: ['effective_from', 'effective_to']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        }
    ]
});

module.exports = { ExpenseApprovalDelegate };
