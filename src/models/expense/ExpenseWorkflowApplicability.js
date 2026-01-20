/**
 * Expense Workflow Applicability Model
 * Defines where an expense workflow is applicable (company, entity, department, designation, employee, etc.)
 * Same structure as HrmsWorkflowApplicability for consistency
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseWorkflowApplicability = sequelize.define('ExpenseWorkflowApplicability', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    workflow_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_expense_approval_workflows'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK to hrms_companies'
    },

    // Primary Applicability
    applicability_type: {
        type: DataTypes.ENUM('company', 'entity', 'location', 'level', 'designation', 'department', 'sub_department', 'employee', 'grade'),
        allowNull: false,
        comment: 'Primary applicability type'
    },
    applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for primary applicability (e.g., "1,2,3" for departments)'
    },

    // Advanced Applicability (additional filter on top of primary)
    advanced_applicability_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'none',
        comment: 'Advanced filter: none, employee_type, branch, region, cost_center, project'
    },
    advanced_applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for advanced applicability filter'
    },

    // Exclusion
    is_excluded: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1 = exclude this criteria, 0 = include'
    },

    // Priority
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Priority if multiple workflows match (lower = higher priority)'
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
    tableName: 'hrms_expense_workflow_applicability',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_workflow_id',
            fields: ['workflow_id']
        },
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_applicability_type',
            fields: ['applicability_type']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_workflow_active',
            fields: ['workflow_id', 'is_active']
        }
    ]
});

module.exports = { ExpenseWorkflowApplicability };
