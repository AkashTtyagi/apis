-- Workflow Actions Table
-- Audit trail for all workflow actions (approvals, rejections, auto-actions, etc.)

CREATE TABLE IF NOT EXISTS hrms_workflow_actions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_requests',
    stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages',

    -- Action details
    action_type ENUM(
        'submit',
        'approve',
        'reject',
        'withdraw',
        'auto_approve',
        'auto_reject',
        'escalate',
        'delegate',
        'reassign',
        'skip',
        'send_back',
        'notify'
    ) NOT NULL COMMENT 'Type of action performed',

    action_by_user_id INT UNSIGNED NULL COMMENT 'User who performed action (NULL for auto actions)',
    action_by_type ENUM('employee', 'approver', 'system', 'admin') NOT NULL COMMENT 'Who performed the action',

    -- Approver details (if action by approver)
    approver_type VARCHAR(50) NULL COMMENT 'Type of approver (RM, HR_ADMIN, etc.)',
    approver_user_id INT UNSIGNED NULL COMMENT 'Actual approver user ID',

    -- Action result
    action_status ENUM('success', 'failed', 'pending') DEFAULT 'success',
    action_result TEXT NULL COMMENT 'Result of action (next stage, final status, etc.)',

    -- Remarks and attachments
    remarks TEXT NULL COMMENT 'Action remarks/comments',
    attachments JSON NULL COMMENT 'Attached files (if any)',

    -- Timing
    action_taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When action was taken',

    -- Email notification
    email_sent BOOLEAN DEFAULT FALSE COMMENT 'Was email notification sent',
    email_sent_at TIMESTAMP NULL COMMENT 'When email was sent',

    -- Metadata for audit
    ip_address VARCHAR(45) NULL COMMENT 'IP address of action taker',
    user_agent TEXT NULL COMMENT 'Browser/device info',

    -- Previous and next stage (for tracking flow)
    previous_stage_id INT UNSIGNED NULL COMMENT 'Stage before this action',
    next_stage_id INT UNSIGNED NULL COMMENT 'Stage after this action',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES hrms_workflow_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (next_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,

    INDEX idx_request_id (request_id),
    INDEX idx_stage_id (stage_id),
    INDEX idx_action_type (action_type),
    INDEX idx_action_by_user_id (action_by_user_id),
    INDEX idx_action_taken_at (action_taken_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow action history and audit trail';
