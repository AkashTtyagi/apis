-- Workflow Versions Table
-- Stores workflow version history for audit and rollback

CREATE TABLE IF NOT EXISTS hrms_workflow_versions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workflow_config_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_workflow_config',

    -- Version details
    version_number INT NOT NULL COMMENT 'Version number (1, 2, 3...)',
    version_name VARCHAR(255) NULL COMMENT 'Version name (e.g., V1 - Initial, V2 - Updated)',

    -- Snapshot of workflow configuration
    workflow_snapshot JSON NOT NULL COMMENT 'Complete workflow config snapshot (stages, approvers, conditions, etc.)',

    -- Version metadata
    change_summary TEXT NULL COMMENT 'What changed in this version',
    is_active BOOLEAN DEFAULT FALSE COMMENT 'Is this the active version',

    -- Effective dates
    effective_from DATE NULL COMMENT 'When this version becomes active',
    effective_to DATE NULL COMMENT 'When this version expires',

    -- Metadata
    created_by INT UNSIGNED NULL COMMENT 'Who created this version',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP NULL COMMENT 'When this version was archived',

    FOREIGN KEY (workflow_config_id) REFERENCES hrms_workflow_config(id) ON DELETE CASCADE,

    UNIQUE KEY unique_workflow_version (workflow_config_id, version_number),
    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_version_number (version_number),
    INDEX idx_is_active (is_active),
    INDEX idx_effective_from (effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow version history';
