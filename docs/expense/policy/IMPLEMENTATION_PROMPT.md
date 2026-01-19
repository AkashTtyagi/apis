# Phase 2.1: Expense Policy Management - Implementation Prompt

## Overview
Implement Expense Policy Management module for the Expense Management system. This is the core policy engine that allows admins to create expense policies with applicability rules, category-wise limits, overall spending caps, expense-specific approval workflows, and post-submission controls.

---

## Task Description

You are implementing the **Expense Policy Management** module for an HRMS Expense Management system. This module allows administrators to:
1. Create expense policies with multi-select applicability rules (multiple Departments, Grades, Locations, etc.)
2. Map expense categories to policies with category-specific limits
3. Set overall spending caps (daily, weekly, monthly, yearly)
4. Configure expense-specific approval workflows (separate from HRMS workflow)
5. Support partial approval (individual line items can be approved/rejected independently)
6. Define post-submission controls and violation handling

---

## Key Design Decisions

### 1. Multi-Select Applicability
- One applicability rule can include multiple departments, grades, etc.
- Uses JSON arrays for storing multiple IDs
- Supports both Include and Exclude logic

### 2. Expense-Specific Workflow Engine
- **NOT using HRMS workflow engine** - Expense has its own approval workflow
- Each expense line item can be approved/rejected independently
- Partial approval supported (approved items get processed, rejected items don't)
- Category-specific approvers possible

### 3. Expense Request Structure
```
Expense Request (Header)
├── Line Item 1 (Category: Travel) → Approved → ₹5,000
├── Line Item 2 (Category: Food) → Approved → ₹2,000
├── Line Item 3 (Category: Hotel) → Rejected → ₹0
└── Line Item 4 (Category: Misc) → Pending → ₹0
                                   ─────────────────
                        Payable Amount: ₹7,000 (only approved items)
```

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **Phase 1.1:** Location Group Management
- **Phase 1.2:** Expense Category Management
- **HRMS Core:** Employee, Department, Grade, Designation (for applicability)

---

## Database Schema

### Table 1: `hrms_expense_policies`
Main expense policy table.

```sql
CREATE TABLE hrms_expense_policies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Basic Information
  policy_name VARCHAR(150) NOT NULL COMMENT 'Name of the policy',
  policy_code VARCHAR(50) NOT NULL COMMENT 'Unique code for the policy',
  policy_description TEXT COMMENT 'Detailed description of the policy',

  -- Policy Type
  policy_type ENUM('Standard', 'Travel', 'Project', 'Client', 'Emergency') DEFAULT 'Standard',

  -- Effective Period
  effective_from DATE NOT NULL,
  effective_to DATE COMMENT 'null = no end date',

  -- Overall Spending Caps (across all categories combined)
  overall_limit_per_day DECIMAL(15,2) COMMENT 'Total expense limit per day',
  overall_limit_per_week DECIMAL(15,2),
  overall_limit_per_month DECIMAL(15,2),
  overall_limit_per_quarter DECIMAL(15,2),
  overall_limit_per_year DECIMAL(15,2),

  -- Advance Settings
  allow_advance_request TINYINT(1) DEFAULT 1,
  max_advance_percentage DECIMAL(5,2) DEFAULT 80.00,
  advance_settlement_days INT DEFAULT 15,

  -- Submission Settings
  allow_past_expense TINYINT(1) DEFAULT 1,
  max_past_days INT DEFAULT 30,
  allow_future_expense TINYINT(1) DEFAULT 0,
  max_future_days INT DEFAULT 0,

  -- Post-Submission Controls
  allow_edit_after_submit TINYINT(1) DEFAULT 0,
  edit_window_hours INT DEFAULT 24,
  allow_withdrawal TINYINT(1) DEFAULT 1,
  withdrawal_cutoff_status VARCHAR(50) DEFAULT 'Pending',

  -- Violation Handling
  violation_action ENUM('Warn', 'Block', 'Require_Justification', 'Auto_Reject') DEFAULT 'Warn',
  allow_violation_override TINYINT(1) DEFAULT 0,
  violation_approval_required TINYINT(1) DEFAULT 1,

  -- Priority (higher number = higher priority)
  priority INT DEFAULT 100,

  -- Currency
  base_currency_id INT COMMENT 'FK to hrms_expense_currencies',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) DEFAULT 0 COMMENT 'Default policy for company',

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by INT,

  -- Indexes
  INDEX idx_company_active (company_id, is_active),
  INDEX idx_policy_code (policy_code),
  INDEX idx_effective_dates (effective_from, effective_to),
  INDEX idx_priority (priority DESC),
  UNIQUE INDEX idx_company_policy_code (company_id, policy_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_policy_applicability`
Policy applicability rules with MULTI-SELECT support.

```sql
CREATE TABLE hrms_expense_policy_applicability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_id INT NOT NULL COMMENT 'FK to hrms_expense_policies',

  -- Applicability Type
  applicability_type ENUM(
    'All_Employees',
    'Departments',
    'Sub_Departments',
    'Grades',
    'Designations',
    'Levels',
    'Locations',
    'Location_Groups',
    'Cost_Centers',
    'Business_Units',
    'Branches',
    'Specific_Employees'
  ) NOT NULL,

  -- Multi-Select IDs (JSON arrays for storing multiple selections)
  employee_ids JSON COMMENT '["101", "102", "103"] - when type=Specific_Employees',
  department_ids JSON COMMENT '["1", "2", "3"] - when type=Departments',
  sub_department_ids JSON COMMENT 'when type=Sub_Departments',
  grade_ids JSON COMMENT 'when type=Grades',
  designation_ids JSON COMMENT 'when type=Designations',
  level_ids JSON COMMENT 'when type=Levels',
  location_ids JSON COMMENT 'when type=Locations',
  location_group_ids JSON COMMENT 'when type=Location_Groups',
  cost_center_ids JSON COMMENT 'when type=Cost_Centers',
  business_unit_ids JSON COMMENT 'when type=Business_Units',
  branch_ids JSON COMMENT 'when type=Branches',

  -- Include/Exclude Logic
  is_include TINYINT(1) DEFAULT 1 COMMENT '1=Include these, 0=Exclude these',

  -- Rule Priority (for conflict resolution within same policy)
  rule_priority INT DEFAULT 0 COMMENT 'Higher = evaluated first',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_applicability_policy FOREIGN KEY (policy_id)
    REFERENCES hrms_expense_policies(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_policy (policy_id),
  INDEX idx_applicability_type (applicability_type),
  INDEX idx_is_include (is_include)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Example Data:**
```sql
-- Policy applies to Sales and Marketing departments
INSERT INTO hrms_expense_policy_applicability
(policy_id, applicability_type, department_ids, is_include)
VALUES (1, 'Departments', '["1", "2", "5"]', 1);

-- But excludes Grade ID 10 (Interns)
INSERT INTO hrms_expense_policy_applicability
(policy_id, applicability_type, grade_ids, is_include)
VALUES (1, 'Grades', '["10"]', 0);
```

---

### Table 3: `hrms_expense_policy_categories`
Category-wise configuration within a policy.

```sql
CREATE TABLE hrms_expense_policy_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_id INT NOT NULL COMMENT 'FK to hrms_expense_policies',
  category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',

  -- Category Enablement
  is_enabled TINYINT(1) DEFAULT 1,

  -- Category-Specific Limits (overrides category defaults)
  limit_per_transaction DECIMAL(12,2),
  limit_per_day DECIMAL(12,2),
  limit_per_week DECIMAL(12,2),
  limit_per_month DECIMAL(12,2),
  limit_per_quarter DECIMAL(12,2),
  limit_per_year DECIMAL(12,2),

  -- Transaction Count Limits
  max_transactions_per_day INT,
  max_transactions_per_month INT,

  -- Mileage Limits (for mileage categories)
  max_km_per_day DECIMAL(10,2),
  max_km_per_month DECIMAL(10,2),
  mileage_rate_override DECIMAL(10,2),

  -- Per Diem Overrides
  per_diem_rate_override DECIMAL(10,2),
  per_diem_half_day_override DECIMAL(10,2),

  -- Receipt Requirements
  receipt_required ENUM('Always', 'Above_Limit', 'Never', 'Use_Category_Default') DEFAULT 'Use_Category_Default',
  receipt_required_above DECIMAL(10,2),

  -- Auto-Approval (for this category within this policy)
  auto_approve_enabled TINYINT(1) DEFAULT 0,
  auto_approve_below DECIMAL(10,2),

  -- Requires Pre-Approval
  requires_pre_approval TINYINT(1) DEFAULT 0,

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_policy_cat_policy FOREIGN KEY (policy_id)
    REFERENCES hrms_expense_policies(id) ON DELETE CASCADE,
  CONSTRAINT fk_policy_cat_category FOREIGN KEY (category_id)
    REFERENCES hrms_expense_categories(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_policy (policy_id),
  INDEX idx_category (category_id),
  UNIQUE INDEX idx_policy_category (policy_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 4: `hrms_expense_policy_category_location_limits`
Location-based limits for categories within a policy.

```sql
CREATE TABLE hrms_expense_policy_category_location_limits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_category_id INT NOT NULL COMMENT 'FK to hrms_expense_policy_categories',
  location_group_id INT NOT NULL COMMENT 'FK to hrms_expense_location_groups',

  -- Location-Specific Limits
  limit_per_transaction DECIMAL(12,2),
  limit_per_day DECIMAL(12,2),
  limit_per_month DECIMAL(12,2),

  -- Rate Overrides for this location
  mileage_rate_override DECIMAL(10,2),
  per_diem_rate_override DECIMAL(10,2),

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_loc_limit_policy_cat FOREIGN KEY (policy_category_id)
    REFERENCES hrms_expense_policy_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_loc_limit_location_group FOREIGN KEY (location_group_id)
    REFERENCES hrms_expense_location_groups(id) ON DELETE CASCADE,

  -- Indexes
  UNIQUE INDEX idx_policy_category_location (policy_category_id, location_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 5: `hrms_expense_approval_workflows`
Expense-specific approval workflow configuration (SEPARATE from HRMS workflow).

```sql
CREATE TABLE hrms_expense_approval_workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Workflow Identification
  workflow_name VARCHAR(150) NOT NULL,
  workflow_code VARCHAR(50) NOT NULL,
  workflow_description TEXT,

  -- Workflow Type
  workflow_type ENUM('Policy_Based', 'Category_Based', 'Amount_Based', 'Hybrid') DEFAULT 'Policy_Based'
    COMMENT 'Policy_Based=One workflow per policy, Category_Based=Different workflow per category',

  -- Default Settings
  is_default TINYINT(1) DEFAULT 0 COMMENT 'Default workflow for company',

  -- Approval Mode
  approval_mode ENUM('Sequential', 'Parallel', 'Any_One') DEFAULT 'Sequential'
    COMMENT 'Sequential=One after another, Parallel=All at once, Any_One=First approval wins',

  -- Line Item Approval
  allow_partial_approval TINYINT(1) DEFAULT 1
    COMMENT '1=Each line item can be approved/rejected independently',
  allow_amount_modification TINYINT(1) DEFAULT 0
    COMMENT '1=Approver can modify approved amount',

  -- Escalation Settings
  escalation_enabled TINYINT(1) DEFAULT 1,
  escalation_after_hours INT DEFAULT 48,
  escalation_reminder_hours INT DEFAULT 24 COMMENT 'Send reminder before escalation',
  max_escalation_levels INT DEFAULT 2,

  -- Auto-Actions
  auto_approve_enabled TINYINT(1) DEFAULT 0,
  auto_approve_max_amount DECIMAL(12,2),
  auto_reject_after_days INT COMMENT 'Auto-reject if no action after X days',

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
  UNIQUE INDEX idx_company_workflow_code (company_id, workflow_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 6: `hrms_expense_approval_workflow_stages`
Stages/levels in the expense approval workflow.

```sql
CREATE TABLE hrms_expense_approval_workflow_stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

  -- Stage Configuration
  stage_order INT NOT NULL COMMENT 'Order of execution (1, 2, 3...)',
  stage_name VARCHAR(100) NOT NULL COMMENT 'e.g., Manager Approval, Finance Approval',

  -- Amount Range (stage applies only if amount is in range)
  min_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Minimum amount for this stage',
  max_amount DECIMAL(12,2) COMMENT 'Maximum amount (null = no limit)',

  -- Approver Configuration
  approver_type ENUM(
    'Reporting_Manager',
    'Skip_Level_Manager',
    'Department_Head',
    'Specific_User',
    'Specific_Role',
    'Finance_Team',
    'HR_Team',
    'Cost_Center_Owner',
    'Project_Manager',
    'Dynamic'
  ) NOT NULL,

  -- Approver References
  approver_user_id INT COMMENT 'When type=Specific_User',
  approver_role_id INT COMMENT 'When type=Specific_Role',
  dynamic_approver_field VARCHAR(100) COMMENT 'Field name to get approver dynamically',

  -- Stage Behavior
  can_skip TINYINT(1) DEFAULT 0 COMMENT '1=Can be skipped if conditions not met',
  skip_if_same_as_previous TINYINT(1) DEFAULT 1
    COMMENT '1=Skip if same approver as previous stage',

  -- Actions Allowed
  can_approve TINYINT(1) DEFAULT 1,
  can_reject TINYINT(1) DEFAULT 1,
  can_send_back TINYINT(1) DEFAULT 1 COMMENT 'Send back for correction',
  can_modify_amount TINYINT(1) DEFAULT 0,
  can_add_comments TINYINT(1) DEFAULT 1,

  -- SLA
  sla_hours INT DEFAULT 48 COMMENT 'Expected response time',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_stage_workflow FOREIGN KEY (workflow_id)
    REFERENCES hrms_expense_approval_workflows(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_workflow (workflow_id),
  INDEX idx_stage_order (workflow_id, stage_order),
  INDEX idx_amount_range (min_amount, max_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 7: `hrms_expense_policy_workflow_mapping`
Maps policies to approval workflows.

```sql
CREATE TABLE hrms_expense_policy_workflow_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_id INT NOT NULL COMMENT 'FK to hrms_expense_policies',
  workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

  -- Category-Specific Workflow (optional)
  category_id INT COMMENT 'FK to hrms_expense_categories - null means all categories',

  -- Conditions
  min_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Use this workflow if amount >= min',
  max_amount DECIMAL(12,2) COMMENT 'Use this workflow if amount <= max',

  -- Priority (if multiple workflows match)
  priority INT DEFAULT 0,

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_mapping_policy FOREIGN KEY (policy_id)
    REFERENCES hrms_expense_policies(id) ON DELETE CASCADE,
  CONSTRAINT fk_mapping_workflow FOREIGN KEY (workflow_id)
    REFERENCES hrms_expense_approval_workflows(id) ON DELETE CASCADE,
  CONSTRAINT fk_mapping_category FOREIGN KEY (category_id)
    REFERENCES hrms_expense_categories(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_policy (policy_id),
  INDEX idx_workflow (workflow_id),
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 8: `hrms_expense_policy_violations`
Policy violation rules and thresholds.

```sql
CREATE TABLE hrms_expense_policy_violations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  policy_id INT NOT NULL COMMENT 'FK to hrms_expense_policies',

  -- Violation Type
  violation_type ENUM(
    'Limit_Exceeded',
    'Overall_Limit_Exceeded',
    'Frequency_Exceeded',
    'Past_Date_Violation',
    'Future_Date_Violation',
    'Missing_Receipt',
    'Duplicate_Expense',
    'Weekend_Holiday_Expense',
    'Category_Not_Allowed',
    'Currency_Mismatch',
    'Custom'
  ) NOT NULL,

  -- Violation Details
  violation_name VARCHAR(100) NOT NULL,
  violation_description TEXT,
  warning_message TEXT COMMENT 'Message shown to user',

  -- Threshold Configuration
  threshold_type ENUM('Amount', 'Percentage', 'Count', 'Days') DEFAULT 'Amount',
  threshold_value DECIMAL(15,2),

  -- Action on Violation
  violation_action ENUM('Warn', 'Block', 'Require_Justification', 'Auto_Reject', 'Flag_For_Audit') DEFAULT 'Warn',

  -- Override Settings
  allow_override TINYINT(1) DEFAULT 0,
  override_requires_approval TINYINT(1) DEFAULT 1,
  override_approver_type ENUM('Manager', 'Finance', 'HR', 'Specific_User'),
  override_approver_id INT,

  -- Severity
  severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_violation_policy FOREIGN KEY (policy_id)
    REFERENCES hrms_expense_policies(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_policy (policy_id),
  INDEX idx_violation_type (violation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 9: `hrms_employee_expense_policy_mapping`
Direct employee-to-policy assignment (for exceptions/overrides).

```sql
CREATE TABLE hrms_employee_expense_policy_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL COMMENT 'FK to hrms_employees',
  policy_id INT NOT NULL COMMENT 'FK to hrms_expense_policies',

  -- Assignment Details
  assigned_reason TEXT,
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
  CONSTRAINT fk_emp_policy_map_policy FOREIGN KEY (policy_id)
    REFERENCES hrms_expense_policies(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_employee (employee_id),
  INDEX idx_policy (policy_id),
  INDEX idx_effective (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Expense Request & Line Items Structure (Reference for Understanding)

This is how expense requests will work (implemented in Phase 3):

```sql
-- Expense Request (Header)
CREATE TABLE hrms_expense_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) NOT NULL,
  employee_id INT NOT NULL,
  policy_id INT NOT NULL,

  total_amount DECIMAL(15,2),
  approved_amount DECIMAL(15,2) DEFAULT 0,
  rejected_amount DECIMAL(15,2) DEFAULT 0,
  pending_amount DECIMAL(15,2),

  overall_status ENUM('Draft', 'Submitted', 'Partially_Approved', 'Fully_Approved', 'Rejected', 'Paid') DEFAULT 'Draft',
  ...
);

-- Expense Line Items (Each category is a separate line)
CREATE TABLE hrms_expense_request_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  category_id INT NOT NULL,

  amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2),

  item_status ENUM('Pending', 'Approved', 'Rejected', 'Sent_Back') DEFAULT 'Pending',

  current_approver_id INT,
  approved_by INT,
  rejected_by INT,
  rejection_reason TEXT,
  ...
);
```

**Flow Example:**
```
Employee submits expense request with 4 items:
├── Travel: ₹5,000 → Approved by Manager → ₹5,000 ✓
├── Food: ₹2,000 → Approved by Manager → ₹2,000 ✓
├── Hotel: ₹10,000 → Rejected (over limit) → ₹0 ✗
└── Misc: ₹500 → Approved by Manager → ₹500 ✓
                                    ─────────────
                     Total Payable: ₹7,500

Request Status: "Partially_Approved"
```

---

## API Endpoints

### Admin APIs - Policy Management

#### 1. Create Expense Policy
**Endpoint:** `POST /api/expense/admin/policies/create`

**Request Body:**
```json
{
  "policy_name": "Sales Team Policy",
  "policy_code": "POL-SALES",
  "policy_description": "Expense policy for sales department",
  "policy_type": "Standard",
  "effective_from": "2025-01-01",
  "effective_to": null,
  "overall_limit_per_day": 15000,
  "overall_limit_per_month": 150000,
  "overall_limit_per_year": 1500000,
  "allow_advance_request": true,
  "max_advance_percentage": 80,
  "allow_past_expense": true,
  "max_past_days": 30,
  "allow_edit_after_submit": true,
  "edit_window_hours": 24,
  "violation_action": "Warn",
  "priority": 100,
  "is_default": false,
  "is_active": true,
  "applicability": [
    {
      "applicability_type": "Departments",
      "department_ids": [1, 2, 5],
      "is_include": true
    },
    {
      "applicability_type": "Grades",
      "grade_ids": [10],
      "is_include": false
    }
  ],
  "categories": [
    {
      "category_id": 1,
      "is_enabled": true,
      "limit_per_transaction": 5000,
      "limit_per_day": 10000,
      "limit_per_month": 50000,
      "receipt_required": "Above_Limit",
      "receipt_required_above": 500,
      "auto_approve_below": 1000,
      "location_limits": [
        {
          "location_group_id": 1,
          "limit_per_transaction": 7500,
          "limit_per_day": 15000
        }
      ]
    }
  ],
  "workflow_mappings": [
    {
      "workflow_id": 1,
      "category_id": null,
      "min_amount": 0,
      "max_amount": null
    }
  ],
  "violations": [
    {
      "violation_type": "Limit_Exceeded",
      "violation_name": "Transaction Limit Exceeded",
      "violation_action": "Require_Justification",
      "allow_override": true,
      "severity": "Medium"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense policy created successfully",
  "data": {
    "id": 1,
    "policy_name": "Sales Team Policy",
    "policy_code": "POL-SALES",
    "applicability_rules_count": 2,
    "categories_count": 1,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

---

#### 2. Get All Policies
**Endpoint:** `POST /api/expense/admin/policies/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "Sales",
  "policy_type": "Standard",
  "limit": 50,
  "offset": 0,
  "sort_by": "priority",
  "sort_order": "desc"
}
```

---

#### 3. Get Policy Details
**Endpoint:** `POST /api/expense/admin/policies/details`

---

#### 4. Update Policy
**Endpoint:** `POST /api/expense/admin/policies/update`

---

#### 5. Delete Policy
**Endpoint:** `POST /api/expense/admin/policies/delete`

---

#### 6. Clone Policy
**Endpoint:** `POST /api/expense/admin/policies/clone`

---

#### 7. Manage Applicability Rules
**Endpoint:** `POST /api/expense/admin/policies/applicability/manage`

**Request Body:**
```json
{
  "policy_id": 1,
  "action": "upsert",
  "applicability": {
    "id": null,
    "applicability_type": "Departments",
    "department_ids": [1, 2, 3, 5, 7],
    "is_include": true,
    "rule_priority": 10
  }
}
```

---

#### 8. Manage Policy Categories
**Endpoint:** `POST /api/expense/admin/policies/categories/manage`

---

#### 9. Get Applicable Policy for Employee
**Endpoint:** `POST /api/expense/admin/policies/get-applicable`

**Request Body:**
```json
{
  "employee_id": 101,
  "expense_date": "2025-11-13"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicable_policy": {
      "id": 1,
      "policy_name": "Sales Team Policy",
      "policy_code": "POL-SALES",
      "matched_by": "Department",
      "priority": 100
    },
    "enabled_categories": [
      {
        "category_id": 1,
        "category_name": "Local Travel",
        "limits": {
          "per_transaction": 5000,
          "per_day": 10000,
          "per_month": 50000
        }
      }
    ],
    "overall_limits": {
      "per_day": 15000,
      "per_month": 150000
    },
    "current_usage": {
      "today": 3500,
      "this_month": 45000
    }
  }
}
```

---

### Admin APIs - Approval Workflow Management

#### 10. Create Approval Workflow
**Endpoint:** `POST /api/expense/admin/workflows/create`

**Request Body:**
```json
{
  "workflow_name": "Standard Expense Approval",
  "workflow_code": "WF-EXP-STD",
  "workflow_description": "Standard 2-level approval workflow",
  "workflow_type": "Policy_Based",
  "approval_mode": "Sequential",
  "allow_partial_approval": true,
  "allow_amount_modification": false,
  "escalation_enabled": true,
  "escalation_after_hours": 48,
  "escalation_reminder_hours": 24,
  "auto_approve_enabled": true,
  "auto_approve_max_amount": 1000,
  "is_active": true,
  "stages": [
    {
      "stage_order": 1,
      "stage_name": "Manager Approval",
      "min_amount": 0,
      "max_amount": null,
      "approver_type": "Reporting_Manager",
      "can_approve": true,
      "can_reject": true,
      "can_send_back": true,
      "can_modify_amount": false,
      "sla_hours": 48
    },
    {
      "stage_order": 2,
      "stage_name": "Finance Approval",
      "min_amount": 10000,
      "max_amount": null,
      "approver_type": "Finance_Team",
      "can_approve": true,
      "can_reject": true,
      "can_send_back": true,
      "can_modify_amount": true,
      "sla_hours": 72
    }
  ]
}
```

---

#### 11. Get All Workflows
**Endpoint:** `POST /api/expense/admin/workflows/list`

---

#### 12. Get Workflow Details
**Endpoint:** `POST /api/expense/admin/workflows/details`

---

#### 13. Update Workflow
**Endpoint:** `POST /api/expense/admin/workflows/update`

---

#### 14. Delete Workflow
**Endpoint:** `POST /api/expense/admin/workflows/delete`

---

#### 15. Manage Workflow Stages
**Endpoint:** `POST /api/expense/admin/workflows/stages/manage`

---

#### 16. Map Workflow to Policy
**Endpoint:** `POST /api/expense/admin/policies/workflow-mapping/manage`

**Request Body:**
```json
{
  "policy_id": 1,
  "action": "upsert",
  "mapping": {
    "workflow_id": 1,
    "category_id": null,
    "min_amount": 0,
    "max_amount": 50000
  }
}
```

---

#### 17. Validate Expense Against Policy
**Endpoint:** `POST /api/expense/admin/policies/validate-expense`

**Request Body:**
```json
{
  "employee_id": 101,
  "items": [
    {
      "category_id": 1,
      "amount": 6000,
      "expense_date": "2025-11-13",
      "location_group_id": 1
    },
    {
      "category_id": 2,
      "amount": 2000,
      "expense_date": "2025-11-13"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "policy_id": 1,
    "policy_name": "Sales Team Policy",
    "total_amount": 8000,
    "items_validation": [
      {
        "category_id": 1,
        "category_name": "Local Travel",
        "amount": 6000,
        "is_valid": false,
        "violations": [
          {
            "type": "Limit_Exceeded",
            "message": "Amount ₹6,000 exceeds transaction limit of ₹5,000",
            "action": "Require_Justification",
            "can_override": true
          }
        ]
      },
      {
        "category_id": 2,
        "category_name": "Food & Meals",
        "amount": 2000,
        "is_valid": true,
        "violations": []
      }
    ],
    "overall_validation": {
      "is_valid": true,
      "daily_limit": 15000,
      "daily_used": 3500,
      "daily_remaining": 11500
    },
    "approval_workflow": {
      "workflow_id": 1,
      "workflow_name": "Standard Expense Approval",
      "stages": [
        {
          "stage": 1,
          "name": "Manager Approval",
          "approver": "John Smith (Reporting Manager)"
        }
      ]
    }
  }
}
```

---

#### 18. Get Dropdown Data
**Endpoint:** `POST /api/expense/admin/policies/dropdown`

**Response includes:**
- Policy types
- Applicability types
- Violation types & actions
- Approver types
- Departments, Grades, Designations, Locations, etc.
- Workflows

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── index.js
│       ├── ExpensePolicy.js
│       ├── ExpensePolicyApplicability.js
│       ├── ExpensePolicyCategory.js
│       ├── ExpensePolicyCategoryLocationLimit.js
│       ├── ExpenseApprovalWorkflow.js
│       ├── ExpenseApprovalWorkflowStage.js
│       ├── ExpensePolicyWorkflowMapping.js
│       ├── ExpensePolicyViolation.js
│       └── EmployeeExpensePolicyMapping.js
│
└── microservices/
    └── expense/
        ├── controllers/
        │   └── admin/
        │       ├── expensePolicy.controller.js
        │       └── expenseWorkflow.controller.js
        ├── services/
        │   ├── expensePolicy.service.js
        │   ├── expenseWorkflow.service.js
        │   └── policyValidator.service.js
        └── routes/
            └── admin.expense.routes.js
```

---

## Implementation Steps

### Step 1: Create Models (Day 1-2)
All 9 tables with proper associations

### Step 2: Create Policy Service (Day 2-3)
CRUD operations, applicability management, category configuration

### Step 3: Create Workflow Service (Day 3-4)
Workflow CRUD, stage management, policy-workflow mapping

### Step 4: Create Policy Validator Service (Day 4-5)
- `getApplicablePolicyForEmployee()` - Resolve policy based on applicability rules
- `validateExpenseItems()` - Check limits and violations
- `getApprovalWorkflow()` - Determine workflow for expense

### Step 5: Create Controllers & Routes (Day 5)

### Step 6: Testing (Day 6)
- Multi-select applicability
- Policy priority resolution
- Include/Exclude logic
- Workflow stage progression
- Partial approval scenarios

---

## Success Criteria

### Technical:
- Multi-select applicability working
- Separate expense workflow engine
- Partial approval support at line item level
- Policy priority resolution correct
- Limit validation at all levels (transaction, day, month, location)

### Functional:
- Admin can create policies with multi-select applicability
- Expense workflow independent from HRMS workflow
- Each expense line item can be approved/rejected independently
- Approved amount = sum of approved line items only
- Policy violations detected and handled correctly

---

**Estimated Duration:** 5-6 days
**Priority:** High
**Dependencies:** Phase 1.1 (Location Groups), Phase 1.2 (Categories)
