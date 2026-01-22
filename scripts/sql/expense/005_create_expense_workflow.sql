-- ============================================================================
-- Phase 2.2: Expense Approval Workflow Tables
-- Description: Creates tables for expense approval workflow management
-- Author: System
-- Date: 2025-01-20
-- ============================================================================

-- ============================================================================
-- TABLE 1: hrms_expense_approval_workflows
-- Purpose: Master table for expense workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_workflows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Workflow Identification
    workflow_name VARCHAR(150) NOT NULL COMMENT 'Name of the workflow',
    workflow_code VARCHAR(50) NOT NULL COMMENT 'Unique code for the workflow',
    workflow_description TEXT COMMENT 'Description of the workflow',

    -- Workflow Scope
    workflow_scope ENUM('All_Expenses', 'Category_Specific', 'Amount_Based', 'Policy_Specific')
        DEFAULT 'All_Expenses' COMMENT 'Determines when this workflow applies',

    -- Approval Mode
    approval_mode ENUM('Sequential', 'Parallel', 'Any_One') DEFAULT 'Sequential'
        COMMENT 'Sequential=Stage by stage, Parallel=All stages at once, Any_One=First approval completes',

    -- Line Item Settings
    approval_level ENUM('Request_Level', 'Line_Item_Level') DEFAULT 'Line_Item_Level'
        COMMENT 'Request_Level=All items same decision, Line_Item_Level=Each item independent',
    allow_partial_approval TINYINT(1) DEFAULT 1 COMMENT 'Allow some items approved, some rejected',
    allow_partial_amount_approval TINYINT(1) DEFAULT 0 COMMENT 'Allow approving partial amount of a line item',

    -- Amount Modification
    allow_amount_modification TINYINT(1) DEFAULT 0 COMMENT 'Approver can reduce approved amount',
    max_amount_reduction_percentage DECIMAL(5,2) DEFAULT 100.00
        COMMENT 'Max % approver can reduce (100 = can reduce to 0)',

    -- Escalation Settings
    escalation_enabled TINYINT(1) DEFAULT 1 COMMENT 'Enable escalation feature',
    escalation_after_hours INT DEFAULT 48 COMMENT 'Escalate after X hours of inaction',
    escalation_reminder_hours INT DEFAULT 24 COMMENT 'Send reminder X hours before escalation',
    max_escalation_levels INT DEFAULT 3 COMMENT 'Max times to escalate',
    escalation_to ENUM('Skip_Level_Manager', 'Department_Head', 'HR', 'Finance_Head', 'Specific_User')
        DEFAULT 'Skip_Level_Manager' COMMENT 'Who to escalate to',
    escalation_user_id INT COMMENT 'When escalation_to = Specific_User',

    -- Auto-Approval Settings
    auto_approve_enabled TINYINT(1) DEFAULT 0 COMMENT 'Enable auto-approval',
    auto_approve_max_amount DECIMAL(12,2) COMMENT 'Auto-approve if total <= this amount',
    auto_approve_categories JSON COMMENT 'Category IDs eligible for auto-approval',
    auto_approve_for_grades JSON COMMENT 'Grade IDs eligible for auto-approval',

    -- Auto-Reject Settings
    auto_reject_enabled TINYINT(1) DEFAULT 0 COMMENT 'Enable auto-rejection',
    auto_reject_after_days INT COMMENT 'Auto-reject if no action after X days',

    -- Send Back Settings
    allow_send_back TINYINT(1) DEFAULT 1 COMMENT 'Allow sending back for correction',
    max_send_back_count INT DEFAULT 3 COMMENT 'Max times request can be sent back',

    -- Email Notification Settings
    email_notifications_enabled TINYINT(1) DEFAULT 1 COMMENT 'Enable email notifications',
    notify_requester_on_submit TINYINT(1) DEFAULT 1 COMMENT 'Email to employee on submit',
    notify_approver_on_submit TINYINT(1) DEFAULT 1 COMMENT 'Email to approver on new request',
    notify_requester_on_approve TINYINT(1) DEFAULT 1 COMMENT 'Email on approval',
    notify_requester_on_reject TINYINT(1) DEFAULT 1 COMMENT 'Email on rejection',
    notify_requester_on_send_back TINYINT(1) DEFAULT 1 COMMENT 'Email on send back',
    notify_requester_on_payment TINYINT(1) DEFAULT 1 COMMENT 'Email on payment',
    notify_finance_on_approval TINYINT(1) DEFAULT 0 COMMENT 'Notify finance team on final approval',

    -- Approver Notifications
    notify_approver_on_escalation TINYINT(1) DEFAULT 1 COMMENT 'Notify on escalation',
    notify_next_approver TINYINT(1) DEFAULT 1 COMMENT 'Notify next stage approver',

    -- Reminder Notifications
    enable_pending_reminders TINYINT(1) DEFAULT 1 COMMENT 'Enable pending reminders',
    pending_reminder_hours INT DEFAULT 24 COMMENT 'First reminder after X hours',
    pending_reminder_frequency_hours INT DEFAULT 24 COMMENT 'Subsequent reminders frequency',
    max_pending_reminders INT DEFAULT 3 COMMENT 'Max reminder count',

    -- Push Notifications
    push_notifications_enabled TINYINT(1) DEFAULT 1 COMMENT 'Enable push notifications',
    push_on_submit TINYINT(1) DEFAULT 1 COMMENT 'Push on submit',
    push_on_action TINYINT(1) DEFAULT 1 COMMENT 'Push on approve/reject/send_back',
    push_on_reminder TINYINT(1) DEFAULT 1 COMMENT 'Push on reminder',

    -- CC/BCC Settings
    cc_manager_on_approval TINYINT(1) DEFAULT 0 COMMENT 'CC manager on approval',
    cc_hr_on_rejection TINYINT(1) DEFAULT 0 COMMENT 'CC HR on rejection',
    additional_cc_emails JSON COMMENT 'Additional emails to CC',

    -- Email Template IDs
    email_template_submit INT COMMENT 'Template for submission notification',
    email_template_approval INT COMMENT 'Template for approval notification',
    email_template_rejection INT COMMENT 'Template for rejection notification',
    email_template_send_back INT COMMENT 'Template for send back notification',
    email_template_reminder INT COMMENT 'Template for reminder notification',
    email_template_escalation INT COMMENT 'Template for escalation notification',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    is_default TINYINT(1) DEFAULT 0 COMMENT 'Default workflow for company',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by INT COMMENT 'User ID who deleted this record',

    -- Indexes
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_workflow_code (workflow_code),
    INDEX idx_is_default (company_id, is_default),
    UNIQUE INDEX idx_company_workflow_code (company_id, workflow_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master table for expense approval workflows';

-- ============================================================================
-- TABLE 2: hrms_expense_approval_workflow_stages
-- Purpose: Stages within a workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_workflow_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

    -- Stage Identification
    stage_order INT NOT NULL COMMENT 'Execution order (1, 2, 3...)',
    stage_name VARCHAR(100) NOT NULL COMMENT 'Name of the stage',
    stage_description TEXT COMMENT 'Description of the stage',

    -- Amount Conditions
    min_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Stage triggers if amount >= this',
    max_amount DECIMAL(12,2) COMMENT 'Stage triggers if amount <= this (null = no max)',

    -- Category Conditions
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
    ) NOT NULL COMMENT 'Type of approver',

    -- Approver References
    approver_user_ids JSON COMMENT 'User IDs when type=Specific_User',
    approver_role_id INT COMMENT 'Role ID when type=Specific_Role',
    approver_permission_code VARCHAR(100) COMMENT 'Permission code when type=Users_With_Permission',
    custom_approver_field VARCHAR(100) COMMENT 'Field name for Custom_Field_Based',

    -- Multi-Approver Settings
    multi_approver_mode ENUM('Any_One', 'All_Must_Approve', 'Majority') DEFAULT 'Any_One'
        COMMENT 'When multiple approvers',
    min_approvals_required INT DEFAULT 1 COMMENT 'For Majority mode',

    -- Stage Behavior
    is_mandatory TINYINT(1) DEFAULT 1 COMMENT '0=Can be skipped if conditions not met',
    skip_if_same_approver TINYINT(1) DEFAULT 1 COMMENT 'Skip if approver same as previous stage',
    skip_if_self_approved TINYINT(1) DEFAULT 0 COMMENT 'Skip if requester is the approver',

    -- Actions Available
    can_approve TINYINT(1) DEFAULT 1 COMMENT 'Can approve at this stage',
    can_reject TINYINT(1) DEFAULT 1 COMMENT 'Can reject at this stage',
    can_send_back TINYINT(1) DEFAULT 1 COMMENT 'Can send back at this stage',
    can_hold TINYINT(1) DEFAULT 0 COMMENT 'Can put on hold',
    can_delegate TINYINT(1) DEFAULT 0 COMMENT 'Can delegate to another user',
    can_modify_amount TINYINT(1) DEFAULT 0 COMMENT 'Can modify amount',
    can_add_comments TINYINT(1) DEFAULT 1 COMMENT 'Can add comments',
    can_request_documents TINYINT(1) DEFAULT 1 COMMENT 'Can request documents',
    comments_mandatory_on_reject TINYINT(1) DEFAULT 1 COMMENT 'Comments required on reject',

    -- SLA Configuration
    sla_hours INT DEFAULT 48 COMMENT 'Expected completion time',
    sla_warning_hours INT DEFAULT 36 COMMENT 'Send warning at this hour',
    sla_breach_action ENUM('Notify', 'Escalate', 'Auto_Approve', 'None') DEFAULT 'Notify'
        COMMENT 'Action on SLA breach',

    -- Stage-level Escalation
    stage_escalation_enabled TINYINT(1) COMMENT 'null = use workflow setting',
    stage_escalation_hours INT COMMENT 'Override workflow escalation hours',
    stage_escalation_to ENUM('Skip_Level_Manager', 'Department_Head', 'Next_Stage_Approver', 'Specific_User')
        COMMENT 'Override workflow escalation target',
    stage_escalation_user_id INT COMMENT 'Specific user for escalation',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_stage_workflow FOREIGN KEY (workflow_id)
        REFERENCES hrms_expense_approval_workflows(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_workflow (workflow_id),
    INDEX idx_stage_order (workflow_id, stage_order),
    INDEX idx_amount_range (min_amount, max_amount),
    INDEX idx_approver_type (approver_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stages within expense approval workflows';

-- ============================================================================
-- TABLE 3: hrms_expense_workflow_category_mapping
-- Purpose: Maps specific categories to specific workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_workflow_category_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',
    category_id INT NOT NULL COMMENT 'FK to hrms_expense_categories',
    workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

    -- Amount-based workflow selection
    min_amount DECIMAL(12,2) DEFAULT 0 COMMENT 'Apply if amount >= this',
    max_amount DECIMAL(12,2) COMMENT 'Apply if amount <= this (null = no max)',

    -- Priority
    priority INT DEFAULT 0 COMMENT 'Higher priority wins',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps expense categories to specific workflows';

-- ============================================================================
-- TABLE 4: hrms_expense_approval_requests
-- Purpose: Tracks approval status for each expense request
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Reference to Expense Request
    expense_request_id INT NOT NULL COMMENT 'FK to hrms_expense_requests',
    expense_request_number VARCHAR(50) NOT NULL COMMENT 'Request number for reference',

    -- Workflow Used
    workflow_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_workflows',

    -- Request Details (denormalized)
    requester_id INT NOT NULL COMMENT 'Employee who submitted',
    requester_name VARCHAR(200) COMMENT 'Name for quick display',
    total_amount DECIMAL(15,2) NOT NULL COMMENT 'Total request amount',
    total_items INT NOT NULL COMMENT 'Total line items',

    -- Current Status
    current_stage_id INT COMMENT 'FK to workflow_stages - Current pending stage',
    current_stage_order INT COMMENT 'Current stage order number',
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
    ) DEFAULT 'Pending' COMMENT 'Overall approval status',

    -- Amount Summary
    approved_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Total approved amount',
    rejected_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Total rejected amount',
    pending_amount DECIMAL(15,2) COMMENT 'Total pending amount',
    modified_amount DECIMAL(15,2) COMMENT 'If approver modified amounts',

    -- Item Summary
    approved_items INT DEFAULT 0 COMMENT 'Count of approved items',
    rejected_items INT DEFAULT 0 COMMENT 'Count of rejected items',
    pending_items INT COMMENT 'Count of pending items',
    sent_back_items INT DEFAULT 0 COMMENT 'Count of sent back items',

    -- Timestamps
    submitted_at TIMESTAMP NOT NULL COMMENT 'When request was submitted',
    first_action_at TIMESTAMP COMMENT 'When first approval action taken',
    last_action_at TIMESTAMP COMMENT 'When last action was taken',
    completed_at TIMESTAMP COMMENT 'When fully processed',

    -- SLA Tracking
    sla_due_at TIMESTAMP COMMENT 'Current SLA deadline',
    is_sla_breached TINYINT(1) DEFAULT 0 COMMENT 'Whether SLA breached',
    sla_breach_at TIMESTAMP COMMENT 'When SLA was breached',

    -- Escalation Tracking
    escalation_count INT DEFAULT 0 COMMENT 'Times escalated',
    last_escalation_at TIMESTAMP COMMENT 'Last escalation time',
    escalated_to_user_id INT COMMENT 'User escalated to',

    -- Send Back Tracking
    send_back_count INT DEFAULT 0 COMMENT 'Times sent back',
    last_send_back_at TIMESTAMP COMMENT 'Last send back time',
    last_send_back_reason TEXT COMMENT 'Reason for last send back',

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks approval status for expense requests';

-- ============================================================================
-- TABLE 5: hrms_expense_approval_request_items
-- Purpose: Line item level approval tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_request_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    approval_request_id INT NOT NULL COMMENT 'FK to hrms_expense_approval_requests',

    -- Reference to Expense Item
    expense_item_id INT NOT NULL COMMENT 'FK to hrms_expense_request_items',
    category_id INT NOT NULL COMMENT 'Category ID',
    category_name VARCHAR(100) COMMENT 'Category name for display',

    -- Item Details (denormalized)
    original_amount DECIMAL(12,2) NOT NULL COMMENT 'Original requested amount',
    expense_date DATE NOT NULL COMMENT 'Date of expense',

    -- Item Stage Tracking (for Line_Item_Level approval)
    current_stage_id INT COMMENT 'Current stage for this item',
    current_stage_order INT COMMENT 'Current stage order',

    -- Item Status
    item_status ENUM(
        'Pending',
        'In_Progress',
        'Approved',
        'Partially_Approved',
        'Rejected',
        'Sent_Back',
        'On_Hold'
    ) DEFAULT 'Pending' COMMENT 'Item approval status',

    -- Approved Amount
    approved_amount DECIMAL(12,2) COMMENT 'Approved amount (can differ from original)',
    amount_modified TINYINT(1) DEFAULT 0 COMMENT 'Whether amount was modified',
    modification_reason TEXT COMMENT 'Reason for modification',

    -- Action Details
    action_taken_by INT COMMENT 'User who took final action',
    action_taken_at TIMESTAMP COMMENT 'When action was taken',
    rejection_reason TEXT COMMENT 'Reason for rejection',
    send_back_reason TEXT COMMENT 'Reason for send back',
    approver_comments TEXT COMMENT 'Comments from approver',

    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_item_approval_request FOREIGN KEY (approval_request_id)
        REFERENCES hrms_expense_approval_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_stage FOREIGN KEY (current_stage_id)
        REFERENCES hrms_expense_approval_workflow_stages(id),

    -- Indexes
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_expense_item (expense_item_id),
    INDEX idx_category (category_id),
    INDEX idx_status (item_status),
    UNIQUE INDEX idx_expense_item_unique (expense_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Line item level approval tracking';

-- ============================================================================
-- TABLE 6: hrms_expense_approval_history
-- Purpose: Complete audit trail of all approval actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- References
    approval_request_id INT NOT NULL COMMENT 'FK to approval requests',
    approval_item_id INT COMMENT 'FK to approval items (null if request-level)',
    expense_request_id INT NOT NULL COMMENT 'FK to expense requests',
    expense_item_id INT COMMENT 'FK to expense items (null if request-level)',

    -- Stage Information
    stage_id INT COMMENT 'Stage where action was taken',
    stage_order INT COMMENT 'Order of the stage',
    stage_name VARCHAR(100) COMMENT 'Name of the stage',

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
    ) NOT NULL COMMENT 'Type of action',

    -- Action By
    action_by_user_id INT NOT NULL COMMENT 'User who performed action',
    action_by_name VARCHAR(200) COMMENT 'Name of user',
    action_by_role VARCHAR(100) COMMENT 'Role of user',

    -- Action Target
    action_to_user_id INT COMMENT 'Target user (for delegation/escalation)',
    action_to_name VARCHAR(200) COMMENT 'Target user name',

    -- Amount Details
    amount_before DECIMAL(12,2) COMMENT 'Amount before action',
    amount_after DECIMAL(12,2) COMMENT 'Amount after action',
    amount_change DECIMAL(12,2) COMMENT 'Change in amount',

    -- Comments/Reasons
    comments TEXT COMMENT 'General comments',
    rejection_reason TEXT COMMENT 'Reason for rejection',
    send_back_reason TEXT COMMENT 'Reason for send back',
    modification_reason TEXT COMMENT 'Reason for modification',

    -- Metadata
    ip_address VARCHAR(45) COMMENT 'IP address of user',
    user_agent TEXT COMMENT 'Browser/client info',
    action_source ENUM('Web', 'Mobile', 'API', 'System', 'Email') DEFAULT 'Web'
        COMMENT 'Source of action',

    -- Timestamps
    action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When action was taken',

    -- Indexes
    INDEX idx_company (company_id),
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_approval_item (approval_item_id),
    INDEX idx_expense_request (expense_request_id),
    INDEX idx_action (action),
    INDEX idx_action_by (action_by_user_id),
    INDEX idx_action_at (action_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Complete audit trail of approval actions';

-- ============================================================================
-- TABLE 7: hrms_expense_approval_pending
-- Purpose: Current pending approvals (for approver dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_pending (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- References
    approval_request_id INT NOT NULL COMMENT 'FK to approval requests',
    approval_item_id INT COMMENT 'FK to approval items (null if request-level)',
    expense_request_id INT NOT NULL COMMENT 'FK to expense requests',
    expense_item_id INT COMMENT 'FK to expense items',

    -- Stage
    stage_id INT NOT NULL COMMENT 'FK to workflow stages',
    stage_order INT NOT NULL COMMENT 'Order of the stage',
    stage_name VARCHAR(100) COMMENT 'Name of the stage',

    -- Approver
    approver_user_id INT NOT NULL COMMENT 'User who needs to approve',
    approver_type VARCHAR(50) COMMENT 'Type of approver assignment',
    is_primary_approver TINYINT(1) DEFAULT 1 COMMENT 'Primary or alternate approver',

    -- Request Details (denormalized for dashboard)
    requester_id INT NOT NULL COMMENT 'Employee who submitted',
    requester_name VARCHAR(200) COMMENT 'Name of requester',
    requester_department VARCHAR(100) COMMENT 'Department of requester',
    request_number VARCHAR(50) COMMENT 'Request number',
    category_name VARCHAR(100) COMMENT 'Category name (for item-level)',
    amount DECIMAL(12,2) NOT NULL COMMENT 'Amount pending approval',
    expense_date DATE COMMENT 'Date of expense',
    submitted_at TIMESTAMP COMMENT 'When request was submitted',

    -- SLA
    sla_due_at TIMESTAMP COMMENT 'SLA deadline',
    is_overdue TINYINT(1) DEFAULT 0 COMMENT 'Whether overdue',
    hours_pending INT COMMENT 'Hours since assignment',

    -- Priority
    priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal' COMMENT 'Priority level',

    -- Status
    is_active TINYINT(1) DEFAULT 1 COMMENT '0 when action taken',

    -- Timestamps
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When assigned to approver',
    reminded_at TIMESTAMP COMMENT 'Last reminder time',
    escalated_at TIMESTAMP COMMENT 'When escalated',

    -- Indexes
    INDEX idx_company (company_id),
    INDEX idx_approver (approver_user_id),
    INDEX idx_approval_request (approval_request_id),
    INDEX idx_is_active (is_active),
    INDEX idx_sla_due (sla_due_at),
    INDEX idx_priority (priority),
    INDEX idx_approver_active (approver_user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Current pending approvals for approver dashboard';

-- ============================================================================
-- TABLE 8: hrms_expense_approval_delegates
-- Purpose: Delegation configuration (approver can delegate to others)
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_approval_delegates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Delegator
    delegator_user_id INT NOT NULL COMMENT 'User delegating their approval rights',

    -- Delegate
    delegate_user_id INT NOT NULL COMMENT 'User receiving delegation',

    -- Scope
    delegation_scope ENUM('All', 'Specific_Workflows', 'Amount_Based', 'Date_Range') DEFAULT 'All'
        COMMENT 'Scope of delegation',
    workflow_ids JSON COMMENT 'Workflow IDs for Specific_Workflows scope',
    max_amount DECIMAL(12,2) COMMENT 'For Amount_Based scope',

    -- Validity Period
    effective_from DATE NOT NULL COMMENT 'Delegation start date',
    effective_to DATE NOT NULL COMMENT 'Delegation end date',

    -- Reason
    delegation_reason TEXT COMMENT 'Reason for delegation',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_company (company_id),
    INDEX idx_delegator (delegator_user_id),
    INDEX idx_delegate (delegate_user_id),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Delegation configuration for expense approvals';

-- ============================================================================
-- TABLE 9: hrms_expense_notification_log
-- Purpose: Log of all notifications sent
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_notification_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- References
    workflow_id INT COMMENT 'FK to workflows',
    approval_request_id INT COMMENT 'FK to approval requests',
    expense_request_id INT COMMENT 'FK to expense requests',
    expense_item_id INT COMMENT 'FK to expense items',

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
    ) NOT NULL COMMENT 'Type of notification',

    -- Channel
    channel ENUM('Email', 'Push', 'SMS', 'In_App') NOT NULL COMMENT 'Notification channel',

    -- Recipient
    recipient_user_id INT COMMENT 'User receiving notification',
    recipient_email VARCHAR(255) COMMENT 'Email address',
    recipient_phone VARCHAR(20) COMMENT 'Phone number',

    -- Content
    subject VARCHAR(500) COMMENT 'Notification subject',
    body TEXT COMMENT 'Notification body',
    template_id INT COMMENT 'Email template used',

    -- Status
    status ENUM('Pending', 'Sent', 'Delivered', 'Failed', 'Bounced') DEFAULT 'Pending'
        COMMENT 'Delivery status',
    sent_at TIMESTAMP COMMENT 'When sent',
    delivered_at TIMESTAMP COMMENT 'When delivered',
    failed_at TIMESTAMP COMMENT 'When failed',
    failure_reason TEXT COMMENT 'Reason for failure',
    retry_count INT DEFAULT 0 COMMENT 'Number of retries',
    max_retries INT DEFAULT 3 COMMENT 'Max retries allowed',

    -- Metadata
    provider_response JSON COMMENT 'Response from provider',

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Log of all expense notifications sent';

-- ============================================================================
-- ROLLBACK SCRIPT (Use with caution)
-- ============================================================================

/*
DROP TABLE IF EXISTS hrms_expense_notification_log;
DROP TABLE IF EXISTS hrms_expense_approval_delegates;
DROP TABLE IF EXISTS hrms_expense_approval_pending;
DROP TABLE IF EXISTS hrms_expense_approval_history;
DROP TABLE IF EXISTS hrms_expense_approval_request_items;
DROP TABLE IF EXISTS hrms_expense_approval_requests;
DROP TABLE IF EXISTS hrms_expense_workflow_category_mapping;
DROP TABLE IF EXISTS hrms_expense_approval_workflow_stages;
DROP TABLE IF EXISTS hrms_expense_approval_workflows;
*/
