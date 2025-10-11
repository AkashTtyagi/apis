-- =====================================================
-- Employee Status Master Table
-- Stores all possible employee status types
-- =====================================================

CREATE TABLE IF NOT EXISTS hrms_employee_status_master (
    id TINYINT UNSIGNED PRIMARY KEY COMMENT 'Status ID (0-6)',
    status_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Status name (Active, Probation, etc.)',
    status_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Short code for status',
    description TEXT NULL COMMENT 'Description of the status',
    is_active BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Whether this status is currently active',
    display_order TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order for display in UI',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee status master table - defines all possible employee statuses';

-- Insert default status values
INSERT INTO hrms_employee_status_master (id, status_name, status_code, description, display_order) VALUES
(0, 'Active', 'ACTIVE', 'Employee is actively working', 1),
(1, 'Probation', 'PROBATION', 'Employee is in probation period', 2),
(2, 'Internship', 'INTERN', 'Employee is working as an intern', 3),
(3, 'Separated', 'SEPARATED', 'Employee has been separated from the company', 4),
(4, 'Absconded', 'ABSCONDED', 'Employee has absconded', 5),
(5, 'Terminated', 'TERMINATED', 'Employee has been terminated', 6),
(6, 'Suspended', 'SUSPENDED', 'Employee is currently suspended', 7);

-- Create index on status_code for faster lookups
CREATE INDEX idx_status_code ON hrms_employee_status_master(status_code);
