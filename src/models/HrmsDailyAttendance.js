/**
 * HrmsDailyAttendance Model
 *
 * Purpose: Stores actual daily attendance records for employees
 *
 * Integration with Workflow:
 * - workflow_master_id = NULL → Regular attendance (punch in/out)
 * - workflow_master_id = 1 → Leave (from workflow request)
 * - workflow_master_id = 2 → On Duty (from workflow request)
 * - workflow_master_id = 3 → WFH (from workflow request)
 *
 * Note: Holidays and Week-offs are NOT stored here (calculated from calendar)
 *
 * Example: Employee applies for 5 days leave
 * → 1 entry in hrms_workflow_requests
 * → 5 entries in hrms_daily_attendance (one per day)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsDailyAttendance = sequelize.define('HrmsDailyAttendance', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },

    // Employee & Company
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'hrms_employees',
            key: 'id'
        }
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Date
    attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    // Workflow Integration (NULL for regular attendance)
    request_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'hrms_workflow_requests',
            key: 'id'
        },
        comment: 'FK to hrms_workflow_requests - NULL for regular attendance'
    },
    workflow_master_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'hrms_workflow_master',
            key: 'id'
        },
        comment: 'FK to hrms_workflow_master - NULL for regular attendance, 1=Leave, 2=OnDuty, 3=WFH'
    },

    // Pay Type
    pay_day: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1=Full Day, 2=First Half, 3=Second Half'
    },

    // Actual Punch Details
    punch_in: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Actual punch in time'
    },
    punch_out: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Actual punch out time'
    },
    punch_in_location: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Punch in location (lat,long or address)'
    },
    punch_out_location: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Punch out location (lat,long or address)'
    },

    // Shift Details (Expected)
    shift_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK to shift master'
    },
    shift_punch_in: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Expected shift start time'
    },
    shift_punch_out: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Expected shift end time'
    },

    // Work Hours
    total_hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Total working hours'
    },
    break_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'Break time'
    },
    overtime_hours: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'Overtime hours'
    },

    // Late/Early Tracking
    late_by_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Minutes late'
    },
    early_out_by_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Minutes early out'
    },

    // Payment
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Is this day paid or unpaid'
    },

    // Additional Details
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    leave_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Type of leave if workflow_master_id = 1'
    },

    // Approval (for manual/regularization entries)
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'hrms_user_details',
            key: 'id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Metadata
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

}, {
    tableName: 'hrms_daily_attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_employee_date',
            fields: ['employee_id', 'attendance_date']
        },
        {
            name: 'idx_company_date',
            fields: ['company_id', 'attendance_date']
        },
        {
            name: 'idx_request',
            fields: ['request_id']
        },
        {
            name: 'idx_workflow_master',
            fields: ['workflow_master_id']
        },
        {
            name: 'idx_attendance_date',
            fields: ['attendance_date']
        },
        {
            name: 'idx_employee_month',
            fields: ['employee_id', 'attendance_date']
        }
    ],
    comment: 'Daily attendance records with workflow integration'
});

// Note: NO UNIQUE constraint on (employee_id, attendance_date)
// because multiple entries allowed for same date (regularization scenarios)

// Define associations
HrmsDailyAttendance.associate = (models) => {
    // Belongs to Employee
    HrmsDailyAttendance.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });

    // Belongs to Workflow Request
    HrmsDailyAttendance.belongsTo(models.HrmsWorkflowRequest, {
        foreignKey: 'request_id',
        as: 'workflowRequest'
    });

    // Belongs to Workflow Master
    HrmsDailyAttendance.belongsTo(models.HrmsWorkflowMaster, {
        foreignKey: 'workflow_master_id',
        as: 'workflowMaster'
    });

    // Belongs to Approved By User
    HrmsDailyAttendance.belongsTo(models.HrmsUserDetails, {
        foreignKey: 'approved_by',
        as: 'approver'
    });
};

module.exports = { HrmsDailyAttendance };
