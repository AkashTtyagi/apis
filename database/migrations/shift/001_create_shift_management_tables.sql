-- =====================================================
-- HRMS Shift Management System - Database Migration
-- =====================================================
-- Version: 1.0
-- Created: 2025-10-15
-- Description: Complete shift management system with timing, breaks, weekly off, and night shift support
--
-- Tables Created:
--   1. hrms_shift_master - Main shift configuration
--   2. hrms_shift_break_rules - Break rules for shifts
--   3. hrms_shift_weekly_off - 5-week rotation weekly off configuration
--   4. hrms_shift_audit_log - Audit trail for shift changes
--
-- Employee Table Alteration:
--   - Adds shift_id column to hrms_employees
-- =====================================================

-- =====================================================
-- TABLE 1: hrms_shift_master
-- =====================================================
-- Main shift configuration table
-- Stores: Basic info, timing, absence criteria, restrictions, advanced settings
-- Key Features:
--   - Hybrid storage: Durations in INT minutes, API converts to/from TIME
--   - Auto-calculated fields: total_shift_duration_minutes, shift_end_time, is_night_shift
--   - Night shift detection: Auto-detects when shift crosses midnight
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_shift_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- ==================
    -- BASIC SECTION
    -- ==================
    shift_code VARCHAR(50) NOT NULL COMMENT 'Unique shift code (e.g., SHIFT_DAY, SHIFT_NIGHT)',
    shift_name VARCHAR(255) NOT NULL COMMENT 'Display name for shift',
    shift_colour VARCHAR(20) DEFAULT '#3498db' COMMENT 'Hex color code for UI display',
    description TEXT COMMENT 'Optional description of shift',

    -- ==================
    -- TIMING SECTION
    -- ==================
    -- Main timing fields
    shift_start_time TIME NOT NULL COMMENT 'Shift start time in 24-hour format',
    first_half_duration_minutes INT NOT NULL DEFAULT 270 COMMENT 'First half duration in minutes (270 = 4:30)',
    second_half_duration_minutes INT NOT NULL DEFAULT 270 COMMENT 'Second half duration in minutes (270 = 4:30)',

    -- Auto-calculated timing fields
    total_shift_duration_minutes INT GENERATED ALWAYS AS (
        first_half_duration_minutes + second_half_duration_minutes
    ) STORED COMMENT 'Total shift duration (auto-calculated)',

    shift_end_time TIME GENERATED ALWAYS AS (
        ADDTIME(shift_start_time, SEC_TO_TIME((first_half_duration_minutes + second_half_duration_minutes) * 60))
    ) STORED COMMENT 'Shift end time (auto-calculated)',

    -- Grace and check-in settings
    checkin_allowed_before_minutes INT NOT NULL DEFAULT 120 COMMENT 'Minutes before shift start that check-in is allowed',
    grace_time_late_minutes INT NOT NULL DEFAULT 0 COMMENT 'Grace period for late arrival in minutes',
    grace_time_early_minutes INT NOT NULL DEFAULT 0 COMMENT 'Grace period for early departure in minutes',

    -- ==================
    -- ABSENCE CRITERIA SECTION
    -- ==================
    min_minutes_half_day INT NOT NULL DEFAULT 270 COMMENT 'Minimum minutes worked to qualify as half day present',
    min_minutes_full_day INT NOT NULL DEFAULT 540 COMMENT 'Minimum minutes worked to qualify as full day present',
    absent_half_day_after_minutes INT DEFAULT 120 COMMENT 'Mark half day absent if late by this many minutes',
    absent_full_day_after_minutes INT DEFAULT NULL COMMENT 'Mark full day absent if late by this many minutes (NULL = disabled)',
    absent_second_half_before_minutes INT DEFAULT NULL COMMENT 'Mark second half absent if leaving early by this many minutes (NULL = disabled)',

    -- ==================
    -- RESTRICTIONS SECTION
    -- ==================
    -- Shift allowance
    has_shift_allowance TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Shift has monetary allowance, 0=No allowance',

    -- Manager restrictions
    restrict_manager_backdate TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Restrict backdate attendance, 0=No restriction',
    manager_backdate_days_allowed INT DEFAULT NULL COMMENT 'Number of days manager can backdate (NULL = unlimited)',
    restrict_manager_future TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Restrict future date attendance, 0=No restriction',

    -- HR restrictions
    restrict_hr_backdate TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Restrict backdate attendance, 0=No restriction',
    hr_backdate_days_allowed INT DEFAULT NULL COMMENT 'Number of days HR can backdate (NULL = unlimited)',
    restrict_hr_future TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Restrict future date attendance, 0=No restriction',

    -- ==================
    -- ADVANCED SECTION
    -- ==================
    enable_break_deduction TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Enable break time deduction, 0=Disabled',
    deduct_time_before_shift TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Deduct time if check-in is before shift start, 0=Disabled',
    enable_work_cutoff TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Enable work cutoff time, 0=Disabled',
    work_cutoff_after_minutes INT DEFAULT NULL COMMENT 'Cut off work time calculation after N minutes (NULL = disabled)',

    -- ==================
    -- WEEKLY OFF SECTION
    -- ==================
    has_custom_weekly_off TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Custom weekly off for this shift, 0=Use company policy',
    weekly_off_type ENUM('policy', 'custom') NOT NULL DEFAULT 'policy' COMMENT 'policy=Use company policy, custom=Use shift-specific weekly off',

    -- ==================
    -- AUTO-CALCULATED FLAGS
    -- ==================
    is_night_shift TINYINT(1) GENERATED ALWAYS AS (
        CASE
            WHEN ADDTIME(shift_start_time, SEC_TO_TIME((first_half_duration_minutes + second_half_duration_minutes) * 60)) <= shift_start_time
            THEN 1
            ELSE 0
        END
    ) STORED COMMENT 'Auto-calculated: 1=Night shift (crosses midnight), 0=Day shift',

    -- ==================
    -- STATUS & AUDIT
    -- ==================
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_by INT DEFAULT NULL COMMENT 'User ID who created this shift',
    updated_by INT DEFAULT NULL COMMENT 'User ID who last updated this shift',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',

    -- Indexes
    INDEX idx_company_id (company_id),
    INDEX idx_shift_code (shift_code),
    INDEX idx_is_active (is_active),
    INDEX idx_is_night_shift (is_night_shift),
    UNIQUE KEY unique_shift_code_company (company_id, shift_code, deleted_at),

    -- Foreign Keys
    CONSTRAINT fk_shift_company
        FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Main shift master table with auto-calculated night shift detection';

-- =====================================================
-- TABLE 2: hrms_shift_break_rules
-- =====================================================
-- Break rules for each shift
-- Supports: Multiple breaks per shift, paid/unpaid, mandatory/optional
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_shift_break_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL COMMENT 'Reference to hrms_shift_master',

    break_name VARCHAR(100) NOT NULL COMMENT 'Name of break (e.g., Lunch Break, Tea Break)',
    break_start_after_minutes INT NOT NULL COMMENT 'Break starts after N minutes from shift start',
    break_duration_minutes INT NOT NULL DEFAULT 30 COMMENT 'Duration of break in minutes',
    break_order INT NOT NULL DEFAULT 1 COMMENT 'Order of break in the shift (1, 2, 3...)',

    is_paid TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Paid break, 0=Unpaid break',
    is_mandatory TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Mandatory break, 0=Optional break',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_shift_id (shift_id),
    INDEX idx_break_order (shift_id, break_order),
    INDEX idx_is_active (is_active),

    -- Foreign Keys
    CONSTRAINT fk_break_shift
        FOREIGN KEY (shift_id)
        REFERENCES hrms_shift_master(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Break rules for each shift with order management';

-- =====================================================
-- TABLE 3: hrms_shift_weekly_off
-- =====================================================
-- Weekly off configuration with 5-week rotation support
-- Supports: Full day off, First half off, Second half off, Working day
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_shift_weekly_off (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL COMMENT 'Reference to hrms_shift_master',

    week_number INT NOT NULL COMMENT 'Week in rotation cycle (1-5)',
    day_of_week ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
    off_type ENUM('full_day', 'first_half', 'second_half', 'working') NOT NULL DEFAULT 'working' COMMENT 'Type of off',

    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_shift_id (shift_id),
    INDEX idx_week_day (shift_id, week_number, day_of_week),
    INDEX idx_is_active (is_active),

    -- Prevent duplicate entries
    UNIQUE KEY unique_shift_week_day (shift_id, week_number, day_of_week),

    -- Foreign Keys
    CONSTRAINT fk_weeklyoff_shift
        FOREIGN KEY (shift_id)
        REFERENCES hrms_shift_master(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Validation
    CONSTRAINT chk_week_number CHECK (week_number BETWEEN 1 AND 5)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Weekly off configuration with 5-week rotation support';

-- =====================================================
-- TABLE 4: hrms_shift_audit_log
-- =====================================================
-- Audit trail for all shift-related changes
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_shift_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL COMMENT 'Reference to hrms_shift_master',

    action_type ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL,
    changed_by INT NOT NULL COMMENT 'User ID who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    old_values JSON DEFAULT NULL COMMENT 'Old values before change',
    new_values JSON DEFAULT NULL COMMENT 'New values after change',
    change_description TEXT COMMENT 'Human-readable description of change',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP address of user who made change',

    -- Indexes
    INDEX idx_shift_id (shift_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_changed_at (changed_at),
    INDEX idx_action_type (action_type),

    -- Foreign Keys
    CONSTRAINT fk_audit_shift
        FOREIGN KEY (shift_id)
        REFERENCES hrms_shift_master(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for shift configuration changes';

-- =====================================================
-- ALTER TABLE: hrms_employees
-- =====================================================
-- Add shift_id column to employee table
-- =====================================================

ALTER TABLE hrms_employees
ADD COLUMN shift_id INT DEFAULT NULL COMMENT 'Reference to assigned shift' AFTER leave_policy_id,
ADD INDEX idx_shift_id (shift_id),
ADD CONSTRAINT fk_employee_shift
    FOREIGN KEY (shift_id)
    REFERENCES hrms_shift_master(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================
-- Uncomment to insert sample shifts for testing
-- =====================================================

/*
-- Sample Company 1: Day Shift (9 AM - 6 PM)
INSERT INTO hrms_shift_master (
    company_id, shift_code, shift_name, shift_colour, description,
    shift_start_time, first_half_duration_minutes, second_half_duration_minutes,
    checkin_allowed_before_minutes, grace_time_late_minutes, grace_time_early_minutes,
    min_minutes_half_day, min_minutes_full_day,
    absent_half_day_after_minutes, absent_full_day_after_minutes,
    has_shift_allowance, restrict_manager_backdate, manager_backdate_days_allowed,
    enable_break_deduction, has_custom_weekly_off, is_active
) VALUES (
    1, 'SHIFT_DAY', 'Day Shift', '#3498db', 'Standard day shift 9 AM to 6 PM',
    '09:00:00', 270, 270,
    120, 15, 15,
    270, 480,
    120, 240,
    0, 1, 7,
    1, 0, 1
);

-- Sample Company 1: Night Shift (10 PM - 7 AM) - crosses midnight
INSERT INTO hrms_shift_master (
    company_id, shift_code, shift_name, shift_colour, description,
    shift_start_time, first_half_duration_minutes, second_half_duration_minutes,
    checkin_allowed_before_minutes, grace_time_late_minutes, grace_time_early_minutes,
    min_minutes_half_day, min_minutes_full_day,
    absent_half_day_after_minutes, absent_full_day_after_minutes,
    has_shift_allowance, restrict_manager_backdate, manager_backdate_days_allowed,
    enable_break_deduction, has_custom_weekly_off, is_active
) VALUES (
    1, 'SHIFT_NIGHT', 'Night Shift', '#e74c3c', 'Night shift 10 PM to 7 AM with night allowance',
    '22:00:00', 270, 270,
    120, 15, 15,
    270, 480,
    120, 240,
    1, 1, 7,
    1, 0, 1
);

-- Add breaks for Day Shift (assuming shift_id = 1)
INSERT INTO hrms_shift_break_rules (shift_id, break_name, break_start_after_minutes, break_duration_minutes, break_order, is_paid, is_mandatory)
VALUES
    (1, 'Tea Break', 120, 15, 1, 1, 0),
    (1, 'Lunch Break', 240, 60, 2, 0, 1),
    (1, 'Evening Break', 420, 15, 3, 1, 0);

-- Add breaks for Night Shift (assuming shift_id = 2)
INSERT INTO hrms_shift_break_rules (shift_id, break_name, break_start_after_minutes, break_duration_minutes, break_order, is_paid, is_mandatory)
VALUES
    (2, 'Dinner Break', 240, 60, 1, 0, 1),
    (2, 'Snack Break', 420, 15, 2, 1, 0);
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Migration completed successfully
--
-- Next steps:
-- 1. Create Sequelize models for these tables
-- 2. Create shift service with business logic
-- 3. Create shift controller and routes
-- 4. Update Postman collection with shift APIs
-- 5. Implement roster functionality (separate migration)
-- =====================================================
