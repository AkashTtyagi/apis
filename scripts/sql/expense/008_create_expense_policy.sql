-- =====================================================
-- Expense Policy Management Tables
-- Phase 2.1 - Policy & Configuration
-- =====================================================

-- =====================================================
-- 1. Expense Policy Master Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_policies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL,
    `policy_name` VARCHAR(200) NOT NULL,
    `policy_code` VARCHAR(50) NOT NULL,
    `policy_description` TEXT NULL,

    -- Category Configuration
    `allowed_categories` JSON NULL COMMENT 'Array of category IDs allowed in this policy',
    `category_limits_override` JSON NULL COMMENT 'Override limits for specific categories: [{category_id, limit_per_transaction, limit_per_day, limit_per_month}]',

    -- Overall Spending Caps
    `overall_limit_per_transaction` DECIMAL(15,2) NULL COMMENT 'Max amount per single expense',
    `overall_limit_per_day` DECIMAL(15,2) NULL COMMENT 'Max total expenses per day',
    `overall_limit_per_week` DECIMAL(15,2) NULL COMMENT 'Max total expenses per week',
    `overall_limit_per_month` DECIMAL(15,2) NULL COMMENT 'Max total expenses per month',
    `overall_limit_per_quarter` DECIMAL(15,2) NULL COMMENT 'Max total expenses per quarter',
    `overall_limit_per_year` DECIMAL(15,2) NULL COMMENT 'Max total expenses per year',

    -- Submission Controls
    `allow_past_date_expense` TINYINT(1) DEFAULT 1,
    `max_past_days` INT DEFAULT 30 COMMENT 'How many days in past can expenses be filed',
    `allow_future_date_expense` TINYINT(1) DEFAULT 0,
    `max_future_days` INT DEFAULT 0,
    `submission_window_start_day` INT NULL COMMENT 'Day of month when submission opens (1-31)',
    `submission_window_end_day` INT NULL COMMENT 'Day of month when submission closes (1-31)',
    `require_receipt_above` DECIMAL(15,2) NULL COMMENT 'Receipt mandatory above this amount',

    -- Post-Submission Controls
    `allow_edit_after_submit` TINYINT(1) DEFAULT 0,
    `allow_withdraw_after_submit` TINYINT(1) DEFAULT 1,
    `allow_resubmit_rejected` TINYINT(1) DEFAULT 1,
    `max_resubmit_count` INT DEFAULT 3,

    -- Duplicate Detection
    `check_duplicates` TINYINT(1) DEFAULT 1,
    `duplicate_check_fields` JSON NULL COMMENT 'Fields to check for duplicates, default: ["amount", "date", "category_id"]',
    `duplicate_check_days` INT DEFAULT 7 COMMENT 'Check duplicates within these many days',

    -- Violation Handling
    `allow_policy_violation` TINYINT(1) DEFAULT 0 COMMENT 'Allow submission even if policy violated',
    `require_justification_on_violation` TINYINT(1) DEFAULT 1,
    `auto_flag_violations` TINYINT(1) DEFAULT 1,

    -- Currency Settings
    `default_currency_id` INT NULL,
    `allowed_currencies` JSON NULL COMMENT 'Array of currency IDs allowed',
    `allow_multi_currency` TINYINT(1) DEFAULT 0,

    -- Advance Integration
    `allow_advance_request` TINYINT(1) DEFAULT 1,
    `max_advance_percentage` DECIMAL(5,2) DEFAULT 80.00 COMMENT 'Max advance as % of estimated expense',
    `auto_adjust_advance` TINYINT(1) DEFAULT 1 COMMENT 'Auto deduct advance from reimbursement',

    -- Workflow Override
    `workflow_id` INT NULL COMMENT 'Override workflow for this policy (optional)',

    -- Status
    `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Default policy when no specific match',
    `is_active` TINYINT(1) DEFAULT 1,
    `priority` INT DEFAULT 0 COMMENT 'Higher priority = more specific policy',

    -- Audit
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL,
    `deleted_by` INT NULL,

    -- Indexes
    UNIQUE INDEX `idx_company_policy_code` (`company_id`, `policy_code`),
    INDEX `idx_company` (`company_id`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_default` (`is_default`),
    INDEX `idx_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- 2. Policy Applicability Table (WHO gets this policy)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_policy_applicability` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `policy_id` INT NOT NULL,
    `company_id` INT NOT NULL,

    -- Primary Applicability
    `applicability_type` ENUM(
        'company',          -- Entire company
        'entity',           -- Business unit
        'department',       -- Department
        'sub_department',   -- Sub-department
        'designation',      -- Job title
        'grade',            -- Employee grade
        'level',            -- Employee level
        'location',         -- Work location
        'employee_type',    -- Permanent, Contract, etc.
        'employee'          -- Specific employees
    ) NOT NULL,
    `applicability_value` VARCHAR(1000) NULL COMMENT 'Comma-separated IDs or NULL for all',

    -- Advanced Filtering (AND condition with primary)
    `advanced_applicability_type` ENUM(
        'none',
        'employee_type',
        'branch',
        'region',
        'cost_center',
        'project',
        'grade',
        'joining_date_range'
    ) DEFAULT 'none',
    `advanced_applicability_value` VARCHAR(1000) NULL,

    -- Include/Exclude
    `is_excluded` TINYINT(1) DEFAULT 0 COMMENT '1 = exclude these from policy',

    -- Priority (lower number = higher priority for matching)
    `priority` INT DEFAULT 0,

    -- Status
    `is_active` TINYINT(1) DEFAULT 1,

    -- Audit
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT `fk_policy_applicability_policy` FOREIGN KEY (`policy_id`)
        REFERENCES `hrms_expense_policies`(`id`) ON DELETE CASCADE,

    -- Indexes
    INDEX `idx_policy` (`policy_id`),
    INDEX `idx_company` (`company_id`),
    INDEX `idx_type` (`applicability_type`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- 3. Policy Category Limits Override (Optional detailed config)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_policy_category_limits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `policy_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `company_id` INT NOT NULL,

    -- Override limits for this category in this policy
    `limit_per_transaction` DECIMAL(15,2) NULL,
    `limit_per_day` DECIMAL(15,2) NULL,
    `limit_per_week` DECIMAL(15,2) NULL,
    `limit_per_month` DECIMAL(15,2) NULL,

    -- Receipt requirement override
    `receipt_required` ENUM('Always', 'Never', 'Above_Limit', 'Policy_Default') DEFAULT 'Policy_Default',
    `receipt_required_above` DECIMAL(15,2) NULL,

    -- Category-specific rules
    `require_approval_above` DECIMAL(15,2) NULL COMMENT 'Auto-approve below, require approval above',
    `max_quantity` INT NULL COMMENT 'For quantity-based categories',

    -- Status
    `is_active` TINYINT(1) DEFAULT 1,

    -- Audit
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_by` INT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT `fk_policy_cat_limit_policy` FOREIGN KEY (`policy_id`)
        REFERENCES `hrms_expense_policies`(`id`) ON DELETE CASCADE,

    -- Unique constraint
    UNIQUE INDEX `idx_policy_category` (`policy_id`, `category_id`),
    INDEX `idx_category` (`category_id`),
    INDEX `idx_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- 4. Policy Audit Log (Track policy changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_expense_policy_audit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `policy_id` INT NOT NULL,
    `company_id` INT NOT NULL,
    `action` ENUM('create', 'update', 'delete', 'restore', 'activate', 'deactivate') NOT NULL,
    `field_name` VARCHAR(100) NULL,
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    `change_summary` TEXT NULL,
    `changed_by` INT NOT NULL,
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ip_address` VARCHAR(45) NULL,

    INDEX `idx_policy` (`policy_id`),
    INDEX `idx_company` (`company_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
