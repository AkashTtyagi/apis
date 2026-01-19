# Expense Approval Workflow - Implementation Prompt

## Overview
Implement a dedicated Expense Approval Workflow engine for the Expense Management system. This is a **completely separate workflow system** from HRMS workflow, specifically designed for expense approvals with support for line-item level approval, partial approvals, amount-based routing, and category-specific workflows.

---

## Why Separate Workflow Engine?

| Feature | HRMS Workflow | Expense Workflow |
|---------|---------------|------------------|
| Approval Level | Request level (all or nothing) | Line item level |
| Partial Approval | Not supported | Fully supported |
| Amount-based Routing | Limited | Full support |
| Category-specific Flow | Not applicable | Supported |
| Amount Modification | Not supported | Approver can modify |
| Multi-category Request | N/A | One request, multiple categories |

---

## Key Design Principles

### 1. Line Item Level Approval
Each expense line item in a request can be:
- **Approved** - Amount gets processed for payment
- **Rejected** - Amount is not processed
- **Sent Back** - Needs correction from employee
- **Pending** - Awaiting approval

### 2. Partial Approval
```
Expense Request #EXP-2025-001
├── Travel (₹5,000) → Approved ✓ → Payable: ₹5,000
├── Food (₹2,000) → Approved ✓ → Payable: ₹2,000
├── Hotel (₹15,000) → Rejected ✗ → Payable: ₹0
└── Cab (₹800) → Approved ✓ → Payable: ₹800
                              ─────────────────
              Total Payable: ₹7,800 (3 of 4 approved)
              Request Status: Partially_Approved
```

### 3. Amount-Based Stage Activation
```
Stage 1: Manager Approval (₹0 - ₹50,000) → Always triggers
Stage 2: Finance Approval (₹10,000+) → Only if amount ≥ ₹10,000
Stage 3: CFO Approval (₹100,000+) → Only if amount ≥ ₹100,000
```

### 4. Category-Specific Workflows
Different categories can have different approval flows:
- Travel expenses → Manager → Finance
- Food expenses → Manager only
- International Travel → Manager → Finance → CFO

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **Phase 1.2:** Expense Category Management
- **Phase 2.1:** Expense Policy Management
- **HRMS Core:** Employee hierarchy for manager lookup

---

## Database Schema

### Table 1: `hrms_expense_approval_workflows`
Master table for expense workflows.

```sql
CREATE TABLE hrms_expense_approval_workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Workflow Identification
  workflow_name VARCHAR(150) NOT NULL,
  workflow_code VARCHAR(50) NOT NULL,
  workflow_description TEXT,

  -- Workflow Scope
  workflow_scope ENUM('All_Expenses', 'Category_Specific', 'Amount_Based', 'Policy_Specific')
    DEFAULT 'All_Expenses'
    COMMENT 'Determines when this workflow applies',

  -- Approval Mode
  approval_mode ENUM('Sequential', 'Parallel', 'Any_One') DEFAULT 'Sequential'
    COMMENT 'Sequential=Stage by stage, Parallel=All stages at once, Any_One=First approval completes',

  -- Line Item Settings
  approval_level ENUM('Request_Level', 'Line_Item_Level') DEFAULT 'Line_Item_Level'
    COMMENT 'Request_Level=All items same decision, Line_Item_Level=Each item independent',
  allow_partial_approval TINYINT(1) DEFAULT 1
    COMMENT 'Allow some items approved, some rejected',
  allow_partial_amount_approval TINYINT(1) DEFAULT 0
    COMMENT 'Allow approving partial amount of a line item',

  -- Amount Modification
  allow_amount_modification TINYINT(1) DEFAULT 0
    COMMENT 'Approver can reduce approved amount',
  max_amount_reduction_percentage DECIMAL(5,2) DEFAULT 100.00
    COMMENT 'Max % approver can reduce (100 = can reduce to 0)',

  -- Escalation Settings
  escalation_enabled TINYINT(1) DEFAULT 1,
  escalation_after_hours INT DEFAULT 48 COMMENT 'Escalate after X hours of inaction',
  escalation_reminder_hours INT DEFAULT 24 COMMENT 'Send reminder X hours before escalation',
  max_escalation_levels INT DEFAULT 3 COMMENT 'Max times to escalate',
  escalation_to ENUM('Skip_Level_Manager', 'Department_Head', 'HR', 'Finance_Head', 'Specific_User')
    DEFAULT 'Skip_Level_Manager',
  escalation_user_id INT COMMENT 'When escalation_to = Specific_User',

  -- Auto-Approval Settings
  auto_approve_enabled TINYINT(1) DEFAULT 0,
  auto_approve_max_amount DECIMAL(12,2) COMMENT 'Auto-approve if total ≤ this amount',
  auto_approve_categories JSON COMMENT 'Category IDs eligible for auto-approval',
  auto_approve_for_grades JSON COMMENT 'Grade IDs eligible for auto-approval',

  -- Auto-Reject Settings
  auto_reject_enabled TINYINT(1) DEFAULT 0,
  auto_reject_after_days INT COMMENT 'Auto-reject if no action after X days',

  -- Send Back Settings
  allow_send_back TINYINT(1) DEFAULT 1,
  max_send_back_count INT DEFAULT 3 COMMENT 'Max times request can be sent back',

  -- =====================
  -- NOTIFICATION SETTINGS (Workflow-level)
  -- =====================

  -- Email Notification Toggles
  email_notifications_enabled TINYINT(1) DEFAULT 1,
  notify_requester_on_submit TINYINT(1) DEFAULT 1 COMMENT 'Email to employee on submit',
  notify_approver_on_submit TINYINT(1) DEFAULT 1 COMMENT 'Email to approver on new request',
  notify_requester_on_approve TINYINT(1) DEFAULT 1,
  notify_requester_on_reject TINYINT(1) DEFAULT 1,
  notify_requester_on_send_back TINYINT(1) DEFAULT 1,
  notify_requester_on_payment TINYINT(1) DEFAULT 1,
  notify_finance_on_approval TINYINT(1) DEFAULT 0 COMMENT 'Notify finance team on final approval',

  -- Approver Notifications
  notify_approver_on_escalation TINYINT(1) DEFAULT 1,
  notify_next_approver TINYINT(1) DEFAULT 1 COMMENT 'Notify next stage approver',

  -- Reminder Notifications
  enable_pending_reminders TINYINT(1) DEFAULT 1,
  pending_reminder_hours INT DEFAULT 24 COMMENT 'First reminder after X hours',
  pending_reminder_frequency_hours INT DEFAULT 24 COMMENT 'Subsequent reminders frequency',
  max_pending_reminders INT DEFAULT 3,

  -- Push Notifications
  push_notifications_enabled TINYINT(1) DEFAULT 1,
  push_on_submit TINYINT(1) DEFAULT 1,
  push_on_action TINYINT(1) DEFAULT 1 COMMENT 'Push on approve/reject/send_back',
  push_on_reminder TINYINT(1) DEFAULT 1,

  -- CC/BCC Settings
  cc_manager_on_approval TINYINT(1) DEFAULT 0,
  cc_hr_on_rejection TINYINT(1) DEFAULT 0,
  additional_cc_emails JSON COMMENT 'Additional emails to CC on all notifications',

  -- Email Template IDs (FK to email template library)
  email_template_submit INT COMMENT 'Template for submission notification',
  email_template_approval INT COMMENT 'Template for approval notification',
  email_template_rejection INT COMMENT 'Template for rejection notification',
  email_template_send_back INT COMMENT 'Template for send back notification',
  email_template_reminder INT COMMENT 'Template for reminder notification',
  email_template_escalation INT COMMENT 'Template for escalation notification',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) DEFAULT 0 COMMENT 'Default workflow for company',

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by INT,

  -- Indexes
  INDEX idx_company_active (company_id, is_active),
  INDEX idx_workflow_code (workflow_code),
  INDEX idx_is_default (company_id, is_default),
  UNIQUE INDEX idx_company_workflow_code (company_id, workflow_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_approval_workflow_stages`
Stages within a workflow.

```sql
CREATE TABLE hrms_expense_approval_workflow_stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

  -- Stage Identification
  stage_order INT NOT NULL COMMENT 'Execution order (1, 2, 3...)',
  stage_name VARCHAR(100) NOT NULL,
  stage_description TEXT,

  -- Amount Conditions (stage triggers only if amount in range)
  min_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Stage triggers if amount >= this',
  max_amount DECIMAL(12,2) COMMENT 'Stage triggers if amount <= this (null = no max)',

  -- Category Conditions (optional - stage triggers only for specific categories)
  applies_to_categories JSON COMMENT 'Category IDs this stage applies to (null = all)',

  -- Approver Configuration
  approver_type ENUM(
    'Reporting_Manager',
    'Skip_Level_Manager',
    'Department_Head',
    'HOD_Chain',
    'Specific_User',
    'Specific_Role',
    'Users_With_Permission',
    'Finance_Team',
    'HR_Team',
    'Cost_Center_Owner',
    'Project_Manager',
    'Budget_Owner',
    'Custom_Field_Based'
  ) NOT NULL,

  -- Approver References
  approver_user_ids JSON COMMENT 'User IDs when type=Specific_User (multiple allowed)',
  approver_role_id INT COMMENT 'Role ID when type=Specific_Role',
  approver_permission_code VARCHAR(100) COMMENT 'Permission code when type=Users_With_Permission',
  custom_approver_field VARCHAR(100) COMMENT 'Field name for Custom_Field_Based',

  -- Multi-Approver Settings
  multi_approver_mode ENUM('Any_One', 'All_Must_Approve', 'Majority') DEFAULT 'Any_One'
    COMMENT 'When multiple approvers: Any_One=First wins, All=Everyone must approve',
  min_approvals_required INT DEFAULT 1 COMMENT 'For Majority mode',

  -- Stage Behavior
  is_mandatory TINYINT(1) DEFAULT 1 COMMENT '0=Can be skipped if conditions not met',
  skip_if_same_approver TINYINT(1) DEFAULT 1 COMMENT 'Skip if approver same as previous stage',
  skip_if_self_approved TINYINT(1) DEFAULT 0 COMMENT 'Skip if requester is the approver',

  -- Actions Available at this Stage
  can_approve TINYINT(1) DEFAULT 1,
  can_reject TINYINT(1) DEFAULT 1,
  can_send_back TINYINT(1) DEFAULT 1,
  can_hold TINYINT(1) DEFAULT 0 COMMENT 'Put on hold for later',
  can_delegate TINYINT(1) DEFAULT 0 COMMENT 'Delegate to another user',
  can_modify_amount TINYINT(1) DEFAULT 0,
  can_add_comments TINYINT(1) DEFAULT 1,
  can_request_documents TINYINT(1) DEFAULT 1,
  comments_mandatory_on_reject TINYINT(1) DEFAULT 1,

  -- SLA Configuration
  sla_hours INT DEFAULT 48 COMMENT 'Expected completion time',
  sla_warning_hours INT DEFAULT 36 COMMENT 'Send warning at this hour',
  sla_breach_action ENUM('Notify', 'Escalate', 'Auto_Approve', 'None') DEFAULT 'Notify',

  -- Stage-level Escalation (overrides workflow settings)
  stage_escalation_enabled TINYINT(1) COMMENT 'null = use workflow setting',
  stage_escalation_hours INT,
  stage_escalation_to ENUM('Skip_Level_Manager', 'Department_Head', 'Next_Stage_Approver', 'Specific_User'),
  stage_escalation_user_id INT,

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
  INDEX idx_amount_range (min_amount, max_amount),
  INDEX idx_approver_type (approver_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 3: `hrms_expense_workflow_category_mapping`
Maps specific categories to specific workflows (optional override).

```sql
CREATE TABLE hrms_expense_workflow_category_mapping (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',
  workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

  -- Amount-based workflow selection
  min_amount DECIMAL(12,2) DEFAULT 0,
  max_amount DECIMAL(12,2) COMMENT 'null = no max',

  -- Priority for conflict resolution
  priority INT DEFAULT 0 COMMENT 'Higher priority wins',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_cat_map_category FOREIGN KEY (category_id)
    REFERENCES hrms_expense_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_cat_map_workflow FOREIGN KEY (workflow_id)
    REFERENCES hrms_expense_approval_workflows(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_category (category_id),
  INDEX idx_workflow (workflow_id),
  INDEX idx_amount_range (min_amount, max_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 4: `hrms_expense_approval_requests`
Tracks approval status for each expense request.

```sql
CREATE TABLE hrms_expense_approval_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Reference to Expense Request
  expense_request_id INT NOT NULL COMMENT 'FK to hrms_expense_requests',
  expense_request_number VARCHAR(50) NOT NULL,

  -- Workflow Used
  workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

  -- Request Details (denormalized for quick access)
  requester_id INT NOT NULL COMMENT 'Employee who submitted',
  requester_name VARCHAR(200),
  total_amount DECIMAL(15,2) NOT NULL,
  total_items INT NOT NULL,

  -- Current Status
  current_stage_id INT COMMENT 'FK to workflow_stages - Current pending stage',
  current_stage_order INT,
  current_approver_ids JSON COMMENT 'Current approver user IDs',

  -- Overall Status
  approval_status ENUM(
    'Pending',
    'In_Progress',
    'Partially_Approved',
    'Fully_Approved',
    'Rejected',
    'Sent_Back',
    'On_Hold',
    'Withdrawn',
    'Auto_Approved',
    'Auto_Rejected',
    'Escalated'
  ) DEFAULT 'Pending',

  -- Amount Summary
  approved_amount DECIMAL(15,2) DEFAULT 0,
  rejected_amount DECIMAL(15,2) DEFAULT 0,
  pending_amount DECIMAL(15,2),
  modified_amount DECIMAL(15,2) COMMENT 'If approver modified amounts',

  -- Item Summary
  approved_items INT DEFAULT 0,
  rejected_items INT DEFAULT 0,
  pending_items INT,
  sent_back_items INT DEFAULT 0,

  -- Timestamps
  submitted_at TIMESTAMP NOT NULL,
  first_action_at TIMESTAMP COMMENT 'When first approval action taken',
  last_action_at TIMESTAMP,
  completed_at TIMESTAMP COMMENT 'When fully processed',

  -- SLA Tracking
  sla_due_at TIMESTAMP COMMENT 'Current SLA deadline',
  is_sla_breached TINYINT(1) DEFAULT 0,
  sla_breach_at TIMESTAMP,

  -- Escalation Tracking
  escalation_count INT DEFAULT 0,
  last_escalation_at TIMESTAMP,
  escalated_to_user_id INT,

  -- Send Back Tracking
  send_back_count INT DEFAULT 0,
  last_send_back_at TIMESTAMP,
  last_send_back_reason TEXT,

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_approval_req_workflow FOREIGN KEY (workflow_id)
    REFERENCES hrms_expense_approval_workflows(id),
  CONSTRAINT fk_approval_req_stage FOREIGN KEY (current_stage_id)
    REFERENCES hrms_expense_approval_workflow_stages(id),

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_expense_request (expense_request_id),
  INDEX idx_workflow (workflow_id),
  INDEX idx_requester (requester_id),
  INDEX idx_status (approval_status),
  INDEX idx_current_stage (current_stage_id),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_sla_due (sla_due_at),
  UNIQUE INDEX idx_expense_request_unique (expense_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 5: `hrms_expense_approval_request_items`
Line item level approval tracking.

```sql
CREATE TABLE hrms_expense_approval_request_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  approval_request_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_requests',

  -- Reference to Expense Item
  expense_item_id INT NOT NULL COMMENT 'FK to hrms_expense_request_items',
  category_id INT NOT NULL,
  category_name VARCHAR(100),

  -- Item Details (denormalized)
  original_amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,

  -- Item Workflow (may differ from request workflow for category-specific)
  item_workflow_id INT COMMENT 'If different workflow for this category',
  current_stage_id INT,
  current_stage_order INT,

  -- Item Status
  item_status ENUM(
    'Pending',
    'In_Progress',
    'Approved',
    'Partially_Approved',
    'Rejected',
    'Sent_Back',
    'On_Hold'
  ) DEFAULT 'Pending',

  -- Approved Amount (can be different from original if modified)
  approved_amount DECIMAL(12,2),
  amount_modified TINYINT(1) DEFAULT 0,
  modification_reason TEXT,

  -- Action Details
  action_taken_by INT COMMENT 'User who took final action',
  action_taken_at TIMESTAMP,
  rejection_reason TEXT,
  send_back_reason TEXT,
  approver_comments TEXT,

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_item_approval_request FOREIGN KEY (approval_request_id)
    REFERENCES hrms_expense_approval_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_workflow FOREIGN KEY (item_workflow_id)
    REFERENCES hrms_expense_approval_workflows(id),
  CONSTRAINT fk_item_stage FOREIGN KEY (current_stage_id)
    REFERENCES hrms_expense_approval_workflow_stages(id),

  -- Indexes
  INDEX idx_approval_request (approval_request_id),
  INDEX idx_expense_item (expense_item_id),
  INDEX idx_category (category_id),
  INDEX idx_status (item_status),
  UNIQUE INDEX idx_expense_item_unique (expense_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 6: `hrms_expense_approval_history`
Complete audit trail of all approval actions.

```sql
CREATE TABLE hrms_expense_approval_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- References
  approval_request_id INT NOT NULL,
  approval_item_id INT COMMENT 'null if action on full request',
  expense_request_id INT NOT NULL,
  expense_item_id INT COMMENT 'null if action on full request',

  -- Stage Information
  stage_id INT,
  stage_order INT,
  stage_name VARCHAR(100),

  -- Action Details
  action ENUM(
    'Submitted',
    'Approved',
    'Partially_Approved',
    'Rejected',
    'Sent_Back',
    'Put_On_Hold',
    'Released_From_Hold',
    'Delegated',
    'Escalated',
    'Withdrawn',
    'Auto_Approved',
    'Auto_Rejected',
    'Amount_Modified',
    'Document_Requested',
    'Document_Uploaded',
    'Comment_Added',
    'Reminder_Sent',
    'SLA_Breached'
  ) NOT NULL,

  -- Action By
  action_by_user_id INT NOT NULL,
  action_by_name VARCHAR(200),
  action_by_role VARCHAR(100),

  -- Action Target (for delegation/escalation)
  action_to_user_id INT,
  action_to_name VARCHAR(200),

  -- Amount Details
  amount_before DECIMAL(12,2),
  amount_after DECIMAL(12,2),
  amount_change DECIMAL(12,2),

  -- Comments/Reasons
  comments TEXT,
  rejection_reason TEXT,
  send_back_reason TEXT,
  modification_reason TEXT,

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  action_source ENUM('Web', 'Mobile', 'API', 'System', 'Email') DEFAULT 'Web',

  -- Timestamps
  action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_approval_request (approval_request_id),
  INDEX idx_approval_item (approval_item_id),
  INDEX idx_expense_request (expense_request_id),
  INDEX idx_action (action),
  INDEX idx_action_by (action_by_user_id),
  INDEX idx_action_at (action_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 7: `hrms_expense_approval_pending`
Current pending approvals view (for approver dashboard).

```sql
CREATE TABLE hrms_expense_approval_pending (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- References
  approval_request_id INT NOT NULL,
  approval_item_id INT COMMENT 'null if request level, ID if item level',
  expense_request_id INT NOT NULL,
  expense_item_id INT,

  -- Stage
  stage_id INT NOT NULL,
  stage_order INT NOT NULL,
  stage_name VARCHAR(100),

  -- Approver
  approver_user_id INT NOT NULL COMMENT 'User who needs to approve',
  approver_type VARCHAR(50),
  is_primary_approver TINYINT(1) DEFAULT 1,

  -- Request/Item Details (denormalized for dashboard)
  requester_id INT NOT NULL,
  requester_name VARCHAR(200),
  requester_department VARCHAR(100),
  request_number VARCHAR(50),
  category_name VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE,
  submitted_at TIMESTAMP,

  -- SLA
  sla_due_at TIMESTAMP,
  is_overdue TINYINT(1) DEFAULT 0,
  hours_pending INT,

  -- Priority
  priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',

  -- Status
  is_active TINYINT(1) DEFAULT 1 COMMENT '0 when action taken',

  -- Timestamps
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reminded_at TIMESTAMP,
  escalated_at TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_approver (approver_user_id),
  INDEX idx_approval_request (approval_request_id),
  INDEX idx_is_active (is_active),
  INDEX idx_sla_due (sla_due_at),
  INDEX idx_priority (priority),
  INDEX idx_approver_active (approver_user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 8: `hrms_expense_approval_delegates`
Delegation configuration (approver can delegate to others).

```sql
CREATE TABLE hrms_expense_approval_delegates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Delegator
  delegator_user_id INT NOT NULL COMMENT 'User delegating their approval rights',

  -- Delegate
  delegate_user_id INT NOT NULL COMMENT 'User receiving delegation',

  -- Scope
  delegation_scope ENUM('All', 'Specific_Workflows', 'Amount_Based', 'Date_Range') DEFAULT 'All',
  workflow_ids JSON COMMENT 'Workflow IDs for Specific_Workflows scope',
  max_amount DECIMAL(12,2) COMMENT 'For Amount_Based scope',

  -- Validity Period
  effective_from DATE NOT NULL,
  effective_to DATE NOT NULL,

  -- Reason
  delegation_reason TEXT,

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_delegator (delegator_user_id),
  INDEX idx_delegate (delegate_user_id),
  INDEX idx_effective_dates (effective_from, effective_to),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 9: `hrms_expense_notification_log`
Log of all notifications sent (for audit and retry).

```sql
CREATE TABLE hrms_expense_notification_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- References
  workflow_id INT,
  approval_request_id INT,
  expense_request_id INT,
  expense_item_id INT,

  -- Notification Type
  notification_type ENUM(
    'Submit_Confirmation',
    'New_Request_For_Approval',
    'Approved',
    'Partially_Approved',
    'Rejected',
    'Sent_Back',
    'Escalation',
    'Reminder',
    'SLA_Warning',
    'SLA_Breach',
    'Payment_Processed',
    'Withdrawal',
    'Delegation'
  ) NOT NULL,

  -- Channel
  channel ENUM('Email', 'Push', 'SMS', 'In_App') NOT NULL,

  -- Recipient
  recipient_user_id INT,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),

  -- Content
  subject VARCHAR(500),
  body TEXT,
  template_id INT COMMENT 'Email template used',

  -- Status
  status ENUM('Pending', 'Sent', 'Delivered', 'Failed', 'Bounced') DEFAULT 'Pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,

  -- Metadata
  provider_response JSON COMMENT 'Response from email/push provider',

  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_approval_request (approval_request_id),
  INDEX idx_expense_request (expense_request_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_recipient (recipient_user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Admin APIs - Workflow Configuration

#### 1. Create Workflow
**Endpoint:** `POST /api/expense/admin/workflows/create`

**Request Body:**
```json
{
  "workflow_name": "Standard Expense Approval",
  "workflow_code": "WF-EXP-STD",
  "workflow_description": "Standard 2-level approval for expenses",
  "workflow_scope": "All_Expenses",
  "approval_mode": "Sequential",
  "approval_level": "Line_Item_Level",
  "allow_partial_approval": true,
  "allow_partial_amount_approval": false,
  "allow_amount_modification": true,
  "max_amount_reduction_percentage": 50,
  "escalation_enabled": true,
  "escalation_after_hours": 48,
  "escalation_reminder_hours": 24,
  "max_escalation_levels": 2,
  "escalation_to": "Skip_Level_Manager",
  "auto_approve_enabled": true,
  "auto_approve_max_amount": 1000,
  "auto_approve_categories": [1, 2],
  "allow_send_back": true,
  "max_send_back_count": 3,
  "notification_settings": {
    "email_notifications_enabled": true,
    "notify_requester_on_submit": true,
    "notify_approver_on_submit": true,
    "notify_requester_on_approve": true,
    "notify_requester_on_reject": true,
    "notify_requester_on_send_back": true,
    "notify_requester_on_payment": true,
    "notify_finance_on_approval": true,
    "enable_pending_reminders": true,
    "pending_reminder_hours": 24,
    "pending_reminder_frequency_hours": 24,
    "max_pending_reminders": 3,
    "push_notifications_enabled": true,
    "cc_manager_on_approval": false,
    "cc_hr_on_rejection": false
  },
  "is_default": true,
  "is_active": true,
  "stages": [
    {
      "stage_order": 1,
      "stage_name": "Manager Approval",
      "stage_description": "Direct reporting manager approval",
      "min_amount": 0,
      "max_amount": null,
      "approver_type": "Reporting_Manager",
      "is_mandatory": true,
      "skip_if_same_approver": true,
      "can_approve": true,
      "can_reject": true,
      "can_send_back": true,
      "can_modify_amount": false,
      "comments_mandatory_on_reject": true,
      "sla_hours": 48,
      "sla_breach_action": "Escalate"
    },
    {
      "stage_order": 2,
      "stage_name": "Finance Approval",
      "stage_description": "Finance team approval for high value expenses",
      "min_amount": 10000,
      "max_amount": null,
      "approver_type": "Finance_Team",
      "is_mandatory": true,
      "can_approve": true,
      "can_reject": true,
      "can_send_back": true,
      "can_modify_amount": true,
      "sla_hours": 72
    },
    {
      "stage_order": 3,
      "stage_name": "CFO Approval",
      "stage_description": "CFO approval for very high value expenses",
      "min_amount": 100000,
      "max_amount": null,
      "approver_type": "Specific_User",
      "approver_user_ids": [5],
      "is_mandatory": true,
      "sla_hours": 96
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow created successfully",
  "data": {
    "id": 1,
    "workflow_name": "Standard Expense Approval",
    "workflow_code": "WF-EXP-STD",
    "stages_count": 3,
    "is_default": true,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

---

#### 2. Get All Workflows
**Endpoint:** `POST /api/expense/admin/workflows/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "Standard",
  "workflow_scope": "All_Expenses",
  "limit": 50,
  "offset": 0
}
```

---

#### 3. Get Workflow Details
**Endpoint:** `POST /api/expense/admin/workflows/details`

**Request Body:**
```json
{
  "workflow_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "workflow_name": "Standard Expense Approval",
    "workflow_code": "WF-EXP-STD",
    "workflow_description": "Standard 2-level approval for expenses",
    "workflow_scope": "All_Expenses",
    "approval_mode": "Sequential",
    "approval_level": "Line_Item_Level",
    "allow_partial_approval": true,
    "allow_amount_modification": true,
    "escalation_enabled": true,
    "escalation_after_hours": 48,
    "auto_approve_enabled": true,
    "auto_approve_max_amount": 1000,
    "is_default": true,
    "is_active": true,
    "stages": [
      {
        "id": 1,
        "stage_order": 1,
        "stage_name": "Manager Approval",
        "min_amount": 0,
        "max_amount": null,
        "approver_type": "Reporting_Manager",
        "is_mandatory": true,
        "sla_hours": 48,
        "sla_breach_action": "Escalate"
      },
      {
        "id": 2,
        "stage_order": 2,
        "stage_name": "Finance Approval",
        "min_amount": 10000,
        "max_amount": null,
        "approver_type": "Finance_Team",
        "sla_hours": 72
      },
      {
        "id": 3,
        "stage_order": 3,
        "stage_name": "CFO Approval",
        "min_amount": 100000,
        "max_amount": null,
        "approver_type": "Specific_User",
        "approver_user_ids": [5],
        "sla_hours": 96
      }
    ],
    "category_mappings": [],
    "usage_stats": {
      "total_requests_processed": 150,
      "pending_requests": 12,
      "avg_approval_time_hours": 36
    }
  }
}
```

---

#### 4. Update Workflow
**Endpoint:** `POST /api/expense/admin/workflows/update`

---

#### 5. Delete Workflow
**Endpoint:** `POST /api/expense/admin/workflows/delete`

---

#### 6. Clone Workflow
**Endpoint:** `POST /api/expense/admin/workflows/clone`

---

#### 7. Manage Workflow Stages
**Endpoint:** `POST /api/expense/admin/workflows/stages/manage`

**Request Body:**
```json
{
  "workflow_id": 1,
  "action": "upsert",
  "stage": {
    "id": null,
    "stage_order": 4,
    "stage_name": "Board Approval",
    "min_amount": 500000,
    "approver_type": "Specific_Role",
    "approver_role_id": 10,
    "sla_hours": 168
  }
}
```

---

#### 8. Map Category to Workflow
**Endpoint:** `POST /api/expense/admin/workflows/category-mapping/manage`

**Request Body:**
```json
{
  "action": "upsert",
  "mapping": {
    "category_id": 5,
    "workflow_id": 2,
    "min_amount": 0,
    "max_amount": null,
    "priority": 10
  }
}
```

---

#### 9. Get Workflow for Expense
**Endpoint:** `POST /api/expense/admin/workflows/get-applicable`

**Request Body:**
```json
{
  "employee_id": 101,
  "category_id": 1,
  "amount": 25000,
  "policy_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflow": {
      "id": 1,
      "name": "Standard Expense Approval",
      "approval_level": "Line_Item_Level"
    },
    "applicable_stages": [
      {
        "stage_order": 1,
        "stage_name": "Manager Approval",
        "approver": {
          "user_id": 50,
          "name": "John Smith",
          "designation": "Sales Manager"
        },
        "sla_hours": 48
      },
      {
        "stage_order": 2,
        "stage_name": "Finance Approval",
        "approver": {
          "type": "Finance_Team",
          "team_members": [
            {"user_id": 60, "name": "Finance User 1"},
            {"user_id": 61, "name": "Finance User 2"}
          ]
        },
        "sla_hours": 72
      }
    ],
    "total_stages": 2,
    "estimated_completion_hours": 120,
    "auto_approve_eligible": false
  }
}
```

---

### Approver APIs

#### 10. Get Pending Approvals
**Endpoint:** `POST /api/expense/approver/pending`

**Request Body:**
```json
{
  "status": "Pending",
  "is_overdue": false,
  "category_id": null,
  "date_from": "2025-11-01",
  "date_to": "2025-11-30",
  "sort_by": "sla_due_at",
  "sort_order": "asc",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_pending": 15,
      "overdue": 3,
      "due_today": 5,
      "total_amount_pending": 125000
    },
    "items": [
      {
        "pending_id": 1,
        "approval_request_id": 101,
        "expense_request_id": 201,
        "request_number": "EXP-2025-00201",
        "is_item_level": false,
        "requester": {
          "id": 101,
          "name": "John Employee",
          "department": "Sales",
          "profile_image": "url"
        },
        "amount": 25000,
        "items_count": 4,
        "categories": ["Travel", "Food", "Hotel"],
        "expense_date_range": {
          "from": "2025-11-10",
          "to": "2025-11-12"
        },
        "submitted_at": "2025-11-13T10:00:00.000Z",
        "stage": {
          "order": 1,
          "name": "Manager Approval"
        },
        "sla": {
          "due_at": "2025-11-15T10:00:00.000Z",
          "hours_remaining": 36,
          "is_overdue": false
        },
        "priority": "Normal",
        "can_approve": true,
        "can_reject": true,
        "can_send_back": true,
        "can_modify_amount": false
      }
    ]
  },
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### 11. Get Approval Request Details
**Endpoint:** `POST /api/expense/approver/request-details`

**Request Body:**
```json
{
  "approval_request_id": 101
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "approval_request": {
      "id": 101,
      "expense_request_id": 201,
      "request_number": "EXP-2025-00201",
      "workflow_name": "Standard Expense Approval",
      "approval_status": "In_Progress",
      "current_stage": 1
    },
    "requester": {
      "id": 101,
      "name": "John Employee",
      "employee_code": "EMP001",
      "department": "Sales",
      "designation": "Sales Executive",
      "reporting_manager": "Jane Manager"
    },
    "expense_summary": {
      "total_amount": 25000,
      "total_items": 4,
      "expense_date_range": "Nov 10-12, 2025",
      "purpose": "Client visit to Mumbai"
    },
    "items": [
      {
        "item_id": 1,
        "approval_item_id": 1,
        "category": "Travel",
        "description": "Flight to Mumbai",
        "amount": 12000,
        "expense_date": "2025-11-10",
        "receipt_attached": true,
        "item_status": "Pending",
        "can_approve_individually": true,
        "custom_fields": {
          "travel_from": "Delhi",
          "travel_to": "Mumbai"
        }
      },
      {
        "item_id": 2,
        "approval_item_id": 2,
        "category": "Hotel",
        "description": "2 nights at Taj",
        "amount": 8000,
        "expense_date": "2025-11-10",
        "receipt_attached": true,
        "item_status": "Pending"
      },
      {
        "item_id": 3,
        "approval_item_id": 3,
        "category": "Food",
        "description": "Meals during travel",
        "amount": 3500,
        "expense_date": "2025-11-11",
        "receipt_attached": false,
        "item_status": "Pending"
      },
      {
        "item_id": 4,
        "approval_item_id": 4,
        "category": "Cab",
        "description": "Local travel in Mumbai",
        "amount": 1500,
        "expense_date": "2025-11-12",
        "receipt_attached": true,
        "item_status": "Pending"
      }
    ],
    "policy_info": {
      "policy_name": "Sales Team Policy",
      "violations": [],
      "warnings": [
        {
          "item_id": 3,
          "message": "Receipt not attached for Food expense"
        }
      ]
    },
    "approval_flow": {
      "stages": [
        {
          "order": 1,
          "name": "Manager Approval",
          "status": "Current",
          "approver": "You"
        },
        {
          "order": 2,
          "name": "Finance Approval",
          "status": "Pending",
          "approver": "Finance Team"
        }
      ]
    },
    "history": [
      {
        "action": "Submitted",
        "by": "John Employee",
        "at": "2025-11-13T10:00:00.000Z"
      }
    ],
    "actions_available": {
      "can_approve_all": true,
      "can_reject_all": true,
      "can_approve_partial": true,
      "can_send_back": true,
      "can_modify_amount": false,
      "can_request_documents": true
    }
  }
}
```

---

#### 12. Take Approval Action
**Endpoint:** `POST /api/expense/approver/action`

**Request Body (Approve All):**
```json
{
  "approval_request_id": 101,
  "action": "Approve",
  "scope": "All",
  "comments": "Approved. Expenses are within policy."
}
```

**Request Body (Partial Approval - Item Level):**
```json
{
  "approval_request_id": 101,
  "action": "Partial",
  "items": [
    {
      "approval_item_id": 1,
      "action": "Approve",
      "comments": "OK"
    },
    {
      "approval_item_id": 2,
      "action": "Approve",
      "approved_amount": 6000,
      "modification_reason": "Reduced to standard hotel rate"
    },
    {
      "approval_item_id": 3,
      "action": "Reject",
      "rejection_reason": "No receipt attached"
    },
    {
      "approval_item_id": 4,
      "action": "Approve"
    }
  ],
  "overall_comments": "Partially approved. Food expense rejected due to missing receipt."
}
```

**Request Body (Send Back):**
```json
{
  "approval_request_id": 101,
  "action": "Send_Back",
  "scope": "Specific_Items",
  "item_ids": [3],
  "send_back_reason": "Please attach receipt for food expense"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    "approval_request_id": 101,
    "new_status": "Partially_Approved",
    "summary": {
      "approved_items": 3,
      "approved_amount": 19500,
      "rejected_items": 1,
      "rejected_amount": 3500
    },
    "next_stage": {
      "stage_name": "Finance Approval",
      "assigned_to": ["Finance Team"]
    }
  }
}
```

---

#### 13. Delegate Approval
**Endpoint:** `POST /api/expense/approver/delegate`

**Request Body:**
```json
{
  "approval_request_id": 101,
  "delegate_to_user_id": 55,
  "delegation_reason": "Out of office, delegating to team lead"
}
```

---

#### 14. Get Approval History
**Endpoint:** `POST /api/expense/approver/history`

**Request Body:**
```json
{
  "date_from": "2025-10-01",
  "date_to": "2025-11-30",
  "action": "Approved",
  "limit": 50,
  "offset": 0
}
```

---

#### 15. Set Delegation (Out of Office)
**Endpoint:** `POST /api/expense/approver/delegation/set`

**Request Body:**
```json
{
  "delegate_to_user_id": 55,
  "effective_from": "2025-11-20",
  "effective_to": "2025-11-25",
  "delegation_scope": "All",
  "delegation_reason": "On vacation"
}
```

---

### Admin APIs - Monitoring

#### 16. Get Pending Approvals Summary (Admin)
**Endpoint:** `POST /api/expense/admin/approvals/pending-summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_pending": 45,
    "total_amount_pending": 850000,
    "overdue": 8,
    "by_stage": [
      {"stage_name": "Manager Approval", "count": 30, "amount": 500000},
      {"stage_name": "Finance Approval", "count": 12, "amount": 300000},
      {"stage_name": "CFO Approval", "count": 3, "amount": 50000}
    ],
    "by_department": [
      {"department": "Sales", "count": 20, "amount": 400000},
      {"department": "Marketing", "count": 15, "amount": 250000}
    ],
    "sla_status": {
      "within_sla": 35,
      "breaching_soon": 10,
      "breached": 8
    }
  }
}
```

---

#### 17. Get Approver Performance
**Endpoint:** `POST /api/expense/admin/approvals/approver-performance`

**Request Body:**
```json
{
  "date_from": "2025-10-01",
  "date_to": "2025-11-30"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "approver_id": 50,
      "approver_name": "John Manager",
      "total_assigned": 100,
      "approved": 85,
      "rejected": 10,
      "sent_back": 5,
      "avg_response_time_hours": 24,
      "sla_compliance_percentage": 95
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
│       ├── ExpenseApprovalWorkflow.js
│       ├── ExpenseApprovalWorkflowStage.js
│       ├── ExpenseWorkflowCategoryMapping.js
│       ├── ExpenseApprovalRequest.js
│       ├── ExpenseApprovalRequestItem.js
│       ├── ExpenseApprovalHistory.js
│       ├── ExpenseApprovalPending.js
│       └── ExpenseApprovalDelegate.js
│
└── microservices/
    └── expense/
        ├── controllers/
        │   ├── admin/
        │   │   └── expenseWorkflow.controller.js
        │   └── approver/
        │       └── approval.controller.js
        ├── services/
        │   ├── expenseWorkflow.service.js
        │   ├── approvalEngine.service.js
        │   ├── approvalAction.service.js
        │   └── escalation.service.js
        └── routes/
            ├── admin.expense.routes.js
            └── approver.expense.routes.js
```

---

## Core Service Functions

### approvalEngine.service.js

```javascript
/**
 * Initialize approval flow when expense is submitted
 */
async function initializeApprovalFlow(expenseRequestId, employeeId) {
  // 1. Determine applicable workflow
  // 2. Create approval_request record
  // 3. Create approval_request_items for each line item
  // 4. Determine first stage approvers
  // 5. Create pending records for approvers
  // 6. Send notifications
}

/**
 * Process approval action
 */
async function processApprovalAction(approvalRequestId, action, items, userId) {
  // 1. Validate action is allowed
  // 2. Update item statuses
  // 3. Calculate approved/rejected amounts
  // 4. Check if stage complete
  // 5. Move to next stage or complete workflow
  // 6. Update pending records
  // 7. Log history
  // 8. Send notifications
}

/**
 * Handle escalation
 */
async function handleEscalation(approvalRequestId) {
  // 1. Find escalation target
  // 2. Reassign pending to escalation target
  // 3. Log escalation
  // 4. Send notifications
}

/**
 * Calculate final request status
 */
function calculateRequestStatus(items) {
  const approved = items.filter(i => i.status === 'Approved').length;
  const rejected = items.filter(i => i.status === 'Rejected').length;
  const pending = items.filter(i => i.status === 'Pending').length;

  if (pending > 0) return 'In_Progress';
  if (approved === items.length) return 'Fully_Approved';
  if (rejected === items.length) return 'Rejected';
  return 'Partially_Approved';
}
```

---

## Workflow Execution Flow

```
1. Employee Submits Expense Request
   ↓
2. System Determines Applicable Workflow
   - Check category-specific mapping
   - Check policy workflow mapping
   - Fall back to default workflow
   ↓
3. Initialize Approval Flow
   - Create approval_request
   - Create approval_request_items for each expense item
   - Determine Stage 1 approvers
   ↓
4. Stage 1 Processing
   ├── Auto-Approve Check (if amount ≤ auto_approve_max)
   │   └── Skip to payment if auto-approved
   └── Assign to Approver(s)
       - Create pending records
       - Send notification
       - Start SLA timer
       ↓
5. Approver Takes Action
   ├── Approve All → All items approved
   ├── Reject All → All items rejected
   ├── Partial → Each item gets individual status
   └── Send Back → Items sent back for correction
   ↓
6. Post-Action Processing
   ├── If more stages applicable → Move to next stage
   ├── If all stages complete → Calculate final status
   └── Update amounts (approved, rejected, pending)
   ↓
7. Final Status
   ├── Fully_Approved → All items approved → Ready for payment
   ├── Partially_Approved → Some approved → Approved amount for payment
   └── Rejected → Nothing for payment
```

---

## Success Criteria

### Technical:
- Line item level approval working
- Partial approval correctly calculates payable amount
- Amount-based stage activation
- Escalation mechanism
- SLA tracking and breach alerts
- Complete audit history

### Functional:
- Approvers can approve/reject individual items
- Partial approval results in correct payment amount
- Category-specific workflows work
- Delegation works during leave
- Dashboard shows pending with SLA status

---

**Estimated Duration:** 4-5 days
**Priority:** High
**Dependencies:** Phase 1.2 (Categories), Phase 2.1 (Policies)
