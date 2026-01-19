# Phase 5.1: Reports & Analytics - Implementation Document

## Overview
This document covers the implementation of Standard Reports and Analytics module for the Expense Management system. This module provides comprehensive reporting capabilities including expense summaries, payment tracking, tax reports, compliance reports, budget utilization, and customizable dashboards for all stakeholders.

---

## Key Concepts

### Report Categories
```
┌─────────────────────────────────────────────────────────────────┐
│                     REPORT CATEGORIES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. OPERATIONAL REPORTS                                         │
│  ├── Expense Summary Report                                     │
│  ├── Pending Approvals Report                                   │
│  ├── Payment Status Report                                      │
│  ├── Advance Outstanding Report                                 │
│  └── Reimbursement Report                                       │
│                                                                  │
│  2. FINANCIAL REPORTS                                           │
│  ├── Budget Utilization Report                                  │
│  ├── Cost Center Report                                         │
│  ├── Department-wise Expense Report                             │
│  ├── Project-wise Expense Report                                │
│  └── Vendor/Merchant Analysis                                   │
│                                                                  │
│  3. COMPLIANCE REPORTS                                          │
│  ├── Policy Violation Report                                    │
│  ├── Audit Trail Report                                         │
│  ├── Compliance Status Report                                   │
│  └── Fraud Detection Report                                     │
│                                                                  │
│  4. TAX REPORTS                                                 │
│  ├── GST Input Credit Report                                    │
│  ├── TDS Deduction Report                                       │
│  ├── Tax Summary Report                                         │
│  └── Vendor TDS Report                                          │
│                                                                  │
│  5. CATEGORY-SPECIFIC REPORTS                                   │
│  ├── Mileage Report                                             │
│  ├── Per Diem Report                                            │
│  ├── Travel Expense Report                                      │
│  └── Category-wise Analysis                                     │
│                                                                  │
│  6. EXECUTIVE REPORTS                                           │
│  ├── Executive Dashboard                                        │
│  ├── Trend Analysis                                             │
│  ├── Comparative Analysis                                       │
│  └── KPI Dashboard                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Report Access Levels
```
┌─────────────────────────────────────────────────────────────────┐
│                    REPORT ACCESS MATRIX                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EMPLOYEE                                                       │
│  ├── My Expense Summary                                         │
│  ├── My Reimbursement History                                   │
│  ├── My Advance Status                                          │
│  └── My Tax Summary                                             │
│                                                                  │
│  MANAGER                                                        │
│  ├── Team Expense Summary                                       │
│  ├── Pending Approvals                                          │
│  ├── Team Budget Utilization                                    │
│  └── Team Compliance Status                                     │
│                                                                  │
│  FINANCE                                                        │
│  ├── All Operational Reports                                    │
│  ├── All Financial Reports                                      │
│  ├── Payment Reports                                            │
│  └── Tax Reports                                                │
│                                                                  │
│  ADMIN/HR                                                       │
│  ├── All Reports                                                │
│  ├── Compliance Reports                                         │
│  ├── Audit Reports                                              │
│  └── Executive Dashboards                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table 1: hrms_expense_report_definitions (Report Templates)
```sql
CREATE TABLE hrms_expense_report_definitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Report Identification
    report_code VARCHAR(50) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_description TEXT,

    -- Report Category
    report_category ENUM(
        'Operational', 'Financial', 'Compliance', 'Tax',
        'Category_Specific', 'Executive', 'Custom'
    ) NOT NULL,

    -- Report Type
    report_type ENUM('Standard', 'Custom', 'System') DEFAULT 'Standard',

    -- Access Control
    access_level ENUM('Employee', 'Manager', 'Finance', 'Admin', 'All') DEFAULT 'Admin',
    allowed_roles JSON COMMENT 'Specific role IDs that can access',

    -- Data Source
    base_entity ENUM(
        'Expense_Report', 'Expense_Item', 'Advance_Request',
        'Payment', 'Violation', 'Audit_Log', 'Multiple'
    ) NOT NULL,
    data_query TEXT COMMENT 'Base SQL query or query builder config',

    -- Columns Configuration
    available_columns JSON NOT NULL,
    /*
    [
        {
            "field": "report_number",
            "label": "Report No.",
            "type": "string",
            "sortable": true,
            "filterable": true,
            "default_visible": true
        },
        {
            "field": "employee_name",
            "label": "Employee",
            "type": "string",
            "source": "employee.full_name"
        },
        {
            "field": "total_amount",
            "label": "Amount",
            "type": "currency",
            "aggregate": "sum"
        }
    ]
    */

    default_columns JSON COMMENT 'Default visible columns',

    -- Filters Configuration
    available_filters JSON NOT NULL,
    /*
    [
        {
            "field": "date_range",
            "label": "Date Range",
            "type": "date_range",
            "required": true
        },
        {
            "field": "department_id",
            "label": "Department",
            "type": "select",
            "source": "departments"
        },
        {
            "field": "status",
            "label": "Status",
            "type": "multi_select",
            "options": ["Draft", "Submitted", "Approved", "Rejected"]
        }
    ]
    */

    default_filters JSON COMMENT 'Default filter values',

    -- Grouping & Sorting
    available_groupings JSON COMMENT 'Fields that can be grouped by',
    default_group_by VARCHAR(50),
    default_sort_by VARCHAR(50),
    default_sort_order ENUM('ASC', 'DESC') DEFAULT 'DESC',

    -- Aggregations
    available_aggregations JSON,
    /*
    [
        {"field": "amount", "functions": ["sum", "avg", "min", "max", "count"]},
        {"field": "items", "functions": ["count"]}
    ]
    */

    -- Chart Configuration
    supports_chart TINYINT(1) DEFAULT 0,
    chart_config JSON,
    /*
    {
        "types": ["bar", "pie", "line"],
        "default_type": "bar",
        "x_axis": "department_name",
        "y_axis": "total_amount",
        "series": ["approved_amount", "pending_amount"]
    }
    */

    -- Export Options
    export_formats JSON DEFAULT '["Excel", "PDF", "CSV"]',
    pdf_template VARCHAR(100),

    -- Scheduling
    supports_scheduling TINYINT(1) DEFAULT 1,

    -- Display Options
    show_summary TINYINT(1) DEFAULT 1,
    show_totals TINYINT(1) DEFAULT 1,
    pagination_enabled TINYINT(1) DEFAULT 1,
    default_page_size INT DEFAULT 50,

    -- Metadata
    is_system TINYINT(1) DEFAULT 0 COMMENT 'System reports cannot be deleted',
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    icon VARCHAR(50),
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_report_code (company_id, report_code),
    INDEX idx_category (report_category),
    INDEX idx_access_level (access_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 2: hrms_expense_saved_reports (User Saved Reports)
```sql
CREATE TABLE hrms_expense_saved_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Report Reference
    report_definition_id INT NOT NULL,

    -- Owner
    created_by INT NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Saved Configuration
    selected_columns JSON,
    applied_filters JSON,
    group_by VARCHAR(50),
    sort_by VARCHAR(50),
    sort_order ENUM('ASC', 'DESC'),
    chart_type VARCHAR(20),

    -- Sharing
    is_shared TINYINT(1) DEFAULT 0,
    shared_with_roles JSON,
    shared_with_users JSON,
    is_public TINYINT(1) DEFAULT 0,

    -- Favorites
    is_favorite TINYINT(1) DEFAULT 0,

    -- Usage Stats
    last_run_at DATETIME,
    run_count INT DEFAULT 0,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_definition_id) REFERENCES hrms_expense_report_definitions(id),
    INDEX idx_user (created_by),
    INDEX idx_shared (is_shared, is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 3: hrms_expense_report_schedules (Scheduled Reports)
```sql
CREATE TABLE hrms_expense_report_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Report Reference
    report_definition_id INT,
    saved_report_id INT,

    -- Schedule Name
    schedule_name VARCHAR(255) NOT NULL,

    -- Report Configuration
    report_config JSON NOT NULL COMMENT 'Filters, columns, etc.',

    -- Schedule Configuration
    frequency ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom') NOT NULL,

    -- For Weekly
    day_of_week INT COMMENT '0=Sunday, 6=Saturday',

    -- For Monthly
    day_of_month INT COMMENT '1-31, 0=Last day',

    -- For Custom (cron expression)
    cron_expression VARCHAR(100),

    -- Time
    run_time TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',

    -- Date Range Type
    date_range_type ENUM(
        'Previous_Day', 'Previous_Week', 'Previous_Month',
        'Previous_Quarter', 'Previous_Year', 'MTD', 'YTD', 'Custom'
    ) DEFAULT 'Previous_Month',
    custom_days_back INT,

    -- Delivery
    delivery_method ENUM('Email', 'Download', 'Both') DEFAULT 'Email',
    email_recipients JSON NOT NULL COMMENT 'Array of email addresses',
    email_subject VARCHAR(255),
    email_body TEXT,

    -- Export Format
    export_format ENUM('Excel', 'PDF', 'CSV') DEFAULT 'Excel',
    include_charts TINYINT(1) DEFAULT 0,

    -- Status
    is_active TINYINT(1) DEFAULT 1,
    last_run_at DATETIME,
    last_run_status ENUM('Success', 'Failed', 'Partial'),
    last_run_error TEXT,
    next_run_at DATETIME,

    -- Stats
    total_runs INT DEFAULT 0,
    successful_runs INT DEFAULT 0,
    failed_runs INT DEFAULT 0,

    -- Metadata
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (report_definition_id) REFERENCES hrms_expense_report_definitions(id),
    INDEX idx_next_run (is_active, next_run_at),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 4: hrms_expense_report_executions (Report Run History)
```sql
CREATE TABLE hrms_expense_report_executions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Report Reference
    report_definition_id INT,
    saved_report_id INT,
    schedule_id INT,

    -- Execution Details
    execution_type ENUM('Manual', 'Scheduled', 'API') NOT NULL,
    executed_by INT,

    -- Configuration Used
    filters_applied JSON,
    columns_selected JSON,
    group_by VARCHAR(50),

    -- Results
    total_records INT,
    execution_time_ms INT,

    -- Export
    export_format VARCHAR(20),
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    file_expiry_at DATETIME,

    -- Status
    status ENUM('Running', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Running',
    error_message TEXT,

    -- Delivery
    email_sent TINYINT(1) DEFAULT 0,
    email_sent_to JSON,
    email_sent_at DATETIME,

    -- Timestamps
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    INDEX idx_report (report_definition_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 5: hrms_expense_dashboards (Dashboard Configurations)
```sql
CREATE TABLE hrms_expense_dashboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Dashboard Identification
    dashboard_code VARCHAR(50) NOT NULL,
    dashboard_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Type
    dashboard_type ENUM('System', 'Custom') DEFAULT 'Custom',
    target_role ENUM('Employee', 'Manager', 'Finance', 'Admin', 'Executive') NOT NULL,

    -- Layout Configuration
    layout_config JSON NOT NULL,
    /*
    {
        "columns": 12,
        "row_height": 100,
        "widgets": [
            {
                "id": "w1",
                "type": "kpi_card",
                "title": "Total Expenses",
                "x": 0, "y": 0, "w": 3, "h": 1,
                "config": {...}
            },
            {
                "id": "w2",
                "type": "chart",
                "title": "Monthly Trend",
                "x": 3, "y": 0, "w": 6, "h": 2,
                "config": {...}
            }
        ]
    }
    */

    -- Refresh Settings
    auto_refresh TINYINT(1) DEFAULT 0,
    refresh_interval_seconds INT DEFAULT 300,

    -- Access
    is_default TINYINT(1) DEFAULT 0,
    is_public TINYINT(1) DEFAULT 0,

    -- Metadata
    is_active TINYINT(1) DEFAULT 1,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    UNIQUE KEY uk_dashboard_code (company_id, dashboard_code),
    INDEX idx_role (target_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 6: hrms_expense_dashboard_widgets (Widget Library)
```sql
CREATE TABLE hrms_expense_dashboard_widgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT,

    -- Widget Identification
    widget_code VARCHAR(50) NOT NULL,
    widget_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Widget Type
    widget_type ENUM(
        'KPI_Card', 'Chart', 'Table', 'List',
        'Gauge', 'Map', 'Calendar', 'Custom'
    ) NOT NULL,

    -- Data Source
    data_source ENUM('Query', 'API', 'Aggregation') DEFAULT 'Query',
    data_query TEXT,
    api_endpoint VARCHAR(255),

    -- Configuration Schema
    config_schema JSON NOT NULL COMMENT 'JSON Schema for widget configuration',

    -- Default Configuration
    default_config JSON,

    -- Display
    min_width INT DEFAULT 2,
    min_height INT DEFAULT 1,
    max_width INT DEFAULT 12,
    max_height INT DEFAULT 4,

    -- Metadata
    is_system TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    UNIQUE KEY uk_widget_code (widget_code),
    INDEX idx_type (widget_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Table 7: hrms_expense_report_subscriptions (Report Subscriptions)
```sql
CREATE TABLE hrms_expense_report_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- User
    user_id INT NOT NULL,

    -- Report Reference
    report_definition_id INT,
    saved_report_id INT,
    schedule_id INT,

    -- Subscription Type
    subscription_type ENUM('Email', 'In_App', 'Both') DEFAULT 'Email',

    -- Notification Preferences
    notify_on_completion TINYINT(1) DEFAULT 1,
    notify_on_failure TINYINT(1) DEFAULT 1,

    -- Status
    is_active TINYINT(1) DEFAULT 1,

    -- Metadata
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME,

    -- Indexes
    FOREIGN KEY (company_id) REFERENCES hrms_companies(id),
    FOREIGN KEY (user_id) REFERENCES hrms_users(id),
    INDEX idx_user (user_id),
    INDEX idx_schedule (schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Directory Structure
```
src/microservices/expense/
├── models/
│   ├── ExpenseReportDefinition.js
│   ├── ExpenseSavedReport.js
│   ├── ExpenseReportSchedule.js
│   ├── ExpenseReportExecution.js
│   ├── ExpenseDashboard.js
│   ├── ExpenseDashboardWidget.js
│   └── ExpenseReportSubscription.js
├── services/
│   ├── reports/
│   │   ├── reportEngine.service.js
│   │   ├── reportGenerator.service.js
│   │   ├── reportScheduler.service.js
│   │   ├── reportExporter.service.js
│   │   └── reportMailer.service.js
│   ├── dashboards/
│   │   ├── dashboard.service.js
│   │   └── widget.service.js
│   └── analytics/
│       ├── expenseAnalytics.service.js
│       ├── trendAnalysis.service.js
│       └── kpiCalculator.service.js
├── controllers/
│   ├── employee/
│   │   └── reports.controller.js
│   ├── manager/
│   │   └── reports.controller.js
│   └── admin/
│       ├── reports.controller.js
│       ├── reportDefinition.controller.js
│       └── dashboard.controller.js
├── templates/
│   └── pdf/
│       ├── expense-summary.hbs
│       ├── payment-report.hbs
│       └── tax-report.hbs
├── jobs/
│   ├── scheduledReportJob.js
│   └── reportCleanupJob.js
└── routes/
    ├── employee.reports.routes.js
    ├── manager.reports.routes.js
    └── admin.reports.routes.js
```

---

## API Endpoints

### Standard Reports APIs (15 APIs)
```
GET    /api/expense/reports/expense-summary              - Expense Summary Report
GET    /api/expense/reports/pending-approvals            - Pending Approvals Report
GET    /api/expense/reports/payment-status               - Payment Status Report
GET    /api/expense/reports/advance-outstanding          - Advance Outstanding Report
GET    /api/expense/reports/reimbursement                - Reimbursement Report
GET    /api/expense/reports/budget-utilization           - Budget Utilization Report
GET    /api/expense/reports/department-expenses          - Department-wise Expenses
GET    /api/expense/reports/cost-center                  - Cost Center Report
GET    /api/expense/reports/category-analysis            - Category-wise Analysis
GET    /api/expense/reports/mileage                      - Mileage Report
GET    /api/expense/reports/per-diem                     - Per Diem Report
GET    /api/expense/reports/travel-expenses              - Travel Expense Report
GET    /api/expense/reports/vendor-analysis              - Vendor/Merchant Analysis
GET    /api/expense/reports/policy-violations            - Policy Violations Report
GET    /api/expense/reports/compliance-status            - Compliance Status Report
```

### Tax Reports APIs (5 APIs)
```
GET    /api/expense/reports/tax/gst-input-credit         - GST Input Credit Report
GET    /api/expense/reports/tax/tds-deduction            - TDS Deduction Report
GET    /api/expense/reports/tax/summary                  - Tax Summary Report
GET    /api/expense/reports/tax/vendor-tds               - Vendor TDS Report
GET    /api/expense/reports/tax/quarterly                - Quarterly Tax Report
```

### Report Management APIs (10 APIs)
```
GET    /api/admin/expense/report-definitions             - List report definitions
GET    /api/admin/expense/report-definitions/:id         - Get report definition
POST   /api/admin/expense/report-definitions             - Create report definition
PUT    /api/admin/expense/report-definitions/:id         - Update report definition
DELETE /api/admin/expense/report-definitions/:id         - Delete report definition
POST   /api/expense/reports/execute                      - Execute report
POST   /api/expense/reports/export                       - Export report
GET    /api/expense/reports/executions                   - List report executions
GET    /api/expense/reports/executions/:id               - Get execution details
GET    /api/expense/reports/executions/:id/download      - Download report file
```

### Saved Reports APIs (6 APIs)
```
GET    /api/expense/saved-reports                        - List saved reports
GET    /api/expense/saved-reports/:id                    - Get saved report
POST   /api/expense/saved-reports                        - Save report
PUT    /api/expense/saved-reports/:id                    - Update saved report
DELETE /api/expense/saved-reports/:id                    - Delete saved report
POST   /api/expense/saved-reports/:id/run                - Run saved report
```

### Scheduled Reports APIs (8 APIs)
```
GET    /api/expense/report-schedules                     - List schedules
GET    /api/expense/report-schedules/:id                 - Get schedule details
POST   /api/expense/report-schedules                     - Create schedule
PUT    /api/expense/report-schedules/:id                 - Update schedule
DELETE /api/expense/report-schedules/:id                 - Delete schedule
POST   /api/expense/report-schedules/:id/run-now         - Run schedule immediately
POST   /api/expense/report-schedules/:id/toggle          - Enable/disable schedule
GET    /api/expense/report-schedules/:id/history         - Get schedule run history
```

### Dashboard APIs (10 APIs)
```
GET    /api/expense/dashboards                           - List dashboards
GET    /api/expense/dashboards/:id                       - Get dashboard
POST   /api/expense/dashboards                           - Create dashboard
PUT    /api/expense/dashboards/:id                       - Update dashboard
DELETE /api/expense/dashboards/:id                       - Delete dashboard
GET    /api/expense/dashboards/:id/data                  - Get dashboard data
GET    /api/expense/widgets                              - List available widgets
GET    /api/expense/widgets/:id/data                     - Get widget data
POST   /api/expense/dashboards/:id/widgets               - Add widget to dashboard
DELETE /api/expense/dashboards/:dashboardId/widgets/:widgetId - Remove widget
```

### Analytics APIs (8 APIs)
```
GET    /api/expense/analytics/summary                    - Get analytics summary
GET    /api/expense/analytics/trends                     - Get expense trends
GET    /api/expense/analytics/comparison                 - Period comparison
GET    /api/expense/analytics/top-spenders               - Top spenders analysis
GET    /api/expense/analytics/category-breakdown         - Category breakdown
GET    /api/expense/analytics/approval-metrics           - Approval metrics
GET    /api/expense/analytics/payment-metrics            - Payment metrics
GET    /api/expense/analytics/kpis                       - KPI dashboard data
```

### Subscription APIs (4 APIs)
```
GET    /api/expense/report-subscriptions                 - List subscriptions
POST   /api/expense/report-subscriptions                 - Subscribe to report
PUT    /api/expense/report-subscriptions/:id             - Update subscription
DELETE /api/expense/report-subscriptions/:id             - Unsubscribe
```

---

## Standard Report Definitions

### 1. Expense Summary Report
```javascript
{
    report_code: 'EXP_SUMMARY',
    report_name: 'Expense Summary Report',
    report_category: 'Operational',
    base_entity: 'Expense_Report',
    available_columns: [
        { field: 'report_number', label: 'Report No.', type: 'string' },
        { field: 'employee_name', label: 'Employee', type: 'string' },
        { field: 'employee_code', label: 'Emp Code', type: 'string' },
        { field: 'department_name', label: 'Department', type: 'string' },
        { field: 'report_date', label: 'Report Date', type: 'date' },
        { field: 'total_amount', label: 'Total Amount', type: 'currency' },
        { field: 'approved_amount', label: 'Approved Amount', type: 'currency' },
        { field: 'rejected_amount', label: 'Rejected Amount', type: 'currency' },
        { field: 'status', label: 'Status', type: 'string' },
        { field: 'payment_status', label: 'Payment Status', type: 'string' },
        { field: 'submitted_at', label: 'Submitted Date', type: 'datetime' },
        { field: 'approved_at', label: 'Approved Date', type: 'datetime' }
    ],
    available_filters: [
        { field: 'date_range', label: 'Date Range', type: 'date_range', required: true },
        { field: 'department_id', label: 'Department', type: 'multi_select' },
        { field: 'employee_id', label: 'Employee', type: 'select' },
        { field: 'status', label: 'Status', type: 'multi_select' },
        { field: 'payment_status', label: 'Payment Status', type: 'multi_select' }
    ],
    available_groupings: ['department_name', 'status', 'payment_status', 'employee_name'],
    supports_chart: true,
    chart_config: {
        types: ['bar', 'pie'],
        x_axis: 'department_name',
        y_axis: 'total_amount'
    }
}
```

### 2. Mileage Report
```javascript
{
    report_code: 'MILEAGE_RPT',
    report_name: 'Mileage Report',
    report_category: 'Category_Specific',
    base_entity: 'Expense_Item',
    available_columns: [
        { field: 'report_number', label: 'Report No.', type: 'string' },
        { field: 'employee_name', label: 'Employee', type: 'string' },
        { field: 'expense_date', label: 'Date', type: 'date' },
        { field: 'from_location', label: 'From', type: 'string' },
        { field: 'to_location', label: 'To', type: 'string' },
        { field: 'distance', label: 'Distance', type: 'number' },
        { field: 'distance_unit', label: 'Unit', type: 'string' },
        { field: 'mileage_rate', label: 'Rate', type: 'currency' },
        { field: 'vehicle_type', label: 'Vehicle', type: 'string' },
        { field: 'amount', label: 'Amount', type: 'currency' },
        { field: 'item_status', label: 'Status', type: 'string' }
    ],
    available_filters: [
        { field: 'date_range', label: 'Date Range', type: 'date_range', required: true },
        { field: 'employee_id', label: 'Employee', type: 'select' },
        { field: 'vehicle_type', label: 'Vehicle Type', type: 'multi_select' },
        { field: 'item_status', label: 'Status', type: 'multi_select' }
    ],
    default_filters: {
        expense_type: 'Mileage'
    }
}
```

### 3. GST Input Credit Report
```javascript
{
    report_code: 'GST_INPUT',
    report_name: 'GST Input Credit Report',
    report_category: 'Tax',
    base_entity: 'Expense_Item',
    available_columns: [
        { field: 'report_number', label: 'Report No.', type: 'string' },
        { field: 'expense_date', label: 'Invoice Date', type: 'date' },
        { field: 'merchant_name', label: 'Vendor Name', type: 'string' },
        { field: 'vendor_gstin', label: 'Vendor GSTIN', type: 'string' },
        { field: 'invoice_number', label: 'Invoice No.', type: 'string' },
        { field: 'taxable_amount', label: 'Taxable Amount', type: 'currency' },
        { field: 'cgst_amount', label: 'CGST', type: 'currency' },
        { field: 'sgst_amount', label: 'SGST', type: 'currency' },
        { field: 'igst_amount', label: 'IGST', type: 'currency' },
        { field: 'total_gst', label: 'Total GST', type: 'currency' },
        { field: 'total_amount', label: 'Total Amount', type: 'currency' },
        { field: 'category_name', label: 'Category', type: 'string' },
        { field: 'is_gst_eligible', label: 'ITC Eligible', type: 'boolean' }
    ],
    available_filters: [
        { field: 'date_range', label: 'Date Range', type: 'date_range', required: true },
        { field: 'gst_type', label: 'GST Type', type: 'multi_select', options: ['CGST', 'SGST', 'IGST'] },
        { field: 'is_gst_eligible', label: 'ITC Eligible', type: 'boolean' }
    ],
    show_totals: true
}
```

---

## Service Layer Implementation

### reportEngine.service.js
```javascript
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../../../config/database');
const ExpenseReportDefinition = require('../models/ExpenseReportDefinition');
const ExpenseReportExecution = require('../models/ExpenseReportExecution');
const ExpenseReport = require('../models/ExpenseReport');
const ExpenseReportItem = require('../models/ExpenseReportItem');

class ReportEngineService {

    /**
     * Execute a report
     */
    async executeReport(companyId, reportCode, filters, options = {}) {
        const startTime = Date.now();

        // Get report definition
        const definition = await ExpenseReportDefinition.findOne({
            where: { company_id: companyId, report_code: reportCode, is_active: true }
        });

        if (!definition) {
            throw new Error('Report definition not found');
        }

        // Create execution record
        const execution = await ExpenseReportExecution.create({
            company_id: companyId,
            report_definition_id: definition.id,
            execution_type: options.execution_type || 'Manual',
            executed_by: options.executed_by,
            filters_applied: filters,
            columns_selected: options.columns || JSON.parse(definition.default_columns),
            group_by: options.group_by || definition.default_group_by,
            status: 'Running'
        });

        try {
            // Build and execute query
            const data = await this.buildAndExecuteQuery(definition, filters, options);

            // Calculate totals if needed
            let totals = null;
            if (definition.show_totals) {
                totals = this.calculateTotals(data, definition);
            }

            // Update execution record
            const executionTime = Date.now() - startTime;
            await execution.update({
                status: 'Completed',
                total_records: data.length,
                execution_time_ms: executionTime,
                completed_at: new Date()
            });

            return {
                execution_id: execution.id,
                report_name: definition.report_name,
                data,
                totals,
                meta: {
                    total_records: data.length,
                    execution_time_ms: executionTime,
                    filters_applied: filters,
                    generated_at: new Date()
                }
            };

        } catch (error) {
            await execution.update({
                status: 'Failed',
                error_message: error.message,
                completed_at: new Date()
            });
            throw error;
        }
    }

    /**
     * Build and execute query based on definition
     */
    async buildAndExecuteQuery(definition, filters, options) {
        const baseEntity = definition.base_entity;
        let Model, includes, where;

        switch (baseEntity) {
            case 'Expense_Report':
                return this.queryExpenseReports(definition, filters, options);
            case 'Expense_Item':
                return this.queryExpenseItems(definition, filters, options);
            case 'Advance_Request':
                return this.queryAdvanceRequests(definition, filters, options);
            case 'Payment':
                return this.queryPayments(definition, filters, options);
            default:
                throw new Error(`Unsupported base entity: ${baseEntity}`);
        }
    }

    /**
     * Query expense reports
     */
    async queryExpenseReports(definition, filters, options) {
        const where = { company_id: filters.company_id };

        // Apply date range filter
        if (filters.date_from && filters.date_to) {
            where.report_date = {
                [Op.between]: [filters.date_from, filters.date_to]
            };
        }

        // Apply other filters
        if (filters.department_id) {
            where['$employee.department_id$'] = Array.isArray(filters.department_id)
                ? { [Op.in]: filters.department_id }
                : filters.department_id;
        }

        if (filters.employee_id) {
            where.employee_id = filters.employee_id;
        }

        if (filters.status) {
            where.status = Array.isArray(filters.status)
                ? { [Op.in]: filters.status }
                : filters.status;
        }

        if (filters.payment_status) {
            where.payment_status = Array.isArray(filters.payment_status)
                ? { [Op.in]: filters.payment_status }
                : filters.payment_status;
        }

        const reports = await ExpenseReport.findAll({
            where,
            include: [
                {
                    model: require('../../../models/hrms/Employee'),
                    as: 'employee',
                    attributes: ['id', 'employee_code', 'first_name', 'last_name', 'department_id'],
                    include: [{
                        model: require('../../../models/hrms/Department'),
                        as: 'department',
                        attributes: ['id', 'department_name']
                    }]
                }
            ],
            order: [[options.sort_by || 'report_date', options.sort_order || 'DESC']],
            limit: options.limit,
            offset: options.offset
        });

        // Transform data
        return reports.map(report => ({
            id: report.id,
            report_number: report.report_number,
            employee_name: `${report.employee?.first_name} ${report.employee?.last_name}`,
            employee_code: report.employee?.employee_code,
            department_name: report.employee?.department?.department_name,
            report_date: report.report_date,
            total_amount: report.total_amount,
            approved_amount: report.approved_amount,
            rejected_amount: report.rejected_amount,
            status: report.status,
            payment_status: report.payment_status,
            submitted_at: report.submitted_at,
            approved_at: report.final_approved_at
        }));
    }

    /**
     * Query expense items
     */
    async queryExpenseItems(definition, filters, options) {
        const where = { company_id: filters.company_id };

        // Apply expense type filter from default filters
        const defaultFilters = JSON.parse(definition.default_filters || '{}');
        if (defaultFilters.expense_type) {
            where.expense_type = defaultFilters.expense_type;
        }

        // Apply date range
        if (filters.date_from && filters.date_to) {
            where.expense_date = {
                [Op.between]: [filters.date_from, filters.date_to]
            };
        }

        // Apply other filters
        if (filters.category_id) {
            where.category_id = Array.isArray(filters.category_id)
                ? { [Op.in]: filters.category_id }
                : filters.category_id;
        }

        if (filters.item_status) {
            where.item_status = Array.isArray(filters.item_status)
                ? { [Op.in]: filters.item_status }
                : filters.item_status;
        }

        const items = await ExpenseReportItem.findAll({
            where,
            include: [
                {
                    model: ExpenseReport,
                    as: 'report',
                    include: [{
                        model: require('../../../models/hrms/Employee'),
                        as: 'employee'
                    }]
                },
                {
                    model: require('../models/ExpenseCategory'),
                    as: 'category'
                }
            ],
            order: [[options.sort_by || 'expense_date', options.sort_order || 'DESC']],
            limit: options.limit,
            offset: options.offset
        });

        return items.map(item => ({
            id: item.id,
            report_number: item.report?.report_number,
            employee_name: `${item.report?.employee?.first_name} ${item.report?.employee?.last_name}`,
            expense_date: item.expense_date,
            category_name: item.category?.category_name,
            description: item.description,
            merchant_name: item.merchant_name,
            from_location: item.from_location,
            to_location: item.to_location,
            distance: item.distance,
            distance_unit: item.distance_unit,
            mileage_rate: item.mileage_rate,
            vehicle_type: item.vehicle_type,
            amount: item.amount,
            approved_amount: item.approved_amount,
            cgst_amount: item.cgst_amount,
            sgst_amount: item.sgst_amount,
            igst_amount: item.igst_amount,
            item_status: item.item_status
        }));
    }

    /**
     * Calculate totals for report
     */
    calculateTotals(data, definition) {
        const columns = JSON.parse(definition.available_columns);
        const totals = {};

        columns.forEach(col => {
            if (col.type === 'currency' || col.type === 'number') {
                totals[col.field] = data.reduce((sum, row) => {
                    return sum + (parseFloat(row[col.field]) || 0);
                }, 0);
            }
        });

        return totals;
    }

    /**
     * Get report with grouping
     */
    async getGroupedReport(companyId, reportCode, filters, groupBy) {
        const rawData = await this.executeReport(companyId, reportCode, filters);

        if (!groupBy) {
            return rawData;
        }

        // Group data
        const grouped = {};
        rawData.data.forEach(row => {
            const key = row[groupBy] || 'Unspecified';
            if (!grouped[key]) {
                grouped[key] = {
                    group_value: key,
                    items: [],
                    totals: {}
                };
            }
            grouped[key].items.push(row);
        });

        // Calculate group totals
        Object.values(grouped).forEach(group => {
            const definition = rawData.definition;
            group.totals = this.calculateTotals(group.items, definition);
            group.count = group.items.length;
        });

        return {
            ...rawData,
            grouped_data: Object.values(grouped),
            group_by: groupBy
        };
    }
}

module.exports = new ReportEngineService();
```

### reportExporter.service.js
```javascript
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class ReportExporterService {

    /**
     * Export report to Excel
     */
    async exportToExcel(reportData, columns, options = {}) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(options.sheetName || 'Report');

        // Set up columns
        worksheet.columns = columns.map(col => ({
            header: col.label,
            key: col.field,
            width: col.width || 15
        }));

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data rows
        reportData.data.forEach(row => {
            const rowData = {};
            columns.forEach(col => {
                let value = row[col.field];

                // Format based on type
                if (col.type === 'currency' && value !== null) {
                    value = parseFloat(value).toFixed(2);
                } else if (col.type === 'date' && value) {
                    value = new Date(value).toLocaleDateString('en-IN');
                } else if (col.type === 'datetime' && value) {
                    value = new Date(value).toLocaleString('en-IN');
                }

                rowData[col.field] = value;
            });
            worksheet.addRow(rowData);
        });

        // Add totals row if present
        if (reportData.totals) {
            worksheet.addRow({});
            const totalsRow = { [columns[0].field]: 'TOTAL' };
            columns.forEach(col => {
                if (reportData.totals[col.field] !== undefined) {
                    totalsRow[col.field] = parseFloat(reportData.totals[col.field]).toFixed(2);
                }
            });
            const totalRowNum = worksheet.addRow(totalsRow);
            worksheet.getRow(totalRowNum.number).font = { bold: true };
        }

        // Generate file
        const fileName = `${options.fileName || 'report'}_${Date.now()}.xlsx`;
        const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        await workbook.xlsx.writeFile(filePath);

        return {
            file_name: fileName,
            file_path: filePath,
            file_size: fs.statSync(filePath).size
        };
    }

    /**
     * Export report to CSV
     */
    async exportToCSV(reportData, columns, options = {}) {
        const rows = [];

        // Header row
        rows.push(columns.map(col => `"${col.label}"`).join(','));

        // Data rows
        reportData.data.forEach(row => {
            const values = columns.map(col => {
                let value = row[col.field];
                if (value === null || value === undefined) value = '';
                if (typeof value === 'string') value = `"${value.replace(/"/g, '""')}"`;
                return value;
            });
            rows.push(values.join(','));
        });

        const csvContent = rows.join('\n');
        const fileName = `${options.fileName || 'report'}_${Date.now()}.csv`;
        const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, csvContent, 'utf8');

        return {
            file_name: fileName,
            file_path: filePath,
            file_size: fs.statSync(filePath).size
        };
    }

    /**
     * Export report to PDF
     */
    async exportToPDF(reportData, columns, options = {}) {
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        const fileName = `${options.fileName || 'report'}_${Date.now()}.pdf`;
        const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text(options.title || 'Report', { align: 'center' });
        doc.moveDown();

        // Subtitle (date range, etc.)
        if (options.subtitle) {
            doc.fontSize(10).font('Helvetica').text(options.subtitle, { align: 'center' });
            doc.moveDown();
        }

        // Generate date
        doc.fontSize(8).text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'right' });
        doc.moveDown();

        // Table
        const tableTop = doc.y;
        const colWidth = (doc.page.width - 60) / columns.length;

        // Header
        doc.font('Helvetica-Bold').fontSize(8);
        columns.forEach((col, i) => {
            doc.text(col.label, 30 + (i * colWidth), tableTop, {
                width: colWidth,
                align: 'left'
            });
        });

        // Draw header line
        doc.moveTo(30, tableTop + 15).lineTo(doc.page.width - 30, tableTop + 15).stroke();

        // Data rows
        let rowTop = tableTop + 20;
        doc.font('Helvetica').fontSize(7);

        reportData.data.slice(0, 50).forEach((row, rowIndex) => { // Limit to 50 rows for PDF
            if (rowTop > doc.page.height - 50) {
                doc.addPage();
                rowTop = 30;
            }

            columns.forEach((col, i) => {
                let value = row[col.field];
                if (col.type === 'currency' && value !== null) {
                    value = '₹' + parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                } else if (col.type === 'date' && value) {
                    value = new Date(value).toLocaleDateString('en-IN');
                }
                doc.text(String(value || ''), 30 + (i * colWidth), rowTop, {
                    width: colWidth,
                    align: 'left'
                });
            });

            rowTop += 15;
        });

        // Totals
        if (reportData.totals) {
            rowTop += 10;
            doc.moveTo(30, rowTop).lineTo(doc.page.width - 30, rowTop).stroke();
            rowTop += 5;

            doc.font('Helvetica-Bold');
            doc.text('TOTAL', 30, rowTop);

            columns.forEach((col, i) => {
                if (reportData.totals[col.field] !== undefined) {
                    const value = '₹' + parseFloat(reportData.totals[col.field]).toLocaleString('en-IN', { minimumFractionDigits: 2 });
                    doc.text(value, 30 + (i * colWidth), rowTop, {
                        width: colWidth,
                        align: 'left'
                    });
                }
            });
        }

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                resolve({
                    file_name: fileName,
                    file_path: filePath,
                    file_size: fs.statSync(filePath).size
                });
            });
            stream.on('error', reject);
        });
    }
}

module.exports = new ReportExporterService();
```

---

## Dashboard Widgets

### KPI Cards
```javascript
const kpiWidgets = [
    {
        widget_code: 'TOTAL_EXPENSES_MTD',
        widget_name: 'Total Expenses MTD',
        widget_type: 'KPI_Card',
        config: {
            metric: 'sum',
            field: 'total_amount',
            entity: 'Expense_Report',
            filter: { status: ['Approved', 'Paid'] },
            date_range: 'MTD',
            format: 'currency',
            comparison: 'previous_month',
            icon: 'wallet',
            color: 'blue'
        }
    },
    {
        widget_code: 'PENDING_APPROVALS',
        widget_name: 'Pending Approvals',
        widget_type: 'KPI_Card',
        config: {
            metric: 'count',
            entity: 'Expense_Report',
            filter: { status: 'Submitted' },
            format: 'number',
            icon: 'clock',
            color: 'orange',
            link: '/approvals'
        }
    },
    {
        widget_code: 'PENDING_PAYMENTS',
        widget_name: 'Pending Payments',
        widget_type: 'KPI_Card',
        config: {
            metric: 'sum',
            field: 'net_payable',
            entity: 'Expense_Report',
            filter: { status: 'Approved', payment_status: 'Unpaid' },
            format: 'currency',
            icon: 'credit-card',
            color: 'red'
        }
    },
    {
        widget_code: 'OUTSTANDING_ADVANCES',
        widget_name: 'Outstanding Advances',
        widget_type: 'KPI_Card',
        config: {
            metric: 'sum',
            field: 'balance_amount',
            entity: 'Advance_Request',
            filter: { settlement_status: ['Pending_Settlement', 'Partial_Settlement'] },
            format: 'currency',
            icon: 'trending-up',
            color: 'purple'
        }
    }
];
```

### Chart Widgets
```javascript
const chartWidgets = [
    {
        widget_code: 'MONTHLY_EXPENSE_TREND',
        widget_name: 'Monthly Expense Trend',
        widget_type: 'Chart',
        config: {
            chart_type: 'line',
            data_source: 'monthly_expense_trend',
            x_axis: 'month',
            y_axis: 'total_amount',
            series: ['approved', 'pending', 'rejected'],
            time_range: 'last_12_months'
        }
    },
    {
        widget_code: 'CATEGORY_BREAKDOWN',
        widget_name: 'Expense by Category',
        widget_type: 'Chart',
        config: {
            chart_type: 'pie',
            data_source: 'category_breakdown',
            label_field: 'category_name',
            value_field: 'total_amount',
            date_range: 'MTD'
        }
    },
    {
        widget_code: 'DEPARTMENT_COMPARISON',
        widget_name: 'Department-wise Expenses',
        widget_type: 'Chart',
        config: {
            chart_type: 'bar',
            data_source: 'department_expenses',
            x_axis: 'department_name',
            y_axis: 'total_amount',
            date_range: 'MTD'
        }
    }
];
```

---

## SQL Migration Script
```sql
-- File: scripts/sql/expense/009_create_report_tables.sql

-- Table 1: Report Definitions
CREATE TABLE hrms_expense_report_definitions (
    -- ... (full schema as defined above)
);

-- Table 2: Saved Reports
CREATE TABLE hrms_expense_saved_reports (
    -- ... (full schema as defined above)
);

-- Table 3: Report Schedules
CREATE TABLE hrms_expense_report_schedules (
    -- ... (full schema as defined above)
);

-- Table 4: Report Executions
CREATE TABLE hrms_expense_report_executions (
    -- ... (full schema as defined above)
);

-- Table 5: Dashboards
CREATE TABLE hrms_expense_dashboards (
    -- ... (full schema as defined above)
);

-- Table 6: Dashboard Widgets
CREATE TABLE hrms_expense_dashboard_widgets (
    -- ... (full schema as defined above)
);

-- Table 7: Report Subscriptions
CREATE TABLE hrms_expense_report_subscriptions (
    -- ... (full schema as defined above)
);

-- Insert standard report definitions
INSERT INTO hrms_expense_report_definitions
(company_id, report_code, report_name, report_category, report_type, access_level, base_entity,
 available_columns, available_filters, supports_chart, is_system, is_active, created_by)
VALUES
-- Expense Summary
(1, 'EXP_SUMMARY', 'Expense Summary Report', 'Operational', 'Standard', 'Manager', 'Expense_Report',
 '[{"field":"report_number","label":"Report No.","type":"string"},{"field":"employee_name","label":"Employee","type":"string"},{"field":"total_amount","label":"Amount","type":"currency"}]',
 '[{"field":"date_range","label":"Date Range","type":"date_range","required":true}]',
 1, 1, 1, 1),

-- Mileage Report
(1, 'MILEAGE_RPT', 'Mileage Report', 'Category_Specific', 'Standard', 'Finance', 'Expense_Item',
 '[{"field":"employee_name","label":"Employee","type":"string"},{"field":"distance","label":"Distance","type":"number"},{"field":"amount","label":"Amount","type":"currency"}]',
 '[{"field":"date_range","label":"Date Range","type":"date_range","required":true}]',
 1, 1, 1, 1),

-- GST Report
(1, 'GST_INPUT', 'GST Input Credit Report', 'Tax', 'Standard', 'Finance', 'Expense_Item',
 '[{"field":"vendor_gstin","label":"Vendor GSTIN","type":"string"},{"field":"cgst_amount","label":"CGST","type":"currency"},{"field":"sgst_amount","label":"SGST","type":"currency"}]',
 '[{"field":"date_range","label":"Date Range","type":"date_range","required":true}]',
 0, 1, 1, 1);

-- Insert default widgets
INSERT INTO hrms_expense_dashboard_widgets
(widget_code, widget_name, widget_type, config_schema, default_config, is_system, is_active, created_by)
VALUES
('TOTAL_EXPENSES_MTD', 'Total Expenses MTD', 'KPI_Card', '{}', '{"format":"currency","color":"blue"}', 1, 1, 1),
('PENDING_APPROVALS', 'Pending Approvals', 'KPI_Card', '{}', '{"format":"number","color":"orange"}', 1, 1, 1),
('MONTHLY_TREND', 'Monthly Expense Trend', 'Chart', '{}', '{"chart_type":"line"}', 1, 1, 1),
('CATEGORY_PIE', 'Category Breakdown', 'Chart', '{}', '{"chart_type":"pie"}', 1, 1, 1);
```

---

## Key Features Summary

1. **Standard Reports** - 20+ pre-built operational, financial, tax, and compliance reports
2. **Custom Report Builder** - Create custom reports with drag-drop columns and filters
3. **Report Scheduling** - Schedule reports for daily, weekly, monthly delivery
4. **Multiple Export Formats** - Excel, PDF, CSV export options
5. **Email Delivery** - Automatic email delivery of scheduled reports
6. **Interactive Dashboards** - Configurable dashboards with KPI cards and charts
7. **Role-Based Access** - Different reports for Employee, Manager, Finance, Admin
8. **Report Subscriptions** - Subscribe to reports and get notified
9. **Execution History** - Track all report runs with performance metrics
10. **Grouping & Aggregation** - Group data and calculate totals automatically

---

## Total: 7 Tables, 66 API Endpoints
