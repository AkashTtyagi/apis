/**
 * HRMS Employee Leave Balance Model
 * Sequelize model for hrms_employee_leave_balance table
 * Cached balance table for quick queries (updated from ledger)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsEmployeeLeaveBalance = sequelize.define('HrmsEmployeeLeaveBalance', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Employee ID
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Employee ID is required'
            }
        },
        comment: 'Foreign key to hrms_employees'
    },

    // Leave Type ID
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Leave type ID is required'
            }
        },
        comment: 'Foreign key to hrms_leave_master'
    },

    // Leave Cycle Year
    leave_cycle_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Leave cycle year is required'
            },
            min: 2000,
            max: 2100
        }
    },

    // Month (1-12)
    month: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Month is required'
            },
            min: 1,
            max: 12
        },
        comment: 'Month (1-12) for monthly tracking'
    },

    // Year
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Year is required'
            },
            min: 2000,
            max: 2100
        },
        comment: 'Year for monthly tracking'
    },

    // Available Balance (current balance - updated from ledger)
    available_balance: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Current available leave balance (pending leaves calculated at runtime)'
    },

    // Opening Balance (balance at start of month)
    opening_balance: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Balance at the start of month'
    },

    // Total Credited (sum of all credits in this month)
    total_credited: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total leaves credited in this month'
    },

    // Total Debited (sum of all debits in this month)
    total_debited: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total leaves consumed in this month'
    },

    // Carried Forward (from previous cycle)
    carried_forward: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Leaves carried forward from previous cycle'
    },

    // Encashed (total encashed in this month)
    encashed: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total leaves encashed in this month'
    },

    // Lapsed (total lapsed in this month)
    lapsed: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total leaves lapsed in this month'
    },

    // Last Transaction ID (for reconciliation)
    last_transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Last processed transaction ID from ledger'
    },

    // Last Updated Date
    last_updated_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this balance was last updated'
    },

    // Soft delete timestamp
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
    }
}, {
    // Model options
    tableName: 'hrms_employee_leave_balance',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'leave_type_id', 'year', 'month'],
            name: 'unique_employee_leave_year_month'
        },
        {
            fields: ['employee_id']
        },
        {
            fields: ['leave_type_id']
        },
        {
            fields: ['leave_cycle_year']
        },
        {
            fields: ['year', 'month'],
            name: 'idx_year_month'
        },
        {
            fields: ['available_balance']
        }
    ]
});

// Define associations
HrmsEmployeeLeaveBalance.associate = (models) => {
    // Balance belongs to Leave Type
    HrmsEmployeeLeaveBalance.belongsTo(models.HrmsLeaveMaster, {
        foreignKey: 'leave_type_id',
        as: 'leaveType'
    });

    // Balance belongs to Employee
    HrmsEmployeeLeaveBalance.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });
};

module.exports = {
    HrmsEmployeeLeaveBalance
};
