/**
 * Expense Policy Applicability Model
 * Defines WHO gets which expense policy
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpensePolicyApplicability = sequelize.define('ExpensePolicyApplicability', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    policy_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Primary Applicability
    applicability_type: {
        type: DataTypes.ENUM(
            'company',
            'entity',
            'department',
            'sub_department',
            'designation',
            'grade',
            'level',
            'location',
            'employee_type',
            'employee'
        ),
        allowNull: false
    },
    applicability_value: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Comma-separated IDs or NULL for all'
    },

    // Advanced Filtering
    advanced_applicability_type: {
        type: DataTypes.ENUM(
            'none',
            'employee_type',
            'branch',
            'region',
            'cost_center',
            'project',
            'grade',
            'joining_date_range'
        ),
        defaultValue: 'none'
    },
    advanced_applicability_value: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },

    // Include/Exclude
    is_excluded: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: '1 = exclude these from policy'
    },

    // Priority
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // Status
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_expense_policy_applicability',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_policy', fields: ['policy_id'] },
        { name: 'idx_company', fields: ['company_id'] },
        { name: 'idx_type', fields: ['applicability_type'] },
        { name: 'idx_active', fields: ['is_active'] },
        { name: 'idx_priority', fields: ['priority'] }
    ]
});

module.exports = { ExpensePolicyApplicability };
