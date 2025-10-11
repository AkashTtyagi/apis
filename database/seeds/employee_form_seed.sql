-- =====================================================
-- HRMS Employee Form Complete Seeder
-- Creates template, sections, and fields for employee creation
-- =====================================================

-- Step 1: Create the Template
INSERT INTO hrms_templates (template_slug, template_name, template_description, is_active, created_at, updated_at)
VALUES (
    'employee_template',
    'Employee Information Template',
    'Complete employee information template with all necessary fields for employee onboarding and management',
    1,
    NOW(),
    NOW()
);

-- Get the template ID (will be used in sections and fields)
SET @template_id = LAST_INSERT_ID();

-- =====================================================
-- Step 2: Create Sections
-- =====================================================

-- Section 1: Personal Information
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'personal_information', 'Personal Information', 'Basic personal details of the employee', 1, 0, 1, NOW(), NOW());
SET @section_personal = LAST_INSERT_ID();

-- Section 2: Contact Information
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'contact_information', 'Contact Information', 'Email, phone, and communication details', 2, 1, 1, NOW(), NOW());
SET @section_contact = LAST_INSERT_ID();

-- Section 3: Address Information
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'address_information', 'Address Information', 'Current and permanent address details', 3, 1, 1, NOW(), NOW());
SET @section_address = LAST_INSERT_ID();

-- Section 4: Employment Details
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'employment_details', 'Employment Details', 'Job-related information and organizational details', 4, 0, 1, NOW(), NOW());
SET @section_employment = LAST_INSERT_ID();

-- Section 5: Emergency Contact
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'emergency_contact', 'Emergency Contact', 'Emergency contact person details', 5, 1, 1, NOW(), NOW());
SET @section_emergency = LAST_INSERT_ID();

-- Section 6: Bank & Payment Information
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'bank_information', 'Bank & Payment Information', 'Bank account and payment details', 6, 1, 1, NOW(), NOW());
SET @section_bank = LAST_INSERT_ID();

-- Section 7: Documents
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'documents', 'Documents', 'Identity proofs and certificates', 7, 1, 1, NOW(), NOW());
SET @section_documents = LAST_INSERT_ID();

-- Section 8: Additional Information
INSERT INTO hrms_template_sections (company_id, template_id, section_slug, section_name, section_description, section_order, is_collapsible, is_active, created_at, updated_at)
VALUES (NULL, @template_id, 'additional_information', 'Additional Information', 'Other relevant information', 8, 1, 1, NOW(), NOW());
SET @section_additional = LAST_INSERT_ID();

-- =====================================================
-- Step 3: Create Fields
-- =====================================================

-- ===========================================
-- SECTION 1: PERSONAL INFORMATION (DIRECT FIELDS)
-- ===========================================

-- First Name (Direct Field - Required)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, min_length, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'first_name', 'First Name', 'text', 1, 2, 100, 'string', 'Enter first name', 1, 'half', 1, 1, 1, NOW(), NOW());

-- Middle Name (Direct Field - Optional)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'middle_name', 'Middle Name', 'text', 0, 100, 'string', 'Enter middle name', 2, 'half', 1, 1, 1, NOW(), NOW());

-- Last Name (Direct Field - Optional)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'last_name', 'Last Name', 'text', 0, 100, 'string', 'Enter last name', 3, 'half', 1, 1, 1, NOW(), NOW());

-- Date of Birth (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'date_of_birth', 'Date of Birth', 'date', 1, 'date', 'Select date of birth', 'Employee must be at least 18 years old', 4, 'half', 1, 1, 1, NOW(), NOW());

-- Gender (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'gender', 'Gender', 'select', JSON_ARRAY(
    JSON_OBJECT('value', 'male', 'label', 'Male'),
    JSON_OBJECT('value', 'female', 'label', 'Female'),
    JSON_OBJECT('value', 'other', 'label', 'Other')
), 1, 'string', 5, 'half', 1, 1, 1, NOW(), NOW());

-- Father's Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'father_name', 'Father''s Name', 'text', 0, 100, 'string', 'Enter father''s name', 6, 'half', 0, 0, 1, NOW(), NOW());

-- Mother's Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'mother_name', 'Mother''s Name', 'text', 0, 100, 'string', 'Enter mother''s name', 7, 'half', 0, 0, 1, NOW(), NOW());

-- Marital Status (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'marital_status', 'Marital Status', 'select', JSON_ARRAY(
    JSON_OBJECT('value', 'single', 'label', 'Single'),
    JSON_OBJECT('value', 'married', 'label', 'Married'),
    JSON_OBJECT('value', 'divorced', 'label', 'Divorced'),
    JSON_OBJECT('value', 'widowed', 'label', 'Widowed')
), 0, 'string', 8, 'half', 0, 0, 1, NOW(), NOW());

-- Blood Group (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'blood_group', 'Blood Group', 'select', JSON_ARRAY(
    JSON_OBJECT('value', 'A+', 'label', 'A+'),
    JSON_OBJECT('value', 'A-', 'label', 'A-'),
    JSON_OBJECT('value', 'B+', 'label', 'B+'),
    JSON_OBJECT('value', 'B-', 'label', 'B-'),
    JSON_OBJECT('value', 'O+', 'label', 'O+'),
    JSON_OBJECT('value', 'O-', 'label', 'O-'),
    JSON_OBJECT('value', 'AB+', 'label', 'AB+'),
    JSON_OBJECT('value', 'AB-', 'label', 'AB-')
), 0, 'string', 9, 'half', 0, 0, 1, NOW(), NOW());

-- Nationality (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, default_value, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_personal, 'nationality', 'Nationality', 'text', 0, 50, 'string', 'Enter nationality', 'Indian', 10, 'half', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 2: CONTACT INFORMATION
-- ===========================================

-- Email (Direct Field - Required)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_contact, 'email', 'Email Address', 'email', 1, 255, 'string', 'Enter email address', 'Official email for communication', 1, 'half', 1, 1, 1, NOW(), NOW());

-- Phone (Direct Field - Required)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_contact, 'phone', 'Mobile Number', 'phone', 1, 20, '^[0-9]{10}$', 'string', 'Enter 10-digit mobile number', 2, 'half', 1, 1, 1, NOW(), NOW());

-- Alternate Phone (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_contact, 'alternate_phone', 'Alternate Mobile Number', 'phone', 0, 20, 'string', 'Enter alternate mobile number', 3, 'half', 0, 0, 1, NOW(), NOW());

-- Personal Email (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_contact, 'personal_email', 'Personal Email', 'email', 0, 255, 'string', 'Enter personal email', 4, 'half', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 3: ADDRESS INFORMATION
-- ===========================================

-- Current Address Line 1 (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'current_address_line1', 'Current Address Line 1', 'text', 1, 255, 'string', 'House/Flat No., Building Name', 1, 'full', 0, 0, 1, NOW(), NOW());

-- Current Address Line 2 (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'current_address_line2', 'Current Address Line 2', 'text', 0, 255, 'string', 'Street, Area, Locality', 2, 'full', 0, 0, 1, NOW(), NOW());

-- Current City (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'current_city', 'Current City', 'text', 1, 100, 'string', 'Enter city', 3, 'third', 0, 0, 1, NOW(), NOW());

-- Current State (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'current_state', 'Current State', 'text', 1, 100, 'string', 'Enter state', 4, 'third', 0, 0, 1, NOW(), NOW());

-- Current Pincode (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'current_pincode', 'Current Pincode', 'text', 1, 6, '^[0-9]{6}$', 'string', 'Enter 6-digit pincode', 5, 'third', 0, 0, 1, NOW(), NOW());

-- Same as Current Address Checkbox (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, data_type, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'same_as_current', 'Same as Current Address', 'checkbox', 0, 'boolean', 'Check if permanent address is same as current address', 6, 'full', 0, 0, 1, NOW(), NOW());

-- Permanent Address Line 1 (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'permanent_address_line1', 'Permanent Address Line 1', 'text', 1, 255, 'string', 'House/Flat No., Building Name', 7, 'full', 0, 0, 1, NOW(), NOW());

-- Permanent Address Line 2 (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'permanent_address_line2', 'Permanent Address Line 2', 'text', 0, 255, 'string', 'Street, Area, Locality', 8, 'full', 0, 0, 1, NOW(), NOW());

-- Permanent City (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'permanent_city', 'Permanent City', 'text', 1, 100, 'string', 'Enter city', 9, 'third', 0, 0, 1, NOW(), NOW());

-- Permanent State (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'permanent_state', 'Permanent State', 'text', 1, 100, 'string', 'Enter state', 10, 'third', 0, 0, 1, NOW(), NOW());

-- Permanent Pincode (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_address, 'permanent_pincode', 'Permanent Pincode', 'text', 1, 6, '^[0-9]{6}$', 'string', 'Enter 6-digit pincode', 11, 'third', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 4: EMPLOYMENT DETAILS (DIRECT FIELDS)
-- ===========================================

-- Employee Code (Direct Field - Required)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'employee_code', 'Employee Code', 'text', 1, 50, 'string', 'Enter employee code', 'Unique identifier for the employee', 1, 'half', 1, 1, 1, NOW(), NOW());

-- Date of Joining (Direct Field - Required)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'date_of_joining', 'Date of Joining', 'date', 1, 'date', 'Select joining date', 2, 'half', 1, 1, 1, NOW(), NOW());

-- Department (Direct Field - will use master_select in future)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, master_slug, is_required, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'department_id', 'Department', 'master_select', 'department', 1, 'integer', 'Select department', 3, 'half', 1, 1, 1, NOW(), NOW());

-- Sub Department (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, master_slug, is_required, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'sub_department_id', 'Sub Department', 'master_select', 'sub_department', 0, 'integer', 'Select sub department', 4, 'half', 1, 1, 1, NOW(), NOW());

-- Designation (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, master_slug, is_required, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'designation_id', 'Designation', 'master_select', 'designation', 1, 'integer', 'Select designation', 5, 'half', 1, 1, 1, NOW(), NOW());

-- Reporting Manager (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, master_slug, is_required, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'reporting_manager_id', 'Reporting Manager', 'master_select', 'employee', 0, 'integer', 'Select reporting manager', 'Direct supervisor/manager', 6, 'half', 1, 1, 1, NOW(), NOW());

-- Employment Type (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, default_value, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'employment_type', 'Employment Type', 'select', JSON_ARRAY(
    JSON_OBJECT('value', 'full_time', 'label', 'Full Time'),
    JSON_OBJECT('value', 'part_time', 'label', 'Part Time'),
    JSON_OBJECT('value', 'contract', 'label', 'Contract'),
    JSON_OBJECT('value', 'intern', 'label', 'Intern')
), 1, 'string', 'full_time', 7, 'half', 1, 1, 1, NOW(), NOW());

-- Employee Status (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, default_value, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'status', 'Employment Status', 'select', JSON_ARRAY(
    JSON_OBJECT('value', '0', 'label', 'Active'),
    JSON_OBJECT('value', '1', 'label', 'Probation'),
    JSON_OBJECT('value', '2', 'label', 'Internship')
), 1, 'integer', '0', 'Current employment status', 8, 'half', 1, 1, 1, NOW(), NOW());

-- Work Location (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'work_location', 'Work Location', 'text', 0, 255, 'string', 'Enter work location/office', 9, 'half', 0, 0, 1, NOW(), NOW());

-- Probation Period (Custom Field - in months)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, min_value, max_value, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'probation_period', 'Probation Period (Months)', 'number', 0, 0, 12, 'integer', 'Enter probation period', 'Probation period in months', 10, 'half', 0, 0, 1, NOW(), NOW());

-- Notice Period (Custom Field - in days)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, min_value, max_value, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'notice_period', 'Notice Period (Days)', 'number', 0, 0, 90, 'integer', 'Enter notice period in days', 11, 'half', 0, 0, 1, NOW(), NOW());

-- Confirmation Date (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_employment, 'confirmation_date', 'Confirmation Date', 'date', 0, 'date', 'Select confirmation date', 'Date when employee was confirmed', 12, 'half', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 5: EMERGENCY CONTACT
-- ===========================================

-- Emergency Contact Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_emergency, 'emergency_contact_name', 'Emergency Contact Name', 'text', 1, 100, 'string', 'Enter contact person name', 1, 'half', 0, 0, 1, NOW(), NOW());

-- Emergency Contact Relationship (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_emergency, 'emergency_contact_relationship', 'Relationship', 'select', JSON_ARRAY(
    JSON_OBJECT('value', 'father', 'label', 'Father'),
    JSON_OBJECT('value', 'mother', 'label', 'Mother'),
    JSON_OBJECT('value', 'spouse', 'label', 'Spouse'),
    JSON_OBJECT('value', 'sibling', 'label', 'Sibling'),
    JSON_OBJECT('value', 'friend', 'label', 'Friend'),
    JSON_OBJECT('value', 'other', 'label', 'Other')
), 1, 'string', 2, 'half', 0, 0, 1, NOW(), NOW());

-- Emergency Contact Phone (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_emergency, 'emergency_contact_phone', 'Emergency Contact Phone', 'phone', 1, 20, '^[0-9]{10}$', 'string', 'Enter 10-digit mobile number', 3, 'half', 0, 0, 1, NOW(), NOW());

-- Emergency Contact Alternate Phone (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_emergency, 'emergency_contact_alternate_phone', 'Alternate Phone', 'phone', 0, 20, 'string', 'Alternate contact number', 4, 'half', 0, 0, 1, NOW(), NOW());

-- Emergency Contact Address (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_emergency, 'emergency_contact_address', 'Emergency Contact Address', 'textarea', 0, 500, 'string', 'Enter complete address', 5, 'full', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 6: BANK & PAYMENT INFORMATION
-- ===========================================

-- Bank Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'bank_name', 'Bank Name', 'text', 1, 100, 'string', 'Enter bank name', 1, 'half', 0, 0, 1, NOW(), NOW());

-- Account Number (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'account_number', 'Account Number', 'text', 1, 30, 'string', 'Enter account number', 2, 'half', 0, 0, 1, NOW(), NOW());

-- IFSC Code (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'ifsc_code', 'IFSC Code', 'text', 1, 11, '^[A-Z]{4}0[A-Z0-9]{6}$', 'string', 'Enter IFSC code', 'Bank IFSC code (11 characters)', 3, 'half', 0, 0, 1, NOW(), NOW());

-- Account Holder Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'account_holder_name', 'Account Holder Name', 'text', 1, 100, 'string', 'Enter account holder name', 'Name as per bank records', 4, 'half', 0, 0, 1, NOW(), NOW());

-- Branch Name (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'branch_name', 'Branch Name', 'text', 0, 100, 'string', 'Enter branch name', 5, 'half', 0, 0, 1, NOW(), NOW());

-- PAN Number (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_bank, 'pan_number', 'PAN Number', 'text', 1, 10, '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', 'string', 'Enter PAN number', 'Permanent Account Number for tax purposes', 6, 'half', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 7: DOCUMENTS
-- ===========================================

-- Aadhaar Number (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, regex_pattern, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'aadhaar_number', 'Aadhaar Number', 'text', 0, 12, '^[0-9]{12}$', 'string', 'Enter 12-digit Aadhaar number', 'Unique identification number', 1, 'half', 0, 0, 1, NOW(), NOW());

-- Passport Number (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'passport_number', 'Passport Number', 'text', 0, 20, 'string', 'Enter passport number', 2, 'half', 0, 0, 1, NOW(), NOW());

-- Passport Expiry Date (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'passport_expiry_date', 'Passport Expiry Date', 'date', 0, 'date', 'Select expiry date', 3, 'half', 0, 0, 1, NOW(), NOW());

-- Profile Picture Upload (Direct Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, allowed_file_types, max_file_size, is_required, data_type, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'profile_picture', 'Profile Picture', 'file', 'jpg,jpeg,png', 2048, 0, 'string', 'Upload JPG/PNG (Max 2MB)', 4, 'half', 1, 1, 1, NOW(), NOW());

-- Resume/CV Upload (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, allowed_file_types, max_file_size, is_required, data_type, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'resume_cv', 'Resume/CV', 'file', 'pdf,doc,docx', 5120, 0, 'string', 'Upload PDF/DOC (Max 5MB)', 5, 'half', 0, 0, 1, NOW(), NOW());

-- Educational Certificates (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, allowed_file_types, max_file_size, is_required, data_type, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'educational_certificates', 'Educational Certificates', 'file', 'pdf,jpg,jpeg,png', 5120, 0, 'string', 'Upload certificates (Max 5MB)', 6, 'half', 0, 0, 1, NOW(), NOW());

-- Experience Letters (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, allowed_file_types, max_file_size, is_required, data_type, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_documents, 'experience_letters', 'Experience Letters', 'file', 'pdf,jpg,jpeg,png', 5120, 0, 'string', 'Upload experience letters (Max 5MB)', 7, 'half', 0, 0, 1, NOW(), NOW());

-- ===========================================
-- SECTION 8: ADDITIONAL INFORMATION
-- ===========================================

-- Highest Education (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, field_options, is_required, data_type, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'highest_education', 'Highest Education', 'select', JSON_ARRAY(
    JSON_OBJECT('value', '10th', 'label', '10th Standard'),
    JSON_OBJECT('value', '12th', 'label', '12th Standard'),
    JSON_OBJECT('value', 'diploma', 'label', 'Diploma'),
    JSON_OBJECT('value', 'graduation', 'label', 'Graduation'),
    JSON_OBJECT('value', 'post_graduation', 'label', 'Post Graduation'),
    JSON_OBJECT('value', 'phd', 'label', 'PhD')
), 0, 'string', 1, 'half', 0, 0, 1, NOW(), NOW());

-- Specialization/Major (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'specialization', 'Specialization/Major', 'text', 0, 100, 'string', 'Enter specialization', 2, 'half', 0, 0, 1, NOW(), NOW());

-- Total Experience (Custom Field - in years)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, min_value, max_value, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'total_experience', 'Total Experience (Years)', 'number', 0, 0, 50, 'decimal', 'Enter total experience', 'Total work experience in years', 3, 'half', 0, 0, 1, NOW(), NOW());

-- Previous Company (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'previous_company', 'Previous Company', 'text', 0, 255, 'string', 'Enter previous company name', 4, 'half', 0, 0, 1, NOW(), NOW());

-- Skills (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'skills', 'Skills', 'textarea', 0, 1000, 'string', 'Enter skills (comma separated)', 'List relevant technical and soft skills', 5, 'full', 0, 0, 1, NOW(), NOW());

-- Languages Known (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'languages_known', 'Languages Known', 'text', 0, 255, 'string', 'Enter languages (comma separated)', 6, 'full', 0, 0, 1, NOW(), NOW());

-- Hobbies (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'hobbies', 'Hobbies', 'textarea', 0, 500, 'string', 'Enter hobbies and interests', 7, 'full', 0, 0, 1, NOW(), NOW());

-- LinkedIn Profile (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'linkedin_profile', 'LinkedIn Profile URL', 'url', 0, 500, 'string', 'Enter LinkedIn profile URL', 8, 'half', 0, 0, 1, NOW(), NOW());

-- Notes/Remarks (Custom Field)
INSERT INTO hrms_template_fields (company_id, template_id, section_id, field_slug, field_label, field_type, is_required, max_length, data_type, placeholder, help_text, display_order, field_width, is_default_field, is_direct_field, is_active, created_at, updated_at)
VALUES (NULL, @template_id, @section_additional, 'notes', 'Notes/Remarks', 'textarea', 0, 1000, 'string', 'Enter any additional notes', 'Additional information or remarks', 9, 'full', 0, 0, 1, NOW(), NOW());

-- =====================================================
-- Summary:
-- Template: employee_template
-- Total Sections: 8
-- Total Fields: 71
--
-- Direct Fields (stored in hrms_employees): 16
-- Custom Fields (stored in hrms_template_responses): 55
--
-- Sections:
-- 1. Personal Information (10 fields)
-- 2. Contact Information (4 fields)
-- 3. Address Information (11 fields)
-- 4. Employment Details (12 fields)
-- 5. Emergency Contact (5 fields)
-- 6. Bank & Payment Information (6 fields)
-- 7. Documents (7 fields)
-- 8. Additional Information (9 fields)
-- =====================================================
