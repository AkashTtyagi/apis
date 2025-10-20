-- =====================================================
-- Rotating Shift System - Database Migration
-- =====================================================
-- Version: 1.0
-- Created: 2025-01-20
-- Description: Frequency-based shift rotation with applicability rules
--
-- Tables Created:
--   1. hrms_rotating_shift_patterns - Rotation pattern master
--   2. hrms_rotating_shift_applicability - Applicability rules (workflow-style)
-- =====================================================

-- =====================================================
-- TABLE 1: hrms_rotating_shift_patterns
-- =====================================================
-- Purpose: Frequency-based shift rotation patterns
-- Admin creates rotation pattern with shift order and frequency
--
-- Example 1: Daily rotation
--   shift_order = [1, 2, 3] (Morning, Evening, Night)
--   frequency = 'daily'
--   Result: Day 1=Morning, Day 2=Evening, Day 3=Night, Day 4=Morning...
--
-- Example 2: Weekly rotation
--   shift_order = [1, 2, 3]
--   frequency = 'weekly'
--   Result: Week 1=Morning, Week 2=Evening, Week 3=Night, Week 4=Morning...

CREATE TABLE IF NOT EXISTS hrms_rotating_shift_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- Pattern Name
    pattern_name VARCHAR(200) NOT NULL COMMENT 'Name of rotation pattern',
    pattern_description TEXT DEFAULT NULL,

    -- Shift Order (JSON array)
    shift_order JSON NOT NULL COMMENT 'Array of shift IDs in rotation order: [1, 2, 3]',

    -- Frequency
    frequency ENUM('daily', 'weekly', 'bi-weekly', 'monthly') NOT NULL DEFAULT 'weekly'
        COMMENT 'daily=change every day, weekly=change every week, bi-weekly=every 2 weeks, monthly=every month',

    -- Date Range
    start_date DATE NOT NULL COMMENT 'When rotation pattern starts',
    end_date DATE DEFAULT NULL COMMENT 'When rotation ends (NULL = ongoing)',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_company_id (company_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_frequency (frequency),
    INDEX idx_is_active (is_active),

    -- Foreign Keys
    CONSTRAINT fk_rotating_pattern_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Frequency-based shift rotation patterns';

-- =====================================================
-- TABLE 2: hrms_rotating_shift_applicability
-- =====================================================
-- Purpose: Define where rotating shift pattern applies
-- Same structure as hrms_workflow_applicability
-- Pattern applies to departments, designations, branches, etc.

CREATE TABLE IF NOT EXISTS hrms_rotating_shift_applicability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_id INT NOT NULL COMMENT 'Foreign key to hrms_rotating_shift_patterns',

    -- Primary Applicability
    applicability_type ENUM(
        'company',
        'department',
        'sub_department',
        'designation',
        'branch',
        'location',
        'employee_type',
        'grade',
        'level',
        'employee'
    ) NOT NULL COMMENT 'Primary applicability type',

    applicability_value TEXT DEFAULT NULL
        COMMENT 'Comma-separated IDs for primary applicability (e.g., "1,2,3" for departments)',

    company_id INT DEFAULT NULL COMMENT 'Specific company (inherited from pattern)',

    is_excluded TINYINT(1) NOT NULL DEFAULT 0
        COMMENT '1 = exclude this criteria, 0 = include',

    -- Advanced Applicability
    advanced_applicability_type VARCHAR(50) DEFAULT 'none'
        COMMENT 'Advanced filter: none, employee_type, branch, region, zone, etc.',

    advanced_applicability_value TEXT DEFAULT NULL
        COMMENT 'Comma-separated IDs for advanced applicability filter',

    -- Priority
    priority INT NOT NULL DEFAULT 1
        COMMENT 'Priority if multiple patterns match (lower = higher priority)',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_pattern_id (pattern_id),
    INDEX idx_applicability_type (applicability_type),
    INDEX idx_company_id (company_id),
    INDEX idx_applicability_value (applicability_value(255)),
    INDEX idx_advanced_applicability_type (advanced_applicability_type),
    INDEX idx_advanced_applicability_value (advanced_applicability_value(255)),
    INDEX idx_priority (priority),
    INDEX idx_is_active (is_active),

    -- Foreign Keys
    CONSTRAINT fk_rotating_applicability_pattern FOREIGN KEY (pattern_id)
        REFERENCES hrms_rotating_shift_patterns(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rotating shift pattern applicability rules (like workflow applicability)';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Migration completed successfully
--
-- Summary:
-- ✅ 2 tables created for rotating shift system
-- ✅ Pattern master with shift order and frequency
-- ✅ Workflow-style applicability rules
--
-- Flow:
-- 1. Create rotating shift pattern with shift_order and frequency
-- 2. Define applicability rules (departments, designations, etc.)
-- 3. System automatically calculates shift for employees based on pattern
--
-- Next steps:
-- 1. Run this migration
-- 2. Create workflow master for SHIFT_SWAP
-- 3. Test rotating shift calculation
-- =====================================================
