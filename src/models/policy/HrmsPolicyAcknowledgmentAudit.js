/**
 * HRMS Policy Acknowledgment Audit Model
 * Sequelize model for hrms_policy_acknowledgment_audit table
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsPolicyAcknowledgmentAudit = sequelize.define('HrmsPolicyAcknowledgmentAudit', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    acknowledgment_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_employee_policy_acknowledgments'
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
    event_type: {
        type: DataTypes.ENUM('assigned', 'viewed', 'acknowledged', 'reminder_sent', 'ess_blocked', 'ess_unblocked', 're_assigned'),
        allowNull: false
    },
    event_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    performed_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'User who performed this action (NULL for system)'
    },
    performed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    additional_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Extra event data'
    }
}, {
    tableName: 'hrms_policy_acknowledgment_audit',
    timestamps: false,
    indexes: [
        {
            fields: ['acknowledgment_id']
        },
        {
            fields: ['policy_id']
        },
        {
            fields: ['employee_id']
        },
        {
            fields: ['event_type']
        },
        {
            fields: ['performed_at']
        }
    ]
});

HrmsPolicyAcknowledgmentAudit.associate = (models) => {
    // Belongs to Acknowledgment
    HrmsPolicyAcknowledgmentAudit.belongsTo(models.HrmsEmployeePolicyAcknowledgment, {
        foreignKey: 'acknowledgment_id',
        as: 'acknowledgment'
    });

    // Belongs to Policy
    HrmsPolicyAcknowledgmentAudit.belongsTo(models.HrmsPolicy, {
        foreignKey: 'policy_id',
        as: 'policy'
    });

    // Belongs to Version
    HrmsPolicyAcknowledgmentAudit.belongsTo(models.HrmsPolicyVersion, {
        foreignKey: 'version_id',
        as: 'version'
    });
};

module.exports = { HrmsPolicyAcknowledgmentAudit };
