-- Workflow Stage Assignments Table
-- Tracks current approver assignments for each request stage

CREATE TABLE IF NOT EXISTS hrms_workflow_stage_assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_requests',
    stage_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_stages',

    -- Assigned approver
    assigned_to_user_id INT UNSIGNED NOT NULL COMMENT 'User assigned as approver',
    approver_type VARCHAR(50) NOT NULL COMMENT 'RM, HR_ADMIN, HOD, etc.',

    -- Assignment details
    assignment_status ENUM('pending', 'approved', 'rejected', 'delegated', 'skipped', 'expired') DEFAULT 'pending',

    -- For AND logic (multiple approvers must approve)
    requires_all_approval BOOLEAN DEFAULT FALSE COMMENT 'For AND logic - all must approve',
    approval_order INT DEFAULT 1 COMMENT 'Order for sequential AND approvals',

    -- Delegation
    is_delegated BOOLEAN DEFAULT FALSE,
    delegated_to_user_id INT UNSIGNED NULL COMMENT 'If delegated, who is the delegate',
    delegated_at TIMESTAMP NULL,

    -- Action tracking
    action_taken BOOLEAN DEFAULT FALSE COMMENT 'Has approver taken action',
    action_taken_at TIMESTAMP NULL,
    action_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_actions',

    -- SLA for this assignment
    sla_due_date TIMESTAMP NULL,
    is_sla_breached BOOLEAN DEFAULT FALSE,

    -- Notification tracking
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP NULL,
    reminder_count INT DEFAULT 0 COMMENT 'Number of reminders sent',
    last_reminder_at TIMESTAMP NULL,

    -- Metadata
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES hrms_workflow_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES hrms_workflow_stages(id),
    FOREIGN KEY (action_id) REFERENCES hrms_workflow_actions(id) ON DELETE SET NULL,

    INDEX idx_request_id (request_id),
    INDEX idx_stage_id (stage_id),
    INDEX idx_assigned_to_user_id (assigned_to_user_id),
    INDEX idx_assignment_status (assignment_status),
    INDEX idx_action_taken (action_taken),
    INDEX idx_sla_due_date (sla_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks approver assignments for workflow stages';
