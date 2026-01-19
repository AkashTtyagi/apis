# Phase 1.2: Expense Category Management - Implementation Prompt

## Overview
Implement Expense Category Management module for the Expense Management system. This module allows admins to configure expense categories with different expense types (Amount, Mileage, Per Diem, Time-based), set expense limits (global and location-based), configure custom fields, and define filing rules.

---

## Task Description

You are implementing the **Expense Category Management** module for an HRMS Expense Management system. This module allows administrators to:
1. Create and manage expense categories (Travel, Food, Accommodation, Mileage, etc.)
2. Configure different expense types (Amount-based, Mileage-based, Per Diem, Time-based)
3. Set expense limits at global and location-based levels
4. Add custom fields per category for additional data capture
5. Define filing rules (date restrictions, documentation requirements)

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **Phase 1.1:** Location Group Management (for location-based limits)

---

## Database Schema

### Table 1: `hrms_expense_categories`
Main expense categories table.

```sql
CREATE TABLE hrms_expense_categories (
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
  expense_type ENUM('Amount', 'Mileage', 'Per Diem', 'Time_Based') NOT NULL DEFAULT 'Amount'
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
  UNIQUE INDEX idx_company_category_code (company_id, category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_category_limits`
Global and location-based expense limits.

```sql
CREATE TABLE hrms_expense_category_limits (
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
```

---

### Table 3: `hrms_expense_category_custom_fields`
Custom fields configuration per category.

```sql
CREATE TABLE hrms_expense_category_custom_fields (
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
```

---

### Table 4: `hrms_expense_category_filing_rules`
Filing rules and restrictions per category.

```sql
CREATE TABLE hrms_expense_category_filing_rules (
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
```

---

## API Endpoints

### Admin APIs

#### 1. Create Expense Category
**Endpoint:** `POST /api/expense/admin/categories/create`

**Request Body:**
```json
{
  "category_name": "Local Travel",
  "category_code": "EXP-TRAVEL-LOCAL",
  "category_description": "Local travel expenses within city",
  "category_icon": "car",
  "parent_category_id": null,
  "expense_type": "Mileage",
  "mileage_rate_per_km": 8.50,
  "mileage_vehicle_type": "Car",
  "receipt_required": "Above_Limit",
  "receipt_required_above": 500,
  "is_taxable": false,
  "display_order": 1,
  "is_active": true,
  "limits": [
    {
      "limit_type": "Global",
      "limit_per_transaction": 5000,
      "limit_per_day": 10000,
      "limit_per_month": 50000,
      "max_km_per_day": 100,
      "max_km_per_month": 2000
    },
    {
      "limit_type": "Location_Based",
      "location_group_id": 1,
      "limit_per_transaction": 7500,
      "limit_per_day": 15000,
      "limit_per_month": 75000
    }
  ],
  "custom_fields": [
    {
      "field_name": "vehicle_number",
      "field_label": "Vehicle Number",
      "field_type": "Text",
      "is_required": true,
      "max_length": 20,
      "regex_pattern": "^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"
    },
    {
      "field_name": "trip_purpose",
      "field_label": "Trip Purpose",
      "field_type": "Dropdown",
      "is_required": true,
      "dropdown_options": [
        {"value": "client_visit", "label": "Client Visit"},
        {"value": "office_work", "label": "Office Work"},
        {"value": "training", "label": "Training"},
        {"value": "other", "label": "Other"}
      ]
    }
  ],
  "filing_rules": {
    "allow_past_date_filing": true,
    "max_past_days": 30,
    "allow_future_date_filing": false,
    "require_purpose_description": true,
    "min_purpose_length": 20,
    "check_duplicate_expenses": true,
    "duplicate_check_days": 7
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense category created successfully",
  "data": {
    "id": 1,
    "category_name": "Local Travel",
    "category_code": "EXP-TRAVEL-LOCAL",
    "expense_type": "Mileage",
    "limits_count": 2,
    "custom_fields_count": 2,
    "is_active": true,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

**Validations:**
- category_name is required, max 100 characters
- category_code is required, unique per company, max 50 characters
- expense_type must be one of: Amount, Mileage, Per_Diem, Time_Based
- If expense_type is Mileage, mileage_rate_per_km is required
- If expense_type is Per_Diem, per_diem_rate is required
- If expense_type is Time_Based, hourly_rate is required
- Custom field names must be unique within category
- Duplicate category_code should return 400 error

---

#### 2. Get All Expense Categories
**Endpoint:** `POST /api/expense/admin/categories/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "Travel",
  "expense_type": "Mileage",
  "parent_category_id": null,
  "include_children": true,
  "limit": 50,
  "offset": 0,
  "sort_by": "display_order",
  "sort_order": "asc"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_name": "Local Travel",
      "category_code": "EXP-TRAVEL-LOCAL",
      "category_description": "Local travel expenses within city",
      "category_icon": "car",
      "expense_type": "Mileage",
      "mileage_rate_per_km": 8.50,
      "parent_category_id": null,
      "is_active": true,
      "limits_count": 2,
      "custom_fields_count": 2,
      "display_order": 1,
      "children": [],
      "created_at": "2025-11-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "total_pages": 1,
    "current_page": 1
  }
}
```

---

#### 3. Get Category Details
**Endpoint:** `POST /api/expense/admin/categories/details`

**Request Body:**
```json
{
  "category_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category_name": "Local Travel",
    "category_code": "EXP-TRAVEL-LOCAL",
    "category_description": "Local travel expenses within city",
    "category_icon": "car",
    "parent_category_id": null,
    "parent_category": null,
    "expense_type": "Mileage",
    "mileage_rate_per_km": 8.50,
    "mileage_vehicle_type": "Car",
    "receipt_required": "Above_Limit",
    "receipt_required_above": 500,
    "is_taxable": false,
    "display_order": 1,
    "is_active": true,
    "limits": [
      {
        "id": 1,
        "limit_type": "Global",
        "location_group_id": null,
        "location_group_name": null,
        "limit_per_transaction": 5000,
        "limit_per_day": 10000,
        "limit_per_month": 50000,
        "max_km_per_day": 100,
        "max_km_per_month": 2000,
        "is_active": true
      },
      {
        "id": 2,
        "limit_type": "Location_Based",
        "location_group_id": 1,
        "location_group_name": "Metro Cities Tier 1",
        "limit_per_transaction": 7500,
        "limit_per_day": 15000,
        "limit_per_month": 75000,
        "is_active": true
      }
    ],
    "custom_fields": [
      {
        "id": 1,
        "field_name": "vehicle_number",
        "field_label": "Vehicle Number",
        "field_type": "Text",
        "is_required": true,
        "max_length": 20,
        "regex_pattern": "^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$",
        "display_order": 0,
        "is_active": true
      },
      {
        "id": 2,
        "field_name": "trip_purpose",
        "field_label": "Trip Purpose",
        "field_type": "Dropdown",
        "is_required": true,
        "dropdown_options": [
          {"value": "client_visit", "label": "Client Visit"},
          {"value": "office_work", "label": "Office Work"},
          {"value": "training", "label": "Training"},
          {"value": "other", "label": "Other"}
        ],
        "display_order": 1,
        "is_active": true
      }
    ],
    "filing_rules": {
      "id": 1,
      "allow_past_date_filing": true,
      "max_past_days": 30,
      "allow_future_date_filing": false,
      "max_future_days": 0,
      "require_purpose_description": true,
      "min_purpose_length": 20,
      "check_duplicate_expenses": true,
      "duplicate_check_days": 7
    },
    "children": [],
    "created_by": 1,
    "created_at": "2025-11-13T10:00:00.000Z",
    "updated_by": null,
    "updated_at": null
  }
}
```

---

#### 4. Update Expense Category
**Endpoint:** `POST /api/expense/admin/categories/update`

**Request Body:**
```json
{
  "category_id": 1,
  "category_name": "Local Travel - Updated",
  "category_description": "Updated description",
  "mileage_rate_per_km": 9.00,
  "receipt_required": "Always",
  "is_active": true,
  "limits": [
    {
      "id": 1,
      "limit_type": "Global",
      "limit_per_transaction": 6000,
      "limit_per_day": 12000,
      "limit_per_month": 60000
    }
  ],
  "custom_fields": [
    {
      "id": 1,
      "field_label": "Vehicle Registration Number",
      "is_required": true
    }
  ],
  "filing_rules": {
    "max_past_days": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense category updated successfully",
  "data": {
    "id": 1,
    "category_name": "Local Travel - Updated",
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

**Notes:**
- category_code cannot be updated once created
- expense_type cannot be changed if expenses exist for this category
- Updating limits/custom_fields: provide ID to update, omit ID to create new, omit entirely to delete

---

#### 5. Delete Expense Category
**Endpoint:** `POST /api/expense/admin/categories/delete`

**Request Body:**
```json
{
  "category_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense category deleted successfully"
}
```

**Validations:**
- Check if category has any expense requests filed
- If expenses exist, return error: "Cannot delete category as expenses have been filed under it"
- Check if category has child categories
- If children exist, return error: "Cannot delete category as it has sub-categories"
- Soft delete (set deleted_at, deleted_by)

---

#### 6. Get Category Dropdown Data
**Endpoint:** `POST /api/expense/admin/categories/dropdown`

**Request Body:**
```json
{
  "include_inactive": false,
  "expense_type": "Mileage"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Local Travel",
        "code": "EXP-TRAVEL-LOCAL",
        "expense_type": "Mileage",
        "parent_id": null
      }
    ],
    "expense_types": [
      {"value": "Amount", "label": "Amount Based"},
      {"value": "Mileage", "label": "Mileage Based"},
      {"value": "Per_Diem", "label": "Per Diem"},
      {"value": "Time_Based", "label": "Time Based"}
    ],
    "receipt_options": [
      {"value": "Always", "label": "Always Required"},
      {"value": "Above_Limit", "label": "Above Limit"},
      {"value": "Never", "label": "Never Required"}
    ],
    "field_types": [
      {"value": "Text", "label": "Text"},
      {"value": "Number", "label": "Number"},
      {"value": "Date", "label": "Date"},
      {"value": "DateTime", "label": "Date & Time"},
      {"value": "Dropdown", "label": "Dropdown"},
      {"value": "MultiSelect", "label": "Multi Select"},
      {"value": "File", "label": "File Upload"},
      {"value": "Checkbox", "label": "Checkbox"},
      {"value": "TextArea", "label": "Text Area"}
    ],
    "location_groups": [
      {"id": 1, "name": "Metro Cities Tier 1", "code": "LOC-METRO-T1"}
    ],
    "grades": [
      {"id": 1, "name": "Manager", "code": "MGR"}
    ],
    "departments": [
      {"id": 1, "name": "Sales", "code": "SALES"}
    ]
  }
}
```

---

#### 7. Manage Category Limits
**Endpoint:** `POST /api/expense/admin/categories/limits/manage`

**Request Body (Add/Update Limit):**
```json
{
  "category_id": 1,
  "action": "upsert",
  "limit": {
    "id": null,
    "limit_type": "Grade_Based",
    "grade_id": 2,
    "limit_per_transaction": 10000,
    "limit_per_day": 20000,
    "limit_per_month": 100000,
    "effective_from": "2025-01-01",
    "effective_to": null,
    "is_active": true
  }
}
```

**Request Body (Delete Limit):**
```json
{
  "category_id": 1,
  "action": "delete",
  "limit_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category limit updated successfully",
  "data": {
    "id": 3,
    "limit_type": "Grade_Based",
    "grade_id": 2
  }
}
```

---

#### 8. Manage Custom Fields
**Endpoint:** `POST /api/expense/admin/categories/custom-fields/manage`

**Request Body (Add/Update Field):**
```json
{
  "category_id": 1,
  "action": "upsert",
  "field": {
    "id": null,
    "field_name": "client_name",
    "field_label": "Client Name",
    "field_type": "Text",
    "is_required": false,
    "max_length": 100,
    "display_order": 3
  }
}
```

**Request Body (Delete Field):**
```json
{
  "category_id": 1,
  "action": "delete",
  "field_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom field added successfully",
  "data": {
    "id": 3,
    "field_name": "client_name",
    "field_label": "Client Name"
  }
}
```

---

#### 9. Update Filing Rules
**Endpoint:** `POST /api/expense/admin/categories/filing-rules/update`

**Request Body:**
```json
{
  "category_id": 1,
  "filing_rules": {
    "allow_past_date_filing": true,
    "max_past_days": 60,
    "allow_future_date_filing": false,
    "require_project_code": true,
    "require_cost_center": true,
    "auto_approve_below_amount": 1000,
    "check_duplicate_expenses": true,
    "duplicate_check_fields": ["amount", "date", "vendor"],
    "duplicate_check_days": 14
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Filing rules updated successfully",
  "data": {
    "category_id": 1,
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

---

#### 10. Clone Category
**Endpoint:** `POST /api/expense/admin/categories/clone`

**Request Body:**
```json
{
  "source_category_id": 1,
  "new_category_name": "Outstation Travel",
  "new_category_code": "EXP-TRAVEL-OUT",
  "include_limits": true,
  "include_custom_fields": true,
  "include_filing_rules": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category cloned successfully",
  "data": {
    "id": 2,
    "category_name": "Outstation Travel",
    "category_code": "EXP-TRAVEL-OUT",
    "created_at": "2025-11-13T12:00:00.000Z"
  }
}
```

---

#### 11. Reorder Categories
**Endpoint:** `POST /api/expense/admin/categories/reorder`

**Request Body:**
```json
{
  "category_orders": [
    {"category_id": 1, "display_order": 1},
    {"category_id": 2, "display_order": 2},
    {"category_id": 3, "display_order": 3}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categories reordered successfully"
}
```

---

#### 12. Get Category Hierarchy
**Endpoint:** `POST /api/expense/admin/categories/hierarchy`

**Request Body:**
```json
{
  "include_inactive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_name": "Travel",
      "category_code": "EXP-TRAVEL",
      "expense_type": "Amount",
      "is_active": true,
      "children": [
        {
          "id": 2,
          "category_name": "Local Travel",
          "category_code": "EXP-TRAVEL-LOCAL",
          "expense_type": "Mileage",
          "is_active": true,
          "children": []
        },
        {
          "id": 3,
          "category_name": "Outstation Travel",
          "category_code": "EXP-TRAVEL-OUT",
          "expense_type": "Amount",
          "is_active": true,
          "children": []
        }
      ]
    },
    {
      "id": 4,
      "category_name": "Food & Meals",
      "category_code": "EXP-FOOD",
      "expense_type": "Amount",
      "is_active": true,
      "children": []
    }
  ]
}
```

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── index.js (add new exports)
│       ├── ExpenseLocationGroup.js (existing)
│       ├── ExpenseLocationGroupMapping.js (existing)
│       ├── ExpenseCategory.js (new)
│       ├── ExpenseCategoryLimit.js (new)
│       ├── ExpenseCategoryCustomField.js (new)
│       └── ExpenseCategoryFilingRule.js (new)
│
└── microservices/
    └── expense/
        ├── controllers/
        │   └── admin/
        │       ├── locationGroup.controller.js (existing)
        │       └── expenseCategory.controller.js (new)
        ├── services/
        │   ├── locationGroup.service.js (existing)
        │   └── expenseCategory.service.js (new)
        └── routes/
            └── admin.expense.routes.js (update with new routes)
```

---

## Implementation Steps

### Step 1: Create Sequelize Models (Day 1-2)

**File:** `src/models/expense/ExpenseCategory.js`
- Main category model with all type-specific fields
- Self-referential association for parent_category_id

**File:** `src/models/expense/ExpenseCategoryLimit.js`
- Limits model with scope types (Global, Location, Grade, Department)
- Association with ExpenseCategory and ExpenseLocationGroup

**File:** `src/models/expense/ExpenseCategoryCustomField.js`
- Custom fields model with validation configuration
- JSON field for dropdown_options

**File:** `src/models/expense/ExpenseCategoryFilingRule.js`
- Filing rules model (one-to-one with category)
- JSON fields for array configurations

**Define Associations in index.js:**
```javascript
// Category -> Limits (one-to-many)
ExpenseCategory.hasMany(ExpenseCategoryLimit, {
  foreignKey: 'category_id',
  as: 'limits'
});

// Category -> Custom Fields (one-to-many)
ExpenseCategory.hasMany(ExpenseCategoryCustomField, {
  foreignKey: 'category_id',
  as: 'customFields'
});

// Category -> Filing Rules (one-to-one)
ExpenseCategory.hasOne(ExpenseCategoryFilingRule, {
  foreignKey: 'category_id',
  as: 'filingRules'
});

// Category -> Parent (self-reference)
ExpenseCategory.belongsTo(ExpenseCategory, {
  foreignKey: 'parent_category_id',
  as: 'parent'
});

ExpenseCategory.hasMany(ExpenseCategory, {
  foreignKey: 'parent_category_id',
  as: 'children'
});

// Limit -> Location Group
ExpenseCategoryLimit.belongsTo(ExpenseLocationGroup, {
  foreignKey: 'location_group_id',
  as: 'locationGroup'
});
```

---

### Step 2: Create Service Layer (Day 2-4)

**File:** `src/microservices/expense/services/expenseCategory.service.js`

Implement all business logic:
- `createCategory` - Create category with limits, custom fields, filing rules (transaction)
- `getAllCategories` - Get all categories with filters, pagination, children
- `getCategoryDetails` - Get full category details with all associations
- `updateCategory` - Update category and related entities
- `deleteCategory` - Check dependencies, soft delete
- `getCategoryDropdownData` - Get all dropdown data needed for forms
- `manageCategoryLimits` - Add/update/delete limits
- `manageCustomFields` - Add/update/delete custom fields
- `updateFilingRules` - Update filing rules
- `cloneCategory` - Clone category with selected components
- `reorderCategories` - Update display order
- `getCategoryHierarchy` - Get hierarchical category tree

---

### Step 3: Create Controller (Day 4-5)

**File:** `src/microservices/expense/controllers/admin/expenseCategory.controller.js`

Implement all controller methods following thin controller pattern:
- `createCategory`
- `getAllCategories`
- `getCategoryDetails`
- `updateCategory`
- `deleteCategory`
- `getCategoryDropdownData`
- `manageCategoryLimits`
- `manageCustomFields`
- `updateFilingRules`
- `cloneCategory`
- `reorderCategories`
- `getCategoryHierarchy`

---

### Step 4: Update Routes (Day 5)

**File:** `src/microservices/expense/routes/admin.expense.routes.js`

Add new routes:
```javascript
// Category Management
router.post('/categories/create', categoryController.createCategory);
router.post('/categories/list', categoryController.getAllCategories);
router.post('/categories/details', categoryController.getCategoryDetails);
router.post('/categories/update', categoryController.updateCategory);
router.post('/categories/delete', categoryController.deleteCategory);
router.post('/categories/dropdown', categoryController.getCategoryDropdownData);
router.post('/categories/limits/manage', categoryController.manageCategoryLimits);
router.post('/categories/custom-fields/manage', categoryController.manageCustomFields);
router.post('/categories/filing-rules/update', categoryController.updateFilingRules);
router.post('/categories/clone', categoryController.cloneCategory);
router.post('/categories/reorder', categoryController.reorderCategories);
router.post('/categories/hierarchy', categoryController.getCategoryHierarchy);
```

---

### Step 5: Create SQL Migration (Day 5-6)

**File:** `scripts/sql/expense/002_create_expense_categories.sql`

- Create all four tables with proper indexes
- Add foreign key constraints
- Include sample data for testing

---

### Step 6: Testing (Day 6-7)

#### Test Cases:

**Category CRUD:**
1. Create category with all expense types (Amount, Mileage, Per Diem, Time Based)
2. Create category with duplicate code (should fail)
3. Create sub-category with parent
4. Get all categories with filters
5. Get category details with all associations
6. Update category basic info
7. Delete unused category
8. Delete category with expenses (should fail)
9. Delete category with children (should fail)

**Limits:**
10. Add global limit to category
11. Add location-based limit
12. Add grade-based limit
13. Update existing limit
14. Delete limit

**Custom Fields:**
15. Add text custom field
16. Add dropdown custom field with options
17. Add file upload field
18. Update custom field
19. Delete custom field

**Filing Rules:**
20. Update filing rules
21. Test date restriction logic
22. Test duplicate detection settings

**Special Operations:**
23. Clone category with all components
24. Reorder categories
25. Get category hierarchy

---

## Integration Points

### HRMS Tables Used:
1. `hrms_company` - For company_id filtering
2. `hrms_users` - For created_by, updated_by
3. `hrms_grades` - For grade-based limits
4. `hrms_departments` - For department-based limits
5. `hrms_expense_location_groups` - For location-based limits (Phase 1.1)

### Authentication:
- Use existing JWT authentication middleware
- Check user role (admin only for all APIs)
- Get company_id from req.user

---

## Success Criteria

### Technical:
- All APIs working with proper validation
- Database schema created with proper indexes and constraints
- Sequelize models with correct associations
- Transaction support for complex operations
- Audit trail (created_by, updated_by, timestamps)
- Soft delete implementation
- Error handling and proper status codes

### Functional:
- Admin can create categories with all expense types
- Admin can configure limits at multiple levels (global, location, grade, department)
- Admin can add custom fields with various types
- Admin can configure filing rules
- Categories support hierarchy (parent-child)
- Category clone functionality works
- Cannot delete category with expenses or children

---

## Sample Data for Testing

```sql
-- Insert sample expense categories
INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, expense_type, receipt_required, is_active, created_by, display_order)
VALUES
(1, 'Travel', 'EXP-TRAVEL', 'Amount', 'Above_Limit', 1, 1, 1),
(1, 'Food & Meals', 'EXP-FOOD', 'Amount', 'Above_Limit', 1, 1, 2),
(1, 'Accommodation', 'EXP-HOTEL', 'Amount', 'Always', 1, 1, 3),
(1, 'Local Conveyance', 'EXP-CONV', 'Mileage', 'Above_Limit', 1, 1, 4),
(1, 'Daily Allowance', 'EXP-DIEM', 'Per_Diem', 'Never', 1, 1, 5);

-- Insert sub-categories
INSERT INTO hrms_expense_categories
(company_id, category_name, category_code, expense_type, parent_category_id, receipt_required, is_active, created_by)
VALUES
(1, 'Air Travel', 'EXP-TRAVEL-AIR', 'Amount', 1, 'Always', 1, 1),
(1, 'Train Travel', 'EXP-TRAVEL-TRAIN', 'Amount', 1, 'Always', 1, 1),
(1, 'Bus Travel', 'EXP-TRAVEL-BUS', 'Amount', 1, 'Above_Limit', 1, 1);

-- Insert category limits
INSERT INTO hrms_expense_category_limits
(category_id, limit_type, limit_per_transaction, limit_per_day, limit_per_month, is_active, created_by)
VALUES
(1, 'Global', 50000, 100000, 500000, 1, 1),
(2, 'Global', 2000, 5000, 50000, 1, 1),
(3, 'Global', 10000, 20000, 200000, 1, 1);

-- Insert custom field
INSERT INTO hrms_expense_category_custom_fields
(category_id, field_name, field_label, field_type, is_required, is_active, created_by)
VALUES
(1, 'travel_from', 'Travel From', 'Text', 1, 1, 1),
(1, 'travel_to', 'Travel To', 'Text', 1, 1, 1);

-- Insert filing rules
INSERT INTO hrms_expense_category_filing_rules
(category_id, allow_past_date_filing, max_past_days, require_purpose_description, check_duplicate_expenses, created_by)
VALUES
(1, 1, 30, 1, 1, 1),
(2, 1, 7, 1, 1, 1),
(3, 1, 30, 1, 1, 1);
```

---

## Notes

- Keep code modular for future microservice extraction
- Follow existing HRMS coding standards
- Use transactions for create/update operations with related entities
- Log all changes for audit trail
- Handle errors gracefully with meaningful messages
- Validate expense_type specific fields based on type selected
- Location-based limits depend on Phase 1.1 (Location Groups)
- Custom field values will be stored in expense request table as JSON

---

**Estimated Duration:** 5-7 days
**Priority:** High
**Dependencies:** Phase 1.1 - Location Group Management
