# Employee Attendance Requests - UI Development Guide

## Overview
This document covers all employee self-service attendance request APIs for frontend integration.

**Base URL:** `/api/employee`

**Authentication:** All endpoints require Bearer token in Authorization header.

> **Note:** `employee_id`, `user_id`, and `company_id` are automatically extracted from the authenticated user's token. No need to send in request body.

---

## Workflow Master IDs
| ID | Request Type |
|----|--------------|
| 1 | Leave |
| 2 | On Duty |
| 3 | Regularization |
| 4 | WFH (Work From Home) |
| 5 | Short Leave |
| * | Restricted Holiday (dynamic ID - lookup by code 'RESTRICTED_HOLIDAY') |

---

## 1. Work From Home (WFH)

### Apply WFH
**Endpoint:** `POST /api/employee/wfh/apply`

Supports two modes:
- **Date Range Mode:** Continuous dates with same day_type
- **Specific Dates Mode:** Non-continuous dates with per-date day_type

#### Date Range Mode
```json
{
  "from_date": "2025-06-01",
  "to_date": "2025-06-05",
  "day_type": "full_day",
  "reason": "Working from home due to personal reasons",
  "work_plan": "Will complete pending reports and attend all meetings remotely",
  "attachment": "https://storage.example.com/wfh-approval.pdf"
}
```

#### Specific Dates Mode
```json
{
  "specific_dates": [
    { "date": "2025-06-01", "day_type": "full_day" },
    { "date": "2025-06-03", "day_type": "first_half" },
    { "date": "2025-06-05", "day_type": "second_half" }
  ],
  "reason": "Working from home for specific days",
  "work_plan": "Remote work plan details",
  "attachment": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| from_date | string | Yes* | Start date (YYYY-MM-DD) - for date range mode |
| to_date | string | Yes* | End date (YYYY-MM-DD) - for date range mode |
| specific_dates | array | Yes* | Array of dates - for specific dates mode |
| day_type | string | No | `full_day`, `first_half`, `second_half` (default: full_day) |
| reason | string | Yes | Reason for WFH |
| work_plan | string | No | Work plan during WFH |
| attachment | string | No | Attachment URL |

*Either `from_date + to_date` OR `specific_dates` is required, not both.

**Success Response (201):**
```json
{
  "success": true,
  "message": "WFH request submitted successfully",
  "data": {
    "request_number": "WFH-2025-0001",
    "request_id": 123,
    "request_status": "pending",
    "wfh_mode": "date_range",
    "dates": ["2025-06-01", "2025-06-05"],
    "duration": 5
  }
}
```

---

## 2. On Duty

### Apply On Duty
**Endpoint:** `POST /api/employee/onduty/apply`

Supports two modes:
- **Date Range Mode:** Continuous dates with same time
- **Specific Dates Mode:** Non-continuous dates with per-date time

#### Date Range Mode
```json
{
  "from_date": "2025-06-01",
  "to_date": "2025-06-03",
  "from_time": "09:00",
  "to_time": "18:00",
  "purpose": "Client site visit for project implementation",
  "location": "ABC Corporation, Mumbai",
  "attachment": "https://storage.example.com/onduty-approval.pdf"
}
```

#### Specific Dates Mode
```json
{
  "specific_dates": [
    { "date": "2025-06-01", "from_time": "09:00", "to_time": "18:00" },
    { "date": "2025-06-03", "from_time": "10:00", "to_time": "14:00" },
    { "date": "2025-06-05", "from_time": "14:00", "to_time": "18:00" }
  ],
  "purpose": "Multiple client visits",
  "location": "Various client locations",
  "attachment": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| from_date | string | Yes* | Start date (YYYY-MM-DD) - for date range mode |
| to_date | string | Yes* | End date (YYYY-MM-DD) - for date range mode |
| specific_dates | array | Yes* | Array of dates with time - for specific dates mode |
| from_time | string | No | Start time (HH:mm) - for date range mode |
| to_time | string | No | End time (HH:mm) - for date range mode |
| purpose | string | Yes | Purpose of on duty |
| location | string | Yes | Location of on duty |
| attachment | string | No | Attachment URL |

*Either `from_date + to_date` OR `specific_dates` is required, not both.

**Success Response (201):**
```json
{
  "success": true,
  "message": "On Duty request submitted successfully",
  "data": {
    "request_number": "OD-2025-0001",
    "request_id": 124,
    "request_status": "pending",
    "on_duty_mode": "date_range",
    "dates": ["2025-06-01", "2025-06-03"],
    "duration": 3
  }
}
```

---

## 3. Regularization

### Apply Regularization
**Endpoint:** `POST /api/employee/regularization/apply`

Used to regularize missed punch-in or punch-out for past dates.

**Request Body:**
```json
{
  "attendance_date": "2025-06-01",
  "punch_in": "09:00",
  "punch_out": "18:00",
  "reason": "Forgot to punch in due to urgent meeting",
  "attachment": "https://storage.example.com/meeting-invite.pdf"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attendance_date | string | Yes | Date to regularize (YYYY-MM-DD) - must be past date |
| punch_in | string | No* | Punch in time (HH:mm) |
| punch_out | string | No* | Punch out time (HH:mm) |
| reason | string | Yes | Reason for regularization |
| attachment | string | No | Supporting document URL |

*At least one of `punch_in` or `punch_out` is required.

**Validations:**
- Cannot regularize future dates
- At least one of punch_in or punch_out must be provided

**Success Response (201):**
```json
{
  "success": true,
  "message": "Regularization request submitted successfully",
  "data": {
    "request_number": "REG-2025-0001",
    "request_id": 125,
    "request_status": "pending",
    "attendance_date": "2025-06-01",
    "punch_in": "09:00",
    "punch_out": "18:00",
    "working_hours": 9
  }
}
```

---

## 4. Short Leave

### Apply Short Leave
**Endpoint:** `POST /api/employee/short-leave/apply`

For leaves less than 4 hours (e.g., doctor appointment, bank work).

**Request Body:**
```json
{
  "leave_date": "2025-06-15",
  "from_time": "10:00",
  "to_time": "12:00",
  "reason": "Doctor appointment"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| leave_date | string | Yes | Date of short leave (YYYY-MM-DD) - cannot be past date |
| from_time | string | Yes | Start time (HH:mm) |
| to_time | string | Yes | End time (HH:mm) |
| reason | string | Yes | Reason for short leave |

**Validations:**
- Cannot apply for past dates
- Maximum duration: 4 hours
- Time format: HH:mm (24-hour format)
- No overlapping short leaves allowed on same date
- Total short leave per day cannot exceed 4 hours

**Pay Day Classification:**
| Type | Condition |
|------|-----------|
| Late Come (2) | Short leave overlaps with shift start time |
| Early Go (3) | Short leave overlaps with shift end time |
| Mid Day (4) | Short leave during middle of shift |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Short Leave request submitted successfully",
  "data": {
    "request_number": "SL-2025-0001",
    "request_id": 126,
    "request_status": "pending",
    "leave_date": "2025-06-15",
    "from_time": "10:00",
    "to_time": "12:00",
    "duration_hours": 2
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "message": "Short leave cannot exceed 4 hours. Please apply for regular leave instead."
}
```
```json
{
  "success": false,
  "message": "Time overlap detected with existing short leave request (09:00 - 11:00). Please choose a different time slot."
}
```
```json
{
  "success": false,
  "message": "Total short leave duration for 2025-06-15 would be 5.00 hours, which exceeds the maximum limit of 4 hours per day."
}
```

---

## 5. Leave Application

### Apply Leave
**Endpoint:** `POST /api/employee/leave/apply`

Supports two modes:
- **Date Range Mode:** Continuous dates
- **Multiple Dates Mode:** Non-continuous specific dates

#### Date Range Mode
```json
{
  "leave_type": 1,
  "from_date": "2025-06-10",
  "to_date": "2025-06-12",
  "leave_mode": "full_day",
  "reason": "Family function",
  "contact_number": "9876543210",
  "attachments": "https://storage.example.com/invitation.pdf"
}
```

#### Multiple Dates Mode
```json
{
  "leave_type": 1,
  "specific_dates": [
    { "date": "2025-06-10", "day_type": "full_day" },
    { "date": "2025-06-15", "day_type": "first_half" },
    { "date": "2025-06-20", "day_type": "second_half" }
  ],
  "reason": "Personal work",
  "contact_number": "9876543210"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| leave_type | number | Yes | Leave type ID (from leave master) |
| from_date | string | Yes* | Start date (YYYY-MM-DD) |
| to_date | string | Yes* | End date (YYYY-MM-DD) |
| specific_dates | array | Yes* | Array of date objects |
| leave_mode | string | No | `full_day`, `first_half`, `second_half` (for date range) |
| reason | string | Yes | Reason for leave |
| contact_number | string | No | Contact number during leave |
| attachments | string | No | Attachment URL |

*Either `from_date + to_date` OR `specific_dates` is required.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "LV-2025-0001",
    "request_id": 127,
    "request_status": "pending",
    "leave_type": 1,
    "leave_mode": "full_day",
    "dates": ["2025-06-10", "2025-06-12"],
    "duration": 3
  }
}
```

### Get Leave Balance
**Endpoint:** `POST /api/employee/leave/balance`

**Request Body:** Empty `{}`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "employee_id": 10,
    "year": 2025,
    "leave_balances": [
      {
        "leave_type_id": 1,
        "master_id": 1,
        "leave_type": "Casual Leave",
        "leave_code": "CL",
        "total": 12,
        "used": 3,
        "remaining": 9,
        "pending": 2,
        "total_consumed_ytd": 3
      },
      {
        "leave_type_id": 2,
        "master_id": 2,
        "leave_type": "Sick Leave",
        "leave_code": "SL",
        "total": 10,
        "used": 1,
        "remaining": 9,
        "pending": 0,
        "total_consumed_ytd": 1
      }
    ]
  }
}
```

---

## 6. Restricted Holiday

Restricted holidays are optional holidays that employees can choose to take. Unlike national holidays (which are automatically off), employees need to apply for restricted holidays.

### Get Available Restricted Holidays
**Endpoint:** `POST /api/attendance/employee/restricted-holiday/available`

Returns list of restricted holidays applicable to the employee based on their holiday policy.

**Request Body:** Empty `{}`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "policy": {
      "id": 1,
      "calendar_name": "India Holiday Calendar 2025"
    },
    "restricted_holiday_count": 3,
    "used_count": 1,
    "pending_count": 1,
    "remaining_count": 1,
    "holidays": [
      {
        "id": 5,
        "holiday_name": "Holi",
        "holiday_date": "2025-03-14",
        "description": "Festival of Colors",
        "is_past": false,
        "is_applied": false,
        "applied_status": null,
        "can_apply": true
      },
      {
        "id": 8,
        "holiday_name": "Diwali",
        "holiday_date": "2025-10-20",
        "description": "Festival of Lights",
        "is_past": false,
        "is_applied": true,
        "applied_status": "pending",
        "can_apply": false
      },
      {
        "id": 3,
        "holiday_name": "Makar Sankranti",
        "holiday_date": "2025-01-14",
        "description": "Harvest Festival",
        "is_past": true,
        "is_applied": false,
        "applied_status": null,
        "can_apply": false
      }
    ]
  }
}
```

**Response when no policy configured:**
```json
{
  "success": true,
  "data": {
    "policy": null,
    "restricted_holiday_count": 0,
    "holidays": [],
    "message": "No holiday policy configured for this employee"
  }
}
```

**Response when restricted holidays not applicable:**
```json
{
  "success": true,
  "data": {
    "policy": {
      "id": 1,
      "calendar_name": "India Holiday Calendar 2025"
    },
    "restricted_holiday_count": 0,
    "holidays": [],
    "message": "Restricted holidays are not applicable for your holiday policy"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| policy | object/null | Employee's applicable holiday policy |
| restricted_holiday_count | number | Max restricted holidays allowed per year |
| used_count | number | Already approved restricted holidays |
| pending_count | number | Pending restricted holiday requests |
| remaining_count | number | Remaining restricted holidays employee can apply for |
| holidays | array | List of restricted holidays from the policy |
| holidays[].id | number | Holiday ID (from hrms_holiday_bank) |
| holidays[].holiday_name | string | Name of the holiday |
| holidays[].holiday_date | string | Date of the holiday (YYYY-MM-DD) |
| holidays[].description | string | Description of the holiday |
| holidays[].is_past | boolean | Whether the holiday date has passed |
| holidays[].is_applied | boolean | Whether employee has already applied for this holiday |
| holidays[].applied_status | string/null | Status of existing application: `pending`, `approved`, or `null` |
| holidays[].can_apply | boolean | Whether employee can apply (not past, not already applied, and remaining count > 0) |

### Apply for Restricted Holiday
**Endpoint:** `POST /api/attendance/employee/restricted-holiday/apply`

**Request Body:**
```json
{
  "holiday_id": 5,
  "reason": "Planning to celebrate with family"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| holiday_id | number | Yes | Holiday ID from the available list |
| reason | string | No | Optional reason for opting this holiday |

**Validations:**
- Holiday must be a restricted holiday (is_national_holiday = 0)
- Holiday date must not be in the past
- Employee must not have an existing pending/approved request for this holiday

**Success Response (201):**
```json
{
  "success": true,
  "message": "Restricted Holiday request submitted successfully",
  "data": {
    "request_number": "RH-2025-0001",
    "request_id": 128,
    "request_status": "pending",
    "holiday_name": "Holi",
    "holiday_date": "2025-03-14",
    "remaining_count": 1
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You already have a pending request for this restricted holiday (Holi)"
}
```
```json
{
  "success": false,
  "message": "Cannot apply for past restricted holidays"
}
```
```json
{
  "success": false,
  "message": "Invalid holiday_id. Restricted holiday not found or not active."
}
```
```json
{
  "success": false,
  "message": "No holiday policy configured for you. Please contact HR."
}
```
```json
{
  "success": false,
  "message": "This restricted holiday is not applicable to your holiday policy."
}
```
```json
{
  "success": false,
  "message": "You have already used/applied for all 3 restricted holidays allowed for this year."
}
```

---

## 7. Common APIs

### Get My Requests
**Endpoint:** `POST /api/employee/requests/my-requests`

**Request Body:**
```json
{
  "request_type": 1,
  "status": "pending",
  "from_date": "2025-01-01",
  "to_date": "2025-12-31",
  "limit": 20,
  "offset": 0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| request_type | number | No | 1=Leave, 2=OnDuty, 3=Regularization, 4=WFH, 5=ShortLeave, 6+=RestrictedHoliday (use workflow_code lookup) |
| status | string | No | `pending`, `approved`, `rejected`, `withdrawn` |
| from_date | string | No | Filter from date (YYYY-MM-DD) |
| to_date | string | No | Filter to date (YYYY-MM-DD) |
| limit | number | No | Records per page (default: 20) |
| offset | number | No | Skip records (default: 0) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "request_number": "WFH-2025-0001",
      "workflow_master_id": 3,
      "workflow_name": "Work From Home",
      "workflow_code": "WFH",
      "leave_type_id": null,
      "leave_code": null,
      "leave_name": null,
      "request_status": "pending",
      "from_date": "2025-06-01",
      "to_date": "2025-06-05",
      "submitted_at": "2025-05-25T10:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 15
  }
}
```

### Get Request Details
**Endpoint:** `POST /api/employee/requests/details`

**Request Body:**
```json
{
  "request_id": 123
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 123,
      "request_number": "WFH-2025-0001",
      "workflow_master_id": 3,
      "workflow_name": "Work From Home",
      "workflow_code": "WFH",
      "request_status": "pending",
      "overall_status": "in_progress",
      "current_stage": "Manager Approval",
      "from_date": "2025-06-01",
      "to_date": "2025-06-05",
      "request_data": {
        "wfh_mode": "date_range",
        "reason": "Working from home",
        "work_plan": "Complete reports"
      },
      "submitted_at": "2025-05-25T10:30:00.000Z",
      "completed_at": null
    },
    "approvers": [
      {
        "assignment_id": 1,
        "stage_id": 1,
        "stage_name": "Manager Approval",
        "stage_order": 1,
        "approver_type": "reporting_manager",
        "approver_id": 5,
        "approver_name": "John Smith",
        "approver_code": "EMP005",
        "assignment_status": "pending",
        "assigned_at": "2025-05-25T10:30:00.000Z",
        "sla_due_date": "2025-05-27T10:30:00.000Z"
      }
    ],
    "action_history": [
      {
        "action_id": 1,
        "stage_name": "Submission",
        "action_type": "submit",
        "action_by_name": "Employee Name",
        "remarks": null,
        "action_result": "submitted",
        "action_taken_at": "2025-05-25T10:30:00.000Z"
      }
    ]
  }
}
```

### Withdraw Request
**Endpoint:** `POST /api/employee/requests/withdraw`

**Request Body:**
```json
{
  "request_id": 123,
  "withdrawal_reason": "Plans changed, no longer needed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request withdrawn successfully",
  "data": {
    "request_id": 123,
    "request_number": "WFH-2025-0001",
    "request_status": "withdrawn",
    "attendance_entries_withdrawn": 5,
    "withdrawn_date": "2025-05-26T10:00:00.000Z"
  }
}
```

> **Note:** When a request is withdrawn, corresponding entries in `HrmsDailyAttendance` table are soft deleted (status changed to 'withdrawn'). The `attendance_entries_withdrawn` field shows how many attendance records were updated.

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot withdraw completed request"
}
```

---

## 8. Holiday List (Employee View)

### Get My Holidays
**Endpoint:** `POST /api/holiday/employee/list`

Returns holidays applicable to the employee based on their holiday policy.

**Request Body:**
```json
{
  "year": 2025,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| year | number | No | Filter by year |
| start_date | string | No | Filter from date (YYYY-MM-DD) |
| end_date | string | No | Filter to date (YYYY-MM-DD) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "holiday_name": "Republic Day",
      "holiday_date": "2025-01-26",
      "is_national_holiday": 1,
      "description": "Republic Day of India"
    },
    {
      "id": 2,
      "holiday_name": "Holi",
      "holiday_date": "2025-03-14",
      "is_national_holiday": 0,
      "description": "Festival of Colors"
    }
  ],
  "total": 15
}
```

---

## Form Validations

### WFH Form
```javascript
const validationRules = {
  reason: { required: true, minLength: 10, message: "Reason is required (min 10 chars)" },
  from_date: { required: true, type: "date", format: "YYYY-MM-DD" },
  to_date: { required: true, type: "date", afterOrEqual: "from_date" },
  day_type: { oneOf: ["full_day", "first_half", "second_half"] },
  specific_dates: {
    type: "array",
    items: {
      date: { required: true, type: "date" },
      day_type: { oneOf: ["full_day", "first_half", "second_half"] }
    }
  }
};
```

### On Duty Form
```javascript
const validationRules = {
  purpose: { required: true, minLength: 10, message: "Purpose is required" },
  location: { required: true, message: "Location is required" },
  from_date: { required: true, type: "date" },
  to_date: { required: true, afterOrEqual: "from_date" },
  from_time: { type: "time", format: "HH:mm" },
  to_time: { type: "time", format: "HH:mm", after: "from_time" }
};
```

### Regularization Form
```javascript
const validationRules = {
  attendance_date: { required: true, type: "date", beforeOrEqual: "today" },
  punch_in: { type: "time", format: "HH:mm" },
  punch_out: { type: "time", format: "HH:mm" },
  reason: { required: true, minLength: 10 },
  // Custom: At least one of punch_in or punch_out required
};
```

### Short Leave Form
```javascript
const validationRules = {
  leave_date: { required: true, type: "date", afterOrEqual: "today" },
  from_time: { required: true, type: "time", format: "HH:mm" },
  to_time: { required: true, type: "time", after: "from_time" },
  reason: { required: true, minLength: 5 },
  // Custom: Duration must be <= 4 hours
};
```

### Restricted Holiday Form
```javascript
const validationRules = {
  holiday_id: { required: true, type: "number", message: "Please select a holiday" },
  reason: { required: false, maxLength: 500 }
  // Custom: holiday must have can_apply: true
};
```

---

## State Management

```javascript
const attendanceRequestState = {
  // WFH
  wfh: {
    loading: false,
    error: null
  },
  // On Duty
  onDuty: {
    loading: false,
    error: null
  },
  // Regularization
  regularization: {
    loading: false,
    error: null
  },
  // Short Leave
  shortLeave: {
    loading: false,
    error: null
  },
  // Leave
  leave: {
    balance: [],
    loading: false,
    error: null
  },
  // Restricted Holiday
  restrictedHoliday: {
    available: [],
    loading: false,
    error: null
  },
  // My Requests
  myRequests: {
    data: [],
    pagination: { limit: 20, offset: 0, total: 0 },
    loading: false,
    error: null
  },
  // Current Request Details
  currentRequest: {
    data: null,
    loading: false,
    error: null
  },
  // Holidays
  holidays: {
    data: [],
    loading: false,
    error: null
  }
};
```

---

## Error Handling

| Error Message | UI Action |
|---------------|-----------|
| "Required field: reason" | Show validation error on reason field |
| "Cannot apply short leave for past dates" | Show error toast, highlight date field |
| "Short leave cannot exceed 4 hours" | Show error, suggest applying regular leave |
| "Time overlap detected" | Show error with existing time slot details |
| "Cannot regularize future dates" | Show error, highlight date field |
| "At least one of punch_in or punch_out is required" | Show validation error |
| "Cannot withdraw completed request" | Show info toast |
| "Request not found" | Redirect to list with error |
| "Cannot apply for past restricted holidays" | Show error, disable Apply button for past holidays |
| "You already have a pending request for this restricted holiday" | Show info toast, update UI to show pending status |
| "Invalid holiday_id. Restricted holiday not found or not active." | Show error, refresh holiday list |

---

## Sample API Integration (Axios)

```javascript
import axios from 'axios';

const employeeAttendanceAPI = {
  // WFH
  applyWFH: (data) => axios.post('/api/employee/wfh/apply', data),

  // On Duty
  applyOnDuty: (data) => axios.post('/api/employee/onduty/apply', data),

  // Regularization
  applyRegularization: (data) => axios.post('/api/employee/regularization/apply', data),

  // Short Leave
  applyShortLeave: (data) => axios.post('/api/employee/short-leave/apply', data),

  // Leave
  applyLeave: (data) => axios.post('/api/employee/leave/apply', data),
  getLeaveBalance: () => axios.post('/api/employee/leave/balance', {}),

  // Restricted Holiday
  getAvailableRestrictedHolidays: () => axios.post('/api/attendance/employee/restricted-holiday/available', {}),
  applyRestrictedHoliday: (data) => axios.post('/api/attendance/employee/restricted-holiday/apply', data),

  // Common
  getMyRequests: (filters) => axios.post('/api/employee/requests/my-requests', filters),
  getRequestDetails: (request_id) => axios.post('/api/employee/requests/details', { request_id }),
  withdrawRequest: (request_id, reason) =>
    axios.post('/api/employee/requests/withdraw', { request_id, withdrawal_reason: reason }),

  // Holidays
  getMyHolidays: (filters) => axios.post('/api/holiday/employee/list', filters)
};

export default employeeAttendanceAPI;
```

---

## UI Component Suggestions

### 1. Request Type Tabs
```
[ Leave ] [ WFH ] [ On Duty ] [ Regularization ] [ Short Leave ] [ Restricted Holiday ]
```

### 2. Date Selection Modes
- Toggle between "Date Range" and "Specific Dates" mode
- Date Range: Two date pickers (From, To)
- Specific Dates: Multi-date picker with day_type selection per date

### 3. Day Type Selection
```
[ Full Day ] [ First Half ] [ Second Half ]
```

### 4. Request Status Badges
```
pending   - Yellow/Orange
approved  - Green
rejected  - Red
withdrawn - Gray
```

### 5. My Requests List
- Filter by request type
- Filter by status
- Date range filter
- Pagination

### 6. Request Details Modal
- Show request info
- Show approval workflow stages
- Show action history timeline
- Withdraw button (if pending)

### 7. Restricted Holiday List
- Show all restricted holidays for current year
- Status indicator for each holiday:
  - `can_apply: true` - Show "Apply" button (green)
  - `is_applied: true, applied_status: pending` - Show "Pending" badge (yellow)
  - `is_applied: true, applied_status: approved` - Show "Approved" badge (green)
  - `is_past: true` - Show "Past" badge (gray), disable row
- Holiday cards with:
  - Holiday name
  - Date
  - Description
  - Action button/status badge
