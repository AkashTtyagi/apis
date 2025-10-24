-- =====================================================
-- Default Document Folders and Types
-- These will be copied to each company during onboarding
-- =====================================================

-- Note: company_id = 0 means these are templates
-- During company onboarding, these will be copied with actual company_id

-- =====================================================
-- DEFAULT FOLDERS
-- =====================================================

INSERT INTO hrms_document_folders (id, company_id, folder_name, folder_description, display_order, is_system_folder, is_active, created_by) VALUES
(1, 0, 'Personal Documents', 'Personal identification and address proof documents', 1, 1, 1, 1),
(2, 0, 'Educational Documents', 'Academic certificates and degrees', 2, 1, 1, 1),
(3, 0, 'Professional Documents', 'Experience letters, relieving letters, payslips', 3, 1, 1, 1),
(4, 0, 'Financial Documents', 'Bank details, PF, insurance documents', 4, 1, 1, 1),
(5, 0, 'Medical Documents', 'Medical certificates, insurance, vaccination records', 5, 1, 1, 1),
(6, 0, 'Employment Documents', 'Offer letter, appointment letter, contract', 6, 1, 1, 1);


-- =====================================================
-- DEFAULT FOLDER PERMISSIONS
-- All folders by default allow employee to view and add documents
-- =====================================================

-- Personal Documents Permissions
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(1, 'employee', 1, 1, 1, 0, 1),
(1, 'reporting_manager', 1, 1, 1, 0, 1),
(1, 'rm_of_rm', 1, 1, 1, 0, 1),
(1, 'department_head', 1, 1, 1, 0, 1),
(1, 'hr', 1, 1, 1, 1, 1),
(1, 'admin', 1, 1, 1, 1, 1);

-- Educational Documents Permissions
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(2, 'employee', 1, 1, 1, 0, 1),
(2, 'reporting_manager', 1, 1, 1, 0, 1),
(2, 'rm_of_rm', 1, 1, 1, 0, 1),
(2, 'department_head', 1, 1, 1, 0, 1),
(2, 'hr', 1, 1, 1, 1, 1),
(2, 'admin', 1, 1, 1, 1, 1);

-- Professional Documents Permissions
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(3, 'employee', 1, 1, 1, 0, 1),
(3, 'reporting_manager', 1, 1, 1, 0, 1),
(3, 'rm_of_rm', 1, 1, 1, 0, 1),
(3, 'department_head', 1, 1, 1, 0, 1),
(3, 'hr', 1, 1, 1, 1, 1),
(3, 'admin', 1, 1, 1, 1, 1);

-- Financial Documents Permissions
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(4, 'employee', 1, 1, 1, 0, 1),
(4, 'reporting_manager', 1, 0, 0, 0, 1),
(4, 'rm_of_rm', 1, 0, 0, 0, 1),
(4, 'department_head', 1, 0, 0, 0, 1),
(4, 'hr', 1, 1, 1, 1, 1),
(4, 'admin', 1, 1, 1, 1, 1);

-- Medical Documents Permissions
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(5, 'employee', 1, 1, 1, 0, 1),
(5, 'reporting_manager', 1, 0, 0, 0, 1),
(5, 'rm_of_rm', 1, 0, 0, 0, 1),
(5, 'department_head', 1, 0, 0, 0, 1),
(5, 'hr', 1, 1, 1, 1, 1),
(5, 'admin', 1, 1, 1, 1, 1);

-- Employment Documents Permissions (Read-only for employee, HR can manage)
INSERT INTO hrms_document_folder_permissions (folder_id, role_type, can_view, can_add, can_update, can_delete, created_by) VALUES
(6, 'employee', 1, 0, 0, 0, 1),
(6, 'reporting_manager', 1, 0, 0, 0, 1),
(6, 'rm_of_rm', 1, 0, 0, 0, 1),
(6, 'department_head', 1, 0, 0, 0, 1),
(6, 'hr', 1, 1, 1, 1, 1),
(6, 'admin', 1, 1, 1, 1, 1);


-- =====================================================
-- DEFAULT DOCUMENT TYPES
-- =====================================================

-- Personal Documents
INSERT INTO hrms_document_types (id, company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(1, 0, 1, 'AADHAAR', 'Aadhaar Card', 'Indian Government issued unique identification document',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 5.00, 1, 1, 1),

(2, 0, 1, 'PAN', 'PAN Card', 'Permanent Account Number for tax purposes',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 5.00, 2, 1, 1),

(3, 0, 1, 'PASSPORT', 'Passport', 'International travel document',
    1, 0, 0, 1, 1, 'pdf,jpg,jpeg,png', 5.00, 3, 1, 1),

(4, 0, 1, 'DRIVING_LICENSE', 'Driving License', 'Driving license issued by RTO',
    1, 0, 0, 1, 1, 'pdf,jpg,jpeg,png', 5.00, 4, 1, 1),

(5, 0, 1, 'VOTER_ID', 'Voter ID Card', 'Election commission voter identification card',
    1, 0, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 5, 1, 1),

(6, 0, 1, 'ADDRESS_PROOF', 'Address Proof', 'Current address proof document (Utility bill, Rental agreement, etc)',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 5.00, 6, 1, 1);

-- Educational Documents
INSERT INTO hrms_document_types (company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(0, 2, 'SSC_CERTIFICATE', '10th Certificate', 'Secondary School Certificate / 10th standard marksheet',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 10.00, 1, 1, 1),

(0, 2, 'HSC_CERTIFICATE', '12th Certificate', 'Higher Secondary Certificate / 12th standard marksheet',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 10.00, 2, 1, 1),

(0, 2, 'DEGREE_CERTIFICATE', 'Degree Certificate', 'Bachelor/Master degree certificate',
    0, 1, 1, 0, 0, 'pdf,jpg,jpeg,png', 10.00, 3, 1, 1),

(0, 2, 'DEGREE_MARKSHEET', 'Degree Marksheet', 'All semester marksheets',
    0, 1, 1, 0, 0, 'pdf,jpg,jpeg,png', 10.00, 4, 1, 1),

(0, 2, 'PROFESSIONAL_CERT', 'Professional Certification', 'Professional certifications (AWS, CCNA, etc)',
    0, 1, 0, 1, 0, 'pdf,jpg,jpeg,png', 10.00, 5, 1, 1);

-- Professional Documents
INSERT INTO hrms_document_types (company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(0, 3, 'EXPERIENCE_LETTER', 'Experience Letter', 'Experience letter from previous employer',
    0, 1, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 1, 1, 1),

(0, 3, 'RELIEVING_LETTER', 'Relieving Letter', 'Relieving/Resignation acceptance letter',
    0, 1, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 2, 1, 1),

(0, 3, 'PAYSLIP', 'Previous Company Payslips', 'Last 3 months payslips from previous employer',
    0, 1, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 3, 1, 1),

(0, 3, 'OFFER_LETTER_PREV', 'Previous Offer Letter', 'Offer letter from previous company',
    0, 1, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 4, 1, 1);

-- Financial Documents
INSERT INTO hrms_document_types (company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(0, 4, 'BANK_PASSBOOK', 'Bank Passbook/Statement', 'Cancelled cheque or bank statement',
    1, 0, 1, 0, 0, 'pdf,jpg,jpeg,png', 5.00, 1, 1, 1),

(0, 4, 'PF_UAN', 'PF UAN Document', 'Previous PF account details (UAN)',
    1, 0, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 2, 1, 1),

(0, 4, 'FORM_16', 'Form 16', 'Income tax form 16 from previous employer',
    0, 1, 0, 1, 0, 'pdf', 5.00, 3, 1, 1);

-- Medical Documents
INSERT INTO hrms_document_types (company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(0, 5, 'MEDICAL_CERTIFICATE', 'Medical Fitness Certificate', 'Medical fitness certificate for employment',
    1, 0, 0, 1, 1, 'pdf,jpg,jpeg,png', 5.00, 1, 1, 1),

(0, 5, 'HEALTH_INSURANCE', 'Health Insurance Card', 'Health insurance policy document',
    1, 0, 0, 1, 1, 'pdf,jpg,jpeg,png', 5.00, 2, 1, 1),

(0, 5, 'COVID_VACCINE', 'COVID Vaccination Certificate', 'COVID-19 vaccination certificate',
    1, 0, 0, 1, 0, 'pdf,jpg,jpeg,png', 5.00, 3, 1, 1);

-- Employment Documents (Company generated)
INSERT INTO hrms_document_types (company_id, folder_id, document_type_code, document_type_name, document_description,
    allow_single_document, allow_multiple_documents, is_mandatory, allow_not_applicable, require_expiry_date,
    allowed_file_types, max_file_size_mb, display_order, is_system_type, created_by) VALUES

(0, 6, 'OFFER_LETTER', 'Offer Letter', 'Company issued offer letter',
    1, 0, 0, 0, 0, 'pdf', 10.00, 1, 1, 1),

(0, 6, 'APPOINTMENT_LETTER', 'Appointment Letter', 'Formal appointment letter',
    1, 0, 0, 0, 0, 'pdf', 10.00, 2, 1, 1),

(0, 6, 'EMPLOYMENT_CONTRACT', 'Employment Contract', 'Employment contract/agreement',
    1, 0, 0, 0, 0, 'pdf', 10.00, 3, 1, 1),

(0, 6, 'NDA', 'Non-Disclosure Agreement', 'NDA signed by employee',
    1, 0, 0, 0, 0, 'pdf', 10.00, 4, 1, 1);


-- =====================================================
-- DEFAULT DOCUMENT TYPE FIELDS
-- =====================================================

-- Aadhaar Card Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
(1, 'aadhaar_number', 'Aadhaar Number', 'text', NULL, 'XXXX XXXX XXXX', 1, 1, 'Enter 12-digit Aadhaar number', 1),
(1, 'name_on_aadhaar', 'Name on Aadhaar', 'text', NULL, 'Full name as per Aadhaar', 1, 2, 'Name should match with Aadhaar card', 1),
(1, 'aadhaar_address', 'Address on Aadhaar', 'textarea', NULL, 'Address as per Aadhaar', 0, 3, NULL, 1);

-- PAN Card Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
(2, 'pan_number', 'PAN Number', 'text', NULL, 'ABCDE1234F', 1, 1, 'Enter 10-character PAN number', 1),
(2, 'name_on_pan', 'Name on PAN', 'text', NULL, 'Full name as per PAN', 1, 2, 'Name should match with PAN card', 1),
(2, 'father_name', 'Father Name', 'text', NULL, 'Father name as per PAN', 0, 3, NULL, 1);

-- Passport Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
(3, 'passport_number', 'Passport Number', 'text', NULL, 'A1234567', 1, 1, 'Enter passport number', 1),
(3, 'issue_date', 'Issue Date', 'date', NULL, NULL, 1, 2, 'Date when passport was issued', 1),
(3, 'place_of_issue', 'Place of Issue', 'text', NULL, 'City name', 0, 3, NULL, 1);

-- Driving License Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
(4, 'license_number', 'License Number', 'text', NULL, 'DL-XXXXXXXXX', 1, 1, 'Enter driving license number', 1),
(4, 'vehicle_class', 'Vehicle Class', 'multi_select', '["LMV", "MCWG", "HMV", "HGMV", "Transport"]', NULL, 1, 2, 'Select authorized vehicle classes', 1),
(4, 'issue_date', 'Issue Date', 'date', NULL, NULL, 1, 3, NULL, 1);

-- Bank Details Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'account_holder_name', 'Account Holder Name', 'text', NULL, 'Name as per bank', 1, 1, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'bank_name', 'Bank Name', 'text', NULL, 'Bank name', 1, 2, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'account_number', 'Account Number', 'text', NULL, 'Account number', 1, 3, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'ifsc_code', 'IFSC Code', 'text', NULL, 'IFSC Code', 1, 4, '11-character IFSC code', 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'account_type', 'Account Type', 'single_select', '["Savings", "Current"]', NULL, 1, 5, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'BANK_PASSBOOK' AND company_id = 0), 'branch_name', 'Branch Name', 'text', NULL, 'Branch name', 0, 6, NULL, 1);

-- Degree Certificate Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
((SELECT id FROM hrms_document_types WHERE document_type_code = 'DEGREE_CERTIFICATE' AND company_id = 0), 'degree_name', 'Degree Name', 'text', NULL, 'B.Tech, M.Tech, etc', 1, 1, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'DEGREE_CERTIFICATE' AND company_id = 0), 'specialization', 'Specialization/Branch', 'text', NULL, 'Computer Science, etc', 1, 2, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'DEGREE_CERTIFICATE' AND company_id = 0), 'university_name', 'University/Institute Name', 'text', NULL, 'University name', 1, 3, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'DEGREE_CERTIFICATE' AND company_id = 0), 'passing_year', 'Year of Passing', 'number', NULL, 'YYYY', 1, 4, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'DEGREE_CERTIFICATE' AND company_id = 0), 'percentage_cgpa', 'Percentage/CGPA', 'text', NULL, '75% or 7.5 CGPA', 1, 5, NULL, 1);

-- Experience Letter Fields
INSERT INTO hrms_document_type_fields (document_type_id, field_name, field_label, field_type, field_values, placeholder, is_required, display_order, help_text, created_by) VALUES
((SELECT id FROM hrms_document_types WHERE document_type_code = 'EXPERIENCE_LETTER' AND company_id = 0), 'company_name', 'Company Name', 'text', NULL, 'Previous company name', 1, 1, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'EXPERIENCE_LETTER' AND company_id = 0), 'designation', 'Designation', 'text', NULL, 'Your designation', 1, 2, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'EXPERIENCE_LETTER' AND company_id = 0), 'employment_from', 'Employment From', 'date', NULL, NULL, 1, 3, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'EXPERIENCE_LETTER' AND company_id = 0), 'employment_to', 'Employment To', 'date', NULL, NULL, 1, 4, NULL, 1),
((SELECT id FROM hrms_document_types WHERE document_type_code = 'EXPERIENCE_LETTER' AND company_id = 0), 'last_ctc', 'Last CTC (Annual)', 'number', NULL, 'Annual CTC', 0, 5, 'Optional', 1);
