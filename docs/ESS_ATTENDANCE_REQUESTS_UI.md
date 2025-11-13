# ESS Attendance Requests UI Documentation
## Employee Self Service & Manager Portal

---

## Overview
This document describes the UI implementation for the Attendance Request module on the ESS (Employee Self Service) side. This includes:
- **Employee Portal**: Apply and manage own attendance requests
- **Manager Portal**: View team requests, apply on behalf of employees

---

## Table of Contents
1. [Employee Portal](#1-employee-portal)
2. [Manager Portal](#2-manager-portal)
3. [Shared Components](#3-shared-components)
4. [Common Features](#4-common-features)

---

# 1. EMPLOYEE PORTAL

## 1.1 Dashboard / Landing Page

**Route:** `/ess/attendance`

### Page Layout

```
+------------------------------------------------------------------+
| Attendance Requests                                    [+ Apply] |
+------------------------------------------------------------------+
| Quick Stats Cards                                                |
| +-------------+ +-------------+ +-------------+ +-------------+  |
| | Pending: 3  | | Approved: 5 | | Rejected: 1 | | Balance     | |
| | 📋          | | ✅          | | ❌          | | 🏖️ 12 days | |
| +-------------+ +-------------+ +-------------+ +-------------+  |
+------------------------------------------------------------------+
| Attendance Calendar - Current Month                              |
| [< November 2025 >]                                  [Summary]   |
|                                                                   |
| Mon  Tue  Wed  Thu  Fri  Sat  Sun                                |
|  1P   2P   3A   4A   5WFH  6    7                                |
|  8P   9A  10A  11L  12L   13   14                                |
| ...                                                               |
|                                                                   |
| Legend: P=Present, A=Absent, L=Leave, WFH=Work From Home,        |
|         OD=On Duty, SL=Short Leave, R=Regularization Pending     |
+------------------------------------------------------------------+
| My Recent Requests                          [View All Requests]  |
| +--------------------------------------------------------------+ |
| | REQ001 | Leave       | 15-20 Nov | Pending   | [View] [···] | |
| | REQ002 | WFH         | 22 Nov    | Approved  | [View]       | |
| | REQ003 | On Duty     | 25 Nov    | Rejected  | [View]       | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### API Calls for Dashboard

```javascript
// 1. Get Attendance Calendar
POST /api/attendance/calendar
Request: {
  // Empty for employee's own calendar
  // Or specify date range
  "from_date": "2025-11-01",  // Optional
  "to_date": "2025-11-30"     // Optional
}

Response: {
  "success": true,
  "data": {
    "calendar": [
      {
        "date": "2025-11-01",
        "day_of_week": "Monday",
        "shift_name": "General Shift",
        "shift_timing": "09:00 - 18:00",
        "punch_in": "09:05:00",
        "punch_out": "18:10:00",
        "working_hours": "08:05:00",
        "status": "P",  // P, A, L, WFH, OD, SL, H, WO
        "status_label": "Present",
        "leave_type": null,
        "leave_duration": null,
        "is_holiday": false,
        "holiday_name": null,
        "is_weekly_off": false
      }
      // ... more dates
    ],
    "from_date": "2025-11-01",
    "to_date": "2025-11-30"
  }
}

// 2. Get Attendance Summary
POST /api/attendance/calendar/summary
Request: {
  "from_date": "2025-11-01",
  "to_date": "2025-11-30"
}

Response: {
  "success": true,
  "data": {
    "present_days": 20,
    "absent_days": 2,
    "leave_days": 3,
    "wfh_days": 2,
    "on_duty_days": 1,
    "short_leave_days": 1,
    "holiday_days": 4,
    "weekly_off_days": 8,
    "total_working_days": 22,
    "total_worked_days": 23
  }
}

// 3. Get Leave Balance
GET /api/attendance/employee/leave/balance

Response: {
  "success": true,
  "data": {
    "employee_id": 123,
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Casual Leave",
        "leave_type_code": "CL",
        "opening_balance": 12.0,
        "credited": 12.0,
        "consumed": 3.5,
        "pending": 1.0,
        "available": 7.5,
        "expired": 0,
        "carried_forward": 0,
        "encashed": 0
      }
      // ... more leave types
    ]
  }
}

// 4. Get My Recent Requests
GET /api/attendance/employee/requests/my-requests?limit=5

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "request_number": "REQ001",
      "request_type": "leave",
      "request_status": "pending",
      "applied_date": "2025-11-13",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "duration": 6.0,
      "leave_type": "Casual Leave",
      "reason": "Personal work"
    }
    // ... more requests
  ],
  "count": 5,
  "total": 25
}
```

---

## 1.2 Apply Request Modal/Page

**Trigger:** Click "+ Apply" button
**Options:** Leave, On Duty, WFH, Short Leave, Regularization

### 1.2.1 Apply Leave

**Route:** `/ess/attendance/apply/leave`

```javascript
POST /api/attendance/employee/leave/apply

Request Body (Date Range Mode):
{
  "leave_type": "CL",           // Required: Leave type code
  "from_date": "2025-11-15",    // Required: Start date (YYYY-MM-DD)
  "to_date": "2025-11-20",      // Required: End date
  "day_type": "full_day",       // Required: full_day, first_half, second_half
  "reason": "Personal work",    // Required: Reason for leave
  "contact_number": "9876543210", // Optional: Contact during leave
  "contact_address": "Home",    // Optional: Address during leave
  "attachment_urls": [],        // Optional: Supporting documents
  "remarks": ""                 // Optional: Additional remarks
}

Request Body (Specific Dates Mode):
{
  "leave_type": "CL",
  "specific_dates": [           // Array of specific dates (non-continuous)
    {
      "date": "2025-11-15",
      "day_type": "full_day"
    },
    {
      "date": "2025-11-18",
      "day_type": "first_half"
    },
    {
      "date": "2025-11-22",
      "day_type": "full_day"
    }
  ],
  "reason": "Personal work",
  "contact_number": "9876543210",
  "contact_address": "Home",
  "attachment_urls": [],
  "remarks": ""
}

Response:
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "REQ001",
    "request_id": 1,
    "request_status": "pending",
    "leave_type": "CL",
    "leave_mode": "date_range",  // or "specific_dates"
    "dates": ["2025-11-15", "2025-11-16", "2025-11-17", "2025-11-18", "2025-11-19", "2025-11-20"],
    "duration": 6.0
  }
}
```

**Form Fields:**

```
+--------------------------------------------------+
| Apply Leave                                  [X] |
+--------------------------------------------------+
| Leave Type*        [Dropdown: CL, PL, SL, etc.]  |
| Leave Mode*        ( ) Date Range                |
|                    (•) Specific Dates             |
+--------------------------------------------------+
| --- If Date Range Mode ---                       |
| From Date*         [Date Picker: 15-Nov-2025]    |
| To Date*           [Date Picker: 20-Nov-2025]    |
| Day Type*          [Dropdown: Full Day]          |
|                                                   |
| --- If Specific Dates Mode ---                   |
| Dates*             [+ Add Date]                  |
|   15-Nov-2025      [Full Day ▼]      [Remove]    |
|   18-Nov-2025      [First Half ▼]    [Remove]    |
|   22-Nov-2025      [Full Day ▼]      [Remove]    |
+--------------------------------------------------+
| Duration: 6 days (calculated automatically)      |
| Available Balance: 7.5 days                      |
+--------------------------------------------------+
| Reason*            [Textarea]                    |
| Contact Number     [Text: 9876543210]            |
| Contact Address    [Textarea]                    |
| Attachments        [File Upload - Max 5MB]       |
|                    📎 medical_cert.pdf  [x]      |
| Additional Remarks [Textarea]                    |
+--------------------------------------------------+
|                    [Cancel]  [Submit Request]    |
+--------------------------------------------------+
```

**Validation Rules:**
- Leave Type: Required
- From Date / To Date: Required, To Date >= From Date
- Specific Dates: At least 1 date required
- Day Type: Required
- Reason: Required, min 10 characters
- Check available balance before submission
- Validate date overlaps with existing requests

---

### 1.2.2 Apply On Duty

```javascript
POST /api/attendance/employee/onduty/apply

Request Body (Date Range Mode):
{
  "from_date": "2025-11-15",
  "to_date": "2025-11-15",
  "from_time": "09:00",         // HH:MM format
  "to_time": "18:00",           // HH:MM format
  "purpose": "Client meeting",
  "location": "Client Office, Mumbai",
  "transport_mode": "car",      // car, bike, public_transport, flight, train
  "contact_number": "9876543210",
  "attachment_urls": [],
  "remarks": ""
}

Request Body (Specific Dates Mode):
{
  "specific_dates": [
    {
      "date": "2025-11-15",
      "from_time": "09:00",
      "to_time": "18:00"
    },
    {
      "date": "2025-11-18",
      "from_time": "10:00",
      "to_time": "16:00"
    }
  ],
  "purpose": "Client meetings",
  "location": "Various client locations",
  "transport_mode": "car",
  "contact_number": "9876543210",
  "attachment_urls": [],
  "remarks": ""
}

Response:
{
  "success": true,
  "message": "On Duty request submitted successfully",
  "data": {
    "request_number": "OD001",
    "request_id": 2,
    "request_status": "pending",
    "on_duty_mode": "date_range",
    "dates": ["2025-11-15"],
    "duration": 1
  }
}
```

**Form Fields:**

```
+--------------------------------------------------+
| Apply On Duty                                [X] |
+--------------------------------------------------+
| Mode*              ( ) Date Range                |
|                    (•) Specific Dates             |
+--------------------------------------------------+
| --- If Date Range Mode ---                       |
| From Date*         [Date Picker: 15-Nov-2025]    |
| To Date*           [Date Picker: 15-Nov-2025]    |
| Time*              [09:00] to [18:00]            |
|                                                   |
| --- If Specific Dates Mode ---                   |
| Dates*             [+ Add Date]                  |
|   15-Nov-2025      [09:00] to [18:00]  [Remove]  |
|   18-Nov-2025      [10:00] to [16:00]  [Remove]  |
+--------------------------------------------------+
| Purpose*           [Text: Client meeting]        |
| Location*          [Text: Client Office, Mumbai] |
| Transport Mode*    [Dropdown: Car]               |
| Contact Number*    [Text: 9876543210]            |
| Attachments        [File Upload]                 |
| Remarks            [Textarea]                    |
+--------------------------------------------------+
|                    [Cancel]  [Submit Request]    |
+--------------------------------------------------+
```

---

### 1.2.3 Apply Work From Home (WFH)

```javascript
POST /api/attendance/employee/wfh/apply

Request Body (Date Range Mode):
{
  "from_date": "2025-11-15",
  "to_date": "2025-11-17",
  "day_type": "full_day",       // full_day, first_half, second_half
  "reason": "Remote work",
  "work_plan": "Complete documentation and code review",
  "contact_number": "9876543210",
  "attachment_urls": [],
  "remarks": ""
}

Request Body (Specific Dates Mode):
{
  "specific_dates": [
    {
      "date": "2025-11-15",
      "day_type": "full_day"
    },
    {
      "date": "2025-11-18",
      "day_type": "first_half"
    }
  ],
  "reason": "Remote work",
  "work_plan": "Complete tasks",
  "contact_number": "9876543210",
  "attachment_urls": [],
  "remarks": ""
}

Response:
{
  "success": true,
  "message": "WFH request submitted successfully",
  "data": {
    "request_number": "WFH001",
    "request_id": 3,
    "request_status": "pending",
    "wfh_mode": "date_range",
    "dates": ["2025-11-15", "2025-11-16", "2025-11-17"],
    "duration": 3.0
  }
}
```

**Form Layout:** Similar to Leave with additional "Work Plan" field

---

### 1.2.4 Apply Short Leave

```javascript
POST /api/attendance/employee/short-leave/apply

Request Body:
{
  "leave_date": "2025-11-15",   // Single date only
  "from_time": "10:00",         // HH:MM format
  "to_time": "12:00",           // HH:MM format
  "reason": "Personal errand",
  "contact_number": "9876543210",
  "remarks": ""
}

Response:
{
  "success": true,
  "message": "Short Leave request submitted successfully",
  "data": {
    "request_number": "SL001",
    "request_id": 4,
    "request_status": "pending",
    "leave_date": "2025-11-15",
    "from_time": "10:00",
    "to_time": "12:00",
    "duration_minutes": 120
  }
}
```

**Form Fields:**

```
+--------------------------------------------------+
| Apply Short Leave                            [X] |
+--------------------------------------------------+
| Date*              [Date Picker: 15-Nov-2025]    |
| Time*              [10:00] to [12:00]            |
| Duration:          2 hours (auto-calculated)     |
+--------------------------------------------------+
| Reason*            [Textarea]                    |
| Contact Number*    [Text: 9876543210]            |
| Remarks            [Textarea]                    |
+--------------------------------------------------+
|                    [Cancel]  [Submit Request]    |
+--------------------------------------------------+
```

---

### 1.2.5 Apply Regularization

```javascript
POST /api/attendance/employee/regularization/apply

Request Body:
{
  "attendance_date": "2025-11-10",
  "regularization_type": "forgot_punch_in", // forgot_punch_in, forgot_punch_out, both, wrong_punch
  "punch_in": "09:00",          // Required if regularization_type includes punch_in
  "punch_out": "18:00",         // Required if regularization_type includes punch_out
  "reason": "Forgot to punch in",
  "attachment_urls": [],
  "remarks": ""
}

Response:
{
  "success": true,
  "message": "Regularization request submitted successfully",
  "data": {
    "request_number": "REG001",
    "request_id": 5,
    "request_status": "pending",
    "attendance_date": "2025-11-10",
    "regularization_type": "forgot_punch_in",
    "punch_in": "09:00",
    "punch_out": "18:00"
  }
}
```

**Form Fields:**

```
+--------------------------------------------------+
| Apply Regularization                         [X] |
+--------------------------------------------------+
| Attendance Date*   [Date Picker: 10-Nov-2025]    |
| Type*              [Dropdown]                    |
|   - Forgot Punch In                              |
|   - Forgot Punch Out                             |
|   - Both (In & Out)                              |
|   - Wrong Punch                                  |
+--------------------------------------------------+
| Current Status (from system):                    |
|   Punch In:  -- (Missing)                        |
|   Punch Out: 18:05                               |
+--------------------------------------------------+
| Requested Punch In*   [Time: 09:00]              |
| Requested Punch Out*  [Time: 18:00]              |
+--------------------------------------------------+
| Reason*            [Textarea]                    |
| Attachments        [File Upload]                 |
| Remarks            [Textarea]                    |
+--------------------------------------------------+
|                    [Cancel]  [Submit Request]    |
+--------------------------------------------------+
```

---

## 1.3 My Requests Page

**Route:** `/ess/attendance/my-requests`

```javascript
GET /api/attendance/employee/requests/my-requests

Query Parameters:
- type: leave, onduty, wfh, regularization, short-leave (optional)
- status: pending, approved, rejected, withdrawn (optional)
- from_date: YYYY-MM-DD (optional)
- to_date: YYYY-MM-DD (optional)
- limit: number (default: 20)
- offset: number (default: 0)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "request_number": "REQ001",
      "request_type": "leave",
      "request_status": "pending",
      "applied_date": "2025-11-13T10:30:00.000Z",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "duration": 6.0,
      "leave_type": "Casual Leave",
      "reason": "Personal work",
      "workflow_status": "Pending with Manager",
      "current_approver": "John Doe (Manager)"
    },
    {
      "id": 2,
      "request_number": "OD001",
      "request_type": "onduty",
      "request_status": "approved",
      "applied_date": "2025-11-12T09:00:00.000Z",
      "from_date": "2025-11-14",
      "to_date": "2025-11-14",
      "duration": 1,
      "purpose": "Client meeting",
      "location": "Mumbai",
      "workflow_status": "Approved",
      "approved_by": "Jane Smith",
      "approved_date": "2025-11-12T14:30:00.000Z"
    }
    // ... more requests
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45,
    "has_more": true
  }
}
```

**Page Layout:**

```
+------------------------------------------------------------------+
| My Requests                                          [+ Apply]   |
+------------------------------------------------------------------+
| Filters:                                                         |
| Type: [All ▼]  Status: [All ▼]  From: [Date] To: [Date] [Apply] |
+------------------------------------------------------------------+
| REQ#    | Type    | Dates       | Duration | Status   | Actions |
+---------|---------|-------------|----------|----------|---------|
| REQ001  | Leave   | 15-20 Nov   | 6 days   | Pending  | [View]  |
|         | CL      |             |          | 📋       | [···]   |
+---------|---------|-------------|----------|----------|---------|
| OD001   | On Duty | 14 Nov      | 1 day    | Approved | [View]  |
|         |         | Mumbai      |          | ✅       |         |
+---------|---------|-------------|----------|----------|---------|
| WFH001  | WFH     | 10-12 Nov   | 3 days   | Rejected | [View]  |
|         |         |             |          | ❌       |         |
+---------|---------|-------------|----------|----------|---------|
| SL001   | Short   | 08 Nov      | 2 hours  | Approved | [View]  |
|         | Leave   | 10:00-12:00 |          | ✅       |         |
+------------------------------------------------------------------+
| Showing 1-20 of 45 requests                    [< 1 2 3 4 >]    |
+------------------------------------------------------------------+
```

**Actions Menu (···):**
- View Details
- Withdraw (if status = pending)
- Download PDF
- Track Approval Status

---

## 1.4 Request Details Page

**Route:** `/ess/attendance/requests/:requestId`

```javascript
GET /api/attendance/employee/requests/:requestId

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "REQ001",
    "request_type": "leave",
    "request_status": "pending",
    "employee_id": 123,
    "employee_name": "John Doe",
    "employee_code": "EMP123",
    "applied_date": "2025-11-13T10:30:00.000Z",

    // Leave specific fields
    "leave_type_id": 1,
    "leave_type": "Casual Leave",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20",
    "day_type": "full_day",
    "duration": 6.0,
    "reason": "Personal work",
    "contact_number": "9876543210",
    "contact_address": "Home address",
    "attachment_urls": ["https://s3.../medical.pdf"],
    "remarks": "Doctor appointment",

    // Workflow details
    "workflow_id": 101,
    "workflow_name": "Leave Approval Workflow",
    "current_stage": 1,
    "current_stage_name": "Manager Approval",
    "current_approvers": [
      {
        "user_id": 5,
        "user_name": "Jane Smith",
        "role": "Manager"
      }
    ],

    // Approval history
    "approval_history": [
      {
        "stage": 1,
        "stage_name": "Manager Approval",
        "approver": "Jane Smith",
        "action": "pending",
        "action_date": null,
        "remarks": null
      }
    ],

    // Leave details breakdown
    "leave_details": [
      {
        "date": "2025-11-15",
        "day_type": "full_day",
        "duration": 1.0
      },
      {
        "date": "2025-11-16",
        "day_type": "full_day",
        "duration": 1.0
      }
      // ... more dates
    ]
  }
}
```

**Page Layout:**

```
+------------------------------------------------------------------+
| Request Details                         [Withdraw] [Download]    |
+------------------------------------------------------------------+
| Request Number: REQ001                  Status: ⏳ Pending       |
| Type: Leave (Casual Leave)              Applied: 13 Nov 2025     |
+------------------------------------------------------------------+
| Request Information                                              |
| From Date:     15 November 2025                                  |
| To Date:       20 November 2025                                  |
| Duration:      6 days (Full Day)                                 |
| Reason:        Personal work                                     |
| Contact:       9876543210                                        |
| Address:       Home address                                      |
| Attachments:   📎 medical.pdf                                    |
| Remarks:       Doctor appointment                                |
+------------------------------------------------------------------+
| Approval Workflow: Leave Approval Workflow                       |
| Current Stage: Manager Approval                                  |
+------------------------------------------------------------------+
| Stage 1: Manager Approval                          ⏳ Pending    |
|   Approver: Jane Smith (Manager)                                 |
|   Waiting for approval...                                        |
+------------------------------------------------------------------+
| Leave Breakdown                                                  |
| Date           | Day       | Day Type  | Duration               |
|----------------|-----------|-----------|------------------------|
| 15 Nov 2025    | Monday    | Full Day  | 1.0 day                |
| 16 Nov 2025    | Tuesday   | Full Day  | 1.0 day                |
| 17 Nov 2025    | Wednesday | Full Day  | 1.0 day                |
| 18 Nov 2025    | Thursday  | Full Day  | 1.0 day                |
| 19 Nov 2025    | Friday    | Full Day  | 1.0 day                |
| 20 Nov 2025    | Saturday  | Full Day  | 1.0 day                |
|                                         Total: 6.0 days          |
+------------------------------------------------------------------+
```

---

## 1.5 Withdraw Request

```javascript
POST /api/attendance/employee/requests/:requestId/withdraw

Request Body:
{
  "withdrawal_reason": "No longer needed"  // Optional
}

Response:
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": {
    "request_id": 1,
    "request_number": "REQ001",
    "request_status": "withdrawn",
    "withdrawn_date": "2025-11-13T15:00:00.000Z"
  }
}
```

**Confirmation Modal:**

```
+--------------------------------------------------+
| Withdraw Request                             [X] |
+--------------------------------------------------+
| ⚠️  Are you sure you want to withdraw this      |
|     request?                                     |
|                                                  |
| Request: REQ001 (Leave - 15-20 Nov)              |
|                                                  |
| This action cannot be undone.                    |
+--------------------------------------------------+
| Reason (Optional):                               |
| [Textarea: No longer needed]                     |
+--------------------------------------------------+
|                    [Cancel]  [Withdraw Request]  |
+--------------------------------------------------+
```

---

# 2. MANAGER PORTAL

## 2.1 Manager Dashboard

**Route:** `/manager/attendance`

### Page Layout

```
+------------------------------------------------------------------+
| Team Attendance Requests                 [+ Apply on Behalf]     |
+------------------------------------------------------------------+
| Quick Stats                                                      |
| +-------------+ +-------------+ +-------------+ +-------------+  |
| | Pending: 15 | | Today: 3    | | This Week:8 | | Team: 25    | |
| | Action Req  | | Requests    | | Requests    | | Members     | |
| +-------------+ +-------------+ +-------------+ +-------------+  |
+------------------------------------------------------------------+
| Pending Approvals                       [View All Pending (15)]  |
| +--------------------------------------------------------------+ |
| | EMP001 | John Doe    | Leave   | 15-20 Nov | [Approve] [···]| |
| | EMP002 | Jane Smith  | WFH     | 14 Nov    | [Approve] [···]| |
| | EMP003 | Bob Johnson | On Duty | 16 Nov    | [Approve] [···]| |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| Team Calendar View                                [Select Member] |
| Team Member: [All Members ▼]                      [< Nov 2025 >] |
|                                                                   |
| Employee     | 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 ... |
|--------------|---------------------------------------------------|
| John Doe     | P  P  A  A  L  L  -  -  P  P  WFH P  P  P  OD ... |
| Jane Smith   | P  P  P  P  P  -  -  P  P  WFH WFH P  P  P  P ... |
| Bob Johnson  | P  A  P  P  P  -  -  P  P  P  P  P  SL P  P  ... |
+------------------------------------------------------------------+
```

**Note:** Manager portal uses same employee APIs but with additional filter for team members.

---

## 2.2 Apply on Behalf of Employee

**Routes:**
- POST `/api/attendance/manager/leave/apply`
- POST `/api/attendance/manager/onduty/apply`
- POST `/api/attendance/manager/wfh/apply`
- POST `/api/attendance/manager/short-leave/apply`
- POST `/api/attendance/manager/regularization/apply`

**Additional Field:** All requests require `target_employee_id`

```javascript
POST /api/attendance/manager/leave/apply

Request Body:
{
  "target_employee_id": 123,    // Required - Employee ID
  "leave_type": "CL",
  "from_date": "2025-11-15",
  "to_date": "2025-11-20",
  "day_type": "full_day",
  "reason": "Medical emergency",
  // ... same fields as employee apply
}

Response:
{
  "success": true,
  "message": "Leave request submitted successfully on behalf of employee",
  "data": {
    "request_number": "REQ001",
    "request_id": 1,
    "request_status": "pending",
    "employee_id": 123,
    "employee_name": "John Doe",
    "applied_by": "Manager Name",
    // ... rest of response
  }
}
```

**Form Additions:**

```
+--------------------------------------------------+
| Apply Leave (On Behalf)                      [X] |
+--------------------------------------------------+
| Select Employee*   [Dropdown: John Doe - EMP123] |
| Available Balance: 7.5 days                      |
+--------------------------------------------------+
| ... rest of leave form fields ...                |
+--------------------------------------------------+
```

---

## 2.3 Get Employee Leave Balance

```javascript
GET /api/attendance/manager/leave/balance/:employee_id

Response:
{
  "success": true,
  "data": {
    "employee_id": 123,
    "employee_name": "John Doe",
    "employee_code": "EMP123",
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Casual Leave",
        "available": 7.5
        // ... full balance details
      }
      // ... more leave types
    ]
  }
}
```

---

# 3. SHARED COMPONENTS

## 3.1 Attendance Calendar Component

**API:** `POST /api/attendance/calendar`

**Props:**
- `employeeId`: number (optional - defaults to logged-in user)
- `month`: number (1-12)
- `year`: number
- `onDateClick`: function

**Features:**
- Color-coded status (P=green, A=red, L=blue, WFH=purple, etc.)
- Hover tooltip with details
- Click to view day details
- Legend for status codes
- Holiday/Weekly off highlighting

---

## 3.2 Request Status Badge Component

**Props:**
- `status`: 'pending' | 'approved' | 'rejected' | 'withdrawn'

**Visual:**
- Pending: Yellow/Orange badge with ⏳ icon
- Approved: Green badge with ✅ icon
- Rejected: Red badge with ❌ icon
- Withdrawn: Gray badge with ↩️ icon

---

## 3.3 Leave Balance Widget

**API:** `GET /api/attendance/employee/leave/balance`

**Display:**

```
+--------------------------------+
| Leave Balance                  |
+--------------------------------+
| Casual Leave (CL)              |
|   Available: 7.5 / 12 days     |
|   [████████░░░░] 62%           |
+--------------------------------+
| Privilege Leave (PL)           |
|   Available: 10 / 15 days      |
|   [██████████░░] 66%           |
+--------------------------------+
| Sick Leave (SL)                |
|   Available: 8 / 12 days       |
|   [████████████] 66%           |
+--------------------------------+
```

---

# 4. COMMON FEATURES

## 4.1 Filters & Search

**Available on:** My Requests, Team Requests

```
Filters:
- Request Type: All, Leave, On Duty, WFH, Short Leave, Regularization
- Status: All, Pending, Approved, Rejected, Withdrawn
- Date Range: From Date - To Date
- Employee (Manager only): All Team Members, Specific Employee
```

---

## 4.2 Export Features

**Options:**
- Download PDF (Single request)
- Export to Excel (Multiple requests)
- Print Request Details

---

## 4.3 Notifications

**Real-time Updates:**
- Request submitted
- Request approved/rejected
- Request requires action (Manager)
- Balance low warning

---

## 4.4 Validation Messages

**Common Validations:**
- "Insufficient leave balance"
- "Date range overlaps with existing request"
- "Cannot apply for past dates (beyond X days)"
- "Maximum X days can be applied at once"
- "Short leave duration cannot exceed X hours per day"

---

## 4.5 State Management

```javascript
// Example Redux/State structure
{
  attendance: {
    calendar: [],
    summary: {},
    leaveBalance: [],
    myRequests: {
      data: [],
      loading: false,
      error: null,
      pagination: {}
    },
    currentRequest: null,
    filters: {
      type: 'all',
      status: 'all',
      fromDate: null,
      toDate: null
    }
  }
}
```

---

## 4.6 Responsive Design

**Breakpoints:**
- Desktop (>1024px): Full table view
- Tablet (768px-1024px): Condensed table
- Mobile (<768px): Card-based layout

---

## 4.7 Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode support
- Focus indicators on interactive elements

---

## Testing Checklist

### Employee Portal
- [ ] Apply all request types (Leave, On Duty, WFH, Short Leave, Regularization)
- [ ] View attendance calendar
- [ ] Check leave balance
- [ ] View request details
- [ ] Withdraw pending request
- [ ] Filter and search requests
- [ ] Validate date overlaps
- [ ] Check balance validation

### Manager Portal
- [ ] View team requests
- [ ] Apply on behalf of employee
- [ ] Check employee leave balance
- [ ] View team calendar
- [ ] Filter team requests
- [ ] Export team reports

---

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:**
   - Employees can only view/manage own requests
   - Managers can only access their team members
3. **Input Validation:** Validate all dates, times, and text inputs
4. **File Upload:** Validate file types and sizes for attachments

---

## Performance Optimization

1. **Lazy Loading:** Load requests on scroll (pagination)
2. **Caching:** Cache leave balance and calendar data
3. **Debouncing:** Debounce search/filter inputs
4. **Optimistic Updates:** Show immediate feedback on actions

---

## Error Handling

**Common Errors:**
```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Insufficient leave balance"
}

// 403 Forbidden
{
  "success": false,
  "message": "You are not authorized to perform this action"
}

// 404 Not Found
{
  "success": false,
  "message": "Request not found"
}

// 409 Conflict
{
  "success": false,
  "message": "Date range overlaps with existing request"
}
```

---

## Future Enhancements

1. Mobile app support
2. Offline mode with sync
3. Bulk apply for multiple dates
4. Recurring WFH requests
5. Auto-approve based on rules
6. Integration with external calendars
7. SMS/Email notifications
8. Advanced analytics and reports

---

## Support & Documentation

For backend API details, refer to:
- Routes: `src/routes/attendanceRequest.routes.js`
- Employee Controller: `src/controllers/employee/employeeAttendanceRequest.controller.js`
- Manager Controller: `src/controllers/manager/managerAttendanceRequest.controller.js`
- Calendar Controller: `src/controllers/employee/attendanceCalendar.controller.js`
