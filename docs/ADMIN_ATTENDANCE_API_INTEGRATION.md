# Admin Attendance Requests - API Integration Guide

## Overview
This document provides API integration details for connecting the existing Admin Attendance UI with backend APIs. The UI is already created - this guide shows which APIs to call and how to integrate them.

---

## API Base URL
```
/api/attendance/admin
```

## Authentication
All APIs require JWT token with admin role:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

# ADMIN PORTAL APIs

## 1. Dashboard APIs

### Get Dashboard Statistics
**Endpoint:** `POST /api/attendance/admin/requests/dashboard`

**UI Integration Point:** Admin Dashboard - Stats Cards

**Request:**
```json
{
  "from_date": "2025-11-01",   // Optional
  "to_date": "2025-11-30"      // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leave": {
      "total": 150,
      "pending": 25,
      "approved": 100,
      "rejected": 20,
      "withdrawn": 5
    },
    "onduty": {
      "total": 45,
      "pending": 10,
      "approved": 30,
      "rejected": 5,
      "withdrawn": 0
    },
    "wfh": {
      "total": 60,
      "pending": 15,
      "approved": 40,
      "rejected": 5,
      "withdrawn": 0
    },
    "regularization": {
      "total": 80,
      "pending": 20,
      "approved": 50,
      "rejected": 10,
      "withdrawn": 0
    },
    "short_leave": {
      "total": 30,
      "pending": 8,
      "approved": 20,
      "rejected": 2,
      "withdrawn": 0
    },
    "overall": {
      "total_requests": 365,
      "pending_approvals": 78
    }
  }
}
```

---

## 2. Request Management APIs

### Get All Requests (Unified)
**Endpoint:** `POST /api/attendance/admin/requests/list`

**UI Integration Point:** Admin - All Requests Table

**Request:**
```json
{
  "request_type": 1,              // Optional: 1-5 or null for all
  "status": "pending",            // Optional: pending, approved, rejected, withdrawn
  "employee_id": 123,             // Optional: filter by employee
  "department_id": 5,             // Optional: filter by department
  "manager_id": 45,               // Optional: filter by manager
  "leave_type": "CL",             // Optional: for leave requests only
  "from_date": "2025-11-01",      // Optional: request date range
  "to_date": "2025-11-30",        // Optional
  "applied_by_role": "employee",  // Optional: employee, manager, admin
  "search": "John Doe",           // Optional: search by employee name/code
  "limit": 50,                    // Optional, default: 50
  "offset": 0,                    // Optional, default: 0
  "sort_by": "applied_date",      // Optional: applied_date, employee_name, status
  "sort_order": "desc"            // Optional: asc, desc
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
      "designation": "Senior Developer",
      "manager_name": "Manager Name",
      "leave_type_name": "Casual Leave",
      "leave_type_code": "CL",
      "from_date": "2025-11-15",
      "to_date": "2025-11-20",
      "total_days": 6,
      "reason": "Personal work",
      "request_status": "pending",
      "applied_by_role": "employee",
      "submitted_at": "2025-11-10T10:00:00.000Z",
      "current_stage_name": "Manager Approval",
      "current_approver_name": "Manager Name"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 248,
    "total_pages": 5,
    "current_page": 1
  }
}
```

---

### Get Request Details
**Endpoint:** `POST /api/attendance/admin/requests/details`

**UI Integration Point:** Admin - Request Details Modal/Page

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

    // Employee Info
    "employee_id": 123,
    "employee_name": "John Doe",
    "employee_code": "EMP123",
    "department_name": "IT",
    "designation": "Senior Developer",
    "manager_name": "Manager Name",
    "email": "john.doe@company.com",
    "phone": "9876543210",

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
    "contact_number": "9876543210",
    "contact_address": "Home",

    // Status & Workflow
    "request_status": "pending",
    "overall_status": "in_progress",
    "current_stage_name": "Manager Approval",
    "current_approver_name": "Manager Name",
    "applied_by_role": "employee",
    "submitted_at": "2025-11-10T10:00:00.000Z",

    // Leave Balance Info
    "current_leave_balance": {
      "leave_type": "CL",
      "available": 7,
      "used": 4,
      "pending": 1
    },

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
    ],

    // Admin Info
    "admin_remarks": null,
    "admin_action_by": null,
    "admin_action_at": null
  }
}
```

---

## 3. Admin Actions on Requests

### Approve/Reject Request (Admin Override)
**Endpoint:** `POST /api/attendance/admin/requests/action`

**UI Integration Point:** Request Details - Approve/Reject Buttons

**Request:**
```json
{
  "request_id": 248,
  "action": "approve",              // approve or reject
  "remarks": "Approved by admin"    // Optional for approve, required for reject
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "request_id": 248,
    "request_number": "REQ248",
    "previous_status": "pending",
    "new_status": "approved",
    "approved_by": "Admin User",
    "action_date": "2025-11-13T11:00:00.000Z",
    "remarks": "Approved by admin",
    "workflow_type": "Leave"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Request is already approved"
}
```

---

### Bulk Approve Requests
**Endpoint:** `POST /api/admin/requests/bulk-approve`

**UI Integration Point:** Admin - Bulk Actions

**Request:**
```json
{
  "request_ids": [248, 249, 250],
  "remarks": "Bulk approved by admin"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approved 3 requests, 0 failed",
  "data": {
    "success": [
      {
        "request_id": 248,
        "request_number": "REQ248",
        "workflow_type": "Leave"
      },
      {
        "request_id": 249,
        "request_number": "REQ249",
        "workflow_type": "WFH"
      },
      {
        "request_id": 250,
        "request_number": "REQ250",
        "workflow_type": "On Duty"
      }
    ],
    "failed": []
  }
}
```

---

### Bulk Reject Requests
**Endpoint:** `POST /api/admin/requests/bulk-reject`

**UI Integration Point:** Admin - Bulk Actions

**Request:**
```json
{
  "request_ids": [251, 252],
  "remarks": "Not as per policy"  // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rejected 2 requests, 0 failed",
  "data": {
    "success": [
      {
        "request_id": 251,
        "request_number": "REQ251",
        "workflow_type": "Leave"
      },
      {
        "request_id": 252,
        "request_number": "REQ252",
        "workflow_type": "Regularization"
      }
    ],
    "failed": []
  }
}
```

---

## 4. Employee Leave Balance

### Get Employee Leave Balance (Admin View)
**Endpoint:** `POST /api/attendance/admin/leave/balance`

**UI Integration Point:** Admin - View Employee Balance

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
    "department_name": "IT",
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
        "encashed": 0,
        "lapsed": 0
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
        "encashed": 0,
        "lapsed": 0
      }
    ]
  }
}
```

---

## 5. Apply on Behalf (Admin)

### Admin Apply Leave on Behalf
**Endpoint:** `POST /api/attendance/admin/leave/apply`

**UI Integration Point:** Admin - Apply on Behalf Form

**Request:**
```json
{
  "target_employee_id": 123,
  "leave_type": "CL",
  "from_date": "2025-11-15",
  "to_date": "2025-11-20",
  "leave_mode": "Full Day",
  "session": null,
  "reason": "Applied by admin on behalf",
  "admin_remarks": "Emergency situation"
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
    "leave_type": "CL"
  }
}
```

---

### Admin Apply On Duty on Behalf
**Endpoint:** `POST /api/attendance/admin/onduty/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "from_date": "2025-11-25",
  "to_date": "2025-11-25",
  "on_duty_mode": "Full Day",
  "purpose": "Deputation",
  "location": "Branch Office",
  "admin_remarks": "Company requirement"
}
```

---

### Admin Apply WFH on Behalf
**Endpoint:** `POST /api/attendance/admin/wfh/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "from_date": "2025-11-22",
  "to_date": "2025-11-22",
  "wfh_mode": "Full Day",
  "reason": "COVID precaution",
  "work_plan": "Remote work"
}
```

---

### Admin Apply Short Leave on Behalf
**Endpoint:** `POST /api/attendance/admin/short-leave/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "leave_date": "2025-11-18",
  "from_time": "14:00",
  "to_time": "16:00",
  "duration_hours": 2,
  "reason": "Personal work"
}
```

---

### Admin Apply Regularization on Behalf
**Endpoint:** `POST /api/attendance/admin/regularization/apply`

**Request:**
```json
{
  "target_employee_id": 123,
  "attendance_date": "2025-11-10",
  "punch_in": "09:15",
  "punch_out": "18:00",
  "reason": "System correction",
  "admin_remarks": "Manual entry due to system issue"
}
```

---

# API INTEGRATION EXAMPLES

## Example 1: Admin Dashboard Load

```javascript
async function loadAdminDashboard() {
  try {
    // 1. Load dashboard statistics
    const statsResponse = await fetch('/api/attendance/admin/requests/dashboard', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_date: getFirstDayOfMonth(),
        to_date: getLastDayOfMonth()
      })
    });
    const statsData = await statsResponse.json();
    displayDashboardStats(statsData.data);

    // 2. Load pending requests
    const requestsResponse = await fetch('/api/attendance/admin/requests/list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'pending',
        limit: 10,
        offset: 0,
        sort_by: 'applied_date',
        sort_order: 'desc'
      })
    });
    const requestsData = await requestsResponse.json();
    displayPendingRequests(requestsData.data);

  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    showErrorMessage('Failed to load dashboard data');
  }
}
```

---

## Example 2: All Requests with Filters

```javascript
async function loadAllRequests(filters) {
  try {
    const response = await fetch('/api/attendance/admin/requests/list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_type: filters.requestType || null,
        status: filters.status || null,
        employee_id: filters.employeeId || null,
        department_id: filters.departmentId || null,
        from_date: filters.fromDate || null,
        to_date: filters.toDate || null,
        search: filters.searchText || null,
        limit: filters.pageSize || 50,
        offset: (filters.currentPage - 1) * (filters.pageSize || 50),
        sort_by: filters.sortBy || 'applied_date',
        sort_order: filters.sortOrder || 'desc'
      })
    });

    const result = await response.json();

    if (result.success) {
      displayRequestsTable(result.data);
      updatePagination(result.pagination);
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error loading requests:', error);
    showErrorMessage('Failed to load requests');
  }
}
```

---

## Example 3: Approve Request

```javascript
async function approveRequest(requestId, remarks) {
  try {
    const response = await fetch('/api/attendance/admin/requests/action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: requestId,
        action: 'approve',
        remarks: remarks || 'Approved'
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccessMessage(`Request ${result.data.request_number} approved successfully`);
      refreshRequestsList();
      closeDetailsModal();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error approving request:', error);
    showErrorMessage('Failed to approve request');
  }
}
```

---

## Example 4: Reject Request

```javascript
async function rejectRequest(requestId, remarks) {
  // Validate remarks
  if (!remarks || remarks.trim().length === 0) {
    showErrorMessage('Rejection remarks are required');
    return;
  }

  try {
    const response = await fetch('/api/attendance/admin/requests/action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: requestId,
        action: 'reject',
        remarks: remarks
      })
    });

    const result = await response.json();

    if (result.success) {
      showSuccessMessage(`Request ${result.data.request_number} rejected`);
      refreshRequestsList();
      closeDetailsModal();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error rejecting request:', error);
    showErrorMessage('Failed to reject request');
  }
}
```

---

## Example 5: Bulk Approve

```javascript
async function bulkApproveRequests(selectedRequestIds) {
  if (!selectedRequestIds || selectedRequestIds.length === 0) {
    showErrorMessage('Please select at least one request');
    return;
  }

  try {
    const response = await fetch('/api/admin/requests/bulk-approve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_ids: selectedRequestIds,
        remarks: 'Bulk approved'
      })
    });

    const result = await response.json();

    if (result.success) {
      const successCount = result.data.success.length;
      const failedCount = result.data.failed.length;

      showSuccessMessage(`${successCount} requests approved successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`);

      if (failedCount > 0) {
        showFailedRequests(result.data.failed);
      }

      clearSelection();
      refreshRequestsList();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error bulk approving:', error);
    showErrorMessage('Failed to bulk approve requests');
  }
}
```

---

## Example 6: View Employee Balance

```javascript
async function viewEmployeeBalance(employeeId) {
  try {
    const response = await fetch('/api/attendance/admin/leave/balance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId
      })
    });

    const result = await response.json();

    if (result.success) {
      displayEmployeeBalance(result.data);
      openBalanceModal();
    } else {
      showErrorMessage(result.message);
    }

  } catch (error) {
    console.error('Error fetching employee balance:', error);
    showErrorMessage('Failed to load employee balance');
  }
}
```

---

# UI COMPONENT MAPPING

| UI Page/Component | Primary APIs | Secondary APIs |
|-------------------|--------------|----------------|
| **Admin Dashboard** | `admin/requests/dashboard`, `admin/requests/list` | - |
| **All Requests** | `admin/requests/list` | - |
| **Request Details** | `admin/requests/details` | `admin/leave/balance` |
| **Approve/Reject** | `admin/requests/action` | - |
| **Bulk Actions** | `admin/requests/bulk-approve`, `admin/requests/bulk-reject` | - |
| **Employee Balance View** | `admin/leave/balance` | - |
| **Apply on Behalf** | `admin/{type}/apply` | `admin/leave/balance` |

---

# REQUEST TYPE CONSTANTS

```javascript
const REQUEST_TYPES = {
  LEAVE: 1,
  ON_DUTY: 2,
  WFH: 3,
  REGULARIZATION: 4,
  SHORT_LEAVE: 5
};

const REQUEST_TYPE_LABELS = {
  1: 'Leave',
  2: 'On Duty',
  3: 'WFH',
  4: 'Regularization',
  5: 'Short Leave'
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

const ADMIN_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'reject'
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**For:** Admin Attendance Module - Existing UI Integration
