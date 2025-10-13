/**
 * Workflow Version Model
 * Stores workflow version history for audit and rollback
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowVersion = sequelize.define('HrmsWorkflowVersion', {
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
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Version number (1, 2, 3...)'
    },
    version_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Version name (e.g., V1 - Initial, V2 - Updated)'
    },
    workflow_snapshot: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Complete workflow config snapshot (stages, approvers, conditions, etc.)'
    },
    change_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'What changed in this version'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is this the active version'
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'When this version becomes active'
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'When this version expires'
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Who created this version'
    },
    archived_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this version was archived'
    }
}, {
    tableName: 'hrms_workflow_versions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
    indexes: [
        {
            name: 'unique_workflow_version',
            unique: true,
            fields: ['workflow_config_id', 'version_number']
        },
        {
            name: 'idx_workflow_config_id',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_version_number',
            fields: ['version_number']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        },
        {
            name: 'idx_effective_from',
            fields: ['effective_from']
        }
    ]
});

HrmsWorkflowVersion.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowVersion.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });
};

module.exports = { HrmsWorkflowVersion };
