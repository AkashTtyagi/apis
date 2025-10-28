-- =====================================================
-- Document Management System Migration
-- =====================================================

-- 1. Document Folders Table
CREATE TABLE hrms_document_folders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    folder_name VARCHAR(255) NOT NULL,
    folder_description TEXT,
    display_order INT DEFAULT 0,
    is_system_folder TINYINT(1) DEFAULT 0 COMMENT 'System folders cannot be deleted',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_company_folder_name (company_id, folder_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Document folders for organizing documents';


-- 2. Folder Permissions Table
CREATE TABLE hrms_document_folder_permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    folder_id INT UNSIGNED NOT NULL,
    role_type ENUM('employee', 'reporting_manager', 'rm_of_rm', 'department_head', 'hr', 'admin', 'custom_role') NOT NULL,
    custom_role_id INT UNSIGNED NULL COMMENT 'Reference to hrms_roles table for custom roles',
    can_view TINYINT(1) DEFAULT 0 COMMENT 'Can view folder and documents',
    can_add TINYINT(1) DEFAULT 0 COMMENT 'Can add/upload documents',
    can_update TINYINT(1) DEFAULT 0 COMMENT 'Can update/edit documents',
    can_delete TINYINT(1) DEFAULT 0 COMMENT 'Can delete documents',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_folder (folder_id),
    INDEX idx_role_type (role_type),
    INDEX idx_custom_role (custom_role_id),
    UNIQUE KEY unique_folder_role (folder_id, role_type, custom_role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Role-based permissions for document folders';


-- 3. Document Types Table
CREATE TABLE hrms_document_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    folder_id INT UNSIGNED NOT NULL,
    document_type_code VARCHAR(100) NOT NULL,
    document_type_name VARCHAR(255) NOT NULL,
    document_description TEXT,

    -- Document constraints
    allow_single_document TINYINT(1) DEFAULT 1 COMMENT 'Employee can have only one document of this type',
    allow_multiple_documents TINYINT(1) DEFAULT 0 COMMENT 'Employee can have multiple documents',
    is_mandatory TINYINT(1) DEFAULT 0 COMMENT 'Document is mandatory for employee',
    allow_not_applicable TINYINT(1) DEFAULT 0 COMMENT 'Employee can mark as N/A',
    require_expiry_date TINYINT(1) DEFAULT 0 COMMENT 'Ask for document expiry date',

    -- Additional settings
    allowed_file_types VARCHAR(500) DEFAULT 'pdf,jpg,jpeg,png,doc,docx' COMMENT 'Comma-separated allowed extensions',
    max_file_size_mb DECIMAL(10,2) DEFAULT 5.00 COMMENT 'Maximum file size in MB',

    display_order INT DEFAULT 0,
    is_system_type TINYINT(1) DEFAULT 0 COMMENT 'System types cannot be deleted',
    is_active TINYINT(1) DEFAULT 1,
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_folder (folder_id),
    INDEX idx_code (document_type_code),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_company_doc_type_code (company_id, document_type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Document types with validation rules';


-- 4. Document Type Form Fields Table
CREATE TABLE hrms_document_type_fields (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_type_id INT UNSIGNED NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'textarea', 'number', 'date', 'time', 'datetime', 'email', 'phone', 'url', 'single_select', 'multi_select', 'checkbox', 'radio', 'file') NOT NULL,
    field_values TEXT COMMENT 'JSON array of options for select/radio/checkbox fields',
    placeholder VARCHAR(255),
    default_value VARCHAR(500),
    validation_rules JSON COMMENT 'JSON object with validation rules (min, max, pattern, etc)',

    -- Field settings
    is_required TINYINT(1) DEFAULT 0,
    is_readonly TINYINT(1) DEFAULT 0,
    is_visible TINYINT(1) DEFAULT 1,

    display_order INT DEFAULT 0,
    help_text TEXT,
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_document_type (document_type_id),
    INDEX idx_field_type (field_type),
    UNIQUE KEY unique_doc_type_field_name (document_type_id, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dynamic form fields for document types';


-- 5. Employee Documents Table
CREATE TABLE hrms_employee_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    employee_id INT UNSIGNED NOT NULL,
    folder_id INT UNSIGNED NOT NULL,
    document_type_id INT UNSIGNED NOT NULL,

    document_number VARCHAR(255) COMMENT 'Document identification number',
    document_title VARCHAR(500),
    document_description TEXT,

    -- File details
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size_kb DECIMAL(10,2),
    file_type VARCHAR(50),
    file_extension VARCHAR(10),

    -- Document dates
    issue_date DATE,
    expiry_date DATE,

    -- Not Applicable
    is_not_applicable TINYINT(1) DEFAULT 0,
    not_applicable_reason TEXT,

    -- Letter reference (optional - if document is generated from a letter template)
    letter_id INT UNSIGNED NULL COMMENT 'Reference to generated letter if applicable',

    is_active TINYINT(1) DEFAULT 1,
    uploaded_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_employee (employee_id),
    INDEX idx_folder (folder_id),
    INDEX idx_document_type (document_type_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee uploaded documents';


-- 6. Employee Document Field Values Table
CREATE TABLE hrms_employee_document_field_values (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_document_id INT UNSIGNED NOT NULL,
    field_id INT UNSIGNED NOT NULL COMMENT 'Reference to hrms_document_type_fields',
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_employee_document (employee_document_id),
    INDEX idx_field (field_id),
    UNIQUE KEY unique_document_field (employee_document_id, field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dynamic field values for employee documents';


-- 7. Document Audit Log Table
CREATE TABLE hrms_document_audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    employee_document_id INT UNSIGNED NULL,
    folder_id INT UNSIGNED NULL,
    document_type_id INT UNSIGNED NULL,

    action ENUM('folder_created', 'folder_updated', 'folder_deleted',
                'document_type_created', 'document_type_updated', 'document_type_deleted',
                'document_uploaded', 'document_updated', 'document_deleted',
                'document_marked_na', 'document_viewed') NOT NULL,

    performed_by INT UNSIGNED NOT NULL,
    performed_on_behalf_of INT UNSIGNED NULL COMMENT 'If admin uploaded for employee',
    action_details JSON COMMENT 'Additional details about the action',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_employee_document (employee_document_id),
    INDEX idx_action (action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for document management system';


-- 8. Document Reminders Table (for expiring documents)
CREATE TABLE hrms_document_reminders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    employee_document_id INT UNSIGNED NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_type ENUM('expiry_warning', 'expiry_due', 'expired') NOT NULL,
    days_before_expiry INT,

    is_sent TINYINT(1) DEFAULT 0,
    sent_at TIMESTAMP NULL,
    reminder_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_employee_document (employee_document_id),
    INDEX idx_reminder_date (reminder_date),
    INDEX idx_is_sent (is_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Document expiry reminders';


-- Add Foreign Key Constraints
ALTER TABLE hrms_document_folder_permissions
    ADD CONSTRAINT fk_folder_perms_folder
    FOREIGN KEY (folder_id) REFERENCES hrms_document_folders(id) ON DELETE CASCADE;

ALTER TABLE hrms_document_types
    ADD CONSTRAINT fk_doc_types_folder
    FOREIGN KEY (folder_id) REFERENCES hrms_document_folders(id) ON DELETE CASCADE;

ALTER TABLE hrms_document_type_fields
    ADD CONSTRAINT fk_doc_type_fields_doc_type
    FOREIGN KEY (document_type_id) REFERENCES hrms_document_types(id) ON DELETE CASCADE;

ALTER TABLE hrms_employee_documents
    ADD CONSTRAINT fk_emp_docs_folder
    FOREIGN KEY (folder_id) REFERENCES hrms_document_folders(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_emp_docs_doc_type
    FOREIGN KEY (document_type_id) REFERENCES hrms_document_types(id) ON DELETE RESTRICT;

ALTER TABLE hrms_employee_document_field_values
    ADD CONSTRAINT fk_emp_doc_field_values_emp_doc
    FOREIGN KEY (employee_document_id) REFERENCES hrms_employee_documents(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_emp_doc_field_values_field
    FOREIGN KEY (field_id) REFERENCES hrms_document_type_fields(id) ON DELETE CASCADE;

ALTER TABLE hrms_document_reminders
    ADD CONSTRAINT fk_doc_reminders_emp_doc
    FOREIGN KEY (employee_document_id) REFERENCES hrms_employee_documents(id) ON DELETE CASCADE;
