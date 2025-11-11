# Leave Application - Date Range & Multiple Dates Support

## Overview
Leave apply करने के लिए अब **दो modes** available हैं:

1. **Date Range Mode** - Continuous dates (जैसे 1 Jan से 5 Jan तक)
2. **Multiple Dates Mode** - Specific non-continuous dates (जैसे 1 Jan, 5 Jan, 10 Jan)

---

## API Endpoint
```
POST /api/attendance/employee/leave/apply
```

---

## Mode 1: Date Range (Continuous Dates)

### Use Case
जब employee **continuous dates** के लिए leave apply करना चाहे।

**Example**: 1 January 2025 से 5 January 2025 तक (5 दिन की लगातार छुट्टी)

### Request Body
```json
{
  "leave_type": 1,
  "from_date": "2025-01-01",
  "to_date": "2025-01-05",
  "duration": 5,
  "reason": "Family vacation",
  "is_paid": true,
  "attachment": null
}
```

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| leave_type | number | ✅ Yes | Leave type ID |
| from_date | string (YYYY-MM-DD) | ✅ Yes | Start date |
| to_date | string (YYYY-MM-DD) | ✅ Yes | End date |
| duration | number | Optional | Auto-calculated if not provided |
| reason | string | ✅ Yes | Leave reason |
| is_paid | boolean | Optional | Default: true |
| attachment | string | Optional | File URL |

### Response
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
    "dates": ["2025-01-01", "2025-01-05"],
    "duration": 5
  }
}
```

### Auto-Duration Calculation
अगर `duration` field नहीं दिया गया, तो automatically calculate होगा:
```
duration = (to_date - from_date) + 1
```

**Example**:
- from_date: `2025-01-01`
- to_date: `2025-01-05`
- Auto-calculated duration: `5` दिन

---

## Mode 2: Multiple Dates (Non-Continuous Dates)

### Use Case
जब employee **specific dates** के लिए leave apply करना चाहे जो continuous नहीं हैं।

**Example**: 1 Jan, 5 Jan, और 10 Jan (3 specific dates)

### Request Body
```json
{
  "leave_type": 1,
  "specific_dates": [
    "2025-01-01",
    "2025-01-05",
    "2025-01-10"
  ],
  "duration": 3,
  "reason": "Personal work on specific days",
  "is_paid": true,
  "attachment": null
}
```

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| leave_type | number | ✅ Yes | Leave type ID |
| specific_dates | array[string] | ✅ Yes | Array of specific dates (YYYY-MM-DD) |
| duration | number | Optional | Auto-calculated as count of dates |
| reason | string | ✅ Yes | Leave reason |
| is_paid | boolean | Optional | Default: true |
| attachment | string | Optional | File URL |

### Response
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
      "2025-01-01",
      "2025-01-05",
      "2025-01-10"
    ],
    "duration": 3
  }
}
```

### Auto-Duration Calculation
अगर `duration` field नहीं दिया गया, तो automatically calculate होगा:
```
duration = count of dates in specific_dates array
```

**Example**:
- specific_dates: `["2025-01-01", "2025-01-05", "2025-01-10"]`
- Auto-calculated duration: `3` दिन

### Automatic Features

1. **Date Sorting**: Dates automatically sort होंगे ascending order में
2. **Duplicate Removal**: Duplicate dates automatically remove हो जाएंगे
3. **Past Date Validation**: Past dates के लिए error आएगी

**Example - Unsorted Input**:
```json
{
  "specific_dates": ["2025-01-10", "2025-01-01", "2025-01-05"]
}
```

**Automatic Sorting**:
```json
{
  "dates": ["2025-01-01", "2025-01-05", "2025-01-10"]
}
```

---

## Validation Rules

### Common Validations (Both Modes)
1. ✅ `leave_type` is required
2. ✅ `reason` is required
3. ✅ Cannot use both modes simultaneously

### Date Range Mode Validations
1. ✅ Both `from_date` and `to_date` required
2. ✅ `to_date` cannot be before `from_date`
3. ✅ Date format must be YYYY-MM-DD

### Multiple Dates Mode Validations
1. ✅ `specific_dates` array cannot be empty
2. ✅ Each date must be in YYYY-MM-DD format
3. ✅ Cannot apply leave for past dates
4. ✅ Duplicate dates are automatically removed

---

## Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Required fields: leave_type, reason"
}
```

### No Date Mode Selected
```json
{
  "success": false,
  "message": "Either provide date range (from_date, to_date) OR specific_dates array"
}
```

### Both Modes Used
```json
{
  "success": false,
  "message": "Cannot use both date range and specific_dates. Choose one mode."
}
```

### Invalid Date Format
```json
{
  "success": false,
  "message": "Invalid date format in specific_dates: 25/06/25. Use YYYY-MM-DD format."
}
```

### Past Dates Error
```json
{
  "success": false,
  "message": "Cannot apply leave for past dates: 2024-12-25, 2024-12-30"
}
```

### Invalid Date Range
```json
{
  "success": false,
  "message": "to_date cannot be before from_date"
}
```

---

## Complete Examples

### Example 1: Continuous 5-Day Leave (Date Range)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "from_date": "2025-02-10",
    "to_date": "2025-02-14",
    "reason": "Family vacation",
    "is_paid": true
  }'
```

**Result**: Leave applied for 10, 11, 12, 13, 14 Feb (5 continuous days)

---

### Example 2: Specific 3 Days (Multiple Dates)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "specific_dates": [
      "2025-06-25",
      "2025-06-27",
      "2025-09-30"
    ],
    "reason": "Personal appointments",
    "is_paid": true
  }'
```

**Result**: Leave applied for only 25 June, 27 June, and 30 September (3 specific dates)

---

### Example 3: Weekend Extension (Multiple Dates)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "specific_dates": [
      "2025-03-14",
      "2025-03-17"
    ],
    "reason": "Long weekend",
    "is_paid": true
  }'
```

**Result**: Friday (14th) और Monday (17th) की leave (weekend को skip करके)

---

### Example 4: With Auto-Duration (Date Range)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "from_date": "2025-04-01",
    "to_date": "2025-04-10",
    "reason": "Medical treatment"
  }'
```

**Result**: Duration automatically calculated as 10 days

---

### Example 5: With Duplicate Removal (Multiple Dates)
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leave_type": 1,
    "specific_dates": [
      "2025-05-01",
      "2025-05-05",
      "2025-05-01",
      "2025-05-10",
      "2025-05-05"
    ],
    "reason": "Various appointments"
  }'
```

**Result**: Duplicates removed automatically, final dates: [2025-05-01, 2025-05-05, 2025-05-10]

---

## Request Data Structure in Database

### Date Range Mode
```json
{
  "leave_type": 1,
  "leave_mode": "date_range",
  "from_date": "2025-01-01",
  "to_date": "2025-01-05",
  "specific_dates": null,
  "duration": 5,
  "reason": "Family vacation",
  "is_paid": true,
  "attachment": null,
  "applied_at": "2025-01-15T10:00:00.000Z"
}
```

### Multiple Dates Mode
```json
{
  "leave_type": 1,
  "leave_mode": "multiple_dates",
  "from_date": "2025-01-01",
  "to_date": "2025-01-10",
  "specific_dates": [
    "2025-01-01",
    "2025-01-05",
    "2025-01-10"
  ],
  "duration": 3,
  "reason": "Personal work",
  "is_paid": true,
  "attachment": null,
  "applied_at": "2025-01-15T10:00:00.000Z"
}
```

**Note**: Multiple dates mode में भी `from_date` और `to_date` store होते हैं (first और last date) reference के लिए।

---

## Frontend Implementation Guide

### React Example

```jsx
import { useState } from 'react';
import axios from 'axios';

function LeaveApplicationForm() {
  const [leaveMode, setLeaveMode] = useState('date_range'); // or 'multiple_dates'
  const [leaveType, setLeaveType] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [specificDates, setSpecificDates] = useState([]);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      leave_type: leaveType,
      reason: reason,
      is_paid: true
    };

    if (leaveMode === 'date_range') {
      payload.from_date = fromDate;
      payload.to_date = toDate;
    } else {
      payload.specific_dates = specificDates;
    }

    try {
      const response = await axios.post(
        '/api/attendance/employee/leave/apply',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Leave applied:', response.data);
      alert('Leave request submitted successfully!');
    } catch (error) {
      console.error('Error:', error.response.data);
      alert(error.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Leave Mode:</label>
        <select value={leaveMode} onChange={(e) => setLeaveMode(e.target.value)}>
          <option value="date_range">Date Range (Continuous)</option>
          <option value="multiple_dates">Specific Dates</option>
        </select>
      </div>

      <div>
        <label>Leave Type:</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
          <option value={1}>Annual Leave</option>
          <option value={2}>Sick Leave</option>
          <option value={3}>Casual Leave</option>
        </select>
      </div>

      {leaveMode === 'date_range' ? (
        <>
          <div>
            <label>From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <div>
          <label>Select Specific Dates:</label>
          <MultiDatePicker
            selectedDates={specificDates}
            onChange={setSpecificDates}
          />
          <p>Selected: {specificDates.join(', ')}</p>
        </div>
      )}

      <div>
        <label>Reason:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      <button type="submit">Submit Leave Request</button>
    </form>
  );
}
```

---

## Use Cases

### Date Range Mode - Best For:
✅ Continuous vacation (5-10 days)
✅ Long medical leave
✅ Maternity/Paternity leave
✅ Training programs
✅ Any consecutive days off

### Multiple Dates Mode - Best For:
✅ Doctor appointments on specific days
✅ Personal work on non-consecutive dates
✅ Religious festivals (specific dates)
✅ Extending weekends (Friday + Monday)
✅ Exam days
✅ Interview schedules

---

## Database Schema Considerations

`request_data` column में JSON store होता है:

```sql
-- Example stored data for multiple dates mode
{
  "leave_mode": "multiple_dates",
  "specific_dates": ["2025-06-25", "2025-06-27", "2025-09-30"],
  "from_date": "2025-06-25",  -- first date
  "to_date": "2025-09-30",    -- last date
  "duration": 3
}
```

Admin panel में filtering के लिए `from_date` और `to_date` both modes में available रहते हैं।

---

## Testing

### Test Case 1: Date Range
```bash
# Input
{
  "leave_type": 1,
  "from_date": "2025-02-01",
  "to_date": "2025-02-05",
  "reason": "Test"
}

# Expected: 5 days leave, dates: 01 Feb to 05 Feb
```

### Test Case 2: Multiple Dates
```bash
# Input
{
  "leave_type": 1,
  "specific_dates": ["2025-06-25", "2025-06-27", "2025-09-30"],
  "reason": "Test"
}

# Expected: 3 days leave, specific dates only
```

### Test Case 3: Duplicate Removal
```bash
# Input
{
  "leave_type": 1,
  "specific_dates": ["2025-05-01", "2025-05-01", "2025-05-05"],
  "reason": "Test"
}

# Expected: 2 days leave, dates: ["2025-05-01", "2025-05-05"]
```

### Test Case 4: Auto-Sorting
```bash
# Input (unsorted)
{
  "leave_type": 1,
  "specific_dates": ["2025-05-10", "2025-05-01", "2025-05-05"],
  "reason": "Test"
}

# Expected: Sorted dates: ["2025-05-01", "2025-05-05", "2025-05-10"]
```

---

## Benefits

### For Employees
✅ Flexibility to choose date mode
✅ Auto-calculation of duration
✅ No need to apply separate requests for non-continuous dates
✅ Duplicate dates automatically handled
✅ Past date validation

### For HR/Admin
✅ Clear visibility of leave mode
✅ Both modes store from_date/to_date for filtering
✅ Easy to query and report
✅ Consistent data structure

---

**Updated**: 2025-01-13
**Version**: 2.0
**API**: `/api/attendance/employee/leave/apply`
**Modes**: Date Range + Multiple Dates
