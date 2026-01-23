/**
 * HRMS Email Template Model
 * Sequelize model for hrms_email_templates table
 * Stores email templates per company (null company_id for default)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmailTemplate = sequelize.define('HrmsEmailTemplate', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Company ID (nullable - null means default template)
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key reference to hrms_companies table, NULL for default template'
    },

    // Category for grouping templates
    category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: 'Category is required' },
            notEmpty: { msg: 'Category cannot be empty' }
        },
        comment: 'Category: authentication, onboarding, leave, onduty, regularization, wfh, expense, attendance, payroll'
    },

    // Template Slug (unique identifier for template type)
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Template slug is required'
            },
            notEmpty: {
                msg: 'Template slug cannot be empty'
            }
        },
        comment: 'Unique identifier for template type (e.g., leave_apply, leave_approve, expense_submit)'
    },

    // Action Type (apply, approve, reject, cancel, etc.)
    action_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Action: apply, approve, reject, cancel, reminder, escalation'
    },

    // Template Name
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Template name is required'
            }
        }
    },

    // Email Subject
    subject: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Email subject is required'
            }
        }
    },

    // Email Body (HTML)
    body: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Email body is required'
            }
        },
        comment: 'HTML email body with placeholders like {{user_name}}, {{reset_link}}, etc.'
    },

    // Variables (JSON array of available placeholders)
    variables: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of available variables for this template'
    },

    // Is Active
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Created by user ID
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this record'
    },

    // Updated by user ID
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },

    // Soft delete timestamp
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
    }
}, {
    // Model options
    tableName: 'hrms_email_templates',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            fields: ['company_id', 'slug']
        },
        {
            fields: ['company_id', 'category']
        },
        {
            fields: ['company_id', 'category', 'action_type']
        },
        {
            fields: ['category']
        },
        {
            fields: ['slug']
        },
        {
            fields: ['action_type']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['updated_by']
        },
        {
            fields: ['deleted_at']
        }
    ]
});

module.exports = {
    HrmsEmailTemplate
};
