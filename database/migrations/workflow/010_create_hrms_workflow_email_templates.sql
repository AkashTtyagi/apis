-- Workflow Email Templates Table
-- Stores email templates for workflow notifications

CREATE TABLE IF NOT EXISTS hrms_workflow_email_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    workflow_master_id INT UNSIGNED NULL COMMENT 'FK to hrms_workflow_master (NULL for global templates)',

    -- Template identification
    template_name VARCHAR(255) NOT NULL COMMENT 'Template name',
    template_code VARCHAR(100) NOT NULL COMMENT 'Unique template code',
    event_type ENUM(
        'submission',
        'approval',
        'rejection',
        'auto_approval',
        'auto_rejection',
        'escalation',
        'sla_breach',
        'withdrawal',
        'delegation',
        'pending_reminder',
        'final_approval',
        'final_rejection'
    ) NOT NULL COMMENT 'When to trigger this template',

    -- Email content
    subject VARCHAR(500) NOT NULL COMMENT 'Email subject (supports placeholders)',
    body_html TEXT NOT NULL COMMENT 'HTML email body (supports placeholders)',
    body_text TEXT NULL COMMENT 'Plain text email body (optional)',

    -- Recipients
    to_recipients JSON NULL COMMENT 'Array of recipient types/emails',
    cc_recipients JSON NULL COMMENT 'CC recipients (can include placeholders like {{rm_email}}, {{hr_email}})',
    bcc_recipients JSON NULL COMMENT 'BCC recipients',

    -- Placeholders supported
    available_placeholders JSON NULL COMMENT 'List of available placeholders for this template',

    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default template for this event',

    -- Metadata
    created_by INT UNSIGNED NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_master_id) REFERENCES hrms_workflow_master(id) ON DELETE CASCADE,

    UNIQUE KEY unique_company_template_code (company_id, template_code),
    INDEX idx_company_id (company_id),
    INDEX idx_workflow_master_id (workflow_master_id),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Email templates for workflow notifications';

-- Supported placeholders:
-- {{employee_name}}, {{employee_code}}, {{employee_email}}
-- {{approver_name}}, {{approver_email}}
-- {{workflow_type}}, {{workflow_name}}
-- {{request_number}}, {{request_date}}
-- {{stage_name}}, {{action_type}}
-- {{remarks}}, {{leave_from_date}}, {{leave_to_date}}
-- {{claim_amount}}, {{department}}, {{designation}}
-- {{company_name}}, {{current_date}}
-- etc.
