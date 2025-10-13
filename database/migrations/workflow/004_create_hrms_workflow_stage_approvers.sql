-- Workflow Stage Approvers Table
-- Stores approvers for each stage

CREATE TABLE IF NOT EXISTS hrms_workflow_stage_approvers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stage_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_stages',

    -- Approver type and configuration
    approver_type ENUM(
        'RM',                  -- Reporting Manager
        'RM_OF_RM',           -- Reporting Manager's Manager
        'HR_ADMIN',           -- HR Admin
        'HOD',                -- Head of Department
        'FUNCTIONAL_HEAD',    -- Functional Head
        'SUB_ADMIN',          -- Sub Admin
        'SECONDARY_RM',       -- Secondary Reporting Manager
        'SELF',               -- Self Approver (auto approve)
        'AUTO_APPROVE',       -- Auto Approve
        'CUSTOM_USER'         -- Specific user
    ) NOT NULL COMMENT 'Type of approver',

    -- Custom user (if approver_type = CUSTOM_USER)
    custom_user_id INT UNSIGNED NULL COMMENT 'Specific user ID if approver_type = CUSTOM_USER',

    -- Approver level (for escalation)
    approver_order INT DEFAULT 1 COMMENT 'Order if multiple approvers (for AND logic)',

    -- Conditional approver (optional)
    has_condition BOOLEAN DEFAULT FALSE COMMENT 'Is this a conditional approver',
    condition_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_conditions',

    -- Delegation support
    allow_delegation BOOLEAN DEFAULT TRUE COMMENT 'Can approver delegate',
    delegate_to_user_id INT UNSIGNED NULL COMMENT 'Delegate to specific user',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE CASCADE,
    FOREIGN KEY (condition_id) REFERENCES hrms_workflow_conditions(id) ON DELETE SET NULL,

    INDEX idx_stage_id (stage_id),
    INDEX idx_approver_type (approver_type),
    INDEX idx_approver_order (approver_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stage approvers configuration';
