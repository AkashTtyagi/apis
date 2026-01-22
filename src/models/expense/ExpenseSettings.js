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
    expense_module_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
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

    // ==================== SUBMISSION WINDOW ====================
    submission_window_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    submission_window_type: {
        type: DataTypes.ENUM('Monthly', 'Weekly', 'Custom'),
        defaultValue: 'Monthly'
    },
    submission_window_start_day: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    submission_window_end_day: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    submission_window_start_time: {
        type: DataTypes.TIME,
        defaultValue: '00:00:00'
    },
    submission_window_end_time: {
        type: DataTypes.TIME,
        defaultValue: '23:59:59'
    },
    allow_late_submission: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    late_submission_penalty_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    late_submission_max_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    // ==================== DATE & TIME SETTINGS ====================
    fiscal_year_start_month: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    },
    fiscal_year_start_day: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    date_format: {
        type: DataTypes.STRING(20),
        defaultValue: 'DD-MM-YYYY'
    },
    time_format: {
        type: DataTypes.STRING(20),
        defaultValue: 'HH:mm'
    },
    timezone: {
        type: DataTypes.STRING(50),
        defaultValue: 'Asia/Kolkata'
    },
    week_start_day: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    working_days: {
        type: DataTypes.JSON,
        defaultValue: [1, 2, 3, 4, 5]
    },

    // ==================== PAST/FUTURE DATE RULES ====================
    default_max_past_days: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    default_max_future_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    allow_backdated_expenses: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    backdated_approval_required: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    backdated_threshold_days: {
        type: DataTypes.INTEGER,
        defaultValue: 7
    },

    // ==================== DISTANCE & MILEAGE SETTINGS ====================
    distance_unit: {
        type: DataTypes.ENUM('KM', 'Miles'),
        defaultValue: 'KM'
    },
    default_mileage_rate: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 8.00
    },
    mileage_calculation_method: {
        type: DataTypes.ENUM('Manual', 'Google_Maps', 'Fixed_Route'),
        defaultValue: 'Manual'
    },
    google_maps_api_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    google_maps_api_key: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    allow_round_trip_calculation: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    max_daily_mileage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    max_monthly_mileage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    require_odometer_reading: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    require_route_details: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },

    // ==================== PER DIEM SETTINGS ====================
    per_diem_calculation_method: {
        type: DataTypes.ENUM('Full_Day', 'Half_Day', 'Hourly', 'Custom'),
        defaultValue: 'Full_Day'
    },
    per_diem_full_day_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 8
    },
    per_diem_half_day_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    },
    per_diem_include_travel_days: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    per_diem_deduct_meals_provided: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    meal_deduction_breakfast_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 20.00
    },
    meal_deduction_lunch_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 30.00
    },
    meal_deduction_dinner_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 30.00
    },

    // ==================== RECEIPT & DOCUMENT SETTINGS ====================
    default_receipt_required_above: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 500.00
    },
    allowed_file_types: {
        type: DataTypes.JSON,
        defaultValue: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
    },
    max_file_size_mb: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    max_files_per_expense: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    require_original_receipt: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    receipt_retention_days: {
        type: DataTypes.INTEGER,
        defaultValue: 365
    },
    auto_ocr_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },

    // ==================== VIOLATION DETECTION SETTINGS ====================
    duplicate_detection_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    duplicate_detection_fields: {
        type: DataTypes.JSON,
        defaultValue: ['amount', 'date', 'category_id']
    },
    duplicate_detection_days: {
        type: DataTypes.INTEGER,
        defaultValue: 7
    },
    duplicate_action: {
        type: DataTypes.ENUM('Warn', 'Block', 'Flag_For_Review'),
        defaultValue: 'Warn'
    },
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

    // ==================== PAYMENT SETTINGS ====================
    payment_cycle: {
        type: DataTypes.ENUM('Weekly', 'Bi-Weekly', 'Monthly', 'On_Demand'),
        defaultValue: 'Monthly'
    },
    payment_day: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    minimum_payment_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 100.00
    },
    payment_consolidation: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    auto_adjust_advance: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    bank_transfer_format: {
        type: DataTypes.ENUM('NEFT', 'RTGS', 'IMPS', 'UPI', 'Custom'),
        defaultValue: 'NEFT'
    },
    include_tax_in_reimbursement: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    tds_applicable: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    tds_threshold: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    tds_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },

    // ==================== NOTIFICATION SETTINGS ====================
    email_notifications_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    push_notifications_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    sms_notifications_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    notify_on_submission: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    notify_on_approval: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    notify_on_rejection: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    notify_on_payment: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    reminder_before_window_close_days: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    pending_approval_reminder_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 48
    },
    escalation_reminder_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 24
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

    // ==================== INTEGRATION SETTINGS ====================
    erp_integration_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    erp_system: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    erp_sync_frequency: {
        type: DataTypes.ENUM('Real_Time', 'Hourly', 'Daily', 'Manual'),
        defaultValue: 'Daily'
    },
    accounting_integration_enabled: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    default_expense_account: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    default_liability_account: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    // ==================== UI/UX SETTINGS ====================
    default_list_page_size: {
        type: DataTypes.INTEGER,
        defaultValue: 20
    },
    show_expense_summary_dashboard: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    allow_draft_save: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    auto_save_interval_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    show_policy_hints: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    show_limit_warnings: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    allow_expense_templates: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    allow_recurring_expenses: {
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
