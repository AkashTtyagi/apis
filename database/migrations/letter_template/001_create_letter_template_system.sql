-- =====================================================
-- Letter Template System Migration
-- Complete Letter Management with 3-Step Configuration
-- =====================================================

-- 1. Letter Category Master Table (System-wide categories)
CREATE TABLE hrms_letter_category_master (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    category_code VARCHAR(100) NOT NULL,
    category_description TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    UNIQUE KEY unique_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master table for letter categories';


-- 2. Letter Templates Table (Main table for letter configuration)
CREATE TABLE hrms_letter_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,

    -- Step 1: Letter Properties
    letter_name VARCHAR(255) NOT NULL,
    letter_code VARCHAR(100) NOT NULL COMMENT 'Unique code for template',
    letter_description TEXT,
    category_id INT UNSIGNED NULL COMMENT 'Reference to hrms_letter_category_master',

    -- Page Setup
    page_size ENUM('A4', 'A3', 'A5') DEFAULT 'A4' COMMENT 'A4 (21*29.49cm), A3 (20.7*42cm), A5 (14.8*21cm)',
    orientation ENUM('portrait', 'landscape') DEFAULT 'portrait',

    -- Margins (in cm)
    has_page_margin TINYINT(1) DEFAULT 0,
    margin_top DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',
    margin_left DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',
    margin_right DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',
    margin_bottom DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',

    -- Border
    has_border TINYINT(1) DEFAULT 0,
    border_size VARCHAR(50) DEFAULT '1px' COMMENT 'e.g. 1px, 2px, 3px',
    border_margin_top DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',
    border_margin_left DECIMAL(5,2) DEFAULT 0.00 COMMENT 'in cm',

    -- Page Number
    has_page_number TINYINT(1) DEFAULT 0,
    page_number_position ENUM('header', 'footer') DEFAULT 'footer',
    page_number_alignment ENUM('left', 'center', 'right') DEFAULT 'center',
    page_number_format VARCHAR(50) DEFAULT 'Page {current} of {total}',

    -- Step 2: Header & Footer
    has_header TINYINT(1) DEFAULT 0 COMMENT 'Page header appears in each page',
    header_content LONGTEXT COMMENT 'HTML content from CK Editor',
    header_height DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Header height in cm',

    has_footer TINYINT(1) DEFAULT 0 COMMENT 'Page footer appears in each page',
    footer_content LONGTEXT COMMENT 'HTML content from CK Editor',
    footer_height DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Footer height in cm',

    -- Step 3: Main Content
    main_content LONGTEXT NOT NULL COMMENT 'HTML content with slugs like {{FIRST_NAME}}',

    -- Additional Settings
    auto_generate_letter_number TINYINT(1) DEFAULT 1,
    letter_number_prefix VARCHAR(50) DEFAULT 'LTR',
    letter_number_format VARCHAR(100) DEFAULT '{PREFIX}/{YEAR}/{MONTH}/{SEQ}',

    -- Watermark
    has_watermark TINYINT(1) DEFAULT 0,
    watermark_text VARCHAR(255),
    watermark_opacity DECIMAL(3,2) DEFAULT 0.10 COMMENT '0.00 to 1.00',

    -- Digital Signature
    requires_signature TINYINT(1) DEFAULT 0,
    signature_position ENUM('left', 'center', 'right') DEFAULT 'right',
    signatory_name VARCHAR(255),
    signatory_designation VARCHAR(255),
    signature_image_path VARCHAR(1000),

    -- Approval Workflow
    requires_approval TINYINT(1) DEFAULT 0,
    approval_workflow_id INT UNSIGNED NULL,

    -- Status
    is_active TINYINT(1) DEFAULT 1,
    is_system_template TINYINT(1) DEFAULT 0 COMMENT 'System templates cannot be deleted',
    is_draft TINYINT(1) DEFAULT 1,

    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_active (is_active),
    INDEX idx_code (letter_code),
    INDEX idx_category (category_id),
    UNIQUE KEY unique_company_letter_code (company_id, letter_code),

    FOREIGN KEY (category_id) REFERENCES hrms_letter_category_master(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Letter template configurations with 3-step setup';


-- 3. Letter Template Custom Fields Table
CREATE TABLE hrms_letter_template_custom_fields (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    letter_template_id INT UNSIGNED NOT NULL,

    field_name VARCHAR(255) NOT NULL COMMENT 'e.g. Reference Number, Status',
    field_slug VARCHAR(255) NOT NULL COMMENT 'e.g. REFERENCE_NUMBER, STATUS',
    field_type ENUM('text', 'number', 'date', 'select', 'textarea', 'email', 'phone') DEFAULT 'text',
    field_options TEXT COMMENT 'JSON array for select type (e.g. ["Accept", "Reject"])',

    is_required TINYINT(1) DEFAULT 0,
    default_value VARCHAR(500),
    placeholder VARCHAR(255),
    help_text TEXT,
    validation_rules JSON COMMENT 'JSON object with validation rules',

    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,

    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_letter_template (letter_template_id),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_template_field_slug (letter_template_id, field_slug),

    FOREIGN KEY (letter_template_id) REFERENCES hrms_letter_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Custom fields for letter templates';


-- NOTE: Generated letters are NOT stored in a separate table
-- Instead, they are stored in hrms_employee_documents with:
-- - letter_id: reference to letter template
-- - file_path: NULL/empty (PDF generated on-the-fly)
-- - workflow_request_id: if approval required
-- - status: draft/pending_approval/approved/rejected
-- This unified approach makes document management simpler


-- 4. Letter Custom Field Values Table (Stores values for each employee document)
CREATE TABLE hrms_letter_custom_field_values (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_document_id INT UNSIGNED NOT NULL COMMENT 'Reference to hrms_employee_documents',
    custom_field_id INT UNSIGNED NOT NULL COMMENT 'Reference to hrms_letter_template_custom_fields',

    field_value TEXT COMMENT 'Actual value filled by admin for this employee',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_employee_document (employee_document_id),
    INDEX idx_custom_field (custom_field_id),
    UNIQUE KEY unique_document_field (employee_document_id, custom_field_id),

    FOREIGN KEY (employee_document_id) REFERENCES hrms_employee_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (custom_field_id) REFERENCES hrms_letter_template_custom_fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Custom field values for generated letters';


-- 5. Letter Audit Log Table
CREATE TABLE hrms_letter_audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    employee_document_id INT UNSIGNED NULL COMMENT 'Reference to hrms_employee_documents (for letter actions)',
    letter_template_id INT UNSIGNED NULL COMMENT 'Reference to hrms_letter_templates',
    employee_id INT NULL COMMENT 'Reference to hrms_employees - uses INT to match employee table',

    action ENUM('template_created', 'template_updated', 'template_deleted', 'template_activated', 'template_deactivated',
                'letter_drafted', 'letter_generated', 'letter_approved', 'letter_rejected',
                'letter_sent', 'letter_viewed', 'letter_downloaded', 'letter_cancelled',
                'pdf_generated', 'pdf_failed', 'email_sent', 'email_failed',
                'document_uploaded', 'signature_added') NOT NULL,

    old_value TEXT,
    new_value TEXT,
    performed_by INT UNSIGNED NOT NULL,
    action_details JSON COMMENT 'Additional details about the action',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_company (company_id),
    INDEX idx_document (employee_document_id),
    INDEX idx_template (letter_template_id),
    INDEX idx_employee (employee_id),
    INDEX idx_action (action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for letter template system';


-- 6. Letter Recipients Table (For bulk sending and tracking)
CREATE TABLE hrms_letter_recipients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_document_id INT UNSIGNED NOT NULL COMMENT 'Reference to hrms_employee_documents',
    employee_id INT NOT NULL COMMENT 'Reference to hrms_employees - uses INT to match employee table',

    recipient_type ENUM('to', 'cc', 'bcc') DEFAULT 'to',

    is_sent TINYINT(1) DEFAULT 0,
    sent_at TIMESTAMP NULL,

    is_viewed TINYINT(1) DEFAULT 0,
    viewed_at TIMESTAMP NULL,

    is_downloaded TINYINT(1) DEFAULT 0,
    downloaded_at TIMESTAMP NULL,

    delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
    delivery_error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_document (employee_document_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (delivery_status),

    FOREIGN KEY (employee_document_id) REFERENCES hrms_employee_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Recipients for generated letters (supports bulk sending and tracking)';


-- 7. Letter Versions Table (Track template versions)
CREATE TABLE hrms_letter_template_versions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    letter_template_id INT UNSIGNED NOT NULL,

    version_number INT NOT NULL,
    main_content LONGTEXT NOT NULL,
    header_content LONGTEXT,
    footer_content LONGTEXT,

    change_summary TEXT,
    is_major_version TINYINT(1) DEFAULT 0,

    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_template (letter_template_id),
    INDEX idx_version (version_number),

    FOREIGN KEY (letter_template_id) REFERENCES hrms_letter_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Version history of letter templates';


-- =====================================================
-- Seed Data for Letter Category Master
-- =====================================================

INSERT INTO hrms_letter_category_master (category_name, category_code, category_description, display_order, is_active) VALUES
('Appointment Letters', 'APPOINTMENT', 'Employee appointment and offer letters', 1, 1),
('Confirmation Letters', 'CONFIRMATION', 'Probation confirmation letters', 2, 1),
('Increment Letters', 'INCREMENT', 'Salary increment letters', 3, 1),
('Promotion Letters', 'PROMOTION', 'Job promotion letters', 4, 1),
('Transfer Letters', 'TRANSFER', 'Employee transfer letters', 5, 1),
('Resignation Letters', 'RESIGNATION', 'Employee resignation acceptance letters', 6, 1),
('Relieving Letters', 'RELIEVING', 'Employee relieving letters', 7, 1),
('Experience Certificates', 'EXPERIENCE', 'Experience certificates', 8, 1),
('Warning Letters', 'WARNING', 'Disciplinary warning letters', 9, 1),
('Termination Letters', 'TERMINATION', 'Employment termination letters', 10, 1),
('Leave Letters', 'LEAVE', 'Leave approval/rejection letters', 11, 1),
('NOC Letters', 'NOC', 'No Objection Certificates', 12, 1),
('Appreciation Letters', 'APPRECIATION', 'Employee appreciation letters', 13, 1),
('Appraisal Letters', 'APPRAISAL', 'Performance appraisal letters', 14, 1),
('General Letters', 'GENERAL', 'General purpose letters', 15, 1);
