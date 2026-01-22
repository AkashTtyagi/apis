/**
 * Expense Settings Model
 * Company-wide expense module configuration
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../utils/database');

const ExpenseSettings = sequelize.define('ExpenseSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },

    // ==================== GENERAL SETTINGS ====================
    expense_code_prefix: {
        type: DataTypes.STRING(20),
        defaultValue: 'EXP'
    },
    expense_code_format: {
        type: DataTypes.STRING(100),
        defaultValue: '{PREFIX}-{YEAR}{MONTH}-{SEQ}'
    },
    expense_code_sequence_length: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    auto_generate_expense_code: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    // ==================== VIOLATION DETECTION SETTINGS ====================
    policy_violation_action: {
        type: DataTypes.ENUM('Warn', 'Block', 'Allow_With_Justification', 'Flag_For_Review'),
        defaultValue: 'Warn'
    },
    over_limit_action: {
        type: DataTypes.ENUM('Warn', 'Block', 'Allow_With_Approval', 'Flag_For_Review'),
        defaultValue: 'Warn'
    },
    suspicious_pattern_detection: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    round_amount_threshold: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 1000.00
    },
    weekend_expense_flag: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    holiday_expense_flag: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },

    // ==================== AUDIT TRAIL SETTINGS ====================
    audit_trail_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    audit_log_retention_days: {
        type: DataTypes.INTEGER,
        defaultValue: 365
    },
    log_all_views: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    log_field_changes: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    ip_tracking_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    device_tracking_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    geo_location_tracking: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },

    // ==================== METADATA ====================
    is_active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hrms_expense_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_company', unique: true, fields: ['company_id'] },
        { name: 'idx_active', fields: ['is_active'] }
    ]
});

module.exports = { ExpenseSettings };
