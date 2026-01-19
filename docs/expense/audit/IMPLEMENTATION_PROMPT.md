# Phase 4.2: Audit & Compliance Management - Implementation Document

## Overview
This document covers the implementation of Audit & Compliance module for the Expense Management system. This module provides comprehensive audit trail logging, policy violation detection, duplicate expense detection, fraud detection, compliance reporting, and complete visibility into all expense-related activities.

---

## Key Concepts

### Audit Trail Levels
```
┌─────────────────────────────────────────────────────────────────┐
│                      AUDIT TRAIL LEVELS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 1: ACTION AUDIT                                          │
│  ─────────────────────                                          │
│  WHO did WHAT and WHEN                                          │
│  Example: "John created expense report EXP-001 at 10:00 AM"     │
│                                                                  │
│  Level 2: DATA CHANGE AUDIT                                     │
│  ─────────────────────────                                      │
│  WHAT fields changed, OLD vs NEW values                         │
│  Example: "Amount changed from ₹5000 to ₹5500"                  │
│                                                                  │
│  Level 3: SYSTEM AUDIT                                          │
│  ──────────────────────                                         │
│  API calls, response times, errors, system events               │
│  Example: "API /expense/submit called, response 200, 45ms"      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Violation Types
```
┌─────────────────────────────────────────────────────────────────┐
│                      VIOLATION CATEGORIES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POLICY VIOLATIONS                                              │
│  ├── Over spending limit                                        │
│  ├── Invalid category for role/department                       │
│  ├── Expense outside allowed date range                         │
│  ├── Missing mandatory fields                                   │
│  └── Unapproved merchant/vendor                                 │
│                                                                  │
│  COMPLIANCE VIOLATIONS                                          │
│  ├── Missing receipt (above threshold)                          │
│  ├── Late submission                                            │
│  ├── Incomplete documentation                                   │
│  └── Missing approvals                                          │
│                                                                  │
│  FRAUD INDICATORS                                               │
│  ├── Duplicate expenses                                         │
│  ├── Round amount patterns                                      │
│  ├── Weekend/holiday expenses                                   │
│  ├── Unusual spending patterns                                  │
│  ├── Split expenses (to avoid limits)                           │
│  └── Merchant anomalies                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table 1: hrms_expense_audit_logs (Comprehensive Audit Trail)
```sql
CREATE TABLE hrms_expense_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Audit Identification
    audit_id VARCHAR(50) NOT NULL COMMENT 'Unique audit ID (AUD-2025-000001)',
    correlation_id VARCHAR(50) COMMENT 'Group related actions',
    session_id VARCHAR(100) COMMENT 'User session ID',

    -- Entity Reference
    entity_type ENUM(
        'Expense_Report', 'Expense_Item', 'Advance_Request',
        'Payment', 'Payment_Batch', 'Policy', 'Category',
        'Settings', 'Workflow', 'User', 'Other'
    ) NOT NULL,
    entity_id INT NOT NULL,
    entity_number VARCHAR(50) COMMENT 'Report/Advance/Payment number',

    -- Action Details
    action_type ENUM(
        'Create', 'Read', 'Update', 'Delete', 'Submit', 'Approve',
        'Reject', 'Recall', 'Cancel', 'Process', 'Export', 'Import',
        'Login', 'Logout', 'View', 'Download', 'Upload', 'Other'
    ) NOT NULL,
    action_description VARCHAR(500) NOT NULL,

    -- Actor Details
    performed_by INT NOT NULL COMMENT 'User ID',
    performed_by_name VARCHAR(255),
    performed_by_role VARCHAR(100),
    performed_by_employee_code VARCHAR(50),

    -- On Behalf Of (for delegation)
    on_behalf_of INT,
    on_behalf_of_name VARCHAR(255),

    -- Data Changes (Level 2 Audit)
    old_values JSON COMMENT 'Previous field values',
    new_values JSON COMMENT 'New field values',
    changed_fields JSON COMMENT 'List of changed field names',

    -- Request Context
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    device_type ENUM('Web', 'Mobile_App', 'API', 'System') DEFAULT 'Web',
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    location VARCHAR(255) COMMENT 'Geo location if available',

    -- API Details (Level 3 Audit)
    api_endpoint VARCHAR(255),
    http_method VARCHAR(10),
    request_payload JSON,
    response_status INT,
    response_time_ms INT,

    -- Additional Context
    module VARCHAR(50) DEFAULT 'Expense',
    sub_module VARCHAR(50),
    remarks TEXT,

    -- Flags
    is_sensitive TINYINT(1) DEFAULT 0 COMMENT 'Sensitive data accessed',
    is_bulk_operation TINYINT(1) DEFAULT 0,
    requires_review TINYINT(1) DEFAULT 0,

    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_company (company_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action_type),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at),
    INDEX idx_correlation (correlation_id),
    INDEX idx_audit_id (audit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 2: hrms_expense_violations (Policy & Compliance Violations)
```sql
CREATE TABLE hrms_expense_violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Violation Identification
    violation_number VARCHAR(50) NOT NULL,

    -- Reference
    entity_type ENUM('Expense_Report', 'Expense_Item', 'Advance_Request') NOT NULL,
    expense_report_id INT,
    expense_item_id INT,
    advance_request_id INT,

    -- Employee
    employee_id INT NOT NULL,

    -- Violation Category
    violation_category ENUM(
        'Policy', 'Compliance', 'Fraud_Indicator', 'System'
    ) NOT NULL,

    -- Violation Type
    violation_type ENUM(
        -- Policy Violations
        'Over_Limit', 'Invalid_Category', 'Date_Violation',
        'Merchant_Blocked', 'Currency_Not_Allowed', 'Frequency_Exceeded',

        -- Compliance Violations
        'Missing_Receipt', 'Late_Submission', 'Incomplete_Documentation',
        'Missing_Approval', 'Invalid_Attachment',

        -- Fraud Indicators
        'Duplicate_Expense', 'Round_Amount_Pattern', 'Weekend_Holiday_Expense',
        'Unusual_Spending', 'Split_Expense', 'Merchant_Anomaly',
        'Timing_Anomaly', 'Location_Mismatch',

        -- System
        'Data_Integrity', 'Other'
    ) NOT NULL,

    -- Severity
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',

    -- Violation Details
    violation_description TEXT NOT NULL,
    rule_id INT COMMENT 'FK to violation rule',
    rule_name VARCHAR(255),

    -- Amount Details
    claimed_amount DECIMAL(15,2),
    allowed_amount DECIMAL(15,2),
    violation_amount DECIMAL(15,2),

    -- Detection
    detection_method ENUM('System_Auto', 'Manual_Review', 'AI_ML', 'Report') DEFAULT 'System_Auto',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    detected_by INT,

    -- Confidence Score (for AI/ML detection)
    confidence_score DECIMAL(5,2) COMMENT '0-100%',

    -- Evidence
    evidence JSON COMMENT 'Supporting data for the violation',
    related_expenses JSON COMMENT 'Related expense IDs for duplicates',

    -- Status
    violation_status ENUM(
        'Open', 'Under_Review', 'Confirmed', 'False_Positive',
        'Exception_Approved', 'Resolved', 'Escalated'
    ) DEFAULT 'Open',

    -- Review Details
    reviewed_by INT,
    reviewed_at DATETIME,
    review_comments TEXT,

    -- Resolution
    resolution_type ENUM(
        'Approved_Exception', 'Amount_Adjusted', 'Rejected',
        'Employee_Warned', 'Escalated_HR', 'Written_Off', 'Auto_Resolved'
    ),
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at DATETIME,

    -- Action Taken
    action_taken ENUM(
        'None', 'Warning_Issued', 'Amount_Deducted', 'Request_Rejected',
        'Sent_For_Investigation', 'Policy_Exception_Granted'
    ),
    action_notes TEXT,

    -- Escalation
    is_escalated TINYINT(1) DEFAULT 0,
    escalated_to INT,
    escalated_at DATETIME,
    escalation_reason VARCHAR(500),

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_violation_number (company_id, violation_number),
    INDEX idx_employee (employee_id),
    INDEX idx_entity (entity_type, expense_report_id),
    INDEX idx_violation_type (violation_type),
    INDEX idx_severity (severity),
    INDEX idx_status (violation_status),
    INDEX idx_detected_at (detected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 3: hrms_expense_violation_rules (Violation Detection Rules)
```sql
CREATE TABLE hrms_expense_violation_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Rule Identification
    rule_code VARCHAR(50) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,

    -- Rule Category
    rule_category ENUM('Policy', 'Compliance', 'Fraud_Detection') NOT NULL,
    violation_type VARCHAR(50) NOT NULL,

    -- Rule Configuration
    is_enabled TINYINT(1) DEFAULT 1,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',

    -- Rule Logic (JSON configuration)
    rule_config JSON NOT NULL,
    /*
    Examples:

    Over Limit Rule:
    {
        "check_type": "amount_limit",
        "compare_field": "amount",
        "compare_against": "policy_limit",
        "threshold_percentage": 100
    }

    Duplicate Detection Rule:
    {
        "check_type": "duplicate",
        "match_fields": ["amount", "merchant_name", "expense_date"],
        "time_window_days": 30,
        "similarity_threshold": 90
    }

    Round Amount Rule:
    {
        "check_type": "pattern",
        "pattern_type": "round_amount",
        "round_multiples": [100, 500, 1000],
        "min_occurrences": 3,
        "time_window_days": 90
    }

    Weekend Expense Rule:
    {
        "check_type": "date_pattern",
        "check_days": ["Saturday", "Sunday"],
        "excluded_categories": ["Travel", "Hotel"],
        "min_amount": 1000
    }
    */

    -- Thresholds
    amount_threshold DECIMAL(15,2) COMMENT 'Minimum amount to trigger',
    percentage_threshold DECIMAL(5,2),
    count_threshold INT COMMENT 'Minimum occurrences',
    time_window_days INT DEFAULT 30,

    -- Actions
    auto_flag TINYINT(1) DEFAULT 1 COMMENT 'Auto flag violations',
    auto_reject TINYINT(1) DEFAULT 0 COMMENT 'Auto reject expense',
    require_review TINYINT(1) DEFAULT 0,
    notify_manager TINYINT(1) DEFAULT 0,
    notify_compliance TINYINT(1) DEFAULT 0,

    -- Applicability
    applies_to_all TINYINT(1) DEFAULT 1,
    department_ids JSON COMMENT 'Specific departments',
    grade_ids JSON COMMENT 'Specific grades',
    category_ids JSON COMMENT 'Specific expense categories',

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_rule_code (company_id, rule_code),
    INDEX idx_category (rule_category),
    INDEX idx_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 4: hrms_expense_duplicate_groups (Duplicate Expense Tracking)
```sql
CREATE TABLE hrms_expense_duplicate_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Group Identification
    group_number VARCHAR(50) NOT NULL,

    -- Duplicate Type
    duplicate_type ENUM(
        'Exact_Match', 'Near_Match', 'Potential_Split',
        'Same_Receipt', 'Cross_Employee'
    ) NOT NULL,

    -- Match Details
    match_score DECIMAL(5,2) COMMENT 'Similarity percentage',
    matched_fields JSON COMMENT 'Fields that matched',

    -- Group Members
    expense_item_ids JSON NOT NULL COMMENT 'Array of expense item IDs',
    expense_report_ids JSON COMMENT 'Array of report IDs',
    employee_ids JSON COMMENT 'Array of employee IDs (for cross-employee)',

    -- Amount Details
    total_duplicate_amount DECIMAL(15,2),
    potential_savings DECIMAL(15,2),

    -- Status
    group_status ENUM(
        'Pending_Review', 'Confirmed_Duplicate', 'Not_Duplicate',
        'Partial_Duplicate', 'Resolved'
    ) DEFAULT 'Pending_Review',

    -- Review
    reviewed_by INT,
    reviewed_at DATETIME,
    review_notes TEXT,

    -- Resolution
    resolution_action ENUM(
        'All_Approved', 'One_Approved_Rest_Rejected',
        'Amounts_Adjusted', 'Marked_Not_Duplicate'
    ),
    resolved_by INT,
    resolved_at DATETIME,

    -- Metadata
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_group_number (company_id, group_number),
    INDEX idx_status (group_status),
    INDEX idx_type (duplicate_type),
    INDEX idx_detected_at (detected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 5: hrms_expense_compliance_checklist (Compliance Requirements)
```sql
CREATE TABLE hrms_expense_compliance_checklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Checklist Item
    checklist_code VARCHAR(50) NOT NULL,
    checklist_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Category
    compliance_category ENUM(
        'Documentation', 'Approval', 'Policy', 'Tax', 'Legal', 'Other'
    ) NOT NULL,

    -- Applicability
    applies_to ENUM('All_Expenses', 'Category_Specific', 'Amount_Based', 'Custom') DEFAULT 'All_Expenses',
    category_ids JSON,
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    custom_condition JSON,

    -- Requirement Details
    is_mandatory TINYINT(1) DEFAULT 1,
    requires_document TINYINT(1) DEFAULT 0,
    document_types JSON COMMENT 'Allowed document types',

    -- Validation
    validation_type ENUM('Manual', 'Auto', 'Both') DEFAULT 'Manual',
    auto_validation_rule JSON,

    -- Failure Action
    on_failure_action ENUM('Block', 'Warn', 'Flag', 'None') DEFAULT 'Warn',

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_checklist_code (company_id, checklist_code),
    INDEX idx_category (compliance_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 6: hrms_expense_compliance_status (Expense Compliance Status)
```sql
CREATE TABLE hrms_expense_compliance_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Reference
    expense_report_id INT NOT NULL,
    expense_item_id INT,
    checklist_id INT NOT NULL,

    -- Status
    compliance_status ENUM('Pending', 'Compliant', 'Non_Compliant', 'Waived', 'NA') DEFAULT 'Pending',

    -- Verification
    verified_by INT,
    verified_at DATETIME,
    verification_method ENUM('Auto', 'Manual'),
    verification_notes TEXT,

    -- Document Reference
    document_id INT COMMENT 'FK to attachment if document required',

    -- Waiver (if non-compliant but approved)
    is_waived TINYINT(1) DEFAULT 0,
    waived_by INT,
    waived_at DATETIME,
    waiver_reason VARCHAR(500),

    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (expense_report_id) REFERENCES hrms_expense_reports(id),
    FOREIGN KEY (checklist_id) REFERENCES hrms_expense_compliance_checklist(id),
    INDEX idx_report (expense_report_id),
    INDEX idx_status (compliance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 7: hrms_expense_fraud_alerts (Fraud Detection Alerts)
```sql
CREATE TABLE hrms_expense_fraud_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Alert Identification
    alert_number VARCHAR(50) NOT NULL,

    -- Employee
    employee_id INT NOT NULL,

    -- Alert Type
    alert_type ENUM(
        'Spending_Anomaly', 'Duplicate_Pattern', 'Split_Transaction',
        'Unusual_Timing', 'Merchant_Risk', 'Amount_Pattern',
        'Frequency_Anomaly', 'Cross_Employee_Match', 'Other'
    ) NOT NULL,

    -- Alert Details
    alert_title VARCHAR(255) NOT NULL,
    alert_description TEXT NOT NULL,

    -- Risk Assessment
    risk_score DECIMAL(5,2) COMMENT '0-100',
    risk_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,

    -- Evidence
    evidence_summary TEXT,
    evidence_data JSON,
    related_expense_ids JSON,
    analysis_period_start DATE,
    analysis_period_end DATE,

    -- Financial Impact
    total_flagged_amount DECIMAL(15,2),
    potential_fraud_amount DECIMAL(15,2),

    -- Status
    alert_status ENUM(
        'New', 'Under_Investigation', 'Confirmed_Fraud',
        'False_Positive', 'Resolved', 'Escalated'
    ) DEFAULT 'New',

    -- Investigation
    assigned_to INT,
    assigned_at DATETIME,
    investigation_notes TEXT,

    -- Resolution
    resolution_outcome ENUM(
        'No_Action', 'Warning_Issued', 'Recovery_Initiated',
        'Terminated', 'Legal_Action', 'Policy_Exception'
    ),
    resolution_notes TEXT,
    resolved_by INT,
    resolved_at DATETIME,

    -- Escalation
    is_escalated TINYINT(1) DEFAULT 0,
    escalated_to_hr TINYINT(1) DEFAULT 0,
    escalated_to_legal TINYINT(1) DEFAULT 0,

    -- Metadata
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    UNIQUE KEY uk_alert_number (company_id, alert_number),
    INDEX idx_employee (employee_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_status (alert_status),
    INDEX idx_detected_at (detected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 8: hrms_expense_audit_settings (Audit Configuration)
```sql
CREATE TABLE hrms_expense_audit_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Audit Level Settings
    enable_action_audit TINYINT(1) DEFAULT 1,
    enable_data_change_audit TINYINT(1) DEFAULT 1,
    enable_api_audit TINYINT(1) DEFAULT 0,

    -- Retention
    audit_retention_days INT DEFAULT 365 COMMENT 'How long to keep audit logs',
    archive_after_days INT DEFAULT 90,

    -- What to Audit
    audit_entities JSON DEFAULT '["Expense_Report", "Expense_Item", "Advance_Request", "Payment"]',
    audit_actions JSON DEFAULT '["Create", "Update", "Delete", "Submit", "Approve", "Reject"]',

    -- Sensitive Data
    mask_sensitive_fields TINYINT(1) DEFAULT 1,
    sensitive_fields JSON DEFAULT '["account_number", "ifsc_code"]',

    -- Violation Detection
    enable_violation_detection TINYINT(1) DEFAULT 1,
    enable_duplicate_detection TINYINT(1) DEFAULT 1,
    enable_fraud_detection TINYINT(1) DEFAULT 1,

    -- Detection Frequency
    duplicate_check_frequency ENUM('Real_Time', 'Daily', 'Weekly') DEFAULT 'Real_Time',
    fraud_analysis_frequency ENUM('Daily', 'Weekly', 'Monthly') DEFAULT 'Weekly',

    -- Notifications
    notify_on_critical_violation TINYINT(1) DEFAULT 1,
    notify_on_fraud_alert TINYINT(1) DEFAULT 1,
    notification_recipients JSON COMMENT 'Email addresses for alerts',

    -- Compliance
    require_compliance_check TINYINT(1) DEFAULT 1,
    block_on_compliance_failure TINYINT(1) DEFAULT 0,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Directory Structure
```
src/microservices/expense/
├── models/
│   ├── ExpenseAuditLog.js
│   ├── ExpenseViolation.js
│   ├── ExpenseViolationRule.js
│   ├── ExpenseDuplicateGroup.js
│   ├── ExpenseComplianceChecklist.js
│   ├── ExpenseComplianceStatus.js
│   ├── ExpenseFraudAlert.js
│   └── ExpenseAuditSettings.js
├── services/
│   ├── audit.service.js
│   ├── violation.service.js
│   ├── duplicateDetection.service.js
│   ├── fraudDetection.service.js
│   ├── compliance.service.js
│   └── auditReport.service.js
├── controllers/
│   └── admin/
│       ├── audit.controller.js
│       ├── violation.controller.js
│       ├── compliance.controller.js
│       └── fraudAlert.controller.js
├── middleware/
│   └── auditLogger.middleware.js
├── jobs/
│   ├── duplicateDetectionJob.js
│   ├── fraudAnalysisJob.js
│   └── auditArchiveJob.js
└── routes/
    └── admin.expense.routes.js
```

---

## API Endpoints

### Audit Log APIs (8 APIs)
```
GET    /api/admin/expense/audit/logs                    - Search audit logs
GET    /api/admin/expense/audit/logs/:id                - Get audit log details
GET    /api/admin/expense/audit/entity/:type/:id        - Get audit trail for entity
GET    /api/admin/expense/audit/user/:userId            - Get user activity log
GET    /api/admin/expense/audit/export                  - Export audit logs
GET    /api/admin/expense/audit/summary                 - Get audit summary/stats
GET    /api/admin/expense/audit/timeline/:entityType/:entityId - Get entity timeline
POST   /api/admin/expense/audit/search                  - Advanced audit search
```

### Violation Management APIs (12 APIs)
```
GET    /api/admin/expense/violations                    - List all violations
GET    /api/admin/expense/violations/:id                - Get violation details
PUT    /api/admin/expense/violations/:id/status         - Update violation status
POST   /api/admin/expense/violations/:id/review         - Submit review
POST   /api/admin/expense/violations/:id/resolve        - Resolve violation
POST   /api/admin/expense/violations/:id/escalate       - Escalate violation
GET    /api/admin/expense/violations/employee/:id       - Get employee violations
GET    /api/admin/expense/violations/summary            - Violations dashboard
GET    /api/admin/expense/violations/trends             - Violation trends
POST   /api/admin/expense/violations/bulk-resolve       - Bulk resolve
GET    /api/admin/expense/violation-rules               - List violation rules
POST   /api/admin/expense/violation-rules               - Create/Update rule
```

### Duplicate Detection APIs (6 APIs)
```
GET    /api/admin/expense/duplicates                    - List duplicate groups
GET    /api/admin/expense/duplicates/:id                - Get duplicate group details
POST   /api/admin/expense/duplicates/:id/review         - Review duplicate group
POST   /api/admin/expense/duplicates/:id/resolve        - Resolve duplicates
POST   /api/admin/expense/duplicates/scan               - Trigger duplicate scan
GET    /api/admin/expense/duplicates/summary            - Duplicates summary
```

### Fraud Detection APIs (8 APIs)
```
GET    /api/admin/expense/fraud-alerts                  - List fraud alerts
GET    /api/admin/expense/fraud-alerts/:id              - Get alert details
PUT    /api/admin/expense/fraud-alerts/:id/status       - Update alert status
POST   /api/admin/expense/fraud-alerts/:id/investigate  - Start investigation
POST   /api/admin/expense/fraud-alerts/:id/resolve      - Resolve alert
POST   /api/admin/expense/fraud-alerts/:id/escalate     - Escalate to HR/Legal
GET    /api/admin/expense/fraud-alerts/dashboard        - Fraud dashboard
POST   /api/admin/expense/fraud-alerts/analyze          - Trigger fraud analysis
```

### Compliance APIs (8 APIs)
```
GET    /api/admin/expense/compliance/checklist          - List compliance checklist
POST   /api/admin/expense/compliance/checklist          - Create checklist item
PUT    /api/admin/expense/compliance/checklist/:id      - Update checklist item
DELETE /api/admin/expense/compliance/checklist/:id      - Delete checklist item
GET    /api/admin/expense/compliance/status/:reportId   - Get report compliance status
POST   /api/admin/expense/compliance/verify             - Verify compliance
POST   /api/admin/expense/compliance/waive              - Waive compliance requirement
GET    /api/admin/expense/compliance/report             - Compliance report
```

### Settings APIs (4 APIs)
```
GET    /api/admin/expense/audit/settings                - Get audit settings
PUT    /api/admin/expense/audit/settings                - Update audit settings
POST   /api/admin/expense/audit/archive                 - Archive old audit logs
GET    /api/admin/expense/audit/storage-stats           - Get audit storage stats
```

### Reports APIs (6 APIs)
```
GET    /api/admin/expense/audit/reports/activity        - User activity report
GET    /api/admin/expense/audit/reports/violations      - Violations report
GET    /api/admin/expense/audit/reports/compliance      - Compliance report
GET    /api/admin/expense/audit/reports/fraud           - Fraud analysis report
GET    /api/admin/expense/audit/reports/executive       - Executive summary
POST   /api/admin/expense/audit/reports/custom          - Generate custom report
```

---

## Service Layer Implementation

### audit.service.js
```javascript
const { Op } = require('sequelize');
const ExpenseAuditLog = require('../models/ExpenseAuditLog');
const ExpenseAuditSettings = require('../models/ExpenseAuditSettings');
const sequenceService = require('./sequence.service');

class AuditService {

    /**
     * Log audit entry
     */
    async log(companyId, data) {
        const settings = await this.getSettings(companyId);

        // Check if this action should be audited
        if (!this.shouldAudit(data, settings)) {
            return null;
        }

        // Generate audit ID
        const auditId = await sequenceService.generateNumber(
            companyId,
            'audit_log'
        );

        // Mask sensitive fields if enabled
        let oldValues = data.old_values;
        let newValues = data.new_values;

        if (settings.mask_sensitive_fields && settings.sensitive_fields) {
            const sensitiveFields = JSON.parse(settings.sensitive_fields);
            oldValues = this.maskSensitiveData(oldValues, sensitiveFields);
            newValues = this.maskSensitiveData(newValues, sensitiveFields);
        }

        // Create audit log
        return ExpenseAuditLog.create({
            company_id: companyId,
            audit_id: auditId,
            correlation_id: data.correlation_id,
            session_id: data.session_id,
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            entity_number: data.entity_number,
            action_type: data.action_type,
            action_description: data.action_description,
            performed_by: data.performed_by,
            performed_by_name: data.performed_by_name,
            performed_by_role: data.performed_by_role,
            performed_by_employee_code: data.performed_by_employee_code,
            on_behalf_of: data.on_behalf_of,
            on_behalf_of_name: data.on_behalf_of_name,
            old_values: oldValues,
            new_values: newValues,
            changed_fields: data.changed_fields,
            ip_address: data.ip_address,
            user_agent: data.user_agent,
            device_type: data.device_type,
            api_endpoint: data.api_endpoint,
            http_method: data.http_method,
            response_status: data.response_status,
            response_time_ms: data.response_time_ms,
            module: 'Expense',
            sub_module: data.sub_module,
            remarks: data.remarks,
            is_sensitive: data.is_sensitive || false,
            is_bulk_operation: data.is_bulk_operation || false
        });
    }

    /**
     * Check if action should be audited based on settings
     */
    shouldAudit(data, settings) {
        if (!settings.enable_action_audit) return false;

        const auditEntities = JSON.parse(settings.audit_entities || '[]');
        const auditActions = JSON.parse(settings.audit_actions || '[]');

        if (auditEntities.length > 0 && !auditEntities.includes(data.entity_type)) {
            return false;
        }

        if (auditActions.length > 0 && !auditActions.includes(data.action_type)) {
            return false;
        }

        return true;
    }

    /**
     * Mask sensitive data
     */
    maskSensitiveData(data, sensitiveFields) {
        if (!data) return data;

        const masked = { ...data };
        for (const field of sensitiveFields) {
            if (masked[field]) {
                const value = String(masked[field]);
                masked[field] = value.length > 4
                    ? '****' + value.slice(-4)
                    : '****';
            }
        }
        return masked;
    }

    /**
     * Get audit logs with filters
     */
    async getAuditLogs(companyId, filters = {}, pagination = {}) {
        const where = { company_id: companyId };

        if (filters.entity_type) where.entity_type = filters.entity_type;
        if (filters.entity_id) where.entity_id = filters.entity_id;
        if (filters.action_type) where.action_type = filters.action_type;
        if (filters.performed_by) where.performed_by = filters.performed_by;

        if (filters.date_from && filters.date_to) {
            where.created_at = {
                [Op.between]: [filters.date_from, filters.date_to]
            };
        }

        if (filters.search) {
            where[Op.or] = [
                { action_description: { [Op.like]: `%${filters.search}%` } },
                { entity_number: { [Op.like]: `%${filters.search}%` } },
                { performed_by_name: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        return ExpenseAuditLog.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: pagination.limit || 50,
            offset: pagination.offset || 0
        });
    }

    /**
     * Get entity timeline
     */
    async getEntityTimeline(companyId, entityType, entityId) {
        return ExpenseAuditLog.findAll({
            where: {
                company_id: companyId,
                entity_type: entityType,
                entity_id: entityId
            },
            order: [['created_at', 'ASC']]
        });
    }

    /**
     * Get audit settings
     */
    async getSettings(companyId) {
        let settings = await ExpenseAuditSettings.findOne({
            where: { company_id: companyId }
        });

        if (!settings) {
            // Return defaults
            settings = {
                enable_action_audit: true,
                enable_data_change_audit: true,
                enable_api_audit: false,
                mask_sensitive_fields: true,
                sensitive_fields: '["account_number", "ifsc_code"]',
                audit_entities: '["Expense_Report", "Expense_Item", "Advance_Request", "Payment"]',
                audit_actions: '["Create", "Update", "Delete", "Submit", "Approve", "Reject"]'
            };
        }

        return settings;
    }

    /**
     * Get audit summary statistics
     */
    async getAuditSummary(companyId, dateFrom, dateTo) {
        const where = {
            company_id: companyId,
            created_at: { [Op.between]: [dateFrom, dateTo] }
        };

        const [actionStats, entityStats, userStats] = await Promise.all([
            // Actions breakdown
            ExpenseAuditLog.findAll({
                where,
                attributes: [
                    'action_type',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['action_type']
            }),

            // Entity breakdown
            ExpenseAuditLog.findAll({
                where,
                attributes: [
                    'entity_type',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['entity_type']
            }),

            // Top users
            ExpenseAuditLog.findAll({
                where,
                attributes: [
                    'performed_by',
                    'performed_by_name',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['performed_by', 'performed_by_name'],
                order: [[sequelize.literal('count'), 'DESC']],
                limit: 10
            })
        ]);

        return {
            by_action: actionStats,
            by_entity: entityStats,
            top_users: userStats
        };
    }
}

module.exports = new AuditService();
```

### duplicateDetection.service.js
```javascript
const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const ExpenseReportItem = require('../models/ExpenseReportItem');
const ExpenseDuplicateGroup = require('../models/ExpenseDuplicateGroup');
const ExpenseViolation = require('../models/ExpenseViolation');
const sequenceService = require('./sequence.service');

class DuplicateDetectionService {

    /**
     * Check for duplicates when expense item is created
     */
    async checkForDuplicates(companyId, expenseItem, employeeId) {
        const duplicates = [];

        // 1. Exact match check (same amount, date, merchant)
        const exactMatches = await this.findExactMatches(companyId, expenseItem, employeeId);
        if (exactMatches.length > 0) {
            duplicates.push({
                type: 'Exact_Match',
                matches: exactMatches,
                score: 100
            });
        }

        // 2. Near match check (similar amount, same date range)
        const nearMatches = await this.findNearMatches(companyId, expenseItem, employeeId);
        if (nearMatches.length > 0) {
            duplicates.push({
                type: 'Near_Match',
                matches: nearMatches,
                score: nearMatches[0].score
            });
        }

        // 3. Same receipt check (if receipt attached)
        if (expenseItem.receipt_hash) {
            const receiptMatches = await this.findReceiptMatches(companyId, expenseItem.receipt_hash);
            if (receiptMatches.length > 0) {
                duplicates.push({
                    type: 'Same_Receipt',
                    matches: receiptMatches,
                    score: 100
                });
            }
        }

        return duplicates;
    }

    /**
     * Find exact duplicate matches
     */
    async findExactMatches(companyId, item, employeeId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return ExpenseReportItem.findAll({
            where: {
                company_id: companyId,
                id: { [Op.ne]: item.id || 0 },
                amount: item.amount,
                expense_date: item.expense_date,
                merchant_name: item.merchant_name,
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            include: [{
                model: require('../models/ExpenseReport'),
                as: 'report',
                where: { employee_id: employeeId }
            }]
        });
    }

    /**
     * Find near duplicate matches
     */
    async findNearMatches(companyId, item, employeeId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const amountTolerance = parseFloat(item.amount) * 0.05; // 5% tolerance

        const candidates = await ExpenseReportItem.findAll({
            where: {
                company_id: companyId,
                id: { [Op.ne]: item.id || 0 },
                category_id: item.category_id,
                amount: {
                    [Op.between]: [
                        parseFloat(item.amount) - amountTolerance,
                        parseFloat(item.amount) + amountTolerance
                    ]
                },
                expense_date: {
                    [Op.between]: [
                        new Date(new Date(item.expense_date).setDate(new Date(item.expense_date).getDate() - 3)),
                        new Date(new Date(item.expense_date).setDate(new Date(item.expense_date).getDate() + 3))
                    ]
                },
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            include: [{
                model: require('../models/ExpenseReport'),
                as: 'report',
                where: { employee_id: employeeId }
            }]
        });

        // Calculate similarity score
        return candidates.map(candidate => {
            const score = this.calculateSimilarityScore(item, candidate);
            return { ...candidate.toJSON(), score };
        }).filter(c => c.score >= 70);
    }

    /**
     * Calculate similarity score between two items
     */
    calculateSimilarityScore(item1, item2) {
        let score = 0;
        let factors = 0;

        // Amount similarity (40% weight)
        const amountDiff = Math.abs(parseFloat(item1.amount) - parseFloat(item2.amount));
        const amountScore = Math.max(0, 100 - (amountDiff / parseFloat(item1.amount) * 100));
        score += amountScore * 0.4;
        factors += 0.4;

        // Date similarity (30% weight)
        const dateDiff = Math.abs(new Date(item1.expense_date) - new Date(item2.expense_date));
        const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
        const dateScore = Math.max(0, 100 - (daysDiff * 20));
        score += dateScore * 0.3;
        factors += 0.3;

        // Merchant similarity (20% weight)
        if (item1.merchant_name && item2.merchant_name) {
            const merchantScore = this.stringSimilarity(
                item1.merchant_name.toLowerCase(),
                item2.merchant_name.toLowerCase()
            ) * 100;
            score += merchantScore * 0.2;
            factors += 0.2;
        }

        // Category match (10% weight)
        if (item1.category_id === item2.category_id) {
            score += 100 * 0.1;
        }
        factors += 0.1;

        return Math.round(score / factors);
    }

    /**
     * Simple string similarity (Levenshtein-based)
     */
    stringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Levenshtein distance calculation
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Create duplicate group
     */
    async createDuplicateGroup(companyId, duplicateType, items, score) {
        const transaction = await sequelize.transaction();

        try {
            const groupNumber = await sequenceService.generateNumber(
                companyId,
                'duplicate_group',
                transaction
            );

            const itemIds = items.map(i => i.id);
            const reportIds = [...new Set(items.map(i => i.report_id))];
            const employeeIds = [...new Set(items.map(i => i.report?.employee_id))];
            const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.amount), 0);

            const group = await ExpenseDuplicateGroup.create({
                company_id: companyId,
                group_number: groupNumber,
                duplicate_type: duplicateType,
                match_score: score,
                matched_fields: JSON.stringify(['amount', 'expense_date', 'merchant_name']),
                expense_item_ids: JSON.stringify(itemIds),
                expense_report_ids: JSON.stringify(reportIds),
                employee_ids: JSON.stringify(employeeIds),
                total_duplicate_amount: totalAmount,
                potential_savings: totalAmount - (totalAmount / items.length),
                group_status: 'Pending_Review'
            }, { transaction });

            // Create violations for each item
            for (const item of items.slice(1)) { // Skip first item
                await ExpenseViolation.create({
                    company_id: companyId,
                    violation_number: await sequenceService.generateNumber(companyId, 'violation', transaction),
                    entity_type: 'Expense_Item',
                    expense_item_id: item.id,
                    expense_report_id: item.report_id,
                    employee_id: item.report?.employee_id,
                    violation_category: 'Fraud_Indicator',
                    violation_type: 'Duplicate_Expense',
                    severity: score >= 95 ? 'High' : 'Medium',
                    violation_description: `Potential duplicate of expense item. Match score: ${score}%`,
                    claimed_amount: item.amount,
                    detection_method: 'System_Auto',
                    confidence_score: score,
                    related_expenses: JSON.stringify(itemIds.filter(id => id !== item.id))
                }, { transaction });
            }

            await transaction.commit();
            return group;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Run batch duplicate detection
     */
    async runBatchDetection(companyId, dateFrom, dateTo) {
        // Get all expense items in date range
        const items = await ExpenseReportItem.findAll({
            where: {
                company_id: companyId,
                expense_date: { [Op.between]: [dateFrom, dateTo] }
            },
            include: [{
                model: require('../models/ExpenseReport'),
                as: 'report'
            }],
            order: [['expense_date', 'ASC'], ['amount', 'ASC']]
        });

        const duplicateGroups = [];
        const processedIds = new Set();

        for (const item of items) {
            if (processedIds.has(item.id)) continue;

            const duplicates = await this.checkForDuplicates(
                companyId,
                item,
                item.report.employee_id
            );

            for (const dup of duplicates) {
                if (dup.matches.length > 0) {
                    const allItems = [item, ...dup.matches];
                    const group = await this.createDuplicateGroup(
                        companyId,
                        dup.type,
                        allItems,
                        dup.score
                    );
                    duplicateGroups.push(group);

                    // Mark as processed
                    allItems.forEach(i => processedIds.add(i.id));
                }
            }
        }

        return duplicateGroups;
    }
}

module.exports = new DuplicateDetectionService();
```

---

## Audit Middleware

### auditLogger.middleware.js
```javascript
const auditService = require('../services/audit.service');

/**
 * Middleware to automatically log API calls
 */
const auditLogger = (entityType, actionType) => {
    return async (req, res, next) => {
        const startTime = Date.now();
        const originalSend = res.send;

        res.send = function(body) {
            res.send = originalSend;
            res.send(body);

            // Log after response is sent
            const responseTime = Date.now() - startTime;

            auditService.log(req.user?.company_id, {
                entity_type: entityType,
                entity_id: req.params.id || req.body?.id,
                action_type: actionType,
                action_description: `${actionType} ${entityType}`,
                performed_by: req.user?.id,
                performed_by_name: req.user?.name,
                performed_by_role: req.user?.role,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                device_type: detectDeviceType(req.get('User-Agent')),
                api_endpoint: req.originalUrl,
                http_method: req.method,
                response_status: res.statusCode,
                response_time_ms: responseTime,
                session_id: req.sessionID
            }).catch(err => console.error('Audit log error:', err));
        };

        next();
    };
};

function detectDeviceType(userAgent) {
    if (!userAgent) return 'Web';
    if (/mobile/i.test(userAgent)) return 'Mobile_App';
    if (/api|postman|insomnia/i.test(userAgent)) return 'API';
    return 'Web';
}

module.exports = auditLogger;
```

---

## Fraud Detection Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRAUD DETECTION PATTERNS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ROUND AMOUNT PATTERN                                        │
│  ───────────────────────                                        │
│  Multiple expenses with round amounts (₹1000, ₹500, ₹5000)      │
│  Detection: Count round amounts in last 90 days                 │
│  Threshold: >5 round amounts = Flag                             │
│                                                                  │
│  2. SPLIT TRANSACTION PATTERN                                   │
│  ───────────────────────────                                    │
│  Multiple small expenses to same merchant on same day           │
│  Detection: Sum expenses to same merchant/day < limit           │
│  Example: 3x ₹3000 instead of 1x ₹9000 (limit: ₹5000)          │
│                                                                  │
│  3. WEEKEND/HOLIDAY PATTERN                                     │
│  ──────────────────────────                                     │
│  Expenses on non-working days (excluding travel)                │
│  Detection: Check expense_date against calendar                 │
│  Flag: Non-travel expenses on weekends/holidays                 │
│                                                                  │
│  4. TIMING ANOMALY                                              │
│  ─────────────────                                              │
│  Expenses filed at unusual times (late night)                   │
│  Detection: created_at time analysis                            │
│  Flag: Expenses filed between 12 AM - 6 AM                      │
│                                                                  │
│  5. SPENDING SPIKE                                              │
│  ─────────────────                                              │
│  Sudden increase in expense frequency/amount                    │
│  Detection: Compare current month vs 3-month average            │
│  Flag: >200% increase                                           │
│                                                                  │
│  6. MERCHANT ANOMALY                                            │
│  ──────────────────                                             │
│  Same merchant used by employee multiple times daily            │
│  Detection: Count merchant visits per day                       │
│  Flag: >3 visits to same merchant in one day                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SQL Migration Script
```sql
-- File: scripts/sql/expense/008_create_audit_tables.sql

-- Table 1: Audit Logs
CREATE TABLE hrms_expense_audit_logs (
    -- ... (full schema as defined above)
);

-- Table 2: Violations
CREATE TABLE hrms_expense_violations (
    -- ... (full schema as defined above)
);

-- Table 3: Violation Rules
CREATE TABLE hrms_expense_violation_rules (
    -- ... (full schema as defined above)
);

-- Table 4: Duplicate Groups
CREATE TABLE hrms_expense_duplicate_groups (
    -- ... (full schema as defined above)
);

-- Table 5: Compliance Checklist
CREATE TABLE hrms_expense_compliance_checklist (
    -- ... (full schema as defined above)
);

-- Table 6: Compliance Status
CREATE TABLE hrms_expense_compliance_status (
    -- ... (full schema as defined above)
);

-- Table 7: Fraud Alerts
CREATE TABLE hrms_expense_fraud_alerts (
    -- ... (full schema as defined above)
);

-- Table 8: Audit Settings
CREATE TABLE hrms_expense_audit_settings (
    -- ... (full schema as defined above)
);

-- Insert default violation rules
INSERT INTO hrms_expense_violation_rules
(company_id, rule_code, rule_name, rule_category, violation_type, severity, rule_config, is_enabled, created_by)
VALUES
(1, 'DUP_EXACT', 'Exact Duplicate Detection', 'Fraud_Detection', 'Duplicate_Expense', 'High',
 '{"check_type":"duplicate","match_fields":["amount","merchant_name","expense_date"],"time_window_days":30}', 1, 1),
(1, 'ROUND_AMT', 'Round Amount Pattern', 'Fraud_Detection', 'Round_Amount_Pattern', 'Medium',
 '{"check_type":"pattern","round_multiples":[100,500,1000,5000],"min_occurrences":5,"time_window_days":90}', 1, 1),
(1, 'WEEKEND_EXP', 'Weekend Expense', 'Fraud_Detection', 'Weekend_Holiday_Expense', 'Low',
 '{"check_type":"date_pattern","check_days":["Saturday","Sunday"],"excluded_categories":["Travel","Hotel"]}', 1, 1),
(1, 'OVER_LIMIT', 'Over Spending Limit', 'Policy', 'Over_Limit', 'Medium',
 '{"check_type":"amount_limit","compare_against":"policy_limit"}', 1, 1),
(1, 'MISS_RCPT', 'Missing Receipt', 'Compliance', 'Missing_Receipt', 'Medium',
 '{"check_type":"document_required","min_amount":500,"receipt_required":true}', 1, 1);
```

---

## Key Features Summary

1. **Comprehensive Audit Trail** - Three levels: Action, Data Change, System
2. **Policy Violation Detection** - Auto-detect limit breaches, invalid categories
3. **Compliance Tracking** - Checklist-based compliance verification
4. **Duplicate Detection** - Exact, near-match, and receipt-based detection
5. **Fraud Detection** - Pattern-based fraud indicators
6. **Configurable Rules** - JSON-based rule configuration
7. **Risk Scoring** - Automated risk assessment for fraud alerts
8. **Investigation Workflow** - Track investigation and resolution
9. **Audit Reports** - Activity, violations, compliance, fraud reports
10. **Data Retention** - Configurable retention and archival

---

## Total: 8 Tables, 52 API Endpoints
