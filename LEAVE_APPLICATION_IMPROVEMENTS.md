# Leave Application Service Improvements

## Changes Made

### 1. Removed `is_paid` from User Input ✅
**Problem:** Users were sending `is_paid` parameter which should be derived from leave type configuration.

**Solution:**
```javascript
// ❌ OLD - User could override
const { is_paid } = leaveData;

// ✅ NEW - Derived from leave master
const leaveMaster = await HrmsLeaveMaster.findByPk(leave_type);
const is_paid = leaveMaster.leave_type === 'paid';
```

**Benefit:**
- Leave type configuration is the single source of truth
- Users cannot incorrectly apply paid leave as unpaid or vice versa
- Consistent with master data

---

### 2. Added `day_type` Support ✅

**Feature:** Employees can now apply for:
- Full day leave
- First half leave
- Second half leave

**Implementation:**

#### Date Range Mode (Same day_type for all dates)
```json
{
  "leave_type": 1,
  "from_date": "2025-11-01",
  "to_date": "2025-11-05",
  "day_type": "first_half",  // Applied to all 5 days
  "reason": "Personal work"
}
```

**Result:** 5 days × 0.5 = 2.5 days leave

#### Specific Dates Mode (Per-date day_type)
```json
{
  "leave_type": 1,
  "specific_dates": [
    { "date": "2025-11-01", "day_type": "full_day" },
    { "date": "2025-11-03", "day_type": "first_half" },
    { "date": "2025-11-05", "day_type": "second_half" }
  ],
  "reason": "Medical appointments"
}
```

**Result:** 1 + 0.5 + 0.5 = 2 days leave

**Backward Compatible:** If `day_type` not provided, defaults to `'full_day'`

---

## API Changes

### Request Body

#### Before:
```json
{
  "leave_type": 1,
  "from_date": "2025-11-01",
  "to_date": "2025-11-05",
  "reason": "Personal",
  "is_paid": true,  // ❌ Should not be sent by user
  "duration": 5
}
```

#### After:
```json
{
  "leave_type": 1,
  "from_date": "2025-11-01",
  "to_date": "2025-11-05",
  "day_type": "first_half",  // ✅ NEW - Optional, defaults to 'full_day'
  "reason": "Personal"
  // duration auto-calculated: 5 days × 0.5 = 2.5
}
```

---

## Examples

### Example 1: Full Day Leave (Date Range)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 1,
  "from_date": "2025-11-10",
  "to_date": "2025-11-12",
  "reason": "Family function"
}
```

**Result:**
- 3 days leave
- `pay_day = 1` (Full Day) for each date
- Auto-calculated duration: 3

---

### Example 2: Half Day Leave (Date Range)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 1,
  "from_date": "2025-11-10",
  "to_date": "2025-11-12",
  "day_type": "first_half",
  "reason": "Medical checkups"
}
```

**Result:**
- 3 dates, first half each
- `pay_day = 2` (First Half) for each date
- Auto-calculated duration: 1.5 days

---

### Example 3: Mixed Half Day Leave (Specific Dates)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 1,
  "specific_dates": [
    { "date": "2025-11-10", "day_type": "full_day" },
    { "date": "2025-11-12", "day_type": "first_half" },
    { "date": "2025-11-14", "day_type": "second_half" },
    { "date": "2025-11-15", "day_type": "full_day" }
  ],
  "reason": "Personal work"
}
```

**Result:**
- 4 dates with mixed day types
- `pay_day` varies by date:
  - Nov 10: `pay_day = 1` (Full Day)
  - Nov 12: `pay_day = 2` (First Half)
  - Nov 14: `pay_day = 3` (Second Half)
  - Nov 15: `pay_day = 1` (Full Day)
- Auto-calculated duration: 1 + 0.5 + 0.5 + 1 = 3 days

---

### Example 4: Unpaid Full Day Leave (LWP)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 5,  // LWP (Loss of Pay) - leave_type = 'unpaid' in master
  "from_date": "2025-11-20",
  "to_date": "2025-11-22",
  "day_type": "full_day",
  "reason": "Personal emergency"
}
```

**Result:**
- 3 days unpaid leave
- `pay_day = 1` (Full Day) for all dates
- `is_paid = false` (derived from leave master)
- Auto-calculated duration: 3

---

### Example 5: Unpaid Half Day Leave (LWP First Half)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 5,  // LWP (Loss of Pay)
  "from_date": "2025-11-20",
  "to_date": "2025-11-22",
  "day_type": "first_half",
  "reason": "Medical appointment"
}
```

**Result:**
- 3 dates, first half each
- `pay_day = 2` (First Half) for all dates
- `is_paid = false` (unpaid LWP)
- Auto-calculated duration: 1.5 days

---

### Example 6: Backward Compatible (Strings in specific_dates)
```json
POST /api/attendance/leave/apply

{
  "leave_type": 1,
  "specific_dates": [
    "2025-11-10",  // String format - defaults to full_day
    "2025-11-12",
    "2025-11-14"
  ],
  "reason": "Personal work"
}
```

**Result:**
- 3 full day leaves
- `pay_day = 1` (Full Day) for all dates
- Auto-calculated duration: 3

---

## pay_day Mapping

**Important:** `pay_day` ONLY represents day type (full/first half/second half), NOT paid/unpaid status.
- **Paid/Unpaid status** is determined by `is_paid` field
- **Leave type** (CL, LWP, etc.) is from `leave_type` field

| day_type | pay_day Value | Description |
|----------|---------------|-------------|
| `full_day` | `1` | Full Day |
| `first_half` | `2` | First Half |
| `second_half` | `3` | Second Half |

**Logic:**
```javascript
// pay_day based ONLY on day_type
if (day_type === 'first_half') {
    pay_day = 2;
} else if (day_type === 'second_half') {
    pay_day = 3;
} else {
    pay_day = 1;  // Full Day (default)
}

// is_paid derived from leave master
is_paid = leaveMaster.leave_type === 'paid';  // true or false
```

**Examples:**
```javascript
// Paid Full Day Leave (CL)
{ pay_day: 1, is_paid: true }

// Paid First Half Leave (CL)
{ pay_day: 2, is_paid: true }

// Unpaid Full Day Leave (LWP)
{ pay_day: 1, is_paid: false }

// Unpaid First Half Leave (LWP)
{ pay_day: 2, is_paid: false }
```

---

## Duration Calculation

### Date Range Mode:
```javascript
const totalDays = moment(to_date).diff(moment(from_date), 'days') + 1;

if (day_type === 'first_half' || day_type === 'second_half') {
    calculatedDuration = totalDays * 0.5;
} else {
    calculatedDuration = totalDays;
}
```

### Specific Dates Mode:
```javascript
calculatedDuration = specific_dates.reduce((total, item) => {
    if (item.day_type === 'first_half' || item.day_type === 'second_half') {
        return total + 0.5;
    }
    return total + 1;
}, 0);
```

---

## Validation

### 1. day_type Validation (Date Range)
```javascript
if (day_type && !['full_day', 'first_half', 'second_half'].includes(day_type)) {
    throw new Error('day_type must be one of: full_day, first_half, second_half');
}
```

### 2. day_type Validation (Specific Dates)
```javascript
if (!['full_day', 'first_half', 'second_half'].includes(item.day_type)) {
    throw new Error(`Invalid day_type for date ${item.date}`);
}
```

### 3. Leave Master Validation
```javascript
const leaveMaster = await HrmsLeaveMaster.findByPk(leave_type);
if (!leaveMaster) {
    throw new Error('Invalid leave_type');
}
```

### 4. is_paid Auto-Derivation
```javascript
const is_paid = leaveMaster.leave_type === 'paid';
```

---

## Database Impact

### HrmsDailyAttendance Records

**Before:**
```sql
INSERT INTO hrms_daily_attendance (
    employee_id, company_id, attendance_date,
    request_id, workflow_master_id,
    pay_day,  -- Always 1 or 4
    status
) VALUES (...)
```

**After:**
```sql
INSERT INTO hrms_daily_attendance (
    employee_id, company_id, attendance_date,
    request_id, workflow_master_id,
    pay_day,  -- 1 (Full), 2 (First Half), 3 (Second Half), or 4 (Unpaid)
    is_paid,  -- Derived from leave master
    status
) VALUES (...)
```

---

## Benefits

### 1. Data Consistency ✅
- `is_paid` always matches leave type configuration
- No user errors in marking paid/unpaid

### 2. Flexibility ✅
- Support for half-day leaves
- Per-date granularity for specific dates mode
- Single day_type for date range mode

### 3. Accurate Leave Balance ✅
- Duration auto-calculated based on day_type
- Half days counted as 0.5
- Full days counted as 1.0

### 4. Payroll Integration ✅
- `pay_day` field correctly reflects day type:
  - Full day: `pay_day = 1`
  - First half: `pay_day = 2`
  - Second half: `pay_day = 3`
- `is_paid` field indicates if leave is paid or unpaid
- Both fields work together for accurate payroll calculation

### 5. Backward Compatible ✅
- Existing code works without changes
- `specific_dates` can still be array of strings
- `day_type` defaults to `'full_day'` if not provided

---

## Migration Notes

### For Existing Implementations:

**No Breaking Changes:**
- If `day_type` not sent → defaults to `'full_day'`
- If `specific_dates` sent as strings → still works (defaults to full_day)
- If `is_paid` sent by user → ignored, derived from leave master instead

**Recommended Updates:**
1. Remove `is_paid` from frontend forms
2. Add `day_type` dropdown for leave applications
3. Update UI to support per-date day_type for specific dates mode

---

## Testing

### Test Case 1: Full Day Leave
```javascript
const result = await applyLeave({
  leave_type: 1,  // Casual Leave (paid)
  from_date: '2025-11-01',
  to_date: '2025-11-03',
  reason: 'Personal'
}, employee_id, user_id);

// Expected: 3 days, pay_day = 1 for all dates
```

### Test Case 2: Half Day Leave
```javascript
const result = await applyLeave({
  leave_type: 1,
  from_date: '2025-11-01',
  to_date: '2025-11-03',
  day_type: 'first_half',
  reason: 'Medical'
}, employee_id, user_id);

// Expected: 1.5 days, pay_day = 2 for all dates
```

### Test Case 3: Mixed Dates
```javascript
const result = await applyLeave({
  leave_type: 1,
  specific_dates: [
    { date: '2025-11-01', day_type: 'full_day' },
    { date: '2025-11-03', day_type: 'first_half' }
  ],
  reason: 'Personal'
}, employee_id, user_id);

// Expected: 1.5 days, pay_day = 1 for Nov 1, pay_day = 2 for Nov 3
```

### Test Case 4: Unpaid Leave
```javascript
const result = await applyLeave({
  leave_type: 5,  // LWP (unpaid)
  from_date: '2025-11-01',
  to_date: '2025-11-02',
  reason: 'Emergency'
}, employee_id, user_id);

// Expected: 2 days, pay_day = 4, is_paid = false
```

---

## Files Modified

✅ `/src/services/attendance/leaveApplication.service.js`
  - Removed `is_paid` from user input
  - Added `day_type` support for date range mode
  - Added per-date `day_type` for specific dates mode
  - Updated duration calculation logic
  - Updated `createDailyAttendanceEntries` with pay_day mapping

---

## Summary

✅ **Removed** `is_paid` from user input - now derived from leave master
✅ **Added** `day_type` support:
   - `'full_day'` - Full day leave (default)
   - `'first_half'` - First half leave
   - `'second_half'` - Second half leave
✅ **Date Range Mode** - Single `day_type` for all dates in range
✅ **Specific Dates Mode** - Per-date `day_type` support
✅ **Auto-calculate** duration based on day_type (0.5 for half, 1.0 for full)
✅ **Correct pay_day** mapping (1=Full, 2=First Half, 3=Second Half, 4=Unpaid)
✅ **Backward compatible** - defaults to `'full_day'` if not provided
