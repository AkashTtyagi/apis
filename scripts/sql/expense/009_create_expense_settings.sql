-- =====================================================
-- Expense General Settings Tables
-- Phase 2.2 - General Settings & Configuration
-- =====================================================

-- =====================================================
-- 1. Expense General Settings Table (Company-wide)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,

    -- ==================== GENERAL SETTINGS ====================
    `expense_module_enabled` TINYINT(1) DEFAULT 1 COMMENT 'Enable/disable expense module',
    `expense_code_prefix` VARCHAR(20) DEFAULT 'EXP' COMMENT 'Prefix for expense request codes',
    `expense_code_format` VARCHAR(100) DEFAULT '{PREFIX}-{YEAR}{MONTH}-{SEQ}' COMMENT 'Format: EXP-202501-00001',
    `expense_code_sequence_length` INT DEFAULT 5 COMMENT 'Sequence number length (padded with zeros)',
    `auto_generate_expense_code` TINYINT(1) DEFAULT 1 COMMENT 'Auto-generate expense codes',

    -- ==================== SUBMISSION WINDOW ====================
    `submission_window_enabled` TINYINT(1) DEFAULT 0 COMMENT 'Enable submission window restrictions',
    `submission_window_type` ENUM('Monthly', 'Weekly', 'Custom') DEFAULT 'Monthly',
    `submission_window_start_day` INT DEFAULT 1 COMMENT 'Day of month (1-31) or day of week (1-7)',
    `submission_window_end_day` INT DEFAULT 10 COMMENT 'Day of month (1-31) or day of week (1-7)',
    `submission_window_start_time` TIME DEFAULT '00:00:00' COMMENT 'Start time of submission window',
    `submission_window_end_time` TIME DEFAULT '23:59:59' COMMENT 'End time of submission window',
    `allow_late_submission` TINYINT(1) DEFAULT 0 COMMENT 'Allow submission after window closes',
    `late_submission_penalty_percent` DECIMAL(5,2) DEFAULT 0 COMMENT 'Penalty % for late submissions',
    `late_submission_max_days` INT DEFAULT 0 COMMENT 'Max days after window for late submission',

    -- ==================== DATE & TIME SETTINGS ====================
    `fiscal_year_start_month` INT DEFAULT 4 COMMENT 'Fiscal year start month (1-12), default April',
    `fiscal_year_start_day` INT DEFAULT 1 COMMENT 'Fiscal year start day',
    `date_format` VARCHAR(20) DEFAULT 'DD-MM-YYYY' COMMENT 'Date display format',
    `time_format` VARCHAR(20) DEFAULT 'HH:mm' COMMENT '24-hour or 12-hour format',
    `timezone` VARCHAR(50) DEFAULT 'Asia/Kolkata' COMMENT 'Default timezone',
    `week_start_day` INT DEFAULT 1 COMMENT 'Week starts on (1=Monday, 7=Sunday)',
    `working_days` JSON NULL COMMENT 'Array of working days (1=Mon to 7=Sun) - default [1,2,3,4,5]',

    -- ==================== PAST/FUTURE DATE RULES ====================
    `default_max_past_days` INT DEFAULT 30 COMMENT 'Default max days in past for expense date',
    `default_max_future_days` INT DEFAULT 0 COMMENT 'Default max days in future for expense date',
    `allow_backdated_expenses` TINYINT(1) DEFAULT 1,
    `backdated_approval_required` TINYINT(1) DEFAULT 1 COMMENT 'Extra approval for backdated expenses',
    `backdated_threshold_days` INT DEFAULT 7 COMMENT 'Days after which approval is required',

    -- ==================== DISTANCE & MILEAGE SETTINGS ====================
    `distance_unit` ENUM('KM', 'Miles') DEFAULT 'KM',
    `default_mileage_rate` DECIMAL(10,2) DEFAULT 8.00 COMMENT 'Default rate per KM/Mile',
    `mileage_calculation_method` ENUM('Manual', 'Google_Maps', 'Fixed_Route') DEFAULT 'Manual',
    `google_maps_api_enabled` TINYINT(1) DEFAULT 0,
    `google_maps_api_key` VARCHAR(255) NULL COMMENT 'Encrypted API key',
    `allow_round_trip_calculation` TINYINT(1) DEFAULT 1,
    `max_daily_mileage` DECIMAL(10,2) NULL COMMENT 'Max mileage per day (null = unlimited)',
    `max_monthly_mileage` DECIMAL(10,2) NULL COMMENT 'Max mileage per month',
    `require_odometer_reading` TINYINT(1) DEFAULT 0,
    `require_route_details` TINYINT(1) DEFAULT 1,

    -- ==================== PER DIEM SETTINGS ====================
    `per_diem_calculation_method` ENUM('Full_Day', 'Half_Day', 'Hourly', 'Custom') DEFAULT 'Full_Day',
    `per_diem_full_day_hours` INT DEFAULT 8 COMMENT 'Hours for full day per diem',
    `per_diem_half_day_hours` INT DEFAULT 4 COMMENT 'Hours for half day per diem',
    `per_diem_include_travel_days` TINYINT(1) DEFAULT 1,
    `per_diem_deduct_meals_provided` TINYINT(1) DEFAULT 1,
    `meal_deduction_breakfast_percent` DECIMAL(5,2) DEFAULT 20.00,
    `meal_deduction_lunch_percent` DECIMAL(5,2) DEFAULT 30.00,
    `meal_deduction_dinner_percent` DECIMAL(5,2) DEFAULT 30.00,

    -- ==================== RECEIPT & DOCUMENT SETTINGS ====================
    `default_receipt_required_above` DECIMAL(15,2) DEFAULT 500.00,
    `allowed_file_types` JSON NULL COMMENT 'Default: ["jpg","jpeg","png","pdf","doc","docx"]',
    `max_file_size_mb` INT DEFAULT 5 COMMENT 'Max file size in MB',
    `max_files_per_expense` INT DEFAULT 5,
    `require_original_receipt` TINYINT(1) DEFAULT 0 COMMENT 'Require original paper receipt',
    `receipt_retention_days` INT DEFAULT 365 COMMENT 'Days to retain receipt files',
    `auto_ocr_enabled` TINYINT(1) DEFAULT 0 COMMENT 'Auto extract data from receipts',

    -- ==================== VIOLATION DETECTION SETTINGS ====================
    `duplicate_detection_enabled` TINYINT(1) DEFAULT 1,
    `duplicate_detection_fields` JSON NULL COMMENT 'Default: ["amount","date","category_id"]',
    `duplicate_detection_days` INT DEFAULT 7 COMMENT 'Check duplicates within these days',
    `duplicate_action` ENUM('Warn', 'Block', 'Flag_For_Review') DEFAULT 'Warn',
    `policy_violation_action` ENUM('Warn', 'Block', 'Allow_With_Justification', 'Flag_For_Review') DEFAULT 'Warn',
    `over_limit_action` ENUM('Warn', 'Block', 'Allow_With_Approval', 'Flag_For_Review') DEFAULT 'Warn',
    `suspicious_pattern_detection` TINYINT(1) DEFAULT 0,
    `round_amount_threshold` DECIMAL(15,2) DEFAULT 1000.00 COMMENT 'Flag round amounts above this',
    `weekend_expense_flag` TINYINT(1) DEFAULT 0 COMMENT 'Flag expenses on weekends',
    `holiday_expense_flag` TINYINT(1) DEFAULT 0 COMMENT 'Flag expenses on holidays',

    -- ==================== PAYMENT SETTINGS ====================
    `payment_cycle` ENUM('Weekly', 'Bi-Weekly', 'Monthly', 'On_Demand') DEFAULT 'Monthly',
    `payment_day` INT DEFAULT 5 COMMENT 'Day of cycle for payment processing',
    `minimum_payment_amount` DECIMAL(15,2) DEFAULT 100.00,
    `payment_consolidation` TINYINT(1) DEFAULT 1 COMMENT 'Consolidate multiple expenses',
    `auto_adjust_advance` TINYINT(1) DEFAULT 1,
    `bank_transfer_format` ENUM('NEFT', 'RTGS', 'IMPS', 'UPI', 'Custom') DEFAULT 'NEFT',
    `include_tax_in_reimbursement` TINYINT(1) DEFAULT 1,
    `tds_applicable` TINYINT(1) DEFAULT 0,
    `tds_threshold` DECIMAL(15,2) NULL,
    `tds_rate` DECIMAL(5,2) NULL,

    -- ==================== NOTIFICATION SETTINGS ====================
    `email_notifications_enabled` TINYINT(1) DEFAULT 1,
    `push_notifications_enabled` TINYINT(1) DEFAULT 1,
    `sms_notifications_enabled` TINYINT(1) DEFAULT 0,
    `notify_on_submission` TINYINT(1) DEFAULT 1,
    `notify_on_approval` TINYINT(1) DEFAULT 1,
    `notify_on_rejection` TINYINT(1) DEFAULT 1,
    `notify_on_payment` TINYINT(1) DEFAULT 1,
    `reminder_before_window_close_days` INT DEFAULT 3,
    `pending_approval_reminder_hours` INT DEFAULT 48,
    `escalation_reminder_hours` INT DEFAULT 24,

    -- ==================== AUDIT TRAIL SETTINGS ====================
    `audit_trail_enabled` TINYINT(1) DEFAULT 1,
    `audit_log_retention_days` INT DEFAULT 365 COMMENT 'Days to retain audit logs',
    `log_all_views` TINYINT(1) DEFAULT 0 COMMENT 'Log view actions (performance impact)',
    `log_field_changes` TINYINT(1) DEFAULT 1 COMMENT 'Log individual field changes',
    `ip_tracking_enabled` TINYINT(1) DEFAULT 1,
    `device_tracking_enabled` TINYINT(1) DEFAULT 0,
    `geo_location_tracking` TINYINT(1) DEFAULT 0,

    -- ==================== INTEGRATION SETTINGS ====================
    `erp_integration_enabled` TINYINT(1) DEFAULT 0,
    `erp_system` VARCHAR(50) NULL COMMENT 'SAP, Oracle, Tally, etc.',
    `erp_sync_frequency` ENUM('Real_Time', 'Hourly', 'Daily', 'Manual') DEFAULT 'Daily',
    `accounting_integration_enabled` TINYINT(1) DEFAULT 0,
    `default_expense_account` VARCHAR(50) NULL,
    `default_liability_account` VARCHAR(50) NULL,

    -- ==================== UI/UX SETTINGS ====================
    `default_list_page_size` INT DEFAULT 20,
    `show_expense_summary_dashboard` TINYINT(1) DEFAULT 1,
    `allow_draft_save` TINYINT(1) DEFAULT 1,
    `auto_save_interval_seconds` INT DEFAULT 30,
    `show_policy_hints` TINYINT(1) DEFAULT 1,
    `show_limit_warnings` TINYINT(1) DEFAULT 1,
    `allow_expense_templates` TINYINT(1) DEFAULT 1,
    `allow_recurring_expenses` TINYINT(1) DEFAULT 0,

    -- ==================== METADATA ====================
    `is_active` TINYINT(1) DEFAULT 1,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    UNIQUE INDEX `idx_company` (`company_id`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Company-wide expense module settings';


-- =====================================================
-- 2. Expense Settings Audit Log
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_settings_audit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,
    `settings_id` INT NOT NULL,
    `action` ENUM('create', 'update') NOT NULL,
    `field_name` VARCHAR(100) NULL,
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    `changed_by` INT NOT NULL,
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,

    INDEX `idx_company` (`company_id`),
    INDEX `idx_settings` (`settings_id`),
    INDEX `idx_changed_at` (`changed_at`),
    INDEX `idx_field` (`field_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for expense settings changes';


-- =====================================================
-- 3. Mileage Rates Configuration (Location/Vehicle based)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_mileage_rates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,
    `rate_name` VARCHAR(100) NOT NULL,
    `rate_code` VARCHAR(50) NOT NULL,

    -- Rate Configuration
    `vehicle_type` ENUM('Two_Wheeler', 'Four_Wheeler', 'Public_Transport', 'Other') DEFAULT 'Four_Wheeler',
    `fuel_type` ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Any') DEFAULT 'Any',
    `rate_per_unit` DECIMAL(10,2) NOT NULL COMMENT 'Rate per KM/Mile',
    `min_distance` DECIMAL(10,2) DEFAULT 0 COMMENT 'Minimum distance for reimbursement',
    `max_distance_per_day` DECIMAL(10,2) NULL,
    `max_distance_per_month` DECIMAL(10,2) NULL,

    -- Applicability
    `location_group_id` INT NULL COMMENT 'Location-specific rate',
    `grade_ids` JSON NULL COMMENT 'Applicable grades',
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,

    -- Status
    `is_active` TINYINT(1) DEFAULT 1,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX `idx_company_code` (`company_id`, `rate_code`),
    INDEX `idx_vehicle_type` (`vehicle_type`),
    INDEX `idx_effective` (`effective_from`, `effective_to`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mileage reimbursement rates by vehicle type and location';


-- =====================================================
-- 4. Per Diem Rates Configuration (Location based)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_per_diem_rates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,
    `rate_name` VARCHAR(100) NOT NULL,
    `rate_code` VARCHAR(50) NOT NULL,

    -- Rate Configuration
    `location_group_id` INT NULL COMMENT 'Location-specific rate',
    `city_tier` ENUM('Metro', 'Tier_1', 'Tier_2', 'Tier_3', 'International') DEFAULT 'Metro',
    `full_day_rate` DECIMAL(15,2) NOT NULL,
    `half_day_rate` DECIMAL(15,2) NULL,
    `hourly_rate` DECIMAL(15,2) NULL,

    -- Meal Rates (if separate)
    `breakfast_rate` DECIMAL(15,2) NULL,
    `lunch_rate` DECIMAL(15,2) NULL,
    `dinner_rate` DECIMAL(15,2) NULL,
    `incidental_rate` DECIMAL(15,2) NULL,

    -- Applicability
    `grade_ids` JSON NULL COMMENT 'Applicable grades',
    `designation_ids` JSON NULL COMMENT 'Applicable designations',
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,

    -- Status
    `is_active` TINYINT(1) DEFAULT 1,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX `idx_company_code` (`company_id`, `rate_code`),
    INDEX `idx_location_group` (`location_group_id`),
    INDEX `idx_city_tier` (`city_tier`),
    INDEX `idx_effective` (`effective_from`, `effective_to`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per diem rates by location and tier';


-- =====================================================
-- 5. Holiday Calendar for Expense (Optional override)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_holidays` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,
    `holiday_date` DATE NOT NULL,
    `holiday_name` VARCHAR(200) NOT NULL,
    `holiday_type` ENUM('National', 'Regional', 'Company', 'Optional') DEFAULT 'Company',
    `location_ids` JSON NULL COMMENT 'Applicable locations (null = all)',
    `block_expense_filing` TINYINT(1) DEFAULT 0 COMMENT 'Block expense filing on this day',
    `flag_expenses` TINYINT(1) DEFAULT 1 COMMENT 'Flag expenses on this day for review',

    `is_active` TINYINT(1) DEFAULT 1,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `idx_company_date` (`company_id`, `holiday_date`),
    INDEX `idx_holiday_type` (`holiday_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday calendar for expense date validation';
