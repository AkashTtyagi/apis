-- =====================================================
-- HRMS Break Log Table - Database Migration
-- =====================================================
-- Version: 1.0
-- Description: Creates hrms_break_log table to track employee breaks
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_break_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Employee & Company
    employee_id INT NOT NULL,
    company_id INT NOT NULL,

    -- Break Date (for easy querying)
    break_date DATE NOT NULL COMMENT 'Date of break',

    -- Link to configured break rule (optional)
    shift_break_rule_id INT DEFAULT NULL COMMENT 'FK to hrms_shift_break_rules (null for ad-hoc breaks)',

    -- Break Timing
    break_start_time DATETIME NOT NULL COMMENT 'Break start timestamp',
    break_end_time DATETIME DEFAULT NULL COMMENT 'Break end timestamp (null if ongoing)',

    -- Duration
    break_duration_minutes INT DEFAULT NULL COMMENT 'Calculated duration in minutes',

    -- Status
    status ENUM('ongoing', 'completed') NOT NULL DEFAULT 'ongoing',

    -- Remarks
    remarks VARCHAR(255) DEFAULT NULL,

    -- Audit
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_employee_date (employee_id, break_date),
    INDEX idx_employee_status (employee_id, status),
    INDEX idx_company_date (company_id, break_date),
    INDEX idx_shift_break_rule (shift_break_rule_id),

    -- Foreign Keys
    CONSTRAINT fk_break_employee
        FOREIGN KEY (employee_id)
        REFERENCES hrms_employees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_break_shift_rule
        FOREIGN KEY (shift_break_rule_id)
        REFERENCES hrms_shift_break_rules(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks actual employee breaks';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
