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
| PATCH | `/section/:section` | Update specific section (general, violation, audit) |

---

## Screen 1: Main Settings Page (Tabbed Interface)

### Layout Structure
```
+------------------------------------------------------------------+
|  EXPENSE SETTINGS                                    [Save All]   |
+------------------------------------------------------------------+
| [General] [Violation] [Audit]                                     |
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
  { key: 'violation', label: 'Violation', icon: 'AlertTriangle' },
  { key: 'audit', label: 'Audit Trail', icon: 'FileSearch' }
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

## Tab 2: Violation Detection Settings

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

## Tab 3: Audit Trail Settings

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
              ├──> Violation Tab
              └──> Audit Trail Tab
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
│               ├── ViolationTab.tsx
│               └── AuditTab.tsx
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
