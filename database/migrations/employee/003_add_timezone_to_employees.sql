-- Migration: Add timezone to hrms_employees table
-- Date: 2025-10-15
-- Description: Add timezone_id to track which timezone employee works in

-- Add timezone_id column to hrms_employees
ALTER TABLE hrms_employees
ADD COLUMN timezone_id INT NULL COMMENT 'Foreign key to hrms_timezone_master' AFTER shift_id;

-- Add index on timezone_id
CREATE INDEX idx_hrms_employees_timezone_id ON hrms_employees(timezone_id);

-- Add foreign key constraint (optional, uncomment if you want strict referential integrity)
-- ALTER TABLE hrms_employees
-- ADD CONSTRAINT fk_employee_timezone
-- FOREIGN KEY (timezone_id) REFERENCES hrms_timezone_master(id)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;
