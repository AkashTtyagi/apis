# Phase 4.1: Payment Processing & Admin Expense Management - Implementation Document

## Overview
This document covers the implementation of Payment Processing and Admin Expense Management for the Expense Management system. This module enables finance teams to process approved expenses for payment, generate bank files, track payment status, and manage the complete payment lifecycle including advance adjustments.

---

## Key Concepts

### Payment Lifecycle
```
1. EXPENSE APPROVED → Expense approved through workflow
        ↓
2. PAYMENT QUEUE → Added to payment processing queue
        ↓
3. ADVANCE CHECK → Check for outstanding advances to adjust
        ↓
4. PAYMENT BATCH → Grouped into payment batch/cycle
        ↓
5. BANK FILE GENERATED → Generate bank transfer file (NEFT/RTGS/IMPS)
        ↓
6. PAYMENT INITIATED → Sent to bank for processing
        ↓
7. PAYMENT COMPLETED → Bank confirms successful transfer
        ↓
8. RECONCILED → Payment reconciled with bank statement
```

### Payment Calculation
```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT CALCULATION                       │
├─────────────────────────────────────────────────────────────┤
│  Approved Expense Amount          :  ₹25,000                │
│  (-) Tax Deduction (if any)       :  ₹0                     │
│  (-) Advance Adjustment           :  ₹10,000                │
│  (-) Previous Overpayment         :  ₹0                     │
│  ─────────────────────────────────────────────────────────  │
│  Net Payable Amount               :  ₹15,000                │
│                                                              │
│  OR (If advance > expense)                                  │
│  ─────────────────────────────────────────────────────────  │
│  Approved Expense Amount          :  ₹8,000                 │
│  (-) Advance Adjustment           :  ₹10,000                │
│  ─────────────────────────────────────────────────────────  │
│  Recovery from Employee           :  ₹2,000                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table 1: hrms_expense_payment_batches (Payment Batch/Cycle)
```sql
CREATE TABLE hrms_expense_payment_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Batch Identification
    batch_number VARCHAR(50) NOT NULL COMMENT 'Unique batch number (PAY-BATCH-2025-001)',
    batch_name VARCHAR(255),
    batch_description TEXT,

    -- Batch Period
    payment_cycle_start DATE,
    payment_cycle_end DATE,
    cut_off_date DATE COMMENT 'Expenses approved before this date',

    -- Batch Type
    batch_type ENUM('Regular', 'Adhoc', 'Emergency', 'Month_End') DEFAULT 'Regular',

    -- Payment Method
    payment_method ENUM('Bank_Transfer', 'Cheque', 'Cash', 'Mixed') DEFAULT 'Bank_Transfer',
    bank_format ENUM('NEFT', 'RTGS', 'IMPS', 'UPI', 'Custom') DEFAULT 'NEFT',

    -- Source Bank Account
    source_bank_account_id INT COMMENT 'Company bank account',
    source_bank_name VARCHAR(100),
    source_account_number VARCHAR(50),

    -- Batch Totals
    total_requests INT DEFAULT 0,
    total_employees INT DEFAULT 0,
    total_gross_amount DECIMAL(15,2) DEFAULT 0.00,
    total_advance_adjusted DECIMAL(15,2) DEFAULT 0.00,
    total_deductions DECIMAL(15,2) DEFAULT 0.00,
    total_net_amount DECIMAL(15,2) DEFAULT 0.00,

    -- Payment Status Counts
    pending_count INT DEFAULT 0,
    processed_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,

    -- Batch Status
    batch_status ENUM(
        'Draft',
        'Ready',
        'Processing',
        'Bank_File_Generated',
        'Submitted_To_Bank',
        'Partially_Completed',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Draft',

    -- Bank File Details
    bank_file_name VARCHAR(255),
    bank_file_path VARCHAR(500),
    bank_file_generated_at DATETIME,
    bank_file_generated_by INT,

    -- Submission to Bank
    submitted_to_bank_at DATETIME,
    submitted_to_bank_by INT,
    bank_reference_number VARCHAR(100),

    -- Completion
    completed_at DATETIME,
    completed_by INT,

    -- Scheduling
    scheduled_payment_date DATE,
    actual_payment_date DATE,

    -- Audit fields
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    deleted_by INT,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_batch_number (company_id, batch_number),
    INDEX idx_batch_status (batch_status),
    INDEX idx_payment_date (scheduled_payment_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 2: hrms_expense_payments (Individual Payment Records)
```sql
CREATE TABLE hrms_expense_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Payment Identification
    payment_number VARCHAR(50) NOT NULL COMMENT 'Unique payment number',
    batch_id INT COMMENT 'FK to payment batch',

    -- Employee Details
    employee_id INT NOT NULL,

    -- Source Reference
    source_type ENUM('Expense_Report', 'Advance_Disbursement', 'Advance_Recovery') NOT NULL,
    expense_report_id INT COMMENT 'FK to hrms_expense_reports',
    advance_request_id INT COMMENT 'FK to hrms_expense_advance_requests',

    -- Amount Breakdown
    gross_amount DECIMAL(15,2) NOT NULL COMMENT 'Total approved amount',
    advance_adjusted DECIMAL(15,2) DEFAULT 0.00,
    tax_deduction DECIMAL(15,2) DEFAULT 0.00,
    other_deduction DECIMAL(15,2) DEFAULT 0.00,
    deduction_remarks VARCHAR(500),
    net_amount DECIMAL(15,2) NOT NULL COMMENT 'Final payable amount',

    -- Currency
    currency_id INT NOT NULL,
    exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
    base_currency_amount DECIMAL(15,2),

    -- Payment Direction
    payment_direction ENUM('To_Employee', 'From_Employee') DEFAULT 'To_Employee',

    -- Employee Bank Details (snapshot at payment time)
    bank_account_id INT COMMENT 'FK to employee bank account',
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    account_holder_name VARCHAR(255),

    -- Payment Status
    payment_status ENUM(
        'Pending',
        'Queued',
        'In_Batch',
        'Processing',
        'Completed',
        'Failed',
        'Reversed',
        'On_Hold',
        'Cancelled'
    ) DEFAULT 'Pending',

    -- Bank Transaction Details
    transaction_reference VARCHAR(100),
    utr_number VARCHAR(50) COMMENT 'Unique Transaction Reference',
    bank_response_code VARCHAR(20),
    bank_response_message VARCHAR(500),

    -- Processing Timestamps
    queued_at DATETIME,
    processed_at DATETIME,
    completed_at DATETIME,
    failed_at DATETIME,

    -- Failure Details
    failure_reason VARCHAR(500),
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at DATETIME,

    -- Hold Details
    hold_reason VARCHAR(500),
    held_by INT,
    held_at DATETIME,
    released_by INT,
    released_at DATETIME,

    -- Reversal Details
    is_reversed TINYINT(1) DEFAULT 0,
    reversal_reason VARCHAR(500),
    reversed_by INT,
    reversed_at DATETIME,
    reversal_reference VARCHAR(100),

    -- Reconciliation
    is_reconciled TINYINT(1) DEFAULT 0,
    reconciled_by INT,
    reconciled_at DATETIME,
    reconciliation_reference VARCHAR(100),

    -- Audit fields
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (batch_id) REFERENCES hrms_expense_payment_batches(id),
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (expense_report_id) REFERENCES hrms_expense_reports(id),
    UNIQUE KEY uk_payment_number (company_id, payment_number),
    INDEX idx_employee (employee_id),
    INDEX idx_batch (batch_id),
    INDEX idx_status (payment_status),
    INDEX idx_expense_report (expense_report_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 3: hrms_expense_payment_items (Payment Line Items)
```sql
CREATE TABLE hrms_expense_payment_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    payment_id INT NOT NULL,

    -- Item Reference
    expense_report_id INT,
    expense_item_id INT COMMENT 'FK to hrms_expense_report_items',
    advance_request_id INT,

    -- Item Details
    item_type ENUM('Expense', 'Advance_Adjustment', 'Advance_Disbursement', 'Recovery', 'Deduction') NOT NULL,
    description VARCHAR(500),
    category_name VARCHAR(100),

    -- Amount
    amount DECIMAL(15,2) NOT NULL,
    is_credit TINYINT(1) DEFAULT 1 COMMENT '1=Payment to employee, 0=Deduction',

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (payment_id) REFERENCES hrms_expense_payments(id) ON DELETE CASCADE,
    INDEX idx_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 4: hrms_expense_payment_history (Payment Audit Trail)
```sql
CREATE TABLE hrms_expense_payment_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    payment_id INT NOT NULL,
    batch_id INT,

    -- Action
    action ENUM(
        'Created', 'Queued', 'Added_To_Batch', 'Removed_From_Batch',
        'Processing', 'Completed', 'Failed', 'Retried',
        'Put_On_Hold', 'Released', 'Cancelled', 'Reversed',
        'Reconciled', 'Bank_File_Generated', 'Submitted_To_Bank'
    ) NOT NULL,

    -- Status Change
    from_status VARCHAR(50),
    to_status VARCHAR(50),

    -- Details
    details TEXT,
    reference VARCHAR(100),

    -- Performed By
    performed_by INT NOT NULL,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- IP/Device
    ip_address VARCHAR(45),

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (payment_id) REFERENCES hrms_expense_payments(id),
    INDEX idx_payment (payment_id),
    INDEX idx_action (action),
    INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 5: hrms_expense_payment_settings (Payment Configuration)
```sql
CREATE TABLE hrms_expense_payment_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Payment Cycle
    payment_cycle_type ENUM('Weekly', 'Bi_Weekly', 'Monthly', 'On_Demand') DEFAULT 'Monthly',
    payment_cycle_day INT COMMENT 'Day of month for monthly, Day of week for weekly',
    payment_cut_off_days INT DEFAULT 5 COMMENT 'Days before cycle for cut-off',

    -- Auto Processing
    auto_queue_approved TINYINT(1) DEFAULT 1 COMMENT 'Auto queue approved expenses',
    auto_create_batch TINYINT(1) DEFAULT 0 COMMENT 'Auto create payment batch',
    auto_generate_bank_file TINYINT(1) DEFAULT 0,

    -- Thresholds
    min_payment_amount DECIMAL(15,2) DEFAULT 100.00 COMMENT 'Minimum amount to process',
    max_payment_amount DECIMAL(15,2) COMMENT 'Maximum single payment',
    batch_size_limit INT DEFAULT 500 COMMENT 'Max payments per batch',

    -- Bank File Settings
    default_bank_format ENUM('NEFT', 'RTGS', 'IMPS', 'UPI', 'Custom') DEFAULT 'NEFT',
    rtgs_threshold DECIMAL(15,2) DEFAULT 200000.00 COMMENT 'Use RTGS above this amount',
    include_header_row TINYINT(1) DEFAULT 1,
    include_trailer_row TINYINT(1) DEFAULT 1,
    file_encoding VARCHAR(20) DEFAULT 'UTF-8',
    field_delimiter VARCHAR(5) DEFAULT '|',

    -- Company Bank Account
    default_source_bank_account_id INT,

    -- Advance Adjustment
    auto_adjust_advance TINYINT(1) DEFAULT 1,
    advance_adjustment_order ENUM('FIFO', 'LIFO', 'Oldest_First', 'Smallest_First') DEFAULT 'FIFO',

    -- Retry Settings
    max_retry_attempts INT DEFAULT 3,
    retry_interval_hours INT DEFAULT 24,

    -- Notifications
    notify_employee_on_payment TINYINT(1) DEFAULT 1,
    notify_employee_on_failure TINYINT(1) DEFAULT 1,
    notify_finance_on_failure TINYINT(1) DEFAULT 1,

    -- Approval
    require_batch_approval TINYINT(1) DEFAULT 1,
    batch_approval_threshold DECIMAL(15,2) COMMENT 'Amount above which approval needed',

    -- Audit
    is_active TINYINT(1) DEFAULT 1,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 6: hrms_expense_bank_accounts (Company Bank Accounts for Payment)
```sql
CREATE TABLE hrms_expense_bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Account Details
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_branch VARCHAR(100),
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    swift_code VARCHAR(20),
    account_type ENUM('Current', 'Savings') DEFAULT 'Current',

    -- Address
    bank_address TEXT,
    bank_city VARCHAR(100),
    bank_state VARCHAR(100),

    -- Usage
    is_default TINYINT(1) DEFAULT 0,
    use_for_expense TINYINT(1) DEFAULT 1,
    use_for_advance TINYINT(1) DEFAULT 1,

    -- Bank File Configuration
    bank_file_format VARCHAR(50) COMMENT 'Specific format for this bank',
    bank_code VARCHAR(20),
    client_code VARCHAR(50) COMMENT 'Corporate client code with bank',

    -- Status
    is_active TINYINT(1) DEFAULT 1,

    -- Audit
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    INDEX idx_company (company_id),
    INDEX idx_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 7: hrms_expense_bank_file_templates (Bank File Format Templates)
```sql
CREATE TABLE hrms_expense_bank_file_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Template Info
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    description TEXT,

    -- File Format
    file_extension VARCHAR(10) DEFAULT 'txt',
    field_delimiter VARCHAR(5) DEFAULT '|',
    record_delimiter VARCHAR(10) DEFAULT '\n',
    text_qualifier VARCHAR(5),
    encoding VARCHAR(20) DEFAULT 'UTF-8',

    -- Header Configuration
    has_header TINYINT(1) DEFAULT 1,
    header_template TEXT COMMENT 'Template for header row',

    -- Detail Row Configuration
    detail_template TEXT NOT NULL COMMENT 'Template for each payment row',

    -- Field Mapping (JSON)
    field_mapping JSON NOT NULL COMMENT 'Maps system fields to file columns',
    /*
    Example:
    {
        "columns": [
            {"position": 1, "field": "transaction_type", "default": "N", "length": 1},
            {"position": 2, "field": "beneficiary_name", "source": "account_holder_name", "length": 50},
            {"position": 3, "field": "account_number", "source": "account_number", "length": 20},
            {"position": 4, "field": "ifsc", "source": "ifsc_code", "length": 11},
            {"position": 5, "field": "amount", "source": "net_amount", "format": "decimal", "length": 15},
            {"position": 6, "field": "narration", "template": "EXP-{payment_number}", "length": 30}
        ]
    }
    */

    -- Trailer Configuration
    has_trailer TINYINT(1) DEFAULT 1,
    trailer_template TEXT COMMENT 'Template for trailer row',

    -- Validation Rules
    validation_rules JSON COMMENT 'Rules for validating before generation',

    -- Status
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,

    -- Audit
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_template_code (company_id, template_code),
    INDEX idx_bank (bank_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 8: hrms_expense_payment_reconciliation (Bank Reconciliation)
```sql
CREATE TABLE hrms_expense_payment_reconciliation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Reconciliation Batch
    reconciliation_number VARCHAR(50) NOT NULL,
    reconciliation_date DATE NOT NULL,
    bank_account_id INT NOT NULL,

    -- Bank Statement Details
    statement_date DATE,
    statement_reference VARCHAR(100),
    statement_file_path VARCHAR(500),

    -- Summary
    total_bank_transactions INT DEFAULT 0,
    total_matched INT DEFAULT 0,
    total_unmatched INT DEFAULT 0,
    total_bank_amount DECIMAL(15,2) DEFAULT 0.00,
    total_matched_amount DECIMAL(15,2) DEFAULT 0.00,
    difference_amount DECIMAL(15,2) DEFAULT 0.00,

    -- Status
    reconciliation_status ENUM('Draft', 'In_Progress', 'Completed', 'Discrepancy') DEFAULT 'Draft',

    -- Notes
    notes TEXT,

    -- Audit
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (bank_account_id) REFERENCES hrms_expense_bank_accounts(id),
    UNIQUE KEY uk_reconciliation_number (company_id, reconciliation_number),
    INDEX idx_date (reconciliation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 9: hrms_expense_reconciliation_items (Reconciliation Line Items)
```sql
CREATE TABLE hrms_expense_reconciliation_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reconciliation_id INT NOT NULL,

    -- Bank Transaction
    bank_transaction_date DATE,
    bank_reference VARCHAR(100),
    bank_narration VARCHAR(500),
    bank_amount DECIMAL(15,2),
    bank_transaction_type ENUM('Credit', 'Debit'),

    -- System Payment Match
    payment_id INT COMMENT 'Matched payment',
    match_status ENUM('Matched', 'Unmatched', 'Partial_Match', 'Manual_Match') DEFAULT 'Unmatched',
    match_confidence DECIMAL(5,2) COMMENT 'Auto-match confidence %',

    -- Variance
    variance_amount DECIMAL(15,2) DEFAULT 0.00,
    variance_reason VARCHAR(255),

    -- Manual Resolution
    manually_matched TINYINT(1) DEFAULT 0,
    matched_by INT,
    matched_at DATETIME,
    match_notes VARCHAR(500),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reconciliation_id) REFERENCES hrms_expense_payment_reconciliation(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES hrms_expense_payments(id),
    INDEX idx_reconciliation (reconciliation_id),
    INDEX idx_match_status (match_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Directory Structure
```
src/microservices/expense/
├── models/
│   ├── ExpensePaymentBatch.js
│   ├── ExpensePayment.js
│   ├── ExpensePaymentItem.js
│   ├── ExpensePaymentHistory.js
│   ├── ExpensePaymentSettings.js
│   ├── ExpenseBankAccount.js
│   ├── ExpenseBankFileTemplate.js
│   ├── ExpensePaymentReconciliation.js
│   └── ExpenseReconciliationItem.js
├── services/
│   ├── payment.service.js
│   ├── paymentBatch.service.js
│   ├── bankFile.service.js
│   ├── reconciliation.service.js
│   └── paymentSettings.service.js
├── controllers/
│   └── admin/
│       ├── payment.controller.js
│       ├── paymentBatch.controller.js
│       ├── bankFile.controller.js
│       ├── reconciliation.controller.js
│       └── paymentSettings.controller.js
├── utils/
│   └── bankFileGenerators/
│       ├── neftGenerator.js
│       ├── rtgsGenerator.js
│       ├── hdfcH2HGenerator.js
│       ├── iciciGenerator.js
│       └── genericGenerator.js
└── routes/
    └── admin.expense.routes.js
```

---

## API Endpoints

### Payment Queue Management (8 APIs)
```
GET    /api/admin/expense/payments/queue                 - Get payment queue (approved expenses pending payment)
POST   /api/admin/expense/payments/queue/add             - Add expenses to payment queue
POST   /api/admin/expense/payments/queue/remove          - Remove from queue
POST   /api/admin/expense/payments/queue/hold            - Put payment on hold
POST   /api/admin/expense/payments/queue/release         - Release held payment
GET    /api/admin/expense/payments/:id                   - Get payment details
GET    /api/admin/expense/payments/employee/:employeeId  - Get employee payment history
POST   /api/admin/expense/payments/calculate             - Calculate net payable (with advance adjustment)
```

### Payment Batch Management (10 APIs)
```
POST   /api/admin/expense/batches/create                 - Create payment batch
GET    /api/admin/expense/batches                        - List all batches
GET    /api/admin/expense/batches/:id                    - Get batch details
PUT    /api/admin/expense/batches/:id                    - Update batch
DELETE /api/admin/expense/batches/:id                    - Delete draft batch
POST   /api/admin/expense/batches/:id/add-payments       - Add payments to batch
POST   /api/admin/expense/batches/:id/remove-payments    - Remove payments from batch
POST   /api/admin/expense/batches/:id/finalize           - Finalize batch (lock for processing)
POST   /api/admin/expense/batches/:id/cancel             - Cancel batch
GET    /api/admin/expense/batches/:id/summary            - Get batch summary
```

### Bank File Generation (6 APIs)
```
POST   /api/admin/expense/batches/:id/generate-bank-file - Generate bank file for batch
GET    /api/admin/expense/batches/:id/download-bank-file - Download generated bank file
POST   /api/admin/expense/batches/:id/mark-submitted     - Mark as submitted to bank
POST   /api/admin/expense/bank-file/preview              - Preview bank file content
GET    /api/admin/expense/bank-file/templates            - List bank file templates
POST   /api/admin/expense/bank-file/templates            - Create/Update template
```

### Payment Processing (8 APIs)
```
POST   /api/admin/expense/payments/:id/process           - Process single payment
POST   /api/admin/expense/batches/:id/process            - Process entire batch
POST   /api/admin/expense/payments/:id/mark-completed    - Mark payment as completed
POST   /api/admin/expense/payments/:id/mark-failed       - Mark payment as failed
POST   /api/admin/expense/payments/:id/retry             - Retry failed payment
POST   /api/admin/expense/payments/:id/reverse           - Reverse completed payment
POST   /api/admin/expense/payments/bulk-update-status    - Bulk update payment status
GET    /api/admin/expense/payments/:id/history           - Get payment history
```

### Reconciliation (7 APIs)
```
POST   /api/admin/expense/reconciliation/create          - Create reconciliation
POST   /api/admin/expense/reconciliation/upload-statement - Upload bank statement
POST   /api/admin/expense/reconciliation/auto-match      - Auto-match transactions
POST   /api/admin/expense/reconciliation/manual-match    - Manual match
POST   /api/admin/expense/reconciliation/complete        - Complete reconciliation
GET    /api/admin/expense/reconciliation                 - List reconciliations
GET    /api/admin/expense/reconciliation/:id             - Get reconciliation details
```

### Settings & Configuration (6 APIs)
```
GET    /api/admin/expense/payment-settings               - Get payment settings
PUT    /api/admin/expense/payment-settings               - Update payment settings
GET    /api/admin/expense/bank-accounts                  - List company bank accounts
POST   /api/admin/expense/bank-accounts                  - Add bank account
PUT    /api/admin/expense/bank-accounts/:id              - Update bank account
DELETE /api/admin/expense/bank-accounts/:id              - Delete bank account
```

### Dashboard & Reports (5 APIs)
```
GET    /api/admin/expense/payments/dashboard             - Payment dashboard stats
GET    /api/admin/expense/payments/pending-summary       - Pending payments summary
GET    /api/admin/expense/payments/failed-summary        - Failed payments summary
GET    /api/admin/expense/payments/export                - Export payments to Excel
GET    /api/admin/expense/payments/report                - Generate payment report
```

---

## Service Layer Implementation

### payment.service.js
```javascript
const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const ExpensePayment = require('../models/ExpensePayment');
const ExpensePaymentItem = require('../models/ExpensePaymentItem');
const ExpensePaymentHistory = require('../models/ExpensePaymentHistory');
const ExpenseReport = require('../models/ExpenseReport');
const ExpenseAdvanceRequest = require('../models/ExpenseAdvanceRequest');
const sequenceService = require('./sequence.service');

class PaymentService {

    /**
     * Get payment queue (approved expenses ready for payment)
     */
    async getPaymentQueue(companyId, filters = {}) {
        const where = {
            company_id: companyId,
            status: 'Approved',
            payment_status: 'Unpaid'
        };

        if (filters.employee_id) {
            where.employee_id = filters.employee_id;
        }

        if (filters.date_from && filters.date_to) {
            where.final_approved_at = {
                [Op.between]: [filters.date_from, filters.date_to]
            };
        }

        const reports = await ExpenseReport.findAll({
            where,
            include: [
                {
                    model: require('../../../models/hrms/Employee'),
                    as: 'employee',
                    attributes: ['id', 'employee_code', 'first_name', 'last_name', 'department_id']
                }
            ],
            order: [['final_approved_at', 'ASC']]
        });

        // Calculate net payable for each report
        const queue = await Promise.all(reports.map(async report => {
            const calculation = await this.calculateNetPayable(report.id, companyId);
            return {
                ...report.toJSON(),
                ...calculation
            };
        }));

        return queue;
    }

    /**
     * Calculate net payable amount with advance adjustment
     */
    async calculateNetPayable(expenseReportId, companyId) {
        const report = await ExpenseReport.findOne({
            where: { id: expenseReportId, company_id: companyId }
        });

        if (!report) {
            throw new Error('Expense report not found');
        }

        const grossAmount = parseFloat(report.approved_amount) || 0;
        let advanceAdjustment = 0;
        let advancesUsed = [];

        // Check for outstanding advances
        const openAdvances = await ExpenseAdvanceRequest.findAll({
            where: {
                company_id: companyId,
                employee_id: report.employee_id,
                request_status: 'Disbursed',
                settlement_status: {
                    [Op.in]: ['Pending_Settlement', 'Partial_Settlement']
                }
            },
            order: [['disbursed_at', 'ASC']] // FIFO
        });

        let remainingExpense = grossAmount;

        for (const advance of openAdvances) {
            if (remainingExpense <= 0) break;

            const advanceBalance = parseFloat(advance.disbursed_amount) - parseFloat(advance.settled_amount);

            if (advanceBalance > 0) {
                const adjustAmount = Math.min(advanceBalance, remainingExpense);
                advanceAdjustment += adjustAmount;
                remainingExpense -= adjustAmount;

                advancesUsed.push({
                    advance_id: advance.id,
                    advance_number: advance.advance_number,
                    advance_balance: advanceBalance,
                    adjustment_amount: adjustAmount
                });
            }
        }

        const netPayable = grossAmount - advanceAdjustment;

        return {
            gross_amount: grossAmount,
            advance_adjustment: advanceAdjustment,
            advances_used: advancesUsed,
            tax_deduction: 0, // Can be extended for TDS
            other_deduction: 0,
            net_payable: netPayable,
            payment_direction: netPayable >= 0 ? 'To_Employee' : 'From_Employee',
            recovery_amount: netPayable < 0 ? Math.abs(netPayable) : 0
        };
    }

    /**
     * Create payment record for approved expense
     */
    async createPayment(expenseReportId, companyId, createdBy) {
        const transaction = await sequelize.transaction();

        try {
            const report = await ExpenseReport.findOne({
                where: { id: expenseReportId, company_id: companyId },
                include: [{
                    model: require('../../../models/hrms/Employee'),
                    as: 'employee',
                    include: [{
                        model: require('../../../models/hrms/EmployeeBankAccount'),
                        as: 'bankAccounts',
                        where: { is_primary: true },
                        required: false
                    }]
                }]
            });

            if (!report) {
                throw new Error('Expense report not found');
            }

            if (report.status !== 'Approved' && report.status !== 'Partially_Approved') {
                throw new Error('Expense report is not approved');
            }

            // Calculate net payable
            const calculation = await this.calculateNetPayable(expenseReportId, companyId);

            // Generate payment number
            const paymentNumber = await sequenceService.generateNumber(
                companyId,
                'expense_payment',
                transaction
            );

            // Get employee bank details
            const bankAccount = report.employee?.bankAccounts?.[0];

            // Create payment
            const payment = await ExpensePayment.create({
                company_id: companyId,
                payment_number: paymentNumber,
                employee_id: report.employee_id,
                source_type: 'Expense_Report',
                expense_report_id: expenseReportId,
                gross_amount: calculation.gross_amount,
                advance_adjusted: calculation.advance_adjustment,
                tax_deduction: calculation.tax_deduction,
                other_deduction: calculation.other_deduction,
                net_amount: Math.abs(calculation.net_payable),
                currency_id: report.currency_id,
                payment_direction: calculation.payment_direction,
                bank_account_id: bankAccount?.id,
                bank_name: bankAccount?.bank_name,
                bank_branch: bankAccount?.branch_name,
                account_number: bankAccount?.account_number,
                ifsc_code: bankAccount?.ifsc_code,
                account_holder_name: bankAccount?.account_holder_name ||
                    `${report.employee.first_name} ${report.employee.last_name}`,
                payment_status: 'Pending',
                created_by: createdBy
            }, { transaction });

            // Create payment items
            const items = await report.getItems({ where: { item_status: 'Approved' } });

            for (const item of items) {
                await ExpensePaymentItem.create({
                    company_id: companyId,
                    payment_id: payment.id,
                    expense_report_id: expenseReportId,
                    expense_item_id: item.id,
                    item_type: 'Expense',
                    description: item.description,
                    category_name: item.category?.name,
                    amount: item.approved_amount,
                    is_credit: true
                }, { transaction });
            }

            // Add advance adjustment items
            for (const adv of calculation.advances_used) {
                await ExpensePaymentItem.create({
                    company_id: companyId,
                    payment_id: payment.id,
                    advance_request_id: adv.advance_id,
                    item_type: 'Advance_Adjustment',
                    description: `Advance adjustment - ${adv.advance_number}`,
                    amount: adv.adjustment_amount,
                    is_credit: false
                }, { transaction });
            }

            // Update expense report payment status
            await report.update({
                payment_status: 'Processing',
                advance_adjusted: calculation.advance_adjustment,
                net_payable: calculation.net_payable
            }, { transaction });

            // Update advances settlement
            for (const adv of calculation.advances_used) {
                await ExpenseAdvanceRequest.increment(
                    { settled_amount: adv.adjustment_amount },
                    { where: { id: adv.advance_id }, transaction }
                );

                // Update settlement status
                const advance = await ExpenseAdvanceRequest.findByPk(adv.advance_id);
                const newSettled = parseFloat(advance.settled_amount) + adv.adjustment_amount;
                const newBalance = parseFloat(advance.disbursed_amount) - newSettled;

                await advance.update({
                    settlement_status: newBalance <= 0 ? 'Fully_Settled' : 'Partial_Settlement',
                    balance_amount: newBalance
                }, { transaction });
            }

            // Log history
            await this.logHistory(payment.id, companyId, {
                action: 'Created',
                to_status: 'Pending',
                details: `Payment created for expense report ${report.report_number}`,
                performed_by: createdBy
            }, transaction);

            await transaction.commit();

            return this.getPaymentById(payment.id, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Mark payment as completed
     */
    async markPaymentCompleted(paymentId, companyId, data, updatedBy) {
        const transaction = await sequelize.transaction();

        try {
            const payment = await ExpensePayment.findOne({
                where: { id: paymentId, company_id: companyId }
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            const fromStatus = payment.payment_status;

            await payment.update({
                payment_status: 'Completed',
                transaction_reference: data.transaction_reference,
                utr_number: data.utr_number,
                bank_response_code: data.bank_response_code,
                bank_response_message: data.bank_response_message,
                completed_at: new Date(),
                is_reconciled: false,
                updated_by: updatedBy
            }, { transaction });

            // Update expense report
            if (payment.expense_report_id) {
                await ExpenseReport.update(
                    { payment_status: 'Paid', payment_date: new Date() },
                    { where: { id: payment.expense_report_id }, transaction }
                );
            }

            // Log history
            await this.logHistory(paymentId, companyId, {
                action: 'Completed',
                from_status: fromStatus,
                to_status: 'Completed',
                details: `UTR: ${data.utr_number}`,
                reference: data.transaction_reference,
                performed_by: updatedBy
            }, transaction);

            await transaction.commit();

            return this.getPaymentById(paymentId, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Mark payment as failed
     */
    async markPaymentFailed(paymentId, companyId, reason, updatedBy) {
        const transaction = await sequelize.transaction();

        try {
            const payment = await ExpensePayment.findOne({
                where: { id: paymentId, company_id: companyId }
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            const fromStatus = payment.payment_status;
            const retryCount = (payment.retry_count || 0) + 1;

            await payment.update({
                payment_status: 'Failed',
                failure_reason: reason,
                failed_at: new Date(),
                retry_count: retryCount,
                next_retry_at: retryCount < payment.max_retries
                    ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    : null,
                updated_by: updatedBy
            }, { transaction });

            // Log history
            await this.logHistory(paymentId, companyId, {
                action: 'Failed',
                from_status: fromStatus,
                to_status: 'Failed',
                details: reason,
                performed_by: updatedBy
            }, transaction);

            await transaction.commit();

            // Send notification (async)
            this.sendFailureNotification(payment);

            return this.getPaymentById(paymentId, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Log payment history
     */
    async logHistory(paymentId, companyId, data, transaction) {
        await ExpensePaymentHistory.create({
            company_id: companyId,
            payment_id: paymentId,
            batch_id: data.batch_id,
            action: data.action,
            from_status: data.from_status,
            to_status: data.to_status,
            details: data.details,
            reference: data.reference,
            performed_by: data.performed_by
        }, { transaction });
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId, companyId) {
        return ExpensePayment.findOne({
            where: { id: paymentId, company_id: companyId },
            include: [
                { model: ExpensePaymentItem, as: 'items' },
                { model: ExpensePaymentHistory, as: 'history', limit: 20 }
            ]
        });
    }

    /**
     * Send failure notification
     */
    async sendFailureNotification(payment) {
        // Implementation for sending notification
        console.log(`Sending failure notification for payment ${payment.payment_number}`);
    }
}

module.exports = new PaymentService();
```

### bankFile.service.js
```javascript
const fs = require('fs');
const path = require('path');
const ExpensePayment = require('../models/ExpensePayment');
const ExpensePaymentBatch = require('../models/ExpensePaymentBatch');
const ExpenseBankFileTemplate = require('../models/ExpenseBankFileTemplate');

class BankFileService {

    /**
     * Generate bank file for payment batch
     */
    async generateBankFile(batchId, companyId, templateId, generatedBy) {
        const batch = await ExpensePaymentBatch.findOne({
            where: { id: batchId, company_id: companyId },
            include: [{
                model: ExpensePayment,
                as: 'payments',
                where: { payment_status: 'In_Batch' }
            }]
        });

        if (!batch) {
            throw new Error('Batch not found');
        }

        if (!batch.payments || batch.payments.length === 0) {
            throw new Error('No payments in batch');
        }

        // Get template
        const template = await ExpenseBankFileTemplate.findOne({
            where: templateId
                ? { id: templateId, company_id: companyId }
                : { company_id: companyId, is_default: true }
        });

        if (!template) {
            throw new Error('Bank file template not found');
        }

        // Generate file content
        const fileContent = await this.generateFileContent(batch, template);

        // Save file
        const fileName = `${batch.batch_number}_${Date.now()}.${template.file_extension}`;
        const filePath = path.join(process.cwd(), 'uploads', 'bank-files', fileName);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, fileContent, template.encoding);

        // Update batch
        await batch.update({
            bank_file_name: fileName,
            bank_file_path: filePath,
            bank_file_generated_at: new Date(),
            bank_file_generated_by: generatedBy,
            batch_status: 'Bank_File_Generated'
        });

        return {
            file_name: fileName,
            file_path: filePath,
            file_size: fs.statSync(filePath).size,
            record_count: batch.payments.length,
            total_amount: batch.total_net_amount
        };
    }

    /**
     * Generate file content based on template
     */
    async generateFileContent(batch, template) {
        const lines = [];
        const fieldMapping = JSON.parse(template.field_mapping);
        const delimiter = template.field_delimiter;

        // Generate header
        if (template.has_header && template.header_template) {
            const header = this.processTemplate(template.header_template, {
                batch_number: batch.batch_number,
                batch_date: new Date().toISOString().split('T')[0],
                total_records: batch.payments.length,
                total_amount: batch.total_net_amount,
                source_account: batch.source_account_number
            });
            lines.push(header);
        }

        // Generate detail rows
        for (const payment of batch.payments) {
            const row = this.generateDetailRow(payment, fieldMapping, delimiter);
            lines.push(row);
        }

        // Generate trailer
        if (template.has_trailer && template.trailer_template) {
            const trailer = this.processTemplate(template.trailer_template, {
                total_records: batch.payments.length,
                total_amount: batch.total_net_amount,
                checksum: this.calculateChecksum(batch.payments)
            });
            lines.push(trailer);
        }

        return lines.join(template.record_delimiter || '\n');
    }

    /**
     * Generate detail row for a payment
     */
    generateDetailRow(payment, fieldMapping, delimiter) {
        const columns = fieldMapping.columns.sort((a, b) => a.position - b.position);
        const values = [];

        for (const col of columns) {
            let value = '';

            if (col.default) {
                value = col.default;
            } else if (col.source) {
                value = payment[col.source] || '';
            } else if (col.template) {
                value = this.processTemplate(col.template, payment);
            }

            // Apply formatting
            if (col.format === 'decimal') {
                value = parseFloat(value || 0).toFixed(2);
            } else if (col.format === 'date') {
                value = new Date(value).toISOString().split('T')[0];
            }

            // Apply length constraint
            if (col.length) {
                value = String(value).substring(0, col.length).padEnd(col.length, ' ');
            }

            values.push(value);
        }

        return values.join(delimiter);
    }

    /**
     * Process template string with variables
     */
    processTemplate(template, data) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Calculate checksum for validation
     */
    calculateChecksum(payments) {
        const total = payments.reduce((sum, p) => sum + parseFloat(p.net_amount), 0);
        return total.toFixed(2);
    }

    /**
     * Preview bank file content
     */
    async previewBankFile(batchId, companyId, templateId) {
        const batch = await ExpensePaymentBatch.findOne({
            where: { id: batchId, company_id: companyId },
            include: [{
                model: ExpensePayment,
                as: 'payments',
                limit: 5 // Preview only first 5
            }]
        });

        const template = await ExpenseBankFileTemplate.findOne({
            where: templateId
                ? { id: templateId, company_id: companyId }
                : { company_id: companyId, is_default: true }
        });

        const content = await this.generateFileContent(batch, template);

        return {
            preview: content,
            total_records: batch.payments.length,
            template_name: template.template_name
        };
    }
}

module.exports = new BankFileService();
```

---

## Payment Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     EXPENSE PAYMENT WORKFLOW                          │
└──────────────────────────────────────────────────────────────────────┘

1. EXPENSE APPROVED
   ┌─────────────────────────────────────────┐
   │ Expense Report: EXP-2025-001            │
   │ Status: Approved                        │
   │ Approved Amount: ₹25,000                │
   └─────────────────────────────────────────┘
                    │
                    ▼
2. PAYMENT CALCULATION
   ┌─────────────────────────────────────────┐
   │ Gross Amount:        ₹25,000            │
   │ Open Advances:                          │
   │   ADV-2025-001:      -₹10,000           │
   │ Tax Deduction:       ₹0                 │
   │ ─────────────────────────────────       │
   │ Net Payable:         ₹15,000            │
   └─────────────────────────────────────────┘
                    │
                    ▼
3. PAYMENT CREATED
   ┌─────────────────────────────────────────┐
   │ Payment #: PAY-2025-00001               │
   │ Status: Pending                         │
   │ Amount: ₹15,000                         │
   │ Employee: John Doe                      │
   │ Bank: HDFC ****1234                     │
   └─────────────────────────────────────────┘
                    │
                    ▼
4. ADDED TO BATCH
   ┌─────────────────────────────────────────┐
   │ Batch #: PAY-BATCH-2025-001             │
   │ Type: Monthly                           │
   │ Payments: 45                            │
   │ Total Amount: ₹8,50,000                 │
   │ Status: Ready                           │
   └─────────────────────────────────────────┘
                    │
                    ▼
5. BANK FILE GENERATED
   ┌─────────────────────────────────────────┐
   │ File: PAY-BATCH-2025-001.txt            │
   │ Format: NEFT                            │
   │ Records: 45                             │
   │ Total: ₹8,50,000                        │
   │ Generated: 2025-01-25 10:00 AM          │
   └─────────────────────────────────────────┘
                    │
                    ▼
6. SUBMITTED TO BANK
   ┌─────────────────────────────────────────┐
   │ Bank Reference: HDFC-NEFT-20250125-001  │
   │ Submitted: 2025-01-25 11:00 AM          │
   │ Expected Processing: Same Day           │
   └─────────────────────────────────────────┘
                    │
                    ▼
7. PAYMENTS COMPLETED
   ┌─────────────────────────────────────────┐
   │ PAY-2025-00001: Completed (UTR: XYZ123) │
   │ PAY-2025-00002: Completed (UTR: XYZ124) │
   │ PAY-2025-00003: Failed (Invalid A/C)    │
   │ ...                                     │
   │ Success: 44 | Failed: 1                 │
   └─────────────────────────────────────────┘
                    │
                    ▼
8. RECONCILIATION
   ┌─────────────────────────────────────────┐
   │ Bank Statement Uploaded                 │
   │ Auto-Matched: 43                        │
   │ Manual Match: 1                         │
   │ Unmatched: 1 (Failed payment)           │
   │ Status: Completed                       │
   └─────────────────────────────────────────┘
```

---

## Bank File Format Examples

### NEFT Format (Pipe Delimited)
```
H|COMPANY123|20250125|45|850000.00
N|John Doe|HDFC0001234|1234567890|15000.00|SALARY-EXP-2025-00001
N|Jane Smith|ICIC0005678|9876543210|22000.00|SALARY-EXP-2025-00002
...
T|45|850000.00
```

### HDFC H2H Format
```
NCOMPANY1232025012500001John Doe                    HDFC00012341234567890     0000001500000EXP-2025-00001
NCOMPANY1232025012500002Jane Smith                  ICIC00056789876543210     0000002200000EXP-2025-00002
```

### CSV Format
```csv
Sr No,Beneficiary Name,Account Number,IFSC Code,Amount,Narration
1,John Doe,1234567890,HDFC0001234,15000.00,EXP-2025-00001
2,Jane Smith,9876543210,ICIC0005678,22000.00,EXP-2025-00002
```

---

## SQL Migration Script
```sql
-- File: scripts/sql/expense/007_create_payment_tables.sql

-- Table 1: Payment Batches
CREATE TABLE hrms_expense_payment_batches (
    -- ... (full schema as defined above)
);

-- Table 2: Payments
CREATE TABLE hrms_expense_payments (
    -- ... (full schema as defined above)
);

-- Table 3: Payment Items
CREATE TABLE hrms_expense_payment_items (
    -- ... (full schema as defined above)
);

-- Table 4: Payment History
CREATE TABLE hrms_expense_payment_history (
    -- ... (full schema as defined above)
);

-- Table 5: Payment Settings
CREATE TABLE hrms_expense_payment_settings (
    -- ... (full schema as defined above)
);

-- Table 6: Bank Accounts
CREATE TABLE hrms_expense_bank_accounts (
    -- ... (full schema as defined above)
);

-- Table 7: Bank File Templates
CREATE TABLE hrms_expense_bank_file_templates (
    -- ... (full schema as defined above)
);

-- Table 8: Reconciliation
CREATE TABLE hrms_expense_payment_reconciliation (
    -- ... (full schema as defined above)
);

-- Table 9: Reconciliation Items
CREATE TABLE hrms_expense_reconciliation_items (
    -- ... (full schema as defined above)
);

-- Insert default bank file templates
INSERT INTO hrms_expense_bank_file_templates
(company_id, template_name, template_code, bank_name, file_extension, field_delimiter, has_header, has_trailer, field_mapping, is_default, created_by)
VALUES
(1, 'NEFT Standard', 'NEFT_STD', 'Generic', 'txt', '|', 1, 1,
'{"columns":[{"position":1,"field":"type","default":"N","length":1},{"position":2,"field":"name","source":"account_holder_name","length":50},{"position":3,"field":"ifsc","source":"ifsc_code","length":11},{"position":4,"field":"account","source":"account_number","length":20},{"position":5,"field":"amount","source":"net_amount","format":"decimal","length":15},{"position":6,"field":"narration","template":"EXP-{payment_number}","length":30}]}',
1, 1);
```

---

## Key Features Summary

1. **Payment Queue Management**: Track approved expenses ready for payment
2. **Automatic Advance Adjustment**: FIFO-based advance settlement
3. **Payment Batching**: Group payments for efficient processing
4. **Bank File Generation**: Multiple format support (NEFT, RTGS, CSV, Custom)
5. **Payment Tracking**: Complete lifecycle tracking with status updates
6. **Failed Payment Handling**: Retry mechanism with configurable limits
7. **Payment Reversal**: Support for reversing completed payments
8. **Bank Reconciliation**: Match payments with bank statements
9. **Configurable Templates**: Flexible bank file format templates
10. **Payment Dashboard**: Real-time payment statistics and insights

---

## Total: 9 Tables, 50 API Endpoints
