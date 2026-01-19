-- =====================================================
-- Expense Category Management Migration
-- Creates tables for expense category configuration
-- Run this SQL to create the expense category tables
-- =====================================================

-- Table 1: hrms_expense_categories
-- Main expense categories table with type-specific configurations
CREATE TABLE IF NOT EXISTS hrms_expense_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Basic Information
    category_name VARCHAR(100) NOT NULL COMMENT 'Name of the category (e.g., Travel, Food)',
    category_code VARCHAR(50) NOT NULL COMMENT 'Unique code for the category',
    category_description TEXT COMMENT 'Description of the category',
    category_icon VARCHAR(100) COMMENT 'Icon name or URL for UI',

    -- Category Hierarchy
    parent_category_id INT COMMENT 'FK to self for sub-categories',

    -- Expense Type
    expense_type ENUM('Amount', 'Mileage', 'Per_Diem', 'Time_Based') NOT NULL DEFAULT 'Amount'
        COMMENT 'Amount=Fixed/Variable, Mileage=Distance-based, Per_Diem=Daily allowance, Time_Based=Hourly',

    -- Mileage Configuration (when expense_type = 'Mileage')
    mileage_rate_per_km DECIMAL(10,2) COMMENT 'Rate per kilometer',
    mileage_vehicle_type VARCHAR(50) COMMENT 'Vehicle type (Car, Bike, etc.)',

    -- Per Diem Configuration (when expense_type = 'Per_Diem')
    per_diem_rate DECIMAL(10,2) COMMENT 'Daily rate amount',
    per_diem_half_day_rate DECIMAL(10,2) COMMENT 'Half day rate amount',

    -- Time-Based Configuration (when expense_type = 'Time_Based')
    hourly_rate DECIMAL(10,2) COMMENT 'Hourly rate amount',
    min_hours DECIMAL(5,2) COMMENT 'Minimum hours for billing',
    max_hours_per_day DECIMAL(5,2) COMMENT 'Maximum hours per day',

    -- Receipt Configuration
    receipt_required ENUM('Always', 'Above_Limit', 'Never') DEFAULT 'Above_Limit',
    receipt_required_above DECIMAL(10,2) DEFAULT 500.00 COMMENT 'Receipt required if amount exceeds this',

    -- Tax Configuration
    is_taxable TINYINT(1) DEFAULT 0 COMMENT '1=Taxable expense, 0=Non-taxable',
    tax_percentage DECIMAL(5,2) COMMENT 'Tax percentage if taxable',
    gst_applicable TINYINT(1) DEFAULT 0 COMMENT '1=GST applicable',
    hsn_code VARCHAR(20) COMMENT 'HSN/SAC code for GST',

    -- Display Order
    display_order INT DEFAULT 0 COMMENT 'Order for UI display',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit fields
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    deleted_by INT,

    -- Indexes
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_category_code (category_code),
    INDEX idx_expense_type (expense_type),
    INDEX idx_parent_category (parent_category_id),
    UNIQUE INDEX idx_company_category_code (company_id, category_code),

    -- Foreign Key for self-reference
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id)
        REFERENCES hrms_expense_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================

-- Table 2: hrms_expense_category_limits
-- Global and location-based expense limits
CREATE TABLE IF NOT EXISTS hrms_expense_category_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',

    -- Limit Scope
    limit_type ENUM('Global', 'Location_Based', 'Grade_Based', 'Department_Based') NOT NULL DEFAULT 'Global',

    -- Location-based (when limit_type = 'Location_Based')
    location_group_id INT COMMENT 'FK to hrms_expense_location_groups',

    -- Grade-based (when limit_type = 'Grade_Based')
    grade_id INT COMMENT 'FK to hrms_grades',

    -- Department-based (when limit_type = 'Department_Based')
    department_id INT COMMENT 'FK to hrms_departments',

    -- Limit Values
    limit_per_transaction DECIMAL(12,2) COMMENT 'Maximum amount per single expense',
    limit_per_day DECIMAL(12,2) COMMENT 'Maximum amount per day',
    limit_per_week DECIMAL(12,2) COMMENT 'Maximum amount per week',
    limit_per_month DECIMAL(12,2) COMMENT 'Maximum amount per month',
    limit_per_quarter DECIMAL(12,2) COMMENT 'Maximum amount per quarter',
    limit_per_year DECIMAL(12,2) COMMENT 'Maximum amount per year',

    -- Transaction Limits
    max_transactions_per_day INT COMMENT 'Maximum number of transactions per day',
    max_transactions_per_month INT COMMENT 'Maximum number of transactions per month',

    -- Mileage Limits (for Mileage type categories)
    max_km_per_day DECIMAL(10,2) COMMENT 'Maximum kilometers per day',
    max_km_per_month DECIMAL(10,2) COMMENT 'Maximum kilometers per month',

    -- Override Settings
    allow_limit_override TINYINT(1) DEFAULT 0 COMMENT '1=Allow managers to override',
    override_approval_required TINYINT(1) DEFAULT 1 COMMENT '1=Requires special approval if limit exceeded',

    -- Effective Dates
    effective_from DATE COMMENT 'Limit effective from date',
    effective_to DATE COMMENT 'Limit effective to date (null = no end)',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit fields
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_limit_category FOREIGN KEY (category_id)
        REFERENCES hrms_expense_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_limit_location_group FOREIGN KEY (location_group_id)
        REFERENCES hrms_expense_location_groups(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_category (category_id),
    INDEX idx_location_group (location_group_id),
    INDEX idx_grade (grade_id),
    INDEX idx_department (department_id),
    INDEX idx_limit_type (limit_type),
    INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================

-- Table 3: hrms_expense_category_custom_fields
-- Custom fields configuration per category
CREATE TABLE IF NOT EXISTS hrms_expense_category_custom_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',

    -- Field Configuration
    field_name VARCHAR(100) NOT NULL COMMENT 'Internal field name (snake_case)',
    field_label VARCHAR(100) NOT NULL COMMENT 'Display label',
    field_type ENUM('Text', 'Number', 'Date', 'DateTime', 'Dropdown', 'MultiSelect', 'File', 'Checkbox', 'TextArea') NOT NULL,
    field_placeholder VARCHAR(200) COMMENT 'Placeholder text',
    field_description TEXT COMMENT 'Help text for the field',

    -- Validation
    is_required TINYINT(1) DEFAULT 0 COMMENT '1=Mandatory field',
    min_length INT COMMENT 'Minimum length for text fields',
    max_length INT COMMENT 'Maximum length for text fields',
    min_value DECIMAL(15,2) COMMENT 'Minimum value for number fields',
    max_value DECIMAL(15,2) COMMENT 'Maximum value for number fields',
    regex_pattern VARCHAR(500) COMMENT 'Regex validation pattern',

    -- Dropdown Options (JSON array for Dropdown/MultiSelect types)
    dropdown_options JSON COMMENT '[{"value": "opt1", "label": "Option 1"}, ...]',

    -- File Configuration (for File type)
    allowed_file_types VARCHAR(255) COMMENT 'Allowed extensions (e.g., "pdf,jpg,png")',
    max_file_size_mb INT DEFAULT 5 COMMENT 'Maximum file size in MB',

    -- Display
    display_order INT DEFAULT 0,
    show_in_list TINYINT(1) DEFAULT 0 COMMENT '1=Show in expense list view',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit fields
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_custom_field_category FOREIGN KEY (category_id)
        REFERENCES hrms_expense_categories(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_category (category_id),
    INDEX idx_field_name (field_name),
    UNIQUE INDEX idx_category_field_name (category_id, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================

-- Table 4: hrms_expense_category_filing_rules
-- Filing rules and restrictions per category
CREATE TABLE IF NOT EXISTS hrms_expense_category_filing_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',

    -- Date Restrictions
    allow_past_date_filing TINYINT(1) DEFAULT 1 COMMENT '1=Allow past date expenses',
    max_past_days INT DEFAULT 30 COMMENT 'Maximum days in past for filing',
    allow_future_date_filing TINYINT(1) DEFAULT 0 COMMENT '1=Allow future date expenses',
    max_future_days INT DEFAULT 0 COMMENT 'Maximum days in future for filing',

    -- Filing Window
    filing_window_start_day INT COMMENT 'Day of month filing window opens (1-31)',
    filing_window_end_day INT COMMENT 'Day of month filing window closes (1-31)',

    -- Frequency Restrictions
    min_gap_between_claims_days INT COMMENT 'Minimum days between two claims',
    max_claims_per_period INT COMMENT 'Maximum claims allowed',
    claims_period ENUM('Day', 'Week', 'Month', 'Quarter', 'Year') COMMENT 'Period for max_claims_per_period',

    -- Documentation Requirements
    require_project_code TINYINT(1) DEFAULT 0,
    require_cost_center TINYINT(1) DEFAULT 0,
    require_client_name TINYINT(1) DEFAULT 0,
    require_purpose_description TINYINT(1) DEFAULT 1,
    min_purpose_length INT DEFAULT 10 COMMENT 'Minimum characters for purpose',

    -- Auto-Approval Settings
    auto_approve_below_amount DECIMAL(10,2) COMMENT 'Auto-approve if amount below this',
    auto_approve_for_grades JSON COMMENT 'Grade IDs eligible for auto-approval',

    -- Holiday/Weekend Rules
    allow_weekend_expenses TINYINT(1) DEFAULT 1,
    allow_holiday_expenses TINYINT(1) DEFAULT 1,
    require_justification_for_holiday TINYINT(1) DEFAULT 1,

    -- Duplicate Detection
    check_duplicate_expenses TINYINT(1) DEFAULT 1,
    duplicate_check_fields JSON COMMENT '["amount", "date", "vendor"]',
    duplicate_check_days INT DEFAULT 7 COMMENT 'Days to check for duplicates',

    -- Audit fields
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_filing_rule_category FOREIGN KEY (category_id)
        REFERENCES hrms_expense_categories(id) ON DELETE CASCADE,

    -- Indexes
    UNIQUE INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data for Testing (Optional)
-- =====================================================

-- Uncomment below to insert sample data:
/*
-- Insert sample expense categories
INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, category_description, expense_type, receipt_required, is_active, created_by, display_order)
VALUES
(1, 'Travel', 'EXP-TRAVEL', 'Travel related expenses', 'Amount', 'Above_Limit', 1, 1, 1),
(1, 'Food & Meals', 'EXP-FOOD', 'Food and meal expenses', 'Amount', 'Above_Limit', 1, 1, 2),
(1, 'Accommodation', 'EXP-HOTEL', 'Hotel and lodging expenses', 'Amount', 'Always', 1, 1, 3),
(1, 'Local Conveyance', 'EXP-CONV', 'Local travel using personal vehicle', 'Mileage', 'Above_Limit', 1, 1, 4),
(1, 'Daily Allowance', 'EXP-DIEM', 'Per diem allowance for travel', 'Per_Diem', 'Never', 1, 1, 5);

-- Update mileage category with rate
UPDATE hrms_expense_categories
SET mileage_rate_per_km = 8.50, mileage_vehicle_type = 'Car'
WHERE category_code = 'EXP-CONV' AND company_id = 1;

-- Update per diem category with rate
UPDATE hrms_expense_categories
SET per_diem_rate = 1500.00, per_diem_half_day_rate = 750.00
WHERE category_code = 'EXP-DIEM' AND company_id = 1;

-- Insert sub-categories for Travel
INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, category_description, expense_type, parent_category_id, receipt_required, is_active, created_by, display_order)
SELECT 1, 'Air Travel', 'EXP-TRAVEL-AIR', 'Flight ticket expenses', 'Amount', id, 'Always', 1, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, category_description, expense_type, parent_category_id, receipt_required, is_active, created_by, display_order)
SELECT 1, 'Train Travel', 'EXP-TRAVEL-TRAIN', 'Train ticket expenses', 'Amount', id, 'Always', 1, 1, 2
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, category_description, expense_type, parent_category_id, receipt_required, is_active, created_by, display_order)
SELECT 1, 'Bus Travel', 'EXP-TRAVEL-BUS', 'Bus ticket expenses', 'Amount', id, 'Above_Limit', 1, 1, 3
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

-- Insert category limits (Global)
INSERT INTO hrms_expense_category_limits
(category_id, limit_type, limit_per_transaction, limit_per_day, limit_per_month, is_active, created_by)
SELECT id, 'Global', 50000, 100000, 500000, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

INSERT INTO hrms_expense_category_limits
(category_id, limit_type, limit_per_transaction, limit_per_day, limit_per_month, is_active, created_by)
SELECT id, 'Global', 2000, 5000, 50000, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-FOOD' AND company_id = 1;

INSERT INTO hrms_expense_category_limits
(category_id, limit_type, limit_per_transaction, limit_per_day, limit_per_month, is_active, created_by)
SELECT id, 'Global', 10000, 20000, 200000, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-HOTEL' AND company_id = 1;

INSERT INTO hrms_expense_category_limits
(category_id, limit_type, limit_per_transaction, limit_per_day, limit_per_month, max_km_per_day, max_km_per_month, is_active, created_by)
SELECT id, 'Global', 5000, 10000, 50000, 100, 2000, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-CONV' AND company_id = 1;

-- Insert custom fields for Travel
INSERT INTO hrms_expense_category_custom_fields
(category_id, field_name, field_label, field_type, is_required, is_active, created_by, display_order)
SELECT id, 'travel_from', 'Travel From', 'Text', 1, 1, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

INSERT INTO hrms_expense_category_custom_fields
(category_id, field_name, field_label, field_type, is_required, is_active, created_by, display_order)
SELECT id, 'travel_to', 'Travel To', 'Text', 1, 1, 1, 2
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

-- Insert custom fields for Local Conveyance (Mileage)
INSERT INTO hrms_expense_category_custom_fields
(category_id, field_name, field_label, field_type, is_required, regex_pattern, is_active, created_by, display_order)
SELECT id, 'vehicle_number', 'Vehicle Number', 'Text', 1, '^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$', 1, 1, 1
FROM hrms_expense_categories WHERE category_code = 'EXP-CONV' AND company_id = 1;

INSERT INTO hrms_expense_category_custom_fields
(category_id, field_name, field_label, field_type, is_required, dropdown_options, is_active, created_by, display_order)
SELECT id, 'trip_purpose', 'Trip Purpose', 'Dropdown', 1,
    '[{"value": "client_visit", "label": "Client Visit"}, {"value": "office_work", "label": "Office Work"}, {"value": "training", "label": "Training"}, {"value": "other", "label": "Other"}]',
    1, 1, 2
FROM hrms_expense_categories WHERE category_code = 'EXP-CONV' AND company_id = 1;

-- Insert filing rules
INSERT INTO hrms_expense_category_filing_rules
(category_id, allow_past_date_filing, max_past_days, require_purpose_description, check_duplicate_expenses, duplicate_check_fields, created_by)
SELECT id, 1, 30, 1, 1, '["amount", "date"]', 1
FROM hrms_expense_categories WHERE category_code = 'EXP-TRAVEL' AND company_id = 1;

INSERT INTO hrms_expense_category_filing_rules
(category_id, allow_past_date_filing, max_past_days, require_purpose_description, check_duplicate_expenses, duplicate_check_fields, created_by)
SELECT id, 1, 7, 1, 1, '["amount", "date"]', 1
FROM hrms_expense_categories WHERE category_code = 'EXP-FOOD' AND company_id = 1;

INSERT INTO hrms_expense_category_filing_rules
(category_id, allow_past_date_filing, max_past_days, require_purpose_description, check_duplicate_expenses, duplicate_check_fields, created_by)
SELECT id, 1, 30, 1, 1, '["amount", "date", "vendor"]', 1
FROM hrms_expense_categories WHERE category_code = 'EXP-HOTEL' AND company_id = 1;

INSERT INTO hrms_expense_category_filing_rules
(category_id, allow_past_date_filing, max_past_days, require_purpose_description, check_duplicate_expenses, duplicate_check_fields, created_by)
SELECT id, 1, 15, 1, 1, '["amount", "date"]', 1
FROM hrms_expense_categories WHERE category_code = 'EXP-CONV' AND company_id = 1;
*/

SELECT 'Expense Category tables created successfully!' AS result;
