/**
 * Migration: Add company_department_name to hrms_company_departments
 * Allows companies to create custom departments
 */

-- Add company_department_name column
ALTER TABLE hrms_company_departments
ADD COLUMN company_department_name VARCHAR(100) NULL COMMENT 'Company-specific department name (NULL if using master department name)' AFTER department_id;

-- Make department_id nullable (optional)
ALTER TABLE hrms_company_departments
MODIFY COLUMN department_id INT UNSIGNED NULL COMMENT 'Reference to department master (NULL for custom departments)';

-- Add index for company_department_name
ALTER TABLE hrms_company_departments
ADD INDEX idx_company_department_name (company_department_name);

-- Drop the old unique constraint that requires department_id
ALTER TABLE hrms_company_departments
DROP INDEX unique_company_department;

-- Add new unique constraint on company_id + company_department_name
-- This ensures no duplicate department names within same company
ALTER TABLE hrms_company_departments
ADD CONSTRAINT unique_company_dept_name UNIQUE (company_id, company_department_name);

/**
 * Usage Flow:
 * 
 * 1. Custom Department (Admin creates new department):
 *    INSERT INTO hrms_company_departments (company_id, department_id, company_department_name, ...)
 *    VALUES (1, NULL, 'Digital Marketing', ...);
 * 
 * 2. Master Department (Admin selects from industry master):
 *    INSERT INTO hrms_company_departments (company_id, department_id, company_department_name, ...)
 *    VALUES (1, 5, NULL, ...);
 *    -- company_department_name is NULL, so display name from hrms_department_master
 * 
 * 3. Display Logic:
 *    - If company_department_name IS NOT NULL → Use company_department_name
 *    - If company_department_name IS NULL → Use hrms_department_master.department_name
 */
