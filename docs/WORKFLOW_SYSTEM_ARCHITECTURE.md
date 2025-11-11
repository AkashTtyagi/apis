# Intelligent Workflow Management System - Complete Architecture

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Core Features](#core-features)
4. [Workflow Configuration](#workflow-configuration)
5. [Conditional Logic System](#conditional-logic-system)
6. [Applicability Rules](#applicability-rules)
7. [Workflow Execution Flow](#workflow-execution-flow)
8. [API Endpoints](#api-endpoints)
9. [Email Notification System](#email-notification-system)
10. [Auto-Action & Escalation](#auto-action-escalation)
11. [Audit Trail](#audit-trail)
12. [Examples & Use Cases](#examples-use-cases)

---

## 1. System Overview

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Workflow   │  │  Conditional │  │ Applicability│     │
│  │    Config    │  │    Logic     │  │    Rules     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Execution  │  │    Email     │  │  Auto-Action │     │
│  │    Engine    │  │ Notification │  │  Scheduler   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │          Audit Trail & Version Control            │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Backend**: Node.js + Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Email**: Nodemailer / SendGrid
- **Scheduler**: node-cron / Bull Queue
- **Logging**: Winston

---

## 2. Database Schema

### Core Tables

#### 2.1 hrms_workflow_master
Stores workflow types (Leave, On Duty, WFH, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| workflow_for_name | VARCHAR(100) | Leave, On Duty, etc. |
| workflow_code | VARCHAR(50) | LEAVE, ONDUTY, etc. |
| description | TEXT | Description |
| is_active | BOOLEAN | Active status |
| display_order | INT | Display order |

#### 2.2 hrms_workflow_config
Main workflow configuration

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| company_id | INT UNSIGNED | Company ID |
| workflow_master_id | INT UNSIGNED | FK to workflow_master |
| workflow_name | VARCHAR(255) | Workflow name |
| workflow_code | VARCHAR(100) | Unique code |
| version | INT | Version number |
| is_active | BOOLEAN | Active status |
| is_default | BOOLEAN | Default workflow |
| allow_self_approval | BOOLEAN | Self approval allowed |
| cloned_from_id | INT UNSIGNED | Cloned from workflow ID |

#### 2.3 hrms_workflow_stages
Workflow stages configuration

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| workflow_config_id | INT UNSIGNED | FK to workflow_config |
| stage_name | VARCHAR(255) | Stage name |
| stage_order | INT | Execution order |
| stage_type | ENUM | approval/notify_only/auto_action |
| approver_logic | ENUM | AND/OR |
| sla_days | INT | SLA in days |
| pending_action | ENUM | auto_approve/auto_reject/escalate |
| on_approve_next_stage_id | INT UNSIGNED | Next stage on approve |
| on_reject_action | ENUM | final_reject/move_to_stage/send_back |

#### 2.4 hrms_workflow_stage_approvers
Approvers for each stage

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| stage_id | INT UNSIGNED | FK to workflow_stages |
| approver_type | ENUM | RM, HR_ADMIN, HOD, CUSTOM_USER, etc. |
| custom_user_id | INT UNSIGNED | Specific user ID |
| approver_order | INT | Order for AND logic |
| has_condition | BOOLEAN | Conditional approver |
| condition_id | INT UNSIGNED | FK to workflow_conditions |

**Approver Types:**
- `RM` - Reporting Manager
- `RM_OF_RM` - Reporting Manager's Manager
- `HR_ADMIN` - HR Admin
- `HOD` - Head of Department
- `FUNCTIONAL_HEAD` - Functional Head
- `SUB_ADMIN` - Sub Admin
- `SECONDARY_RM` - Secondary Reporting Manager
- `SELF` - Self Approver (auto approve)
- `AUTO_APPROVE` - Auto Approve
- `CUSTOM_USER` - Specific user

#### 2.5 hrms_workflow_conditions
Conditional logic (IF/ELSE)

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| workflow_config_id | INT UNSIGNED | FK to workflow_config |
| stage_id | INT UNSIGNED | FK to workflow_stages (NULL = global) |
| condition_name | VARCHAR(255) | Condition name |
| condition_type | ENUM | stage_routing/auto_action/approver_selection |
| logic_operator | ENUM | AND/OR |
| action_type | ENUM | auto_approve/auto_reject/move_to_stage/notify |
| else_action_type | ENUM | continue/auto_approve/auto_reject |
| priority | INT | Execution priority |

#### 2.6 hrms_workflow_condition_rules
Individual condition rules

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| condition_id | INT UNSIGNED | FK to workflow_conditions |
| field_source | ENUM | employee/request/leave_balance/custom |
| field_name | VARCHAR(100) | Field to check |
| operator | ENUM | =, !=, >, <, IN, NOT IN, etc. |
| compare_value | TEXT | Value to compare |

#### 2.7 hrms_workflow_applicability
Workflow applicability rules

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| workflow_config_id | INT UNSIGNED | FK to workflow_config |
| applicability_type | ENUM | company/entity/department/designation/custom_employee |
| company_id | INT UNSIGNED | Specific company |
| department_id | INT UNSIGNED | Specific department |
| designation_id | INT UNSIGNED | Specific designation |
| employee_id | INT UNSIGNED | Specific employee |
| is_excluded | BOOLEAN | Include/Exclude logic |
| priority | INT | Priority if multiple match |

#### 2.8 hrms_workflow_requests
Actual workflow instances

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| request_number | VARCHAR(50) | Unique request number |
| workflow_config_id | INT UNSIGNED | FK to workflow_config |
| employee_id | INT UNSIGNED | Requester |
| current_stage_id | INT UNSIGNED | Current stage |
| request_status | ENUM | draft/submitted/pending/approved/rejected |
| request_data | JSON | Request data |
| sla_due_date | TIMESTAMP | SLA due date |

#### 2.9 hrms_workflow_actions
Audit trail

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| request_id | INT UNSIGNED | FK to workflow_requests |
| action_type | ENUM | submit/approve/reject/auto_approve/escalate |
| action_by_user_id | INT UNSIGNED | User who acted |
| action_by_type | ENUM | employee/approver/system/admin |
| approver_type | VARCHAR(50) | Type of approver |
| remarks | TEXT | Action remarks |
| email_sent | BOOLEAN | Email sent flag |

#### 2.10 hrms_workflow_email_templates
Email templates

| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED | Primary Key |
| company_id | INT UNSIGNED | Company ID |
| workflow_master_id | INT UNSIGNED | FK to workflow_master |
| template_code | VARCHAR(100) | Template code |
| event_type | ENUM | submission/approval/rejection/escalation |
| subject | VARCHAR(500) | Email subject |
| body_html | TEXT | HTML body |
| cc_recipients | JSON | CC recipients |
| available_placeholders | JSON | Available placeholders |

---

## 3. Core Features

### 3.1 Multi-Stage Approval
- Configure multiple approval stages
- Sequential or parallel approvals
- AND/OR logic between approvers
- Stage skip/bypass based on conditions

### 3.2 Conditional Logic (IF/ELSE)
- Field-based conditions (employee, request, balance data)
- Multiple operators: =, !=, >, <, IN, NOT IN, etc.
- AND/OR logic for multiple rules
- Action on condition match: auto-approve, auto-reject, route to stage
- ELSE action for condition failure

### 3.3 Auto Actions
- Auto-approve after X days pending
- Auto-reject based on conditions
- Auto-escalation to next level
- SLA-based actions

### 3.4 Email Notifications
- Customizable email templates
- Support for CC, BCC
- Dynamic placeholders ({{employee_name}}, {{approver_name}}, etc.)
- Event-based triggers (submission, approval, rejection, etc.)

### 3.5 Applicability Rules
- Company-wide
- Entity-specific
- Department-specific
- Designation-specific
- Custom employee-specific
- Include/Exclude logic

### 3.6 Audit & Versioning
- Complete action history
- Who approved/rejected with timestamp
- Workflow version control
- Clone and modify workflows

---

## 4. Workflow Configuration

### 4.1 Creating a Workflow

**Step 1: Create Workflow Config**
```json
POST /api/workflow/config/create
{
  "company_id": 1,
  "workflow_master_id": 1,
  "workflow_name": "Leave Approval - Sales Team",
  "workflow_code": "LEAVE_SALES",
  "description": "Special leave workflow for sales team",
  "allow_self_approval": false,
  "allow_withdrawal": true
}
```

**Step 2: Add Stages**
```json
POST /api/workflow/stage/create
{
  "workflow_config_id": 1,
  "stage_name": "RM Approval",
  "stage_order": 1,
  "stage_type": "approval",
  "approver_logic": "OR",
  "sla_days": 2,
  "pending_action": "escalate",
  "on_approve_next_stage_id": 2,
  "on_reject_action": "final_reject"
}
```

**Step 3: Add Approvers**
```json
POST /api/workflow/approver/create
{
  "stage_id": 1,
  "approver_type": "RM",
  "approver_order": 1
}
```

**Step 4: Add Conditions** (Optional)
```json
POST /api/workflow/condition/create
{
  "workflow_config_id": 1,
  "condition_name": "Auto reject if balance < 10",
  "condition_type": "auto_action",
  "action_type": "auto_reject",
  "rules": [
    {
      "field_source": "leave_balance",
      "field_name": "available_balance",
      "operator": "<",
      "compare_value": "10"
    }
  ]
}
```

**Step 5: Configure Applicability**
```json
POST /api/workflow/applicability/create
{
  "workflow_config_id": 1,
  "applicability_type": "department",
  "department_id": 5,
  "is_excluded": false
}
```

---

## 5. Conditional Logic System

### 5.1 Supported Conditions

**Example 1: Auto Reject if Balance Low**
```json
{
  "condition_name": "Auto reject if leave balance < 10",
  "condition_type": "auto_action",
  "action_type": "auto_reject",
  "rules": [
    {
      "field_source": "leave_balance",
      "field_name": "available_balance",
      "operator": "<",
      "compare_value": "10"
    }
  ]
}
```

**Example 2: Auto Approve for CEO**
```json
{
  "condition_name": "Auto approve if designation is CEO",
  "condition_type": "auto_action",
  "action_type": "auto_approve",
  "rules": [
    {
      "field_source": "employee",
      "field_name": "designation",
      "operator": "=",
      "compare_value": "CEO"
    }
  ]
}
```

**Example 3: Route to CFO if Amount > 5000**
```json
{
  "condition_name": "CFO approval if claim > 5000",
  "condition_type": "stage_routing",
  "action_type": "move_to_stage",
  "action_stage_id": 3,
  "else_action_type": "continue",
  "rules": [
    {
      "field_source": "request",
      "field_name": "claim_amount",
      "operator": ">",
      "compare_value": "5000"
    }
  ]
}
```

**Example 4: Multiple Conditions with AND Logic**
```json
{
  "condition_name": "Special approval for Delhi managers",
  "condition_type": "approver_selection",
  "logic_operator": "AND",
  "action_type": "assign_approver",
  "action_approver_type": "FUNCTIONAL_HEAD",
  "rules": [
    {
      "field_source": "employee",
      "field_name": "location",
      "operator": "=",
      "compare_value": "Delhi"
    },
    {
      "field_source": "employee",
      "field_name": "designation",
      "operator": "=",
      "compare_value": "Manager"
    }
  ]
}
```

### 5.2 Field Sources

| Source | Available Fields | Examples |
|--------|-----------------|----------|
| employee | designation, location, department, level, grade | employee.designation = 'CEO' |
| request | leave_type, from_date, to_date, claim_amount, duration | request.claim_amount > 5000 |
| leave_balance | available_balance, accrued_balance, used_balance | leave_balance.available_balance < 10 |
| custom | Any custom field from request_data JSON | custom.project_code = 'PRJ001' |

### 5.3 Operators

| Operator | Description | Example |
|----------|-------------|---------|
| = | Equal to | designation = 'CEO' |
| != | Not equal to | leave_type != 'Sick Leave' |
| > | Greater than | claim_amount > 5000 |
| < | Less than | available_balance < 10 |
| >= | Greater than or equal | duration >= 5 |
| <= | Less than or equal | sla_days <= 2 |
| IN | In array | leave_type IN ['WFH', 'Short Leave'] |
| NOT IN | Not in array | department NOT IN ['Sales', 'Marketing'] |
| CONTAINS | Contains substring | location CONTAINS 'Delhi' |
| IS NULL | Is null | secondary_rm IS NULL |

---

## 6. Applicability Rules

### 6.1 Company-Wide
```json
{
  "applicability_type": "company",
  "company_id": 1,
  "is_excluded": false
}
```

### 6.2 Department-Specific
```json
{
  "applicability_type": "department",
  "department_id": 5,
  "is_excluded": false
}
```

### 6.3 Designation-Specific
```json
{
  "applicability_type": "designation",
  "designation_id": 10,
  "is_excluded": false
}
```

### 6.4 Custom Employee
```json
{
  "applicability_type": "custom_employee",
  "employee_id": 123,
  "is_excluded": false
}
```

### 6.5 Exclusion Logic
```json
{
  "applicability_type": "department",
  "department_id": 3,
  "is_excluded": true  // Exclude Body Shop department
}
```

### 6.6 Priority Handling
If multiple workflows match, the one with the lowest priority number takes precedence:
```json
{
  "applicability_type": "designation",
  "designation_id": 10,
  "priority": 1  // Higher priority
}
```

---

## 7. Workflow Execution Flow

### 7.1 Request Submission

```
1. Employee submits request
   ↓
2. System identifies applicable workflow (based on applicability rules)
   ↓
3. Evaluate global conditions (auto-approve/reject checks)
   ↓
4. If not auto-actioned, move to Stage 1
   ↓
5. Resolve approvers for Stage 1
   ↓
6. Create stage assignments
   ↓
7. Send notification emails
   ↓
8. Update request status to 'pending'
```

### 7.2 Approval Process

```
1. Approver receives notification
   ↓
2. Approver takes action (Approve/Reject)
   ↓
3. System logs action in hrms_workflow_actions
   ↓
4. Check stage approver_logic:
   - OR logic: Any one approval moves to next stage
   - AND logic: All must approve to move to next stage
   ↓
5. Evaluate stage conditions
   ↓
6. If approved and has next stage → Move to next stage
   ↓
7. If approved and no next stage → Final approval
   ↓
8. If rejected → Execute on_reject_action (final reject/send back)
   ↓
9. Send notification emails to relevant parties
```

### 7.3 Auto-Action Flow

```
Scheduler runs every X minutes
   ↓
Find all pending requests with SLA exceeded
   ↓
For each request:
   - Check stage.pending_action
   - auto_approve → Auto approve and move to next stage
   - auto_reject → Auto reject and complete
   - escalate → Move to escalation stage
   - notify → Send reminder email
   ↓
Log action in hrms_workflow_actions
   ↓
Send notification emails
```

---

## 8. API Endpoints

### 8.1 Workflow Configuration APIs

**Create Workflow**
```
POST /api/workflow/config/create
Body: { company_id, workflow_master_id, workflow_name, ... }
```

**Update Workflow**
```
POST /api/workflow/config/update
Body: { workflow_config_id, workflow_name, ... }
```

**Clone Workflow**
```
POST /api/workflow/config/clone
Body: { workflow_config_id, new_workflow_name, new_workflow_code }
```

**List Workflows**
```
POST /api/workflow/config/list
Body: { company_id, workflow_master_id, is_active }
```

### 8.2 Stage Management APIs

**Create Stage**
```
POST /api/workflow/stage/create
Body: { workflow_config_id, stage_name, stage_order, ... }
```

**Update Stage**
```
POST /api/workflow/stage/update
Body: { stage_id, stage_name, sla_days, ... }
```

**Delete Stage**
```
POST /api/workflow/stage/delete
Body: { stage_id }
```

**Reorder Stages**
```
POST /api/workflow/stage/reorder
Body: { workflow_config_id, stages: [{id: 1, order: 2}, {id: 2, order: 1}] }
```

### 8.3 Approver Configuration APIs

**Add Approver to Stage**
```
POST /api/workflow/approver/create
Body: { stage_id, approver_type, custom_user_id, approver_order }
```

**Remove Approver**
```
POST /api/workflow/approver/delete
Body: { approver_id }
```

### 8.4 Condition Management APIs

**Create Condition**
```
POST /api/workflow/condition/create
Body: {
  workflow_config_id,
  condition_name,
  condition_type,
  action_type,
  rules: [...]
}
```

**Update Condition**
```
POST /api/workflow/condition/update
Body: { condition_id, condition_name, rules, ... }
```

### 8.5 Applicability APIs

**Configure Applicability**
```
POST /api/workflow/applicability/create
Body: { workflow_config_id, applicability_type, department_id, ... }
```

**Remove Applicability**
```
POST /api/workflow/applicability/delete
Body: { applicability_id }
```

### 8.6 Request Submission APIs

**Submit Request**
```
POST /api/workflow/request/submit
Body: {
  workflow_master_id,
  employee_id,
  request_data: { leave_type, from_date, to_date, ... }
}
```

**Withdraw Request**
```
POST /api/workflow/request/withdraw
Body: { request_id, remarks }
```

### 8.7 Approval APIs

**Approve Request**
```
POST /api/workflow/request/approve
Body: { request_id, approver_user_id, remarks }
```

**Reject Request**
```
POST /api/workflow/request/reject
Body: { request_id, approver_user_id, remarks }
```

**Delegate Approval**
```
POST /api/workflow/request/delegate
Body: { request_id, delegate_to_user_id, remarks }
```

### 8.8 Query APIs

**Get Request Details**
```
POST /api/workflow/request/details
Body: { request_id }
```

**Get Pending Requests for Approver**
```
POST /api/workflow/request/pending
Body: { approver_user_id, workflow_master_id }
```

**Get Request History**
```
POST /api/workflow/request/history
Body: { request_id }
```

**Get My Requests**
```
POST /api/workflow/request/my-requests
Body: { employee_id, status, from_date, to_date }
```

---

## 9. Email Notification System

### 9.1 Email Template Configuration

**Create Email Template**
```json
POST /api/workflow/email-template/create
{
  "company_id": 1,
  "workflow_master_id": 1,
  "template_code": "LEAVE_SUBMISSION",
  "event_type": "submission",
  "subject": "Leave Request Submitted - {{request_number}}",
  "body_html": "<p>Dear {{approver_name}},</p><p>{{employee_name}} has submitted a leave request...</p>",
  "cc_recipients": ["{{hr_email}}", "{{rm_email}}"],
  "available_placeholders": [
    "{{employee_name}}", "{{employee_code}}", "{{employee_email}}",
    "{{approver_name}}", "{{approver_email}}",
    "{{workflow_type}}", "{{request_number}}", "{{request_date}}",
    "{{leave_from_date}}", "{{leave_to_date}}", "{{leave_days}}"
  ]
}
```

### 9.2 Supported Email Events

| Event Type | Trigger | Recipients |
|-----------|---------|-----------|
| submission | Request submitted | Approver, CC: HR, RM |
| approval | Request approved | Employee, Next Approver |
| rejection | Request rejected | Employee, CC: HR, RM |
| auto_approval | Auto approved | Employee, CC: HR |
| auto_rejection | Auto rejected | Employee, CC: HR |
| escalation | Escalated to next level | New Approver, CC: Previous Approver |
| sla_breach | SLA breached | Approver, CC: HR, Admin |
| withdrawal | Request withdrawn | All previous approvers |
| pending_reminder | Reminder for pending approval | Approver |
| final_approval | Final approval | Employee, CC: All approvers |

### 9.3 Placeholder System

**Available Placeholders:**
```
Employee: {{employee_name}}, {{employee_code}}, {{employee_email}}, {{employee_designation}}
Approver: {{approver_name}}, {{approver_email}}, {{approver_designation}}
Request: {{request_number}}, {{request_date}}, {{workflow_type}}, {{workflow_name}}
Leave: {{leave_type}}, {{leave_from_date}}, {{leave_to_date}}, {{leave_days}}
Claim: {{claim_amount}}, {{claim_type}}, {{claim_date}}
Stage: {{stage_name}}, {{current_stage}}, {{next_stage}}
Action: {{action_type}}, {{action_date}}, {{remarks}}
Company: {{company_name}}, {{company_address}}
System: {{current_date}}, {{current_time}}, {{system_url}}
```

### 9.4 CC/BCC Configuration

**Dynamic CC Recipients:**
```json
{
  "cc_recipients": [
    "{{rm_email}}",          // Reporting Manager's email
    "{{hr_email}}",          // HR Admin's email
    "{{hod_email}}",         // HOD's email
    "hr@company.com",        // Static email
    "{{functional_head_email}}"
  ],
  "bcc_recipients": [
    "audit@company.com"      // Audit team
  ]
}
```

---

## 10. Auto-Action & Escalation

### 10.1 SLA Configuration

**Stage-level SLA:**
```json
{
  "stage_id": 1,
  "sla_days": 2,
  "sla_hours": 48,
  "pending_action": "escalate",
  "escalate_to_stage_id": 3
}
```

### 10.2 Auto Actions

**Auto Approve:**
```json
{
  "pending_action": "auto_approve",
  "sla_days": 3
}
```
After 3 days of pending, automatically approve and move to next stage.

**Auto Reject:**
```json
{
  "pending_action": "auto_reject",
  "sla_days": 5
}
```
After 5 days of pending, automatically reject.

**Escalate:**
```json
{
  "pending_action": "escalate",
  "sla_days": 2,
  "escalate_to_stage_id": 3
}
```
After 2 days, escalate to stage 3.

**Notify (Reminder):**
```json
{
  "pending_action": "notify",
  "sla_days": 1
}
```
After 1 day, send reminder email (doesn't change status).

### 10.3 Scheduler Configuration

**Cron Job (runs every hour):**
```javascript
// In scheduler service
cron.schedule('0 * * * *', async () => {
  await processAutoActions();
});

async function processAutoActions() {
  // Find all pending requests with SLA exceeded
  const expiredRequests = await findExpiredRequests();

  for (const request of expiredRequests) {
    const stage = request.current_stage;

    switch (stage.pending_action) {
      case 'auto_approve':
        await autoApproveRequest(request);
        break;
      case 'auto_reject':
        await autoRejectRequest(request);
        break;
      case 'escalate':
        await escalateRequest(request, stage.escalate_to_stage_id);
        break;
      case 'notify':
        await sendReminderEmail(request);
        break;
    }
  }
}
```

---

## 11. Audit Trail

### 11.1 Action Logging

Every workflow action is logged in `hrms_workflow_actions`:

```json
{
  "request_id": 1,
  "action_type": "approve",
  "action_by_user_id": 101,
  "action_by_type": "approver",
  "approver_type": "RM",
  "remarks": "Approved for urgent requirement",
  "previous_stage_id": 1,
  "next_stage_id": 2,
  "action_taken_at": "2024-01-15 10:30:00",
  "ip_address": "192.168.1.100"
}
```

### 11.2 Request Timeline

**Get Complete Timeline:**
```
POST /api/workflow/request/timeline
Body: { request_id: 1 }

Response:
[
  {
    "action": "submit",
    "by": "John Doe (Employee)",
    "at": "2024-01-15 09:00:00",
    "stage": null,
    "remarks": "Urgent personal work"
  },
  {
    "action": "approve",
    "by": "Jane Smith (RM)",
    "at": "2024-01-15 10:30:00",
    "stage": "RM Approval",
    "remarks": "Approved"
  },
  {
    "action": "approve",
    "by": "System (Auto)",
    "at": "2024-01-15 14:00:00",
    "stage": "HR Approval",
    "remarks": "Auto approved after 2 days pending"
  },
  {
    "action": "final_approval",
    "by": "System",
    "at": "2024-01-15 14:00:01",
    "stage": null,
    "remarks": "Request completed"
  }
]
```

### 11.3 Audit Reports

**Generate Audit Report:**
```
POST /api/workflow/reports/audit
Body: {
  "company_id": 1,
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "workflow_master_id": 1,
  "action_type": "approve"
}

Response:
{
  "total_actions": 150,
  "breakdown": {
    "approve": 120,
    "reject": 20,
    "auto_approve": 10
  },
  "by_approver_type": {
    "RM": 80,
    "HR_ADMIN": 40,
    "HOD": 20,
    "AUTO": 10
  },
  "average_approval_time": "1.5 days"
}
```

---

## 12. Examples & Use Cases

### Example 1: Simple Leave Workflow

**Workflow: Leave Approval for General Employees**

**Stages:**
1. RM Approval (Stage 1)
   - Approver: RM
   - SLA: 2 days
   - Pending Action: Escalate to HR
   - On Approve: Move to Stage 2
   - On Reject: Final Reject

2. HR Approval (Stage 2)
   - Approver: HR_ADMIN
   - SLA: 1 day
   - On Approve: Final Approve
   - On Reject: Final Reject

**Applicability:** All employees in company

**Conditions:** None

---

### Example 2: Advanced Leave Workflow with Conditions

**Workflow: Leave Approval - Sales Team with Special Rules**

**Conditions:**
1. **Auto Reject if Balance Low:**
   - IF leave_balance.available_balance < 5
   - THEN auto_reject

2. **Auto Approve for Short Duration:**
   - IF request.leave_days <= 2 AND employee.designation = 'Manager'
   - THEN auto_approve

3. **CFO Approval for Long Leave:**
   - IF request.leave_days > 10
   - THEN move_to_stage: CFO Approval (Stage 3)
   - ELSE continue

**Stages:**
1. RM Approval
   - Approver: RM
   - Conditions applied: Check balance, check duration

2. HOD Approval
   - Approver: HOD
   - Only if duration > 5 days

3. CFO Approval (Conditional)
   - Approver: CUSTOM_USER (CFO)
   - Only if duration > 10 days

**Applicability:**
- Department: Sales (ID: 5)
- Priority: 1

---

### Example 3: Expense Claim Workflow with Amount-Based Routing

**Workflow: Expense Claim Approval**

**Conditions:**
1. **Small Claims Auto Approve:**
   - IF request.claim_amount <= 1000
   - THEN auto_approve

2. **Medium Claims to RM:**
   - IF request.claim_amount > 1000 AND request.claim_amount <= 5000
   - THEN move_to_stage: RM Approval

3. **Large Claims to CFO:**
   - IF request.claim_amount > 5000
   - THEN move_to_stage: CFO Approval

**Stages:**
1. RM Approval (For 1000-5000)
   - Approver: RM

2. Finance Approval (For 1000-5000)
   - Approver: HR_ADMIN (Finance role)

3. CFO Approval (For > 5000)
   - Approver: CUSTOM_USER (CFO)

**Applicability:** All employees

---

### Example 4: Designation-Based Auto Approval

**Workflow: Leave for Executives**

**Conditions:**
1. **Auto Approve for CEO/CXOs:**
   - IF employee.designation IN ['CEO', 'CTO', 'CFO', 'COO']
   - THEN auto_approve

**Stages:**
1. Notify Only to HR
   - Stage Type: notify_only
   - Just sends notification to HR (no approval needed)

**Applicability:**
- Designation: CEO, CTO, CFO, COO
- Priority: 1 (Higher than general workflow)

---

### Example 5: Location-Based Routing

**Workflow: WFH Approval - Location Specific**

**Conditions:**
1. **Delhi Office - Auto Approve:**
   - IF employee.location = 'Delhi'
   - THEN auto_approve

2. **Other Locations - RM Approval:**
   - ELSE move_to_stage: RM Approval

**Stages:**
1. RM Approval (For non-Delhi employees)
   - Approver: RM
   - On Approve: Final Approve

**Applicability:** All employees

---

### Example 6: Department Exclusion

**Workflow: Overtime Approval (Except IT)**

**Stages:**
1. RM Approval
2. HR Approval

**Applicability:**
- Company: All
- Department: IT (ID: 3) - **EXCLUDED** (is_excluded = TRUE)

This workflow applies to ALL departments EXCEPT IT.

---

### Example 7: Custom Employee Workflow

**Workflow: Special Leave for Akash**

**Stages:**
1. Notify Only
   - Just notify HR (auto approved)

**Applicability:**
- Custom Employee: Akash (employee_id: 123)
- Priority: 1

---

### Example 8: AND Logic Multi-Approver

**Workflow: Capital Expenditure Approval**

**Stages:**
1. Finance Head + Admin Head (Both must approve)
   - Approver 1: CUSTOM_USER (Finance Head)
     - approver_order: 1
   - Approver 2: CUSTOM_USER (Admin Head)
     - approver_order: 2
   - approver_logic: AND
   - Both must approve to move forward

2. CEO Final Approval
   - Approver: CUSTOM_USER (CEO)

---

## 🚀 Quick Start Guide

### Step 1: Setup Database
```bash
# Run migrations
mysql -u root -p hrms_db < database/migrations/workflow/*.sql

# Run seeds
mysql -u root -p hrms_db < database/seeds/workflow_master_seed.sql
```

### Step 2: Configure First Workflow
```bash
# Create workflow config
POST /api/workflow/config/create

# Add stages
POST /api/workflow/stage/create

# Add approvers
POST /api/workflow/approver/create

# Configure applicability
POST /api/workflow/applicability/create
```

### Step 3: Submit Test Request
```bash
POST /api/workflow/request/submit
```

### Step 4: Process Approval
```bash
POST /api/workflow/request/approve
```

---

## 📊 System Metrics & Monitoring

### Key Metrics to Track:
- Average approval time per workflow type
- SLA breach percentage
- Auto-approval rate
- Rejection rate by stage
- Pending requests count
- Escalation frequency

### Dashboard Queries:
```sql
-- Pending requests count
SELECT COUNT(*) FROM hrms_workflow_requests
WHERE request_status = 'pending';

-- SLA breach count
SELECT COUNT(*) FROM hrms_workflow_requests
WHERE is_sla_breached = TRUE AND overall_status = 'in_progress';

-- Average approval time
SELECT AVG(TIMESTAMPDIFF(HOUR, submitted_at, completed_at)) as avg_hours
FROM hrms_workflow_requests
WHERE overall_status = 'completed';
```

---

## 🔐 Security & Permissions

### Role-Based Access:
- **Admin**: Full workflow configuration access
- **HR**: View all requests, configure basic workflows
- **Manager**: Approve/reject assigned requests
- **Employee**: Submit requests, view own requests

### API Security:
- JWT authentication required
- Company-scoped data access
- Audit logging for all actions

---

## 📝 Best Practices

1. **Start Simple**: Begin with basic workflows, add conditions later
2. **Test Thoroughly**: Test all condition paths before going live
3. **Version Control**: Always create new version when making major changes
4. **Monitor SLA**: Set realistic SLA times, monitor breaches
5. **Email Templates**: Keep templates clear and concise
6. **Applicability**: Use priority wisely to avoid conflicts
7. **Audit Trail**: Regularly review audit logs for anomalies

---

## 🛠️ Troubleshooting

**Issue: Workflow not triggering**
- Check applicability rules
- Verify workflow is active
- Check if conditions are preventing execution

**Issue: Email not sent**
- Verify email template is configured
- Check SMTP settings
- Review email logs

**Issue: Wrong approver assigned**
- Review approver type configuration
- Check conditional approver rules
- Verify employee hierarchy data

---

This architecture provides a complete, scalable, and flexible workflow management system for your HRMS!
