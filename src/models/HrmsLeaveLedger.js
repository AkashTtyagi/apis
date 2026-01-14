/**
 * HRMS Leave Ledger Model
 * Sequelize model for hrms_leave_ledger table
 * Single source of truth for all leave balance transactions (ledger-based approach)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLeaveLedger = sequelize.define('HrmsLeaveLedger', {
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

    // Transaction Type
    transaction_type: {
        type: DataTypes.ENUM(
            'credit',                  // Regular credit (monthly/yearly allocation)
            'debit',                   // Leave taken/consumed
            'carry_forward',           // Carry forward from previous cycle
            'adjustment_credit',       // Manual credit adjustment
            'adjustment_debit',        // Manual debit adjustment
            'encashment',              // Leave encashment
            'lapse',                   // Leave lapsed/expired
            'reversal',                // Reversal of previous transaction (e.g., leave cancelled/deleted)
            'penalty'                  // Penalty deduction
        ),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Transaction type is required'
            }
        }
    },

    // Transaction Amount (positive for credit, negative for debit)
    amount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Transaction amount is required'
            }
        },
        comment: 'Positive for credit, negative for debit'
    },

    // Running Balance (after this transaction)
    balance_after_transaction: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Running balance after this transaction'
    },

    // Transaction Date
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            notNull: {
                msg: 'Transaction date is required'
            }
        }
    },

    // Reference Type (what triggered this transaction)
    reference_type: {
        type: DataTypes.ENUM(
            'system_credit',           // System-generated credit
            'leave_request',           // Leave request/application
            'manual_adjustment',       // Manual adjustment by admin
            'carry_forward_process',   // Carry forward process
            'encashment_process',      // Encashment process
            'year_end_lapse',          // Year-end lapse process
            'penalty_deduction',       // Penalty deduction
            'leave_cancellation',      // Leave cancelled/deleted - reversal
            'policy_assignment'        // Leave policy assigned to employee
        ),
        allowNull: true,
        comment: 'Source/trigger of this transaction'
    },

    // Reference ID (ID of the related record)
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of related record (e.g., request_id from generic request system)'
    },

    // Remarks/Notes
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about this transaction'
    },

    // Created by user ID
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this transaction (NULL for system-generated)'
    },

    // Reversal Information (points to original transaction being reversed)
    reverses_transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the original transaction that this reverses (used when transaction_type = reversal)'
    }
}, {
    // Model options
    tableName: 'hrms_leave_ledger',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Ledger entries should never be updated (immutable)
    paranoid: false,   // No soft deletes - ledger is permanent

    // Indexes
    indexes: [
        {
            fields: ['employee_id', 'leave_type_id', 'leave_cycle_year'],
            name: 'idx_employee_leave_year'
        },
        {
            fields: ['employee_id', 'transaction_date'],
            name: 'idx_employee_transaction_date'
        },
        {
            fields: ['leave_type_id']
        },
        {
            fields: ['transaction_type']
        },
        {
            fields: ['reference_type', 'reference_id'],
            name: 'idx_reference'
        },
        {
            fields: ['transaction_date']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['reverses_transaction_id']
        }
    ],

    // Hooks
    hooks: {
        beforeCreate: (ledger, options) => {
            // Ensure debit transactions have negative amounts
            if (['debit', 'adjustment_debit', 'encashment', 'lapse', 'penalty'].includes(ledger.transaction_type)) {
                if (ledger.amount > 0) {
                    ledger.amount = -Math.abs(ledger.amount);
                }
            }
            // Ensure credit transactions have positive amounts
            if (['credit', 'carry_forward', 'adjustment_credit', 'reversal'].includes(ledger.transaction_type)) {
                ledger.amount = Math.abs(ledger.amount);
            }
        }
    }
});

module.exports = {
    HrmsLeaveLedger
};
