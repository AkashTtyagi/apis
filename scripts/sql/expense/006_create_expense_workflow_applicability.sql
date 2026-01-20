-- ============================================================================
-- Phase 2.2.1: Expense Workflow Applicability Table
-- Description: Creates table for expense workflow applicability (WHO workflow applies to)
-- Author: System
-- Date: 2025-01-20
-- ============================================================================

-- ============================================================================
-- TABLE: hrms_expense_workflow_applicability
-- Purpose: Defines where an expense workflow is applicable
--          (company, entity, department, designation, employee, grade, etc.)
-- Same structure as hrms_workflow_applicability for consistency
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_workflow_applicability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',
    company_id INT NOT NULL COMMENT 'FK to hrms_companies',

    -- Primary Applicability (WHERE workflow applies)
    -- Types: company, entity, location, level, designation, department, sub_department, employee, grade
    applicability_type ENUM('company', 'entity', 'location', 'level', 'designation', 'department', 'sub_department', 'employee', 'grade')
        NOT NULL COMMENT 'Primary applicability type',

    applicability_value TEXT COMMENT 'Comma-separated IDs for primary applicability (e.g., "1,2,3" for departments)',

    -- Advanced Applicability (Additional filter ON TOP of primary)
    -- Types: none, employee_type, branch, region, cost_center, project
    advanced_applicability_type VARCHAR(50) DEFAULT 'none'
        COMMENT 'Advanced filter: none, employee_type, branch, region, cost_center, project',

    advanced_applicability_value TEXT COMMENT 'Comma-separated IDs for advanced applicability filter',

    -- Exclusion
    is_excluded TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = exclude this criteria, 0 = include',

    -- Priority (for conflict resolution when multiple workflows match)
    priority INT NOT NULL DEFAULT 1 COMMENT 'Priority if multiple workflows match (lower = higher priority)',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_applicability_workflow FOREIGN KEY (workflow_id)
        REFERENCES hrms_expense_approval_workflows(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_workflow_id (workflow_id),
    INDEX idx_company_id (company_id),
    INDEX idx_applicability_type (applicability_type),
    INDEX idx_is_active (is_active),
    INDEX idx_workflow_active (workflow_id, is_active),
    INDEX idx_company_type (company_id, applicability_type),
    INDEX idx_advanced_type (advanced_applicability_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Defines where expense workflows are applicable (department, grade, designation, employee, etc.)';

-- ============================================================================
-- PRIORITY HIERARCHY (Built-in, Lower number = Higher priority):
-- 1. employee       (Employee-specific)
-- 2. sub_department
-- 3. department
-- 4. designation
-- 5. level
-- 6. grade
-- 7. location
-- 8. entity         (Business Unit)
-- 9. company        (Lowest priority)
-- ============================================================================

-- ============================================================================
-- USAGE EXAMPLES:
-- ============================================================================

/*
-- Example 1: Workflow applies to specific departments
INSERT INTO hrms_expense_workflow_applicability
(workflow_id, company_id, applicability_type, applicability_value, priority, is_active, created_by)
VALUES
(1, 23, 'department', '1,2,3', 3, 1, 1);  -- Departments 1, 2, 3

-- Example 2: Workflow applies to specific grades
INSERT INTO hrms_expense_workflow_applicability
(workflow_id, company_id, applicability_type, applicability_value, priority, is_active, created_by)
VALUES
(2, 23, 'grade', '5,6,7', 6, 1, 1);  -- Grades 5, 6, 7

-- Example 3: Workflow applies to department + employee_type combination
INSERT INTO hrms_expense_workflow_applicability
(workflow_id, company_id, applicability_type, applicability_value, advanced_applicability_type, advanced_applicability_value, priority, is_active, created_by)
VALUES
(3, 23, 'department', '1', 'employee_type', '2', 3, 1, 1);  -- Department 1 AND Employee Type 2

-- Example 4: Exclude specific employees
INSERT INTO hrms_expense_workflow_applicability
(workflow_id, company_id, applicability_type, applicability_value, is_excluded, priority, is_active, created_by)
VALUES
(4, 23, 'employee', '100,101', 1, 1, 1, 1);  -- Exclude employees 100, 101

-- Example 5: Company-wide default
INSERT INTO hrms_expense_workflow_applicability
(workflow_id, company_id, applicability_type, applicability_value, priority, is_active, created_by)
VALUES
(5, 23, 'company', NULL, 9, 1, 1);  -- Applies to all employees in company
*/

-- ============================================================================
-- ROLLBACK SCRIPT (Use with caution)
-- ============================================================================

/*
DROP TABLE IF EXISTS hrms_expense_workflow_applicability;
*/
