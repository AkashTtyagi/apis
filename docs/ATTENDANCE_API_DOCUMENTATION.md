# ESS Attendance API Documentation

## Overview
Employee Self Service (ESS) microservice for attendance management with support for Web, Mobile, and Biometric punch sources.

---

## Architecture

### Punch Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   WEB/      │────▶│ Direct API   │────▶│ Daily           │
│   MOBILE    │     │ (Instant)    │     │ Attendance      │
└─────────────┘     └──────────────┘     │ Updated         │
                                         └─────────────────┘

┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  BIOMETRIC  │────▶│ Push API     │────▶│ HrmsPunchLog    │
│   DEVICE    │     │ (Save only)  │     │ (Raw storage)   │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ Cron Job        │
                                         │ (Process)       │
                                         └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ Daily           │
                                         │ Attendance      │
                                         │ Updated         │
                                         └─────────────────┘
```

---

## Database Schema Changes

### 1. HrmsEmployee Table
**New Column Added:**
```sql
ALTER TABLE hrms_employees
ADD COLUMN biometric_device_id VARCHAR(100) NULL
COMMENT 'Client-provided unique biometric ID for employee (used for biometric attendance mapping)';
```

### 2. Template Field
**Seed File:** `/database/seeds/add_biometric_device_id_field.sql`

Run to add biometric_device_id to employee form:
```bash
mysql -u username -p database_name < database/seeds/add_biometric_device_id_field.sql
```

---

## API Endpoints

### 1. Web Punch (Authenticated)
**Endpoint:** `POST /api/ess/attendance/web-punch`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request Body:**
```json
{
  "device_id": "browser-fingerprint-xyz",
  "device_name": "Chrome on Windows",
  "device_info": {
    "os": "Windows",
    "browser": "Chrome",
    "version": "120.0"
  },
  "photo_url": "https://cdn.example.com/selfie.jpg",
  "photo_verified": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "data": {
    "punch_id": 123,
    "punch_datetime": "2025-10-31 09:15:00",
    "punch_type": "in",
    "is_late": false,
    "is_early_out": false,
    "shift_name": "Day Shift",
    "shift_start": "09:00:00",
    "shift_end": "18:00:00",
    "shift_source": "default",
    "status": "on_time",
    "timezone": "Asia/Kolkata"
  }
}
```

---

### 2. Mobile Punch (Authenticated)
**Endpoint:** `POST /api/ess/attendance/mobile-punch`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request Body:**
```json
{
  "location": {
    "latitude": 28.7041,
    "longitude": 77.1025,
    "accuracy": 10.5,
    "address": "Connaught Place, New Delhi"
  },
  "device_id": "iphone-uuid-abc123",
  "device_name": "iPhone 14 Pro",
  "device_info": {
    "os": "iOS",
    "os_version": "17.1",
    "model": "iPhone 14 Pro"
  },
  "photo_url": "https://cdn.example.com/selfie.jpg",
  "photo_verified": true,
  "is_outside_geofence": false
}
```

**Response:** Same as Web Punch

**Validation:**
- ✅ Location is **required** (latitude, longitude)
- ✅ Validates geofence (if configured)

---

### 3. Biometric Push (No Authentication)
**Endpoint:** `POST /api/ess/attendance/biometric-push`

**Purpose:** Biometric device pushes raw punch data

**Request Body:**
```json
{
  "biometric_device_id": "EMP001",
  "punch_datetime": "2025-10-31T09:15:00.000Z",
  "is_utc": true,
  "device_id": "DEVICE-GATE-01",
  "device_name": "Main Gate Biometric",
  "company_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric punch recorded successfully",
  "data": {
    "punch_id": 456,
    "punch_datetime": "2025-10-31 14:45:00",
    "employee_id": 123,
    "employee_code": "EMP001",
    "employee_name": "John Doe",
    "biometric_device_id": "EMP001",
    "is_utc_converted": true
  }
}
```

**Key Points:**
- ✅ No authentication required
- ✅ Only saves to `hrms_punch_log`
- ✅ Does NOT update `hrms_daily_attendance`
- ✅ Maps employee by `biometric_device_id`
- ✅ Converts UTC to employee timezone if `is_utc=true` and company setting enabled

---

### 4. Process Punch Logs - Cron Job (No Authentication)
**Endpoint:** `POST /api/ess/attendance/process-punches`

**Purpose:** Processes unlinked biometric punches and updates daily attendance

**Request Body:**
```json
{
  "company_id": 1,
  "employee_id": null,
  "date_from": "2025-10-30",
  "date_to": "2025-10-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 15 employee-date groups",
  "data": {
    "processed_count": 15,
    "total_punches": 45
  }
}
```

**What it does:**
1. Fetches all unprocessed punches (`daily_attendance_id = null`)
2. Groups by employee and date
3. Finds MIN punch (IN) and MAX punch (OUT)
4. Validates against shift configuration
5. Creates/updates `hrms_daily_attendance`
6. Links all punches to daily attendance
7. Calculates total hours

**Cron Schedule (Recommended):**
```bash
# Every 15 minutes
*/15 * * * * curl -X POST http://localhost:3000/api/ess/attendance/process-punches

# Or every hour
0 * * * * curl -X POST http://localhost:3000/api/ess/attendance/process-punches
```

---

### 5. Get Today's Status (Authenticated)
**Endpoint:** `POST /api/ess/attendance/today`

**Response:**
```json
{
  "success": true,
  "message": "Today's punch status retrieved successfully",
  "data": {
    "date": "2025-10-31",
    "punch_count": 2,
    "is_clocked_in": false,
    "first_punch": {
      "time": "2025-10-31 09:15:00",
      "is_late": false
    },
    "last_punch": {
      "time": "2025-10-31 18:30:00",
      "is_early_out": false
    },
    "punches": [
      {
        "id": 123,
        "time": "2025-10-31 09:15:00",
        "source": "mobile"
      },
      {
        "id": 124,
        "time": "2025-10-31 18:30:00",
        "source": "mobile"
      }
    ],
    "next_action": "in",
    "shift": {
      "name": "Day Shift",
      "start": "09:00:00",
      "end": "18:00:00",
      "source": "default"
    }
  }
}
```

---

### 6. Get Punch History (Authenticated)
**Endpoint:** `POST /api/ess/attendance/history`

**Request Body:**
```json
{
  "from_date": "2025-10-01",
  "to_date": "2025-10-31",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Punch history retrieved successfully",
  "data": {
    "total": 120,
    "records": [
      {
        "id": 123,
        "punch_datetime": "2025-10-31 09:15:00",
        "punch_source": "mobile",
        "is_late": false,
        "is_early_out": false,
        "latitude": 28.7041,
        "longitude": 77.1025,
        "location_address": "Connaught Place, New Delhi",
        "photo_url": "https://cdn.example.com/selfie.jpg",
        "remarks": null
      }
    ],
    "from_date": "2025-10-01",
    "to_date": "2025-10-31",
    "limit": 50,
    "offset": 0
  }
}
```

---

## Key Features

### 1. IN/OUT Detection Logic

**Web/Mobile:**
- Check `hrms_daily_attendance` for today
- If no entry exists → **IN**
- If entry exists → **OUT**
- Updates daily attendance immediately

**Biometric:**
- All punches saved to `hrms_punch_log`
- Cron job processes:
  - Groups by employee + date
  - MIN punch = IN
  - MAX punch = OUT
  - All middle punches = break/overtime

### 2. Shift-Based Validation

**Grace Periods:**
```javascript
// Late check-in
lateThreshold = shift_start + grace_time_late_minutes

// Early check-out
earlyThreshold = shift_end - grace_time_early_minutes

// Earliest allowed check-in
earliestAllowed = shift_start - checkin_allowed_before_minutes
```

**Example:**
```
Shift: 09:00 - 18:00
checkin_allowed_before_minutes: 120 (2 hours)
grace_time_late_minutes: 15
grace_time_early_minutes: 30

Earliest check-in: 07:00
Late threshold: 09:15
Early out threshold: 17:30
```

### 3. Timezone Handling

**Employee Timezone:**
- Each employee has their own timezone
- All punch times stored in employee timezone
- Biometric UTC conversion if enabled

**Conversion Flow:**
```
UTC Punch → Check company.biometric_utc_enabled → Convert to employee timezone
```

### 4. Duplicate Prevention
- Checks for punches within 1-minute window
- Prevents accidental double-punches

---

## Database Tables

### HrmsPunchLog
Stores **every punch** from all sources:
```sql
- id
- employee_id
- company_id
- punch_datetime (in employee timezone)
- punch_source (web/mobile/biometric/admin)
- is_utc_converted
- original_utc_datetime
- biometric_device_id
- device_id, device_name, device_info
- latitude, longitude, location_address
- is_valid, is_late, is_early_out
- daily_attendance_id (null until processed)
```

### HrmsDailyAttendance
Stores **first IN and last OUT** only:
```sql
- id
- employee_id
- company_id
- attendance_date
- punch_in (first punch)
- punch_out (last punch)
- total_hours
- worked_hours
- attendance_status
```

---

## Error Handling

### Common Errors

**1. Employee not found**
```json
{
  "success": false,
  "message": "Employee not found for biometric_device_id: EMP001"
}
```

**2. No shift assigned**
```json
{
  "success": false,
  "message": "No shift assigned for this date. Please contact HR."
}
```

**3. Duplicate punch**
```json
{
  "success": false,
  "message": "Duplicate punch detected. Please wait at least 1 minute between punches."
}
```

**4. Location required (Mobile)**
```json
{
  "success": false,
  "message": "Location (latitude, longitude) is required for mobile punch"
}
```

**5. Too early check-in**
```json
{
  "success": false,
  "message": "Clock-in not allowed before 07:00. You can clock in 120 minutes before shift start."
}
```

---

## Integration Guide

### 1. Web Application
```javascript
// Clock IN/OUT
const response = await fetch('/api/ess/attendance/web-punch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device_id: getBrowserFingerprint(),
    device_name: navigator.userAgent,
    photo_url: selfieUrl
  })
});
```

### 2. Mobile App
```javascript
// Get location
const location = await getCurrentLocation();

// Clock IN/OUT
const response = await fetch('/api/ess/attendance/mobile-punch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    location: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    },
    device_id: await getDeviceId(),
    device_name: getDeviceName()
  })
});
```

### 3. Biometric Device Client
```javascript
// Push punch to server
const response = await fetch('/api/ess/attendance/biometric-push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    biometric_device_id: 'EMP001',
    punch_datetime: new Date().toISOString(),
    is_utc: true,
    device_id: 'GATE-01',
    device_name: 'Main Gate',
    company_id: 1
  })
});
```

### 4. Cron Job Setup
```javascript
// cron.js
const cron = require('node-cron');
const axios = require('axios');

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/ess/attendance/process-punches', {
      date_from: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD')
    });
    console.log('Punch processing result:', response.data);
  } catch (error) {
    console.error('Punch processing failed:', error);
  }
});
```

---

## Testing

### Test Web Punch
```bash
curl -X POST http://localhost:3000/api/ess/attendance/web-punch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-device",
    "device_name": "Test Browser"
  }'
```

### Test Biometric Push
```bash
curl -X POST http://localhost:3000/api/ess/attendance/biometric-push \
  -H "Content-Type: application/json" \
  -d '{
    "biometric_device_id": "EMP001",
    "punch_datetime": "2025-10-31T09:15:00.000Z",
    "is_utc": true,
    "device_id": "GATE-01",
    "device_name": "Main Gate",
    "company_id": 1
  }'
```

### Test Cron Processing
```bash
curl -X POST http://localhost:3000/api/ess/attendance/process-punches \
  -H "Content-Type: application/json" \
  -d '{
    "date_from": "2025-10-30",
    "date_to": "2025-10-31"
  }'
```

---

## Files Modified

1. `/src/models/HrmsEmployee.js` - Added biometric_device_id column
2. `/database/seeds/add_biometric_device_id_field.sql` - Template field seed
3. `/src/microservices/ess/services/attendance.service.js` - All business logic
4. `/src/microservices/ess/controllers/attendance.controller.js` - HTTP handlers
5. `/src/microservices/ess/routes/attendance.routes.js` - Route definitions
6. `/src/routes/index.js` - Registered ESS routes

---

## Summary

✅ Web/Mobile punch with immediate daily attendance update
✅ Biometric punch with two-step processing (push → cron)
✅ Employee mapping via biometric_device_id
✅ Shift-based validation with grace periods
✅ Timezone conversion for biometric UTC
✅ Duplicate prevention
✅ Min/Max punch logic for biometric
✅ Complete audit trail in punch log
