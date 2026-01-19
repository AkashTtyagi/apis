# Phase 3.2: Expense Report/Claim Management - Implementation Document

## Overview
This document covers the implementation of the core Expense Report/Claim management functionality. This is the primary module where employees submit their expenses, attach receipts, and track approval status. Supports line-item level approval where each expense item can be approved/rejected independently.

## Database Schema

### Table 1: hrms_expense_reports (Main Expense Report Header)
```sql
CREATE TABLE hrms_expense_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_number VARCHAR(50) NOT NULL,
    employee_id INT NOT NULL,

    -- Report Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    purpose VARCHAR(255),

    -- Trip/Project Association (Optional)
    trip_id INT,
    project_id INT,
    cost_center_id INT,

    -- Date Range
    report_date DATE NOT NULL,
    period_start_date DATE,
    period_end_date DATE,

    -- Currency (Base currency of report)
    currency_id INT NOT NULL,

    -- Amount Summary (Auto-calculated from items)
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    approved_amount DECIMAL(15,2) DEFAULT 0.00,
    rejected_amount DECIMAL(15,2) DEFAULT 0.00,
    pending_amount DECIMAL(15,2) DEFAULT 0.00,

    -- Reimbursable vs Non-Reimbursable
    total_reimbursable DECIMAL(15,2) DEFAULT 0.00,
    total_non_reimbursable DECIMAL(15,2) DEFAULT 0.00,

    -- Advance Adjustment
    advance_adjusted DECIMAL(15,2) DEFAULT 0.00,
    net_payable DECIMAL(15,2) DEFAULT 0.00,

    -- Item Counts
    total_items INT DEFAULT 0,
    approved_items INT DEFAULT 0,
    rejected_items INT DEFAULT 0,
    pending_items INT DEFAULT 0,

    -- Report Status
    status ENUM('Draft', 'Submitted', 'In_Approval', 'Partially_Approved', 'Approved', 'Rejected', 'Paid', 'Cancelled') DEFAULT 'Draft',

    -- Workflow Reference
    workflow_instance_id INT,
    current_stage_id INT,

    -- Submission Details
    submitted_at DATETIME,
    submitted_by INT,

    -- Final Approval
    final_approved_at DATETIME,
    final_approved_by INT,

    -- Payment Details
    payment_status ENUM('Unpaid', 'Processing', 'Paid', 'Partially_Paid') DEFAULT 'Unpaid',
    payment_date DATE,
    payment_reference VARCHAR(100),

    -- Policy Applied
    policy_id INT,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (currency_id) REFERENCES hrms_expense_currencies(id),
    FOREIGN KEY (policy_id) REFERENCES hrms_expense_policies(id),
    UNIQUE KEY uk_report_number (company_id, report_number),
    INDEX idx_employee (employee_id),
    INDEX idx_status (status),
    INDEX idx_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 2: hrms_expense_report_items (Individual Expense Line Items)
```sql
CREATE TABLE hrms_expense_report_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_id INT NOT NULL,
    item_number INT NOT NULL,

    -- Category
    category_id INT NOT NULL,
    subcategory_id INT,

    -- Expense Type (from category)
    expense_type ENUM('Amount', 'Mileage', 'Per_Diem', 'Time_Based') NOT NULL,

    -- Basic Details
    description VARCHAR(500) NOT NULL,
    expense_date DATE NOT NULL,

    -- Merchant/Vendor Details
    merchant_name VARCHAR(255),
    merchant_location VARCHAR(255),

    -- Amount Details (for Amount type)
    original_currency_id INT,
    original_amount DECIMAL(15,2),
    exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
    converted_amount DECIMAL(15,2),

    -- Mileage Details (for Mileage type)
    distance DECIMAL(10,2),
    distance_unit ENUM('KM', 'Miles') DEFAULT 'KM',
    mileage_rate DECIMAL(10,4),
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    vehicle_type VARCHAR(50),

    -- Per Diem Details (for Per_Diem type)
    per_diem_location_id INT,
    per_diem_type ENUM('Full_Day', 'Half_Day', 'Breakfast', 'Lunch', 'Dinner', 'Lodging') DEFAULT 'Full_Day',
    per_diem_rate DECIMAL(15,2),
    number_of_days DECIMAL(5,2),

    -- Time Based Details (for Time_Based type)
    hours DECIMAL(5,2),
    hourly_rate DECIMAL(15,2),

    -- Final Calculated Amount
    amount DECIMAL(15,2) NOT NULL,

    -- Tax Details
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    tax_code VARCHAR(20),
    is_tax_inclusive TINYINT(1) DEFAULT 0,

    -- GST/Tax Breakdown
    cgst_amount DECIMAL(15,2) DEFAULT 0.00,
    sgst_amount DECIMAL(15,2) DEFAULT 0.00,
    igst_amount DECIMAL(15,2) DEFAULT 0.00,

    -- Reimbursement
    is_reimbursable TINYINT(1) DEFAULT 1,
    reimbursable_amount DECIMAL(15,2),
    non_reimbursable_amount DECIMAL(15,2) DEFAULT 0.00,

    -- Payment Method
    payment_method ENUM('Cash', 'Personal_Card', 'Company_Card', 'Bank_Transfer', 'Other') DEFAULT 'Cash',
    card_last_four VARCHAR(4),

    -- Billable to Client
    is_billable TINYINT(1) DEFAULT 0,
    client_id INT,

    -- Receipt/Attachment
    receipt_required TINYINT(1) DEFAULT 1,
    receipt_attached TINYINT(1) DEFAULT 0,
    receipt_missing_reason VARCHAR(255),

    -- Policy Compliance
    policy_limit DECIMAL(15,2),
    is_over_limit TINYINT(1) DEFAULT 0,
    over_limit_amount DECIMAL(15,2) DEFAULT 0.00,
    over_limit_justification TEXT,
    requires_additional_approval TINYINT(1) DEFAULT 0,

    -- Attendees (for meals/entertainment)
    has_attendees TINYINT(1) DEFAULT 0,
    attendee_count INT DEFAULT 0,

    -- Custom Fields (JSON)
    custom_fields JSON,

    -- Item Level Approval Status
    item_status ENUM('Pending', 'Approved', 'Rejected', 'Needs_Info') DEFAULT 'Pending',
    approved_amount DECIMAL(15,2),
    rejection_reason VARCHAR(500),

    -- Item Approval Details
    item_approved_at DATETIME,
    item_approved_by INT,
    item_rejected_at DATETIME,
    item_rejected_by INT,

    -- Current Stage for this item
    current_stage_id INT,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_id) REFERENCES hrms_expense_reports(id),
    FOREIGN KEY (category_id) REFERENCES hrms_expense_categories(id),
    FOREIGN KEY (original_currency_id) REFERENCES hrms_expense_currencies(id),
    INDEX idx_report (report_id),
    INDEX idx_category (category_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_item_status (item_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 3: hrms_expense_item_attendees (Attendees for Meals/Entertainment)
```sql
CREATE TABLE hrms_expense_item_attendees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    item_id INT NOT NULL,

    -- Attendee Type
    attendee_type ENUM('Employee', 'External') NOT NULL,

    -- For Internal Employees
    employee_id INT,

    -- For External Attendees
    attendee_name VARCHAR(255),
    attendee_company VARCHAR(255),
    attendee_designation VARCHAR(100),
    attendee_email VARCHAR(255),
    attendee_phone VARCHAR(20),

    -- Relationship
    relationship VARCHAR(100),
    business_purpose VARCHAR(500),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (item_id) REFERENCES hrms_expense_report_items(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 4: hrms_expense_attachments (Receipts and Supporting Documents)
```sql
CREATE TABLE hrms_expense_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Polymorphic Association
    attachment_type ENUM('Report', 'Item', 'Advance') NOT NULL,
    reference_id INT NOT NULL,

    -- File Details
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    mime_type VARCHAR(100),

    -- Document Type
    document_type ENUM('Receipt', 'Invoice', 'Bill', 'Boarding_Pass', 'Hotel_Folio', 'Other') DEFAULT 'Receipt',

    -- OCR Extracted Data (if applicable)
    ocr_processed TINYINT(1) DEFAULT 0,
    ocr_data JSON,
    ocr_merchant_name VARCHAR(255),
    ocr_amount DECIMAL(15,2),
    ocr_date DATE,
    ocr_confidence DECIMAL(5,2),

    -- Verification
    is_verified TINYINT(1) DEFAULT 0,
    verified_by INT,
    verified_at DATETIME,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    INDEX idx_reference (attachment_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 5: hrms_expense_report_history (Audit Trail)
```sql
CREATE TABLE hrms_expense_report_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_id INT NOT NULL,
    item_id INT,

    -- Action Details
    action ENUM(
        'Created', 'Updated', 'Submitted', 'Recalled',
        'Stage_Changed', 'Item_Approved', 'Item_Rejected',
        'Report_Approved', 'Report_Rejected', 'Sent_Back',
        'Comment_Added', 'Attachment_Added', 'Attachment_Removed',
        'Payment_Processed', 'Cancelled'
    ) NOT NULL,

    -- Status Transition
    from_status VARCHAR(50),
    to_status VARCHAR(50),

    -- Stage Information
    stage_id INT,
    stage_name VARCHAR(100),

    -- Actor
    performed_by INT NOT NULL,
    performed_by_name VARCHAR(255),
    performed_by_role VARCHAR(100),

    -- Details
    comments TEXT,
    amount_affected DECIMAL(15,2),

    -- Change Details (JSON for field-level changes)
    changes JSON,

    -- IP and Device Info
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_id) REFERENCES hrms_expense_reports(id),
    INDEX idx_report (report_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 6: hrms_expense_report_comments (Discussion Thread)
```sql
CREATE TABLE hrms_expense_report_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_id INT NOT NULL,
    item_id INT,

    -- Parent Comment (for threading)
    parent_comment_id INT,

    -- Comment Content
    comment TEXT NOT NULL,

    -- Comment Type
    comment_type ENUM('General', 'Query', 'Response', 'Rejection_Reason', 'Approval_Note', 'System') DEFAULT 'General',

    -- Visibility
    is_private TINYINT(1) DEFAULT 0,
    visible_to_requester TINYINT(1) DEFAULT 1,

    -- Mentions
    mentioned_users JSON,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_id) REFERENCES hrms_expense_reports(id),
    FOREIGN KEY (parent_comment_id) REFERENCES hrms_expense_report_comments(id),
    INDEX idx_report (report_id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 7: hrms_expense_delegations (Delegation of Expense Submission)
```sql
CREATE TABLE hrms_expense_delegations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Delegator (Original Employee)
    delegator_id INT NOT NULL,

    -- Delegate (Person who can submit on behalf)
    delegate_id INT NOT NULL,

    -- Delegation Period
    start_date DATE NOT NULL,
    end_date DATE,

    -- Permissions
    can_create_draft TINYINT(1) DEFAULT 1,
    can_submit TINYINT(1) DEFAULT 1,
    can_view_all TINYINT(1) DEFAULT 1,
    can_recall TINYINT(1) DEFAULT 0,

    -- Reason
    reason VARCHAR(500),

    -- Status
    is_active TINYINT(1) DEFAULT 1,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (delegator_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (delegate_id) REFERENCES hrms_employees(id),
    INDEX idx_delegator (delegator_id),
    INDEX idx_delegate (delegate_id),
    INDEX idx_active_period (is_active, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 8: hrms_expense_saved_templates (Expense Report Templates)
```sql
CREATE TABLE hrms_expense_saved_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Owner
    employee_id INT NOT NULL,

    -- Template Details
    template_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),

    -- Template Data (JSON - contains report structure with items)
    template_data JSON NOT NULL,

    -- Sharing
    is_shared TINYINT(1) DEFAULT 0,
    shared_with_department TINYINT(1) DEFAULT 0,
    shared_with_all TINYINT(1) DEFAULT 0,

    -- Usage Stats
    usage_count INT DEFAULT 0,
    last_used_at DATETIME,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    deleted_at DATETIME,
    deleted_by INT,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    INDEX idx_employee (employee_id),
    INDEX idx_shared (is_shared, shared_with_all)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 9: hrms_expense_quick_expenses (Quick/Mobile Expense Capture)
```sql
CREATE TABLE hrms_expense_quick_expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    employee_id INT NOT NULL,

    -- Basic Capture
    description VARCHAR(500),
    amount DECIMAL(15,2) NOT NULL,
    currency_id INT,
    expense_date DATE NOT NULL,

    -- Category (optional at capture time)
    category_id INT,

    -- Merchant
    merchant_name VARCHAR(255),

    -- Receipt
    receipt_image_path VARCHAR(500),

    -- OCR Data
    ocr_processed TINYINT(1) DEFAULT 0,
    ocr_data JSON,

    -- Status
    status ENUM('Captured', 'Added_To_Report', 'Discarded') DEFAULT 'Captured',
    report_id INT,
    item_id INT,

    -- Source
    capture_source ENUM('Mobile_App', 'Web', 'Email', 'WhatsApp') DEFAULT 'Web',

    -- Location (if captured via mobile)
    capture_latitude DECIMAL(10,8),
    capture_longitude DECIMAL(11,8),
    capture_location_name VARCHAR(255),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (category_id) REFERENCES hrms_expense_categories(id),
    FOREIGN KEY (report_id) REFERENCES hrms_expense_reports(id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 10: hrms_expense_violations (Policy Violations Log)
```sql
CREATE TABLE hrms_expense_violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_id INT NOT NULL,
    item_id INT,

    -- Violation Type
    violation_type ENUM(
        'Over_Limit', 'Missing_Receipt', 'Duplicate_Expense',
        'Out_Of_Policy', 'Invalid_Category', 'Date_Violation',
        'Merchant_Blocked', 'Currency_Not_Allowed', 'Other'
    ) NOT NULL,

    -- Severity
    severity ENUM('Warning', 'Soft_Block', 'Hard_Block') DEFAULT 'Warning',

    -- Violation Details
    rule_id INT,
    rule_name VARCHAR(255),
    violation_description TEXT NOT NULL,

    -- Amounts
    claimed_amount DECIMAL(15,2),
    allowed_amount DECIMAL(15,2),
    violation_amount DECIMAL(15,2),

    -- Resolution
    is_resolved TINYINT(1) DEFAULT 0,
    resolution_type ENUM('Approved_Exception', 'Amount_Adjusted', 'Rejected', 'Auto_Resolved'),
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at DATETIME,

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_id) REFERENCES hrms_expense_reports(id),
    FOREIGN KEY (item_id) REFERENCES hrms_expense_report_items(id),
    INDEX idx_report (report_id),
    INDEX idx_violation_type (violation_type),
    INDEX idx_unresolved (is_resolved, severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Directory Structure
```
src/microservices/expense/
├── models/
│   ├── ExpenseReport.js
│   ├── ExpenseReportItem.js
│   ├── ExpenseItemAttendee.js
│   ├── ExpenseAttachment.js
│   ├── ExpenseReportHistory.js
│   ├── ExpenseReportComment.js
│   ├── ExpenseDelegation.js
│   ├── ExpenseSavedTemplate.js
│   ├── ExpenseQuickExpense.js
│   └── ExpenseViolation.js
├── services/
│   ├── expenseReport.service.js
│   ├── expenseItem.service.js
│   ├── expenseAttachment.service.js
│   ├── expenseDelegation.service.js
│   ├── expenseTemplate.service.js
│   ├── expenseQuickCapture.service.js
│   └── expenseValidation.service.js
├── controllers/
│   ├── employee/
│   │   ├── expenseReport.controller.js
│   │   ├── expenseItem.controller.js
│   │   ├── expenseAttachment.controller.js
│   │   ├── expenseQuickCapture.controller.js
│   │   └── expenseTemplate.controller.js
│   └── admin/
│       ├── expenseReport.controller.js
│       └── expenseDelegation.controller.js
└── routes/
    ├── employee.expense.routes.js
    └── admin.expense.routes.js
```

---

## API Endpoints

### Employee APIs (25 Endpoints)

#### Expense Reports
```
POST   /api/employee/expense/reports                    - Create new expense report
GET    /api/employee/expense/reports                    - List my expense reports
GET    /api/employee/expense/reports/:id                - Get report details
PUT    /api/employee/expense/reports/:id                - Update draft report
DELETE /api/employee/expense/reports/:id                - Delete draft report
POST   /api/employee/expense/reports/:id/submit         - Submit report for approval
POST   /api/employee/expense/reports/:id/recall         - Recall submitted report
GET    /api/employee/expense/reports/:id/history        - Get report audit history
POST   /api/employee/expense/reports/:id/duplicate      - Duplicate existing report
```

#### Expense Items
```
POST   /api/employee/expense/reports/:reportId/items              - Add expense item
GET    /api/employee/expense/reports/:reportId/items              - List items in report
GET    /api/employee/expense/reports/:reportId/items/:itemId      - Get item details
PUT    /api/employee/expense/reports/:reportId/items/:itemId      - Update item
DELETE /api/employee/expense/reports/:reportId/items/:itemId      - Delete item
POST   /api/employee/expense/reports/:reportId/items/:itemId/attendees - Add attendees
```

#### Attachments
```
POST   /api/employee/expense/attachments/upload         - Upload receipt/attachment
GET    /api/employee/expense/attachments/:id            - Get attachment
DELETE /api/employee/expense/attachments/:id            - Delete attachment
```

#### Quick Capture
```
POST   /api/employee/expense/quick-capture              - Quick capture expense
GET    /api/employee/expense/quick-capture              - List captured expenses
PUT    /api/employee/expense/quick-capture/:id          - Update captured expense
POST   /api/employee/expense/quick-capture/:id/add-to-report - Add to report
DELETE /api/employee/expense/quick-capture/:id          - Discard captured expense
```

#### Templates
```
POST   /api/employee/expense/templates                  - Save report as template
GET    /api/employee/expense/templates                  - List my templates
GET    /api/employee/expense/templates/:id              - Get template details
DELETE /api/employee/expense/templates/:id              - Delete template
POST   /api/employee/expense/templates/:id/create-report - Create report from template
```

#### Comments
```
POST   /api/employee/expense/reports/:reportId/comments - Add comment
GET    /api/employee/expense/reports/:reportId/comments - Get comments
```

---

### Admin APIs (15 Endpoints)

#### Report Management
```
GET    /api/admin/expense/reports                       - List all reports (with filters)
GET    /api/admin/expense/reports/:id                   - Get report details
PUT    /api/admin/expense/reports/:id/status            - Update report status (cancel, etc.)
GET    /api/admin/expense/reports/pending-payment       - List reports pending payment
POST   /api/admin/expense/reports/:id/process-payment   - Mark payment processed
POST   /api/admin/expense/reports/bulk-payment          - Bulk payment processing
```

#### Delegation Management
```
POST   /api/admin/expense/delegations                   - Create delegation
GET    /api/admin/expense/delegations                   - List delegations
GET    /api/admin/expense/delegations/:id               - Get delegation details
PUT    /api/admin/expense/delegations/:id               - Update delegation
DELETE /api/admin/expense/delegations/:id               - Deactivate delegation
```

#### Analytics & Reports
```
GET    /api/admin/expense/reports/analytics             - Get expense analytics
GET    /api/admin/expense/reports/export                - Export reports to Excel/PDF
GET    /api/admin/expense/violations                    - List policy violations
GET    /api/admin/expense/violations/summary            - Violations summary
```

---

### Approver APIs (10 Endpoints)
```
GET    /api/approver/expense/pending                    - List pending approvals
GET    /api/approver/expense/reports/:id                - Get report for approval
POST   /api/approver/expense/reports/:id/approve        - Approve entire report
POST   /api/approver/expense/reports/:id/reject         - Reject entire report
POST   /api/approver/expense/reports/:id/send-back      - Send back for revision
POST   /api/approver/expense/items/:itemId/approve      - Approve single item
POST   /api/approver/expense/items/:itemId/reject       - Reject single item
POST   /api/approver/expense/items/bulk-approve         - Bulk approve items
POST   /api/approver/expense/items/bulk-reject          - Bulk reject items
POST   /api/approver/expense/reports/:id/comment        - Add approver comment
```

---

## Service Layer Implementation

### expenseReport.service.js
```javascript
const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const ExpenseReport = require('../models/ExpenseReport');
const ExpenseReportItem = require('../models/ExpenseReportItem');
const ExpenseReportHistory = require('../models/ExpenseReportHistory');
const ExpenseViolation = require('../models/ExpenseViolation');
const expenseWorkflowService = require('./expenseWorkflow.service');
const expenseValidationService = require('./expenseValidation.service');
const sequenceService = require('./sequence.service');

class ExpenseReportService {

    /**
     * Create new expense report
     */
    async createReport(companyId, employeeId, data, createdBy) {
        const transaction = await sequelize.transaction();

        try {
            // Generate report number
            const reportNumber = await sequenceService.generateNumber(
                companyId,
                'expense_report',
                transaction
            );

            // Get applicable policy
            const policy = await this.getApplicablePolicy(companyId, employeeId);

            // Create report
            const report = await ExpenseReport.create({
                company_id: companyId,
                report_number: reportNumber,
                employee_id: employeeId,
                title: data.title,
                description: data.description,
                purpose: data.purpose,
                trip_id: data.trip_id,
                project_id: data.project_id,
                cost_center_id: data.cost_center_id,
                report_date: data.report_date || new Date(),
                period_start_date: data.period_start_date,
                period_end_date: data.period_end_date,
                currency_id: data.currency_id,
                policy_id: policy?.id,
                status: 'Draft',
                created_by: createdBy
            }, { transaction });

            // Log history
            await this.logHistory(report.id, companyId, {
                action: 'Created',
                to_status: 'Draft',
                performed_by: createdBy
            }, transaction);

            await transaction.commit();

            return this.getReportById(report.id, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Add item to expense report
     */
    async addItem(reportId, companyId, data, createdBy) {
        const transaction = await sequelize.transaction();

        try {
            const report = await ExpenseReport.findOne({
                where: { id: reportId, company_id: companyId }
            });

            if (!report) {
                throw new Error('Report not found');
            }

            if (report.status !== 'Draft') {
                throw new Error('Can only add items to draft reports');
            }

            // Get next item number
            const maxItem = await ExpenseReportItem.max('item_number', {
                where: { report_id: reportId }
            });
            const itemNumber = (maxItem || 0) + 1;

            // Calculate amount based on expense type
            const calculatedAmount = this.calculateItemAmount(data);

            // Validate against policy
            const validationResult = await expenseValidationService.validateItem(
                companyId,
                report.employee_id,
                report.policy_id,
                data
            );

            // Create item
            const item = await ExpenseReportItem.create({
                company_id: companyId,
                report_id: reportId,
                item_number: itemNumber,
                category_id: data.category_id,
                subcategory_id: data.subcategory_id,
                expense_type: data.expense_type,
                description: data.description,
                expense_date: data.expense_date,
                merchant_name: data.merchant_name,
                merchant_location: data.merchant_location,
                original_currency_id: data.original_currency_id,
                original_amount: data.original_amount,
                exchange_rate: data.exchange_rate || 1,
                converted_amount: data.converted_amount,
                distance: data.distance,
                distance_unit: data.distance_unit,
                mileage_rate: data.mileage_rate,
                from_location: data.from_location,
                to_location: data.to_location,
                vehicle_type: data.vehicle_type,
                per_diem_location_id: data.per_diem_location_id,
                per_diem_type: data.per_diem_type,
                per_diem_rate: data.per_diem_rate,
                number_of_days: data.number_of_days,
                hours: data.hours,
                hourly_rate: data.hourly_rate,
                amount: calculatedAmount,
                tax_amount: data.tax_amount || 0,
                tax_code: data.tax_code,
                is_tax_inclusive: data.is_tax_inclusive || false,
                cgst_amount: data.cgst_amount || 0,
                sgst_amount: data.sgst_amount || 0,
                igst_amount: data.igst_amount || 0,
                is_reimbursable: data.is_reimbursable !== false,
                reimbursable_amount: data.is_reimbursable !== false ? calculatedAmount : 0,
                non_reimbursable_amount: data.is_reimbursable === false ? calculatedAmount : 0,
                payment_method: data.payment_method || 'Cash',
                card_last_four: data.card_last_four,
                is_billable: data.is_billable || false,
                client_id: data.client_id,
                receipt_required: validationResult.receipt_required,
                policy_limit: validationResult.limit,
                is_over_limit: validationResult.is_over_limit,
                over_limit_amount: validationResult.over_limit_amount,
                requires_additional_approval: validationResult.requires_additional_approval,
                custom_fields: data.custom_fields,
                item_status: 'Pending',
                created_by: createdBy
            }, { transaction });

            // Create violations if any
            if (validationResult.violations && validationResult.violations.length > 0) {
                for (const violation of validationResult.violations) {
                    await ExpenseViolation.create({
                        company_id: companyId,
                        report_id: reportId,
                        item_id: item.id,
                        violation_type: violation.type,
                        severity: violation.severity,
                        rule_name: violation.rule_name,
                        violation_description: violation.description,
                        claimed_amount: violation.claimed_amount,
                        allowed_amount: violation.allowed_amount,
                        violation_amount: violation.violation_amount
                    }, { transaction });
                }
            }

            // Update report totals
            await this.recalculateReportTotals(reportId, transaction);

            await transaction.commit();

            return this.getItemById(item.id, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Submit report for approval
     */
    async submitReport(reportId, companyId, employeeId, submittedBy) {
        const transaction = await sequelize.transaction();

        try {
            const report = await ExpenseReport.findOne({
                where: { id: reportId, company_id: companyId },
                include: [{ model: ExpenseReportItem, as: 'items' }]
            });

            if (!report) {
                throw new Error('Report not found');
            }

            if (report.employee_id !== employeeId && !await this.hasDelegation(employeeId, report.employee_id)) {
                throw new Error('Not authorized to submit this report');
            }

            if (report.status !== 'Draft') {
                throw new Error('Only draft reports can be submitted');
            }

            if (!report.items || report.items.length === 0) {
                throw new Error('Cannot submit report with no items');
            }

            // Check for hard block violations
            const hardBlockViolations = await ExpenseViolation.findOne({
                where: {
                    report_id: reportId,
                    severity: 'Hard_Block',
                    is_resolved: false
                }
            });

            if (hardBlockViolations) {
                throw new Error('Report has unresolved policy violations that must be addressed before submission');
            }

            // Check for missing receipts
            const missingReceipts = report.items.filter(
                item => item.receipt_required && !item.receipt_attached && !item.receipt_missing_reason
            );

            if (missingReceipts.length > 0) {
                throw new Error(`${missingReceipts.length} items require receipts or explanation for missing receipts`);
            }

            // Initialize workflow
            const workflowResult = await expenseWorkflowService.initiateWorkflow(
                companyId,
                reportId,
                report.employee_id,
                report.total_amount,
                transaction
            );

            // Update report
            await report.update({
                status: 'Submitted',
                workflow_instance_id: workflowResult.instance_id,
                current_stage_id: workflowResult.current_stage_id,
                submitted_at: new Date(),
                submitted_by: submittedBy,
                updated_by: submittedBy
            }, { transaction });

            // Update all items to pending
            await ExpenseReportItem.update(
                {
                    item_status: 'Pending',
                    current_stage_id: workflowResult.current_stage_id
                },
                {
                    where: { report_id: reportId },
                    transaction
                }
            );

            // Log history
            await this.logHistory(reportId, companyId, {
                action: 'Submitted',
                from_status: 'Draft',
                to_status: 'Submitted',
                performed_by: submittedBy
            }, transaction);

            await transaction.commit();

            // Trigger notifications (async)
            expenseWorkflowService.sendSubmissionNotifications(workflowResult.instance_id);

            return this.getReportById(reportId, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Approve expense item (line-item level)
     */
    async approveItem(itemId, companyId, approverId, approvedAmount, comments) {
        const transaction = await sequelize.transaction();

        try {
            const item = await ExpenseReportItem.findOne({
                where: { id: itemId, company_id: companyId },
                include: [{ model: ExpenseReport, as: 'report' }]
            });

            if (!item) {
                throw new Error('Item not found');
            }

            // Verify approver has permission for current stage
            const canApprove = await expenseWorkflowService.canApproveItem(
                item.report.workflow_instance_id,
                item.current_stage_id,
                approverId
            );

            if (!canApprove) {
                throw new Error('Not authorized to approve this item');
            }

            // Update item
            await item.update({
                item_status: 'Approved',
                approved_amount: approvedAmount || item.amount,
                item_approved_at: new Date(),
                item_approved_by: approverId,
                updated_by: approverId
            }, { transaction });

            // Log history
            await this.logHistory(item.report_id, companyId, {
                action: 'Item_Approved',
                item_id: itemId,
                amount_affected: approvedAmount || item.amount,
                comments: comments,
                performed_by: approverId
            }, transaction);

            // Resolve any violations for this item
            await ExpenseViolation.update(
                {
                    is_resolved: true,
                    resolution_type: 'Approved_Exception',
                    resolved_by: approverId,
                    resolved_at: new Date()
                },
                {
                    where: { item_id: itemId, is_resolved: false },
                    transaction
                }
            );

            // Recalculate report totals
            await this.recalculateReportTotals(item.report_id, transaction);

            // Check if all items are processed
            await this.checkReportCompletion(item.report_id, transaction);

            await transaction.commit();

            return this.getItemById(itemId, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Reject expense item (line-item level)
     */
    async rejectItem(itemId, companyId, approverId, reason) {
        const transaction = await sequelize.transaction();

        try {
            const item = await ExpenseReportItem.findOne({
                where: { id: itemId, company_id: companyId },
                include: [{ model: ExpenseReport, as: 'report' }]
            });

            if (!item) {
                throw new Error('Item not found');
            }

            if (!reason) {
                throw new Error('Rejection reason is required');
            }

            // Verify approver has permission
            const canApprove = await expenseWorkflowService.canApproveItem(
                item.report.workflow_instance_id,
                item.current_stage_id,
                approverId
            );

            if (!canApprove) {
                throw new Error('Not authorized to reject this item');
            }

            // Update item
            await item.update({
                item_status: 'Rejected',
                approved_amount: 0,
                rejection_reason: reason,
                item_rejected_at: new Date(),
                item_rejected_by: approverId,
                updated_by: approverId
            }, { transaction });

            // Log history
            await this.logHistory(item.report_id, companyId, {
                action: 'Item_Rejected',
                item_id: itemId,
                amount_affected: item.amount,
                comments: reason,
                performed_by: approverId
            }, transaction);

            // Recalculate report totals
            await this.recalculateReportTotals(item.report_id, transaction);

            // Check if all items are processed
            await this.checkReportCompletion(item.report_id, transaction);

            await transaction.commit();

            return this.getItemById(itemId, companyId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Calculate item amount based on expense type
     */
    calculateItemAmount(data) {
        switch (data.expense_type) {
            case 'Mileage':
                return (data.distance || 0) * (data.mileage_rate || 0);

            case 'Per_Diem':
                return (data.number_of_days || 0) * (data.per_diem_rate || 0);

            case 'Time_Based':
                return (data.hours || 0) * (data.hourly_rate || 0);

            case 'Amount':
            default:
                if (data.original_currency_id && data.exchange_rate) {
                    return (data.original_amount || 0) * (data.exchange_rate || 1);
                }
                return data.amount || data.original_amount || 0;
        }
    }

    /**
     * Recalculate report totals from items
     */
    async recalculateReportTotals(reportId, transaction) {
        const items = await ExpenseReportItem.findAll({
            where: { report_id: reportId, is_active: true }
        });

        const totals = items.reduce((acc, item) => {
            acc.total += parseFloat(item.amount) || 0;
            acc.reimbursable += parseFloat(item.reimbursable_amount) || 0;
            acc.nonReimbursable += parseFloat(item.non_reimbursable_amount) || 0;
            acc.totalItems++;

            if (item.item_status === 'Approved') {
                acc.approved += parseFloat(item.approved_amount) || 0;
                acc.approvedItems++;
            } else if (item.item_status === 'Rejected') {
                acc.rejected += parseFloat(item.amount) || 0;
                acc.rejectedItems++;
            } else {
                acc.pending += parseFloat(item.amount) || 0;
                acc.pendingItems++;
            }

            return acc;
        }, {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            reimbursable: 0,
            nonReimbursable: 0,
            totalItems: 0,
            approvedItems: 0,
            rejectedItems: 0,
            pendingItems: 0
        });

        await ExpenseReport.update({
            total_amount: totals.total,
            approved_amount: totals.approved,
            rejected_amount: totals.rejected,
            pending_amount: totals.pending,
            total_reimbursable: totals.reimbursable,
            total_non_reimbursable: totals.nonReimbursable,
            total_items: totals.totalItems,
            approved_items: totals.approvedItems,
            rejected_items: totals.rejectedItems,
            pending_items: totals.pendingItems
        }, {
            where: { id: reportId },
            transaction
        });
    }

    /**
     * Check if all items processed and update report status
     */
    async checkReportCompletion(reportId, transaction) {
        const report = await ExpenseReport.findByPk(reportId);

        if (report.pending_items === 0) {
            // All items processed
            let newStatus;

            if (report.rejected_items === report.total_items) {
                // All rejected
                newStatus = 'Rejected';
            } else if (report.approved_items === report.total_items) {
                // All approved
                newStatus = 'Approved';
            } else {
                // Partial approval
                newStatus = 'Partially_Approved';
            }

            // Calculate net payable (approved - advance)
            const netPayable = report.approved_amount - (report.advance_adjusted || 0);

            await report.update({
                status: newStatus,
                net_payable: Math.max(0, netPayable),
                final_approved_at: new Date(),
                payment_status: netPayable > 0 ? 'Unpaid' : 'Paid'
            }, { transaction });

            // Complete workflow
            await expenseWorkflowService.completeWorkflow(
                report.workflow_instance_id,
                newStatus,
                transaction
            );
        }
    }

    /**
     * Log report history
     */
    async logHistory(reportId, companyId, data, transaction) {
        await ExpenseReportHistory.create({
            company_id: companyId,
            report_id: reportId,
            item_id: data.item_id,
            action: data.action,
            from_status: data.from_status,
            to_status: data.to_status,
            stage_id: data.stage_id,
            stage_name: data.stage_name,
            performed_by: data.performed_by,
            comments: data.comments,
            amount_affected: data.amount_affected,
            changes: data.changes
        }, { transaction });
    }

    /**
     * Get report by ID with all details
     */
    async getReportById(reportId, companyId) {
        return ExpenseReport.findOne({
            where: { id: reportId, company_id: companyId },
            include: [
                {
                    model: ExpenseReportItem,
                    as: 'items',
                    where: { is_active: true },
                    required: false
                },
                {
                    model: ExpenseViolation,
                    as: 'violations',
                    required: false
                }
            ]
        });
    }

    /**
     * Get item by ID
     */
    async getItemById(itemId, companyId) {
        return ExpenseReportItem.findOne({
            where: { id: itemId, company_id: companyId }
        });
    }

    /**
     * Check delegation permission
     */
    async hasDelegation(delegateId, delegatorId) {
        const { ExpenseDelegation } = require('../models');
        const today = new Date();

        return ExpenseDelegation.findOne({
            where: {
                delegator_id: delegatorId,
                delegate_id: delegateId,
                is_active: true,
                start_date: { [Op.lte]: today },
                [Op.or]: [
                    { end_date: null },
                    { end_date: { [Op.gte]: today } }
                ]
            }
        });
    }

    /**
     * Get applicable policy for employee
     */
    async getApplicablePolicy(companyId, employeeId) {
        // This would call the policy service to determine applicable policy
        // based on employee's department, grade, location, etc.
        return null; // Placeholder
    }
}

module.exports = new ExpenseReportService();
```

---

## Line Item Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPENSE REPORT SUBMITTED                      │
│                                                                  │
│  Report #EXP-2024-001                                           │
│  Employee: John Doe                                             │
│  Total Amount: ₹25,000                                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ITEMS                                                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ #1 Travel - Flight to Mumbai        ₹12,000    [Pending] │  │
│  │ #2 Hotel - 2 nights stay            ₹8,000     [Pending] │  │
│  │ #3 Meals - Client dinner            ₹3,000     [Pending] │  │
│  │ #4 Misc - Airport parking           ₹2,000     [Pending] │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVER REVIEWS ITEMS                        │
│                                                                  │
│  Manager: Sarah Smith                                           │
│                                                                  │
│  Actions Available:                                             │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ □ Select All    [Approve Selected] [Reject Selected]       ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ ☑ #1 Travel ₹12,000    Amount: [12000] ✓ Approve           ││
│  │ ☑ #2 Hotel ₹8,000      Amount: [8000]  ✓ Approve           ││
│  │ ☑ #3 Meals ₹3,000      Amount: [1500]  ✓ Approve (Partial) ││
│  │ ☐ #4 Misc ₹2,000       Reason: [No receipt] ✗ Reject       ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               PARTIAL APPROVAL COMPLETED                         │
│                                                                  │
│  Report Status: Partially Approved                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FINAL SUMMARY                                             │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ #1 Travel ₹12,000   → ✓ Approved    ₹12,000              │  │
│  │ #2 Hotel ₹8,000     → ✓ Approved    ₹8,000               │  │
│  │ #3 Meals ₹3,000     → ✓ Approved    ₹1,500 (Adjusted)    │  │
│  │ #4 Misc ₹2,000      → ✗ Rejected    ₹0                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Total Claimed:     ₹25,000                               │  │
│  │ Total Approved:    ₹21,500                               │  │
│  │ Total Rejected:    ₹3,500                                │  │
│  │ ─────────────────────────────                            │  │
│  │ Net Payable:       ₹21,500                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Expense Item Types

### 1. Amount Type (Standard)
```javascript
{
    expense_type: 'Amount',
    original_currency_id: 1,  // USD
    original_amount: 100.00,
    exchange_rate: 83.50,
    converted_amount: 8350.00,  // INR
    amount: 8350.00
}
```

### 2. Mileage Type
```javascript
{
    expense_type: 'Mileage',
    distance: 150,
    distance_unit: 'KM',
    mileage_rate: 12.00,  // Per KM
    from_location: 'Office - Bangalore',
    to_location: 'Client Site - Mysore',
    vehicle_type: 'Four_Wheeler',
    amount: 1800.00  // 150 * 12
}
```

### 3. Per Diem Type
```javascript
{
    expense_type: 'Per_Diem',
    per_diem_location_id: 5,  // Mumbai
    per_diem_type: 'Full_Day',
    per_diem_rate: 2500.00,
    number_of_days: 3,
    amount: 7500.00  // 3 * 2500
}
```

### 4. Time Based Type
```javascript
{
    expense_type: 'Time_Based',
    hours: 8,
    hourly_rate: 500.00,
    amount: 4000.00  // 8 * 500
}
```

---

## SQL Migration Script
```sql
-- File: scripts/sql/expense/006_create_expense_reports.sql

-- Table 1: Expense Reports
CREATE TABLE hrms_expense_reports (
    -- ... (full schema as defined above)
);

-- Table 2: Expense Report Items
CREATE TABLE hrms_expense_report_items (
    -- ... (full schema as defined above)
);

-- Table 3: Item Attendees
CREATE TABLE hrms_expense_item_attendees (
    -- ... (full schema as defined above)
);

-- Table 4: Attachments
CREATE TABLE hrms_expense_attachments (
    -- ... (full schema as defined above)
);

-- Table 5: Report History
CREATE TABLE hrms_expense_report_history (
    -- ... (full schema as defined above)
);

-- Table 6: Report Comments
CREATE TABLE hrms_expense_report_comments (
    -- ... (full schema as defined above)
);

-- Table 7: Delegations
CREATE TABLE hrms_expense_delegations (
    -- ... (full schema as defined above)
);

-- Table 8: Saved Templates
CREATE TABLE hrms_expense_saved_templates (
    -- ... (full schema as defined above)
);

-- Table 9: Quick Expenses
CREATE TABLE hrms_expense_quick_expenses (
    -- ... (full schema as defined above)
);

-- Table 10: Violations
CREATE TABLE hrms_expense_violations (
    -- ... (full schema as defined above)
);
```

---

## Key Features Summary

1. **Line Item Level Approval**: Each expense item can be approved/rejected independently
2. **Partial Approval**: Only approved items get processed for payment
3. **Amount Adjustment**: Approvers can approve partial amounts
4. **Multiple Expense Types**: Amount, Mileage, Per Diem, Time-based
5. **Multi-Currency Support**: With exchange rate conversion
6. **Quick Capture**: Mobile-friendly expense capture
7. **Templates**: Save and reuse expense report structures
8. **Delegation**: Submit expenses on behalf of others
9. **Policy Validation**: Real-time compliance checking
10. **Violation Tracking**: Log and resolve policy violations
11. **Audit Trail**: Complete history of all actions
12. **Receipt Management**: Attachments with OCR support

---

## Total: 10 Tables, 50 API Endpoints
