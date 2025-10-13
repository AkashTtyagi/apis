# Leave Application - Quick Examples

## Two Ways to Apply Leave

---

## 1️⃣ Date Range Mode (Continuous Days)

### Example: 10 Jan to 15 Jan (6 days)

```json
POST /api/attendance/employee/leave/apply

{
  "leave_type": 1,
  "from_date": "2025-01-10",
  "to_date": "2025-01-15",
  "reason": "Family function",
  "is_paid": true
}
```

✅ Duration automatically calculated: **6 days**
✅ Leave applied for: 10, 11, 12, 13, 14, 15 Jan

---

## 2️⃣ Multiple Dates Mode (Specific dates)

### Example: 25 June, 27 June, 30 September

```json
POST /api/attendance/employee/leave/apply

{
  "leave_type": 1,
  "specific_dates": [
    "2025-06-25",
    "2025-06-27",
    "2025-09-30"
  ],
  "reason": "Personal appointments",
  "is_paid": true
}
```

✅ Duration automatically calculated: **3 days**
✅ Leave applied for: Only these 3 specific dates

---

## ⚠️ Important Rules

### ✅ DO's
- ✅ Use **only one mode** at a time (date range or multiple dates)
- ✅ Date format: `YYYY-MM-DD` (e.g., `2025-06-25`)
- ✅ Duration is optional - automatically calculated
- ✅ Duplicate dates automatically removed
- ✅ Dates automatically sorted

### ❌ DON'Ts
- ❌ Cannot apply leave for past dates
- ❌ Cannot use date range and multiple dates together
- ❌ Cannot send empty specific_dates array

---

## More Examples

### Weekend Extension (Friday + Monday)
```json
{
  "leave_type": 1,
  "specific_dates": ["2025-03-14", "2025-03-17"],
  "reason": "Long weekend"
}
```
**Result**: Friday and Monday leave, Saturday-Sunday already off

---

### Multiple Months
```json
{
  "leave_type": 1,
  "specific_dates": [
    "2025-06-01",
    "2025-07-15",
    "2025-08-30"
  ],
  "reason": "Various appointments"
}
```
**Result**: 3 specific dates across 3 different months

---

### With Manual Duration
```json
{
  "leave_type": 1,
  "from_date": "2025-02-01",
  "to_date": "2025-02-05",
  "duration": 3,
  "reason": "Half-day leaves"
}
```
**Result**: 5 days range but duration 3 (because of half-days)

---

## Error Examples

### ❌ Both Modes Together (Wrong)
```json
{
  "leave_type": 1,
  "from_date": "2025-01-10",
  "to_date": "2025-01-15",
  "specific_dates": ["2025-06-25"],
  "reason": "Test"
}
```
**Error**: "Cannot use both date range and specific_dates. Choose one mode."

---

### ❌ Wrong Date Format (Wrong)
```json
{
  "leave_type": 1,
  "specific_dates": ["25/06/25", "27/06/25"],
  "reason": "Test"
}
```
**Error**: "Invalid date format. Use YYYY-MM-DD format."

---

### ❌ Past Dates (Wrong)
```json
{
  "leave_type": 1,
  "specific_dates": ["2024-12-25", "2024-12-30"],
  "reason": "Test"
}
```
**Error**: "Cannot apply leave for past dates: 2024-12-25, 2024-12-30"

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "request_number": "LV-2025-001",
    "request_id": 1,
    "request_status": "pending",
    "leave_type": 1,
    "leave_mode": "multiple_dates",
    "dates": ["2025-06-25", "2025-06-27", "2025-09-30"],
    "duration": 3
  }
}
```

---

## Frontend Implementation (Simple)

```javascript
// Date Range Mode
const applyDateRange = async () => {
  const response = await fetch('/api/attendance/employee/leave/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      leave_type: 1,
      from_date: '2025-02-10',
      to_date: '2025-02-15',
      reason: 'Vacation'
    })
  });

  const result = await response.json();
  console.log(result);
};

// Multiple Dates Mode
const applyMultipleDates = async () => {
  const response = await fetch('/api/attendance/employee/leave/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      leave_type: 1,
      specific_dates: ['2025-06-25', '2025-06-27', '2025-09-30'],
      reason: 'Personal work'
    })
  });

  const result = await response.json();
  console.log(result);
};
```

---

## Testing Commands

### cURL - Date Range
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"leave_type":1,"from_date":"2025-02-10","to_date":"2025-02-15","reason":"Test"}'
```

### cURL - Multiple Dates
```bash
curl -X POST http://localhost:3000/api/attendance/employee/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"leave_type":1,"specific_dates":["2025-06-25","2025-06-27","2025-09-30"],"reason":"Test"}'
```

---

## Summary

| Feature | Date Range | Multiple Dates |
|---------|-----------|----------------|
| Use For | Continuous days | Specific non-continuous days |
| Required Fields | from_date, to_date | specific_dates array |
| Duration | Auto: (to - from) + 1 | Auto: count of dates |
| Example Use Case | Vacation, Medical | Appointments, Festivals |

**Remember**:
- ✅ One mode at a time
- ✅ YYYY-MM-DD format
- ✅ Future dates only
- ✅ Duration optional

---

**Quick Reference**
**API**: `POST /api/attendance/employee/leave/apply`
**Modes**: 2 (Date Range + Multiple Dates)
