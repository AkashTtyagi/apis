# Expense Settings Module - UI Implementation Guide

## Overview
This document provides detailed UI implementation instructions for the **Expense General Settings** module (Phase 2.2). The settings are organized into logical sections with a tabbed interface for easy navigation.

---

## API Endpoints Reference

### Base URL: `/api/expense/admin/settings`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all settings |
| PUT | `/` | Update all settings |
| PATCH | `/section/:section` | Update specific section |
| GET | `/mileage-rates` | List mileage rates |
| POST | `/mileage-rates` | Create mileage rate |
| PUT | `/mileage-rates/:id` | Update mileage rate |
| DELETE | `/mileage-rates/:id` | Delete mileage rate |
| GET | `/mileage-rates/applicable/:employee_id?vehicle_type=&date=` | Get applicable rate |
| GET | `/per-diem-rates` | List per diem rates |
| POST | `/per-diem-rates` | Create per diem rate |
| PUT | `/per-diem-rates/:id` | Update per diem rate |
| DELETE | `/per-diem-rates/:id` | Delete per diem rate |
| GET | `/per-diem-rates/applicable/:employee_id?city_tier=&date=` | Get applicable rate |
| GET | `/submission-window/check?date=` | Check submission window |

---

## Screen 1: Main Settings Page (Tabbed Interface)

### Layout Structure
```
+------------------------------------------------------------------+
|  EXPENSE SETTINGS                                    [Save All]   |
+------------------------------------------------------------------+
| [General] [Submission] [Date/Time] [Mileage] [Per Diem] [Receipt] |
| [Violation] [Payment] [Notification] [Audit] [UI]                 |
+------------------------------------------------------------------+
|                                                                   |
|  TAB CONTENT AREA                                                 |
|                                                                   |
+------------------------------------------------------------------+
```

### Tab Navigation
```jsx
const SETTINGS_TABS = [
  { key: 'general', label: 'General', icon: 'Settings' },
  { key: 'submission_window', label: 'Submission Window', icon: 'Calendar' },
  { key: 'date_time', label: 'Date & Time', icon: 'Clock' },
  { key: 'mileage', label: 'Mileage', icon: 'Car' },
  { key: 'per_diem', label: 'Per Diem', icon: 'Utensils' },
  { key: 'receipt', label: 'Receipt', icon: 'FileText' },
  { key: 'violation', label: 'Violation', icon: 'AlertTriangle' },
  { key: 'payment', label: 'Payment', icon: 'CreditCard' },
  { key: 'notification', label: 'Notification', icon: 'Bell' },
  { key: 'audit', label: 'Audit Trail', icon: 'FileSearch' },
  { key: 'ui', label: 'UI/UX', icon: 'Layout' }
];
```

---

## Tab 1: General Settings

### Wireframe
```
+------------------------------------------------------------------+
|  GENERAL SETTINGS                                                 |
+------------------------------------------------------------------+
|                                                                   |
|  Module Status                                                    |
|  +----------------------------------------------------------+    |
|  | [Toggle] Expense Module Enabled                          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Expense Code Configuration                                       |
|  +----------------------------------------------------------+    |
|  | Code Prefix:     [EXP_______]                            |    |
|  | Code Format:     [{PREFIX}-{YEAR}{MONTH}-{SEQ}________]  |    |
|  | Sequence Length: [5___] digits                           |    |
|  | [Toggle] Auto-generate Expense Code                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Preview: EXP-202501-00001                                        |
|                                                                   |
|  +--------------------+                                           |
|  | [Save Section]     |                                           |
|  +--------------------+                                           |
+------------------------------------------------------------------+
```

### Data Structure
```typescript
interface GeneralSettings {
  expense_module_enabled: boolean;
  expense_code_prefix: string;
  expense_code_format: string;
  expense_code_sequence_length: number;
  auto_generate_expense_code: boolean;
}
```

### API Integration
```javascript
// Update General Section
const updateGeneralSettings = async (data) => {
  const response = await fetch('/api/expense/admin/settings/section/general', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      expense_module_enabled: data.expense_module_enabled ? 1 : 0,
      expense_code_prefix: data.expense_code_prefix,
      expense_code_format: data.expense_code_format,
      expense_code_sequence_length: data.expense_code_sequence_length,
      auto_generate_expense_code: data.auto_generate_expense_code ? 1 : 0
    })
  });
  return response.json();
};
```

---

## Tab 2: Submission Window Settings

### Wireframe
```
+------------------------------------------------------------------+
|  SUBMISSION WINDOW SETTINGS                                       |
+------------------------------------------------------------------+
|                                                                   |
|  +----------------------------------------------------------+    |
|  | [Toggle] Enable Submission Window                        |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Window Type: ( ) Monthly  ( ) Weekly  ( ) Custom                 |
|                                                                   |
|  +----------------------------------------------------------+    |
|  | Start Day:  [1__] (1-31 for Monthly, 1-7 for Weekly)     |    |
|  | End Day:    [10_]                                        |    |
|  | Start Time: [00:00]                                      |    |
|  | End Time:   [23:59]                                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Late Submission Rules                                            |
|  +----------------------------------------------------------+    |
|  | [Toggle] Allow Late Submission                           |    |
|  | Penalty Percentage: [0___] %                             |    |
|  | Max Late Days:      [0___]                               |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Current Window Status:                                           |
|  +----------------------------------------------------------+    |
|  | Status: [OPEN / CLOSED / LATE]                           |    |
|  | Window: 1st - 10th of current month                      |    |
|  | Days Remaining: X days                                   |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Data Structure
```typescript
interface SubmissionWindowSettings {
  submission_window_enabled: boolean;
  submission_window_type: 'Monthly' | 'Weekly' | 'Custom';
  submission_window_start_day: number;
  submission_window_end_day: number;
  submission_window_start_time: string;
  submission_window_end_time: string;
  allow_late_submission: boolean;
  late_submission_penalty_percent: number;
  late_submission_max_days: number;
}
```

### Check Window Status
```javascript
// Check current submission window status
const checkSubmissionWindow = async (date) => {
  const response = await fetch(
    `/api/expense/admin/settings/submission-window/check?date=${date}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};

// Response example:
// {
//   "isOpen": true,
//   "isLate": false,
//   "penaltyPercent": 0,
//   "windowStart": "2025-01-01",
//   "windowEnd": "2025-01-10",
//   "daysRemaining": 5
// }
```

---

## Tab 3: Date & Time Settings

### Wireframe
```
+------------------------------------------------------------------+
|  DATE & TIME SETTINGS                                             |
+------------------------------------------------------------------+
|                                                                   |
|  Fiscal Year                                                      |
|  +----------------------------------------------------------+    |
|  | Start Month: [April______▼]  Start Day: [1__]            |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Display Formats                                                  |
|  +----------------------------------------------------------+    |
|  | Date Format: [DD-MM-YYYY__▼]                             |    |
|  |   Options: DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD            |    |
|  | Time Format: [HH:mm (24hr)▼]                             |    |
|  |   Options: HH:mm, hh:mm A                                |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Timezone & Week                                                  |
|  +----------------------------------------------------------+    |
|  | Timezone:       [Asia/Kolkata_____▼]                     |    |
|  | Week Starts On: [Monday___________▼]                     |    |
|  | Working Days:   [x]Mon [x]Tue [x]Wed [x]Thu [x]Fri       |    |
|  |                 [ ]Sat [ ]Sun                            |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Past/Future Date Rules                                           |
|  +----------------------------------------------------------+    |
|  | Max Past Days:    [30__] days                            |    |
|  | Max Future Days:  [0___] days                            |    |
|  | [Toggle] Allow Backdated Expenses                        |    |
|  | [Toggle] Require Approval for Backdated                  |    |
|  | Backdated Threshold: [7___] days                         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Dropdown Options
```javascript
const DATE_FORMATS = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'];
const TIME_FORMATS = ['HH:mm', 'hh:mm A'];
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  // ... through December
  { value: 4, label: 'April' } // Default for Indian fiscal year
];
const WEEK_DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  // ... through Sunday
];
```

---

## Tab 4: Mileage Settings

### Wireframe - Settings
```
+------------------------------------------------------------------+
|  MILEAGE SETTINGS                                                 |
+------------------------------------------------------------------+
|                                                                   |
|  Basic Configuration                                              |
|  +----------------------------------------------------------+    |
|  | Distance Unit:     ( ) KM  (x) Miles                     |    |
|  | Default Rate:      [8.00_____] per KM/Mile               |    |
|  | Calculation:       [Manual_________▼]                    |    |
|  |   Options: Manual, Google_Maps, Fixed_Route              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Google Maps Integration (if enabled)                             |
|  +----------------------------------------------------------+    |
|  | [Toggle] Enable Google Maps API                          |    |
|  | API Key: [**************************]                    |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Limits & Rules                                                   |
|  +----------------------------------------------------------+    |
|  | Max Daily Mileage:   [______] KM (leave blank = no limit)|    |
|  | Max Monthly Mileage: [______] KM                         |    |
|  | [Toggle] Allow Round Trip Calculation                    |    |
|  | [Toggle] Require Odometer Reading                        |    |
|  | [Toggle] Require Route Details                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Wireframe - Mileage Rates Table
```
+------------------------------------------------------------------+
|  MILEAGE RATES                              [+ Add Mileage Rate]  |
+------------------------------------------------------------------+
| Search: [____________]  Vehicle: [All▼]  Status: [Active▼]        |
+------------------------------------------------------------------+
| Rate Name      | Code   | Vehicle     | Rate/KM | Effective      |
+----------------|--------|-------------|---------|----------------|
| Two Wheeler    | TW-01  | Two_Wheeler | ₹4.00   | 01-Apr-2024    |
|   [Edit] [Delete]                                                 |
+----------------|--------|-------------|---------|----------------|
| Four Wheeler   | FW-01  | Four_Wheeler| ₹8.00   | 01-Apr-2024    |
|   [Edit] [Delete]                                                 |
+----------------|--------|-------------|---------|----------------|
| EV Rate        | EV-01  | Four_Wheeler| ₹3.00   | 01-Apr-2024    |
|   Fuel: Electric    [Edit] [Delete]                               |
+------------------------------------------------------------------+
```

### Mileage Rate Form Modal
```
+------------------------------------------------------------------+
|  ADD / EDIT MILEAGE RATE                                    [X]   |
+------------------------------------------------------------------+
|                                                                   |
|  Basic Information                                                |
|  +----------------------------------------------------------+    |
|  | Rate Name*:  [________________________]                  |    |
|  | Rate Code*:  [____________]                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Vehicle Configuration                                            |
|  +----------------------------------------------------------+    |
|  | Vehicle Type*: [Four_Wheeler___▼]                        |    |
|  |   Options: Two_Wheeler, Four_Wheeler, Public_Transport   |    |
|  | Fuel Type:     [Any___________▼]                         |    |
|  |   Options: Petrol, Diesel, CNG, Electric, Any            |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Rate Configuration                                               |
|  +----------------------------------------------------------+    |
|  | Rate Per Unit*:        [________] per KM/Mile            |    |
|  | Min Distance:          [0_______] KM                     |    |
|  | Max Distance/Day:      [________] KM                     |    |
|  | Max Distance/Month:    [________] KM                     |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Applicability                                                    |
|  +----------------------------------------------------------+    |
|  | Location Group: [Select___________▼]                     |    |
|  | Grades:         [Multi-select_____▼]                     |    |
|  | Effective From*: [____________📅]                        |    |
|  | Effective To:    [____________📅]                        |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  [Cancel]                                           [Save Rate]   |
+------------------------------------------------------------------+
```

### Mileage Rate Data Structure
```typescript
interface MileageRate {
  id?: number;
  rate_name: string;
  rate_code: string;
  vehicle_type: 'Two_Wheeler' | 'Four_Wheeler' | 'Public_Transport' | 'Other';
  fuel_type: 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Any';
  rate_per_unit: number;
  min_distance: number;
  max_distance_per_day?: number;
  max_distance_per_month?: number;
  location_group_id?: number;
  grade_ids?: number[];
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
}
```

### Mileage Rate API Integration
```javascript
// List mileage rates
const getMileageRates = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/expense/admin/settings/mileage-rates?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Create mileage rate
const createMileageRate = async (data) => {
  const response = await fetch('/api/expense/admin/settings/mileage-rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Update mileage rate
const updateMileageRate = async (id, data) => {
  const response = await fetch(`/api/expense/admin/settings/mileage-rates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Get applicable rate for employee
const getApplicableMileageRate = async (employeeId, vehicleType, date) => {
  const response = await fetch(
    `/api/expense/admin/settings/mileage-rates/applicable/${employeeId}?vehicle_type=${vehicleType}&date=${date}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.json();
};
```

---

## Tab 5: Per Diem Settings

### Wireframe - Settings
```
+------------------------------------------------------------------+
|  PER DIEM SETTINGS                                                |
+------------------------------------------------------------------+
|                                                                   |
|  Calculation Method                                               |
|  +----------------------------------------------------------+    |
|  | Method: ( ) Full Day  ( ) Half Day  ( ) Hourly  ( ) Custom|   |
|  | Full Day Hours:  [8__] hours                             |    |
|  | Half Day Hours:  [4__] hours                             |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Travel & Meal Rules                                              |
|  +----------------------------------------------------------+    |
|  | [Toggle] Include Travel Days                             |    |
|  | [Toggle] Deduct Meals Provided                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Meal Deduction Percentages (when meals provided)                 |
|  +----------------------------------------------------------+    |
|  | Breakfast: [20__] %                                      |    |
|  | Lunch:     [30__] %                                      |    |
|  | Dinner:    [30__] %                                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Wireframe - Per Diem Rates Table
```
+------------------------------------------------------------------+
|  PER DIEM RATES                               [+ Add Per Diem]    |
+------------------------------------------------------------------+
| Search: [____________]  City Tier: [All▼]  Status: [Active▼]      |
+------------------------------------------------------------------+
| Rate Name       | Code   | Tier     | Full Day | Half Day | Eff. |
+-----------------|--------|----------|----------|----------|------|
| Metro Cities    | PDM-01 | Metro    | ₹2,000   | ₹1,000   | Apr  |
|   Meals: B:₹400 L:₹600 D:₹600    [Edit] [Delete]                  |
+-----------------|--------|----------|----------|----------|------|
| Tier-1 Cities   | PDT1-01| Tier_1   | ₹1,500   | ₹750     | Apr  |
|   [Edit] [Delete]                                                 |
+-----------------|--------|----------|----------|----------|------|
| International   | PDI-01 | Intl     | $150     | $75      | Apr  |
|   [Edit] [Delete]                                                 |
+------------------------------------------------------------------+
```

### Per Diem Rate Form Modal
```
+------------------------------------------------------------------+
|  ADD / EDIT PER DIEM RATE                                   [X]   |
+------------------------------------------------------------------+
|                                                                   |
|  Basic Information                                                |
|  +----------------------------------------------------------+    |
|  | Rate Name*:  [________________________]                  |    |
|  | Rate Code*:  [____________]                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Location Configuration                                           |
|  +----------------------------------------------------------+    |
|  | City Tier*:      [Metro__________▼]                      |    |
|  |   Options: Metro, Tier_1, Tier_2, Tier_3, International  |    |
|  | Location Group:  [Select_________▼]                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Day Rates                                                        |
|  +----------------------------------------------------------+    |
|  | Full Day Rate*:  [____________]                          |    |
|  | Half Day Rate:   [____________]                          |    |
|  | Hourly Rate:     [____________]                          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Meal Rates (Optional)                                            |
|  +----------------------------------------------------------+    |
|  | Breakfast Rate:  [____________]                          |    |
|  | Lunch Rate:      [____________]                          |    |
|  | Dinner Rate:     [____________]                          |    |
|  | Incidental Rate: [____________]                          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Applicability                                                    |
|  +----------------------------------------------------------+    |
|  | Grades:       [Multi-select_____▼]                       |    |
|  | Designations: [Multi-select_____▼]                       |    |
|  | Effective From*: [____________📅]                        |    |
|  | Effective To:    [____________📅]                        |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  [Cancel]                                           [Save Rate]   |
+------------------------------------------------------------------+
```

### Per Diem Rate Data Structure
```typescript
interface PerDiemRate {
  id?: number;
  rate_name: string;
  rate_code: string;
  city_tier: 'Metro' | 'Tier_1' | 'Tier_2' | 'Tier_3' | 'International';
  location_group_id?: number;
  full_day_rate: number;
  half_day_rate?: number;
  hourly_rate?: number;
  breakfast_rate?: number;
  lunch_rate?: number;
  dinner_rate?: number;
  incidental_rate?: number;
  grade_ids?: number[];
  designation_ids?: number[];
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
}
```

---

## Tab 6: Receipt & Document Settings

### Wireframe
```
+------------------------------------------------------------------+
|  RECEIPT & DOCUMENT SETTINGS                                      |
+------------------------------------------------------------------+
|                                                                   |
|  Receipt Requirements                                             |
|  +----------------------------------------------------------+    |
|  | Receipt Required Above: [₹500______]                     |    |
|  | [Toggle] Require Original Paper Receipt                  |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  File Upload Settings                                             |
|  +----------------------------------------------------------+    |
|  | Allowed File Types:                                      |    |
|  | [x] JPG  [x] JPEG  [x] PNG  [x] PDF  [ ] DOC  [ ] DOCX   |    |
|  | Max File Size:       [5___] MB                           |    |
|  | Max Files/Expense:   [5___]                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Storage & Processing                                             |
|  +----------------------------------------------------------+    |
|  | Receipt Retention: [365__] days                          |    |
|  | [Toggle] Enable Auto OCR (Extract receipt data)          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tab 7: Violation Detection Settings

### Wireframe
```
+------------------------------------------------------------------+
|  VIOLATION DETECTION SETTINGS                                     |
+------------------------------------------------------------------+
|                                                                   |
|  Duplicate Detection                                              |
|  +----------------------------------------------------------+    |
|  | [Toggle] Enable Duplicate Detection                      |    |
|  | Check Fields: [x] Amount [x] Date [x] Category [ ] Vendor|    |
|  | Detection Window: [7___] days                            |    |
|  | Action: ( ) Warn  ( ) Block  (x) Flag for Review         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Policy Violation Handling                                        |
|  +----------------------------------------------------------+    |
|  | Policy Violation Action:                                 |    |
|  | ( ) Warn  ( ) Block  (x) Allow with Justification        |    |
|  | ( ) Flag for Review                                      |    |
|  +----------------------------------------------------------+    |
|  | Over Limit Action:                                       |    |
|  | ( ) Warn  ( ) Block  (x) Allow with Approval             |    |
|  | ( ) Flag for Review                                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Suspicious Pattern Detection                                     |
|  +----------------------------------------------------------+    |
|  | [Toggle] Enable Suspicious Pattern Detection             |    |
|  | Round Amount Threshold: [₹1,000____] (flag amounts above)|    |
|  | [Toggle] Flag Weekend Expenses                           |    |
|  | [Toggle] Flag Holiday Expenses                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tab 8: Payment Settings

### Wireframe
```
+------------------------------------------------------------------+
|  PAYMENT SETTINGS                                                 |
+------------------------------------------------------------------+
|                                                                   |
|  Payment Cycle                                                    |
|  +----------------------------------------------------------+    |
|  | Cycle: ( ) Weekly  ( ) Bi-Weekly  (x) Monthly  ( ) On Demand|  |
|  | Payment Day: [5___] (day of month/week)                  |    |
|  | Minimum Payment: [₹100______]                            |    |
|  | [Toggle] Consolidate Multiple Expenses                   |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Advance Handling                                                 |
|  +----------------------------------------------------------+    |
|  | [Toggle] Auto-Adjust Pending Advances                    |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Bank Transfer                                                    |
|  +----------------------------------------------------------+    |
|  | Transfer Format: [NEFT__________▼]                       |    |
|  |   Options: NEFT, RTGS, IMPS, UPI, Custom                 |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Tax Settings                                                     |
|  +----------------------------------------------------------+    |
|  | [Toggle] Include Tax in Reimbursement                    |    |
|  | [Toggle] TDS Applicable                                  |    |
|  | TDS Threshold: [₹__________]                             |    |
|  | TDS Rate:      [____] %                                  |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tab 9: Notification Settings

### Wireframe
```
+------------------------------------------------------------------+
|  NOTIFICATION SETTINGS                                            |
+------------------------------------------------------------------+
|                                                                   |
|  Notification Channels                                            |
|  +----------------------------------------------------------+    |
|  | [Toggle] Email Notifications                             |    |
|  | [Toggle] Push Notifications                              |    |
|  | [Toggle] SMS Notifications                               |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Notification Events                                              |
|  +----------------------------------------------------------+    |
|  | [Toggle] On Expense Submission                           |    |
|  | [Toggle] On Approval                                     |    |
|  | [Toggle] On Rejection                                    |    |
|  | [Toggle] On Payment                                      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Reminder Settings                                                |
|  +----------------------------------------------------------+    |
|  | Submission Window Close Reminder: [3___] days before     |    |
|  | Pending Approval Reminder: [48__] hours                  |    |
|  | Escalation Reminder:       [24__] hours                  |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tab 10: Audit Trail Settings

### Wireframe
```
+------------------------------------------------------------------+
|  AUDIT TRAIL SETTINGS                                             |
+------------------------------------------------------------------+
|                                                                   |
|  Audit Configuration                                              |
|  +----------------------------------------------------------+    |
|  | [Toggle] Enable Audit Trail                              |    |
|  | Log Retention: [365__] days                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Logging Options                                                  |
|  +----------------------------------------------------------+    |
|  | [Toggle] Log All View Actions (impacts performance)      |    |
|  | [Toggle] Log Individual Field Changes                    |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Tracking Options                                                 |
|  +----------------------------------------------------------+    |
|  | [Toggle] IP Address Tracking                             |    |
|  | [Toggle] Device Tracking                                 |    |
|  | [Toggle] Geo-Location Tracking                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Tab 11: UI/UX Settings

### Wireframe
```
+------------------------------------------------------------------+
|  UI/UX SETTINGS                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  Display Options                                                  |
|  +----------------------------------------------------------+    |
|  | Default Page Size: [20__] items                          |    |
|  | [Toggle] Show Expense Summary Dashboard                  |    |
|  | [Toggle] Show Policy Hints                               |    |
|  | [Toggle] Show Limit Warnings                             |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Draft & Save Options                                             |
|  +----------------------------------------------------------+    |
|  | [Toggle] Allow Draft Save                                |    |
|  | Auto-Save Interval: [30__] seconds                       |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Templates & Recurring                                            |
|  +----------------------------------------------------------+    |
|  | [Toggle] Allow Expense Templates                         |    |
|  | [Toggle] Allow Recurring Expenses                        |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Complete State Management

### Settings State Hook
```typescript
import { useState, useEffect } from 'react';

export const useExpenseSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expense/admin/settings', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section, data) => {
    try {
      const response = await fetch(`/api/expense/admin/settings/section/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setUnsavedChanges(false);
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (err) {
      return { success: false, error: 'Update failed' };
    }
  };

  const updateAllSettings = async (data) => {
    try {
      const response = await fetch('/api/expense/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setUnsavedChanges(false);
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (err) {
      return { success: false, error: 'Update failed' };
    }
  };

  return {
    settings,
    loading,
    error,
    activeTab,
    setActiveTab,
    unsavedChanges,
    setUnsavedChanges,
    updateSection,
    updateAllSettings,
    refreshSettings: fetchSettings
  };
};
```

---

## Response Formats

### Get Settings Response
```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "expense_module_enabled": 1,
    "expense_code_prefix": "EXP",
    "expense_code_format": "{PREFIX}-{YEAR}{MONTH}-{SEQ}",
    "expense_code_sequence_length": 5,
    "auto_generate_expense_code": 1,
    "submission_window_enabled": 0,
    "submission_window_type": "Monthly",
    "submission_window_start_day": 1,
    "submission_window_end_day": 10,
    // ... all other settings fields
    "created_at": "2025-01-22T10:00:00.000Z",
    "updated_at": "2025-01-22T10:00:00.000Z"
  }
}
```

### Update Section Response
```json
{
  "success": true,
  "message": "general settings updated successfully",
  "data": {
    // Complete settings object with updated values
  }
}
```

### Mileage Rates List Response
```json
{
  "success": true,
  "message": "Mileage rates retrieved successfully",
  "data": [
    {
      "id": 1,
      "rate_name": "Two Wheeler Standard",
      "rate_code": "TW-01",
      "vehicle_type": "Two_Wheeler",
      "fuel_type": "Petrol",
      "rate_per_unit": "4.00",
      "min_distance": "0.00",
      "max_distance_per_day": "100.00",
      "max_distance_per_month": null,
      "location_group_id": null,
      "grade_ids": null,
      "effective_from": "2024-04-01",
      "effective_to": null,
      "is_active": 1,
      "created_at": "2025-01-22T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Validation Rules

### General Settings
- `expense_code_prefix`: 1-20 characters
- `expense_code_sequence_length`: 3-10

### Submission Window
- `submission_window_start_day`: 1-31 (monthly) or 1-7 (weekly)
- `submission_window_end_day`: Must be >= start_day (or handle month wrap)
- `late_submission_penalty_percent`: 0-100

### Mileage Rates
- `rate_name`: Required, max 100 characters
- `rate_code`: Required, unique per company
- `rate_per_unit`: Required, > 0
- `effective_from`: Required, valid date

### Per Diem Rates
- `rate_name`: Required, max 100 characters
- `rate_code`: Required, unique per company
- `full_day_rate`: Required, > 0
- `half_day_rate`: Must be <= full_day_rate
- `effective_from`: Required, valid date

---

## Navigation Flow

```
Admin Dashboard
     │
     └──> Expense Settings
              │
              ├──> General Tab (default)
              ├──> Submission Window Tab
              ├──> Date & Time Tab
              ├──> Mileage Tab
              │         ├──> Mileage Settings
              │         └──> Mileage Rates List
              │                   └──> Add/Edit Modal
              ├──> Per Diem Tab
              │         ├──> Per Diem Settings
              │         └──> Per Diem Rates List
              │                   └──> Add/Edit Modal
              ├──> Receipt Tab
              ├──> Violation Tab
              ├──> Payment Tab
              ├──> Notification Tab
              ├──> Audit Trail Tab
              └──> UI/UX Tab
```

---

## Implementation Notes

1. **Tab Persistence**: Save active tab to localStorage to maintain position on page refresh
2. **Unsaved Changes Warning**: Show confirmation dialog when navigating away with unsaved changes
3. **Section Save**: Each section should have its own save button for granular updates
4. **Live Preview**: Show expense code preview as user types prefix/format
5. **Conditional Fields**: Show/hide fields based on toggles (e.g., Google Maps API key only when enabled)
6. **Rate Overlapping**: Validate effective dates don't overlap for same vehicle/tier type
7. **Default Values**: Initialize new settings with sensible defaults from the API

---

## File Structure
```
src/
├── pages/
│   └── admin/
│       └── expense/
│           └── settings/
│               ├── index.tsx           # Main settings page with tabs
│               ├── GeneralTab.tsx
│               ├── SubmissionTab.tsx
│               ├── DateTimeTab.tsx
│               ├── MileageTab.tsx
│               ├── PerDiemTab.tsx
│               ├── ReceiptTab.tsx
│               ├── ViolationTab.tsx
│               ├── PaymentTab.tsx
│               ├── NotificationTab.tsx
│               ├── AuditTab.tsx
│               └── UITab.tsx
├── components/
│   └── expense/
│       └── settings/
│           ├── MileageRateForm.tsx
│           ├── PerDiemRateForm.tsx
│           └── SettingsSection.tsx
└── hooks/
    └── expense/
        └── useExpenseSettings.ts
```
