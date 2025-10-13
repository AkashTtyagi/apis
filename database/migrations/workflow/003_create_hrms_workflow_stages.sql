-- Workflow Stages Table
-- Stores all stages in a workflow

CREATE TABLE IF NOT EXISTS hrms_workflow_stages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_config_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_config',
    stage_name VARCHAR(255) NOT NULL COMMENT 'Stage name (e.g., RM Approval, HR Approval)',
    stage_order INT NOT NULL COMMENT 'Order of execution (1, 2, 3...)',
    stage_type ENUM('approval', 'notify_only', 'auto_action') DEFAULT 'approval' COMMENT 'Type of stage',

    -- Approver logic
    approver_logic ENUM('AND', 'OR') DEFAULT 'OR' COMMENT 'If multiple approvers: AND (all must approve), OR (any can approve)',

    -- Stage rules
    is_mandatory BOOLEAN DEFAULT TRUE COMMENT 'Is this stage mandatory',
    can_skip BOOLEAN DEFAULT FALSE COMMENT 'Can this stage be skipped',
    skip_condition TEXT NULL COMMENT 'JSON condition for skipping stage',

    -- SLA & Auto actions
    sla_days INT NULL COMMENT 'SLA in days for this stage',
    sla_hours INT NULL COMMENT 'SLA in hours for this stage',
    pending_action ENUM('auto_approve', 'auto_reject', 'escalate', 'notify') NULL COMMENT 'Action when pending exceeds SLA',
    escalate_to_stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages - escalate to this stage',

    -- Next stage configuration
    on_approve_next_stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages - next stage on approval',
    on_reject_action ENUM('final_reject', 'move_to_stage', 'send_back') DEFAULT 'final_reject' COMMENT 'Action on rejection',
    on_reject_stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages - stage to move on rejection',

    -- Email notifications
    send_email_on_assign BOOLEAN DEFAULT TRUE COMMENT 'Send email when stage assigned to approver',
    send_email_on_approve BOOLEAN DEFAULT TRUE COMMENT 'Send email on approval',
    send_email_on_reject BOOLEAN DEFAULT TRUE COMMENT 'Send email on rejection',
    email_template_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_email_templates',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_config_id) REFERENCES hrms_workflow_config(id) ON DELETE CASCADE,
    FOREIGN KEY (escalate_to_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (on_approve_next_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (on_reject_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,

    UNIQUE KEY unique_workflow_stage_order (workflow_config_id, stage_order),
    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_stage_order (stage_order),
    INDEX idx_stage_type (stage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow stages configuration';
