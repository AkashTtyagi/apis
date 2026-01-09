/**
 * Workflow Request Model
 * Stores actual workflow instances/requests submitted by employees
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const HrmsWorkflowRequest = sequelize.define('HrmsWorkflowRequest', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    request_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique request number (e.g., WFR-2024-00001)'
    },
    workflow_config_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_config'
    },
    workflow_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'FK to hrms_workflow_master'
    },
    company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Employee who submitted request'
    },
    submitted_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'User who submitted (may differ if on behalf)'
    },
    current_stage_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_workflow_stages - current stage'
    },
    current_stage_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Current stage order number'
    },
    request_status: {
        type: DataTypes.ENUM('draft', 'submitted', 'pending', 'approved', 'rejected', 'withdrawn', 'cancelled', 'auto_approved', 'auto_rejected'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Current request status'
    },
    overall_status: {
        type: DataTypes.ENUM('in_progress', 'completed', 'rejected', 'withdrawn'),
        allowNull: false,
        defaultValue: 'in_progress',
        comment: 'Overall workflow status'
    },
    request_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Complete request data (leave dates, claim details, etc.)'
    },
    leave_type: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to hrms_leave_master (for leave workflow)'
    },
    from_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Start date (leave/onduty/wfh)'
    },
    to_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'End date (leave/onduty/wfh)'
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When request was submitted'
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When workflow completed'
    },
    sla_due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'SLA due date for current stage'
    },
    is_sla_breached: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Has SLA been breached'
    },
    employee_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Remarks from employee'
    },
    admin_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Remarks from admin'
    }
}, {
    tableName: 'hrms_workflow_requests',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            name: 'idx_request_number',
            unique: true,
            fields: ['request_number']
        },
        {
            name: 'idx_workflow_config_id',
            fields: ['workflow_config_id']
        },
        {
            name: 'idx_employee_id',
            fields: ['employee_id']
        },
        {
            name: 'idx_request_status',
            fields: ['request_status']
        },
        {
            name: 'idx_overall_status',
            fields: ['overall_status']
        },
        {
            name: 'idx_current_stage_id',
            fields: ['current_stage_id']
        },
        {
            name: 'idx_submitted_at',
            fields: ['submitted_at']
        },
        {
            name: 'idx_sla_due_date',
            fields: ['sla_due_date']
        },
        {
            name: 'idx_leave_type',
            fields: ['leave_type']
        },
        {
            name: 'idx_from_date',
            fields: ['from_date']
        },
        {
            name: 'idx_to_date',
            fields: ['to_date']
        }
    ]
});

HrmsWorkflowRequest.associate = (models) => {
    // Belongs to Workflow Config
    HrmsWorkflowRequest.belongsTo(models.HrmsWorkflowConfig, {
        foreignKey: 'workflow_config_id',
        as: 'workflowConfig'
    });

    // Belongs to Workflow Master
    HrmsWorkflowRequest.belongsTo(models.HrmsWorkflowMaster, {
        foreignKey: 'workflow_master_id',
        as: 'workflowMaster'
    });

    // Belongs to Leave Master (for leave workflow)
    HrmsWorkflowRequest.belongsTo(models.HrmsLeaveMaster, {
        foreignKey: 'leave_type',
        as: 'leaveMaster'
    });

    // Belongs to Current Stage
    HrmsWorkflowRequest.belongsTo(models.HrmsWorkflowStage, {
        foreignKey: 'current_stage_id',
        as: 'currentStage'
    });

    // Belongs to Employee
    HrmsWorkflowRequest.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });

    // Has many Actions
    HrmsWorkflowRequest.hasMany(models.HrmsWorkflowAction, {
        foreignKey: 'request_id',
        as: 'actions'
    });

    // Has many Stage Assignments
    HrmsWorkflowRequest.hasMany(models.HrmsWorkflowStageAssignment, {
        foreignKey: 'request_id',
        as: 'assignments'
    });

    // Has many Daily Attendance records
    HrmsWorkflowRequest.hasMany(models.HrmsDailyAttendance, {
        foreignKey: 'request_id',
        as: 'attendanceRecords'
    });
};

module.exports = { HrmsWorkflowRequest };
