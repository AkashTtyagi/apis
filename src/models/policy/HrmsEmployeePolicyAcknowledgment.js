/**
 * HRMS Employee Policy Acknowledgment Model
 * Sequelize model for hrms_employee_policy_acknowledgments table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsEmployeePolicyAcknowledgment = sequelize.define('HrmsEmployeePolicyAcknowledgment', {
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
    version_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_policy_versions'
    },
    employee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_employees'
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When policy was assigned'
    },
    assigned_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User who assigned the policy'
    },
    is_acknowledged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When employee acknowledged'
    },
    acknowledgment_ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of acknowledgment'
    },
    acknowledgment_device: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Device info'
    },
    acknowledgment_comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional employee comments'
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Acknowledgment due date'
    },
    reminder_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of reminders sent'
    },
    last_reminder_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last reminder timestamp'
    },
    grace_period_ends_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When ESS blocking starts'
    },
    is_ess_blocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Is employee ESS access blocked'
    },
    ess_blocked_since: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When ESS blocking started'
    }
}, {
    tableName: 'hrms_employee_policy_acknowledgments',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'policy_id', 'version_id'],
            name: 'unique_employee_policy_version'
        },
        {
            fields: ['policy_id']
        },
        {
            fields: ['version_id']
        },
        {
            fields: ['employee_id']
        },
        {
            fields: ['is_acknowledged']
        },
        {
            fields: ['acknowledged_at']
        },
        {
            fields: ['due_date']
        },
        {
            fields: ['is_ess_blocked']
        },
        {
            fields: ['grace_period_ends_at']
        }
    ]
});

HrmsEmployeePolicyAcknowledgment.associate = (models) => {
    // Belongs to Policy
    HrmsEmployeePolicyAcknowledgment.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Belongs to Version
    HrmsEmployeePolicyAcknowledgment.belongsTo(models.HrmsPolicyVersion, {
        foreignKey: 'version_id',
        as: 'version'
    });

    // Has many Audit Logs
    HrmsEmployeePolicyAcknowledgment.hasMany(models.HrmsPolicyAcknowledgmentAudit, {
        foreignKey: 'acknowledgment_id',
        as: 'auditLogs'
    });

    // Has many Notifications
    HrmsEmployeePolicyAcknowledgment.hasMany(models.HrmsPolicyNotification, {
        foreignKey: 'acknowledgment_id',
        as: 'notifications'
    });
};

module.exports = { HrmsEmployeePolicyAcknowledgment };
