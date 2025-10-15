/**
 * HRMS Shift Master Model
 * Sequelize model for hrms_shift_master table
 * Stores shift configuration with timing, absence criteria, restrictions, and advanced settings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const HrmsShiftMaster = sequelize.define('HrmsShiftMaster', {
    // Primary key
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
        comment: 'Foreign key to hrms_companies'
    },

    // ==================
    // BASIC SECTION
    // ==================
    shift_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Shift code is required'
            }
        },
        comment: 'Unique shift code (e.g., SHIFT_DAY, SHIFT_NIGHT)'
    },

    shift_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Shift name is required'
            }
        },
        comment: 'Display name for shift'
    },

    shift_colour: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#3498db',
        comment: 'Hex color code for UI display'
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Optional description of shift'
    },

    // ==================
    // TIMING SECTION
    // ==================
    shift_start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Shift start time is required'
            }
        },
        comment: 'Shift start time in 24-hour format'
    },

    first_half_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 270,
        validate: {
            notNull: {
                msg: 'First half duration is required'
            },
            min: 0
        },
        comment: 'First half duration in minutes (270 = 4:30)'
    },

    second_half_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 270,
        validate: {
            notNull: {
                msg: 'Second half duration is required'
            },
            min: 0
        },
        comment: 'Second half duration in minutes (270 = 4:30)'
    },

    // Auto-calculated fields (read-only in Sequelize, calculated by DB)
    total_shift_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Total shift duration (auto-calculated by database)'
    },

    shift_end_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Shift end time (auto-calculated by database)'
    },

    checkin_allowed_before_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 120,
        validate: {
            min: 0
        },
        comment: 'Minutes before shift start that check-in is allowed'
    },

    grace_time_late_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        },
        comment: 'Grace period for late arrival in minutes'
    },

    grace_time_early_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        },
        comment: 'Grace period for early departure in minutes'
    },

    // ==================
    // ABSENCE CRITERIA SECTION
    // ==================
    min_minutes_half_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 270,
        validate: {
            min: 0
        },
        comment: 'Minimum minutes worked to qualify as half day present'
    },

    min_minutes_full_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 540,
        validate: {
            min: 0
        },
        comment: 'Minimum minutes worked to qualify as full day present'
    },

    absent_half_day_after_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 120,
        validate: {
            min: 0
        },
        comment: 'Mark half day absent if late by this many minutes'
    },

    absent_full_day_after_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Mark full day absent if late by this many minutes (NULL = disabled)'
    },

    absent_second_half_before_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Mark second half absent if leaving early by this many minutes (NULL = disabled)'
    },

    // ==================
    // RESTRICTIONS SECTION
    // ==================
    has_shift_allowance: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Shift has monetary allowance, 0=No allowance'
    },

    restrict_manager_backdate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Restrict backdate attendance, 0=No restriction'
    },

    manager_backdate_days_allowed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Number of days manager can backdate (NULL = unlimited)'
    },

    restrict_manager_future: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Restrict future date attendance, 0=No restriction'
    },

    restrict_hr_backdate: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Restrict backdate attendance, 0=No restriction'
    },

    hr_backdate_days_allowed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Number of days HR can backdate (NULL = unlimited)'
    },

    restrict_hr_future: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Restrict future date attendance, 0=No restriction'
    },

    // ==================
    // ADVANCED SECTION
    // ==================
    enable_break_deduction: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Enable break time deduction, 0=Disabled'
    },

    deduct_time_before_shift: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Deduct time if check-in is before shift start, 0=Disabled'
    },

    enable_work_cutoff: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Enable work cutoff time, 0=Disabled'
    },

    work_cutoff_after_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Cut off work time calculation after N minutes (NULL = disabled)'
    },

    // ==================
    // WEEKLY OFF SECTION
    // ==================
    has_custom_weekly_off: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Custom weekly off for this shift, 0=Use company policy'
    },

    weekly_off_type: {
        type: DataTypes.ENUM('policy', 'custom'),
        allowNull: false,
        defaultValue: 'policy',
        comment: 'policy=Use company policy, custom=Use shift-specific weekly off'
    },

    // ==================
    // AUTO-CALCULATED FLAGS
    // ==================
    is_night_shift: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        comment: 'Auto-calculated: 1=Night shift (crosses midnight), 0=Day shift'
    },

    // ==================
    // STATUS & AUDIT
    // ==================
    is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'Must be 0 or 1'
            }
        },
        comment: '1=Active, 0=Inactive'
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who created this shift'
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who last updated this shift'
    },

    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp'
    }
}, {
    // Model options
    tableName: 'hrms_shift_master',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    // Indexes
    indexes: [
        {
            fields: ['company_id']
        },
        {
            fields: ['shift_code']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['is_night_shift']
        },
        {
            unique: true,
            fields: ['company_id', 'shift_code', 'deleted_at'],
            name: 'unique_shift_code_company'
        }
    ]
});

// Define associations
HrmsShiftMaster.associate = (models) => {
    // Shift belongs to Company
    HrmsShiftMaster.belongsTo(models.HrmsCompany, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // Shift has many break rules
    HrmsShiftMaster.hasMany(models.HrmsShiftBreakRules, {
        foreignKey: 'shift_id',
        as: 'breakRules'
    });

    // Shift has many weekly off configurations
    HrmsShiftMaster.hasMany(models.HrmsShiftWeeklyOff, {
        foreignKey: 'shift_id',
        as: 'weeklyOffConfig'
    });

    // Shift has many audit logs
    HrmsShiftMaster.hasMany(models.HrmsShiftAuditLog, {
        foreignKey: 'shift_id',
        as: 'auditLogs'
    });

    // Shift has many employees
    HrmsShiftMaster.hasMany(models.HrmsEmployee, {
        foreignKey: 'shift_id',
        as: 'employees'
    });
};

module.exports = {
    HrmsShiftMaster
};
