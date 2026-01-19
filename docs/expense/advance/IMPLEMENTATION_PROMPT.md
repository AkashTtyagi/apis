# Phase 3.1: Advance Payment Management - Implementation Prompt

## Overview
Implement Advance Payment Management module for the Expense Management system. This module allows employees to request advance money before trips/projects, tracks disbursement, manages settlement against actual expenses, and handles recovery of unsettled advances.

---

## Task Description

You are implementing the **Advance Payment Management** module for an HRMS Expense Management system. This module allows:
1. Employees to request advance payments for upcoming trips/projects
2. Approval workflow for advance requests (using Expense Workflow engine)
3. Finance team to track disbursement of advances
4. Settlement of advances against actual expenses
5. Recovery of unsettled/excess advances (via payroll or direct)
6. Handling of multiple advances per employee
7. Partial settlement and carry-forward

---

## Key Concepts

### Advance Lifecycle
```
1. REQUEST → Employee submits advance request
      ↓
2. APPROVAL → Goes through approval workflow
      ↓
3. APPROVED → Request approved, ready for disbursement
      ↓
4. DISBURSED → Finance transfers money to employee
      ↓
5. UTILIZED → Employee uses money for expenses
      ↓
6. SETTLEMENT → Employee files expenses, advance is adjusted
      ↓
7. SETTLED/RECOVERY → Fully settled OR excess recovered
```

### Settlement Scenarios

**Scenario 1: Advance = Expenses (Perfect Match)**
```
Advance: ₹10,000
Expenses: ₹10,000
Settlement: ₹0 (Fully Settled)
```

**Scenario 2: Advance < Expenses (Shortfall)**
```
Advance: ₹10,000
Expenses: ₹12,000
Reimbursement Due: ₹2,000
```

**Scenario 3: Advance > Expenses (Excess)**
```
Advance: ₹10,000
Expenses: ₹7,000
Recovery Required: ₹3,000 (via payroll/cash)
```

**Scenario 4: Partial Settlement**
```
Advance: ₹10,000
Expenses Filed So Far: ₹6,000
Pending Settlement: ₹4,000 (can file more expenses or recover)
```

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **Phase 2.1:** Expense Policy Management (for advance limits)
- **Expense Workflow:** For advance approval
- **HRMS Payroll:** For recovery via salary deduction (optional integration)

---

## Database Schema

### Table 1: `hrms_expense_advance_requests`
Main advance request table.

```sql
CREATE TABLE hrms_expense_advance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Request Identification
  advance_number VARCHAR(50) NOT NULL COMMENT 'Unique advance request number (ADV-2025-00001)',

  -- Employee Details
  employee_id INT NOT NULL COMMENT 'FK to hrms_employees',

  -- Advance Details
  advance_type ENUM('Travel', 'Project', 'Training', 'Relocation', 'Medical', 'Other')
    NOT NULL DEFAULT 'Travel',
  purpose TEXT NOT NULL COMMENT 'Purpose of advance',

  -- Trip/Project Details (for Travel/Project type)
  trip_start_date DATE,
  trip_end_date DATE,
  trip_destination VARCHAR(255),
  project_code VARCHAR(50),

  -- Amount Details
  requested_amount DECIMAL(15,2) NOT NULL,
  approved_amount DECIMAL(15,2) COMMENT 'May be different from requested',
  disbursed_amount DECIMAL(15,2) DEFAULT 0,

  -- Currency
  currency_id INT NOT NULL COMMENT 'FK to hrms_expense_currencies',
  exchange_rate DECIMAL(18,8) DEFAULT 1 COMMENT 'Rate at time of request',
  base_currency_amount DECIMAL(15,2) COMMENT 'Amount in base currency',

  -- Policy Reference
  policy_id INT COMMENT 'FK to hrms_expense_policies',
  max_advance_allowed DECIMAL(15,2) COMMENT 'Max allowed per policy',

  -- Settlement Details
  settlement_due_date DATE COMMENT 'When advance must be settled',
  settlement_status ENUM(
    'Pending_Settlement',
    'Partial_Settlement',
    'Fully_Settled',
    'Over_Settled',
    'Recovery_Pending',
    'Recovery_In_Progress',
    'Recovered',
    'Written_Off'
  ) DEFAULT 'Pending_Settlement',

  -- Settlement Amounts
  total_expenses_filed DECIMAL(15,2) DEFAULT 0,
  total_expenses_approved DECIMAL(15,2) DEFAULT 0,
  settled_amount DECIMAL(15,2) DEFAULT 0,
  balance_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Positive=Due to employee, Negative=Recovery needed',

  -- Recovery Details
  recovery_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Amount to be recovered',
  recovered_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Amount already recovered',
  recovery_method ENUM('Payroll', 'Cash', 'Bank_Transfer', 'Adjustment') COMMENT 'How recovery will happen',
  recovery_installments INT DEFAULT 1 COMMENT 'Number of installments for recovery',

  -- Request Status
  request_status ENUM(
    'Draft',
    'Submitted',
    'Pending_Approval',
    'Approved',
    'Rejected',
    'Pending_Disbursement',
    'Disbursed',
    'Cancelled',
    'Closed'
  ) DEFAULT 'Draft',

  -- Workflow
  workflow_id INT COMMENT 'FK to hrms_expense_approval_workflows',
  current_approver_id INT,

  -- Timestamps
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by INT,
  rejected_at TIMESTAMP,
  rejected_by INT,
  rejection_reason TEXT,
  disbursed_at TIMESTAMP,
  disbursed_by INT,
  settled_at TIMESTAMP,
  closed_at TIMESTAMP,

  -- Attachments
  supporting_documents JSON COMMENT 'Array of document URLs',

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by INT,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_advance_number (advance_number),
  INDEX idx_employee (employee_id),
  INDEX idx_request_status (request_status),
  INDEX idx_settlement_status (settlement_status),
  INDEX idx_trip_dates (trip_start_date, trip_end_date),
  INDEX idx_settlement_due (settlement_due_date),
  UNIQUE INDEX idx_company_advance_number (company_id, advance_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_advance_disbursements`
Tracks disbursement of approved advances.

```sql
CREATE TABLE hrms_expense_advance_disbursements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  advance_request_id INT NOT NULL COMMENT 'FK to hrms_expense_advance_requests',

  -- Disbursement Details
  disbursement_number VARCHAR(50) NOT NULL,
  disbursement_date DATE NOT NULL,
  disbursement_amount DECIMAL(15,2) NOT NULL,

  -- Payment Details
  payment_method ENUM('Bank_Transfer', 'Cheque', 'Cash', 'Digital_Wallet') NOT NULL,
  bank_account_id INT COMMENT 'Employee bank account used',
  transaction_reference VARCHAR(100) COMMENT 'Bank transaction ID',
  cheque_number VARCHAR(50),
  cheque_date DATE,

  -- Status
  disbursement_status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Pending',
  failure_reason TEXT,

  -- Processed By
  processed_by INT NOT NULL,
  processed_at TIMESTAMP,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_disbursement_advance FOREIGN KEY (advance_request_id)
    REFERENCES hrms_expense_advance_requests(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_advance_request (advance_request_id),
  INDEX idx_disbursement_number (disbursement_number),
  INDEX idx_disbursement_status (disbursement_status),
  INDEX idx_disbursement_date (disbursement_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 3: `hrms_expense_advance_settlements`
Tracks settlement of advances against expenses.

```sql
CREATE TABLE hrms_expense_advance_settlements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  advance_request_id INT NOT NULL COMMENT 'FK to hrms_expense_advance_requests',

  -- Settlement Reference
  settlement_number VARCHAR(50) NOT NULL,
  settlement_date DATE NOT NULL,

  -- Expense Reference (what this settlement is for)
  expense_request_id INT COMMENT 'FK to hrms_expense_requests - if settling against expense',
  expense_item_id INT COMMENT 'FK to specific expense item',

  -- Settlement Amount
  settlement_amount DECIMAL(15,2) NOT NULL COMMENT 'Amount being settled',
  settlement_type ENUM('Expense_Adjustment', 'Cash_Return', 'Payroll_Deduction', 'Write_Off') NOT NULL,

  -- Running Balance
  advance_balance_before DECIMAL(15,2),
  advance_balance_after DECIMAL(15,2),

  -- Notes
  settlement_notes TEXT,

  -- Status
  settlement_status ENUM('Pending', 'Completed', 'Reversed') DEFAULT 'Completed',

  -- Processed By
  processed_by INT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_settlement_advance FOREIGN KEY (advance_request_id)
    REFERENCES hrms_expense_advance_requests(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_advance_request (advance_request_id),
  INDEX idx_expense_request (expense_request_id),
  INDEX idx_settlement_date (settlement_date),
  INDEX idx_settlement_type (settlement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 4: `hrms_expense_advance_recovery`
Tracks recovery of unsettled/excess advances.

```sql
CREATE TABLE hrms_expense_advance_recovery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  advance_request_id INT NOT NULL COMMENT 'FK to hrms_expense_advance_requests',

  -- Recovery Details
  recovery_number VARCHAR(50) NOT NULL,
  total_recovery_amount DECIMAL(15,2) NOT NULL COMMENT 'Total amount to recover',
  installments INT DEFAULT 1,
  installment_amount DECIMAL(15,2) COMMENT 'Amount per installment',

  -- Recovery Method
  recovery_method ENUM('Payroll_Single', 'Payroll_EMI', 'Cash', 'Bank_Transfer', 'Cheque') NOT NULL,

  -- Payroll Integration
  start_payroll_month DATE COMMENT 'Month to start payroll deduction',
  end_payroll_month DATE COMMENT 'Month recovery ends',
  payroll_processed TINYINT(1) DEFAULT 0 COMMENT '1=Sent to payroll system',

  -- Recovery Status
  recovery_status ENUM('Pending', 'In_Progress', 'Completed', 'Cancelled', 'Written_Off') DEFAULT 'Pending',
  recovered_amount DECIMAL(15,2) DEFAULT 0,
  pending_amount DECIMAL(15,2),

  -- Employee Acknowledgment
  employee_acknowledged TINYINT(1) DEFAULT 0,
  acknowledged_at TIMESTAMP,

  -- Initiated By
  initiated_by INT NOT NULL,
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_recovery_advance FOREIGN KEY (advance_request_id)
    REFERENCES hrms_expense_advance_requests(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_advance_request (advance_request_id),
  INDEX idx_recovery_status (recovery_status),
  INDEX idx_payroll_month (start_payroll_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 5: `hrms_expense_advance_recovery_transactions`
Individual recovery transaction records.

```sql
CREATE TABLE hrms_expense_advance_recovery_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recovery_id INT NOT NULL COMMENT 'FK to hrms_expense_advance_recovery',
  advance_request_id INT NOT NULL,

  -- Transaction Details
  transaction_date DATE NOT NULL,
  transaction_amount DECIMAL(15,2) NOT NULL,
  installment_number INT,

  -- Payment Details
  payment_method ENUM('Payroll', 'Cash', 'Bank_Transfer', 'Cheque') NOT NULL,
  payroll_month DATE COMMENT 'If recovered via payroll',
  transaction_reference VARCHAR(100),

  -- Running Balance
  balance_before DECIMAL(15,2),
  balance_after DECIMAL(15,2),

  -- Status
  transaction_status ENUM('Pending', 'Completed', 'Failed', 'Reversed') DEFAULT 'Completed',

  -- Notes
  notes TEXT,

  -- Processed By
  processed_by INT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_recovery_txn_recovery FOREIGN KEY (recovery_id)
    REFERENCES hrms_expense_advance_recovery(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_recovery (recovery_id),
  INDEX idx_advance_request (advance_request_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_payroll_month (payroll_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 6: `hrms_expense_advance_policy`
Advance-specific policy settings.

```sql
CREATE TABLE hrms_expense_advance_policy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Policy Reference (can be linked to expense policy or standalone)
  expense_policy_id INT COMMENT 'FK to hrms_expense_policies',

  -- Advance Limits
  allow_advance_requests TINYINT(1) DEFAULT 1,
  max_advance_amount DECIMAL(15,2) COMMENT 'Maximum single advance',
  max_advance_percentage DECIMAL(5,2) DEFAULT 80.00 COMMENT '% of estimated expense',
  max_open_advances INT DEFAULT 2 COMMENT 'Max concurrent unsettled advances',
  max_total_outstanding DECIMAL(15,2) COMMENT 'Max total outstanding across all advances',

  -- Advance Types Allowed
  allowed_advance_types JSON DEFAULT '["Travel", "Project", "Training"]',

  -- Settlement Rules
  settlement_due_days INT DEFAULT 15 COMMENT 'Days after trip end to settle',
  auto_reminder_days JSON DEFAULT '[7, 3, 1]' COMMENT 'Days before due to send reminders',
  grace_period_days INT DEFAULT 5 COMMENT 'Extra days before recovery starts',

  -- Recovery Rules
  auto_recovery_enabled TINYINT(1) DEFAULT 1,
  recovery_method ENUM('Payroll_Single', 'Payroll_EMI', 'Manual') DEFAULT 'Payroll_Single',
  max_recovery_installments INT DEFAULT 3,
  max_payroll_deduction_percentage DECIMAL(5,2) DEFAULT 50.00
    COMMENT 'Max % of salary that can be deducted',

  -- Approval Rules
  advance_approval_workflow_id INT COMMENT 'Specific workflow for advances',
  require_manager_approval TINYINT(1) DEFAULT 1,
  require_finance_approval TINYINT(1) DEFAULT 1,
  finance_approval_above DECIMAL(15,2) DEFAULT 10000.00,

  -- Documentation
  require_trip_details TINYINT(1) DEFAULT 1,
  require_estimated_expenses TINYINT(1) DEFAULT 0,
  require_supporting_docs TINYINT(1) DEFAULT 0,

  -- Grade-Based Limits (JSON for flexibility)
  grade_wise_limits JSON COMMENT '[{"grade_id": 1, "max_amount": 50000}, ...]',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_company (company_id),
  INDEX idx_expense_policy (expense_policy_id),
  UNIQUE INDEX idx_company_policy (company_id, expense_policy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 7: `hrms_expense_advance_expense_link`
Links advance requests to expense requests for settlement tracking.

```sql
CREATE TABLE hrms_expense_advance_expense_link (
  id INT PRIMARY KEY AUTO_INCREMENT,
  advance_request_id INT NOT NULL COMMENT 'FK to hrms_expense_advance_requests',
  expense_request_id INT NOT NULL COMMENT 'FK to hrms_expense_requests',

  -- Link Type
  link_type ENUM('Full_Settlement', 'Partial_Settlement', 'Reference_Only') DEFAULT 'Partial_Settlement',

  -- Settlement Amount
  settlement_amount DECIMAL(15,2) NOT NULL COMMENT 'Amount of advance settled by this expense',

  -- Status
  is_active TINYINT(1) DEFAULT 1,

  -- Audit
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_link_advance FOREIGN KEY (advance_request_id)
    REFERENCES hrms_expense_advance_requests(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_advance (advance_request_id),
  INDEX idx_expense (expense_request_id),
  UNIQUE INDEX idx_advance_expense (advance_request_id, expense_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Employee APIs

#### 1. Create Advance Request (Draft)
**Endpoint:** `POST /api/expense/employee/advances/create`

**Request Body:**
```json
{
  "advance_type": "Travel",
  "purpose": "Client visit to Mumbai for project kickoff meeting",
  "trip_start_date": "2025-12-01",
  "trip_end_date": "2025-12-05",
  "trip_destination": "Mumbai, Maharashtra",
  "project_code": "PROJ-2025-001",
  "requested_amount": 25000,
  "currency_id": 1,
  "estimated_expenses": [
    {"category": "Travel", "amount": 12000},
    {"category": "Hotel", "amount": 8000},
    {"category": "Food", "amount": 3000},
    {"category": "Local Conveyance", "amount": 2000}
  ],
  "supporting_documents": ["url1", "url2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Advance request created successfully",
  "data": {
    "id": 1,
    "advance_number": "ADV-2025-00001",
    "request_status": "Draft",
    "requested_amount": 25000,
    "max_allowed": 20000,
    "policy_message": "Maximum advance is 80% of estimated expenses",
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

**Validations:**
- Check policy limits (max amount, max percentage)
- Check existing open advances
- Check total outstanding
- Validate trip dates (future dates only for Travel)

---

#### 2. Submit Advance Request
**Endpoint:** `POST /api/expense/employee/advances/submit`

**Request Body:**
```json
{
  "advance_request_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Advance request submitted for approval",
  "data": {
    "id": 1,
    "advance_number": "ADV-2025-00001",
    "request_status": "Pending_Approval",
    "submitted_at": "2025-11-13T10:00:00.000Z",
    "approval_flow": {
      "current_stage": 1,
      "current_approver": "John Manager",
      "total_stages": 2
    }
  }
}
```

---

#### 3. Get My Advances
**Endpoint:** `POST /api/expense/employee/advances/list`

**Request Body:**
```json
{
  "request_status": "Disbursed",
  "settlement_status": "Pending_Settlement",
  "date_from": "2025-01-01",
  "date_to": "2025-12-31",
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
      "total_outstanding": 35000,
      "pending_settlement": 2,
      "overdue_settlements": 1
    },
    "advances": [
      {
        "id": 1,
        "advance_number": "ADV-2025-00001",
        "advance_type": "Travel",
        "purpose": "Client visit to Mumbai",
        "trip_dates": "Dec 01-05, 2025",
        "requested_amount": 25000,
        "approved_amount": 20000,
        "disbursed_amount": 20000,
        "request_status": "Disbursed",
        "settlement_status": "Pending_Settlement",
        "settlement_due_date": "2025-12-20",
        "days_to_due": 7,
        "is_overdue": false,
        "expenses_filed": 15000,
        "balance": 5000
      }
    ]
  },
  "pagination": {...}
}
```

---

#### 4. Get Advance Details
**Endpoint:** `POST /api/expense/employee/advances/details`

**Request Body:**
```json
{
  "advance_request_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "advance": {
      "id": 1,
      "advance_number": "ADV-2025-00001",
      "advance_type": "Travel",
      "purpose": "Client visit to Mumbai for project kickoff meeting",
      "trip_start_date": "2025-12-01",
      "trip_end_date": "2025-12-05",
      "trip_destination": "Mumbai, Maharashtra",
      "project_code": "PROJ-2025-001",
      "requested_amount": 25000,
      "approved_amount": 20000,
      "disbursed_amount": 20000,
      "currency": "INR",
      "request_status": "Disbursed",
      "settlement_status": "Partial_Settlement",
      "settlement_due_date": "2025-12-20"
    },
    "disbursements": [
      {
        "id": 1,
        "disbursement_date": "2025-11-28",
        "amount": 20000,
        "payment_method": "Bank_Transfer",
        "transaction_reference": "TXN123456"
      }
    ],
    "settlement_summary": {
      "total_expenses_filed": 15000,
      "total_expenses_approved": 12000,
      "settled_amount": 12000,
      "balance_amount": 8000,
      "status": "Pending_Settlement"
    },
    "linked_expenses": [
      {
        "expense_request_id": 101,
        "expense_number": "EXP-2025-00101",
        "amount": 15000,
        "approved_amount": 12000,
        "settlement_amount": 12000,
        "status": "Approved"
      }
    ],
    "approval_history": [...],
    "can_edit": false,
    "can_cancel": false,
    "can_settle": true
  }
}
```

---

#### 5. Cancel Advance Request
**Endpoint:** `POST /api/expense/employee/advances/cancel`

**Request Body:**
```json
{
  "advance_request_id": 1,
  "cancellation_reason": "Trip cancelled due to client reschedule"
}
```

---

#### 6. Get Open Advances for Expense Settlement
**Endpoint:** `POST /api/expense/employee/advances/for-settlement`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "advance_number": "ADV-2025-00001",
      "purpose": "Client visit to Mumbai",
      "disbursed_amount": 20000,
      "balance_amount": 8000,
      "settlement_due_date": "2025-12-20",
      "can_settle": true
    }
  ]
}
```

---

### Admin/Finance APIs

#### 7. Get All Advance Requests (Admin)
**Endpoint:** `POST /api/expense/admin/advances/list`

**Request Body:**
```json
{
  "request_status": ["Approved", "Pending_Disbursement"],
  "settlement_status": null,
  "employee_id": null,
  "department_id": 1,
  "date_from": "2025-01-01",
  "date_to": "2025-12-31",
  "overdue_only": false,
  "limit": 50,
  "offset": 0
}
```

---

#### 8. Get Advance Details (Admin)
**Endpoint:** `POST /api/expense/admin/advances/details`

---

#### 9. Process Disbursement
**Endpoint:** `POST /api/expense/admin/advances/disburse`

**Request Body:**
```json
{
  "advance_request_id": 1,
  "disbursement_amount": 20000,
  "disbursement_date": "2025-11-28",
  "payment_method": "Bank_Transfer",
  "bank_account_id": 1,
  "transaction_reference": "TXN123456",
  "notes": "Disbursed via NEFT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Advance disbursed successfully",
  "data": {
    "advance_request_id": 1,
    "disbursement_id": 1,
    "disbursement_number": "DIS-2025-00001",
    "amount": 20000,
    "new_status": "Disbursed"
  }
}
```

---

#### 10. Process Settlement
**Endpoint:** `POST /api/expense/admin/advances/settle`

**Request Body:**
```json
{
  "advance_request_id": 1,
  "settlement_type": "Expense_Adjustment",
  "expense_request_id": 101,
  "settlement_amount": 12000,
  "notes": "Settled against expense request EXP-2025-00101"
}
```

---

#### 11. Initiate Recovery
**Endpoint:** `POST /api/expense/admin/advances/initiate-recovery`

**Request Body:**
```json
{
  "advance_request_id": 1,
  "recovery_amount": 8000,
  "recovery_method": "Payroll_EMI",
  "installments": 2,
  "start_payroll_month": "2026-01-01",
  "notes": "Recovering excess advance in 2 installments"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recovery initiated successfully",
  "data": {
    "recovery_id": 1,
    "recovery_number": "REC-2025-00001",
    "total_amount": 8000,
    "installments": 2,
    "installment_amount": 4000,
    "schedule": [
      {"month": "January 2026", "amount": 4000},
      {"month": "February 2026", "amount": 4000}
    ]
  }
}
```

---

#### 12. Record Recovery Transaction
**Endpoint:** `POST /api/expense/admin/advances/record-recovery`

**Request Body:**
```json
{
  "recovery_id": 1,
  "transaction_date": "2026-01-31",
  "transaction_amount": 4000,
  "installment_number": 1,
  "payment_method": "Payroll",
  "payroll_month": "2026-01-01",
  "transaction_reference": "PAY-2026-01-EMP001",
  "notes": "Deducted from January 2026 salary"
}
```

---

#### 13. Get Pending Disbursements
**Endpoint:** `POST /api/expense/admin/advances/pending-disbursements`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_pending": 5,
      "total_amount": 125000
    },
    "advances": [
      {
        "id": 2,
        "advance_number": "ADV-2025-00002",
        "employee_name": "Jane Doe",
        "employee_code": "EMP002",
        "department": "Sales",
        "approved_amount": 30000,
        "approved_at": "2025-11-27",
        "trip_start_date": "2025-12-05",
        "urgency": "High",
        "bank_details": {
          "bank_name": "HDFC Bank",
          "account_number": "****1234",
          "ifsc": "HDFC0001234"
        }
      }
    ]
  }
}
```

---

#### 14. Get Overdue Settlements
**Endpoint:** `POST /api/expense/admin/advances/overdue-settlements`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_overdue": 8,
      "total_outstanding": 85000,
      "oldest_overdue_days": 45
    },
    "advances": [
      {
        "id": 3,
        "advance_number": "ADV-2025-00003",
        "employee_name": "Bob Smith",
        "employee_code": "EMP003",
        "disbursed_amount": 15000,
        "balance_amount": 15000,
        "settlement_due_date": "2025-10-15",
        "days_overdue": 30,
        "expenses_filed": 0,
        "last_reminder_sent": "2025-10-20",
        "reminders_sent": 3
      }
    ]
  }
}
```

---

#### 15. Get Recovery Dashboard
**Endpoint:** `POST /api/expense/admin/advances/recovery-dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_recovery_pending": 150000,
      "recovery_in_progress": 80000,
      "this_month_recoveries": 25000,
      "employees_with_pending_recovery": 12
    },
    "upcoming_recoveries": [
      {
        "recovery_id": 1,
        "advance_number": "ADV-2025-00001",
        "employee_name": "John Doe",
        "installment_amount": 4000,
        "payroll_month": "January 2026",
        "installment_number": "1 of 2"
      }
    ],
    "by_department": [
      {"department": "Sales", "pending_recovery": 50000},
      {"department": "Marketing", "pending_recovery": 30000}
    ]
  }
}
```

---

#### 16. Bulk Disbursement
**Endpoint:** `POST /api/expense/admin/advances/bulk-disburse`

**Request Body:**
```json
{
  "disbursements": [
    {
      "advance_request_id": 1,
      "disbursement_amount": 20000,
      "payment_method": "Bank_Transfer"
    },
    {
      "advance_request_id": 2,
      "disbursement_amount": 30000,
      "payment_method": "Bank_Transfer"
    }
  ],
  "disbursement_date": "2025-11-28",
  "notes": "Bulk disbursement for December travel"
}
```

---

#### 17. Generate Bank File for Disbursement
**Endpoint:** `POST /api/expense/admin/advances/generate-bank-file`

**Request Body:**
```json
{
  "advance_request_ids": [1, 2, 3],
  "bank_format": "HDFC_H2H",
  "value_date": "2025-11-28"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_url": "https://storage/bank-files/ADV_BATCH_20251128.txt",
    "file_name": "ADV_BATCH_20251128.txt",
    "total_records": 3,
    "total_amount": 75000,
    "format": "HDFC_H2H"
  }
}
```

---

#### 18. Get Advance Policy
**Endpoint:** `POST /api/expense/admin/advances/policy/get`

---

#### 19. Update Advance Policy
**Endpoint:** `POST /api/expense/admin/advances/policy/update`

**Request Body:**
```json
{
  "policy_id": 1,
  "max_advance_amount": 100000,
  "max_advance_percentage": 80,
  "max_open_advances": 2,
  "settlement_due_days": 15,
  "auto_recovery_enabled": true,
  "recovery_method": "Payroll_EMI",
  "max_recovery_installments": 3,
  "grade_wise_limits": [
    {"grade_id": 1, "max_amount": 50000},
    {"grade_id": 2, "max_amount": 30000},
    {"grade_id": 3, "max_amount": 20000}
  ]
}
```

---

#### 20. Write-Off Advance
**Endpoint:** `POST /api/expense/admin/advances/write-off`

**Request Body:**
```json
{
  "advance_request_id": 5,
  "write_off_amount": 5000,
  "write_off_reason": "Employee terminated, recovery not possible",
  "approval_reference": "HR-APPROVAL-001"
}
```

---

## Settlement Flow When Filing Expenses

When an employee files an expense, the system should:

```javascript
async function handleExpenseSubmission(expenseRequest) {
  // 1. Check if employee has open advances
  const openAdvances = await getOpenAdvances(expenseRequest.employee_id);

  if (openAdvances.length > 0) {
    // 2. Prompt employee to link expense to advance
    // or auto-link based on trip dates/project code

    // 3. When expense is approved:
    //    - Create settlement record
    //    - Update advance balance
    //    - If balance becomes 0, mark as Fully_Settled
    //    - If balance negative (expense > advance), calculate reimbursement
  }
}
```

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── ExpenseAdvanceRequest.js
│       ├── ExpenseAdvanceDisbursement.js
│       ├── ExpenseAdvanceSettlement.js
│       ├── ExpenseAdvanceRecovery.js
│       ├── ExpenseAdvanceRecoveryTransaction.js
│       ├── ExpenseAdvancePolicy.js
│       └── ExpenseAdvanceExpenseLink.js
│
└── microservices/
    └── expense/
        ├── controllers/
        │   ├── employee/
        │   │   └── advance.controller.js
        │   └── admin/
        │       └── advance.controller.js
        ├── services/
        │   ├── advance.service.js
        │   ├── advanceDisbursement.service.js
        │   ├── advanceSettlement.service.js
        │   ├── advanceRecovery.service.js
        │   └── advancePolicy.service.js
        └── routes/
            ├── employee.expense.routes.js
            └── admin.expense.routes.js
```

---

## Implementation Steps

### Step 1: Create Models (Day 1)
All 7 tables with proper associations

### Step 2: Create Services (Day 2-3)

**advance.service.js:**
- `createAdvanceRequest`
- `submitAdvanceRequest`
- `getAdvanceDetails`
- `cancelAdvanceRequest`
- `getOpenAdvancesForEmployee`

**advanceDisbursement.service.js:**
- `processDisbursement`
- `bulkDisburse`
- `generateBankFile`
- `getPendingDisbursements`

**advanceSettlement.service.js:**
- `processSettlement`
- `linkExpenseToAdvance`
- `calculateSettlementAmount`
- `getOverdueSettlements`

**advanceRecovery.service.js:**
- `initiateRecovery`
- `recordRecoveryTransaction`
- `getRecoverySchedule`
- `processPayrollRecovery`

### Step 3: Create Controllers & Routes (Day 3-4)

### Step 4: Integration with Expense Module (Day 4)
- Link advance to expense on expense submission
- Auto-settlement on expense approval

### Step 5: Testing (Day 5)
- Complete lifecycle testing
- Settlement scenarios
- Recovery scenarios

---

## Success Criteria

### Technical:
- Advance lifecycle working end-to-end
- Settlement calculations correct
- Recovery mechanism working
- Bank file generation
- Integration with expense module

### Functional:
- Employees can request and track advances
- Finance can disburse and track
- Auto-settlement against expenses
- Recovery via payroll or manual
- Reports for outstanding advances

---

**Estimated Duration:** 4-5 days
**Priority:** High
**Dependencies:** Phase 2.1 (Policies), Expense Workflow
