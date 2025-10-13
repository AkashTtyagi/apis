/**
 * Workflow Configuration Model
 * Stores workflow configurations for each company
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowConfig = sequelize.define('HrmsWorkflowConfig', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Company ID'
    },
    workflow_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_master'
    },
    workflow_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descriptive workflow name'
    },
    workflow_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique code for this workflow config'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Version number'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Default workflow for this type'
    },
    allow_self_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    allow_withdrawal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    send_submission_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    cloned_from_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'If cloned, reference to original workflow'
    }
}, {
    tableName: 'hrms_workflow_config',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'unique_company_workflow_code',
            unique: true,
            fields: ['company_id', 'workflow_code']
        },
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_workflow_master_id',
            fields: ['workflow_master_id']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        }
    ]
});

HrmsWorkflowConfig.associate = (models) => {
    // Belongs to Workflow Master
    HrmsWorkflowConfig.belongsTo(models.HrmsWorkflowMaster, {
        foreignKey: 'workflow_master_id',
        as: 'workflowMaster'
    });

    // Has many Stages
    HrmsWorkflowConfig.hasMany(models.HrmsWorkflowStage, {
        foreignKey: 'workflow_config_id',
        as: 'stages'
    });

    // Has many Conditions
    HrmsWorkflowConfig.hasMany(models.HrmsWorkflowCondition, {
        foreignKey: 'workflow_config_id',
        as: 'conditions'
    });

    // Has many Applicability rules
    HrmsWorkflowConfig.hasMany(models.HrmsWorkflowApplicability, {
        foreignKey: 'workflow_config_id',
        as: 'applicability'
    });

    // Has many Requests
    HrmsWorkflowConfig.hasMany(models.HrmsWorkflowRequest, {
        foreignKey: 'workflow_config_id',
        as: 'requests'
    });

    // Has many Versions
    HrmsWorkflowConfig.hasMany(models.HrmsWorkflowVersion, {
        foreignKey: 'workflow_config_id',
        as: 'versions'
    });

    // Self-reference for cloning
    HrmsWorkflowConfig.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'cloned_from_id',
        as: 'clonedFrom'
    });
};

module.exports = { HrmsWorkflowConfig };
