-- =====================================================
-- HRMS Policy Management System - Database Schema
-- =====================================================
-- Description: Complete policy management with categories, versions,
--              applicability (following HrmsWorkflowApplicability model pattern),
--              acknowledgments, notifications, and ESS blocking
-- Date: 2025-10-22
-- =====================================================

-- =====================================================
-- 1. POLICY CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_companies',

    category_name VARCHAR(255) NOT NULL COMMENT 'HR Policies, IT Policies, Code of Conduct, etc.',
    category_slug VARCHAR(100) NOT NULL COMMENT 'Unique identifier: hr_policies, it_policies',
    category_description TEXT NULL,
    display_order INT DEFAULT 0 COMMENT 'Display order of categories',

    is_active BOOLEAN DEFAULT TRUE,
    created_by INT UNSIGNED NULL COMMENT 'User ID who created this record',
    updated_by INT UNSIGNED NULL COMMENT 'User ID who last updated this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

    UNIQUE KEY unique_company_category_slug (company_id, category_slug),
    INDEX idx_company_id (company_id),
    INDEX idx_category_slug (category_slug),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Policy categories for organization';

-- =====================================================
-- 2. POLICIES MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_companies',
    category_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policy_categories',

    policy_title VARCHAR(500) NOT NULL COMMENT 'Leave Policy, Attendance Policy, etc.',
    policy_slug VARCHAR(100) NOT NULL COMMENT 'Unique identifier: leave_policy, attendance_policy',
    policy_description TEXT NULL,

    -- Current active version
    current_version_number INT DEFAULT 1 COMMENT 'Current active version',

    -- Force Acknowledgment Settings
    requires_acknowledgment BOOLEAN DEFAULT FALSE COMMENT 'Does this policy require employee acknowledgment',
    force_acknowledgment BOOLEAN DEFAULT FALSE COMMENT 'Block complete ESS access until acknowledged',
    grace_period_days INT DEFAULT 0 COMMENT 'Days before blocking starts (0 = immediate)',

    -- Notification Settings
    send_notifications BOOLEAN DEFAULT TRUE COMMENT 'Send notifications when policy is assigned',
    notification_channels JSON NULL COMMENT 'Array: ["email", "in_app", "sms"]',
    reminder_frequency_days INT DEFAULT 3 COMMENT 'Send reminders every X days if not acknowledged',

    -- Metadata
    effective_from DATE NULL COMMENT 'Policy effective from date',
    expires_on DATE NULL COMMENT 'Policy expiry date (NULL = no expiry)',

    is_active BOOLEAN DEFAULT TRUE,
    created_by INT UNSIGNED NULL COMMENT 'User ID who created this record',
    updated_by INT UNSIGNED NULL COMMENT 'User ID who last updated this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

    UNIQUE KEY unique_company_policy_slug (company_id, policy_slug),
    INDEX idx_company_id (company_id),
    INDEX idx_category_id (category_id),
    INDEX idx_policy_slug (policy_slug),
    INDEX idx_requires_acknowledgment (requires_acknowledgment),
    INDEX idx_force_acknowledgment (force_acknowledgment),
    INDEX idx_effective_from (effective_from),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),

    FOREIGN KEY (category_id) REFERENCES hrms_policy_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master policies table';

-- =====================================================
-- 3. POLICY VERSIONS TABLE (Version Control)
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_versions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',

    version_number INT NOT NULL COMMENT 'Version number: 1, 2, 3, etc.',
    version_title VARCHAR(500) NOT NULL COMMENT 'Title for this version',
    version_description TEXT NULL COMMENT 'What changed in this version',
    policy_content LONGTEXT NULL COMMENT 'Full policy content (can be HTML/Markdown)',

    -- Version metadata
    is_current_version BOOLEAN DEFAULT FALSE COMMENT 'Is this the active version',
    published_at TIMESTAMP NULL COMMENT 'When this version was published',
    published_by INT UNSIGNED NULL COMMENT 'User who published this version',

    -- Change tracking
    change_summary TEXT NULL COMMENT 'Summary of changes from previous version',
    previous_version_id INT UNSIGNED NULL COMMENT 'FK to previous version (for rollback)',

    created_by INT UNSIGNED NULL COMMENT 'User ID who created this version',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_policy_version (policy_id, version_number),
    INDEX idx_policy_id (policy_id),
    INDEX idx_version_number (version_number),
    INDEX idx_is_current_version (is_current_version),
    INDEX idx_published_at (published_at),

    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (previous_version_id) REFERENCES hrms_policy_versions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Policy version history with rollback support';

-- =====================================================
-- 4. POLICY ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_attachments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',
    version_id INT UNSIGNED NULL COMMENT 'FK to hrms_policy_versions (NULL = applies to all versions)',

    attachment_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    attachment_path VARCHAR(500) NOT NULL COMMENT 'File path on server',
    attachment_type ENUM('pdf', 'doc', 'docx', 'image', 'other') NOT NULL,
    file_size INT UNSIGNED NULL COMMENT 'File size in KB',
    mime_type VARCHAR(100) NULL,

    display_order INT DEFAULT 0 COMMENT 'Display order of attachments',

    uploaded_by INT UNSIGNED NULL COMMENT 'User who uploaded this file',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

    INDEX idx_policy_id (policy_id),
    INDEX idx_version_id (version_id),
    INDEX idx_attachment_type (attachment_type),
    INDEX idx_deleted_at (deleted_at),

    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES hrms_policy_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Policy attachments (PDF, DOC, etc.)';

-- =====================================================
-- 5. POLICY APPLICABILITY TABLE
-- Following EXACT pattern from HrmsWorkflowApplicability model
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_applicability (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',

    -- Applicability scope (same as HrmsWorkflowApplicability)
    applicability_type ENUM('company', 'entity', 'location', 'level', 'designation', 'department', 'sub_department', 'employee', 'grade') NOT NULL COMMENT 'Primary applicability type',

    -- Comma-separated IDs for primary applicability (same as workflow)
    applicability_value TEXT NULL COMMENT 'Comma-separated IDs for primary applicability (e.g., "1,2,3" for departments)',

    company_id INT UNSIGNED NULL COMMENT 'Specific company (usually inherited from policy)',

    -- Include/Exclude logic (same as workflow)
    is_excluded BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE = exclude this criteria, FALSE = include',

    -- Advanced filtering (same as workflow)
    advanced_applicability_type VARCHAR(50) NULL DEFAULT 'none' COMMENT 'Advanced filter: none, employee_type, branch, region',
    advanced_applicability_value TEXT NULL COMMENT 'Comma-separated IDs for advanced applicability filter',

    -- Priority for conflict resolution (same as workflow)
    priority INT NOT NULL DEFAULT 1 COMMENT 'Priority if multiple policies match (lower = higher priority)',

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT UNSIGNED NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_policy_id (policy_id),
    INDEX idx_applicability_type (applicability_type),
    INDEX idx_applicability_value (applicability_value(255)),
    INDEX idx_company_id (company_id),
    INDEX idx_is_excluded (is_excluded),
    INDEX idx_advanced_applicability_type (advanced_applicability_type),
    INDEX idx_advanced_applicability_value (advanced_applicability_value(255)),
    INDEX idx_priority (priority),
    INDEX idx_is_active (is_active),

    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Policy applicability - follows HrmsWorkflowApplicability pattern exactly';

-- =====================================================
-- 6. EMPLOYEE POLICY ACKNOWLEDGMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_employee_policy_acknowledgments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',
    version_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policy_versions',
    employee_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_employees',

    -- Assignment tracking
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When policy was assigned',
    assigned_by INT UNSIGNED NULL COMMENT 'User who assigned the policy',

    -- Acknowledgment tracking
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP NULL COMMENT 'When employee acknowledged',
    acknowledgment_ip VARCHAR(45) NULL COMMENT 'IP address of acknowledgment',
    acknowledgment_device VARCHAR(255) NULL COMMENT 'Device info',
    acknowledgment_comments TEXT NULL COMMENT 'Optional employee comments',

    -- Due date and reminders
    due_date DATE NULL COMMENT 'Acknowledgment due date',
    reminder_count INT DEFAULT 0 COMMENT 'Number of reminders sent',
    last_reminder_sent_at TIMESTAMP NULL COMMENT 'Last reminder timestamp',

    -- Grace period and ESS blocking
    grace_period_ends_at TIMESTAMP NULL COMMENT 'When ESS blocking starts',
    is_ess_blocked BOOLEAN DEFAULT FALSE COMMENT 'Is employee ESS access blocked',
    ess_blocked_since TIMESTAMP NULL COMMENT 'When ESS blocking started',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_employee_policy_version (employee_id, policy_id, version_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_version_id (version_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_is_acknowledged (is_acknowledged),
    INDEX idx_acknowledged_at (acknowledged_at),
    INDEX idx_due_date (due_date),
    INDEX idx_is_ess_blocked (is_ess_blocked),
    INDEX idx_grace_period_ends_at (grace_period_ends_at),

    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES hrms_policy_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee policy acknowledgment tracking with ESS blocking';

-- =====================================================
-- 7. POLICY ACKNOWLEDGMENT AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_acknowledgment_audit (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    acknowledgment_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_employee_policy_acknowledgments',
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',
    version_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policy_versions',
    employee_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_employees',

    -- Audit event details
    event_type ENUM('assigned', 'viewed', 'acknowledged', 'reminder_sent', 'ess_blocked', 'ess_unblocked', 're_assigned') NOT NULL,
    event_description TEXT NULL,

    -- Metadata
    performed_by INT UNSIGNED NULL COMMENT 'User who performed this action (NULL for system)',
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    additional_data JSON NULL COMMENT 'Extra event data',

    INDEX idx_acknowledgment_id (acknowledgment_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_event_type (event_type),
    INDEX idx_performed_at (performed_at),

    FOREIGN KEY (acknowledgment_id) REFERENCES hrms_employee_policy_acknowledgments(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES hrms_policy_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Complete audit trail for policy acknowledgments';

-- =====================================================
-- 8. POLICY NOTIFICATIONS QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_policy_notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_policies',
    acknowledgment_id INT UNSIGNED NULL COMMENT 'FK to hrms_employee_policy_acknowledgments',
    employee_id INT UNSIGNED NOT NULL COMMENT 'FK to hrms_employees',

    -- Notification details
    notification_type ENUM('assignment', 'reminder', 'escalation', 'ess_blocking_warning', 'version_update') NOT NULL,
    notification_channel ENUM('email', 'in_app', 'sms', 'push') NOT NULL,

    -- Message content
    subject VARCHAR(500) NULL,
    message_body TEXT NULL,

    -- Status tracking
    status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
    scheduled_at TIMESTAMP NOT NULL COMMENT 'When to send this notification',
    sent_at TIMESTAMP NULL COMMENT 'When notification was sent',
    failed_at TIMESTAMP NULL COMMENT 'When notification failed',
    failure_reason TEXT NULL,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_policy_id (policy_id),
    INDEX idx_acknowledgment_id (acknowledgment_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_notification_channel (notification_channel),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),

    FOREIGN KEY (policy_id) REFERENCES hrms_policies(id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledgment_id) REFERENCES hrms_employee_policy_acknowledgments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Policy notification queue for email/SMS/push';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
