-- =====================================================
-- HRMS Roster Management System - Database Migration
-- =====================================================
-- Version: 2.0
-- Created: 2025-01-20
-- Description: Roster master with date-shift pattern and employee assignment
--
-- Tables Created:
--   1. hrms_rosters - Roster master table (name, description)
--   2. hrms_roster_details - Date-shift mapping for each roster
--   3. hrms_roster_employees - Roster-employee assignment (many-to-many)
-- =====================================================

-- =====================================================
-- TABLE 1: hrms_rosters (Roster Master)
-- =====================================================
-- Purpose: Store roster master information
-- Admin creates roster with name and description
-- Roster pattern stored in hrms_roster_details

CREATE TABLE IF NOT EXISTS hrms_rosters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- Roster Info
    roster_name VARCHAR(200) NOT NULL COMMENT 'Name of the roster (e.g., "Week 1 Rotation")',
    roster_description TEXT DEFAULT NULL COMMENT 'Description of roster pattern',

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
    INDEX idx_is_active (is_active),
    INDEX idx_roster_name (roster_name),

    -- Foreign Keys
    CONSTRAINT fk_roster_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roster master table - stores roster name and description';

-- =====================================================
-- TABLE 2: hrms_roster_details (Date-Shift Mapping)
-- =====================================================
-- Purpose: Store date-shift pattern for each roster
-- Each roster has multiple detail entries
-- Defines which shift applies on which date

CREATE TABLE IF NOT EXISTS hrms_roster_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roster_id INT NOT NULL COMMENT 'Foreign key to hrms_rosters',

    -- Date and Shift
    roster_date DATE NOT NULL COMMENT 'Date for this roster entry',
    shift_id INT NOT NULL COMMENT 'Shift applicable on this date',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_roster_id (roster_id),
    INDEX idx_roster_date (roster_date),
    INDEX idx_shift_id (shift_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_roster_date (roster_id, roster_date, deleted_at),

    -- Foreign Keys
    CONSTRAINT fk_roster_detail_roster FOREIGN KEY (roster_id)
        REFERENCES hrms_rosters(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_detail_shift FOREIGN KEY (shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roster date-shift mapping - defines which shift on which date';

-- =====================================================
-- TABLE 3: hrms_roster_employees (Roster-Employee Assignment)
-- =====================================================
-- Purpose: Store roster-employee assignment
-- Links roster to employees (many-to-many relationship)
-- Admin assigns roster to multiple employees

CREATE TABLE IF NOT EXISTS hrms_roster_employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roster_id INT NOT NULL COMMENT 'Foreign key to hrms_rosters',
    employee_id INT NOT NULL COMMENT 'Foreign key to hrms_employees',
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_roster_id (roster_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_company_id (company_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_roster_employee (roster_id, employee_id, deleted_at),

    -- Foreign Keys
    CONSTRAINT fk_roster_employee_roster FOREIGN KEY (roster_id)
        REFERENCES hrms_rosters(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_employee_employee FOREIGN KEY (employee_id)
        REFERENCES hrms_employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_employee_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Roster-employee assignment - many-to-many relationship';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Migration completed successfully
--
-- Summary:
-- ✅ 3 tables created for roster management
-- ✅ Roster master with name and description
-- ✅ Date-shift pattern mapping
-- ✅ Employee assignment (many-to-many)
--
-- Flow:
-- 1. Create roster with name, description, and date-shift pattern
-- 2. Assign roster to multiple employees
-- 3. Query employee's roster for specific date
--
-- Next steps:
-- 1. Run this migration
-- 2. Update shift calculation service to include roster lookup
-- 3. Register models in index file
-- 4. Create routes
-- =====================================================
