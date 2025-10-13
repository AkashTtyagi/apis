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
        type: DataTypes.ENUM('company', 'entity', 'department', 'sub_department', 'designation', 'level', 'custom_employee', 'location', 'grade'),
        allowNull: false,
        comment: 'Type of applicability'
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific company (usually inherited from workflow_config)'
    },
    entity_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific entity'
    },
    department_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific department'
    },
    sub_department_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific sub-department'
    },
    designation_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific designation'
    },
    level_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific level'
    },
    location_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific location'
    },
    grade_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific grade'
    },
    employee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Specific employee (for custom)'
    },
    is_excluded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'TRUE = exclude this criteria, FALSE = include'
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
            name: 'idx_department_id',
            fields: ['department_id']
        },
        {
            name: 'idx_designation_id',
            fields: ['designation_id']
        },
        {
            name: 'idx_employee_id',
            fields: ['employee_id']
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
