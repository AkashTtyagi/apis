-- Migration: Add notice_period to hrms_employees table
-- Date: 2025-10-15
-- Description: Add notice_period column to track employee notice period in days

-- Add notice_period column to hrms_employees
ALTER TABLE hrms_employees
ADD COLUMN notice_period INT NULL COMMENT 'Notice period in days (e.g., 30, 60, 90)' AFTER employment_type;

-- Add index on notice_period for filtering
CREATE INDEX idx_hrms_employees_notice_period ON hrms_employees(notice_period);
