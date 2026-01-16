# Roster Management - UI Development Guide

## Overview
Roster Management allows admins to create date-based shift patterns and assign them to employees. A roster defines which shift applies on specific dates.

**Base URL:** `/api/roster`

**Authentication:** All endpoints require Bearer token in Authorization header.

> **Note:** `company_id` is automatically taken from authenticated user's token. No need to send in request body.

---

## API Endpoints

### 1. Create Roster
**Endpoint:** `POST /api/roster/create`

**Request Body:**
```json
{
  "roster_name": "Week 1 Rotation",
  "roster_description": "First week rotation pattern",
  "roster_pattern": [
    { "date": "2025-06-01", "shift_id": 1 },
    { "date": "2025-06-02", "shift_id": 2 },
    { "date": "2025-06-03", "shift_id": 3 }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Roster created successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "roster_name": "Week 1 Rotation",
    "roster_description": "First week rotation pattern",
    "is_active": true,
    "created_by": 5,
    "details": [
      {
        "id": 1,
        "roster_id": 1,
        "roster_date": "2025-06-01",
        "shift_id": 1,
        "shift": {
          "id": 1,
          "shift_name": "Morning Shift",
          "shift_code": "MS",
          "start_time": "09:00:00",
          "end_time": "18:00:00"
        }
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "roster_pattern must be a non-empty array"
}
```

---

### 2. Update Roster
**Endpoint:** `POST /api/roster/update`

**Request Body:**
```json
{
  "roster_id": 1,
  "roster_name": "Updated Week 1 Rotation",
  "roster_description": "Updated description",
  "roster_pattern": [
    { "date": "2025-06-01", "shift_id": 1 },
    { "date": "2025-06-02", "shift_id": 2 }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Roster updated successfully",
  "data": { ... }
}
```

---

### 3. Get Roster List
**Endpoint:** `POST /api/roster/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "rotation",
  "page": 1,
  "limit": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_active | boolean | No | Filter by active/inactive status |
| search | string | No | Search in roster_name and roster_description |
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 50) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rosters retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "roster_name": "Week 1 Rotation",
      "roster_description": "First week rotation pattern",
      "is_active": true,
      "employee_count": 5,
      "company": {
        "id": 1,
        "org_name": "ABC Company"
      },
      "details": [...]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "total_pages": 1
  }
}
```

---

### 4. Get Roster Details
**Endpoint:** `POST /api/roster/details`

**Request Body:**
```json
{
  "roster_id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Roster retrieved successfully",
  "data": {
    "id": 1,
    "roster_name": "Week 1 Rotation",
    "roster_description": "First week rotation pattern",
    "is_active": true,
    "company": {
      "id": 1,
      "org_name": "ABC Company"
    },
    "details": [
      {
        "id": 1,
        "roster_date": "2025-06-01",
        "shift_id": 1,
        "shift": {
          "id": 1,
          "shift_name": "Morning Shift",
          "shift_code": "MS",
          "start_time": "09:00:00",
          "end_time": "18:00:00"
        }
      }
    ]
  }
}
```

---

### 5. Assign Employees to Roster
**Endpoint:** `POST /api/roster/assign-employees`

**Request Body:**
```json
{
  "roster_id": 1,
  "employee_ids": [10, 11, 12, 13]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Roster assigned to 4 employees",
  "data": {
    "assigned": [10, 11, 12],
    "already_assigned": [13],
    "failed": []
  },
  "summary": {
    "total": 4,
    "assigned": 3,
    "already_assigned": 1,
    "failed": 0
  }
}
```

---

### 6. Get Roster Employees
**Endpoint:** `POST /api/roster/employees`

**Request Body:**
```json
{
  "roster_id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Roster employees retrieved successfully",
  "data": [
    {
      "id": 10,
      "first_name": "John",
      "last_name": "Doe",
      "employee_code": "EMP001",
      "department_id": 1,
      "designation_id": 2
    }
  ],
  "total": 1
}
```

---

### 7. Remove Employees from Roster
**Endpoint:** `POST /api/roster/remove-employees`

**Request Body:**
```json
{
  "roster_id": 1,
  "employee_ids": [10, 11]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Removed 2 employees from roster",
  "data": {
    "removed": [10, 11],
    "not_found": [],
    "failed": []
  },
  "summary": {
    "total": 2,
    "removed": 2,
    "not_found": 0,
    "failed": 0
  }
}
```

---

### 8. Delete Roster
**Endpoint:** `POST /api/roster/delete`

**Request Body:**
```json
{
  "roster_id": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Roster deleted successfully",
  "data": null
}
```

---

## UI Components & Flow

### 1. Roster List Page
**Path:** `/roster` or `/shift-management/roster`

**Features:**
- Table with columns: Roster Name, Description, No. of Days, Status, Actions
- Search bar for filtering
- Status filter dropdown (All/Active/Inactive)
- Pagination controls
- "Create Roster" button

**Actions per row:**
- View Details
- Edit
- Assign Employees
- Delete (with confirmation modal)

---

### 2. Create/Edit Roster Form
**Path:** `/roster/create` or `/roster/edit/:id`

**Form Fields:**

| Field | Type | Validation |
|-------|------|------------|
| Roster Name | Text Input | Required, max 100 chars |
| Description | Textarea | Optional, max 500 chars |
| Date-Shift Pattern | Dynamic Table | Min 1 entry required |

**Date-Shift Pattern Table:**
| Date | Shift | Action |
|------|-------|--------|
| Date Picker | Shift Dropdown | Remove Row |

- "Add Row" button to add more date-shift entries
- Shift dropdown should be populated from `/api/shift/list` API

---

### 3. Assign Employees Modal/Page
**Triggered from:** Roster List or Roster Details

**Features:**
- Left panel: Available Employees (with search/filter)
- Right panel: Assigned Employees
- Move employees between panels
- Save button to submit

**Employee Selection Options:**
- Individual checkbox selection
- Select All
- Filter by Department/Branch

---

### 4. Roster Details View
**Path:** `/roster/details/:id`

**Sections:**
1. **Header:** Roster Name, Description, Status badge
2. **Date-Shift Pattern:** Calendar view or table showing date -> shift mapping
3. **Assigned Employees:** Table with employee details + remove button

---

## Form Validations

### Create/Update Roster
```javascript
const validationRules = {
  roster_name: {
    required: true,
    maxLength: 100,
    message: "Roster name is required"
  },
  roster_pattern: {
    required: true,
    minLength: 1,
    message: "At least one date-shift entry is required"
  },
  "roster_pattern.*.date": {
    required: true,
    type: "date",
    format: "YYYY-MM-DD"
  },
  "roster_pattern.*.shift_id": {
    required: true,
    type: "number"
  }
};
```

### Assign Employees
```javascript
const validationRules = {
  roster_id: {
    required: true,
    type: "number"
  },
  employee_ids: {
    required: true,
    type: "array",
    minLength: 1,
    message: "Select at least one employee"
  }
};
```

---

## State Management (Redux/Context)

```javascript
// Suggested state structure
const rosterState = {
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
  employees: {
    data: [],
    total: 0,
    loading: false
  },
  filters: {
    search: "",
    is_active: null,
    page: 1,
    limit: 50
  }
};
```

---

## Error Handling

| Error Message | UI Action |
|---------------|-----------|
| "roster_pattern must be a non-empty array" | Show validation error on pattern section |
| "One or more shifts in roster pattern not found or inactive" | Highlight invalid shift dropdowns |
| "Roster not found" | Redirect to list with error toast |
| "roster_id is required" | Form validation error |
| "employee_ids must be an array" | Show error on employee selection |

---

## Dependencies

Before implementing Roster UI, ensure these APIs are available:
1. **Shift List API** (`/api/shift/list`) - For shift dropdown
2. **Employee List API** (`/api/employee/list`) - For employee assignment

---

## Sample API Integration (Axios)

```javascript
import axios from 'axios';

const rosterAPI = {
  create: (data) => axios.post('/api/roster/create', data),
  update: (data) => axios.post('/api/roster/update', data),
  list: (filters) => axios.post('/api/roster/list', filters),
  details: (roster_id) => axios.post('/api/roster/details', { roster_id }),
  assignEmployees: (roster_id, employee_ids) =>
    axios.post('/api/roster/assign-employees', { roster_id, employee_ids }),
  getEmployees: (roster_id) => axios.post('/api/roster/employees', { roster_id }),
  removeEmployees: (roster_id, employee_ids) =>
    axios.post('/api/roster/remove-employees', { roster_id, employee_ids }),
  delete: (roster_id) => axios.post('/api/roster/delete', { roster_id })
};

export default rosterAPI;
```
