/**
 * HRMS Policy Notification Model
 * Sequelize model for hrms_policy_notifications table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyNotification = sequelize.define('HrmsPolicyNotification', {
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
    acknowledgment_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_employee_policy_acknowledgments'
    },
    employee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_employees'
    },
    notification_type: {
        type: DataTypes.ENUM('assignment', 'reminder', 'escalation', 'ess_blocking_warning', 'version_update'),
        allowNull: false
    },
    notification_channel: {
        type: DataTypes.ENUM('email', 'in_app', 'sms', 'push'),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    message_body: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'When to send this notification'
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When notification was sent'
    },
    failed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When notification failed'
    },
    failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    max_retries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    }
}, {
    tableName: 'hrms_policy_notifications',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['policy_id']
        },
        {
            fields: ['acknowledgment_id']
        },
        {
            fields: ['employee_id']
        },
        {
            fields: ['notification_type']
        },
        {
            fields: ['notification_channel']
        },
        {
            fields: ['status']
        },
        {
            fields: ['scheduled_at']
        }
    ]
});

HrmsPolicyNotification.associate = (models) => {
    // Belongs to Policy
    HrmsPolicyNotification.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Belongs to Acknowledgment
    HrmsPolicyNotification.belongsTo(models.HrmsEmployeePolicyAcknowledgment, {
        foreignKey: 'acknowledgment_id',
        as: 'acknowledgment'
    });
};

module.exports = { HrmsPolicyNotification };
