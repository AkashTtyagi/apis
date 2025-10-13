-- Workflow Condition Rules Table
-- Stores individual rules that make up a condition

CREATE TABLE IF NOT EXISTS hrms_workflow_condition_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    condition_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_conditions',

    -- Rule definition
    rule_order INT DEFAULT 1 COMMENT 'Order of rule evaluation',
    field_source ENUM('employee', 'request', 'leave_balance', 'custom') NOT NULL COMMENT 'Source of field data',
    field_name VARCHAR(100) NOT NULL COMMENT 'Field to check (e.g., designation, location, leave_type, available_balance)',
    field_type ENUM('string', 'number', 'boolean', 'date', 'array') NOT NULL COMMENT 'Data type of field',

    -- Operator and value
    operator ENUM('=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'CONTAINS', 'NOT CONTAINS', 'IS NULL', 'IS NOT NULL') NOT NULL,
    compare_value TEXT NULL COMMENT 'Value to compare against (JSON for arrays)',
    compare_value_type ENUM('static', 'dynamic', 'field_reference') DEFAULT 'static' COMMENT 'Type of comparison value',

    -- Dynamic value reference (e.g., compare with another field)
    compare_field_source ENUM('employee', 'request', 'leave_balance', 'custom') NULL,
    compare_field_name VARCHAR(100) NULL,

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (condition_id) REFERENCES hrms_workflow_conditions(id) ON DELETE CASCADE,

    INDEX idx_condition_id (condition_id),
    INDEX idx_rule_order (rule_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual rules for workflow conditions';

-- Example rules:
-- Rule 1: employee.designation = 'CEO' (auto approve)
-- Rule 2: leave_balance.available_balance < 10 (auto reject)
-- Rule 3: request.leave_type IN ['WFH', 'Short Leave'] (send to Functional Head)
-- Rule 4: request.claim_amount > 5000 (require CFO approval)
