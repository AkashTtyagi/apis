/**
 * Workflow Email Template Config Model
 * Stores email CONFIGURATION per workflow stage and event
 * Links to hrms_email_templates for actual email content
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowEmailTemplate = sequelize.define('HrmsWorkflowEmailTemplate', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Link to workflow config and stage
    workflow_config_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_config'
    },
    stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages (NULL for workflow-level config)'
    },

    // Event type
    event_type: {
        type: DataTypes.ENUM(
            'on_submission',
            'on_stage_assigned',
            'on_approval',
            'on_rejection',
            'on_auto_approval',
            'on_auto_rejection',
            'on_escalation',
            'on_sla_breach',
            'on_withdrawal',
            'on_delegation',
            'on_pending_reminder',
            'on_final_approval',
            'on_final_rejection'
        ),
        allowNull: false,
        comment: 'Event type that triggers email'
    },

    // Link to hrms_email_templates for actual content
    email_template_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK to hrms_email_templates (NULL = use default/no email)'
    },

    // Enable/Disable
    enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Is email enabled for this event'
    },

    // Recipients Configuration (JSON)
    // Format: [{"type": "approver"}, {"type": "requester"}, {"type": "hr"}, {"type": "custom"}]
    to_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'TO recipients array'
    },
    cc_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'CC recipients array'
    },
    bcc_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'BCC recipients array'
    },

    // Custom email addresses
    custom_emails: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of custom email addresses'
    },

    // Additional settings per event
    trigger_before_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'For pending_reminder: hours before SLA breach'
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_workflow_email_templates',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_company_id',
            fields: ['company_id']
        },
        {
            name: 'idx_workflow_config',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_stage_id',
            fields: ['stage_id']
        },
        {
            name: 'idx_event_type',
            fields: ['event_type']
        },
        {
            name: 'idx_email_template',
            fields: ['email_template_id']
        },
        {
            name: 'unique_stage_event',
            unique: true,
            fields: ['stage_id', 'event_type']
        }
    ]
});

HrmsWorkflowEmailTemplate.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowEmailTemplate.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });

    // Belongs to Workflow Stage
    HrmsWorkflowEmailTemplate.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'stage_id',
        as: 'stage'
    });

    // Belongs to Email Template (hrms_email_templates)
    HrmsWorkflowEmailTemplate.belongsTo(models.HrmsEmailTemplate, {
        foreignKey: 'email_template_id',
        as: 'emailTemplate'
    });
};

module.exports = { HrmsWorkflowEmailTemplate };
