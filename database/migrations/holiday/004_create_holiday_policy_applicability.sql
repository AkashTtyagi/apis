-- Migration: Create Holiday Policy Applicability Table
-- Date: 2025-10-15
-- Description: Defines which employees/departments/locations get which holiday policy
-- Uses same structure as workflow applicability

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
