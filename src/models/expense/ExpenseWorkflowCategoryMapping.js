/**
 * Expense Workflow Category Mapping Model
 * Maps specific categories to specific workflows
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseWorkflowCategoryMapping = sequelize.define('ExpenseWorkflowCategoryMapping', {
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_categories'
    },
    workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_approval_workflows'
    },

    // Amount-based workflow selection
    min_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Apply if amount >= this'
    },
    max_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Apply if amount <= this (null = no max)'
    },

    // Priority
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Higher priority wins'
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
    tableName: 'hrms_expense_workflow_category_mapping',
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
            name: 'idx_category',
            fields: ['category_id']
        },
        {
            name: 'idx_workflow',
            fields: ['workflow_id']
        },
        {
            name: 'idx_amount_range',
            fields: ['min_amount', 'max_amount']
        }
    ]
});

module.exports = { ExpenseWorkflowCategoryMapping };
