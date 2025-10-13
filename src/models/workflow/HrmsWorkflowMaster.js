/**
 * Workflow Master Model
 * Stores workflow types (Leave, On Duty, WFH, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowMaster = sequelize.define('HrmsWorkflowMaster', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Workflow Master ID'
    },
    workflow_for_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Leave, On Duty, Regularization, WFH, etc.'
    },
    workflow_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'LEAVE, ONDUTY, REGULARIZATION, WFH, etc.'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the workflow type'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active status'
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order in UI'
    }
}, {
    tableName: 'hrms_workflow_master',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_workflow_code',
            fields: ['workflow_code']
        },
        {
            name: 'idx_is_active',
            fields: ['is_active']
        }
    ],
    comment: 'Master table for workflow types'
});

/**
 * Define associations
 */
HrmsWorkflowMaster.associate = (models) => {
    // Workflow Master has many Workflow Configurations
    HrmsWorkflowMaster.hasMany(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_master_id',
        as: 'workflowConfigs'
    });

    // Workflow Master has many Email Templates
    HrmsWorkflowMaster.hasMany(models.HrmsWorkflowEmailTemplate, {
        foreignKey: 'workflow_master_id',
        as: 'emailTemplates'
    });

    // Workflow Master has many Daily Attendance records
    HrmsWorkflowMaster.hasMany(models.HrmsDailyAttendance, {
        foreignKey: 'workflow_master_id',
        as: 'attendanceRecords'
    });
};

module.exports = { HrmsWorkflowMaster };
