/**
 * Workflow Applicability Model
 * Defines where a workflow is applicable (company, entity, department, designation, custom employees)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowApplicability = sequelize.define('HrmsWorkflowApplicability', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    workflow_config_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_config'
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
        comment: 'Specific company (usually inherited from workflow_config)'
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
        comment: 'Priority if multiple workflows match (lower = higher priority)'
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
    tableName: 'hrms_workflow_applicability',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_workflow_config_id',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_applicability_type',
            fields: ['applicability_type']
        },
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_applicability_value',
            fields: ['applicability_value']
        },
        {
            name: 'idx_advanced_applicability_type',
            fields: ['advanced_applicability_type']
        },
        {
            name: 'idx_advanced_applicability_value',
            fields: ['advanced_applicability_value']
        }
    ]
});

HrmsWorkflowApplicability.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowApplicability.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });
};

module.exports = { HrmsWorkflowApplicability };
