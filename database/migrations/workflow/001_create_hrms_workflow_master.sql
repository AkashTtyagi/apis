-- Workflow Master Table
-- Stores all workflow types (Leave, On Duty, WFH, etc.)

CREATE TABLE IF NOT EXISTS hrms_workflow_master (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_for_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Leave, On Duty, Regularization, WFH, etc.',
    workflow_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'LEAVE, ONDUTY, REGULARIZATION, WFH, etc.',
    description TEXT NULL COMMENT 'Description of the workflow type',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    display_order INT DEFAULT 0 COMMENT 'Display order in UI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_workflow_code (workflow_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master table for workflow types';
