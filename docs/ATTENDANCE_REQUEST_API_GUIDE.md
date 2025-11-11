# Attendance Request API Guide

Complete API documentation for Leave, On Duty, WFH, Short Leave, and Regularization requests.

---

## Base URL
```
http://localhost:3000/api/attendance
```

---

## Authentication
All APIs require authentication. Include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

---

# Employee APIs

## 1. Apply for Leave

**Endpoint:** `POST /api/attendance/employee/leave/apply`

**Request Body:**
```json
{
  "leave_type": "Annual Leave",
  "from_date": "2024-12-25",
  "to_date": "2024-12-27",
  "duration": 3,
  "reason": "Year-end vacation with family",
  "is_paid": true,
  "attachment": "https://example.com/medical-certificate.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "WFR-LEAVE-2024-00001",
    "request_id": 123,
    "request_status": "pending",
    "leave_type": "Annual Leave",
    "from_date": "2024-12-25",
    "to_date": "2024-12-27",
    "duration": 3
  }
}
```

---

## 2. Apply for On Duty

**Endpoint:** `POST /api/attendance/employee/onduty/apply`

**Request Body:**
```json
{
  "from_date": "2024-12-20",
  "to_date": "2024-12-20",
  "from_time": "10:00",
  "to_time": "16:00",
  "duration": 1,
  "purpose": "Client meeting at Mumbai office",
  "location": "Mumbai, Maharashtra",
  "attachment": "https://example.com/meeting-invite.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "On Duty request submitted successfully",
  "data": {
    "request_number": "WFR-ONDUTY-2024-00001",
    "request_id": 124,
    "request_status": "pending",
    "from_date": "2024-12-20",
    "to_date": "2024-12-20",
    "purpose": "Client meeting at Mumbai office",
    "location": "Mumbai, Maharashtra"
  }
}
```

---

## 3. Apply for Work From Home (WFH)

**Endpoint:** `POST /api/attendance/employee/wfh/apply`

**Request Body:**
```json
{
  "from_date": "2024-12-23",
  "to_date": "2024-12-24",
  "duration": 2,
  "reason": "Home renovation work",
  "work_plan": "Will complete API development and testing tasks",
  "attachment": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "WFH request submitted successfully",
  "data": {
    "request_number": "WFR-WFH-2024-00001",
    "request_id": 125,
    "request_status": "pending",
    "from_date": "2024-12-23",
    "to_date": "2024-12-24",
    "duration": 2,
    "reason": "Home renovation work"
  }
}
```

---

## 4. Apply for Short Leave

**Endpoint:** `POST /api/attendance/employee/short-leave/apply`

**Request Body:**
```json
{
  "leave_date": "2024-12-20",
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
    "request_number": "WFR-SHORT-2024-00001",
    "request_id": 126,
    "request_status": "pending",
    "leave_date": "2024-12-20",
    "from_time": "14:00",
    "to_time": "16:00",
    "duration_hours": 2
  }
}
```

---

## 5. Apply for Regularization

**Endpoint:** `POST /api/attendance/employee/regularization/apply`

**Use Cases:**
- Forgot to punch in
- Forgot to punch out
- Wrong punch in/out time

**Request Body (Forgot to punch out):**
```json
{
  "attendance_date": "2024-12-19",
  "punch_in": "2024-12-19 09:00:00",
  "punch_out": "2024-12-19 18:00:00",
  "reason": "Forgot to punch out yesterday",
  "attachment": null
}
```

**Request Body (Forgot to punch in):**
```json
{
  "attendance_date": "2024-12-19",
  "punch_in": "2024-12-19 09:00:00",
  "punch_out": null,
  "reason": "Forgot to punch in",
  "attachment": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Regularization request submitted successfully",
  "data": {
    "request_number": "WFR-REG-2024-00001",
    "request_id": 127,
    "request_status": "pending",
    "attendance_date": "2024-12-19",
    "punch_in": "2024-12-19 09:00:00",
    "punch_out": "2024-12-19 18:00:00",
    "working_hours": 9
  }
}
```

---

## 6. Get My Requests

**Endpoint:** `GET /api/attendance/employee/requests/my-requests`

**Query Parameters:**
- `type` (optional): leave, onduty, wfh, regularization, short-leave
- `status` (optional): pending, approved, rejected, withdrawn
- `limit` (optional): default 20
- `offset` (optional): default 0

**Examples:**

Get all my requests:
```
GET /api/attendance/employee/requests/my-requests
```

Get only leave requests:
```
GET /api/attendance/employee/requests/my-requests?type=leave
```

Get only pending requests:
```
GET /api/attendance/employee/requests/my-requests?status=pending
```

Get pending leave requests:
```
GET /api/attendance/employee/requests/my-requests?type=leave&status=pending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "requests": [
      {
        "id": 123,
        "request_number": "WFR-LEAVE-2024-00001",
        "request_status": "pending",
        "submitted_at": "2024-12-15T10:30:00Z",
        "request_data": {
          "leave_type": "Annual Leave",
          "from_date": "2024-12-25",
          "to_date": "2024-12-27",
          "duration": 3
        },
        "workflowMaster": {
          "workflow_for_name": "Leave",
          "workflow_code": "LEAVE"
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total_pages": 1
    }
  }
}
```

---

## 7. Get Request Details

**Endpoint:** `GET /api/attendance/employee/requests/:requestId`

**Example:**
```
GET /api/attendance/employee/requests/123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "request_number": "WFR-LEAVE-2024-00001",
    "request_status": "approved",
    "overall_status": "completed",
    "request_data": {
      "leave_type": "Annual Leave",
      "from_date": "2024-12-25",
      "to_date": "2024-12-27",
      "duration": 3,
      "reason": "Year-end vacation"
    },
    "submitted_at": "2024-12-15T10:30:00Z",
    "completed_at": "2024-12-16T14:20:00Z",
    "workflowMaster": {
      "workflow_for_name": "Leave",
      "workflow_code": "LEAVE"
    },
    "actions": [
      {
        "action_type": "approved",
        "action_by_user_id": 5,
        "remarks": "Approved",
        "action_taken_at": "2024-12-16T14:20:00Z"
      },
      {
        "action_type": "submitted",
        "action_by_user_id": 45,
        "remarks": "Request submitted",
        "action_taken_at": "2024-12-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 8. Withdraw Request

**Endpoint:** `POST /api/attendance/employee/requests/:requestId/withdraw`

**Request Body:**
```json
{
  "remarks": "Plans changed, no longer need leave"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": {
    "request_number": "WFR-LEAVE-2024-00001",
    "request_status": "withdrawn"
  }
}
```

---

## 9. Get Leave Balance

**Endpoint:** `GET /api/attendance/employee/leave/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_id": 45,
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
  }
}
```

---

# Admin APIs

## 1. Get All Requests (Unified API)

**Endpoint:** `GET /api/attendance/admin/requests`

**Query Parameters:**
- `type` (optional): leave, onduty, wfh, regularization, short-leave
- `status` (optional): pending, approved, rejected, withdrawn
- `employee_id` (optional): filter by specific employee
- `from_date` (optional): start date (YYYY-MM-DD)
- `to_date` (optional): end date (YYYY-MM-DD)
- `limit` (optional): default 50
- `offset` (optional): default 0

**Examples:**

Get all requests:
```
GET /api/attendance/admin/requests
```

Get all pending leave requests:
```
GET /api/attendance/admin/requests?type=leave&status=pending
```

Get all requests from specific employee:
```
GET /api/attendance/admin/requests?employee_id=45
```

Get all on duty requests in December 2024:
```
GET /api/attendance/admin/requests?type=onduty&from_date=2024-12-01&to_date=2024-12-31
```

Get all pending requests (all types):
```
GET /api/attendance/admin/requests?status=pending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "requests": [
      {
        "id": 123,
        "request_number": "WFR-LEAVE-2024-00001",
        "request_status": "pending",
        "workflow_master_id": 1,
        "employee_id": 45,
        "submitted_at": "2024-12-15T10:30:00Z",
        "request_data": {
          "leave_type": "Annual Leave",
          "from_date": "2024-12-25",
          "to_date": "2024-12-27",
          "duration": 3
        },
        "employee": {
          "id": 45,
          "first_name": "John",
          "last_name": "Doe",
          "employee_code": "EMP001",
          "email": "john.doe@example.com"
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

## 2. Get Request Details

**Endpoint:** `GET /api/attendance/admin/requests/:requestId`

**Example:**
```
GET /api/attendance/admin/requests/123
```

**Response:** (Same as employee request details)

---

## 3. Approve/Reject Request (Admin Override)

**Endpoint:** `POST /api/attendance/admin/requests/:requestId/action`

**Request Body (Approve):**
```json
{
  "action": "approve",
  "remarks": "Approved by admin"
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "remarks": "Insufficient leave balance"
}
```

**Response (Approve):**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "request_number": "WFR-LEAVE-2024-00001",
    "request_status": "approved",
    "workflow_type": "Leave"
  }
}
```

**Response (Reject):**
```json
{
  "success": true,
  "message": "Leave request rejected successfully",
  "data": {
    "request_number": "WFR-LEAVE-2024-00001",
    "request_status": "rejected",
    "workflow_type": "Leave"
  }
}
```

---

## 4. Get Dashboard Statistics

**Endpoint:** `GET /api/attendance/admin/requests/dashboard`

**Query Parameters:**
- `from_date` (optional): start date
- `to_date` (optional): end date

**Examples:**

Get overall stats:
```
GET /api/attendance/admin/requests/dashboard
```

Get stats for December 2024:
```
GET /api/attendance/admin/requests/dashboard?from_date=2024-12-01&to_date=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leave": {
      "total": 45,
      "pending": 12,
      "approved": 28,
      "rejected": 3,
      "withdrawn": 2
    },
    "onduty": {
      "total": 23,
      "pending": 5,
      "approved": 16,
      "rejected": 1,
      "withdrawn": 1
    },
    "wfh": {
      "total": 34,
      "pending": 8,
      "approved": 24,
      "rejected": 1,
      "withdrawn": 1
    },
    "regularization": {
      "total": 18,
      "pending": 6,
      "approved": 10,
      "rejected": 2,
      "withdrawn": 0
    },
    "short_leave": {
      "total": 15,
      "pending": 3,
      "approved": 11,
      "rejected": 1,
      "withdrawn": 0
    },
    "overall": {
      "total_requests": 135,
      "pending_approvals": 34
    }
  }
}
```

---

## 5. Bulk Approve

**Endpoint:** `POST /api/attendance/admin/requests/bulk-approve`

**Request Body:**
```json
{
  "request_ids": [123, 124, 125, 126],
  "remarks": "Bulk approved for holiday season"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approved 4 requests, 0 failed",
  "data": {
    "success": [
      {
        "request_id": 123,
        "request_number": "WFR-LEAVE-2024-00001",
        "workflow_type": "Leave"
      },
      {
        "request_id": 124,
        "request_number": "WFR-ONDUTY-2024-00001",
        "workflow_type": "On Duty"
      },
      {
        "request_id": 125,
        "request_number": "WFR-WFH-2024-00001",
        "workflow_type": "WFH"
      },
      {
        "request_id": 126,
        "request_number": "WFR-SHORT-2024-00001",
        "workflow_type": "Short Leave"
      }
    ],
    "failed": []
  }
}
```

---

## 6. Bulk Reject

**Endpoint:** `POST /api/attendance/admin/requests/bulk-reject`

**Request Body:**
```json
{
  "request_ids": [127, 128],
  "remarks": "Insufficient documentation provided"
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
        "request_id": 127,
        "request_number": "WFR-REG-2024-00001",
        "workflow_type": "Regularization"
      },
      {
        "request_id": 128,
        "request_number": "WFR-LEAVE-2024-00002",
        "workflow_type": "Leave"
      }
    ],
    "failed": []
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Required fields: leave_type, from_date, to_date, duration, reason"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You can only withdraw your own requests"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Request not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to apply leave"
}
```

---

## Integration with Main App

Add to your `app.js` or `server.js`:

```javascript
const attendanceRequestRoutes = require('./src/routes/attendanceRequest.routes');

app.use('/api/attendance', attendanceRequestRoutes);
```

---

## Testing with cURL

### Apply for Leave
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "leave_type": "Annual Leave",
    "from_date": "2024-12-25",
    "to_date": "2024-12-27",
    "duration": 3,
    "reason": "Year-end vacation"
  }'
```

### Get All Pending Leave Requests (Admin)
```bash
curl -X GET "http://localhost:3000/api/attendance/admin/requests?type=leave&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Approve Request (Admin)
```bash
curl -X POST http://localhost:3000/api/attendance/admin/requests/123/action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "approve",
    "remarks": "Approved"
  }'
```

---

## Postman Collection

Import this JSON to test APIs:

```json
{
  "info": {
    "name": "Attendance Request APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Employee - Apply Leave",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/employee/leave/apply",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"leave_type\": \"Annual Leave\",\n  \"from_date\": \"2024-12-25\",\n  \"to_date\": \"2024-12-27\",\n  \"duration\": 3,\n  \"reason\": \"Vacation\"\n}"
        }
      }
    },
    {
      "name": "Admin - Get All Requests",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/admin/requests?type=leave&status=pending"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/attendance"
    }
  ]
}
```

---

**Generated with Claude Code** 🤖
**Date:** October 12, 2025
