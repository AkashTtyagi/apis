# Phase 2.2: General Settings - Implementation Prompt

## Overview
Implement General Settings module for the Expense Management system. This module provides system-wide configuration options for expense management including submission windows, date/time settings, mileage configuration, receipt requirements, violation detection rules, audit settings, and display preferences.

**Note:** Notification settings are handled in the Expense Workflow module, not in General Settings.

---

## Task Description

You are implementing the **General Settings** module for an HRMS Expense Management system. This module allows administrators to configure:
1. Submission window settings (when employees can submit expenses)
2. Date and time configurations
3. Distance and mileage settings
4. Receipt and document requirements
5. Violation detection and duplicate checking rules
6. Audit trail configuration
7. Display and format settings
8. Integration settings
9. Payment settings

**Note:** Notification settings are handled in the Expense Workflow configuration, not here.

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **None** (Independent configuration module)

---

## Database Schema

### Table 1: `hrms_expense_general_settings`
Company-wide general settings.

```sql
CREATE TABLE hrms_expense_general_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- =====================
  -- SUBMISSION WINDOW SETTINGS
  -- =====================

  -- Monthly Submission Window
  submission_window_enabled TINYINT(1) DEFAULT 0
    COMMENT '1=Restrict submission to specific window',
  submission_window_start_day INT DEFAULT 1
    COMMENT 'Day of month window opens (1-31)',
  submission_window_end_day INT DEFAULT 31
    COMMENT 'Day of month window closes (1-31)',

  -- Submission Cutoff
  submission_cutoff_enabled TINYINT(1) DEFAULT 0
    COMMENT '1=Enable monthly cutoff',
  submission_cutoff_day INT DEFAULT 5
    COMMENT 'Expenses for previous month must be submitted by this day',

  -- Lock Period
  lock_previous_month TINYINT(1) DEFAULT 0
    COMMENT '1=Lock expenses after month end + grace days',
  lock_grace_days INT DEFAULT 5
    COMMENT 'Days after month end before locking',

  -- =====================
  -- DATE & TIME SETTINGS
  -- =====================

  -- Fiscal Year
  fiscal_year_start_month INT DEFAULT 4
    COMMENT 'Month fiscal year starts (1-12, 4=April)',
  fiscal_year_start_day INT DEFAULT 1,

  -- Date Restrictions
  allow_past_dated_expenses TINYINT(1) DEFAULT 1,
  max_past_days INT DEFAULT 30
    COMMENT 'How far back expenses can be dated',
  allow_future_dated_expenses TINYINT(1) DEFAULT 0,
  max_future_days INT DEFAULT 0,

  -- Weekend/Holiday Settings
  allow_weekend_expenses TINYINT(1) DEFAULT 1,
  allow_holiday_expenses TINYINT(1) DEFAULT 1,
  require_justification_weekend TINYINT(1) DEFAULT 0,
  require_justification_holiday TINYINT(1) DEFAULT 1,

  -- Timezone
  default_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  use_employee_timezone TINYINT(1) DEFAULT 0
    COMMENT '1=Use employee location timezone',

  -- =====================
  -- DISTANCE & MILEAGE SETTINGS
  -- =====================

  -- Distance Unit
  distance_unit ENUM('Kilometer', 'Mile') DEFAULT 'Kilometer',

  -- Default Mileage Rates (can be overridden in categories)
  default_mileage_rate_car DECIMAL(10,2) DEFAULT 8.00,
  default_mileage_rate_bike DECIMAL(10,2) DEFAULT 4.00,
  default_mileage_rate_bicycle DECIMAL(10,2) DEFAULT 2.00,
  default_mileage_rate_public_transport DECIMAL(10,2) DEFAULT 0.00,

  -- Mileage Caps
  max_daily_mileage DECIMAL(10,2) DEFAULT 200.00,
  max_monthly_mileage DECIMAL(10,2) DEFAULT 3000.00,

  -- GPS/Map Integration
  require_gps_tracking TINYINT(1) DEFAULT 0,
  gps_tracking_mode ENUM('Optional', 'Required_Above_Limit', 'Always_Required') DEFAULT 'Optional',
  gps_required_above_km DECIMAL(10,2) DEFAULT 50.00,
  allow_manual_distance_entry TINYINT(1) DEFAULT 1,

  -- Route Verification
  enable_route_verification TINYINT(1) DEFAULT 0
    COMMENT '1=Verify distance using map API',
  route_tolerance_percentage DECIMAL(5,2) DEFAULT 20.00
    COMMENT 'Allowed variance from calculated route',

  -- =====================
  -- RECEIPT & DOCUMENT SETTINGS
  -- =====================

  -- Receipt Requirements
  receipt_required_above DECIMAL(10,2) DEFAULT 500.00
    COMMENT 'Receipt mandatory if amount exceeds this',
  receipt_always_required TINYINT(1) DEFAULT 0,
  receipt_never_required TINYINT(1) DEFAULT 0,

  -- Allowed File Types
  allowed_receipt_types VARCHAR(255) DEFAULT 'pdf,jpg,jpeg,png,gif,heic'
    COMMENT 'Comma-separated extensions',
  max_receipt_size_mb INT DEFAULT 10,
  max_receipts_per_item INT DEFAULT 5,

  -- OCR Settings
  enable_receipt_ocr TINYINT(1) DEFAULT 0
    COMMENT '1=Auto-extract data from receipts',
  ocr_auto_fill TINYINT(1) DEFAULT 1
    COMMENT '1=Auto-fill fields from OCR',

  -- Receipt Matching
  require_receipt_date_match TINYINT(1) DEFAULT 0
    COMMENT '1=Receipt date must match expense date',
  receipt_date_tolerance_days INT DEFAULT 3,

  -- Receipt Amount Matching
  require_receipt_amount_match TINYINT(1) DEFAULT 0,
  receipt_amount_tolerance_percentage DECIMAL(5,2) DEFAULT 10.00,

  -- =====================
  -- DUPLICATE DETECTION SETTINGS
  -- =====================

  -- Duplicate Check
  enable_duplicate_detection TINYINT(1) DEFAULT 1,
  duplicate_check_window_days INT DEFAULT 30
    COMMENT 'Days to look back for duplicates',

  -- Duplicate Criteria
  duplicate_check_amount TINYINT(1) DEFAULT 1
    COMMENT '1=Check same amount',
  duplicate_check_date TINYINT(1) DEFAULT 1
    COMMENT '1=Check same date',
  duplicate_check_category TINYINT(1) DEFAULT 1
    COMMENT '1=Check same category',
  duplicate_check_vendor TINYINT(1) DEFAULT 0
    COMMENT '1=Check same vendor',
  duplicate_check_receipt TINYINT(1) DEFAULT 1
    COMMENT '1=Check receipt hash for exact duplicates',

  -- Duplicate Amount Tolerance
  duplicate_amount_tolerance DECIMAL(10,2) DEFAULT 0.00
    COMMENT 'Amount difference to still consider duplicate',
  duplicate_amount_tolerance_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Duplicate Action
  duplicate_action ENUM('Warn', 'Block', 'Flag_For_Review') DEFAULT 'Warn',

  -- =====================
  -- VIOLATION SETTINGS
  -- =====================

  -- Policy Violation Action
  default_violation_action ENUM('Warn', 'Block', 'Require_Justification', 'Auto_Reject') DEFAULT 'Warn',

  -- Over-Limit Handling
  allow_over_limit_submission TINYINT(1) DEFAULT 1
    COMMENT '1=Allow submit even if over limit',
  over_limit_justification_required TINYINT(1) DEFAULT 1,
  over_limit_auto_flag TINYINT(1) DEFAULT 1
    COMMENT '1=Auto-flag for audit',

  -- Violation Notifications
  notify_employee_on_violation TINYINT(1) DEFAULT 1,
  notify_manager_on_violation TINYINT(1) DEFAULT 0,
  notify_finance_on_violation TINYINT(1) DEFAULT 0,

  -- =====================
  -- AUDIT SETTINGS
  -- =====================

  -- Audit Trail
  enable_detailed_audit_log TINYINT(1) DEFAULT 1,
  log_field_changes TINYINT(1) DEFAULT 1
    COMMENT '1=Log every field change',
  log_view_actions TINYINT(1) DEFAULT 0
    COMMENT '1=Log when records are viewed',

  -- Audit Sampling
  enable_audit_sampling TINYINT(1) DEFAULT 0
    COMMENT '1=Randomly flag expenses for audit',
  audit_sampling_percentage DECIMAL(5,2) DEFAULT 5.00,
  audit_sampling_min_amount DECIMAL(10,2) DEFAULT 1000.00,

  -- Audit Retention
  audit_log_retention_days INT DEFAULT 365
    COMMENT 'Days to retain detailed audit logs',

  -- =====================
  -- DISPLAY & FORMAT SETTINGS
  -- =====================
  -- NOTE: Notification settings are handled in Expense Workflow configuration
  -- Each workflow can have its own notification settings for submit, approve, reject, etc.

  -- Number Format
  number_format_locale VARCHAR(10) DEFAULT 'en-IN'
    COMMENT 'Locale for number formatting',
  decimal_places INT DEFAULT 2,

  -- Date Format
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format ENUM('12_Hour', '24_Hour') DEFAULT '12_Hour',
  datetime_format VARCHAR(30) DEFAULT 'DD/MM/YYYY hh:mm A',

  -- Display Preferences
  show_expense_id TINYINT(1) DEFAULT 1,
  expense_id_prefix VARCHAR(20) DEFAULT 'EXP',
  expense_id_format VARCHAR(50) DEFAULT '{PREFIX}-{YYYY}-{SEQUENCE}'
    COMMENT 'Format: EXP-2025-00001',
  sequence_reset_yearly TINYINT(1) DEFAULT 1,
  sequence_padding INT DEFAULT 5,

  -- Dashboard Settings
  dashboard_default_period ENUM('This_Week', 'This_Month', 'This_Quarter', 'This_Year') DEFAULT 'This_Month',
  dashboard_show_pending_count TINYINT(1) DEFAULT 1,
  dashboard_show_spending_chart TINYINT(1) DEFAULT 1,

  -- =====================
  -- INTEGRATION SETTINGS
  -- =====================

  -- Accounting Integration
  accounting_integration_enabled TINYINT(1) DEFAULT 0,
  accounting_system VARCHAR(50) COMMENT 'Tally, SAP, QuickBooks, etc.',
  auto_post_to_accounting TINYINT(1) DEFAULT 0,
  accounting_post_on ENUM('Approval', 'Payment') DEFAULT 'Payment',

  -- Bank Integration
  bank_integration_enabled TINYINT(1) DEFAULT 0,
  default_payment_method ENUM('Bank_Transfer', 'Cheque', 'Cash', 'Payroll') DEFAULT 'Bank_Transfer',

  -- Calendar Integration
  calendar_integration_enabled TINYINT(1) DEFAULT 0,
  sync_travel_to_calendar TINYINT(1) DEFAULT 0,

  -- =====================
  -- APPROVAL SETTINGS
  -- =====================

  -- Self-Approval
  allow_self_approval TINYINT(1) DEFAULT 0
    COMMENT '1=Allow users to approve their own expenses (for admins)',
  self_approval_roles JSON
    COMMENT 'Role IDs that can self-approve',
  self_approval_max_amount DECIMAL(12,2),

  -- Delegation
  allow_approval_delegation TINYINT(1) DEFAULT 1,
  max_delegation_days INT DEFAULT 30,
  require_delegation_reason TINYINT(1) DEFAULT 1,

  -- =====================
  -- PAYMENT SETTINGS
  -- =====================

  -- Payment Processing
  payment_processing_enabled TINYINT(1) DEFAULT 1,
  payment_batch_frequency ENUM('Daily', 'Weekly', 'Bi_Weekly', 'Monthly') DEFAULT 'Weekly',
  payment_batch_day INT DEFAULT 1
    COMMENT 'Day of week (1=Mon) or month',

  -- Minimum Payment
  min_payment_amount DECIMAL(10,2) DEFAULT 100.00
    COMMENT 'Hold payment if below this',
  accumulate_small_payments TINYINT(1) DEFAULT 1,

  -- Payment Modes
  available_payment_modes JSON DEFAULT '["Bank_Transfer", "Payroll"]',

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  UNIQUE INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_mileage_rates`
Custom mileage rates by vehicle type, location, and effective date.

```sql
CREATE TABLE hrms_expense_mileage_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Vehicle Type
  vehicle_type VARCHAR(50) NOT NULL
    COMMENT 'Car, Bike, Bicycle, Auto, etc.',
  vehicle_subtype VARCHAR(50)
    COMMENT 'Petrol, Diesel, Electric, etc.',

  -- Location (optional - for location-based rates)
  location_group_id INT COMMENT 'FK to hrms_expense_location_groups',

  -- Rate
  rate_per_unit DECIMAL(10,2) NOT NULL
    COMMENT 'Rate per km/mile',

  -- Effective Period
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_mileage_rate_location FOREIGN KEY (location_group_id)
    REFERENCES hrms_expense_location_groups(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_location_group (location_group_id),
  INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 3: `hrms_expense_per_diem_rates`
Per diem rates by location and travel type.

```sql
CREATE TABLE hrms_expense_per_diem_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Rate Name/Type
  rate_name VARCHAR(100) NOT NULL
    COMMENT 'e.g., Domestic Travel, International Travel',
  rate_code VARCHAR(50) NOT NULL,

  -- Location
  location_group_id INT COMMENT 'FK to hrms_expense_location_groups',
  country_id INT COMMENT 'For international per diem',

  -- Rates
  full_day_rate DECIMAL(10,2) NOT NULL,
  half_day_rate DECIMAL(10,2),
  breakfast_deduction DECIMAL(10,2) DEFAULT 0
    COMMENT 'Deduct if breakfast provided',
  lunch_deduction DECIMAL(10,2) DEFAULT 0,
  dinner_deduction DECIMAL(10,2) DEFAULT 0,

  -- Currency
  currency_id INT COMMENT 'FK to hrms_expense_currencies',

  -- Effective Period
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- Grade-Based Override (optional)
  applies_to_grades JSON COMMENT 'Grade IDs this rate applies to',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_rate_code (rate_code),
  INDEX idx_location_group (location_group_id),
  INDEX idx_country (country_id),
  INDEX idx_effective_dates (effective_from, effective_to),
  UNIQUE INDEX idx_company_rate_code (company_id, rate_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 4: `hrms_expense_tax_settings`
Tax configuration for expenses.

```sql
CREATE TABLE hrms_expense_tax_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Tax Identification
  tax_name VARCHAR(100) NOT NULL COMMENT 'e.g., GST, VAT, Service Tax',
  tax_code VARCHAR(20) NOT NULL,

  -- Tax Rate
  tax_percentage DECIMAL(5,2) NOT NULL,

  -- Applicability
  applies_to_categories JSON COMMENT 'Category IDs this tax applies to',

  -- Tax Treatment
  is_recoverable TINYINT(1) DEFAULT 0
    COMMENT '1=Tax can be claimed/recovered',
  include_in_expense_amount TINYINT(1) DEFAULT 1
    COMMENT '1=Tax is part of expense amount',

  -- Effective Period
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  UNIQUE INDEX idx_company_tax_code (company_id, tax_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 5: `hrms_expense_sequence_numbers`
Sequence number tracking for expense IDs.

```sql
CREATE TABLE hrms_expense_sequence_numbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Sequence Type
  sequence_type ENUM('Expense_Request', 'Advance_Request', 'Payment_Batch') NOT NULL,

  -- Current Values
  current_year INT NOT NULL,
  current_sequence INT NOT NULL DEFAULT 0,

  -- Format
  prefix VARCHAR(20),
  suffix VARCHAR(20),

  -- Audit fields
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  UNIQUE INDEX idx_company_type_year (company_id, sequence_type, current_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 6: `hrms_expense_settings_history`
Audit log for settings changes.

```sql
CREATE TABLE hrms_expense_settings_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Change Details
  setting_type ENUM('General', 'Mileage_Rate', 'Per_Diem_Rate', 'Tax') NOT NULL,
  setting_id INT NOT NULL COMMENT 'ID of the setting record',

  -- Field Changes
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,

  -- Change Reason
  change_reason TEXT,

  -- Audit
  changed_by INT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_setting_type_id (setting_type, setting_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Admin APIs

#### 1. Get General Settings
**Endpoint:** `POST /api/expense/admin/settings/general/get`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_settings": {
      "submission_window_enabled": false,
      "submission_window_start_day": 1,
      "submission_window_end_day": 31,
      "submission_cutoff_enabled": true,
      "submission_cutoff_day": 5,
      "lock_previous_month": true,
      "lock_grace_days": 5
    },
    "date_time_settings": {
      "fiscal_year_start_month": 4,
      "fiscal_year_start_day": 1,
      "allow_past_dated_expenses": true,
      "max_past_days": 30,
      "allow_future_dated_expenses": false,
      "max_future_days": 0,
      "allow_weekend_expenses": true,
      "allow_holiday_expenses": true,
      "require_justification_weekend": false,
      "require_justification_holiday": true,
      "default_timezone": "Asia/Kolkata"
    },
    "mileage_settings": {
      "distance_unit": "Kilometer",
      "default_rates": {
        "car": 8.00,
        "bike": 4.00,
        "bicycle": 2.00
      },
      "max_daily_mileage": 200.00,
      "max_monthly_mileage": 3000.00,
      "require_gps_tracking": false,
      "allow_manual_distance_entry": true
    },
    "receipt_settings": {
      "receipt_required_above": 500.00,
      "receipt_always_required": false,
      "allowed_receipt_types": ["pdf", "jpg", "jpeg", "png"],
      "max_receipt_size_mb": 10,
      "max_receipts_per_item": 5,
      "enable_receipt_ocr": false
    },
    "duplicate_settings": {
      "enable_duplicate_detection": true,
      "duplicate_check_window_days": 30,
      "duplicate_check_criteria": {
        "amount": true,
        "date": true,
        "category": true,
        "vendor": false,
        "receipt": true
      },
      "duplicate_action": "Warn"
    },
    "violation_settings": {
      "default_violation_action": "Warn",
      "allow_over_limit_submission": true,
      "over_limit_justification_required": true,
      "notify_employee_on_violation": true
    },
    "audit_settings": {
      "enable_detailed_audit_log": true,
      "log_field_changes": true,
      "enable_audit_sampling": false,
      "audit_log_retention_days": 365
    },
    "display_settings": {
      "number_format_locale": "en-IN",
      "decimal_places": 2,
      "date_format": "DD/MM/YYYY",
      "time_format": "12_Hour",
      "expense_id_prefix": "EXP",
      "expense_id_format": "{PREFIX}-{YYYY}-{SEQUENCE}"
    },
    "payment_settings": {
      "payment_processing_enabled": true,
      "payment_batch_frequency": "Weekly",
      "min_payment_amount": 100.00,
      "available_payment_modes": ["Bank_Transfer", "Payroll"]
    },
    "updated_at": "2025-11-13T10:00:00.000Z",
    "updated_by_name": "Admin User"
  }
}
```

---

#### 2. Update General Settings
**Endpoint:** `POST /api/expense/admin/settings/general/update`

**Request Body:**
```json
{
  "section": "submission_settings",
  "settings": {
    "submission_window_enabled": true,
    "submission_window_start_day": 1,
    "submission_window_end_day": 25,
    "submission_cutoff_enabled": true,
    "submission_cutoff_day": 5
  },
  "change_reason": "Enabling submission window for better month-end processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "section": "submission_settings",
    "changes": [
      {
        "field": "submission_window_enabled",
        "old_value": false,
        "new_value": true
      },
      {
        "field": "submission_window_end_day",
        "old_value": 31,
        "new_value": 25
      }
    ],
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

---

#### 3. Update All Settings (Bulk)
**Endpoint:** `POST /api/expense/admin/settings/general/update-all`

**Request Body:**
```json
{
  "submission_settings": {
    "submission_window_enabled": true,
    "submission_window_end_day": 25
  },
  "date_time_settings": {
    "max_past_days": 45
  },
  "receipt_settings": {
    "receipt_required_above": 1000
  },
  "change_reason": "Quarterly settings review"
}
```

---

#### 4. Reset Settings to Default
**Endpoint:** `POST /api/expense/admin/settings/general/reset`

**Request Body:**
```json
{
  "section": "duplicate_settings",
  "confirm": true
}
```

---

### Mileage Rate APIs

#### 5. Get Mileage Rates
**Endpoint:** `POST /api/expense/admin/settings/mileage-rates/list`

**Request Body:**
```json
{
  "vehicle_type": "Car",
  "include_inactive": false,
  "include_expired": false
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle_type": "Car",
      "vehicle_subtype": "Petrol",
      "location_group_id": null,
      "location_group_name": "Default (All Locations)",
      "rate_per_unit": 8.00,
      "unit": "Kilometer",
      "effective_from": "2025-01-01",
      "effective_to": null,
      "is_active": true
    },
    {
      "id": 2,
      "vehicle_type": "Car",
      "vehicle_subtype": "Petrol",
      "location_group_id": 1,
      "location_group_name": "Metro Cities Tier 1",
      "rate_per_unit": 10.00,
      "unit": "Kilometer",
      "effective_from": "2025-01-01",
      "effective_to": null,
      "is_active": true
    }
  ]
}
```

---

#### 6. Add/Update Mileage Rate
**Endpoint:** `POST /api/expense/admin/settings/mileage-rates/upsert`

**Request Body:**
```json
{
  "id": null,
  "vehicle_type": "Car",
  "vehicle_subtype": "Electric",
  "location_group_id": null,
  "rate_per_unit": 5.00,
  "effective_from": "2025-01-01",
  "effective_to": null,
  "is_active": true
}
```

---

#### 7. Delete Mileage Rate
**Endpoint:** `POST /api/expense/admin/settings/mileage-rates/delete`

**Request Body:**
```json
{
  "id": 3
}
```

---

#### 8. Get Effective Mileage Rate
**Endpoint:** `POST /api/expense/admin/settings/mileage-rates/get-effective`

**Request Body:**
```json
{
  "vehicle_type": "Car",
  "vehicle_subtype": "Petrol",
  "location_group_id": 1,
  "expense_date": "2025-11-13"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rate_id": 2,
    "rate_per_unit": 10.00,
    "unit": "Kilometer",
    "vehicle_type": "Car",
    "vehicle_subtype": "Petrol",
    "location_group_name": "Metro Cities Tier 1",
    "effective_from": "2025-01-01"
  }
}
```

---

### Per Diem Rate APIs

#### 9. Get Per Diem Rates
**Endpoint:** `POST /api/expense/admin/settings/per-diem-rates/list`

**Request Body:**
```json
{
  "location_group_id": null,
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
      "rate_name": "Domestic Travel - Standard",
      "rate_code": "PD-DOM-STD",
      "location_group_id": null,
      "location_group_name": "Default (All Locations)",
      "full_day_rate": 1500.00,
      "half_day_rate": 750.00,
      "meal_deductions": {
        "breakfast": 200.00,
        "lunch": 300.00,
        "dinner": 400.00
      },
      "currency": "INR",
      "effective_from": "2025-01-01",
      "is_active": true
    },
    {
      "id": 2,
      "rate_name": "Metro Cities",
      "rate_code": "PD-METRO",
      "location_group_id": 1,
      "location_group_name": "Metro Cities Tier 1",
      "full_day_rate": 2500.00,
      "half_day_rate": 1250.00,
      "currency": "INR",
      "effective_from": "2025-01-01",
      "is_active": true
    }
  ]
}
```

---

#### 10. Add/Update Per Diem Rate
**Endpoint:** `POST /api/expense/admin/settings/per-diem-rates/upsert`

**Request Body:**
```json
{
  "id": null,
  "rate_name": "International - US",
  "rate_code": "PD-INT-US",
  "location_group_id": null,
  "country_id": 2,
  "full_day_rate": 150.00,
  "half_day_rate": 75.00,
  "breakfast_deduction": 20.00,
  "lunch_deduction": 30.00,
  "dinner_deduction": 40.00,
  "currency_id": 2,
  "effective_from": "2025-01-01",
  "applies_to_grades": [1, 2, 3],
  "is_active": true
}
```

---

#### 11. Delete Per Diem Rate
**Endpoint:** `POST /api/expense/admin/settings/per-diem-rates/delete`

---

### Tax Settings APIs

#### 12. Get Tax Settings
**Endpoint:** `POST /api/expense/admin/settings/tax/list`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tax_name": "GST",
      "tax_code": "GST",
      "tax_percentage": 18.00,
      "applies_to_categories": [1, 2, 3],
      "is_recoverable": true,
      "include_in_expense_amount": true,
      "effective_from": "2025-01-01",
      "is_active": true
    }
  ]
}
```

---

#### 13. Add/Update Tax Setting
**Endpoint:** `POST /api/expense/admin/settings/tax/upsert`

---

#### 14. Delete Tax Setting
**Endpoint:** `POST /api/expense/admin/settings/tax/delete`

---

### Utility APIs

#### 15. Get Settings Dropdown Data
**Endpoint:** `POST /api/expense/admin/settings/dropdown`

**Response:**
```json
{
  "success": true,
  "data": {
    "distance_units": [
      {"value": "Kilometer", "label": "Kilometers (km)"},
      {"value": "Mile", "label": "Miles (mi)"}
    ],
    "vehicle_types": [
      {"value": "Car", "label": "Car"},
      {"value": "Bike", "label": "Bike/Motorcycle"},
      {"value": "Bicycle", "label": "Bicycle"},
      {"value": "Auto", "label": "Auto Rickshaw"},
      {"value": "Public_Transport", "label": "Public Transport"}
    ],
    "fuel_types": [
      {"value": "Petrol", "label": "Petrol"},
      {"value": "Diesel", "label": "Diesel"},
      {"value": "Electric", "label": "Electric"},
      {"value": "CNG", "label": "CNG"},
      {"value": "Hybrid", "label": "Hybrid"}
    ],
    "date_formats": [
      {"value": "DD/MM/YYYY", "label": "DD/MM/YYYY (31/12/2025)"},
      {"value": "MM/DD/YYYY", "label": "MM/DD/YYYY (12/31/2025)"},
      {"value": "YYYY-MM-DD", "label": "YYYY-MM-DD (2025-12-31)"},
      {"value": "DD-MMM-YYYY", "label": "DD-MMM-YYYY (31-Dec-2025)"}
    ],
    "timezones": [
      {"value": "Asia/Kolkata", "label": "India (IST)"},
      {"value": "America/New_York", "label": "US Eastern"},
      {"value": "Europe/London", "label": "UK (GMT/BST)"}
    ],
    "payment_frequencies": [
      {"value": "Daily", "label": "Daily"},
      {"value": "Weekly", "label": "Weekly"},
      {"value": "Bi_Weekly", "label": "Bi-Weekly"},
      {"value": "Monthly", "label": "Monthly"}
    ],
    "violation_actions": [
      {"value": "Warn", "label": "Warning Only"},
      {"value": "Block", "label": "Block Submission"},
      {"value": "Require_Justification", "label": "Require Justification"},
      {"value": "Auto_Reject", "label": "Auto Reject"}
    ],
    "location_groups": [...],
    "currencies": [...],
    "categories": [...]
  }
}
```

---

#### 16. Get Settings Change History
**Endpoint:** `POST /api/expense/admin/settings/history`

**Request Body:**
```json
{
  "setting_type": "General",
  "date_from": "2025-10-01",
  "date_to": "2025-11-30",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "setting_type": "General",
      "field_name": "submission_window_enabled",
      "old_value": "false",
      "new_value": "true",
      "change_reason": "Enabling submission window for better processing",
      "changed_by_name": "Admin User",
      "changed_at": "2025-11-13T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### 17. Validate Settings
**Endpoint:** `POST /api/expense/admin/settings/validate`

**Request Body:**
```json
{
  "section": "submission_settings",
  "settings": {
    "submission_window_start_day": 25,
    "submission_window_end_day": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "errors": [
      {
        "field": "submission_window",
        "message": "Window end day (5) cannot be before start day (25)"
      }
    ],
    "warnings": []
  }
}
```

---

#### 18. Get Next Expense ID Preview
**Endpoint:** `POST /api/expense/admin/settings/preview-expense-id`

**Request Body:**
```json
{
  "prefix": "EXP",
  "format": "{PREFIX}-{YYYY}-{SEQUENCE}",
  "padding": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preview": "EXP-2025-00156",
    "next_sequence": 156,
    "current_year": 2025
  }
}
```

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── ExpenseGeneralSettings.js
│       ├── ExpenseMileageRate.js
│       ├── ExpensePerDiemRate.js
│       ├── ExpenseTaxSettings.js
│       ├── ExpenseSequenceNumber.js
│       └── ExpenseSettingsHistory.js
│
└── microservices/
    └── expense/
        ├── controllers/
        │   └── admin/
        │       └── settings.controller.js
        ├── services/
        │   ├── settings.service.js
        │   ├── mileageRate.service.js
        │   ├── perDiemRate.service.js
        │   └── sequenceGenerator.service.js
        └── routes/
            └── admin.expense.routes.js
```

---

## Implementation Steps

### Step 1: Create Models (Day 1)
- ExpenseGeneralSettings (single row per company)
- ExpenseMileageRate
- ExpensePerDiemRate
- ExpenseTaxSettings
- ExpenseSequenceNumber
- ExpenseSettingsHistory

### Step 2: Create Services (Day 1-2)

**settings.service.js:**
- `getGeneralSettings(companyId)`
- `updateGeneralSettings(companyId, section, settings, userId)`
- `resetToDefault(companyId, section, userId)`
- `validateSettings(section, settings)`
- `getSettingsHistory(companyId, filters)`

**mileageRate.service.js:**
- `getMileageRates(companyId, filters)`
- `upsertMileageRate(companyId, data, userId)`
- `deleteMileageRate(id, userId)`
- `getEffectiveRate(vehicleType, locationGroupId, date)`

**perDiemRate.service.js:**
- `getPerDiemRates(companyId, filters)`
- `upsertPerDiemRate(companyId, data, userId)`
- `deletePerDiemRate(id, userId)`
- `getEffectiveRate(locationGroupId, countryId, date, gradeId)`

**sequenceGenerator.service.js:**
- `getNextExpenseId(companyId, type)`
- `formatExpenseId(prefix, year, sequence, format, padding)`

### Step 3: Create Controller & Routes (Day 2-3)

### Step 4: Initialize Default Settings (Day 3)
- Create migration to insert default settings for existing companies
- Hook to create settings when new company is created

### Step 5: Testing (Day 3-4)
- Settings CRUD
- Rate effective date logic
- Sequence generation
- Settings validation
- History logging

---

## Default Values

When a new company is created, initialize with these defaults:

```javascript
const defaultSettings = {
  // Submission
  submission_window_enabled: false,
  submission_cutoff_enabled: false,

  // Date/Time
  fiscal_year_start_month: 4,
  max_past_days: 30,
  allow_weekend_expenses: true,
  default_timezone: 'Asia/Kolkata',

  // Mileage
  distance_unit: 'Kilometer',
  default_mileage_rate_car: 8.00,
  default_mileage_rate_bike: 4.00,
  max_daily_mileage: 200.00,

  // Receipt
  receipt_required_above: 500.00,
  allowed_receipt_types: 'pdf,jpg,jpeg,png',
  max_receipt_size_mb: 10,

  // Duplicate
  enable_duplicate_detection: true,
  duplicate_check_window_days: 30,
  duplicate_action: 'Warn',

  // Violation
  default_violation_action: 'Warn',
  allow_over_limit_submission: true,

  // Audit
  enable_detailed_audit_log: true,
  audit_log_retention_days: 365,

  // Display
  date_format: 'DD/MM/YYYY',
  expense_id_prefix: 'EXP',
  expense_id_format: '{PREFIX}-{YYYY}-{SEQUENCE}',

  // Payment
  payment_batch_frequency: 'Weekly',
  min_payment_amount: 100.00
};
```

---

## Success Criteria

### Technical:
- All settings APIs working
- Settings properly isolated by company
- Mileage/Per Diem rate effective date logic
- Expense ID sequence generation
- Settings change audit trail

### Functional:
- Admin can configure all expense settings
- Rate lookups return correct effective rate
- Settings validation prevents invalid configurations
- Sequence numbers unique and sequential
- Settings history viewable

---

**Estimated Duration:** 3-4 days
**Priority:** Medium
**Dependencies:** None (Independent module)
