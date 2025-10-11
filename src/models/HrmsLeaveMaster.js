/**
 * HRMS Leave Master Model
 * Sequelize model for hrms_leave_master table
 * Stores leave type configurations (default and custom)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsLeaveMaster = sequelize.define('HrmsLeaveMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Master ID (NULL for default leave types, references id for custom)
    master_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'NULL for default leaves, references parent leave type for custom'
    },

    // Company ID
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Company ID is required'
            }
        },
        comment: 'Foreign key to hrms_companies (0 for system default leaves)'
    },

    // Leave Code
    leave_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Leave code is required'
            }
        },
        comment: 'Unique identifier for leave type (e.g., MAT, PAT, LOP)'
    },

    // Leave Name
    leave_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Leave name is required'
            }
        }
    },

    // Leave Cycle
    leave_cycle_start_month: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 12
        },
        comment: 'Month leave cycle starts (1-12)'
    },

    leave_cycle_end_month: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 12
        },
        comment: 'Month leave cycle ends (1-12)'
    },

    // Leave Type
    leave_type: {
        type: DataTypes.ENUM('paid', 'unpaid'),
        allowNull: false,
        defaultValue: 'paid'
    },

    is_encashment_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    // --- ELIGIBILITY ---
    applicable_to_esi: {
        type: DataTypes.ENUM('esi', 'non_esi', 'both'),
        allowNull: false,
        defaultValue: 'both'
    },

    applicable_to_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '0',
        comment: 'Comma-separated status IDs from hrms_employee_status_master (e.g., "0,1,2" for Active,Probation,Internship)'
    },

    applicable_to_gender: {
        type: DataTypes.ENUM('male', 'female', 'transgender', 'all'),
        allowNull: false,
        defaultValue: 'all'
    },

    // --- CREDIT RULE ---
    credit_frequency: {
        type: DataTypes.ENUM('monthly', 'quarterly', 'half_yearly', 'yearly', 'next_year', 'manual'),
        allowNull: false,
        defaultValue: 'yearly'
    },

    credit_day_of_month: {
        type: DataTypes.TINYINT,
        allowNull: true,
        validate: {
            min: 1,
            max: 31
        }
    },

    // Status-based credit amounts
    number_of_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Default leaves to credit'
    },

    active_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Leaves for active employees (overrides default if set)'
    },

    probation_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Leaves for probation employees'
    },

    intern_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Leaves for interns'
    },

    contractor_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Leaves for contractors'
    },

    separated_leaves_to_credit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Leaves for separated employees'
    },

    credit_only_married: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    round_off_credited_leaves: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    lapse_balance_before_next_cycle: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // --- REQUEST CONFIGURATION ---
    can_request_half_day: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    can_employee_request: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    max_requests_per_tenure: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    max_requests_per_month: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    min_leaves_per_request: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0.5
    },

    max_continuous_leave: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    max_leaves_per_year: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },

    max_leaves_per_month: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
    },

    backdated_leave_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    days_allowed_for_backdated_leave: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    future_dated_leave_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    manager_can_apply_future_dated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    manager_can_apply_backdated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    days_allowed_manager_backdated: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    document_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    raise_leave_after_attendance_process: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    restrict_if_resignation_pending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    restrict_after_joining_period: {
        type: DataTypes.ENUM('no_restriction', 'exclude_joining_month', 'exclude_first_3_months', 'exclude_probation_period'),
        allowNull: false,
        defaultValue: 'no_restriction'
    },

    // --- CARRY FORWARD ---
    max_leaves_to_carry_forward: {
        type: DataTypes.ENUM('zero', 'all', 'specific'),
        allowNull: false,
        defaultValue: 'zero'
    },

    max_carry_forward_count: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },

    carry_forward_method: {
        type: DataTypes.ENUM('manual', 'auto'),
        allowNull: false,
        defaultValue: 'auto'
    },

    carry_forward_in_same_cycle: {
        type: DataTypes.ENUM('zero', 'all', 'specific'),
        allowNull: false,
        defaultValue: 'zero'
    },

    carry_forward_same_cycle_count: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },

    // Active flag
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
    tableName: 'hrms_leave_master',
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
            fields: ['company_id', 'leave_code'],
            name: 'unique_company_leave_code'
        },
        {
            fields: ['company_id', 'is_active']
        },
        {
            fields: ['master_id']
        },
        {
            fields: ['leave_type']
        },
        {
            fields: ['applicable_to_gender']
        }
    ]
});

module.exports = {
    HrmsLeaveMaster
};
