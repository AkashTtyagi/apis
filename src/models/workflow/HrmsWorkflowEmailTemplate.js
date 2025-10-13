/**
 * Workflow Email Template Model
 * Stores email templates for workflow notifications
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
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    workflow_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_master (NULL for global templates)'
    },
    template_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Template name'
    },
    template_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique template code'
    },
    event_type: {
        type: DataTypes.ENUM(
            'submission',
            'approval',
            'rejection',
            'auto_approval',
            'auto_rejection',
            'escalation',
            'sla_breach',
            'withdrawal',
            'delegation',
            'pending_reminder',
            'final_approval',
            'final_rejection'
        ),
        allowNull: false,
        comment: 'When to trigger this template'
    },
    subject: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Email subject (supports placeholders)'
    },
    body_html: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'HTML email body (supports placeholders)'
    },
    body_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Plain text email body (optional)'
    },
    to_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of recipient types/emails'
    },
    cc_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'CC recipients (can include placeholders like {{rm_email}}, {{hr_email}})'
    },
    bcc_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'BCC recipients'
    },
    available_placeholders: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'List of available placeholders for this template'
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
        comment: 'Default template for this event'
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    }
}, {
    tableName: 'hrms_workflow_email_templates',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'unique_company_template_code',
            unique: true,
            fields: ['company_id', 'template_code']
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
            name: 'idx_event_type',
            fields: ['event_type']
        }
    ]
});

HrmsWorkflowEmailTemplate.associate = (models) => {
    // Belongs to Workflow Master
    HrmsWorkflowEmailTemplate.belongsTo(models.HrmsWorkflowMaster, {
        foreignKey: 'workflow_master_id',
        as: 'workflowMaster'
    });
};

module.exports = { HrmsWorkflowEmailTemplate };
