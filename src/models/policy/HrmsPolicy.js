/**
 * HRMS Policy Model
 * Sequelize model for hrms_policies table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicy = sequelize.define('HrmsPolicy', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_companies'
    },
    category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_policy_categories'
    },
    policy_title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Leave Policy, Attendance Policy, etc.'
    },
    policy_slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Unique identifier: leave_policy, attendance_policy'
    },
    policy_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    current_version_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Current active version'
    },
    requires_acknowledgment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Does this policy require employee acknowledgment'
    },
    force_acknowledgment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Block complete ESS access until acknowledged'
    },
    grace_period_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Days before blocking starts (0 = immediate)'
    },
    send_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Send notifications when policy is assigned'
    },
    notification_channels: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array: ["email", "in_app", "sms"]'
    },
    reminder_frequency_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Send reminders every X days if not acknowledged'
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Policy effective from date'
    },
    expires_on: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Policy expiry date (NULL = no expiry)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who created this record'
    },
    updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User ID who last updated this record'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    }
}, {
    tableName: 'hrms_policies',
    timestamps: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        {
            unique: true,
            fields: ['company_id', 'policy_slug'],
            name: 'unique_company_policy_slug'
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['policy_slug']
        },
        {
            fields: ['requires_acknowledgment']
        },
        {
            fields: ['force_acknowledgment']
        },
        {
            fields: ['effective_from']
        },
        {
            fields: ['is_active']
        }
    ]
});

HrmsPolicy.associate = (models) => {
    // Belongs to Category
    HrmsPolicy.belongsTo(models.HrmsPolicyCategory, {
        foreignKey: 'category_id',
        as: 'category'
    });

    // Has many Versions
    HrmsPolicy.hasMany(models.HrmsPolicyVersion, {
        foreignKey: 'policy_id',
        as: 'versions'
    });

    // Has many Attachments
    HrmsPolicy.hasMany(models.HrmsPolicyAttachment, {
        foreignKey: 'policy_id',
        as: 'attachments'
    });

    // Has many Applicability rules
    HrmsPolicy.hasMany(models.HrmsPolicyApplicability, {
        foreignKey: 'policy_id',
        as: 'applicability'
    });

    // Has many Acknowledgments
    HrmsPolicy.hasMany(models.HrmsEmployeePolicyAcknowledgment, {
        foreignKey: 'policy_id',
        as: 'acknowledgments'
    });
};

module.exports = { HrmsPolicy };
