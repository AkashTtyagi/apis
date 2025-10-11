-- =====================================================
-- HRMS Database - Complete Table Creation Script
-- =====================================================
-- This script creates all tables for the HRMS system
-- Run this script directly on your MySQL database
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- MASTER TABLES (No Dependencies)
-- =====================================================

-- 1. Employee Status Master Table
CREATE TABLE IF NOT EXISTS `hrms_employee_status_master` (
  `id` TINYINT UNSIGNED NOT NULL COMMENT 'Status ID (0-6)',
  `status_name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Status name (Active, Probation, etc.)',
  `status_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Short code for status',
  `description` TEXT DEFAULT NULL COMMENT 'Description of the status',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this status is currently active',
  `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order for display in UI',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee status master table - defines all possible employee statuses';

-- 2. Country Master Table
CREATE TABLE IF NOT EXISTS `hrms_country_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Country ID',
  `country_name` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Full country name',
  `country_code` VARCHAR(3) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-2 or alpha-3 code',
  `iso_code_2` CHAR(2) NOT NULL COMMENT 'ISO 3166-1 alpha-2 code',
  `iso_code_3` CHAR(3) NOT NULL COMMENT 'ISO 3166-1 alpha-3 code',
  `phone_code` VARCHAR(10) DEFAULT NULL COMMENT 'International dialing code',
  `abbreviation` VARCHAR(10) DEFAULT NULL COMMENT 'Country abbreviation',
  `primary_timezone` VARCHAR(100) DEFAULT NULL COMMENT 'Primary timezone of the country (e.g., Asia/Kolkata)',
  `utc_offset` VARCHAR(10) DEFAULT NULL COMMENT 'UTC offset (e.g., +5:30, -8:00)',
  `currency` VARCHAR(50) DEFAULT NULL COMMENT 'Main currency name (e.g., Indian Rupee)',
  `currency_code` CHAR(3) DEFAULT NULL COMMENT 'ISO 4217 currency code (e.g., INR, USD)',
  `currency_symbol` VARCHAR(10) DEFAULT NULL COMMENT 'Currency symbol (e.g., ₹, $)',
  `sub_currency` VARCHAR(50) DEFAULT NULL COMMENT 'Sub-currency name (e.g., Paisa, Cent)',
  `service_tax` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Default service tax percentage',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this country is active',
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order for display in UI',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_country_code` (`country_code`),
  INDEX `idx_iso_code_2` (`iso_code_2`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Country master table - stores all countries with timezone and currency details';

-- 3. State/Province Master Table
CREATE TABLE IF NOT EXISTS `hrms_state_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'State ID',
  `country_id` INT UNSIGNED NOT NULL COMMENT 'Reference to country',
  `state_name` VARCHAR(100) NOT NULL COMMENT 'Full state/province name',
  `state_code` VARCHAR(10) NOT NULL COMMENT 'State/province code',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this state is active',
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order for display in UI',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_country_id` (`country_id`),
  INDEX `idx_state_code` (`state_code`),
  INDEX `idx_is_active` (`is_active`),
  UNIQUE INDEX `unique_country_state` (`country_id`, `state_name`),
  CONSTRAINT `fk_state_country` FOREIGN KEY (`country_id`) REFERENCES `hrms_country_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='State/Province master table - stores all states and provinces';

-- 4. City Master Table
CREATE TABLE IF NOT EXISTS `hrms_city_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'City ID',
  `state_id` INT UNSIGNED NOT NULL COMMENT 'Reference to state',
  `country_id` INT UNSIGNED NOT NULL COMMENT 'Reference to country',
  `city_name` VARCHAR(100) NOT NULL COMMENT 'Full city name',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this city is active',
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Order for display in UI',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_state_id` (`state_id`),
  INDEX `idx_country_id` (`country_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_city_name` (`city_name`),
  UNIQUE INDEX `unique_state_city` (`state_id`, `city_name`),
  CONSTRAINT `fk_city_state` FOREIGN KEY (`state_id`) REFERENCES `hrms_state_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_city_country` FOREIGN KEY (`country_id`) REFERENCES `hrms_country_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='City master table - stores all cities';

-- 5. Industry Master Table
CREATE TABLE IF NOT EXISTS `hrms_industry_master` (
  `industry_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key for industry',
  `industry_name` VARCHAR(150) NOT NULL COMMENT 'Name of the industry',
  `industry_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique code for the industry',
  `description` TEXT DEFAULT NULL COMMENT 'Description of the industry',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether the industry is active (1=active, 0=inactive)',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who last updated this record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`industry_id`),
  INDEX `idx_industry_code` (`industry_code`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Industry master table - stores all industry types';

-- 6. Department Master Table
CREATE TABLE IF NOT EXISTS `hrms_department_master` (
  `department_id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key for department',
  `industry_id` INT UNSIGNED NOT NULL COMMENT 'Reference to industry',
  `department_name` VARCHAR(100) NOT NULL COMMENT 'Name of the department',
  `department_code` VARCHAR(50) DEFAULT NULL COMMENT 'Unique code for the department',
  `description` TEXT DEFAULT NULL COMMENT 'Description of the department',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether the department is active (1=active, 0=inactive)',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who last updated this record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  INDEX `idx_industry_id` (`industry_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_department_code` (`department_code`),
  UNIQUE INDEX `unique_industry_department` (`industry_id`, `department_name`),
  CONSTRAINT `fk_department_industry` FOREIGN KEY (`industry_id`) REFERENCES `hrms_industry_master` (`industry_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Department master table - stores departments for each industry';

-- 7. Form Master Table
CREATE TABLE IF NOT EXISTS `hrms_form_masters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `form_slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier: employee_form, candidate_form, onboarding_form',
  `form_name` VARCHAR(255) NOT NULL,
  `form_description` TEXT DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_form_slug` (`form_slug`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Template Master Table
CREATE TABLE IF NOT EXISTS `hrms_templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `template_slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier: employee_template, candidate_template, onboarding_template',
  `template_name` VARCHAR(255) NOT NULL,
  `template_description` TEXT DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_template_slug` (`template_slug`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMPANY AND ORGANIZATION TABLES
-- =====================================================

-- 9. Companies Table
CREATE TABLE IF NOT EXISTS `hrms_companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `org_name` VARCHAR(255) NOT NULL,
  `entity_id` INT DEFAULT NULL COMMENT 'Entity ID reference (same as company id)',
  `is_parent_company` TINYINT NOT NULL DEFAULT 0 COMMENT '1 for parent company (onboarded), 0 for entity companies',
  `country_id` INT NOT NULL COMMENT 'Foreign key reference to countries table',
  `org_industry` INT UNSIGNED DEFAULT NULL COMMENT 'Reference to industry master table',
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_entity_id` (`entity_id`),
  INDEX `idx_country_id` (`country_id`),
  INDEX `idx_org_name` (`org_name`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Organization Departments Table (Junction Table)
CREATE TABLE IF NOT EXISTS `hrms_org_departments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key for org-department mapping',
  `org_id` INT UNSIGNED NOT NULL COMMENT 'Reference to organization (hrms_companies.id)',
  `department_id` INT UNSIGNED NOT NULL COMMENT 'Reference to department master',
  `department_head_id` INT UNSIGNED DEFAULT NULL COMMENT 'Employee ID of department head',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether the department is active for this org (1=active, 0=inactive)',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT UNSIGNED DEFAULT NULL COMMENT 'User ID who last updated this record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_org_id` (`org_id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_department_head_id` (`department_head_id`),
  UNIQUE INDEX `unique_org_department` (`org_id`, `department_id`),
  CONSTRAINT `fk_org_dept_department` FOREIGN KEY (`department_id`) REFERENCES `hrms_department_master` (`department_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Organization departments table - maps departments to organizations';

-- 11. Sub-Departments Table
CREATE TABLE IF NOT EXISTS `hrms_sub_departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `org_dept_id` INT UNSIGNED NOT NULL COMMENT 'Reference to hrms_org_departments.id',
  `sub_department_name` VARCHAR(255) NOT NULL,
  `sub_department_code` VARCHAR(50) DEFAULT NULL COMMENT 'Optional sub-department code/identifier',
  `description` TEXT DEFAULT NULL,
  `head_id` INT UNSIGNED DEFAULT NULL COMMENT 'Employee ID of sub-department head',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_org_dept_id` (`org_dept_id`),
  INDEX `idx_sub_department_code` (`sub_department_code`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_head_id` (`head_id`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `unique_org_dept_subdept_name` (`org_dept_id`, `sub_department_name`),
  CONSTRAINT `fk_subdept_orgdept` FOREIGN KEY (`org_dept_id`) REFERENCES `hrms_org_departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER AND AUTHENTICATION TABLES
-- =====================================================

-- 12. User Details Table (Authentication & Account Information Only)
-- Personal details (name, etc.) are stored in hrms_employees table
CREATE TABLE IF NOT EXISTS `hrms_user_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL COMMENT 'Foreign key reference to hrms_companies table',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL COMMENT 'Hashed password',
  `is_password_set` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Flag to indicate if user has set their password',
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_email` (`email`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_is_password_set` (`is_password_set`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User authentication and account information - personal details stored in hrms_employees';

-- 13. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS `hrms_password_reset_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT 'Foreign key reference to hrms_user_details table',
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `token_type` ENUM('set_password', 'reset_password') NOT NULL DEFAULT 'reset_password' COMMENT 'Type of token: set_password for first time, reset_password for forgotten password',
  `expires_at` TIMESTAMP NOT NULL,
  `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when token was used',
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_token` (`token`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_token_type` (`token_type`),
  INDEX `idx_expires_at` (`expires_at`),
  INDEX `idx_is_used` (`is_used`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `hrms_user_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EMPLOYEE TABLES
-- =====================================================

-- 14. Employees Table
CREATE TABLE IF NOT EXISTS `hrms_employees` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL COMMENT 'Foreign key to hrms_companies',
  `user_id` INT NOT NULL COMMENT 'Foreign key to hrms_user_details',
  `employee_code` VARCHAR(50) NOT NULL COMMENT 'Unique employee identifier within company',
  `first_name` VARCHAR(100) NOT NULL,
  `middle_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `date_of_joining` DATE DEFAULT NULL,
  `department_id` INT NOT NULL COMMENT 'Foreign key to hrms_departments',
  `sub_department_id` INT DEFAULT NULL COMMENT 'Foreign key to hrms_sub_departments',
  `designation_id` INT DEFAULT NULL COMMENT 'Foreign key to designation master',
  `reporting_manager_id` INT DEFAULT NULL COMMENT 'Foreign key to hrms_employees (self-reference)',
  `leave_policy_id` INT DEFAULT NULL COMMENT 'Foreign key to hrms_leave_policy_master',
  `employment_type` ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Foreign key to hrms_employee_status_master (0=Active, 1=Probation, 2=Internship, 3=Separated, 4=Absconded, 5=Terminated, 6=Suspended)',
  `profile_picture` VARCHAR(500) DEFAULT NULL COMMENT 'URL or path to profile picture',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE INDEX `unique_company_employee_code` (`company_id`, `employee_code`),
  INDEX `idx_email` (`email`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_sub_department_id` (`sub_department_id`),
  INDEX `idx_designation_id` (`designation_id`),
  INDEX `idx_reporting_manager_id` (`reporting_manager_id`),
  INDEX `idx_leave_policy_id` (`leave_policy_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_employee_user` FOREIGN KEY (`user_id`) REFERENCES `hrms_user_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_employee_status` FOREIGN KEY (`status`) REFERENCES `hrms_employee_status_master` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CONFIGURATION TABLES
-- =====================================================

-- 15. SMTP Configuration Table
CREATE TABLE IF NOT EXISTS `hrms_smtp_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT DEFAULT NULL COMMENT 'Foreign key reference to hrms_companies table, NULL for default config',
  `smtp_host` VARCHAR(255) NOT NULL,
  `smtp_port` INT NOT NULL DEFAULT 587,
  `smtp_username` VARCHAR(255) NOT NULL,
  `smtp_password` VARCHAR(255) NOT NULL,
  `smtp_encryption` ENUM('tls', 'ssl', 'none') NOT NULL DEFAULT 'tls',
  `from_email` VARCHAR(255) NOT NULL,
  `from_name` VARCHAR(255) NOT NULL DEFAULT 'HRMS',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Email Templates Table
CREATE TABLE IF NOT EXISTS `hrms_email_templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT DEFAULT NULL COMMENT 'Foreign key reference to hrms_companies table, NULL for default template',
  `slug` VARCHAR(100) NOT NULL COMMENT 'Unique identifier for template type (e.g., welcome_email, reset_password, set_password)',
  `name` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `body` LONGTEXT NOT NULL COMMENT 'HTML email body with placeholders like {{user_name}}, {{reset_link}}, etc.',
  `variables` JSON DEFAULT NULL COMMENT 'JSON array of available variables for this template',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_slug` (`company_id`, `slug`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TEMPLATE SYSTEM TABLES
-- =====================================================

-- 17. Template Sections Table
CREATE TABLE IF NOT EXISTS `hrms_template_sections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT DEFAULT NULL COMMENT 'Foreign key to hrms_companies, NULL for default sections',
  `template_id` INT NOT NULL COMMENT 'Foreign key to hrms_templates',
  `section_slug` VARCHAR(100) NOT NULL COMMENT 'Unique identifier: personal_details, contact_info, emergency_contact',
  `section_name` VARCHAR(255) NOT NULL,
  `section_description` TEXT DEFAULT NULL,
  `section_order` INT NOT NULL DEFAULT 0 COMMENT 'Display order of sections',
  `is_collapsible` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Can section be collapsed in UI',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_section_slug` (`section_slug`),
  INDEX `idx_section_order` (`section_order`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `unique_company_template_section` (`company_id`, `template_id`, `section_slug`),
  CONSTRAINT `fk_section_template` FOREIGN KEY (`template_id`) REFERENCES `hrms_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Template Fields Table
CREATE TABLE IF NOT EXISTS `hrms_template_fields` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT DEFAULT NULL COMMENT 'Foreign key to hrms_companies, NULL for default fields',
  `template_id` INT NOT NULL COMMENT 'Foreign key to hrms_templates',
  `section_id` INT NOT NULL COMMENT 'Foreign key to hrms_template_sections',
  `field_slug` VARCHAR(100) NOT NULL COMMENT 'Unique identifier: blood_group, emergency_contact, father_name',
  `field_label` VARCHAR(255) NOT NULL,
  `field_type` ENUM('text', 'email', 'number', 'phone', 'date', 'datetime', 'select', 'radio', 'checkbox', 'textarea', 'file', 'url', 'master_select') NOT NULL,
  `field_options` JSON DEFAULT NULL COMMENT 'Array of options for select/radio/checkbox',
  `master_slug` VARCHAR(100) DEFAULT NULL COMMENT 'Reference to master table: location, department, designation',
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `min_length` INT DEFAULT NULL COMMENT 'Minimum character length',
  `max_length` INT DEFAULT NULL COMMENT 'Maximum character length',
  `min_value` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Minimum value for number fields',
  `max_value` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Maximum value for number fields',
  `regex_pattern` VARCHAR(500) DEFAULT NULL COMMENT 'Custom regex validation pattern',
  `data_type` ENUM('string', 'integer', 'decimal', 'boolean', 'date', 'json') NOT NULL DEFAULT 'string' COMMENT 'Data type for storage',
  `default_value` TEXT DEFAULT NULL,
  `placeholder` VARCHAR(255) DEFAULT NULL,
  `help_text` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Field ordering within section',
  `field_width` ENUM('full', 'half', 'third', 'quarter') NOT NULL DEFAULT 'full' COMMENT 'Field width in UI',
  `is_default_field` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'System default field (cannot be deleted)',
  `is_direct_field` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'true = stored in entity table (hrms_employees), false = stored in hrms_template_responses',
  `allowed_file_types` VARCHAR(255) DEFAULT NULL COMMENT 'Comma-separated: jpg,png,pdf',
  `max_file_size` INT DEFAULT NULL COMMENT 'Max file size in KB',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_section_id` (`section_id`),
  INDEX `idx_field_slug` (`field_slug`),
  INDEX `idx_master_slug` (`master_slug`),
  INDEX `idx_display_order` (`display_order`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_direct_field` (`is_direct_field`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `unique_company_template_section_field` (`company_id`, `template_id`, `section_id`, `field_slug`),
  CONSTRAINT `fk_field_template` FOREIGN KEY (`template_id`) REFERENCES `hrms_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_field_section` FOREIGN KEY (`section_id`) REFERENCES `hrms_template_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Template Responses Table
CREATE TABLE IF NOT EXISTS `hrms_template_responses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL COMMENT 'Foreign key to hrms_companies - helps with indexing for large data',
  `template_id` INT NOT NULL COMMENT 'Foreign key to hrms_templates',
  `entity_type` ENUM('employee', 'candidate', 'contractor', 'vendor', 'other') NOT NULL COMMENT 'Type of entity',
  `record_id` INT NOT NULL COMMENT 'ID of the record (employee_id, candidate_id, etc.)',
  `field_id` INT NOT NULL COMMENT 'Foreign key to hrms_template_fields',
  `field_value` TEXT DEFAULT NULL COMMENT 'Stored value (can be JSON for multiple selections)',
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_entity_record` (`company_id`, `entity_type`, `record_id`),
  INDEX `idx_company_template` (`company_id`, `template_id`),
  INDEX `idx_field_id` (`field_id`),
  INDEX `idx_entity_record` (`entity_type`, `record_id`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_updated_by` (`updated_by`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `unique_company_entity_field_response` (`company_id`, `entity_type`, `record_id`, `field_id`),
  CONSTRAINT `fk_response_template` FOREIGN KEY (`template_id`) REFERENCES `hrms_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_response_field` FOREIGN KEY (`field_id`) REFERENCES `hrms_template_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- LEAVE MANAGEMENT TABLES
-- =====================================================

-- 20. Leave Master Table
CREATE TABLE IF NOT EXISTS `hrms_leave_master` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `master_id` INT DEFAULT NULL COMMENT 'NULL for default leaves, references parent leave type for custom',
  `company_id` INT NOT NULL COMMENT 'Foreign key to hrms_companies (0 for system default leaves)',
  `leave_code` VARCHAR(20) NOT NULL COMMENT 'Unique identifier for leave type (e.g., MAT, PAT, LOP)',
  `leave_name` VARCHAR(100) NOT NULL,
  `leave_cycle_start_month` TINYINT NOT NULL COMMENT 'Month leave cycle starts (1-12)',
  `leave_cycle_end_month` TINYINT NOT NULL COMMENT 'Month leave cycle ends (1-12)',
  `leave_type` ENUM('paid', 'unpaid') NOT NULL DEFAULT 'paid',
  `is_encashment_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `applicable_to_esi` ENUM('esi', 'non_esi', 'both') NOT NULL DEFAULT 'both',
  `applicable_to_status` VARCHAR(255) NOT NULL DEFAULT '0' COMMENT 'Comma-separated status IDs from hrms_employee_status_master',
  `applicable_to_gender` ENUM('male', 'female', 'transgender', 'all') NOT NULL DEFAULT 'all',
  `credit_frequency` ENUM('monthly', 'quarterly', 'half_yearly', 'yearly', 'next_year', 'manual') NOT NULL DEFAULT 'yearly',
  `credit_day_of_month` TINYINT DEFAULT NULL,
  `number_of_leaves_to_credit` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Default leaves to credit',
  `active_leaves_to_credit` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Leaves for active employees (overrides default if set)',
  `probation_leaves_to_credit` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Leaves for probation employees',
  `intern_leaves_to_credit` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Leaves for interns',
  `contractor_leaves_to_credit` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Leaves for contractors',
  `separated_leaves_to_credit` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Leaves for separated employees',
  `credit_only_married` BOOLEAN NOT NULL DEFAULT FALSE,
  `round_off_credited_leaves` BOOLEAN NOT NULL DEFAULT FALSE,
  `lapse_balance_before_next_cycle` BOOLEAN NOT NULL DEFAULT TRUE,
  `can_request_half_day` BOOLEAN NOT NULL DEFAULT TRUE,
  `can_employee_request` BOOLEAN NOT NULL DEFAULT TRUE,
  `max_requests_per_tenure` INT DEFAULT NULL,
  `max_requests_per_month` INT DEFAULT NULL,
  `min_leaves_per_request` DECIMAL(4, 2) NOT NULL DEFAULT 0.5,
  `max_continuous_leave` INT DEFAULT NULL,
  `max_leaves_per_year` DECIMAL(5, 2) DEFAULT NULL,
  `max_leaves_per_month` DECIMAL(4, 2) DEFAULT NULL,
  `backdated_leave_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  `days_allowed_for_backdated_leave` INT DEFAULT NULL,
  `future_dated_leave_allowed` BOOLEAN NOT NULL DEFAULT TRUE,
  `manager_can_apply_future_dated` BOOLEAN NOT NULL DEFAULT TRUE,
  `manager_can_apply_backdated` BOOLEAN NOT NULL DEFAULT FALSE,
  `days_allowed_manager_backdated` INT DEFAULT NULL,
  `document_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `raise_leave_after_attendance_process` BOOLEAN NOT NULL DEFAULT FALSE,
  `restrict_if_resignation_pending` BOOLEAN NOT NULL DEFAULT FALSE,
  `restrict_after_joining_period` ENUM('no_restriction', 'exclude_joining_month', 'exclude_first_3_months', 'exclude_probation_period') NOT NULL DEFAULT 'no_restriction',
  `max_leaves_to_carry_forward` ENUM('zero', 'all', 'specific') NOT NULL DEFAULT 'zero',
  `max_carry_forward_count` DECIMAL(5, 2) DEFAULT NULL,
  `carry_forward_method` ENUM('manual', 'auto') NOT NULL DEFAULT 'auto',
  `carry_forward_in_same_cycle` ENUM('zero', 'all', 'specific') NOT NULL DEFAULT 'zero',
  `carry_forward_same_cycle_count` DECIMAL(5, 2) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_company_leave_code` (`company_id`, `leave_code`),
  INDEX `idx_company_active` (`company_id`, `is_active`),
  INDEX `idx_master_id` (`master_id`),
  INDEX `idx_leave_type` (`leave_type`),
  INDEX `idx_applicable_to_gender` (`applicable_to_gender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Leave Policy Master Table
CREATE TABLE IF NOT EXISTS `hrms_leave_policy_master` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL COMMENT 'Foreign key to hrms_companies',
  `policy_name` VARCHAR(100) NOT NULL,
  `policy_description` TEXT DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this record',
  `updated_by` INT DEFAULT NULL COMMENT 'User ID who last updated this record',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_company_policy_name` (`company_id`, `policy_name`),
  INDEX `idx_company_active` (`company_id`, `is_active`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Leave Policy Mapping Table
CREATE TABLE IF NOT EXISTS `hrms_leave_policy_mapping` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `policy_id` INT NOT NULL COMMENT 'Foreign key to hrms_leave_policy_master',
  `leave_type_id` INT NOT NULL COMMENT 'Foreign key to hrms_leave_master',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Order in which leave types should be displayed',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether this leave type is active in this policy',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_policy_leave` (`policy_id`, `leave_type_id`),
  INDEX `idx_policy_active` (`policy_id`, `is_active`),
  INDEX `idx_leave_type_id` (`leave_type_id`),
  INDEX `idx_display_order` (`display_order`),
  CONSTRAINT `fk_mapping_policy` FOREIGN KEY (`policy_id`) REFERENCES `hrms_leave_policy_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mapping_leave` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Leave Type Audit Logs Table
CREATE TABLE IF NOT EXISTS `hrms_leave_type_audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `leave_type_id` INT NOT NULL COMMENT 'Foreign key to hrms_leave_master',
  `company_id` INT NOT NULL COMMENT 'Foreign key to hrms_companies',
  `action` ENUM('create', 'update', 'delete') NOT NULL,
  `field_name` VARCHAR(100) DEFAULT NULL COMMENT 'Name of the field that was changed (null for create/delete)',
  `old_value` TEXT DEFAULT NULL COMMENT 'Previous value before change',
  `new_value` TEXT DEFAULT NULL COMMENT 'New value after change',
  `changed_by` INT NOT NULL COMMENT 'User ID who made this change',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP address of the user',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Browser/client user agent',
  `change_summary` VARCHAR(255) DEFAULT NULL COMMENT 'Brief description of the change',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_leave_type_date` (`leave_type_id`, `created_at`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_changed_by` (`changed_by`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_field_name` (`field_name`),
  CONSTRAINT `fk_audit_leave` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Leave Ledger Table (Source of Truth)
CREATE TABLE IF NOT EXISTS `hrms_leave_ledger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'Foreign key to hrms_employees',
  `leave_type_id` INT NOT NULL COMMENT 'Foreign key to hrms_leave_master',
  `leave_cycle_year` INT NOT NULL,
  `transaction_type` ENUM('credit', 'debit', 'carry_forward', 'adjustment_credit', 'adjustment_debit', 'encashment', 'lapse', 'reversal', 'penalty') NOT NULL,
  `amount` DECIMAL(5, 2) NOT NULL COMMENT 'Positive for credit, negative for debit',
  `balance_after_transaction` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Running balance after this transaction',
  `transaction_date` DATE NOT NULL,
  `reference_type` ENUM('system_credit', 'leave_request', 'manual_adjustment', 'carry_forward_process', 'encashment_process', 'year_end_lapse', 'penalty_deduction', 'leave_cancellation') DEFAULT NULL COMMENT 'Source/trigger of this transaction',
  `reference_id` INT DEFAULT NULL COMMENT 'ID of related record (e.g., request_id from generic request system)',
  `remarks` TEXT DEFAULT NULL COMMENT 'Additional notes about this transaction',
  `created_by` INT DEFAULT NULL COMMENT 'User ID who created this transaction (NULL for system-generated)',
  `reverses_transaction_id` INT DEFAULT NULL COMMENT 'ID of the original transaction that this reverses (used when transaction_type = reversal)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_employee_leave_year` (`employee_id`, `leave_type_id`, `leave_cycle_year`),
  INDEX `idx_employee_transaction_date` (`employee_id`, `transaction_date`),
  INDEX `idx_leave_type_id` (`leave_type_id`),
  INDEX `idx_transaction_type` (`transaction_type`),
  INDEX `idx_reference` (`reference_type`, `reference_id`),
  INDEX `idx_transaction_date` (`transaction_date`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_reverses_transaction_id` (`reverses_transaction_id`),
  CONSTRAINT `fk_ledger_employee` FOREIGN KEY (`employee_id`) REFERENCES `hrms_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ledger_leave` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Employee Leave Balance Table (Cached Balance)
CREATE TABLE IF NOT EXISTS `hrms_employee_leave_balance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL COMMENT 'Foreign key to hrms_employees',
  `leave_type_id` INT NOT NULL COMMENT 'Foreign key to hrms_leave_master',
  `leave_cycle_year` INT NOT NULL,
  `month` TINYINT NOT NULL COMMENT 'Month (1-12) for monthly tracking',
  `year` INT NOT NULL COMMENT 'Year for monthly tracking',
  `available_balance` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Current available leave balance (pending leaves calculated at runtime)',
  `opening_balance` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Balance at the start of month',
  `total_credited` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Total leaves credited in this month',
  `total_debited` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Total leaves consumed in this month',
  `carried_forward` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Leaves carried forward from previous cycle',
  `encashed` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Total leaves encashed in this month',
  `lapsed` DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT 'Total leaves lapsed in this month',
  `last_transaction_id` INT DEFAULT NULL COMMENT 'Last processed transaction ID from ledger',
  `last_updated_date` TIMESTAMP NULL DEFAULT NULL COMMENT 'When this balance was last updated',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_employee_leave_year_month` (`employee_id`, `leave_type_id`, `year`, `month`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_leave_type_id` (`leave_type_id`),
  INDEX `idx_leave_cycle_year` (`leave_cycle_year`),
  INDEX `idx_year_month` (`year`, `month`),
  INDEX `idx_available_balance` (`available_balance`),
  CONSTRAINT `fk_balance_employee` FOREIGN KEY (`employee_id`) REFERENCES `hrms_employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_balance_leave` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_master` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- RESTORE FOREIGN KEY CHECKS
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- SEED DEFAULT EMPLOYEE STATUS DATA
-- =====================================================

INSERT INTO `hrms_employee_status_master` (`id`, `status_name`, `status_code`, `description`, `is_active`, `display_order`) VALUES
(0, 'Active', 'ACTIVE', 'Employee is currently active and working', TRUE, 1),
(1, 'Probation', 'PROBATION', 'Employee is on probation period', TRUE, 2),
(2, 'Internship', 'INTERNSHIP', 'Employee is working as an intern', TRUE, 3),
(3, 'Separated', 'SEPARATED', 'Employee has been separated from the organization', TRUE, 4),
(4, 'Absconded', 'ABSCONDED', 'Employee has absconded', TRUE, 5),
(5, 'Terminated', 'TERMINATED', 'Employee has been terminated', TRUE, 6),
(6, 'Suspended', 'SUSPENDED', 'Employee is currently suspended', TRUE, 7)
ON DUPLICATE KEY UPDATE status_name = VALUES(status_name);

-- =====================================================
-- END OF SCRIPT
-- =====================================================
