/**
 * HRMS Punch Log Model
 * Stores every punch record for employee attendance
 *
 * Design Principles:
 * - Store raw punch data with timestamp
 * - NO punch_type field (IN/OUT calculated from shift config + sequence)
 * - NO shift_date field (calculated on-the-fly from shift timing)
 * - Clock IN/OUT logic based on shift configuration
 * - Support multiple punches per day (breaks, overtime)
 *
 * Clock IN/OUT Logic:
 * 1. Fetch employee's current shift config
 * 2. Check last punch for this shift
 * 3. If no punch or last was OUT → This is IN
 * 4. If last was IN → This is OUT
 * 5. Validate against shift timing (checkin_allowed_before_minutes, etc.)
 *
 * Timezone Handling:
 * - punch_datetime stored in employee's timezone
 * - For biometric: if company.biometric_utc_enabled, convert UTC → employee TZ
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../utils/database');

const HrmsPunchLog = sequelize.define('HrmsPunchLog', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
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
        },
        comment: 'FK to hrms_employees'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Company ID for multi-tenancy'
    },

    // Punch DateTime (Single source of truth)
    punch_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Actual punch timestamp in employee timezone (converted from UTC if biometric)'
    },

    // Punch Source
    punch_source: {
        type: DataTypes.ENUM('web', 'mobile', 'biometric', 'admin'),
        allowNull: false,
        defaultValue: 'web',
        comment: 'web=browser, mobile=app, biometric=device, admin=manual entry'
    },

    // Biometric UTC Conversion
    is_utc_converted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Was UTC converted to employee TZ? (biometric only)'
    },
    original_utc_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Original UTC datetime before conversion (audit trail)'
    },

    // Biometric Device
    biometric_device_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Biometric device unique ID'
    },
    biometric_device_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Device location (e.g., "Main Gate", "Floor 2")'
    },

    // Mobile/Web Device
    device_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Mobile UUID/IMEI or browser fingerprint'
    },
    device_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Device model (e.g., "iPhone 13", "Samsung S21")'
    },
    device_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '{os, os_version, browser, app_version, model}'
    },

    // GPS Location
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'GPS latitude'
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'GPS longitude'
    },
    location_accuracy: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'GPS accuracy in meters'
    },
    location_address: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reverse geocoded address'
    },

    // Network
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IPv4/IPv6 address'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/App user agent'
    },

    // Timezone
    timezone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Employee timezone (e.g., "Asia/Kolkata")'
    },
    utc_offset: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'UTC offset (e.g., "+05:30")'
    },

    // Selfie Attendance
    photo_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'S3/CDN URL to punch selfie'
    },
    photo_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Face recognition verified?'
    },

    // Validation Flags
    is_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Valid punch (false if suspicious)'
    },
    is_outside_geofence: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Outside allowed geofence?'
    },
    is_manual_entry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Manually entered by admin?'
    },
    is_duplicate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Duplicate within 1 minute?'
    },
    is_late: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Clock-in late?'
    },
    is_early_out: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Clock-out early?'
    },

    // Admin Manual Entry
    entered_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Admin user ID who entered manually'
    },
    entry_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for manual entry'
    },

    // Link to Daily Attendance
    daily_attendance_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'hrms_daily_attendance',
            key: 'id'
        },
        comment: 'Linked after attendance processing'
    },

    // Remarks
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes'
    },

    // Audit
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Usually employee_id for self-punch'
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_punch_log',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,

    indexes: [
        {
            name: 'idx_employee_datetime',
            fields: ['employee_id', 'punch_datetime']
        },
        {
            name: 'idx_company_datetime',
            fields: ['company_id', 'punch_datetime']
        },
        {
            name: 'idx_punch_source',
            fields: ['punch_source']
        },
        {
            name: 'idx_biometric_device',
            fields: ['biometric_device_id', 'punch_datetime']
        },
        {
            name: 'idx_daily_attendance',
            fields: ['daily_attendance_id']
        },
        {
            name: 'idx_is_valid',
            fields: ['is_valid']
        },
        {
            name: 'idx_employee_valid_datetime',
            fields: ['employee_id', 'is_valid', 'punch_datetime']
        }
    ]
});

/**
 * Associations
 */
HrmsPunchLog.associate = (models) => {
    HrmsPunchLog.belongsTo(models.HrmsEmployee, {
        foreignKey: 'employee_id',
        as: 'employee'
    });

    HrmsPunchLog.belongsTo(models.HrmsDailyAttendance, {
        foreignKey: 'daily_attendance_id',
        as: 'dailyAttendance'
    });

    HrmsPunchLog.belongsTo(models.HrmsUser, {
        foreignKey: 'entered_by',
        as: 'enteredByUser'
    });
};

module.exports = { HrmsPunchLog };
