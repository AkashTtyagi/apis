/**
 * HRMS Policy Applicability Model
 * Defines where a policy is applicable (company, entity, department, designation, custom employees)
 * FOLLOWS EXACT PATTERN FROM HrmsWorkflowApplicability
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyApplicability = sequelize.define('HrmsPolicyApplicability', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    policy_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_policies'
    },
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
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific company (usually inherited from policy)'
    },
    is_excluded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'TRUE = exclude this criteria, FALSE = include'
    },
    advanced_applicability_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'none',
        comment: 'Advanced filter: none, employee_type, branch, region'
    },
    advanced_applicability_value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated IDs for advanced applicability filter'
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Priority if multiple policies match (lower = higher priority)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_policy_applicability',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_policy_id',
            fields: ['policy_id']
        },
        {
            name: 'idx_applicability_type',
            fields: ['applicability_type']
        },
        {
            name: 'idx_applicability_value',
            fields: ['applicability_value'],
            prefix: 255
        },
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_is_excluded',
            fields: ['is_excluded']
        },
        {
            name: 'idx_advanced_applicability_type',
            fields: ['advanced_applicability_type']
        },
        {
            name: 'idx_advanced_applicability_value',
            fields: ['advanced_applicability_value'],
            prefix: 255
        },
        {
            name: 'idx_priority',
            fields: ['priority']
        }
    ]
});

HrmsPolicyApplicability.associate = (models) => {
    // Belongs to Policy
    HrmsPolicyApplicability.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });
};

module.exports = { HrmsPolicyApplicability };
