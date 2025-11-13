# Admin Attendance Requests UI Documentation
## Admin Portal - Complete Management Interface

---

## Overview
This document describes the UI implementation for the Attendance Request module on the Admin portal. Admin users have complete access to:
- View all attendance requests across the organization
- Approve/Reject requests (override workflow)
- Apply requests on behalf of any employee
- Bulk operations
- Dashboard and analytics
- Advanced filtering and reporting

---

## Table of Contents
1. [Admin Dashboard](#1-admin-dashboard)
2. [All Requests Management](#2-all-requests-management)
3. [Request Details & Actions](#3-request-details--actions)
4. [Apply on Behalf](#4-apply-on-behalf-of-employee)
5. [Bulk Operations](#5-bulk-operations)
6. [Reports & Analytics](#6-reports--analytics)
7. [Advanced Features](#7-advanced-features)

---

# 1. ADMIN DASHBOARD

**Route:** `/admin/attendance/dashboard`

## 1.1 Dashboard Layout

```
+------------------------------------------------------------------+
| Attendance Requests Dashboard                   [+ Apply Request]|
+------------------------------------------------------------------+
| Overview Statistics - Current Month                              |
| +-------------+ +-------------+ +-------------+ +-------------+  |
| | Total       | | Pending     | | Approved    | | Rejected    | |
| | 248         | | 35          | | 198         | | 15          | |
| | Requests    | | ⏳ Action   | | ✅ This Mth | | ❌ This Mth | |
| +-------------+ +-------------+ +-------------+ +-------------+  |
|                                                                   |
| +-------------+ +-------------+ +-------------+ +-------------+  |
| | Leave       | | On Duty     | | WFH         | | Short Leave | |
| | 120 (48%)   | | 45 (18%)    | | 58 (23%)    | | 18 (7%)     | |
| +-------------+ +-------------+ +-------------+ +-------------+  |
+------------------------------------------------------------------+
| Pending Requests by Type                      [View All (35)]    |
| +--------------------------+----------------------------------+  |
| | Leave Requests      (18) | | WFH Requests         (8)     |  |
| | On Duty Requests    (5)  | | Short Leave          (2)     |  |
| | Regularization      (2)  |                                  |  |
| +--------------------------+----------------------------------+  |
+------------------------------------------------------------------+
| Recent Activity                                                  |
| +--------------------------------------------------------------+ |
| | 2 min ago  | Jane Doe applied for Leave (5 days)            | |
| | 15 min ago | Admin approved John's WFH request              | |
| | 1 hour ago | Manager rejected Bob's Regularization          | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| Quick Actions                                                    |
| [View All Pending] [Bulk Approve] [Export Report] [Calendar]    |
+------------------------------------------------------------------+
```

## 1.2 Dashboard API

```javascript
GET /api/attendance/admin/requests/dashboard

Query Parameters:
- from_date: YYYY-MM-DD (optional, default: start of current month)
- to_date: YYYY-MM-DD (optional, default: end of current month)

Response:
{
  "success": true,
  "data": {
    "summary": {
      "total_requests": 248,
      "pending_requests": 35,
      "approved_requests": 198,
      "rejected_requests": 15,
      "withdrawn_requests": 0
    },
    "by_type": {
      "leave": 120,
      "onduty": 45,
      "wfh": 58,
      "short_leave": 18,
      "regularization": 7
    },
    "by_status": {
      "pending": {
        "leave": 18,
        "onduty": 5,
        "wfh": 8,
        "short_leave": 2,
        "regularization": 2
      },
      "approved": {
        "leave": 95,
        "onduty": 38,
        "wfh": 45,
        "short_leave": 15,
        "regularization": 5
      },
      "rejected": {
        "leave": 7,
        "onduty": 2,
        "wfh": 5,
        "short_leave": 1,
        "regularization": 0
      }
    },
    "recent_activity": [
      {
        "id": 1,
        "activity_type": "request_submitted",
        "employee_name": "Jane Doe",
        "request_type": "leave",
        "request_number": "REQ248",
        "duration": 5,
        "timestamp": "2025-11-13T10:28:00.000Z"
      },
      {
        "id": 2,
        "activity_type": "request_approved",
        "employee_name": "John Smith",
        "request_type": "wfh",
        "request_number": "WFH045",
        "approved_by": "Admin User",
        "timestamp": "2025-11-13T10:15:00.000Z"
      }
      // ... more activities
    ],
    "trends": {
      "week_over_week": "+12%",
      "most_requested_type": "leave",
      "peak_request_day": "Monday"
    }
  }
}
```

---

# 2. ALL REQUESTS MANAGEMENT

**Route:** `/admin/attendance/requests`

## 2.1 All Requests Page Layout

```
+------------------------------------------------------------------+
| All Attendance Requests                         [+ Apply Request]|
+------------------------------------------------------------------+
| Advanced Filters                                    [Reset] [⚙️]  |
| +--------------------------------------------------------------+ |
| | Type: [All ▼]  Status: [All ▼]  Department: [All ▼]        | |
| | Employee: [Search Employee...]  Manager: [All ▼]            | |
| | From Date: [01-Nov-2025]  To Date: [30-Nov-2025]            | |
| | Leave Type: [All ▼]  Applied By: [Employee/Manager/Admin]  | |
| | Search: [Search by request number, employee name...]  [🔍]  | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| Bulk Actions: [Select All] [☑ 3 Selected]                       |
| [Bulk Approve] [Bulk Reject] [Export Selected] [Download PDF]   |
+------------------------------------------------------------------+
| REQ#   | Employee | Type  | Dates     | Days | Status  | Actions|
|--------|----------|-------|-----------|------|---------|--------|
| [☑]REQ | John Doe | Leave | 15-20 Nov | 6.0  | Pending | [App.] |
| 248    | EMP123   | CL    |           |      | ⏳      | [Rej.] |
|        | IT Dept  |       |           |      |         | [View] |
|--------|----------|-------|-----------|------|---------|--------|
| [☐]WFH | Jane S.  | WFH   | 14 Nov    | 1.0  | Approve | [View] |
| 045    | EMP124   |       |           |      | ✅      | [···]  |
|        | HR Dept  |       |           |      |         |        |
|--------|----------|-------|-----------|------|---------|--------|
| [☐]OD  | Bob J.   | On    | 16 Nov    | 1.0  | Reject  | [View] |
| 032    | EMP125   | Duty  | Mumbai    |      | ❌      | [···]  |
|        | Sales    |       |           |      |         |        |
+------------------------------------------------------------------+
| Showing 1-50 of 248 requests    [25/Page ▼]    [< 1 2 3 4 5 >]  |
+------------------------------------------------------------------+
```

## 2.2 Get All Requests API

```javascript
GET /api/attendance/admin/requests

Query Parameters:
- type: leave, onduty, wfh, regularization, short-leave (optional)
- status: pending, approved, rejected, withdrawn (optional)
- employee_id: number (optional)
- department_id: number (optional)
- manager_id: number (optional)
- leave_type: string (optional, for leave requests)
- from_date: YYYY-MM-DD (optional)
- to_date: YYYY-MM-DD (optional)
- applied_by_role: employee, manager, admin (optional)
- search: string (optional - searches request_number, employee_name)
- limit: number (default: 50)
- offset: number (default: 0)
- sort_by: applied_date, from_date, status (default: applied_date)
- sort_order: asc, desc (default: desc)

Response:
{
  "success": true,
  "data": [
    {
      "id": 248,
      "request_number": "REQ248",
      "request_type": "leave",
      "request_status": "pending",

      // Employee details
      "employee_id": 123,
      "employee_name": "John Doe",
      "employee_code": "EMP123",
      "department": "IT Department",
      "designation": "Software Engineer",
      "manager_name": "Jane Manager",

      // Request details
      "applied_date": "2025-11-13T10:30:00.000Z",
      "applied_by_role": "employee",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "duration": 6.0,

      // Leave specific
      "leave_type_id": 1,
      "leave_type": "Casual Leave",
      "leave_type_code": "CL",
      "day_type": "full_day",
      "reason": "Personal work",

      // Workflow details
      "workflow_status": "Pending with Manager",
      "current_stage": "Manager Approval",
      "current_approvers": ["Jane Manager"],

      // Additional
      "has_attachments": true,
      "can_admin_override": true
    },
    {
      "id": 247,
      "request_number": "WFH045",
      "request_type": "wfh",
      "request_status": "approved",

      "employee_id": 124,
      "employee_name": "Jane Smith",
      "employee_code": "EMP124",
      "department": "HR Department",
      "designation": "HR Executive",
      "manager_name": "Bob Manager",

      "applied_date": "2025-11-12T09:00:00.000Z",
      "applied_by_role": "employee",
      "from_date": "2025-11-14",
      "to_date": "2025-11-14",
      "duration": 1.0,

      // WFH specific
      "wfh_reason": "Remote work",
      "work_plan": "Complete documentation",

      "workflow_status": "Approved by Admin",
      "approved_by": "Admin User",
      "approved_date": "2025-11-12T14:30:00.000Z",
      "approval_remarks": "Approved",

      "has_attachments": false,
      "can_admin_override": false
    }
    // ... more requests
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 248,
    "total_pages": 5,
    "current_page": 1,
    "has_next": true,
    "has_previous": false
  },
  "applied_filters": {
    "type": null,
    "status": null,
    "from_date": "2025-11-01",
    "to_date": "2025-11-30"
  }
}
```

---

# 3. REQUEST DETAILS & ACTIONS

## 3.1 View Request Details

```javascript
GET /api/attendance/admin/requests/:requestId

Response:
{
  "success": true,
  "data": {
    "id": 248,
    "request_number": "REQ248",
    "request_type": "leave",
    "request_status": "pending",

    // Employee Information
    "employee": {
      "id": 123,
      "name": "John Doe",
      "code": "EMP123",
      "email": "john.doe@company.com",
      "phone": "9876543210",
      "department": "IT Department",
      "designation": "Software Engineer",
      "joining_date": "2023-01-15",
      "manager": {
        "id": 45,
        "name": "Jane Manager",
        "email": "jane.manager@company.com"
      }
    },

    // Request Information
    "applied_date": "2025-11-13T10:30:00.000Z",
    "applied_by": {
      "user_id": 123,
      "name": "John Doe",
      "role": "employee"
    },

    // Leave Details
    "leave_type_id": 1,
    "leave_type": "Casual Leave",
    "leave_type_code": "CL",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20",
    "day_type": "full_day",
    "duration": 6.0,
    "leave_mode": "date_range",
    "reason": "Personal work",
    "contact_number": "9876543210",
    "contact_address": "Home address",
    "attachment_urls": [
      {
        "url": "https://s3.../medical.pdf",
        "filename": "medical_certificate.pdf",
        "uploaded_at": "2025-11-13T10:30:00.000Z"
      }
    ],
    "remarks": "Doctor appointment",

    // Leave Balance Impact
    "balance_before": 13.5,
    "balance_after": 7.5,
    "balance_remaining": 7.5,

    // Leave Breakdown
    "leave_details": [
      {
        "date": "2025-11-15",
        "day_of_week": "Monday",
        "day_type": "full_day",
        "duration": 1.0,
        "is_holiday": false,
        "is_weekly_off": false
      },
      {
        "date": "2025-11-16",
        "day_of_week": "Tuesday",
        "day_type": "full_day",
        "duration": 1.0,
        "is_holiday": false,
        "is_weekly_off": false
      }
      // ... more dates (total 6 days)
    ],

    // Workflow Information
    "workflow": {
      "id": 101,
      "name": "Leave Approval Workflow",
      "current_stage": 1,
      "current_stage_name": "Manager Approval",
      "total_stages": 2,
      "is_auto_approved": false,
      "current_approvers": [
        {
          "user_id": 45,
          "name": "Jane Manager",
          "email": "jane.manager@company.com",
          "role": "Manager"
        }
      ]
    },

    // Approval History
    "approval_history": [
      {
        "stage": 1,
        "stage_name": "Manager Approval",
        "approver_id": 45,
        "approver_name": "Jane Manager",
        "action": "pending",
        "action_date": null,
        "remarks": null,
        "is_current": true
      },
      {
        "stage": 2,
        "stage_name": "HR Approval",
        "approver_id": null,
        "approver_name": "Pending",
        "action": "pending",
        "action_date": null,
        "remarks": null,
        "is_current": false
      }
    ],

    // Admin Actions Available
    "admin_actions": {
      "can_approve": true,
      "can_reject": true,
      "can_withdraw": true,
      "can_edit": false,
      "can_delete": false,
      "override_workflow": true
    },

    // Audit Trail
    "audit_trail": [
      {
        "action": "created",
        "performed_by": "John Doe",
        "timestamp": "2025-11-13T10:30:00.000Z",
        "details": "Request submitted"
      }
      // ... more audit entries
    ]
  }
}
```

**Details Page Layout:**

```
+------------------------------------------------------------------+
| Request Details                       [Approve] [Reject] [···]   |
+------------------------------------------------------------------+
| REQ248 - Leave Request                          Status: Pending  |
+------------------------------------------------------------------+
| Employee Information                                             |
| Name:        John Doe (EMP123)                                   |
| Department:  IT Department                                       |
| Designation: Software Engineer                                   |
| Manager:     Jane Manager                                        |
| Email:       john.doe@company.com                                |
| Phone:       9876543210                                          |
+------------------------------------------------------------------+
| Request Details                                                  |
| Applied:     13 Nov 2025, 10:30 AM                              |
| Applied By:  Employee (Self)                                     |
| Leave Type:  Casual Leave (CL)                                   |
| From Date:   15 November 2025                                    |
| To Date:     20 November 2025                                    |
| Duration:    6.0 days (Full Day)                                 |
| Reason:      Personal work                                       |
| Contact:     9876543210                                          |
| Address:     Home address                                        |
| Attachments: 📎 medical_certificate.pdf (View/Download)          |
| Remarks:     Doctor appointment                                  |
+------------------------------------------------------------------+
| Leave Balance Impact                                             |
| Balance Before:  13.5 days                                       |
| Request Amount:  6.0 days                                        |
| Balance After:   7.5 days                                        |
+------------------------------------------------------------------+
| Leave Breakdown                                                  |
| Date        | Day       | Type      | Duration | Holiday/WO      |
|-------------|-----------|-----------|----------|-----------------|
| 15 Nov 2025 | Monday    | Full Day  | 1.0 day  | Working Day     |
| 16 Nov 2025 | Tuesday   | Full Day  | 1.0 day  | Working Day     |
| 17 Nov 2025 | Wednesday | Full Day  | 1.0 day  | Working Day     |
| 18 Nov 2025 | Thursday  | Full Day  | 1.0 day  | Working Day     |
| 19 Nov 2025 | Friday    | Full Day  | 1.0 day  | Working Day     |
| 20 Nov 2025 | Saturday  | Full Day  | 1.0 day  | Working Day     |
|                                      Total: 6.0 days             |
+------------------------------------------------------------------+
| Workflow Progress: Leave Approval Workflow                       |
| ━━━━━━━━━━●━━━━━━━━━━                                            |
| Stage 1/2                                                        |
+------------------------------------------------------------------+
| ✅ Stage 0: Request Submitted                                    |
|    By: John Doe                                                  |
|    On: 13 Nov 2025, 10:30 AM                                     |
+------------------------------------------------------------------+
| ⏳ Stage 1: Manager Approval (Current)                           |
|    Pending with: Jane Manager                                    |
|    Waiting for approval...                                       |
+------------------------------------------------------------------+
| ⏸️ Stage 2: HR Approval                                          |
|    Pending                                                       |
+------------------------------------------------------------------+
| Admin Override Available                                         |
| You can approve/reject this request directly, bypassing          |
| the workflow.                                                    |
+------------------------------------------------------------------+
| Audit Trail                                                      |
| 13 Nov 2025, 10:30 AM - Request created by John Doe              |
+------------------------------------------------------------------+
```

---

## 3.2 Admin Action on Request

```javascript
POST /api/attendance/admin/requests/:requestId/action

Request Body:
{
  "action": "approve",        // Required: "approve" or "reject"
  "remarks": "Approved by admin as manager is on leave"  // Optional for approve, required for reject
}

Response (Approve):
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "request_id": 248,
    "request_number": "REQ248",
    "previous_status": "pending",
    "new_status": "approved",
    "approved_by": "Admin User",
    "approved_by_id": 1,
    "approved_date": "2025-11-13T11:00:00.000Z",
    "remarks": "Approved by admin as manager is on leave",
    "workflow_bypassed": true,
    "notification_sent": true,
    "notification_recipients": ["john.doe@company.com", "jane.manager@company.com"]
  }
}

Response (Reject):
{
  "success": true,
  "message": "Request rejected successfully",
  "data": {
    "request_id": 248,
    "request_number": "REQ248",
    "previous_status": "pending",
    "new_status": "rejected",
    "rejected_by": "Admin User",
    "rejected_by_id": 1,
    "rejected_date": "2025-11-13T11:00:00.000Z",
    "remarks": "Insufficient coverage during requested dates",
    "workflow_bypassed": true,
    "notification_sent": true,
    "leave_balance_restored": true
  }
}
```

**Action Modal (Approve):**

```
+--------------------------------------------------+
| Approve Request                              [X] |
+--------------------------------------------------+
| Are you sure you want to approve this request?   |
|                                                  |
| Request: REQ248 (Leave - 15-20 Nov, 6 days)      |
| Employee: John Doe (EMP123)                      |
|                                                  |
| ⚠️  This will bypass the workflow and directly   |
|     approve the request.                         |
+--------------------------------------------------+
| Remarks (Optional):                              |
| [Textarea: Approved by admin...]                 |
+--------------------------------------------------+
| Notifications will be sent to:                   |
| - Employee (john.doe@company.com)                |
| - Manager (jane.manager@company.com)             |
+--------------------------------------------------+
|                    [Cancel]  [Approve Request]   |
+--------------------------------------------------+
```

**Action Modal (Reject):**

```
+--------------------------------------------------+
| Reject Request                               [X] |
+--------------------------------------------------+
| Are you sure you want to reject this request?    |
|                                                  |
| Request: REQ248 (Leave - 15-20 Nov, 6 days)      |
| Employee: John Doe (EMP123)                      |
|                                                  |
| ⚠️  This action cannot be undone.                |
+--------------------------------------------------+
| Reason for Rejection* (Required):                |
| [Textarea: Insufficient coverage during...]      |
+--------------------------------------------------+
| The following will happen:                       |
| ✓ Leave balance will be restored (6.0 days)      |
| ✓ Employee will be notified                      |
| ✓ Workflow will be terminated                    |
+--------------------------------------------------+
|                    [Cancel]  [Reject Request]    |
+--------------------------------------------------+
```

---

# 4. APPLY ON BEHALF OF EMPLOYEE

**Routes:**
- POST `/api/attendance/admin/leave/apply`
- POST `/api/attendance/admin/onduty/apply`
- POST `/api/attendance/admin/wfh/apply`
- POST `/api/attendance/admin/short-leave/apply`
- POST `/api/attendance/admin/regularization/apply`

## 4.1 Apply Leave on Behalf

```javascript
POST /api/attendance/admin/leave/apply

Request Body:
{
  "target_employee_id": 123,    // Required - Employee ID
  "leave_type": "CL",           // Required
  "from_date": "2025-11-15",    // Required
  "to_date": "2025-11-20",      // Required
  "day_type": "full_day",       // Required
  "reason": "Medical emergency",// Required
  "contact_number": "9876543210",
  "contact_address": "Hospital",
  "attachment_urls": [],
  "remarks": "Applied by admin on behalf",
  "auto_approve": true          // Optional: Admin can choose to auto-approve
}

Response:
{
  "success": true,
  "message": "Leave request submitted successfully on behalf of employee",
  "data": {
    "request_number": "REQ249",
    "request_id": 249,
    "request_status": "approved",  // If auto_approve = true
    "employee_id": 123,
    "employee_name": "John Doe",
    "employee_code": "EMP123",
    "applied_by": "Admin User",
    "applied_by_role": "admin",
    "leave_type": "CL",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20",
    "duration": 6.0,
    "auto_approved": true,
    "notification_sent": true
  }
}
```

**Form Layout:**

```
+------------------------------------------------------------------+
| Apply Leave (Admin - On Behalf)                             [X] |
+------------------------------------------------------------------+
| Select Employee*                                                 |
| [Searchable Dropdown: Type to search employee...]                |
| Selected: John Doe (EMP123) - IT Department                      |
+------------------------------------------------------------------+
| Employee Leave Balance                                           |
| Casual Leave (CL):     7.5 / 12 days available                   |
| Privilege Leave (PL):  10 / 15 days available                    |
| Sick Leave (SL):       8 / 12 days available                     |
+------------------------------------------------------------------+
| Leave Details                                                    |
| Leave Type*        [Dropdown: Casual Leave (CL)]                 |
| Mode*              (•) Date Range  ( ) Specific Dates            |
| From Date*         [Date Picker: 15-Nov-2025]                    |
| To Date*           [Date Picker: 20-Nov-2025]                    |
| Day Type*          [Dropdown: Full Day]                          |
| Duration:          6.0 days (auto-calculated)                    |
+------------------------------------------------------------------+
| Additional Information                                           |
| Reason*            [Textarea: Medical emergency]                 |
| Contact Number     [Text: 9876543210]                            |
| Contact Address    [Textarea: Hospital]                          |
| Attachments        [File Upload]                                 |
| Admin Remarks      [Textarea: Applied by admin on behalf]        |
+------------------------------------------------------------------+
| Admin Options                                                    |
| [✓] Auto-approve this request (bypass workflow)                  |
| [✓] Send notification to employee                                |
| [✓] Send notification to manager                                 |
+------------------------------------------------------------------+
|                    [Cancel]  [Submit Request]                    |
+------------------------------------------------------------------+
```

**Note:** Similar forms for On Duty, WFH, Short Leave, and Regularization with respective fields.

---

## 4.2 Get Employee Leave Balance (Admin)

```javascript
GET /api/attendance/admin/leave/balance/:employee_id

Response:
{
  "success": true,
  "data": {
    "employee_id": 123,
    "employee_name": "John Doe",
    "employee_code": "EMP123",
    "department": "IT Department",
    "joining_date": "2023-01-15",
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Casual Leave",
        "leave_type_code": "CL",
        "opening_balance": 12.0,
        "credited": 12.0,
        "consumed": 4.5,
        "pending": 0,
        "available": 7.5,
        "expired": 0,
        "carried_forward": 0,
        "encashed": 0,
        "policy_details": {
          "max_carry_forward": 5,
          "encashment_allowed": false,
          "max_consecutive_days": 10
        }
      }
      // ... more leave types
    ],
    "leave_history_summary": {
      "total_leaves_taken_this_year": 4.5,
      "average_leaves_per_month": 0.4,
      "last_leave_date": "2025-10-15"
    }
  }
}
```

---

# 5. BULK OPERATIONS

## 5.1 Bulk Approve

```javascript
POST /api/attendance/admin/requests/bulk-approve

Request Body:
{
  "request_ids": [248, 249, 250, 251],  // Array of request IDs
  "remarks": "Bulk approved by admin"   // Optional
}

Response:
{
  "success": true,
  "message": "4 requests approved successfully",
  "data": {
    "total_requests": 4,
    "approved_count": 4,
    "failed_count": 0,
    "results": [
      {
        "request_id": 248,
        "request_number": "REQ248",
        "status": "success",
        "message": "Approved successfully"
      },
      {
        "request_id": 249,
        "request_number": "REQ249",
        "status": "success",
        "message": "Approved successfully"
      },
      {
        "request_id": 250,
        "request_number": "REQ250",
        "status": "success",
        "message": "Approved successfully"
      },
      {
        "request_id": 251,
        "request_number": "REQ251",
        "status": "success",
        "message": "Approved successfully"
      }
    ],
    "failed_requests": []
  }
}

Response (With Failures):
{
  "success": true,
  "message": "3 of 4 requests approved successfully, 1 failed",
  "data": {
    "total_requests": 4,
    "approved_count": 3,
    "failed_count": 1,
    "results": [
      // ... successful approvals
    ],
    "failed_requests": [
      {
        "request_id": 251,
        "request_number": "REQ251",
        "status": "failed",
        "reason": "Request already approved",
        "message": "Cannot approve already approved request"
      }
    ]
  }
}
```

**Bulk Approve Modal:**

```
+--------------------------------------------------+
| Bulk Approve Requests                        [X] |
+--------------------------------------------------+
| You are about to approve 4 requests:             |
|                                                  |
| ✓ REQ248 - John Doe - Leave (6 days)             |
| ✓ REQ249 - Jane Smith - WFH (1 day)              |
| ✓ REQ250 - Bob Johnson - On Duty (1 day)         |
| ✓ REQ251 - Alice Brown - Leave (3 days)          |
|                                                  |
| ⚠️  This will bypass workflows for all requests. |
+--------------------------------------------------+
| Remarks (Optional):                              |
| [Textarea: Bulk approved by admin]               |
+--------------------------------------------------+
| [✓] Send notifications to all affected employees |
+--------------------------------------------------+
|                    [Cancel]  [Approve All (4)]   |
+--------------------------------------------------+
```

---

## 5.2 Bulk Reject

```javascript
POST /api/attendance/admin/requests/bulk-reject

Request Body:
{
  "request_ids": [252, 253, 254],
  "remarks": "Insufficient staffing during requested period"  // Required
}

Response:
{
  "success": true,
  "message": "3 requests rejected successfully",
  "data": {
    "total_requests": 3,
    "rejected_count": 3,
    "failed_count": 0,
    "results": [
      {
        "request_id": 252,
        "request_number": "REQ252",
        "status": "success",
        "message": "Rejected successfully",
        "balance_restored": 5.0
      }
      // ... more results
    ],
    "total_balance_restored": 9.0
  }
}
```

**Bulk Reject Modal:**

```
+--------------------------------------------------+
| Bulk Reject Requests                         [X] |
+--------------------------------------------------+
| You are about to reject 3 requests:              |
|                                                  |
| ✗ REQ252 - John Doe - Leave (5 days)             |
| ✗ REQ253 - Jane Smith - Leave (2 days)           |
| ✗ REQ254 - Bob Johnson - Leave (2 days)          |
|                                                  |
| ⚠️  This action cannot be undone.                |
|     Leave balances will be restored.             |
+--------------------------------------------------+
| Reason for Rejection* (Required):                |
| [Textarea: Insufficient staffing during...]      |
+--------------------------------------------------+
| [✓] Send notifications to all affected employees |
+--------------------------------------------------+
|                    [Cancel]  [Reject All (3)]    |
+--------------------------------------------------+
```

---

# 6. REPORTS & ANALYTICS

## 6.1 Attendance Reports Page

**Route:** `/admin/attendance/reports`

**Page Layout:**

```
+------------------------------------------------------------------+
| Attendance Reports & Analytics                                   |
+------------------------------------------------------------------+
| Report Type                                                      |
| ( ) Summary Report  (•) Detailed Report  ( ) Custom Report       |
+------------------------------------------------------------------+
| Filters                                                          |
| Report Period: [This Month ▼]                                    |
| From Date: [01-Nov-2025]  To Date: [30-Nov-2025]                 |
| Department: [All ▼]  Employee: [All ▼]                           |
| Request Type: [All ▼]  Status: [All ▼]                           |
+------------------------------------------------------------------+
| [Generate Report] [Export Excel] [Export PDF] [Schedule Email]  |
+------------------------------------------------------------------+
| Report Preview                                                   |
| +--------------------------------------------------------------+ |
| | Summary Statistics                                           | |
| | Total Requests: 248                                          | |
| | Approved: 198 (79.8%)                                        | |
| | Rejected: 15 (6.0%)                                          | |
| | Pending: 35 (14.1%)                                          | |
| +--------------------------------------------------------------+ |
| | Breakdown by Type                      [📊 View Chart]       | |
| | Leave:        120 (48%)                                      | |
| | On Duty:      45 (18%)                                       | |
| | WFH:          58 (23%)                                       | |
| | Short Leave:  18 (7%)                                        | |
| | Regular.:     7 (3%)                                         | |
| +--------------------------------------------------------------+ |
| | Top Requesters                                               | |
| | 1. John Doe (15 requests)                                    | |
| | 2. Jane Smith (12 requests)                                  | |
| | 3. Bob Johnson (10 requests)                                 | |
| +--------------------------------------------------------------+ |
| | Department-wise Summary                 [📊 View Chart]      | |
| | IT:       85 requests                                        | |
| | HR:       52 requests                                        | |
| | Sales:    68 requests                                        | |
| | Finance:  43 requests                                        | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Export Options:**
- Excel: Detailed data with all fields
- PDF: Formatted report with charts
- CSV: Raw data for analysis
- Schedule: Email report daily/weekly/monthly

---

# 7. ADVANCED FEATURES

## 7.1 Advanced Filtering

**Filter Options:**
- Request Type: Multiple selection
- Status: Multiple selection
- Department: Hierarchical selection
- Date Range: Predefined (Today, This Week, This Month) or Custom
- Employee: Search and select multiple
- Manager: Filter by reporting manager
- Leave Type: For leave requests
- Applied By: Employee/Manager/Admin
- Duration: Range (e.g., > 5 days)
- Has Attachments: Yes/No
- Workflow Status: Pending, In Progress, Completed
- Approval Stage: Specific stage in workflow

---

## 7.2 Calendar View (Admin)

**Route:** `/admin/attendance/calendar`

**Features:**
- View all employees' attendance in calendar format
- Color-coded by request type
- Filter by department/team
- Click to see details
- Export calendar view

```
+------------------------------------------------------------------+
| Team Attendance Calendar                          [< Nov 2025 >] |
+------------------------------------------------------------------+
| Department: [IT ▼]  Show: [All Request Types ▼]                 |
+------------------------------------------------------------------+
|           | Mon | Tue | Wed | Thu | Fri | Sat | Sun             |
|-----------|-----|-----|-----|-----|-----|-----|-----|           |
| John Doe  |  P  |  P  |  L  |  L  |  L  | WFH |  -  |           |
| Jane S.   | WFH | WFH |  P  |  P  |  P  |  P  |  -  |           |
| Bob J.    |  P  | OD  | OD  |  P  |  P  |  P  |  -  |           |
| Alice B.  |  P  |  P  |  P  | SL  |  P  |  P  |  -  |           |
+------------------------------------------------------------------+
| Legend:                                                          |
| P = Present   L = Leave   WFH = Work From Home   OD = On Duty    |
| SL = Short Leave   A = Absent   H = Holiday   - = Weekly Off     |
+------------------------------------------------------------------+
```

---

## 7.3 Audit Trail

**View Complete History:**
- Who applied the request
- All approval/rejection actions
- Modifications made
- Admin overrides
- Notifications sent
- Timestamps for all actions

---

## 7.4 Notifications & Alerts

**Admin Notifications:**
- New requests requiring attention
- Pending requests exceeding X days
- Unusual patterns (e.g., too many requests from one employee)
- Balance going negative
- System alerts

---

## 7.5 Settings & Configuration

**Admin Settings:**
- Auto-approval rules
- Notification templates
- Leave policies
- Workflow assignments
- Request limits and validations
- Attachment requirements

---

# 8. UI/UX GUIDELINES

## 8.1 Color Coding

**Status Colors:**
- Pending: Orange/Yellow (#FFA500)
- Approved: Green (#28A745)
- Rejected: Red (#DC3545)
- Withdrawn: Gray (#6C757D)

**Request Type Colors:**
- Leave: Blue (#007BFF)
- On Duty: Purple (#6F42C1)
- WFH: Teal (#20C997)
- Short Leave: Cyan (#17A2B8)
- Regularization: Indigo (#6610F2)

---

## 8.2 Icons

- Leave: 🏖️
- On Duty: 💼
- WFH: 🏠
- Short Leave: ⏰
- Regularization: 🔄
- Pending: ⏳
- Approved: ✅
- Rejected: ❌
- Withdrawn: ↩️

---

## 8.3 Responsive Design

**Desktop (> 1024px):**
- Full table with all columns
- Side-by-side filters
- Multi-panel layout

**Tablet (768px - 1024px):**
- Condensed table
- Stacked filters
- Collapsible panels

**Mobile (< 768px):**
- Card-based layout
- Bottom sheet filters
- Single column view

---

# 9. TESTING CHECKLIST

## Admin Portal Testing

### Dashboard
- [ ] View dashboard statistics
- [ ] Filter by date range
- [ ] View recent activity
- [ ] Quick actions work correctly

### All Requests
- [ ] View all requests with pagination
- [ ] Filter by all available criteria
- [ ] Search by request number/employee
- [ ] Sort by different columns
- [ ] Select multiple requests
- [ ] View request details

### Actions
- [ ] Approve single request
- [ ] Reject single request
- [ ] Bulk approve multiple requests
- [ ] Bulk reject multiple requests
- [ ] Validate error handling for failed actions

### Apply on Behalf
- [ ] Apply leave on behalf
- [ ] Apply on duty on behalf
- [ ] Apply WFH on behalf
- [ ] Apply short leave on behalf
- [ ] Apply regularization on behalf
- [ ] Auto-approve option works
- [ ] Check employee balance before applying

### Reports
- [ ] Generate summary report
- [ ] Generate detailed report
- [ ] Export to Excel
- [ ] Export to PDF
- [ ] Schedule email reports

### Advanced Features
- [ ] Calendar view loads correctly
- [ ] Advanced filters work
- [ ] Audit trail displays all actions
- [ ] Notifications sent correctly

---

# 10. SECURITY & PERMISSIONS

## Access Control

1. **Admin-Only Access:**
   - All admin routes require admin role
   - Verify admin permissions on every request
   - Log all admin actions

2. **Data Visibility:**
   - Admin can see all employees' data
   - Respect data privacy regulations
   - Mask sensitive information where necessary

3. **Action Permissions:**
   - Approve/Reject: Admin only
   - Bulk operations: Admin only
   - Override workflow: Admin only with audit trail
   - Apply on behalf: Admin/Manager with proper authorization

---

# 11. PERFORMANCE OPTIMIZATION

1. **Pagination:** Load 50 requests per page
2. **Lazy Loading:** Load additional data on scroll
3. **Caching:** Cache dashboard statistics for 5 minutes
4. **Indexing:** Database indexes on commonly filtered fields
5. **Debouncing:** Debounce search inputs (300ms)

---

# 12. ERROR HANDLING

**Common Admin Errors:**

```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Cannot approve already approved request"
}

// 403 Forbidden
{
  "success": false,
  "message": "Admin access required"
}

// 404 Not Found
{
  "success": false,
  "message": "Request not found or deleted"
}

// 409 Conflict
{
  "success": false,
  "message": "Insufficient leave balance for employee"
}

// 422 Unprocessable Entity
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "target_employee_id": "Employee ID is required",
    "from_date": "From date cannot be in the past"
  }
}
```

---

## Support & Documentation

For backend API details, refer to:
- Routes: `src/routes/attendanceRequest.routes.js`
- Admin Controller: `src/controllers/admin/adminAttendanceRequest.controller.js`
- Manager Controller: `src/controllers/manager/managerAttendanceRequest.controller.js`
- Calendar Controller: `src/controllers/employee/attendanceCalendar.controller.js`
