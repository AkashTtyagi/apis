# Rotating Shift Management - UI Development Guide

## Overview
Rotating Shift Management allows admins to create frequency-based shift rotation patterns. Unlike Roster (date-specific), Rotating Shift defines a pattern that automatically cycles through shifts based on frequency (daily, weekly, bi-weekly, monthly).

**Base URL:** `/api/rotating-shift`

**Authentication:** All endpoints require Bearer token in Authorization header.

> **Note:** `company_id` is automatically taken from authenticated user's token. No need to send in request body.

---

## API Endpoints

### 1. Create Rotating Shift Pattern
**Endpoint:** `POST /api/rotating-shift/create`

**Request Body:**
```json
{
  "pattern_name": "Day-Evening-Night Rotation",
  "pattern_description": "Weekly rotation for production team",
  "shift_order": [1, 2, 3],
  "frequency": "weekly",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "1,2,3",
      "is_excluded": false,
      "priority": 1
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pattern_name | string | Yes | Name of the rotation pattern |
| pattern_description | string | No | Description |
| shift_order | array | Yes | Array of shift IDs in rotation order |
| frequency | string | Yes | `daily`, `weekly`, `bi-weekly`, `monthly` |
| start_date | string | Yes | Pattern start date (YYYY-MM-DD) |
| end_date | string | No | Pattern end date (null = no end) |
| applicability_rules | array | No | Where this pattern applies |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Rotating shift pattern created successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "pattern_name": "Day-Evening-Night Rotation",
    "pattern_description": "Weekly rotation for production team",
    "shift_order": [1, 2, 3],
    "frequency": "weekly",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true,
    "company": {
      "id": 1,
      "org_name": "ABC Company"
    },
    "applicability": [...],
    "shifts": [
      {
        "id": 1,
        "shift_name": "Morning Shift",
        "shift_code": "MS",
        "shift_start_time": "09:00:00",
        "shift_end_time": "18:00:00"
      }
    ]
  }
}
```

---

### 2. Update Rotating Shift Pattern
**Endpoint:** `POST /api/rotating-shift/update`

**Request Body:**
```json
{
  "pattern_id": 1,
  "pattern_name": "Updated Pattern Name",
  "shift_order": [1, 2, 3, 4],
  "frequency": "bi-weekly",
  "applicability_rules": [...]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rotating shift pattern updated successfully",
  "data": { ... }
}
```

---

### 3. Get Pattern List
**Endpoint:** `POST /api/rotating-shift/list`

**Request Body:**
```json
{
  "frequency": "weekly",
  "is_active": true,
  "active_on_date": "2025-06-15",
  "search": "rotation",
  "page": 1,
  "limit": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| frequency | string | No | Filter by frequency |
| is_active | boolean | No | Filter by active/inactive |
| active_on_date | string | No | Patterns active on this date |
| search | string | No | Search in name/description |
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 50) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rotating shift patterns retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "pattern_name": "Day-Evening-Night Rotation",
      "frequency": "weekly",
      "shift_order": [1, 2, 3],
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "is_active": true,
      "company": {
        "id": 1,
        "org_name": "ABC Company"
      },
      "applicability": [...]
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 50,
    "total_pages": 1
  }
}
```

---

### 4. Get Pattern Details
**Endpoint:** `POST /api/rotating-shift/details`

**Request Body:**
```json
{
  "pattern_id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "pattern_name": "Day-Evening-Night Rotation",
    "pattern_description": "Weekly rotation for production team",
    "shift_order": [1, 2, 3],
    "frequency": "weekly",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true,
    "company": {
      "id": 1,
      "org_name": "ABC Company"
    },
    "applicability": [...],
    "shifts": [
      {
        "id": 1,
        "shift_name": "Morning Shift",
        "shift_code": "MS",
        "shift_start_time": "09:00:00",
        "shift_end_time": "18:00:00"
      },
      {
        "id": 2,
        "shift_name": "Evening Shift",
        "shift_code": "ES",
        "shift_start_time": "14:00:00",
        "shift_end_time": "23:00:00"
      }
    ]
  }
}
```

---

### 5. Delete Pattern
**Endpoint:** `POST /api/rotating-shift/delete`

**Request Body:**
```json
{
  "pattern_id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rotating shift pattern deleted successfully",
  "data": null
}
```

---

## UI Components & Flow

### 1. Pattern List Page
**Path:** `/rotating-shift` or `/shift-management/rotating-shift`

**Features:**
- Table with columns: Pattern Name, Frequency, Shifts Count, Start Date, End Date, Status, Actions
- Search bar
- Frequency filter dropdown (All/Daily/Weekly/Bi-Weekly/Monthly)
- Status filter (All/Active/Inactive)
- "Create Pattern" button
- Pagination

**Actions per row:**
- View Details
- Edit
- Delete (with confirmation)

---

### 2. Create/Edit Pattern Form
**Path:** `/rotating-shift/create` or `/rotating-shift/edit/:id`

**Form Sections:**

#### Basic Information
| Field | Type | Validation |
|-------|------|------------|
| Pattern Name | Text Input | Required, max 200 chars |
| Description | Textarea | Optional, max 500 chars |

#### Rotation Settings
| Field | Type | Options |
|-------|------|---------|
| Frequency | Dropdown | Daily, Weekly, Bi-Weekly, Monthly |
| Start Date | Date Picker | Required |
| End Date | Date Picker | Optional (null = indefinite) |

#### Shift Order
- Drag-and-drop list to order shifts
- Shifts fetched from `/api/shift/list`
- Visual preview of rotation cycle

#### Applicability Rules
| Field | Type | Options |
|-------|------|---------|
| Applicability Type | Dropdown | Company, Department, Designation, Branch, Employee, etc. |
| Applicability Value | Multi-select | IDs based on type |
| Is Excluded | Checkbox | Include/Exclude |
| Priority | Number | Lower = Higher priority |

---

### 3. Pattern Details View
**Path:** `/rotating-shift/details/:id`

**Sections:**
1. **Header:** Pattern Name, Status badge, Edit/Delete buttons
2. **Basic Info:** Description, Frequency, Date Range
3. **Shift Rotation:** Visual representation of shift cycle
4. **Applicability:** Table showing where pattern applies

---

## Frequency Visual Guide

```
Daily:     [Shift A] -> [Shift B] -> [Shift C] -> [Shift A] ...
           (changes every day)

Weekly:    Week 1: Shift A | Week 2: Shift B | Week 3: Shift C
           (changes every week)

Bi-Weekly: Weeks 1-2: Shift A | Weeks 3-4: Shift B | Weeks 5-6: Shift C
           (changes every 2 weeks)

Monthly:   Month 1: Shift A | Month 2: Shift B | Month 3: Shift C
           (changes every month)
```

---

## Form Validations

```javascript
const validationRules = {
  pattern_name: {
    required: true,
    maxLength: 200,
    message: "Pattern name is required"
  },
  shift_order: {
    required: true,
    type: "array",
    minLength: 1,
    message: "At least one shift is required"
  },
  frequency: {
    required: true,
    oneOf: ["daily", "weekly", "bi-weekly", "monthly"],
    message: "Select a valid frequency"
  },
  start_date: {
    required: true,
    type: "date",
    format: "YYYY-MM-DD"
  },
  end_date: {
    type: "date",
    format: "YYYY-MM-DD",
    afterOrEqual: "start_date",
    message: "End date must be after start date"
  }
};
```

---

## State Management

```javascript
const rotatingShiftState = {
  list: {
    data: [],
    pagination: { total: 0, page: 1, limit: 50, total_pages: 0 },
    loading: false,
    error: null
  },
  current: {
    data: null,
    loading: false,
    error: null
  },
  filters: {
    frequency: null,
    is_active: null,
    search: "",
    page: 1,
    limit: 50
  }
};
```

---

## Error Handling

| Error Message | UI Action |
|---------------|-----------|
| "shift_order must be a non-empty array of shift IDs" | Highlight shift selection |
| "frequency must be one of: daily, weekly, bi-weekly, monthly" | Highlight frequency dropdown |
| "One or more shifts not found or inactive" | Show error, verify shift IDs |
| "Rotating shift pattern not found" | Redirect to list with error toast |
| "pattern_id is required" | Form validation error |

---

## Dependencies

Before implementing, ensure these APIs are available:
1. **Shift List API** (`/api/shift/list`) - For shift selection
2. **Department List API** - For applicability rules
3. **Designation List API** - For applicability rules
4. **Branch List API** - For applicability rules

---

## Sample API Integration

```javascript
import axios from 'axios';

const rotatingShiftAPI = {
  create: (data) => axios.post('/api/rotating-shift/create', data),
  update: (data) => axios.post('/api/rotating-shift/update', data),
  list: (filters) => axios.post('/api/rotating-shift/list', filters),
  details: (pattern_id) => axios.post('/api/rotating-shift/details', { pattern_id }),
  delete: (pattern_id) => axios.post('/api/rotating-shift/delete', { pattern_id })
};

export default rotatingShiftAPI;
```

---

## Difference: Roster vs Rotating Shift

| Feature | Roster | Rotating Shift |
|---------|--------|----------------|
| Pattern Type | Date-specific | Frequency-based |
| Definition | Specific date -> specific shift | Shift order cycles by frequency |
| Use Case | Fixed schedules, holidays | Recurring rotations |
| Assignment | Manual to employees | Automatic via applicability |
| Flexibility | High (per-date control) | Medium (pattern-based) |
