-- Workflow Applicability Table
-- Defines where a workflow is applicable (company, entity, department, designation, custom employees)

CREATE TABLE IF NOT EXISTS hrms_workflow_applicability (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_config_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_config',

    -- Applicability scope
    applicability_type ENUM('company', 'entity', 'department', 'sub_department', 'designation', 'level', 'custom_employee', 'location', 'grade') NOT NULL COMMENT 'Type of applicability',

    -- Reference IDs based on type
    company_id INT UNSIGNED NULL COMMENT 'Specific company (usually inherited from workflow_config)',
    entity_id INT UNSIGNED NULL COMMENT 'Specific entity',
    department_id INT UNSIGNED NULL COMMENT 'Specific department',
    sub_department_id INT UNSIGNED NULL COMMENT 'Specific sub-department',
    designation_id INT UNSIGNED NULL COMMENT 'Specific designation',
    level_id INT UNSIGNED NULL COMMENT 'Specific level',
    location_id INT UNSIGNED NULL COMMENT 'Specific location',
    grade_id INT UNSIGNED NULL COMMENT 'Specific grade',
    employee_id INT UNSIGNED NULL COMMENT 'Specific employee (for custom)',

    -- Include/Exclude logic
    is_excluded BOOLEAN DEFAULT FALSE COMMENT 'TRUE = exclude this criteria, FALSE = include',

    -- Priority
    priority INT DEFAULT 1 COMMENT 'Priority if multiple workflows match (lower = higher priority)',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_config_id) REFERENCES hrms_workflow_config(id) ON DELETE CASCADE,

    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_applicability_type (applicability_type),
    INDEX idx_company_id (company_id),
    INDEX idx_department_id (department_id),
    INDEX idx_designation_id (designation_id),
    INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Defines workflow applicability rules';

-- Examples:
-- 1. Workflow applicable to entire company: applicability_type = 'company', company_id = 1
-- 2. Workflow only for Sales department: applicability_type = 'department', department_id = 5
-- 3. Workflow only for Managers: applicability_type = 'designation', designation_id = 10
-- 4. Workflow only for specific employee 'Akash': applicability_type = 'custom_employee', employee_id = 123
-- 5. Workflow for all EXCEPT Body Shop: applicability_type = 'department', department_id = 3, is_excluded = TRUE
