# ESS Attendance Requests - API Integration Guide

## Overview
This document provides API integration details for connecting the existing ESS Attendance UI with backend APIs. The UI is already created - this guide shows which APIs to call and how to integrate them.

---

## API Base URL
```
/api/attendance
```

## Authentication
All APIs require JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Table of Contents
1. [Employee Portal APIs](#1-employee-portal-apis)
2. [Manager Portal APIs](#2-manager-portal-apis)
3. [Common APIs](#3-common-apis)

---

# 1. EMPLOYEE PORTAL APIs

## 1.1 Dashboard APIs

### Get My Leave Balance
**Endpoint:** `POST /api/attendance/employee/leave/balance`

**UI Integration Point:** Dashboard - Leave Balance Widget

**Request:**
```json
{} // Empty body - uses JWT token for employee_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": 123,
    "balances": [
      {
        "leave_type_id": 1,
        "leave_type_name": "Casual Leave",
        "leave_type_code": "CL",
        "total_allocated": 12,
        "used": 4,
        "pending": 1,
        "available": 7,
        "carry_forward": 0,
        "encashed": 0
      },
      {
        "leave_type_id": 2,
        "leave_type_name": "Sick Leave",
        "leave_type_code": "SL",
        "total_allocated": 10,
        "used": 2,
        "pending": 0,
        "available": 8,
        "carry_forward": 0,
        "encashed": 0
      }
    ]
  }
}
```

---

### Get My Requests (All Types)
**Endpoint:** `POST /api/attendance/employee/requests/my-requests`

**UI Integration Point:** Dashboard - Recent Requests List, My Requests Page

**Request:**
```json
{
  "request_type": 1,           // Optional: 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave
  "status": "pending",         // Optional: pending, approved, rejected, withdrawn
  "from_date": "2025-11-01",   // Optional
  "to_date": "2025-11-30",     // Optional
  "limit": 20,                 // Optional, default: 20
  "offset": 0                  // Optional, default: 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 248,
      "request_number": "REQ248",
      "request_type": "leave",
      "leave_type_name": "Casual Leave",
      "leave_type_code": "CL",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "total_days": 6,
      "leave_mode": "Full Day",
      "reason": "Personal work",
      "request_status": "pending",
      "current_approver_name": "Manager Name",
      "submitted_at": "2025-11-10T10:00:00.000Z",
      "has_attachment": true
    },
    {
      "id": 249,
      "request_number": "REQ249",
      "request_type": "wfh",
      "from_date": "2025-11-22",
      "to_date": "2025-11-22",
      "total_days": 1,
      "reason": "Home setup better for focused work",
      "request_status": "approved",
      "approved_by_name": "Manager Name",
      "approved_at": "2025-11-11T14:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45
  }
}
```

---

### Get Request Details
**Endpoint:** `POST /api/attendance/employee/requests/details`

**UI Integration Point:** Request Details Modal/Page

**Request:**
```json
{
  "request_id": 248
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 248,
    "request_number": "REQ248",
    "request_type": "leave",

    // Leave-specific fields
    "leave_type_id": 1,
    "leave_type_name": "Casual Leave",
    "leave_type_code": "CL",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20",
    "total_days": 6,
    "leave_mode": "Full Day",
    "session": null,
    "reason": "Personal work",

    // Status & Workflow
    "request_status": "pending",
    "overall_status": "in_progress",
    "current_stage_name": "Manager Approval",
    "current_approver_name": "Manager Name",
    "submitted_at": "2025-11-10T10:00:00.000Z",

    // Approval History
    "approval_history": [
      {
        "stage_name": "Manager Approval",
        "action_by_name": "Manager Name",
        "action_type": "pending",
        "action_date": null,
        "remarks": null
      }
    ],

    // Attachments
    "attachments": [
      {
        "id": 1,
        "file_name": "medical_certificate.pdf",
        "file_path": "/uploads/attendance/248/medical_certificate.pdf",
        "uploaded_at": "2025-11-10T10:05:00.000Z"
      }
    ]
  }
}
```

---

## 1.2 Apply Leave Request

### Submit Leave Request
**Endpoint:** `POST /api/attendance/employee/leave/apply`

**UI Integration Point:** Apply Leave Form

**Request:**
```json
{
  "leave_type": "CL",              // Required: Leave type code
  "from_date": "2025-11-15",       // Required: YYYY-MM-DD
  "to_date": "2025-11-20",         // Required: YYYY-MM-DD
  "leave_mode": "Full Day",        // Required: Full Day, Half Day, Short Leave
  "session": null,                 // For Half Day: First Half, Second Half
  "reason": "Personal work",       // Required
  "contact_number": "9876543210",  // Optional
  "contact_address": "Home",       // Optional
  "attachments": []                // Optional: Array of file objects
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "REQ248",
    "request_id": 248,
    "request_status": "pending",
    "total_days": 6,
    "leave_type": "CL",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Insufficient leave balance",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "details": {
      "requested": 6,
      "available": 4,
      "leave_type": "CL"
    }
  }
}
```

---

## 1.3 Apply On Duty Request

### Submit On Duty Request
**Endpoint:** `POST /api/attendance/employee/onduty/apply`

**UI Integration Point:** Apply On Duty Form

**Request:**
```json
{
  "from_date": "2025-11-25",
  "to_date": "2025-11-25",
  "on_duty_mode": "Full Day",      // Full Day, Half Day, Hours
  "session": null,                 // For Half Day: First Half, Second Half
  "from_time": null,               // For Hours mode: HH:MM
  "to_time": null,                 // For Hours mode: HH:MM
  "purpose": "Client meeting",
  "location": "Client Office, Delhi",
  "contact_number": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "On Duty request submitted successfully",
  "data": {
    "request_number": "REQ249",
    "request_id": 249,
    "request_status": "pending",
    "from_date": "2025-11-25",
    "to_date": "2025-11-25",
    "on_duty_mode": "Full Day"
  }
}
```

---

## 1.4 Apply WFH Request

### Submit WFH Request
**Endpoint:** `POST /api/attendance/employee/wfh/apply`

**UI Integration Point:** Apply WFH Form

**Request:**
```json
{
  "from_date": "2025-11-22",
  "to_date": "2025-11-22",
  "wfh_mode": "Full Day",
  "session": null,
  "reason": "Home setup better for focused work",
  "work_plan": "Complete API documentation and code review"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WFH request submitted successfully",
  "data": {
    "request_number": "REQ250",
    "request_id": 250,
    "request_status": "pending"
  }
}
```

---

## 1.5 Apply Short Leave Request

### Submit Short Leave Request
**Endpoint:** `POST /api/attendance/employee/short-leave/apply`

**UI Integration Point:** Apply Short Leave Form

**Request:**
```json
{
  "leave_date": "2025-11-18",
  "from_time": "14:00",
  "to_time": "16:00",
  "duration_hours": 2,
  "reason": "Doctor appointment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Short Leave request submitted successfully",
  "data": {
    "request_number": "REQ251",
    "request_id": 251,
    "request_status": "pending",
    "leave_date": "2025-11-18",
    "duration_hours": 2
  }
}
```

---

## 1.6 Apply Regularization Request

### Submit Regularization Request
**Endpoint:** `POST /api/attendance/employee/regularization/apply`

**UI Integration Point:** Apply Regularization Form

**Request:**
```json
{
  "attendance_date": "2025-11-10",
  "punch_in": "09:15",
  "punch_out": "18:00",
  "reason": "Forgot to punch in on time"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Regularization request submitted successfully",
  "data": {
    "request_number": "REQ252",
    "request_id": 252,
    "request_status": "pending",
    "attendance_date": "2025-11-10",
    "punch_in": "09:15",
    "punch_out": "18:00"
  }
}
```

---

## 1.7 Withdraw Request

### Withdraw Pending Request
**Endpoint:** `POST /api/attendance/employee/requests/withdraw`

**UI Integration Point:** Request Details Page - Withdraw Button

**Request:**
```json
{
  "request_id": 248,
  "withdrawal_reason": "Plans changed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": {
    "request_id": 248,
    "request_number": "REQ248",
    "request_status": "withdrawn",
    "withdrawn_date": "2025-11-13T15:00:00.000Z"
  }
}
```

---

# 2. MANAGER PORTAL APIs

## 2.1 View Team Requests

### Get Team Requests (Manager's Team Only)
**Endpoint:** `POST /api/attendance/admin/requests/list`

**UI Integration Point:** Manager - Team Requests Dashboard

**Request:**
```json
{
  "request_type": 1,           // Optional: filter by type
  "status": "pending",         // Optional: filter by status
  "manager_id": null,          // Leave null - auto-filled from JWT
  "from_date": "2025-11-01",
  "to_date": "2025-11-30",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 248,
      "request_number": "REQ248",
      "request_type": "leave",
      "employee_id": 123,
      "employee_name": "John Doe",
      "employee_code": "EMP123",
      "department_name": "IT",
      "leave_type_name": "Casual Leave",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "total_days": 6,
      "request_status": "pending",
      "submitted_at": "2025-11-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 2.2 Apply on Behalf of Employee

### Apply Leave on Behalf
**Endpoint:** `POST /api/attendance/manager/leave/apply`

**UI Integration Point:** Manager - Apply on Behalf Form

**Request:**
```json
{
  "target_employee_id": 123,       // Required: Employee for whom applying
  "leave_type": "CL",
  "from_date": "2025-11-15",
  "to_date": "2025-11-20",
  "leave_mode": "Full Day",
  "session": null,
  "reason": "Medical emergency",
  "contact_number": "9876543210",
  "manager_remarks": "Approved due to emergency situation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully for employee ID 123",
  "data": {
    "request_number": "REQ253",
    "request_id": 253,
    "request_status": "pending",
    "employee_id": 123,
    "leave_type": "CL",
    "from_date": "2025-11-15",
    "to_date": "2025-11-20"
  }
}
```

---

### Apply On Duty on Behalf
**Endpoint:** `POST /api/attendance/manager/onduty/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "from_date": "2025-11-25",
  "to_date": "2025-11-25",
  "on_duty_mode": "Full Day",
  "purpose": "Client meeting",
  "location": "Client Office",
  "manager_remarks": "Sent for client escalation"
}
```

---

### Apply WFH on Behalf
**Endpoint:** `POST /api/attendance/manager/wfh/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "from_date": "2025-11-22",
  "to_date": "2025-11-22",
  "wfh_mode": "Full Day",
  "reason": "Health precaution",
  "work_plan": "Complete assigned tasks remotely"
}
```

---

### Apply Short Leave on Behalf
**Endpoint:** `POST /api/attendance/manager/short-leave/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "leave_date": "2025-11-18",
  "from_time": "14:00",
  "to_time": "16:00",
  "duration_hours": 2,
  "reason": "Medical appointment"
}
```

---

### Apply Regularization on Behalf
**Endpoint:** `POST /api/attendance/manager/regularization/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "attendance_date": "2025-11-10",
  "punch_in": "09:15",
  "punch_out": "18:00",
  "reason": "System issue - manual entry"
}
```

---

## 2.3 Get Employee Leave Balance

### Get Employee's Leave Balance (Manager/Admin)
**Endpoint:** `POST /api/attendance/manager/leave/balance`

**UI Integration Point:** Manager - View Employee Balance

**Request:**
```json
{
  "employee_id": 123
}
```

**Response:**
```json
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
        "leave_type_code": "CL",
        "total_allocated": 12,
        "used": 4,
        "pending": 1,
        "available": 7
      }
    ]
  }
}
```

---

# 3. COMMON APIs

## 3.1 Master Data APIs

### Get Leave Types
**Endpoint:** `POST /api/attendance/leave-types/list`

**UI Integration Point:** Leave Application Form - Leave Type Dropdown

**Request:**
```json
{} // Empty
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "leave_type_name": "Casual Leave",
      "leave_type_code": "CL",
      "is_paid": true,
      "max_days_allowed": 12,
      "description": "For short-term personal needs"
    },
    {
      "id": 2,
      "leave_type_name": "Sick Leave",
      "leave_type_code": "SL",
      "is_paid": true,
      "max_days_allowed": 10,
      "requires_medical_certificate": true,
      "description": "For medical reasons"
    }
  ]
}
```

---

## 3.2 File Upload

### Upload Attachment
**Endpoint:** `POST /api/attendance/upload-attachment`

**UI Integration Point:** File Upload Component in Forms

**Request:** `multipart/form-data`
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('request_id', 248);  // Optional, if attaching to existing request
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file_id": 1,
    "file_name": "medical_certificate.pdf",
    "file_path": "/uploads/attendance/248/medical_certificate.pdf",
    "file_size": 245632,
    "uploaded_at": "2025-11-10T10:05:00.000Z"
  }
}
```

---

# 4. API INTEGRATION EXAMPLES

## Example 1: Dashboard Page Load

```javascript
// On page load
async function loadDashboard() {
  try {
    // 1. Load leave balance
    const balanceResponse = await fetch('/api/attendance/employee/leave/balance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const balanceData = await balanceResponse.json();
    displayLeaveBalance(balanceData.data);

    // 2. Load recent requests
    const requestsResponse = await fetch('/api/attendance/employee/requests/my-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 5,
        offset: 0
      })
    });
    const requestsData = await requestsResponse.json();
    displayRecentRequests(requestsData.data);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showErrorMessage('Failed to load dashboard data');
  }
}
```

---

## Example 2: Apply Leave Form Submit

```javascript
async function submitLeaveRequest(formData) {
  try {
    const response = await fetch('/api/attendance/employee/leave/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leave_type: formData.leaveType,
        from_date: formData.fromDate,
        to_date: formData.toDate,
        leave_mode: formData.leaveMode,
        session: formData.session,
        reason: formData.reason,
        contact_number: formData.contactNumber,
        contact_address: formData.contactAddress
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccessMessage(`Leave request ${result.data.request_number} submitted successfully`);
      redirectToMyRequests();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error submitting leave request:', error);
    showErrorMessage('Failed to submit leave request');
  }
}
```

---

## Example 3: View Request Details

```javascript
async function viewRequestDetails(requestId) {
  try {
    const response = await fetch('/api/attendance/employee/requests/details', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: requestId
      })
    });

    const result = await response.json();

    if (result.success) {
      displayRequestDetails(result.data);
      openDetailsModal();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error fetching request details:', error);
    showErrorMessage('Failed to load request details');
  }
}
```

---

## Example 4: Withdraw Request

```javascript
async function withdrawRequest(requestId, reason) {
  try {
    const response = await fetch('/api/attendance/employee/requests/withdraw', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: requestId,
        withdrawal_reason: reason
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccessMessage('Request withdrawn successfully');
      refreshRequestsList();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error withdrawing request:', error);
    showErrorMessage('Failed to withdraw request');
  }
}
```

---

## Example 5: Manager - Apply on Behalf

```javascript
async function applyLeaveOnBehalf(employeeId, formData) {
  try {
    const response = await fetch('/api/attendance/manager/leave/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_employee_id: employeeId,
        leave_type: formData.leaveType,
        from_date: formData.fromDate,
        to_date: formData.toDate,
        leave_mode: formData.leaveMode,
        reason: formData.reason,
        manager_remarks: formData.managerRemarks
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccessMessage(`Leave request submitted for employee ${employeeId}`);
      redirectToTeamRequests();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error applying leave on behalf:', error);
    showErrorMessage('Failed to submit leave request');
  }
}
```

---

# 5. ERROR HANDLING

## Common Error Codes

| Error Code | Description | User Action |
|------------|-------------|-------------|
| `INSUFFICIENT_BALANCE` | Not enough leave balance | Show available balance, suggest different dates |
| `INVALID_DATE_RANGE` | Invalid from/to dates | Validate date selection |
| `OVERLAPPING_REQUEST` | Request overlaps with existing | Show conflicting request details |
| `PAST_DATE_NOT_ALLOWED` | Cannot apply for past dates | Restrict date picker |
| `EXCEEDS_MAX_DAYS` | Request exceeds max allowed days | Split into multiple requests |
| `UNAUTHORIZED` | Invalid or expired token | Redirect to login |
| `REQUEST_NOT_FOUND` | Request ID doesn't exist | Refresh list |
| `INVALID_STATUS` | Cannot perform action on this status | Show current status |

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      // Additional context
    }
  }
}
```

---

# 6. UI COMPONENT MAPPING

## Page-wise API Integration

| UI Page/Component | Primary APIs | Secondary APIs |
|-------------------|--------------|----------------|
| **Employee Dashboard** | `my-requests` (recent), `leave/balance` | - |
| **Apply Leave Form** | `leave/apply` | `leave-types/list` |
| **Apply On Duty Form** | `onduty/apply` | - |
| **Apply WFH Form** | `wfh/apply` | - |
| **Apply Short Leave Form** | `short-leave/apply` | - |
| **Apply Regularization Form** | `regularization/apply` | - |
| **My Requests List** | `my-requests` | - |
| **Request Details** | `requests/details` | - |
| **Withdraw Request** | `requests/withdraw` | - |
| **Manager Dashboard** | `admin/requests/list` | `manager/leave/balance` |
| **Manager Apply on Behalf** | `manager/{type}/apply` | `leave-types/list`, `manager/leave/balance` |

---

# 7. REQUEST TYPE CONSTANTS

Use these constants in your frontend code:

```javascript
const REQUEST_TYPES = {
  LEAVE: 1,
  ON_DUTY: 2,
  WFH: 3,
  REGULARIZATION: 4,
  SHORT_LEAVE: 5
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

const LEAVE_MODES = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
  SHORT_LEAVE: 'Short Leave'
};

const SESSIONS = {
  FIRST_HALF: 'First Half',
  SECOND_HALF: 'Second Half'
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**For:** ESS Attendance Module - Existing UI Integration
