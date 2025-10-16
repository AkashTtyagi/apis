-- Combined Holiday Management Migration
-- Date: 2025-10-15
-- Description: Complete holiday management system - run all migrations in order
-- Run this file to create all holiday-related tables

-- ========================================
-- 1. CREATE HOLIDAY BANK TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hrms_holiday_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_name VARCHAR(255) NOT NULL COMMENT 'Name of the holiday (e.g., Independence Day, Christmas)',
    holiday_date DATE NOT NULL COMMENT 'Date of the holiday',
    is_national_holiday TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=National Holiday, 0=Restricted/Optional Holiday',
    description TEXT NULL COMMENT 'Additional description about the holiday',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_by INT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_holiday_date (holiday_date),
    INDEX idx_is_national_holiday (is_national_holiday),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Bank - Master list of all holidays';

-- ========================================
-- 2. CREATE HOLIDAY POLICY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hrms_holiday_policy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',
    calendar_name VARCHAR(255) NOT NULL COMMENT 'Name of the holiday calendar (e.g., India Calendar 2025)',
    year YEAR NOT NULL COMMENT 'Calendar year for this policy',
    is_restricted_holiday_applicable TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Restricted holidays allowed, 0=No restricted holidays',
    restricted_holiday_count INT NULL COMMENT 'Number of restricted holidays employees can take (if applicable)',
    notes TEXT NULL COMMENT 'Additional notes about this holiday policy',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_by INT NULL COMMENT 'User ID who created this record',
    updated_by INT NULL COMMENT 'User ID who last updated this record',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_year (year),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by),
    INDEX idx_company_year (company_id, year),

    CONSTRAINT fk_holiday_policy_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Policy - Defines holiday calendars for companies';

-- ========================================
-- 3. CREATE HOLIDAY POLICY MAPPING TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hrms_holiday_policy_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL COMMENT 'Foreign key to hrms_holiday_policy',
    holiday_id INT NOT NULL COMMENT 'Foreign key to hrms_holiday_bank',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_policy_id (policy_id),
    INDEX idx_holiday_id (holiday_id),
    INDEX idx_is_active (is_active),
    UNIQUE INDEX idx_policy_holiday (policy_id, holiday_id),

    CONSTRAINT fk_holiday_mapping_policy FOREIGN KEY (policy_id)
        REFERENCES hrms_holiday_policy(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_holiday_mapping_holiday FOREIGN KEY (holiday_id)
        REFERENCES hrms_holiday_bank(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Policy Mapping - Links holidays to policies';

-- ========================================
-- 4. CREATE HOLIDAY POLICY APPLICABILITY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS hrms_holiday_policy_applicability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL COMMENT 'Foreign key to hrms_holiday_policy',

    -- Primary Applicability (WHERE policy applies)
    applicability_type ENUM(
        'company',
        'entity',
        'location',
        'level',
        'designation',
        'department',
        'sub_department',
        'employee',
        'grade'
    ) NOT NULL COMMENT 'Primary applicability type',
    applicability_value TEXT NULL COMMENT 'Comma-separated IDs for primary applicability (NULL for company-wide)',

    company_id INT NOT NULL COMMENT 'Company ID for filtering',

    -- Advanced Applicability (additional filter)
    advanced_applicability_type VARCHAR(50) NULL DEFAULT 'none' COMMENT 'Advanced filter: none, employee_type, branch, region',
    advanced_applicability_value TEXT NULL COMMENT 'Comma-separated IDs for advanced filter',

    is_excluded TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Exclude this criteria, 0=Include',
    priority INT NOT NULL DEFAULT 1 COMMENT 'Priority if multiple policies match (lower = higher priority)',

    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_by INT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_policy_id (policy_id),
    INDEX idx_applicability_type (applicability_type),
    INDEX idx_applicability_value (applicability_value(100)),
    INDEX idx_company_id (company_id),
    INDEX idx_advanced_applicability_type (advanced_applicability_type),
    INDEX idx_advanced_applicability_value (advanced_applicability_value(100)),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by),

    CONSTRAINT fk_holiday_applicability_policy FOREIGN KEY (policy_id)
        REFERENCES hrms_holiday_policy(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_holiday_applicability_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Policy Applicability - Defines which employees get which holiday policy';
