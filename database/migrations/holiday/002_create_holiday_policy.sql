-- Migration: Create Holiday Policy Table
-- Date: 2025-10-15
-- Description: Holiday policies for companies with calendar year and restricted holiday settings

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
