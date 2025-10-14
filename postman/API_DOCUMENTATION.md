# HRMS API Complete Documentation

This document provides comprehensive documentation for all HRMS APIs organized by modules.

## Table of Contents

1. [Health Check](#1-health-check)
2. [Authentication](#2-authentication)
3. [Onboarding](#3-onboarding)
4. [Employees](#4-employees)
5. [Templates](#5-templates)
6. [Departments](#6-departments)
7. [Sub-Departments](#7-sub-departments)
8. [Leave Types](#8-leave-types)
9. [Leave Policies](#9-leave-policies)
10. [Leave Balance](#10-leave-balance)
11. [Leave Credit Cron](#11-leave-credit-cron)
12. [Master Data](#12-master-data)
13. [Attendance Requests - Employee](#13-attendance-requests---employee)
14. [Attendance Requests - Admin](#14-attendance-requests---admin)
15. [Workflow Requests - Employee](#15-workflow-requests---employee)
16. [Workflow Configuration - Admin](#16-workflow-configuration---admin)

---

## 1. Health Check

### GET /api/health
Check if the API server is running

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "HRMS Backend API is running",
  "timestamp": "2025-10-14T10:30:00.000Z"
}
```

---

## 2. Authentication

### POST /api/auth/set-password
Set password for the first time after onboarding

**Authentication:** Not required
**Body Parameters:**
- `token` (string, required): Password set token from email
- `password` (string, required): New password
- `confirm_password` (string, required): Password confirmation

**Response:**
```json
{
  "success": true,
  "message": "Password set successfully",
  "data": {
    "token": "jwt-auth-token"
  }
}
```

### POST /api/auth/login
User login

**Authentication:** Not required
**Body Parameters:**
- `email` (string, required): User email
- `password` (string, required): User password

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-auth-token",
    "user": {
      "id": 1,
      "email": "admin@company.com",
      "company_id": 1,
      "role": "super_admin"
    }
  }
}
```

### POST /api/auth/forgot-password
Request password reset email

**Authentication:** Not required
**Body Parameters:**
- `email` (string, required): User email

### POST /api/auth/reset-password
Reset password using token from email

**Authentication:** Not required
**Body Parameters:**
- `token` (string, required): Reset token from email
- `password` (string, required): New password
- `confirm_password` (string, required): Password confirmation

### POST /api/auth/resend-set-password
Resend password setup email

**Authentication:** Not required
**Body Parameters:**
- `email` (string, required): User email

---

## 3. Onboarding

### POST /api/onboarding
Create company and super admin user in one transaction

**Authentication:** Not required
**Body Parameters:**
```json
{
  "company": {
    "company_name": "ABC Corporation",
    "company_code": "ABC001",
    "industry_id": 1,
    "company_email": "info@abccorp.com",
    "company_phone": "+1234567890",
    "country_id": 101,
    "state_id": 1,
    "city_id": 1,
    "address": "123 Business Street",
    "pincode": "12345",
    "website": "https://abccorp.com"
  },
  "user": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "admin@abccorp.com",
    "phone": "+1234567890",
    "role": "super_admin"
  }
}
```

---

## 4. Employees

### POST /api/employees
Create a new employee

**Authentication:** Required (Bearer token)
**Body Parameters:**
```json
{
  "employee_code": "EMP001",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1234567891",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "date_of_joining": "2024-01-01",
  "department_id": 1,
  "sub_department_id": 1,
  "designation_id": 1,
  "level_id": 1,
  "reporting_manager_id": null,
  "employment_type": "full_time",
  "status": 0
}
```

### GET /api/employees/:id
Get employee details by ID

**Authentication:** Required

### GET /api/employees/company
Get all employees for logged-in user's company

**Authentication:** Required

### PUT /api/employees/:id
Update employee details

**Authentication:** Required

### POST /api/employees/activate/:user_id
Activate user and send login credentials email

**Authentication:** Required

### POST /api/employees/resend-activation/:user_id
Resend activation email to user

**Authentication:** Required

---

## 5. Templates

Templates allow dynamic form configuration for employee onboarding and other processes.

### GET /api/templates
Get all templates

**Authentication:** Required

### GET /api/templates/:template_slug
Get specific template with sections and fields

**Authentication:** Required

### POST /api/templates/sections
Create a new section in a template

**Authentication:** Required

### PUT /api/templates/sections/:id
Update section

**Authentication:** Required

### DELETE /api/templates/sections/:id
Delete section

**Authentication:** Required

### POST /api/templates/fields
Create a new field in a section

**Authentication:** Required

### PUT /api/templates/fields/:id
Update field

**Authentication:** Required

### DELETE /api/templates/fields/:id
Delete field

**Authentication:** Required

---

## 6. Departments

All department APIs use POST method.

### POST /api/departments/create
Create organization department mapping

**Authentication:** Required
**Body Parameters:**
```json
{
  "org_id": 1,
  "department_id": 1,
  "department_head_id": null,
  "is_active": true
}
```

### POST /api/departments/update
Update organization department

**Authentication:** Required

### POST /api/departments/list
Get organization departments list

**Authentication:** Required

---

## 7. Sub-Departments

All sub-department APIs use POST method.

### POST /api/sub-departments/create
Create sub-department

**Authentication:** Required
**Body Parameters:**
```json
{
  "org_dept_id": 1,
  "sub_department_name": "Backend Development",
  "sub_department_code": "BACKEND",
  "description": "Backend development team",
  "head_id": null,
  "is_active": true
}
```

### POST /api/sub-departments/update
Update sub-department

**Authentication:** Required

### POST /api/sub-departments/list
Get sub-departments by organization department

**Authentication:** Required

---

## 8. Leave Types

### POST /api/leave-types
Create leave type

**Authentication:** Required
**Body Parameters:**
```json
{
  "leave_code": "CL",
  "leave_name": "Casual Leave",
  "leave_cycle_start_month": 1,
  "leave_cycle_end_month": 12,
  "leave_type": "paid",
  "credit_frequency": "monthly",
  "number_of_leaves_to_credit": 12,
  "can_request_half_day": true,
  "can_employee_request": true
}
```

### GET /api/leave-types
Get all leave types

**Authentication:** Required
**Query Parameters:**
- `is_active` (boolean, optional): Filter by active status

### GET /api/leave-types/:id
Get leave type by ID

**Authentication:** Required

### PUT /api/leave-types/:id
Update leave type

**Authentication:** Required

### DELETE /api/leave-types/:id
Soft delete leave type

**Authentication:** Required

### GET /api/leave-types/:id/audit-logs
Get audit logs for leave type

**Authentication:** Required

---

## 9. Leave Policies

### POST /api/leave-policies/create
Create leave policy

**Authentication:** Required
**Body Parameters:**
```json
{
  "policy_name": "Permanent Employee Policy",
  "policy_description": "Leave policy for permanent employees",
  "leave_type_ids": [1, 2, 3, 5]
}
```

### POST /api/leave-policies/update
Update leave policy

**Authentication:** Required

### GET /api/leave-policies
Get all leave policies

**Authentication:** Required
**Query Parameters:**
- `is_active` (boolean, optional): Filter by active status
- `include_inactive_leave_types` (boolean, optional): Include inactive leave types

### GET /api/leave-policies/:id
Get leave policy by ID

**Authentication:** Required

### DELETE /api/leave-policies/:id
Delete leave policy

**Authentication:** Required

### PATCH /api/leave-policies/:policyId/leave-types/:leaveTypeId/toggle
Toggle leave type in policy (activate/deactivate)

**Authentication:** Required

---

## 10. Leave Balance

### GET /api/leave-balance/:employeeId
Get employee leave balance

**Authentication:** Required
**Query Parameters:**
- `year` (number, optional): Year
- `month` (number, optional): Month

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "leave_type_id": 1,
      "leave_type_name": "Casual Leave",
      "opening_balance": 12,
      "credited": 1,
      "debited": 3,
      "closing_balance": 10
    }
  ]
}
```

### POST /api/leave-balance/transaction
Process leave transaction (credit/debit)

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "leave_type_id": 1,
  "transaction_type": "credit",
  "amount": 2,
  "transaction_date": "2024-10-11",
  "reference_type": "manual_adjustment",
  "remarks": "Manual credit for special case"
}
```

---

## 11. Leave Credit Cron

### POST /api/cron/leave-credit/run
Manually run leave credit cron job

**Authentication:** Required
**Body Parameters:**
```json
{
  "frequency": "monthly",
  "execution_date": "2024-10-01"
}
```

---

## 12. Master Data

Unified API for fetching master data (dropdowns/selects).

### POST /api/master/data
Get master data for a specific type or all types

**Authentication:** Required
**Body Parameters:**

**Single Master:**
```json
{
  "master_type": "department",
  "company_id": 1
}
```

**All Masters:**
```json
{
  "company_id": 1
}
```

**Supported Master Types:**
- `country` - Country master (not company-scoped)
- `state` - State master (not company-scoped)
- `city` - City master (not company-scoped)
- `department` - Company departments
- `sub_department` - Sub-departments
- `grade` - Grades
- `designation` - Designations
- `level` - Hierarchy levels
- `skill` - Skills
- `leave_type` - Leave types

### POST /api/master/multiple
Get multiple masters in one request

**Authentication:** Required
**Body Parameters:**
```json
{
  "master_types": ["department", "designation", "level", "grade"],
  "company_id": 1
}
```

### POST /api/master/hierarchical
Get hierarchical master data

**Authentication:** Required
**Body Parameters:**

**Geographic Hierarchy (Country → State → City):**
```json
{
  "type": "geographic"
}
```

**Custom Hierarchy (Department → Sub-Department):**
```json
{
  "type": "custom",
  "parent_type": "department",
  "child_type": "sub_department",
  "company_id": 1
}
```

---

## 13. Attendance Requests - Employee

Employee APIs for leave, on duty, WFH, short leave, and regularization requests.

### POST /api/attendance/employee/leave/apply
Apply for leave

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "leave_type_id": 1,
  "from_date": "2024-12-25",
  "to_date": "2024-12-27",
  "from_session": "full_day",
  "to_session": "full_day",
  "total_days": 3,
  "reason": "Personal work",
  "attachments": [
    {
      "file_name": "leave_doc.pdf",
      "file_path": "/uploads/leave_doc.pdf",
      "file_type": "application/pdf"
    }
  ]
}
```

### POST /api/attendance/employee/onduty/apply
Apply for on duty

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "from_date": "2024-12-20",
  "to_date": "2024-12-20",
  "from_time": "09:00:00",
  "to_time": "17:00:00",
  "purpose": "Client meeting",
  "location": "Client Office, Downtown"
}
```

### POST /api/attendance/employee/wfh/apply
Apply for work from home

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "from_date": "2024-12-21",
  "to_date": "2024-12-21",
  "reason": "Remote work setup at home"
}
```

### POST /api/attendance/employee/short-leave/apply
Apply for short leave

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "request_date": "2024-12-19",
  "from_time": "14:00:00",
  "to_time": "16:00:00",
  "duration_hours": 2,
  "reason": "Doctor appointment"
}
```

### POST /api/attendance/employee/regularization/apply
Apply for attendance regularization

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "request_date": "2024-12-18",
  "regularization_type": "missed_punch",
  "punch_in_time": "09:30:00",
  "punch_out_time": "18:00:00",
  "reason": "Forgot to punch in the morning"
}
```

### GET /api/attendance/employee/requests/my-requests
Get employee's own requests

**Authentication:** Required
**Query Parameters:**
- `type` (string, optional): `leave`, `onduty`, `wfh`, `short-leave`, `regularization`
- `status` (string, optional): `pending`, `approved`, `rejected`, `withdrawn`

### GET /api/attendance/employee/requests/:requestId
Get request details by ID

**Authentication:** Required

### POST /api/attendance/employee/requests/:requestId/withdraw
Withdraw a request

**Authentication:** Required
**Body Parameters:**
```json
{
  "reason": "Plans changed"
}
```

### GET /api/attendance/employee/leave/balance
Get employee's leave balance

**Authentication:** Required

---

## 14. Attendance Requests - Admin

Admin APIs for managing attendance requests.

### GET /api/attendance/admin/requests
Get all requests (unified API for all types)

**Authentication:** Required (Admin)
**Query Parameters:**
- `type` (string, optional): Filter by request type
- `status` (string, optional): Filter by status
- `employee_id` (number, optional): Filter by employee
- `from_date` (date, optional): Start date filter
- `to_date` (date, optional): End date filter
- `limit` (number, optional): Pagination limit
- `offset` (number, optional): Pagination offset

### GET /api/attendance/admin/requests/:requestId
Get request details (admin view)

**Authentication:** Required (Admin)

### POST /api/attendance/admin/requests/:requestId/action
Admin approve or reject request (override)

**Authentication:** Required (Admin)
**Body Parameters:**
```json
{
  "action": "approve",
  "remarks": "Approved by admin"
}
```

### GET /api/attendance/admin/requests/dashboard
Get dashboard statistics for all request types

**Authentication:** Required (Admin)
**Query Parameters:**
- `from_date` (date, optional)
- `to_date` (date, optional)

### POST /api/attendance/admin/requests/bulk-approve
Bulk approve multiple requests

**Authentication:** Required (Admin)
**Body Parameters:**
```json
{
  "request_ids": [1, 2, 3, 4],
  "remarks": "Bulk approved"
}
```

### POST /api/attendance/admin/requests/bulk-reject
Bulk reject multiple requests

**Authentication:** Required (Admin)
**Body Parameters:**
```json
{
  "request_ids": [5, 6, 7],
  "remarks": "Rejected - insufficient leave balance"
}
```

---

## 15. Workflow Requests - Employee

Employee APIs for workflow-based requests (advanced workflow system).

### POST /api/workflows/requests/submit
Submit a new workflow request

**Authentication:** Required
**Body Parameters:**
```json
{
  "employee_id": 1,
  "workflow_master_id": 1,
  "request_data": {
    "leave_type_id": 1,
    "from_date": "2024-12-25",
    "to_date": "2024-12-27",
    "total_days": 3,
    "reason": "Family vacation"
  }
}
```

### GET /api/workflows/requests/my-requests
Get my submitted workflow requests

**Authentication:** Required
**Query Parameters:**
- `status` (string, optional): `pending`, `approved`, `rejected`
- `workflow_master_id` (number, optional): Filter by workflow type
- `page` (number, optional): Page number
- `limit` (number, optional): Results per page

### GET /api/workflows/requests/pending-approvals
Get workflow requests pending my approval

**Authentication:** Required
**Query Parameters:**
- `workflow_master_id` (number, optional)
- `page` (number, optional)
- `limit` (number, optional)

### GET /api/workflows/requests/dashboard
Get workflow dashboard statistics

**Authentication:** Required

### GET /api/workflows/requests/:requestId
Get workflow request details by ID

**Authentication:** Required

### POST /api/workflows/requests/:requestId/approve
Approve a workflow request

**Authentication:** Required
**Body Parameters:**
```json
{
  "remarks": "Approved",
  "attachments": []
}
```

### POST /api/workflows/requests/:requestId/reject
Reject a workflow request

**Authentication:** Required
**Body Parameters:**
```json
{
  "remarks": "Insufficient information provided",
  "attachments": []
}
```

### POST /api/workflows/requests/:requestId/withdraw
Withdraw a workflow request

**Authentication:** Required
**Body Parameters:**
```json
{
  "reason": "Plans changed"
}
```

### GET /api/workflows/requests/:requestId/history
Get workflow request history/audit trail

**Authentication:** Required

---

## 16. Workflow Configuration - Admin

Admin APIs for configuring workflows.

### GET /api/workflows/admin/masters
Get all workflow masters (Leave, On Duty, etc.)

**Authentication:** Required (Admin)
**Query Parameters:**
- `is_active` (boolean, optional)

### POST /api/workflows/admin/configs
Create new workflow configuration

**Authentication:** Required (Admin)
**Body Parameters:**
```json
{
  "company_id": 1,
  "workflow_master_id": 1,
  "workflow_name": "Standard Leave Workflow",
  "workflow_code": "LEAVE_STD_COMP1",
  "description": "Standard two-stage leave approval",
  "is_default": true,
  "stages": [
    {
      "stage_name": "RM Approval",
      "stage_order": 1,
      "stage_type": "approval",
      "approver_logic": "OR",
      "sla_days": 2,
      "pending_action": "notify",
      "approvers": [
        {
          "approver_type": "RM"
        }
      ]
    }
  ]
}
```

### GET /api/workflows/admin/configs
Get all workflow configurations

**Authentication:** Required (Admin)
**Query Parameters:**
- `company_id` (number, optional)
- `workflow_master_id` (number, optional)
- `is_active` (boolean, optional)
- `is_default` (boolean, optional)

### GET /api/workflows/admin/configs/:configId
Get workflow configuration details

**Authentication:** Required (Admin)

### PUT /api/workflows/admin/configs/:configId
Update workflow configuration

**Authentication:** Required (Admin)

### DELETE /api/workflows/admin/configs/:configId
Delete workflow configuration

**Authentication:** Required (Admin)

### POST /api/workflows/admin/configs/:configId/clone
Clone existing workflow configuration

**Authentication:** Required (Admin)

### POST /api/workflows/admin/configs/:configId/stages
Create a new stage in workflow

**Authentication:** Required (Admin)

### PUT /api/workflows/admin/stages/:stageId
Update workflow stage

**Authentication:** Required (Admin)

### DELETE /api/workflows/admin/stages/:stageId
Delete workflow stage

**Authentication:** Required (Admin)

### POST /api/workflows/admin/stages/:stageId/approvers
Add approver to stage

**Authentication:** Required (Admin)

### PUT /api/workflows/admin/approvers/:approverId
Update stage approver

**Authentication:** Required (Admin)

### DELETE /api/workflows/admin/approvers/:approverId
Delete stage approver

**Authentication:** Required (Admin)

### POST /api/workflows/admin/configs/:configId/conditions
Create workflow condition

**Authentication:** Required (Admin)

### PUT /api/workflows/admin/conditions/:conditionId
Update workflow condition

**Authentication:** Required (Admin)

### DELETE /api/workflows/admin/conditions/:conditionId
Delete workflow condition

**Authentication:** Required (Admin)

### POST /api/workflows/admin/configs/:configId/applicability
Create applicability rule (who can use this workflow)

**Authentication:** Required (Admin)
**Body Parameters:**
```json
{
  "applicability_type": "department",
  "department_id": 1,
  "is_excluded": false
}
```

**Applicability Types:**
- `company` - Company-wide
- `entity` - Entity-specific
- `department` - Department-specific
- `sub_department` - Sub-department-specific
- `designation` - Designation-specific
- `level` - Level-specific
- `grade` - Grade-specific
- `location` - Location-specific
- `custom_employee` - Specific employee

### DELETE /api/workflows/admin/applicability/:applicabilityId
Delete applicability rule

**Authentication:** Required (Admin)

### GET /api/workflows/admin/configs/:configId/versions
Get workflow version history

**Authentication:** Required (Admin)

### POST /api/workflows/admin/versions/:versionId/restore
Restore workflow from version

**Authentication:** Required (Admin)

---

## Approver Types

The following approver types are supported in workflow configurations:

| Approver Type | Description |
|--------------|-------------|
| `RM` | Reporting Manager |
| `RM_OF_RM` | Manager's Manager (second level) |
| `HR_ADMIN` | HR Administrator |
| `HOD` | Head of Department |
| `FUNCTIONAL_HEAD` | Functional Head |
| `SUB_ADMIN` | Sub Administrator |
| `SECONDARY_RM` | Secondary Reporting Manager |
| `SELF` | Self (requestor) |
| `AUTO_APPROVE` | Automatic Approval |
| `CUSTOM_USER` | Specific User (requires custom_user_id) |

---

## Common Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry or constraint violation |
| 500 | Internal Server Error | Server error |

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Notes

- All dates are in `YYYY-MM-DD` format
- All timestamps are in ISO 8601 format
- Boolean values are lowercase: `true` or `false`
- Soft deletes are used (records are not permanently deleted)
- Most APIs require Bearer token authentication
- Pagination is zero-indexed (offset starts at 0)
- Default page limit is usually 20 items

---

## Getting Started

1. **Import** the Postman collection
2. **Import** the environment file
3. **Select** "HRMS Environment" from dropdown
4. **Run** `/api/onboarding` to create company and user
5. **Set password** using token from email
6. **Login** to get auth token (auto-saved to environment)
7. Start using authenticated APIs

---

## Support

For issues or questions:
- Check workflow documentation files
- Review database schema: `database/create_all_tables.sql`
- Check implementation summaries in project root
