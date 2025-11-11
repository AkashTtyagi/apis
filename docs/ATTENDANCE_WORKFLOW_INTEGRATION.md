# Attendance & Workflow Integration Guide

## Overview

The `hrms_daily_attendance` table integrates seamlessly with the workflow system to track all types of attendance - regular punch in/out, leaves, on duty, and WFH.

---

## How It Works

### Attendance Types Based on `workflow_master_id`

| workflow_master_id | Type | Description |
|-------------------|------|-------------|
| `NULL` | Regular Attendance | Normal punch in/out |
| `1` | Leave | Leave request approved |
| `2` | On Duty | On duty request approved |
| `3` | WFH | Work from home approved |

### Integration Flow

**Example: Employee applies for 3 days leave**

1. **Workflow Request Created:**
   ```javascript
   // 1 entry in hrms_workflow_requests
   {
     id: 123,
     request_number: "WFR-LEAVE-2024-00001",
     workflow_master_id: 1,  // Leave
     employee_id: 45,
     request_data: {
       leave_type: "Annual Leave",
       from_date: "2024-12-25",
       to_date: "2024-12-27",
       duration: 3
     },
     request_status: "pending"
   }
   ```

2. **When Request is APPROVED:**
   ```javascript
   // 3 entries created in hrms_daily_attendance (one per day)
   [
     {
       employee_id: 45,
       attendance_date: "2024-12-25",
       request_id: 123,
       workflow_master_id: 1,  // Leave
       pay_day: 1,  // Full day
       is_paid: true,  // Paid leave
       leave_type: "Annual Leave"
     },
     {
       employee_id: 45,
       attendance_date: "2024-12-26",
       request_id: 123,
       workflow_master_id: 1,
       pay_day: 1,
       is_paid: true,
       leave_type: "Annual Leave"
     },
     {
       employee_id: 45,
       attendance_date: "2024-12-27",
       request_id: 123,
       workflow_master_id: 1,
       pay_day: 1,
       is_paid: true,
       leave_type: "Annual Leave"
     }
   ]
   ```

---

## Database Schema

### Key Fields

```sql
-- Primary identification
employee_id        -- FK to hrms_employee
company_id         -- Company ID
attendance_date    -- Date of attendance

-- Workflow Integration
request_id         -- FK to hrms_workflow_requests (NULL for regular attendance)
workflow_master_id -- FK to hrms_workflow_master (NULL for regular attendance)

-- Pay Type
pay_day           -- 1=Full Day, 2=First Half, 3=Second Half, 4=Unpaid
is_paid           -- TRUE for paid, FALSE for unpaid (LWP)

-- Punch Details (for regular attendance)
punch_in          -- Actual punch in time
punch_out         -- Actual punch out time
punch_in_location -- Location (lat,long or address)
punch_out_location

-- Shift Details (expected times)
shift_id          -- FK to shift master
shift_punch_in    -- Expected shift start
shift_punch_out   -- Expected shift end

-- Work Hours Calculation
total_hours       -- Total working hours
break_hours       -- Break time
overtime_hours    -- OT hours
late_by_minutes   -- Minutes late
early_out_by_minutes

-- Regularization
is_approved       -- For manual/regularization entries
approved_by       -- Approver user_id
approved_at       -- Approval timestamp
```

---

## Important Design Decisions

### 1. No `attendance_status` Field
**Why?** `workflow_master_id` already indicates the type:
- NULL = Present (regular attendance)
- 1 = Leave
- 2 = On Duty
- 3 = WFH

This follows DRY principle and avoids data redundancy.

### 2. No Unique Constraint on (employee_id, attendance_date)
**Why?** Multiple entries allowed for same date to support **regularization scenarios**:

**Example:**
```javascript
// Scenario: Employee forgets to punch out
// Day 1 - Actual attendance
{
  employee_id: 45,
  attendance_date: "2024-12-20",
  punch_in: "2024-12-20 09:00:00",
  punch_out: null,  // Forgot to punch out
  request_id: null,
  workflow_master_id: null
}

// Day 2 - Employee applies for regularization
{
  employee_id: 45,
  attendance_date: "2024-12-20",  // Same date!
  punch_in: "2024-12-20 09:00:00",
  punch_out: "2024-12-20 18:00:00",  // Corrected punch out
  request_id: 125,  // Regularization workflow request
  workflow_master_id: 4,  // Regularization
  is_approved: true
}
```

### 3. No Entries for Holidays/Week-offs
**Why?** These are derived from employee calendar, not stored here.

**Attendance calculation logic:**
```javascript
// Get all dates in month
const allDates = getAllDatesInMonth(month, year);

for (const date of allDates) {
  // Check if holiday/week-off from employee calendar
  if (isHoliday(date) || isWeekOff(date)) {
    // Skip - don't check attendance table
    continue;
  }

  // Check attendance table for this date
  const attendance = await HrmsDailyAttendance.findOne({
    where: { employee_id, attendance_date: date }
  });

  if (!attendance) {
    // Mark as Absent
  } else if (attendance.workflow_master_id === 1) {
    // Mark as Leave
  } else if (attendance.workflow_master_id === 2) {
    // Mark as On Duty
  } else if (attendance.workflow_master_id === 3) {
    // Mark as WFH
  } else if (attendance.workflow_master_id === null) {
    // Regular attendance - check punch in/out
  }
}
```

---

## Usage Examples

### 1. Create Regular Attendance Entry (Punch In/Out)

```javascript
const HrmsDailyAttendance = require('./src/models/HrmsDailyAttendance');

// When employee punches in
const attendance = await HrmsDailyAttendance.create({
  employee_id: 45,
  company_id: 1,
  attendance_date: '2024-12-20',
  punch_in: new Date(),
  punch_in_location: '28.6139,77.2090',
  shift_id: 1,
  shift_punch_in: '09:00:00',
  shift_punch_out: '18:00:00',
  workflow_master_id: null,  // Regular attendance
  request_id: null
});

// When employee punches out
await attendance.update({
  punch_out: new Date(),
  punch_out_location: '28.6139,77.2090',
  total_hours: 9.0,
  break_hours: 1.0,
  late_by_minutes: 15
});
```

### 2. Create Attendance from Approved Leave Request

```javascript
const { HrmsWorkflowRequest } = require('./src/models/workflow');
const HrmsDailyAttendance = require('./src/models/HrmsDailyAttendance');
const moment = require('moment');

// After leave request is approved
const createAttendanceFromLeave = async (requestId) => {
  const request = await HrmsWorkflowRequest.findByPk(requestId);

  const { from_date, to_date, leave_type } = request.request_data;

  // Create attendance entry for each day
  const dates = getDateRange(from_date, to_date);

  for (const date of dates) {
    await HrmsDailyAttendance.create({
      employee_id: request.employee_id,
      company_id: request.company_id,
      attendance_date: date,
      request_id: requestId,
      workflow_master_id: 1,  // Leave
      pay_day: 1,  // Full day
      is_paid: true,  // Paid leave (or false for LWP)
      leave_type: leave_type
    });
  }
};
```

### 3. Get Employee Attendance for Month

```javascript
const getMonthlyAttendance = async (employeeId, month, year) => {
  const startDate = `${year}-${month}-01`;
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

  const attendance = await HrmsDailyAttendance.findAll({
    where: {
      employee_id: employeeId,
      attendance_date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: HrmsWorkflowRequest,
        as: 'workflowRequest',
        attributes: ['request_number', 'request_data']
      },
      {
        model: HrmsWorkflowMaster,
        as: 'workflowMaster',
        attributes: ['workflow_for_name', 'workflow_code']
      }
    ],
    order: [['attendance_date', 'ASC']]
  });

  return attendance;
};
```

### 4. Calculate Attendance Summary

```javascript
const getAttendanceSummary = async (employeeId, month, year) => {
  const attendance = await getMonthlyAttendance(employeeId, month, year);

  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
    onDuty: 0,
    wfh: 0,
    late: 0,
    totalWorkingHours: 0
  };

  for (const record of attendance) {
    if (record.workflow_master_id === null) {
      // Regular attendance
      if (record.punch_in && record.punch_out) {
        summary.present++;
        summary.totalWorkingHours += parseFloat(record.total_hours || 0);
        if (record.late_by_minutes > 0) {
          summary.late++;
        }
      }
    } else if (record.workflow_master_id === 1) {
      summary.leave++;
    } else if (record.workflow_master_id === 2) {
      summary.onDuty++;
    } else if (record.workflow_master_id === 3) {
      summary.wfh++;
    }

    if (record.pay_day === 2 || record.pay_day === 3) {
      summary.halfDay++;
    }
  }

  // Calculate absent days
  const workingDaysInMonth = getWorkingDaysInMonth(employeeId, month, year);
  const totalMarkedDays = summary.present + summary.leave + summary.onDuty + summary.wfh;
  summary.absent = workingDaysInMonth - totalMarkedDays;

  return summary;
};
```

### 5. Handle Regularization

```javascript
// Employee applies for regularization (forgot to punch out)
const applyRegularization = async (employeeId, date, punchOut) => {
  // Find existing incomplete attendance
  const existingAttendance = await HrmsDailyAttendance.findOne({
    where: {
      employee_id: employeeId,
      attendance_date: date,
      punch_out: null
    }
  });

  if (!existingAttendance) {
    throw new Error('No incomplete attendance found');
  }

  // Create workflow request for regularization
  const request = await HrmsWorkflowRequest.create({
    workflow_master_id: 4,  // Regularization
    employee_id: employeeId,
    request_data: {
      attendance_date: date,
      punch_in: existingAttendance.punch_in,
      punch_out: punchOut,
      reason: 'Forgot to punch out'
    }
  });

  // After approval, create new corrected attendance entry
  // (keeping old one for audit trail)
  await HrmsDailyAttendance.create({
    employee_id: employeeId,
    company_id: existingAttendance.company_id,
    attendance_date: date,
    request_id: request.id,
    workflow_master_id: 4,  // Regularization
    punch_in: existingAttendance.punch_in,
    punch_out: punchOut,
    total_hours: calculateHours(existingAttendance.punch_in, punchOut),
    is_approved: true
  });
};
```

---

## Integration with Workflow Execution Service

Add this to `src/services/workflow/workflowExecution.service.js`:

```javascript
const HrmsDailyAttendance = require('../../models/HrmsDailyAttendance');
const moment = require('moment');

/**
 * Create attendance entries when workflow is approved
 */
const createAttendanceFromWorkflow = async (requestId) => {
    try {
        const request = await HrmsWorkflowRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        // Only create attendance for certain workflow types
        const workflowTypesWithAttendance = [1, 2, 3];  // Leave, OnDuty, WFH

        if (!workflowTypesWithAttendance.includes(request.workflow_master_id)) {
            return;
        }

        const { from_date, to_date, leave_type, duration } = request.request_data;

        // Generate date range
        const dates = [];
        let currentDate = moment(from_date);
        const endDate = moment(to_date);

        while (currentDate.isSameOrBefore(endDate)) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }

        // Create attendance entry for each day
        for (const date of dates) {
            await HrmsDailyAttendance.create({
                employee_id: request.employee_id,
                company_id: request.company_id,
                attendance_date: date,
                request_id: requestId,
                workflow_master_id: request.workflow_master_id,
                pay_day: 1,  // Full day (can be customized based on request_data)
                is_paid: request.request_data.is_paid !== false,  // Default to paid
                leave_type: leave_type || null,
                remarks: `Created from workflow request ${request.request_number}`
            });
        }

        console.log(`✓ Created ${dates.length} attendance entries for request ${request.request_number}`);

    } catch (error) {
        console.error('Error creating attendance from workflow:', error);
        throw error;
    }
};

// Call this function in finalizeRequest() after approval
```

---

## API Endpoints (To be implemented)

### Get Monthly Attendance
```javascript
GET /api/attendance/monthly/:employeeId/:month/:year

Response:
{
  "success": true,
  "data": {
    "employee_id": 45,
    "month": 12,
    "year": 2024,
    "attendance": [
      {
        "attendance_date": "2024-12-20",
        "type": "present",
        "punch_in": "2024-12-20 09:15:00",
        "punch_out": "2024-12-20 18:30:00",
        "total_hours": 9.0,
        "late_by_minutes": 15
      },
      {
        "attendance_date": "2024-12-25",
        "type": "leave",
        "leave_type": "Annual Leave",
        "is_paid": true,
        "request_number": "WFR-LEAVE-2024-00001"
      }
    ],
    "summary": {
      "present": 18,
      "absent": 2,
      "leave": 3,
      "onDuty": 1,
      "wfh": 2,
      "totalWorkingDays": 26
    }
  }
}
```

### Punch In/Out
```javascript
POST /api/attendance/punch-in
{
  "employee_id": 45,
  "location": "28.6139,77.2090"
}

POST /api/attendance/punch-out
{
  "employee_id": 45,
  "location": "28.6139,77.2090"
}
```

---

## Model Associations

```javascript
// HrmsDailyAttendance belongs to:
- HrmsEmployee (employee_id)
- HrmsWorkflowRequest (request_id)
- HrmsWorkflowMaster (workflow_master_id)
- HrmsUser (approved_by)

// HrmsWorkflowRequest has many:
- HrmsDailyAttendance (attendanceRecords)

// HrmsWorkflowMaster has many:
- HrmsDailyAttendance (attendanceRecords)
```

---

## Queries

### Find all leaves taken by employee
```sql
SELECT * FROM hrms_daily_attendance
WHERE employee_id = 45
  AND workflow_master_id = 1  -- Leave
  AND attendance_date BETWEEN '2024-01-01' AND '2024-12-31';
```

### Find employees who were late more than 3 times
```sql
SELECT employee_id, COUNT(*) as late_count
FROM hrms_daily_attendance
WHERE late_by_minutes > 0
  AND attendance_date BETWEEN '2024-12-01' AND '2024-12-31'
GROUP BY employee_id
HAVING late_count > 3;
```

### Find all regularization entries
```sql
SELECT a.*, w.request_number
FROM hrms_daily_attendance a
LEFT JOIN hrms_workflow_requests w ON a.request_id = w.id
WHERE a.workflow_master_id = 4  -- Regularization
  AND a.is_approved = TRUE;
```

---

## Benefits of This Design

1. **Single Source of Truth:** All attendance data in one table
2. **Workflow Integration:** Seamless linking with workflow requests
3. **Flexibility:** Supports regularization via multiple entries
4. **Audit Trail:** Complete history maintained
5. **Performance:** Proper indexes for fast queries
6. **Scalability:** Works for any company size
7. **No Redundancy:** workflow_master_id eliminates need for attendance_status

---

**Generated with Claude Code** 🤖
**Date:** October 12, 2025
