-- Workflow Configuration Table
-- Stores workflow configurations for each company

CREATE TABLE IF NOT EXISTS hrms_workflow_config (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL COMMENT 'Company ID',
    workflow_master_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_master',
    workflow_name VARCHAR(255) NOT NULL COMMENT 'Descriptive workflow name',
    workflow_code VARCHAR(100) NOT NULL COMMENT 'Unique code for this workflow config',
    description TEXT NULL COMMENT 'Workflow description',
    version INT DEFAULT 1 COMMENT 'Version number (V1, V2, V3...)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default workflow for this type',

    -- Workflow settings
    allow_self_approval BOOLEAN DEFAULT FALSE COMMENT 'Allow employee to approve own request',
    allow_withdrawal BOOLEAN DEFAULT TRUE COMMENT 'Allow request withdrawal',
    send_submission_email BOOLEAN DEFAULT TRUE COMMENT 'Send email on submission',

    -- Metadata
    created_by INT UNSIGNED NULL COMMENT 'User who created',
    updated_by INT UNSIGNED NULL COMMENT 'User who last updated',
    cloned_from_id INT UNSIGNED NULL COMMENT 'If cloned, reference to original workflow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (workflow_master_id) REFERENCES hrms_workflow_master(id) ON DELETE CASCADE,
    FOREIGN KEY (cloned_from_id) REFERENCES hrms_workflow_config(id) ON DELETE SET NULL,

    UNIQUE KEY unique_company_workflow_code (company_id, workflow_code),
    INDEX idx_company_id (company_id),
    INDEX idx_workflow_master_id (workflow_master_id),
    INDEX idx_is_active (is_active),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow configuration table';
