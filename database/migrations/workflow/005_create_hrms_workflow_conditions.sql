-- Workflow Conditions Table
-- Stores conditional logic (IF/ELSE) for workflow decisions

CREATE TABLE IF NOT EXISTS hrms_workflow_conditions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_config_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_config',
    stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages (NULL if global condition)',

    -- Condition details
    condition_name VARCHAR(255) NOT NULL COMMENT 'Descriptive name (e.g., Auto reject if balance < 10)',
    condition_type ENUM('stage_routing', 'auto_action', 'approver_selection') NOT NULL COMMENT 'Type of condition',

    -- Condition logic
    logic_operator ENUM('AND', 'OR') DEFAULT 'AND' COMMENT 'Operator if multiple rules',

    -- Action on condition match
    action_type ENUM('auto_approve', 'auto_reject', 'move_to_stage', 'skip_stage', 'assign_approver', 'notify') NOT NULL,
    action_stage_id INT UNSIGNED NULL COMMENT 'Target stage if action = move_to_stage',
    action_approver_type VARCHAR(50) NULL COMMENT 'Approver type if action = assign_approver',
    action_custom_user_id INT UNSIGNED NULL COMMENT 'Custom user if action = assign_approver',

    -- Else action (if condition fails)
    else_action_type ENUM('continue', 'auto_approve', 'auto_reject', 'move_to_stage', 'notify') DEFAULT 'continue',
    else_stage_id INT UNSIGNED NULL COMMENT 'Stage for else action',

    -- Priority
    priority INT DEFAULT 1 COMMENT 'Execution priority (lower = higher priority)',
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_config_id) REFERENCES hrms_workflow_config(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (action_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (else_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,

    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_stage_id (stage_id),
    INDEX idx_condition_type (condition_type),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow conditional logic (IF/ELSE)';
