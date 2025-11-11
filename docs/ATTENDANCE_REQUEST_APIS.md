# Attendance Request APIs - Complete Guide

## Overview
यह document Employee और Admin दोनों के लिए separate APIs provide करता है - Leave, On Duty, WFH, Short Leave, और Regularization apply करने के लिए।

**Base URL**: `http://your-domain/api/attendance`

---

## Employee APIs (9 Endpoints)

### 1. Apply Leave
**Endpoint**: `POST /api/attendance/employee/leave/apply`
**Access**: Employee Only
**workflow_master_id**: 1

**🆕 Supports Two Modes**:
1. **Date Range Mode** - Continuous dates (from_date + to_date)
2. **Multiple Dates Mode** - Specific non-continuous dates (specific_dates array)

---

#### Mode 1: Date Range (Continuous Dates)

**Request Body**:
```json
{
  "leave_type": 1,
  "from_date": "2025-02-01",
  "to_date": "2025-02-05",
  "duration": 5,
  "reason": "Family vacation",
  "is_paid": true,
  "attachment": "https://example.com/file.pdf"
}
```

**Required Fields**: `leave_type`, `from_date`, `to_date`, `reason`
**Optional**: `duration` (auto-calculated if not provided)

**Response**:
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "LV-2025-001",
    "request_id": 1,
    "request_status": "pending",
    "leave_type": 1,
    "leave_mode": "date_range",
    "dates": ["2025-02-01", "2025-02-05"],
    "duration": 5
  }
}
```

---

#### Mode 2: Multiple Dates (Specific Dates)

**Request Body**:
```json
{
  "leave_type": 1,
  "specific_dates": [
    "2025-06-25",
    "2025-06-27",
    "2025-09-30"
  ],
  "duration": 3,
  "reason": "Personal appointments on specific days",
  "is_paid": true,
  "attachment": null
}
```

**Required Fields**: `leave_type`, `specific_dates`, `reason`
**Optional**: `duration` (auto-calculated as count of dates)

**Features**:
- ✅ Dates automatically sorted
- ✅ Duplicate dates removed
- ✅ Past dates validation
- ✅ Date format validation (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "LV-2025-002",
    "request_id": 2,
    "request_status": "pending",
    "leave_type": 1,
    "leave_mode": "multiple_dates",
    "dates": [
      "2025-06-25",
      "2025-06-27",
      "2025-09-30"
    ],
    "duration": 3
  }
}
```

**📖 Detailed Documentation**: See `LEAVE_APPLICATION_MODES.md` and `LEAVE_QUICK_EXAMPLES.md`

---

### 2. Apply On Duty
**Endpoint**: `POST /api/attendance/employee/onduty/apply`
**Access**: Employee Only
**workflow_master_id**: 2

**Request Body**:
```json
{
  "from_date": "2025-02-01",
  "to_date": "2025-02-01",
  "from_time": "10:00",
  "to_time": "16:00",
  "duration": 1,
  "purpose": "Client meeting",
  "location": "Client Office, Mumbai",
  "attachment": "https://example.com/invitation.pdf"
}
```

**Required Fields**: `from_date`, `to_date`, `purpose`, `location`

**Response**:
```json
{
  "success": true,
  "message": "On Duty request submitted successfully",
  "data": {
    "request_number": "OD-2025-001",
    "request_id": 2,
    "request_status": "pending",
    "from_date": "2025-02-01",
    "to_date": "2025-02-01",
    "purpose": "Client meeting",
    "location": "Client Office, Mumbai"
  }
}
```

---

### 3. Apply Work From Home (WFH)
**Endpoint**: `POST /api/attendance/employee/wfh/apply`
**Access**: Employee Only
**workflow_master_id**: 3

**Request Body**:
```json
{
  "from_date": "2025-02-05",
  "to_date": "2025-02-06",
  "duration": 2,
  "reason": "Internet issue at home",
  "work_plan": "Complete project documentation and code review",
  "attachment": null
}
```

**Required Fields**: `from_date`, `to_date`, `reason`

**Response**:
```json
{
  "success": true,
  "message": "WFH request submitted successfully",
  "data": {
    "request_number": "WFH-2025-001",
    "request_id": 3,
    "request_status": "pending",
    "from_date": "2025-02-05",
    "to_date": "2025-02-06",
    "duration": 2,
    "reason": "Internet issue at home"
  }
}
```

---

### 4. Apply Short Leave
**Endpoint**: `POST /api/attendance/employee/short-leave/apply`
**Access**: Employee Only
**workflow_master_id**: 5

**Request Body**:
```json
{
  "leave_date": "2025-02-10",
  "from_time": "14:00",
  "to_time": "16:00",
  "duration_hours": 2,
  "reason": "Doctor appointment"
}
```

**Required Fields**: `leave_date`, `from_time`, `to_time`, `reason`

**Response**:
```json
{
  "success": true,
  "message": "Short Leave request submitted successfully",
  "data": {
    "request_number": "SL-2025-001",
    "request_id": 4,
    "request_status": "pending",
    "leave_date": "2025-02-10",
    "from_time": "14:00",
    "to_time": "16:00",
    "duration_hours": 2
  }
}
```

---

### 5. Apply Regularization
**Endpoint**: `POST /api/attendance/employee/regularization/apply`
**Access**: Employee Only
**workflow_master_id**: 4

**Request Body**:
```json
{
  "attendance_date": "2025-01-31",
  "punch_in": "2025-01-31T09:15:00",
  "punch_out": "2025-01-31T18:30:00",
  "reason": "Forgot to punch in on time",
  "attachment": null
}
```

**Required Fields**: `attendance_date`, `reason`, और `punch_in` या `punch_out` में से कम से कम एक

**Response**:
```json
{
  "success": true,
  "message": "Regularization request submitted successfully",
  "data": {
    "request_number": "REG-2025-001",
    "request_id": 5,
    "request_status": "pending",
    "attendance_date": "2025-01-31",
    "punch_in": "2025-01-31T09:15:00",
    "punch_out": "2025-01-31T18:30:00",
    "working_hours": 9.25
  }
}
```

---

### 6. Get My Requests
**Endpoint**: `GET /api/attendance/employee/requests/my-requests`
**Access**: Employee Only

**Query Parameters**:
- `type` (optional): `leave`, `onduty`, `wfh`, `regularization`, `short-leave`
- `status` (optional): `pending`, `approved`, `rejected`, `withdrawn`
- `limit` (optional): default 20
- `offset` (optional): default 0

**Examples**:
```bash
# सभी requests
GET /api/attendance/employee/requests/my-requests

# केवल leave requests
GET /api/attendance/employee/requests/my-requests?type=leave

# केवल pending requests
GET /api/attendance/employee/requests/my-requests?status=pending

# Pending leave requests
GET /api/attendance/employee/requests/my-requests?type=leave&status=pending

# Pagination के साथ
GET /api/attendance/employee/requests/my-requests?limit=10&offset=0
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "requests": [
      {
        "id": 1,
        "request_number": "LV-2025-001",
        "workflow_master_id": 1,
        "request_status": "pending",
        "submitted_at": "2025-01-15T10:00:00Z",
        "request_data": { "leave_type": 1, "duration": 3 },
        "workflowMaster": {
          "workflow_for_name": "Leave",
          "workflow_code": "LEAVE"
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total_pages": 2
    }
  }
}
```

---

### 7. Get Request Details
**Endpoint**: `GET /api/attendance/employee/requests/:requestId`
**Access**: Employee Only

**Example**:
```bash
GET /api/attendance/employee/requests/1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "LV-2025-001",
    "workflow_master_id": 1,
    "employee_id": 10,
    "request_status": "pending",
    "overall_status": "in_progress",
    "request_data": {
      "leave_type": 1,
      "from_date": "2025-02-01",
      "to_date": "2025-02-03",
      "duration": 3,
      "reason": "Personal work"
    },
    "submitted_at": "2025-01-15T10:00:00Z",
    "workflowMaster": {
      "workflow_for_name": "Leave",
      "workflow_code": "LEAVE"
    },
    "actions": [
      {
        "action_type": "submitted",
        "action_taken_at": "2025-01-15T10:00:00Z",
        "remarks": "Request submitted"
      }
    ]
  }
}
```

---

### 8. Withdraw Request
**Endpoint**: `POST /api/attendance/employee/requests/:requestId/withdraw`
**Access**: Employee Only

**Request Body**:
```json
{
  "remarks": "No longer needed"
}
```

**Example**:
```bash
POST /api/attendance/employee/requests/1/withdraw
```

**Response**:
```json
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": {
    "request_number": "LV-2025-001",
    "request_status": "withdrawn"
  }
}
```

---

### 9. Get Leave Balance
**Endpoint**: `GET /api/attendance/employee/leave/balance`
**Access**: Employee Only

**Response**:
```json
{
  "success": true,
  "data": {
    "employee_id": 10,
    "leave_balances": [
      {
        "leave_type": "Annual Leave",
        "total": 15,
        "used": 3,
        "remaining": 12
      },
      {
        "leave_type": "Sick Leave",
        "total": 10,
        "used": 2,
        "remaining": 8
      },
      {
        "leave_type": "Casual Leave",
        "total": 12,
        "used": 5,
        "remaining": 7
      }
    ]
  },
  "message": "TODO: Implement leave balance calculation"
}
```

---

## Admin APIs (6 Endpoints)

### 1. Get All Requests (Unified API)
**Endpoint**: `GET /api/attendance/admin/requests`
**Access**: Admin Only
**विशेष**: यह एक unified API है जो `workflow_master_id` के base पर filter करती है

**Query Parameters**:
- `type` (optional): `leave`, `onduty`, `wfh`, `regularization`, `short-leave`
- `status` (optional): `pending`, `approved`, `rejected`, `withdrawn`
- `employee_id` (optional): Specific employee की requests देखने के लिए
- `from_date` (optional): Date range start
- `to_date` (optional): Date range end
- `limit` (optional): default 50
- `offset` (optional): default 0

**Examples**:
```bash
# सभी types की requests
GET /api/attendance/admin/requests

# केवल Leave requests (workflow_master_id = 1)
GET /api/attendance/admin/requests?type=leave

# केवल On Duty requests (workflow_master_id = 2)
GET /api/attendance/admin/requests?type=onduty

# केवल WFH requests (workflow_master_id = 3)
GET /api/attendance/admin/requests?type=wfh

# केवल Regularization requests (workflow_master_id = 4)
GET /api/attendance/admin/requests?type=regularization

# केवल Short Leave requests (workflow_master_id = 5)
GET /api/attendance/admin/requests?type=short-leave

# Pending Leave requests
GET /api/attendance/admin/requests?type=leave&status=pending

# Specific employee की all requests
GET /api/attendance/admin/requests?employee_id=10

# Date range filter
GET /api/attendance/admin/requests?from_date=2025-01-01&to_date=2025-01-31

# Multiple filters
GET /api/attendance/admin/requests?type=leave&status=pending&employee_id=10
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "requests": [
      {
        "id": 1,
        "request_number": "LV-2025-001",
        "workflow_master_id": 1,
        "employee_id": 10,
        "request_status": "pending",
        "request_data": {
          "leave_type": 1,
          "duration": 3
        },
        "submitted_at": "2025-01-15T10:00:00Z",
        "employee": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe",
          "employee_code": "EMP00010",
          "email": "john@example.com"
        },
        "workflowMaster": {
          "workflow_for_name": "Leave",
          "workflow_code": "LEAVE"
        }
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total_pages": 3
    },
    "filters_applied": {
      "type": "leave",
      "status": "pending",
      "employee_id": "all"
    }
  }
}
```

---

### 2. Get Request Details
**Endpoint**: `GET /api/attendance/admin/requests/:requestId`
**Access**: Admin Only

**Example**:
```bash
GET /api/attendance/admin/requests/1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "request_number": "LV-2025-001",
    "workflow_master_id": 1,
    "employee_id": 10,
    "request_status": "pending",
    "overall_status": "in_progress",
    "request_data": {
      "leave_type": 1,
      "from_date": "2025-02-01",
      "to_date": "2025-02-03",
      "duration": 3,
      "reason": "Personal work"
    },
    "submitted_at": "2025-01-15T10:00:00Z",
    "employee": {
      "id": 10,
      "first_name": "John",
      "last_name": "Doe",
      "employee_code": "EMP00010",
      "email": "john@example.com",
      "department_id": 5,
      "designation_id": 8
    },
    "workflowMaster": {
      "workflow_for_name": "Leave",
      "workflow_code": "LEAVE"
    },
    "actions": [
      {
        "action_type": "submitted",
        "action_taken_at": "2025-01-15T10:00:00Z",
        "remarks": "Request submitted"
      }
    ]
  }
}
```

---

### 3. Approve/Reject Request (Admin Override)
**Endpoint**: `POST /api/attendance/admin/requests/:requestId/action`
**Access**: Admin Only

**Request Body**:
```json
{
  "action": "approve",
  "remarks": "Approved by admin"
}
```

**Options**:
- `action`: `"approve"` या `"reject"`
- `remarks`: Optional remarks

**Example - Approve**:
```bash
POST /api/attendance/admin/requests/1/action
{
  "action": "approve",
  "remarks": "Leave approved"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "request_number": "LV-2025-001",
    "request_status": "approved",
    "workflow_type": "Leave"
  }
}
```

**Example - Reject**:
```bash
POST /api/attendance/admin/requests/1/action
{
  "action": "reject",
  "remarks": "Insufficient leave balance"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Leave request rejected successfully",
  "data": {
    "request_number": "LV-2025-001",
    "request_status": "rejected",
    "workflow_type": "Leave"
  }
}
```

---

### 4. Dashboard Statistics
**Endpoint**: `GET /api/attendance/admin/requests/dashboard`
**Access**: Admin Only

**Query Parameters**:
- `from_date` (optional): Date range start
- `to_date` (optional): Date range end

**Example**:
```bash
# Overall stats
GET /api/attendance/admin/requests/dashboard

# Date range stats
GET /api/attendance/admin/requests/dashboard?from_date=2025-01-01&to_date=2025-01-31
```

**Response**:
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
      "total": 80,
      "pending": 15,
      "approved": 60,
      "rejected": 3,
      "withdrawn": 2
    },
    "wfh": {
      "total": 120,
      "pending": 30,
      "approved": 85,
      "rejected": 3,
      "withdrawn": 2
    },
    "regularization": {
      "total": 200,
      "pending": 50,
      "approved": 140,
      "rejected": 8,
      "withdrawn": 2
    },
    "short_leave": {
      "total": 90,
      "pending": 20,
      "approved": 65,
      "rejected": 3,
      "withdrawn": 2
    },
    "overall": {
      "total_requests": 640,
      "pending_approvals": 140
    }
  }
}
```

---

### 5. Bulk Approve Requests
**Endpoint**: `POST /api/attendance/admin/requests/bulk-approve`
**Access**: Admin Only

**Request Body**:
```json
{
  "request_ids": [1, 2, 3, 4, 5],
  "remarks": "Bulk approved"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Approved 5 requests, 0 failed",
  "data": {
    "success": [
      {
        "request_id": 1,
        "request_number": "LV-2025-001",
        "workflow_type": "Leave"
      },
      {
        "request_id": 2,
        "request_number": "OD-2025-001",
        "workflow_type": "On Duty"
      },
      {
        "request_id": 3,
        "request_number": "WFH-2025-001",
        "workflow_type": "WFH"
      },
      {
        "request_id": 4,
        "request_number": "REG-2025-001",
        "workflow_type": "Regularization"
      },
      {
        "request_id": 5,
        "request_number": "SL-2025-001",
        "workflow_type": "Short Leave"
      }
    ],
    "failed": []
  }
}
```

---

### 6. Bulk Reject Requests
**Endpoint**: `POST /api/attendance/admin/requests/bulk-reject`
**Access**: Admin Only

**Request Body**:
```json
{
  "request_ids": [6, 7, 8],
  "remarks": "Rejected due to policy violation"
}
```

**Note**: Rejection के लिए `remarks` required है।

**Response**:
```json
{
  "success": true,
  "message": "Rejected 3 requests, 0 failed",
  "data": {
    "success": [
      {
        "request_id": 6,
        "request_number": "LV-2025-006",
        "workflow_type": "Leave"
      },
      {
        "request_id": 7,
        "request_number": "WFH-2025-002",
        "workflow_type": "WFH"
      },
      {
        "request_id": 8,
        "request_number": "OD-2025-003",
        "workflow_type": "On Duty"
      }
    ],
    "failed": []
  }
}
```

---

## Workflow Master IDs

Internal mapping (database में use होती है):

| workflow_master_id | Type | Code |
|--------------------|------|------|
| 1 | Leave | LEAVE |
| 2 | On Duty | ONDUTY |
| 3 | Work From Home | WFH |
| 4 | Regularization | REGULARIZATION |
| 5 | Short Leave | SHORT_LEAVE |

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Required fields: leave_type, from_date, to_date, duration, reason"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Request not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Failed to apply leave"
}
```

---

## Authentication

सभी APIs को authentication middleware की जरूरत है। Request headers में token भेजें:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## Testing with cURL

### Employee - Apply Leave (Date Range Mode)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "from_date": "2025-02-01",
    "to_date": "2025-02-05",
    "reason": "Family vacation",
    "is_paid": true
  }'
```

### Employee - Apply Leave (Multiple Dates Mode)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "specific_dates": ["2025-06-25", "2025-06-27", "2025-09-30"],
    "reason": "Personal appointments",
    "is_paid": true
  }'
```

### Employee - Get My Requests
```bash
curl -X GET "http://localhost:3000/api/attendance/employee/requests/my-requests?type=leave&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin - Get All Leave Requests
```bash
curl -X GET "http://localhost:3000/api/attendance/admin/requests?type=leave&status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Admin - Approve Request
```bash
curl -X POST http://localhost:3000/api/attendance/admin/requests/1/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "action": "approve",
    "remarks": "Approved"
  }'
```

### Admin - Dashboard
```bash
curl -X GET http://localhost:3000/api/attendance/admin/requests/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Summary

### Employee APIs (9 Total)
1. ✅ Apply Leave - `POST /employee/leave/apply`
2. ✅ Apply On Duty - `POST /employee/onduty/apply`
3. ✅ Apply WFH - `POST /employee/wfh/apply`
4. ✅ Apply Short Leave - `POST /employee/short-leave/apply`
5. ✅ Apply Regularization - `POST /employee/regularization/apply`
6. ✅ Get My Requests - `GET /employee/requests/my-requests`
7. ✅ Get Request Details - `GET /employee/requests/:requestId`
8. ✅ Withdraw Request - `POST /employee/requests/:requestId/withdraw`
9. ✅ Get Leave Balance - `GET /employee/leave/balance`

### Admin APIs (6 Total)
1. ✅ Get All Requests (Unified) - `GET /admin/requests`
2. ✅ Get Request Details - `GET /admin/requests/:requestId`
3. ✅ Approve/Reject Request - `POST /admin/requests/:requestId/action`
4. ✅ Dashboard Statistics - `GET /admin/requests/dashboard`
5. ✅ Bulk Approve - `POST /admin/requests/bulk-approve`
6. ✅ Bulk Reject - `POST /admin/requests/bulk-reject`

**Total**: 15 APIs (9 Employee + 6 Admin)

---

## Files Structure

```
src/
├── controllers/
│   ├── employee/
│   │   └── employeeAttendanceRequest.controller.js
│   └── admin/
│       └── adminAttendanceRequest.controller.js
├── routes/
│   ├── attendanceRequest.routes.js
│   └── index.js
└── services/
    └── workflow/
        └── workflowExecution.service.js
```

---

**Created**: 2025-01-13
**Version**: 1.0
**Total APIs**: 15 (9 Employee + 6 Admin)
**Workflow Types**: 5 (Leave, On Duty, WFH, Regularization, Short Leave)
