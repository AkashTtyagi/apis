-- Workflow Requests Table
-- Stores actual workflow instances/requests submitted by employees

CREATE TABLE IF NOT EXISTS hrms_workflow_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique request number (e.g., WFR-2024-00001)',

    -- Workflow reference
    workflow_config_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_config',
    workflow_master_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_master',
    company_id INT UNSIGNED NOT NULL,

    -- Requester details
    employee_id INT UNSIGNED NOT NULL COMMENT 'Employee who submitted request',
    submitted_by INT UNSIGNED NOT NULL COMMENT 'User who submitted (may differ if on behalf)',

    -- Current stage tracking
    current_stage_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_stages - current stage',
    current_stage_order INT DEFAULT 1 COMMENT 'Current stage order number',

    -- Status
    request_status ENUM('draft', 'submitted', 'pending', 'approved', 'rejected', 'withdrawn', 'cancelled', 'auto_approved', 'auto_rejected') NOT NULL DEFAULT 'draft',
    overall_status ENUM('in_progress', 'completed', 'rejected', 'withdrawn') DEFAULT 'in_progress',

    -- Request data (JSON)
    request_data JSON NULL COMMENT 'Complete request data (leave dates, claim details, etc.)',

    -- Timestamps
    submitted_at TIMESTAMP NULL COMMENT 'When request was submitted',
    completed_at TIMESTAMP NULL COMMENT 'When workflow completed',

    -- SLA tracking
    sla_due_date TIMESTAMP NULL COMMENT 'SLA due date for current stage',
    is_sla_breached BOOLEAN DEFAULT FALSE COMMENT 'Has SLA been breached',

    -- Remarks
    employee_remarks TEXT NULL COMMENT 'Remarks from employee',
    admin_remarks TEXT NULL COMMENT 'Remarks from admin',

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_config_id) REFERENCES hrms_workflow_config(id),
    FOREIGN KEY (workflow_master_id) REFERENCES hrms_workflow_master(id),
    FOREIGN KEY (current_stage_id) REFERENCES hrms_workflow_stages(id) ON DELETE SET NULL,

    INDEX idx_request_number (request_number),
    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_request_status (request_status),
    INDEX idx_overall_status (overall_status),
    INDEX idx_current_stage_id (current_stage_id),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_sla_due_date (sla_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow request instances';
