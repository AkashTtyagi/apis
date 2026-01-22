-- =====================================================
-- Expense General Settings Table
-- Phase 2.2 - General Settings & Configuration
-- =====================================================

-- =====================================================
-- Expense General Settings Table (Company-wide)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,

    -- ==================== GENERAL SETTINGS ====================
    `expense_code_prefix` VARCHAR(20) DEFAULT 'EXP' COMMENT 'Prefix for expense request codes',
    `expense_code_format` VARCHAR(100) DEFAULT '{PREFIX}-{YEAR}{MONTH}-{SEQ}' COMMENT 'Format: EXP-202501-00001',
    `expense_code_sequence_length` INT DEFAULT 5 COMMENT 'Sequence number length (padded with zeros)',
    `auto_generate_expense_code` TINYINT(1) DEFAULT 1 COMMENT 'Auto-generate expense codes',

    -- ==================== VIOLATION DETECTION SETTINGS ====================
    `policy_violation_action` ENUM('Warn', 'Block', 'Allow_With_Justification', 'Flag_For_Review') DEFAULT 'Warn',
    `over_limit_action` ENUM('Warn', 'Block', 'Allow_With_Approval', 'Flag_For_Review') DEFAULT 'Warn',
    `suspicious_pattern_detection` TINYINT(1) DEFAULT 0,
    `round_amount_threshold` DECIMAL(15,2) DEFAULT 1000.00 COMMENT 'Flag round amounts above this',
    `weekend_expense_flag` TINYINT(1) DEFAULT 0 COMMENT 'Flag expenses on weekends',
    `holiday_expense_flag` TINYINT(1) DEFAULT 0 COMMENT 'Flag expenses on holidays',

    -- ==================== AUDIT TRAIL SETTINGS ====================
    `audit_trail_enabled` TINYINT(1) DEFAULT 1,
    `audit_log_retention_days` INT DEFAULT 365 COMMENT 'Days to retain audit logs',
    `log_all_views` TINYINT(1) DEFAULT 0 COMMENT 'Log view actions (performance impact)',
    `log_field_changes` TINYINT(1) DEFAULT 1 COMMENT 'Log individual field changes',
    `ip_tracking_enabled` TINYINT(1) DEFAULT 1,
    `device_tracking_enabled` TINYINT(1) DEFAULT 0,
    `geo_location_tracking` TINYINT(1) DEFAULT 0,

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
