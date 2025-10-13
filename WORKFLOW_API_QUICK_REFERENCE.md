# Workflow System - API Quick Reference

## 🚀 Quick Start APIs

### 1. Workflow Configuration

#### Create Workflow
```http
POST /api/workflow/config/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "company_id": 1,
  "workflow_master_id": 1,
  "workflow_name": "Leave Approval - Sales Team",
  "workflow_code": "LEAVE_SALES",
  "description": "Leave workflow for sales department",
  "allow_self_approval": false,
  "allow_withdrawal": true,
  "send_submission_email": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow created successfully",
  "data": {
    "workflow": {
      "id": 1,
      "company_id": 1,
      "workflow_name": "Leave Approval - Sales Team",
      "workflow_code": "LEAVE_SALES",
      "version": 1,
      "is_active": true
    }
  }
}
```

---

### 2. Stage Management

#### Add Stage to Workflow
```http
POST /api/workflow/stage/create
Authorization: Bearer {token}

{
  "workflow_config_id": 1,
  "stage_name": "RM Approval",
  "stage_order": 1,
  "stage_type": "approval",
  "approver_logic": "OR",
  "is_mandatory": true,
  "sla_days": 2,
  "sla_hours": null,
  "pending_action": "escalate",
  "escalate_to_stage_id": 2,
  "on_approve_next_stage_id": 2,
  "on_reject_action": "final_reject",
  "send_email_on_assign": true,
  "send_email_on_approve": true,
  "send_email_on_reject": true
}
```

#### Add Multiple Stages (Batch)
```http
POST /api/workflow/stage/create-batch
Authorization: Bearer {token}

{
  "workflow_config_id": 1,
  "stages": [
    {
      "stage_name": "RM Approval",
      "stage_order": 1,
      "approver_logic": "OR",
      "sla_days": 2,
      "on_approve_next_stage_id": 2
    },
    {
      "stage_name": "HR Approval",
      "stage_order": 2,
      "approver_logic": "OR",
      "sla_days": 1,
      "on_approve_next_stage_id": null
    }
  ]
}
```

---

### 3. Approver Configuration

#### Add Approver to Stage
```http
POST /api/workflow/approver/create
Authorization: Bearer {token}

{
  "stage_id": 1,
  "approver_type": "RM",
  "approver_order": 1,
  "allow_delegation": true
}
```

**Approver Types:**
- `RM` - Reporting Manager
- `RM_OF_RM` - RM's Manager
- `HR_ADMIN` - HR Admin
- `HOD` - Head of Department
- `FUNCTIONAL_HEAD` - Functional Head
- `CUSTOM_USER` - Specific User
- `SELF` - Self (Auto Approve)
- `AUTO_APPROVE` - Auto Approve

#### Add Custom User as Approver
```http
POST /api/workflow/approver/create

{
  "stage_id": 1,
  "approver_type": "CUSTOM_USER",
  "custom_user_id": 123,
  "approver_order": 1
}
```

#### Add Multiple Approvers (AND Logic)
```http
POST /api/workflow/approver/create-batch

{
  "stage_id": 3,
  "approver_logic": "AND",
  "approvers": [
    {
      "approver_type": "CUSTOM_USER",
      "custom_user_id": 101,
      "approver_order": 1
    },
    {
      "approver_type": "CUSTOM_USER",
      "custom_user_id": 102,
      "approver_order": 2
    }
  ]
}
```

---

### 4. Conditional Logic

#### Create Simple Condition (Auto Reject if Balance Low)
```http
POST /api/workflow/condition/create
Authorization: Bearer {token}

{
  "workflow_config_id": 1,
  "condition_name": "Auto reject if leave balance < 10",
  "condition_type": "auto_action",
  "action_type": "auto_reject",
  "priority": 1,
  "rules": [
    {
      "field_source": "leave_balance",
      "field_name": "available_balance",
      "field_type": "number",
      "operator": "<",
      "compare_value": "10"
    }
  ]
}
```

#### Create Condition with Multiple Rules (AND Logic)
```http
POST /api/workflow/condition/create

{
  "workflow_config_id": 1,
  "condition_name": "CFO approval for high amount claims in Delhi",
  "condition_type": "stage_routing",
  "logic_operator": "AND",
  "action_type": "move_to_stage",
  "action_stage_id": 3,
  "else_action_type": "continue",
  "priority": 1,
  "rules": [
    {
      "field_source": "request",
      "field_name": "claim_amount",
      "field_type": "number",
      "operator": ">",
      "compare_value": "5000"
    },
    {
      "field_source": "employee",
      "field_name": "location",
      "field_type": "string",
      "operator": "=",
      "compare_value": "Delhi"
    }
  ]
}
```

#### Create Condition (Auto Approve for CEO)
```http
POST /api/workflow/condition/create

{
  "workflow_config_id": 1,
  "condition_name": "Auto approve for CEO",
  "condition_type": "auto_action",
  "action_type": "auto_approve",
  "priority": 1,
  "rules": [
    {
      "field_source": "employee",
      "field_name": "designation",
      "field_type": "string",
      "operator": "=",
      "compare_value": "CEO"
    }
  ]
}
```

---

### 5. Applicability Rules

#### Apply to Entire Company
```http
POST /api/workflow/applicability/create
Authorization: Bearer {token}

{
  "workflow_config_id": 1,
  "applicability_type": "company",
  "company_id": 1,
  "is_excluded": false,
  "priority": 10
}
```

#### Apply to Specific Department
```http
POST /api/workflow/applicability/create

{
  "workflow_config_id": 1,
  "applicability_type": "department",
  "department_id": 5,
  "is_excluded": false,
  "priority": 1
}
```

#### Apply to Specific Designation
```http
POST /api/workflow/applicability/create

{
  "workflow_config_id": 1,
  "applicability_type": "designation",
  "designation_id": 10,
  "is_excluded": false,
  "priority": 1
}
```

#### Apply to Custom Employee
```http
POST /api/workflow/applicability/create

{
  "workflow_config_id": 1,
  "applicability_type": "custom_employee",
  "employee_id": 123,
  "is_excluded": false,
  "priority": 1
}
```

#### Exclude Specific Department
```http
POST /api/workflow/applicability/create

{
  "workflow_config_id": 1,
  "applicability_type": "department",
  "department_id": 3,
  "is_excluded": true,
  "priority": 1
}
```

---

### 6. Request Submission

#### Submit Leave Request
```http
POST /api/workflow/request/submit
Authorization: Bearer {token}

{
  "employee_id": 100,
  "workflow_master_id": 1,
  "request_data": {
    "leave_type": "Casual Leave",
    "from_date": "2024-01-20",
    "to_date": "2024-01-22",
    "duration": 3,
    "reason": "Personal work"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request submitted successfully",
  "data": {
    "request": {
      "id": 1001,
      "request_number": "WFR-LEAVE-2024-00001",
      "workflow_config_id": 1,
      "employee_id": 100,
      "current_stage_id": 1,
      "request_status": "pending",
      "submitted_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

#### Submit Expense Claim Request
```http
POST /api/workflow/request/submit

{
  "employee_id": 100,
  "workflow_master_id": 10,
  "request_data": {
    "claim_type": "Travel",
    "claim_amount": 6000,
    "claim_date": "2024-01-10",
    "description": "Client meeting travel",
    "attachments": ["receipt1.pdf", "receipt2.pdf"]
  }
}
```

---

### 7. Approval Actions

#### Approve Request
```http
POST /api/workflow/request/approve
Authorization: Bearer {token}

{
  "request_id": 1001,
  "approver_user_id": 50,
  "remarks": "Approved",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "request": {
      "id": 1001,
      "request_status": "pending",
      "current_stage_id": 2,
      "next_stage_name": "HR Approval"
    }
  }
}
```

#### Reject Request
```http
POST /api/workflow/request/reject

{
  "request_id": 1001,
  "approver_user_id": 50,
  "remarks": "Insufficient leave balance"
}
```

#### Delegate Approval
```http
POST /api/workflow/request/delegate

{
  "request_id": 1001,
  "approver_user_id": 50,
  "delegate_to_user_id": 51,
  "remarks": "Out of office - delegating to team member"
}
```

#### Withdraw Request
```http
POST /api/workflow/request/withdraw

{
  "request_id": 1001,
  "employee_id": 100,
  "remarks": "No longer needed"
}
```

---

### 8. Query APIs

#### Get My Requests
```http
POST /api/workflow/request/my-requests
Authorization: Bearer {token}

{
  "employee_id": 100,
  "status": "pending",
  "workflow_master_id": 1,
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1001,
        "request_number": "WFR-LEAVE-2024-00001",
        "workflow_type": "Leave",
        "request_status": "pending",
        "current_stage_name": "RM Approval",
        "submitted_at": "2024-01-15T10:00:00Z",
        "sla_due_date": "2024-01-17T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Pending Requests for Approver
```http
POST /api/workflow/request/pending
Authorization: Bearer {token}

{
  "approver_user_id": 50,
  "workflow_master_id": 1,
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1001,
        "request_number": "WFR-LEAVE-2024-00001",
        "employee_name": "John Doe",
        "workflow_type": "Leave",
        "current_stage_name": "RM Approval",
        "submitted_at": "2024-01-15T10:00:00Z",
        "sla_due_date": "2024-01-17T10:00:00Z",
        "is_sla_breached": false,
        "request_data": {
          "leave_type": "Casual Leave",
          "from_date": "2024-01-20",
          "to_date": "2024-01-22"
        }
      }
    ],
    "total": 1
  }
}
```

#### Get Request Details
```http
POST /api/workflow/request/details

{
  "request_id": 1001
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1001,
      "request_number": "WFR-LEAVE-2024-00001",
      "employee": {
        "id": 100,
        "name": "John Doe",
        "designation": "Manager"
      },
      "workflow": {
        "id": 1,
        "name": "Leave Approval - Sales Team",
        "type": "Leave"
      },
      "current_stage": {
        "id": 1,
        "name": "RM Approval",
        "order": 1
      },
      "request_status": "pending",
      "request_data": {
        "leave_type": "Casual Leave",
        "from_date": "2024-01-20",
        "to_date": "2024-01-22",
        "duration": 3,
        "reason": "Personal work"
      },
      "submitted_at": "2024-01-15T10:00:00Z",
      "sla_due_date": "2024-01-17T10:00:00Z"
    }
  }
}
```

#### Get Request Timeline/History
```http
POST /api/workflow/request/timeline

{
  "request_id": 1001
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "id": 1,
        "action_type": "submit",
        "action_by": "John Doe (Employee)",
        "action_by_user_id": 100,
        "stage_name": null,
        "remarks": "Personal work",
        "action_taken_at": "2024-01-15T10:00:00Z"
      },
      {
        "id": 2,
        "action_type": "approve",
        "action_by": "Jane Smith (RM)",
        "action_by_user_id": 50,
        "stage_name": "RM Approval",
        "remarks": "Approved",
        "action_taken_at": "2024-01-15T14:30:00Z"
      },
      {
        "id": 3,
        "action_type": "approve",
        "action_by": "System (Auto)",
        "action_by_user_id": null,
        "stage_name": "HR Approval",
        "remarks": "Auto approved after 2 days",
        "action_taken_at": "2024-01-17T10:00:00Z"
      }
    ]
  }
}
```

---

### 9. Email Template Configuration

#### Create Email Template
```http
POST /api/workflow/email-template/create
Authorization: Bearer {token}

{
  "company_id": 1,
  "workflow_master_id": 1,
  "template_code": "LEAVE_SUBMISSION",
  "event_type": "submission",
  "subject": "Leave Request Submitted - {{request_number}}",
  "body_html": "<p>Dear {{approver_name}},</p><p>{{employee_name}} ({{employee_code}}) has submitted a leave request for approval.</p><p><strong>Details:</strong></p><ul><li>Leave Type: {{leave_type}}</li><li>From: {{leave_from_date}}</li><li>To: {{leave_to_date}}</li><li>Duration: {{leave_days}} days</li></ul><p>Please log in to the system to approve or reject.</p>",
  "to_recipients": ["{{approver_email}}"],
  "cc_recipients": ["{{hr_email}}", "{{rm_email}}"],
  "bcc_recipients": ["audit@company.com"]
}
```

---

### 10. Workflow Management

#### Clone Workflow
```http
POST /api/workflow/config/clone

{
  "workflow_config_id": 1,
  "new_workflow_name": "Leave Approval - Marketing Team",
  "new_workflow_code": "LEAVE_MARKETING"
}
```

#### Create New Version
```http
POST /api/workflow/config/create-version

{
  "workflow_config_id": 1,
  "version_name": "V2 - Updated SLA",
  "change_summary": "Reduced RM approval SLA from 2 days to 1 day",
  "effective_from": "2024-02-01"
}
```

#### Activate Workflow
```http
POST /api/workflow/config/activate

{
  "workflow_config_id": 1
}
```

#### Deactivate Workflow
```http
POST /api/workflow/config/deactivate

{
  "workflow_config_id": 1
}
```

---

## 📊 Advanced Use Cases

### Use Case 1: CEO Auto-Approve Leave Workflow

**Step 1: Create Workflow**
```http
POST /api/workflow/config/create
{
  "workflow_name": "Leave - Executive Auto Approve",
  "workflow_code": "LEAVE_EXEC"
}
```

**Step 2: Add Auto-Approve Condition**
```http
POST /api/workflow/condition/create
{
  "workflow_config_id": 2,
  "condition_name": "Auto approve for CEO",
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

**Step 3: Add Notify-Only Stage (for records)**
```http
POST /api/workflow/stage/create
{
  "workflow_config_id": 2,
  "stage_name": "Notify HR",
  "stage_type": "notify_only",
  "send_email_on_assign": true
}
```

**Step 4: Configure Applicability**
```http
POST /api/workflow/applicability/create
{
  "workflow_config_id": 2,
  "applicability_type": "designation",
  "designation_id": 1,
  "priority": 1
}
```

---

### Use Case 2: Amount-Based Claim Routing

**Workflow: Expense Claim with Amount-Based Routing**

**Condition 1: Small Claims Auto-Approve**
```http
POST /api/workflow/condition/create
{
  "condition_name": "Auto approve claims <= 1000",
  "condition_type": "auto_action",
  "action_type": "auto_approve",
  "priority": 1,
  "rules": [
    {
      "field_source": "request",
      "field_name": "claim_amount",
      "operator": "<=",
      "compare_value": "1000"
    }
  ]
}
```

**Condition 2: Medium Claims to RM**
```http
POST /api/workflow/condition/create
{
  "condition_name": "RM approval for 1000-5000",
  "condition_type": "stage_routing",
  "action_type": "move_to_stage",
  "action_stage_id": 1,
  "priority": 2,
  "rules": [
    {
      "field_source": "request",
      "field_name": "claim_amount",
      "operator": ">",
      "compare_value": "1000"
    },
    {
      "field_source": "request",
      "field_name": "claim_amount",
      "operator": "<=",
      "compare_value": "5000"
    }
  ]
}
```

**Condition 3: Large Claims to CFO**
```http
POST /api/workflow/condition/create
{
  "condition_name": "CFO approval for > 5000",
  "condition_type": "stage_routing",
  "action_type": "move_to_stage",
  "action_stage_id": 3,
  "priority": 3,
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

---

### Use Case 3: Department Exclusion

**Workflow: WFH Approval (Except IT Department)**

**Applicability 1: Apply to All**
```http
POST /api/workflow/applicability/create
{
  "applicability_type": "company",
  "company_id": 1,
  "priority": 10
}
```

**Applicability 2: Exclude IT**
```http
POST /api/workflow/applicability/create
{
  "applicability_type": "department",
  "department_id": 3,
  "is_excluded": true,
  "priority": 1
}
```

---

## 🔧 Utility APIs

### Test Condition Logic
```http
POST /api/workflow/condition/test

{
  "condition_id": 1,
  "test_data": {
    "employee": {
      "designation": "CEO",
      "location": "Delhi"
    },
    "request": {
      "claim_amount": 6000
    },
    "leave_balance": {
      "available_balance": 15
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "condition_matched": true,
    "action_type": "auto_approve",
    "reason": "Condition matched: Auto approve for CEO"
  }
}
```

### Preview Workflow Execution
```http
POST /api/workflow/preview

{
  "employee_id": 100,
  "workflow_master_id": 1,
  "request_data": {
    "leave_type": "Casual Leave",
    "duration": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicable_workflow": {
      "id": 1,
      "name": "Leave Approval - Sales Team"
    },
    "execution_path": [
      {
        "stage_name": "RM Approval",
        "approvers": ["Jane Smith (RM)"],
        "sla_days": 2
      },
      {
        "stage_name": "HR Approval",
        "approvers": ["HR Admin"],
        "sla_days": 1
      }
    ],
    "conditions_applied": [
      {
        "condition": "Check leave balance",
        "result": "Passed"
      }
    ],
    "estimated_completion": "2 days"
  }
}
```

---

## 📈 Reporting APIs

### Workflow Analytics
```http
POST /api/workflow/reports/analytics

{
  "company_id": 1,
  "workflow_master_id": 1,
  "from_date": "2024-01-01",
  "to_date": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_requests": 150,
    "approved": 120,
    "rejected": 20,
    "pending": 10,
    "auto_approved": 15,
    "auto_rejected": 5,
    "average_approval_time_days": 1.5,
    "sla_breach_count": 8,
    "sla_breach_percentage": 5.3,
    "by_stage": {
      "RM Approval": {
        "total": 150,
        "approved": 130,
        "rejected": 15,
        "avg_time_hours": 24
      }
    }
  }
}
```

### Approver Performance
```http
POST /api/workflow/reports/approver-performance

{
  "approver_user_id": 50,
  "from_date": "2024-01-01",
  "to_date": "2024-01-31"
}
```

---

## 🔑 Authentication

All APIs require JWT authentication:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚡ Rate Limiting

- **Standard APIs**: 100 requests/minute
- **Query APIs**: 200 requests/minute
- **Submission APIs**: 50 requests/minute

---

## 📝 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "WORKFLOW_NOT_FOUND",
    "message": "No applicable workflow found for this employee",
    "details": {
      "employee_id": 100,
      "workflow_master_id": 1
    }
  }
}
```

### Common Error Codes
- `WORKFLOW_NOT_FOUND` - No applicable workflow found
- `INVALID_STAGE` - Invalid stage configuration
- `UNAUTHORIZED_APPROVER` - User not authorized to approve
- `REQUEST_ALREADY_ACTIONED` - Request already approved/rejected
- `SLA_CONFIGURATION_ERROR` - Invalid SLA configuration
- `CONDITION_EVALUATION_ERROR` - Error evaluating condition

---

**Happy Coding!** 🚀
