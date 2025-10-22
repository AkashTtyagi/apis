-- Migration: Add department_code to hrms_company_departments
-- Description: Add department_code column for custom departments
-- Date: 2025-10-22

-- Add department_code column
ALTER TABLE hrms_company_departments
ADD COLUMN department_code VARCHAR(50) NULL COMMENT 'Department code (for custom departments)' AFTER company_department_name;

-- Add index for department_code
ALTER TABLE hrms_company_departments
ADD INDEX idx_department_code (department_code);

-- Add unique constraint for company_id + department_code
ALTER TABLE hrms_company_departments
ADD CONSTRAINT unique_company_dept_code UNIQUE (company_id, department_code);
