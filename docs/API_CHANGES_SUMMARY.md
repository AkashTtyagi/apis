# Attendance Request APIs - Changes Summary

## Overview
All attendance request APIs have been converted from GET to POST for consistency and security.

---

## Key Changes

### 1. **All APIs Now Use POST Method**
- **Before:** Mix of GET and POST methods
- **After:** All APIs use POST method exclusively

### 2. **Parameters Moved to Request Body**
- **Before:** Query parameters (`?type=leave&status=pending`) and URL parameters (`/:requestId`)
- **After:** All parameters in request body (JSON)

### 3. **Request Type Now Uses Numbers**
- **Before:** String values (`'leave'`, `'onduty'`, `'wfh'`, etc.)
- **After:** Numeric values sent directly from frontend
  - `1` = Leave
  - `2` = On Duty
  - `3` = WFH
  - `4` = Regularization
  - `5` = Short Leave

**Note:** No server-side typeMap conversion needed. Frontend sends numbers directly.

---

## Changed APIs

### Employee APIs

| Old API | New API | Method Change | Parameter Change |
|---------|---------|---------------|------------------|
| `GET /employee/requests/my-requests?type=leave&status=pending` | `POST /employee/requests/my-requests` | GET → POST | Query → Body: `{request_type: 1, status: 'pending'}` |
| `GET /employee/requests/:requestId` | `POST /employee/requests/details` | GET → POST | Param → Body: `{request_id: 123}` |
| `POST /employee/requests/:requestId/withdraw` | `POST /employee/requests/withdraw` | POST (same) | Param → Body: `{request_id: 123, withdrawal_reason: '...'}` |
| `GET /employee/leave/balance` | `POST /employee/leave/balance` | GET → POST | No params → Body: `{}` |

### Admin APIs

| Old API | New API | Method Change | Parameter Change |
|---------|---------|---------------|------------------|
| `GET /admin/requests?type=leave&status=pending` | `POST /admin/requests/list` | GET → POST | Query → Body: `{request_type: 1, status: 'pending', ...}` |
| `GET /admin/requests/:requestId` | `POST /admin/requests/details` | GET → POST | Param → Body: `{request_id: 123}` |
| `POST /admin/requests/:requestId/action` | `POST /admin/requests/action` | POST (same) | Param → Body: `{request_id: 123, action: 'approve', ...}` |
| `GET /admin/requests/dashboard?from_date=...` | `POST /admin/requests/dashboard` | GET → POST | Query → Body: `{from_date: '...', to_date: '...'}` |

### Manager APIs

| Old API | New API | Method Change | Parameter Change |
|---------|---------|---------------|------------------|
| `GET /manager/leave/balance/:employee_id` | `POST /manager/leave/balance` | GET → POST | Param → Body: `{employee_id: 123}` |
| `GET /admin/leave/balance/:employee_id` | `POST /admin/leave/balance` | GET → POST | Param → Body: `{employee_id: 123}` |

---

## Request Type Mapping (Frontend Reference)

```javascript
// Frontend should send these numeric values directly
const REQUEST_TYPES = {
  LEAVE: 1,
  ON_DUTY: 2,
  WFH: 3,
  REGULARIZATION: 4,
  SHORT_LEAVE: 5
};

// Example usage:
const requestData = {
  request_type: REQUEST_TYPES.LEAVE,  // Send 1, not 'leave'
  status: 'pending'
};
```

---

## Detailed API Changes

### 1. Get My Requests (Employee)

**Before:**
```http
GET /api/attendance/employee/requests/my-requests?type=leave&status=pending&limit=20
```

**After:**
```http
POST /api/attendance/employee/requests/my-requests
Content-Type: application/json

{
  "request_type": 1,           // 1=leave, 2=onduty, 3=wfh, 4=regularization, 5=short-leave
  "status": "pending",
  "from_date": "2025-11-01",
  "to_date": "2025-11-30",
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45
  }
}
```

---

### 2. Get Request Details (Employee)

**Before:**
```http
GET /api/attendance/employee/requests/248
```

**After:**
```http
POST /api/attendance/employee/requests/details
Content-Type: application/json

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
    // ... full request details
  }
}
```

---

### 3. Withdraw Request (Employee)

**Before:**
```http
POST /api/attendance/employee/requests/248/withdraw
Content-Type: application/json

{
  "remarks": "No longer needed"
}
```

**After:**
```http
POST /api/attendance/employee/requests/withdraw
Content-Type: application/json

{
  "request_id": 248,
  "withdrawal_reason": "No longer needed"
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

### 4. Get Leave Balance (Employee)

**Before:**
```http
GET /api/attendance/employee/leave/balance
```

**After:**
```http
POST /api/attendance/employee/leave/balance
Content-Type: application/json

{}
```
*Note: Empty body, uses logged-in employee from JWT token*

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
        "available": 7.5,
        // ... more fields
      }
    ]
  }
}
```

---

### 5. Get All Requests (Admin)

**Before:**
```http
GET /api/attendance/admin/requests?type=leave&status=pending&employee_id=123&limit=50
```

**After:**
```http
POST /api/attendance/admin/requests/list
Content-Type: application/json

{
  "request_type": 1,              // 1-5 or omit for all types
  "status": "pending",
  "employee_id": 123,
  "department_id": 5,
  "manager_id": 45,
  "leave_type": "CL",
  "from_date": "2025-11-01",
  "to_date": "2025-11-30",
  "applied_by_role": "employee",
  "search": "John Doe",
  "limit": 50,
  "offset": 0,
  "sort_by": "applied_date",
  "sort_order": "desc"
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
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

### 6. Get Request Details (Admin)

**Before:**
```http
GET /api/attendance/admin/requests/248
```

**After:**
```http
POST /api/attendance/admin/requests/details
Content-Type: application/json

{
  "request_id": 248
}
```

**Response:** Same as before, with full request details

---

### 7. Admin Action on Request

**Before:**
```http
POST /api/attendance/admin/requests/248/action
Content-Type: application/json

{
  "action": "approve",
  "remarks": "Approved by admin"
}
```

**After:**
```http
POST /api/attendance/admin/requests/action
Content-Type: application/json

{
  "request_id": 248,
  "action": "approve",
  "remarks": "Approved by admin"
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

---

### 8. Get Dashboard Stats (Admin)

**Before:**
```http
GET /api/attendance/admin/requests/dashboard?from_date=2025-11-01&to_date=2025-11-30
```

**After:**
```http
POST /api/attendance/admin/requests/dashboard
Content-Type: application/json

{
  "from_date": "2025-11-01",
  "to_date": "2025-11-30"
}
```

**Response:** Same as before, with dashboard statistics

---

### 9. Get Employee Leave Balance (Manager/Admin)

**Before:**
```http
GET /api/attendance/manager/leave/balance/123
GET /api/attendance/admin/leave/balance/123
```

**After:**
```http
POST /api/attendance/manager/leave/balance
POST /api/attendance/admin/leave/balance
Content-Type: application/json

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
        "available": 7.5,
        // ... more fields
      }
    ]
  }
}
```

---

## Files Modified

### 1. Routes
- `src/routes/attendanceRequest.routes.js`
  - Converted all GET routes to POST
  - Updated route paths (removed `:requestId` params)
  - Updated comments and documentation

### 2. Controllers
- `src/controllers/employee/employeeAttendanceRequest.controller.js`
  - Updated `getMyRequests()` - `req.query` → `req.body`
  - Updated `getRequestDetails()` - `req.params.requestId` → `req.body.request_id`
  - Updated `withdrawRequest()` - `req.params.requestId` → `req.body.request_id`
  - Updated `getLeaveBalance()` - GET → POST

- `src/controllers/admin/adminAttendanceRequest.controller.js`
  - Updated `getAllRequests()` - `req.query` → `req.body`, added pagination
  - Updated `getRequestDetails()` - `req.params.requestId` → `req.body.request_id`
  - Updated `adminActionOnRequest()` - `req.params.requestId` → `req.body.request_id`
  - Updated `getDashboardStats()` - `req.query` → `req.body`

- `src/controllers/manager/managerAttendanceRequest.controller.js`
  - Updated `getEmployeeLeaveBalance()` - `req.params.employee_id` → `req.body.employee_id`

### 3. Documentation
- `docs/ESS_ATTENDANCE_REQUESTS_UI.md` - Updated with POST APIs
- `docs/ADMIN_ATTENDANCE_REQUESTS_UI.md` - Updated with POST APIs

---

## Migration Guide for Frontend

### Step 1: Update API Endpoints

```javascript
// OLD
const response = await fetch(
  `/api/attendance/employee/requests/my-requests?type=leave&status=pending`
);

// NEW
const response = await fetch(
  `/api/attendance/employee/requests/my-requests`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_type: 1,  // 1=leave
      status: 'pending'
    })
  }
);
```

### Step 2: Update Request Type Constants

```javascript
// Create constants file
export const REQUEST_TYPES = {
  LEAVE: 1,
  ON_DUTY: 2,
  WFH: 3,
  REGULARIZATION: 4,
  SHORT_LEAVE: 5
};

// Usage
import { REQUEST_TYPES } from './constants';

const filters = {
  request_type: REQUEST_TYPES.LEAVE,  // Send 1, not 'leave'
  status: 'pending'
};
```

### Step 3: Update Parameter Names

```javascript
// OLD
const requestId = 248;
await fetch(`/api/attendance/employee/requests/${requestId}`);

// NEW
await fetch(`/api/attendance/employee/requests/details`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ request_id: 248 })
});
```

### Step 4: Update Pagination

```javascript
// OLD - Query parameters
const url = `/api/attendance/admin/requests?limit=50&offset=100`;

// NEW - Body parameters
const response = await fetch(`/api/attendance/admin/requests/list`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    limit: 50,
    offset: 100
  })
});

const { data, pagination } = await response.json();
console.log(pagination.total); // Total records
```

---

## Benefits of These Changes

1. **Consistency:** All APIs now use POST method
2. **Security:** No sensitive data in URL (query params/path)
3. **Flexibility:** Request body supports complex filtering
4. **Simplicity:** Frontend sends numbers directly, no string mapping needed
5. **Better Logging:** POST bodies are easier to log securely
6. **Standards:** Follows REST API best practices

---

## Testing Checklist

- [ ] Test all employee APIs with new POST format
- [ ] Test all admin APIs with new POST format
- [ ] Test all manager APIs with new POST format
- [ ] Verify request_type accepts numbers 1-5
- [ ] Verify pagination works in request body
- [ ] Test error handling for missing required fields
- [ ] Update frontend API calls
- [ ] Update API documentation
- [ ] Test backward compatibility (if needed)

---

## Support

For questions or issues, refer to:
- Routes: `src/routes/attendanceRequest.routes.js`
- Controllers: `src/controllers/employee/`, `src/controllers/admin/`, `src/controllers/manager/`
- Documentation: `docs/ESS_ATTENDANCE_REQUESTS_UI.md`, `docs/ADMIN_ATTENDANCE_REQUESTS_UI.md`
