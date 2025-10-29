# Roster Management UI - Complete Implementation Guide

## Overview
This document provides complete specifications for building the Roster Management UI with integration to existing backend APIs. The backend APIs are already implemented and tested in Postman collection "13. Roster Management".

---

## Backend API Configuration

**Base URL:** `http://localhost:3000/api`
**Authentication:** Bearer Token in `Authorization` header
**Organization Context:** `company_id` in request body (required for all endpoints)
**Request Format:** All POST requests with JSON body

---

## Module 1: Roster Master Management

### 1.1 Roster List/Dashboard

**Route:** `/admin/roster-management`

**API Endpoint:**
```
POST /api/roster/list
Body:
{
  "company_id": 1,
  "search": "",           // Search in roster_name, description
  "is_active": true,      // Filter by active status (optional)
  "page": 1,
  "limit": 20
}

Response:
{
  "success": true,
  "data": [
    {
      "roster_id": 1,
      "roster_name": "January 2025 Roster",
      "description": "Monthly roster for all departments",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z",
      "created_by": 5,
      "company_id": 1,
      "roster_details": [
        {
          "roster_detail_id": 1,
          "roster_id": 1,
          "date_from": "2025-01-01",
          "date_to": "2025-01-05",
          "shift_id": 5,
          "repeat_type": "weekly",
          "week_number": 1,
          "shift": {
            "shift_id": 5,
            "shift_name": "Morning Shift",
            "start_time": "09:00:00",
            "end_time": "18:00:00"
          }
        }
      ],
      "employee_count": 25
    }
  ],
  "pagination": {
    "total": 48,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────┐
│ Roster Management              [+ Create Roster]   │
└────────────────────────────────────────────────────┘

Filters:
┌────────────────────────────────────────────────────┐
│ 🔍 [Search rosters...]                             │
│ Status: [All ▼] [Active ✓] [Inactive]            │
│ [Clear Filters]                                    │
└────────────────────────────────────────────────────┘

Roster Cards:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ January 2025     │  │ February 2025    │  │ March 2025       │
│ All Departments  │  │ Sales Team       │  │ IT Department    │
│ ─────────────────│  │ ─────────────────│  │ ─────────────────│
│ 📅 Shifts: 4     │  │ 📅 Shifts: 3     │  │ 📅 Shifts: 2     │
│ 👥 25 Employees  │  │ 👥 15 Employees  │  │ 👥  8 Employees   │
│                  │  │                  │  │                  │
│ [Active ✓]       │  │ [Active ✓]       │  │ [Inactive]       │
│                  │  │                  │  │                  │
│ [View] [Edit]    │  │ [View] [Edit]    │  │ [View] [Edit]    │
│      [Delete]    │  │      [Delete]    │  │      [Delete]    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Interactions:**
- Click "Create Roster" → Open Create Roster Modal
- Click "View" → Navigate to Roster Details Screen (1.2)
- Click "Edit" → Open Edit Roster Modal (1.3)
- Click "Delete" → Confirmation dialog → Call DELETE API

---

### 1.2 Roster Details View

**Route:** `/admin/roster-management/:rosterId`

**API Endpoint:**
```
POST /api/roster/details
Body:
{
  "company_id": 1,
  "roster_id": 1
}

Response:
{
  "success": true,
  "data": {
    "roster_id": 1,
    "roster_name": "January 2025 Roster",
    "description": "Monthly roster",
    "is_active": true,
    "roster_details": [
      {
        "roster_detail_id": 1,
        "date_from": "2025-01-01",
        "date_to": "2025-01-07",
        "shift_id": 5,
        "repeat_type": "weekly",
        "week_number": 1,
        "shift": {
          "shift_name": "Morning Shift",
          "start_time": "09:00:00",
          "end_time": "18:00:00"
        }
      }
    ],
    "assigned_employees": [
      {
        "employee_id": 25,
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe",
        "department": {
          "department_name": "Sales"
        }
      }
    ]
  }
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ ← Back to Rosters     January 2025 Roster             │
│                       Status: [Active ✓]               │
│                                                         │
│ [Edit Roster] [Assign Employees] [Delete]              │
└────────────────────────────────────────────────────────┘

Roster Information:
┌────────────────────────────────────────────────────────┐
│ Name: January 2025 Roster                              │
│ Description: Monthly roster for all departments        │
│ Created: Jan 1, 2025 by Admin User                     │
│ Last Updated: Jan 15, 2025                             │
└────────────────────────────────────────────────────────┘

Shift Patterns:
┌────────────────────────────────────────────────────────┐
│ Pattern 1:                                             │
│ Date Range: Jan 1 - Jan 7 (Week 1)                    │
│ Shift: Morning Shift (09:00 - 18:00)                  │
│ Repeat: Weekly                                         │
│ ─────────────────────────────────────────────────────  │
│ Pattern 2:                                             │
│ Date Range: Jan 8 - Jan 14 (Week 2)                   │
│ Shift: Evening Shift (14:00 - 22:00)                  │
│ Repeat: Weekly                                         │
└────────────────────────────────────────────────────────┘

Assigned Employees (25):
┌────────────────────────────────────────────────────────┐
│ 📷 John Doe (EMP001) - Sales Department               │
│ 📷 Jane Smith (EMP002) - Sales Department             │
│ 📷 Bob Wilson (EMP003) - IT Department                │
│ ...                                                     │
│                                                         │
│ [Manage Employees]                                      │
└────────────────────────────────────────────────────────┘
```

---

### 1.3 Create Roster Modal

**API Endpoint:**
```
POST /api/roster/create
Body:
{
  "company_id": 1,
  "roster_name": "January 2025 Roster",
  "description": "Monthly roster for all departments",
  "is_active": true,
  "roster_details": [
    {
      "date_from": "2025-01-01",
      "date_to": "2025-01-07",
      "shift_id": 5,
      "repeat_type": "weekly",    // Options: once, daily, weekly, monthly
      "week_number": 1            // For weekly: 1-4, null for others
    },
    {
      "date_from": "2025-01-08",
      "date_to": "2025-01-14",
      "shift_id": 6,
      "repeat_type": "weekly",
      "week_number": 2
    }
  ]
}

Response:
{
  "success": true,
  "message": "Roster created successfully",
  "data": {
    "roster_id": 123,
    "roster_name": "January 2025 Roster",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create New Roster                       [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Basic Information                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  Roster Name *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ January 2025 Roster                      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Monthly roster for all departments       │  │
│  │                                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Status                                          │
│  ☑ Active                                       │
│                                                  │
│  Shift Patterns                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  Pattern 1:                                      │
│  Date Range:                                     │
│  From: [2025-01-01 📅]  To: [2025-01-07 📅]    │
│                                                  │
│  Shift: [Morning Shift (9-6) ▼]                │
│                                                  │
│  Repeat: ⚪ Once  ⚪ Daily  ⚫ Weekly  ⚪ Monthly│
│  Week Number: [1 ▼] (for weekly only)           │
│                                                  │
│  [- Remove Pattern]                              │
│                                                  │
│  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈  │
│                                                  │
│  Pattern 2:                                      │
│  Date Range:                                     │
│  From: [2025-01-08 📅]  To: [2025-01-14 📅]    │
│                                                  │
│  Shift: [Evening Shift (2-10) ▼]               │
│                                                  │
│  Repeat: ⚪ Once  ⚪ Daily  ⚫ Weekly  ⚪ Monthly│
│  Week Number: [2 ▼]                              │
│                                                  │
│  [- Remove Pattern]                              │
│                                                  │
│  [+ Add Another Pattern]                         │
│                                                  │
├─────────────────────────────────────────────────┤
│                [Cancel]  [Create Roster]        │
└─────────────────────────────────────────────────┘
```

**Validations:**
- Roster name: Required, min 3 chars, max 255 chars
- At least one shift pattern required
- Date From must be before Date To
- No overlapping date ranges in patterns

---

### 1.4 Update Roster

**API Endpoint:**
```
POST /api/roster/update
Body:
{
  "company_id": 1,
  "roster_id": 1,
  "roster_name": "Updated January 2025 Roster",
  "description": "Updated description",
  "is_active": true,
  "roster_details": [
    // Same format as create, includes updated patterns
  ]
}

Response:
{
  "success": true,
  "message": "Roster updated successfully",
  "data": { ... }
}
```

**UI:** Same modal as Create, but pre-filled with existing data

---

### 1.5 Delete Roster

**API Endpoint:**
```
POST /api/roster/delete
Body:
{
  "company_id": 1,
  "roster_id": 1
}

Response:
{
  "success": true,
  "message": "Roster deleted successfully"
}
```

**Confirmation Dialog:**
```
┌──────────────────────────────────────┐
│ Delete Roster?                       │
├──────────────────────────────────────┤
│                                      │
│ Are you sure you want to delete      │
│ "January 2025 Roster"?               │
│                                      │
│ This will also remove all employee   │
│ assignments. This action cannot be   │
│ undone.                              │
│                                      │
│ [Cancel]  [Delete Roster]            │
└──────────────────────────────────────┘
```

---

## Module 2: Employee Assignment Management

### 2.1 Assign Employees to Roster

**API Endpoint:**
```
POST /api/roster/assign-employees
Body:
{
  "company_id": 1,
  "roster_id": 1,
  "employee_ids": [25, 26, 27, 28, 29]
}

Response:
{
  "success": true,
  "message": "5 employees assigned to roster successfully",
  "data": {
    "assigned_count": 5,
    "roster_id": 1
  }
}
```

**Get Assigned Employees:**
```
POST /api/roster/employees
Body:
{
  "company_id": 1,
  "roster_id": 1,
  "page": 1,
  "limit": 50
}

Response:
{
  "success": true,
  "data": [
    {
      "employee_id": 25,
      "employee_code": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@company.com",
      "department": {
        "department_id": 5,
        "department_name": "Sales"
      },
      "branch": {
        "branch_id": 2,
        "branch_name": "Main Office"
      }
    }
  ],
  "pagination": { ... }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────────┐
│  Assign Employees to Roster               [✕]   │
├──────────────────────────────────────────────────┤
│                                                   │
│  Roster: January 2025 Roster                     │
│  Current Assignments: 25 employees               │
│                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                   │
│  Select Employees:                                │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │ 🔍 Search employees by name or code...   │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  Filters:                                         │
│  Department: [All ▼]  Branch: [All ▼]           │
│                                                   │
│  Available Employees:                             │
│  ┌───────────────────────────────────────────┐  │
│  │ ☐ Select All (50 employees)              │  │
│  ├───────────────────────────────────────────┤  │
│  │ ☑ John Doe (EMP001) - Sales              │  │
│  │ ☑ Jane Smith (EMP002) - Sales            │  │
│  │ ☐ Bob Wilson (EMP003) - IT               │  │
│  │ ☐ Alice Brown (EMP004) - HR              │  │
│  │ ...                                        │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  Selected: 2 employees                            │
│                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                   │
│  Quick Select:                                    │
│  [All Sales Dept] [All IT Dept] [All HR Dept]   │
│                                                   │
├──────────────────────────────────────────────────┤
│              [Cancel]  [Assign Employees]        │
└──────────────────────────────────────────────────┘
```

---

### 2.2 Remove Employees from Roster

**API Endpoint:**
```
POST /api/roster/remove-employees
Body:
{
  "company_id": 1,
  "roster_id": 1,
  "employee_ids": [25, 26]
}

Response:
{
  "success": true,
  "message": "2 employees removed from roster successfully"
}
```

**Confirmation Dialog:**
```
┌──────────────────────────────────────┐
│ Remove Employees?                    │
├──────────────────────────────────────┤
│                                      │
│ Are you sure you want to remove      │
│ 2 selected employees from this       │
│ roster?                              │
│                                      │
│ • John Doe (EMP001)                  │
│ • Jane Smith (EMP002)                │
│                                      │
│ [Cancel]  [Remove]                   │
└──────────────────────────────────────┘
```

---

## Module 3: Roster Assignments (Date-specific Overrides)

**Note:** These APIs override the employee's default roster shift for specific dates.

### 3.1 Create Single Assignment

**API Endpoint:**
```
POST /api/roster/assignments
Body:
{
  "company_id": 1,
  "employee_id": 25,
  "shift_id": 6,
  "assignment_date": "2025-01-15",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "assignment_id": 100,
    "employee_id": 25,
    "shift_id": 6,
    "assignment_date": "2025-01-15"
  }
}
```

**Usage:** When you need to assign a different shift to an employee on a specific date (overriding their roster pattern).

---

### 3.2 Bulk Assignments

**API Endpoint:**
```
POST /api/roster/assignments/bulk
Body:
{
  "company_id": 1,
  "assignments": [
    {
      "employee_id": 25,
      "shift_id": 5,
      "assignment_date": "2025-01-15"
    },
    {
      "employee_id": 26,
      "shift_id": 5,
      "assignment_date": "2025-01-15"
    },
    {
      "employee_id": 27,
      "shift_id": 6,
      "assignment_date": "2025-01-16"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Bulk assignments processed",
  "data": {
    "created": 2,
    "failed": 1,
    "errors": [
      {
        "employee_id": 27,
        "assignment_date": "2025-01-16",
        "error": "Employee not found"
      }
    ]
  }
}
```

---

### 3.3 Get Assignments

**API Endpoint:**
```
GET /api/roster/assignments
Query Parameters:
- company_id: 1
- employee_id: 25 (optional)
- shift_id: 5 (optional)
- date_from: 2025-01-01 (optional)
- date_to: 2025-01-31 (optional)
- is_active: true (optional)
- page: 1
- limit: 50

Response:
{
  "success": true,
  "data": [
    {
      "assignment_id": 100,
      "employee_id": 25,
      "shift_id": 6,
      "assignment_date": "2025-01-15",
      "is_active": true,
      "created_at": "2025-01-10T10:00:00.000Z",
      "employee": {
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "shift": {
        "shift_name": "Evening Shift",
        "start_time": "14:00:00",
        "end_time": "22:00:00"
      }
    }
  ],
  "pagination": { ... }
}
```

---

### 3.4 Update Assignment

**API Endpoint:**
```
PUT /api/roster/assignments/:assignment_id
Body:
{
  "company_id": 1,
  "shift_id": 7,
  "assignment_date": "2025-01-16",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Assignment updated successfully",
  "data": { ... }
}
```

---

### 3.5 Delete Assignment

**API Endpoint:**
```
DELETE /api/roster/assignments/:assignment_id
Query Parameters:
- company_id: 1

Response:
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

---

### 3.6 Get Employee Roster for Date Range

**API Endpoint:**
```
GET /api/roster/assignments/employee/:employee_id/range
Query Parameters:
- company_id: 1
- date_from: 2025-01-01
- date_to: 2025-01-31

Response:
{
  "success": true,
  "data": [
    {
      "assignment_id": 100,
      "assignment_date": "2025-01-15",
      "shift": {
        "shift_id": 6,
        "shift_name": "Evening Shift",
        "start_time": "14:00:00",
        "end_time": "22:00:00"
      }
    }
  ]
}
```

---

## Module 4: Rotating Shift Patterns

### 4.1 Rotating Pattern List

**Route:** `/admin/rotating-shifts`

**API Endpoint:**
```
POST /api/rotating-shift/list
Body:
{
  "company_id": 1,
  "search": "",           // Search in pattern_name
  "is_active": true,      // Optional filter
  "active_on_date": "2025-01-15",  // Optional: patterns active on this date
  "page": 1,
  "limit": 20
}

Response:
{
  "success": true,
  "data": [
    {
      "rotating_shift_id": 1,
      "pattern_name": "3-Shift Rotation",
      "description": "Standard 8-hour rotating shifts",
      "rotation_frequency": 7,
      "rotation_frequency_type": "weekly",  // daily, weekly, monthly
      "shift_order": [5, 6, 7],             // Array of shift_ids in rotation
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "is_active": true,
      "applicability_rules": {
        "department_ids": [5, 6],
        "branch_ids": [2],
        "employee_type": "full_time"
      },
      "shifts": [
        {
          "shift_id": 5,
          "shift_name": "Morning",
          "start_time": "09:00:00",
          "end_time": "18:00:00"
        },
        {
          "shift_id": 6,
          "shift_name": "Evening",
          "start_time": "14:00:00",
          "end_time": "22:00:00"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────┐
│ Rotating Shift Patterns      [+ Create Pattern] │
└──────────────────────────────────────────────────┘

┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ 3-Shift       │  │ 2-Shift       │  │ Weekly Cycle  │
│ Rotation      │  │ Pattern       │  │               │
│ ──────────────│  │ ──────────────│  │ ──────────────│
│ Frequency:    │  │ Frequency:    │  │ Frequency:    │
│ 7 days        │  │ 3 days        │  │ 14 days       │
│               │  │               │  │               │
│ Pattern:      │  │ Pattern:      │  │ Pattern:      │
│ M → E → N     │  │ M → E → OFF   │  │ M → M → E → E │
│               │  │               │  │               │
│ 📅 Jan - Dec  │  │ 📅 Jan - Jun  │  │ 📅 Jan - Dec  │
│               │  │               │  │               │
│ [Active ✓]    │  │ [Active ✓]    │  │ [Inactive]    │
│               │  │               │  │               │
│ [View] [Edit] │  │ [View] [Edit] │  │ [View] [Edit] │
│      [Delete] │  │      [Delete] │  │      [Delete] │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

### 4.2 Create Rotating Pattern

**API Endpoint:**
```
POST /api/rotating-shift/create
Body:
{
  "company_id": 1,
  "pattern_name": "3-Shift Rotation",
  "description": "Standard 8-hour rotating shifts",
  "rotation_frequency": 7,
  "rotation_frequency_type": "weekly",    // Options: daily, weekly, monthly
  "shift_order": [5, 6, 7],              // Shift IDs in rotation order
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "is_active": true,
  "applicability_rules": {               // Optional
    "department_ids": [5, 6],
    "branch_ids": [2],
    "employee_type": "full_time"
  }
}

Response:
{
  "success": true,
  "message": "Rotating pattern created successfully",
  "data": {
    "rotating_shift_id": 10,
    ...
  }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────────────┐
│  Create Rotating Shift Pattern                [✕]   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Pattern Information                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                       │
│  Pattern Name *                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ 3-Shift Rotation                            │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Description                                          │
│  ┌─────────────────────────────────────────────┐    │
│  │ Standard 8-hour rotating shifts             │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Rotation Frequency                                   │
│  ┌──────┐  ⚪ Daily  ⚫ Weekly  ⚪ Monthly            │
│  │  7   │  (Frequency in days)                       │
│  └──────┘                                            │
│                                                       │
│  Shift Rotation Order *                               │
│  (Drag to reorder shifts)                             │
│                                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐         │
│  │    1     │ → │    2     │ → │    3     │         │
│  │ Morning  │   │ Evening  │   │  Night   │         │
│  │  9-6     │   │  2-10    │   │  10-6    │  [+Add] │
│  └──────────┘   └──────────┘   └──────────┘         │
│                                                       │
│  Preview: Day 1: Morning → Day 8: Evening →          │
│           Day 15: Night → [Repeats...]               │
│                                                       │
│  Active Period                                        │
│  Start: [2025-01-01 📅]  End: [2025-12-31 📅]       │
│                                                       │
│  Applicability (Optional)                             │
│  Departments: [Sales, IT ▼]                          │
│  Branches: [Main Office ▼]                           │
│  Employee Type: [Full Time ▼]                        │
│                                                       │
│  ☑ Active                                            │
│                                                       │
├──────────────────────────────────────────────────────┤
│                    [Cancel]  [Create Pattern]        │
└──────────────────────────────────────────────────────┘
```

---

### 4.3 Update Rotating Pattern

**API Endpoint:**
```
POST /api/rotating-shift/update
Body:
{
  "company_id": 1,
  "rotating_shift_id": 1,
  "pattern_name": "Updated 3-Shift Rotation",
  // ... same fields as create
}

Response:
{
  "success": true,
  "message": "Pattern updated successfully",
  "data": { ... }
}
```

---

### 4.4 Get Pattern Details

**API Endpoint:**
```
POST /api/rotating-shift/details
Body:
{
  "company_id": 1,
  "rotating_shift_id": 1
}

Response:
{
  "success": true,
  "data": {
    "rotating_shift_id": 1,
    "pattern_name": "3-Shift Rotation",
    // ... all pattern details
  }
}
```

---

### 4.5 Delete Pattern

**API Endpoint:**
```
POST /api/rotating-shift/delete
Body:
{
  "company_id": 1,
  "rotating_shift_id": 1
}

Response:
{
  "success": true,
  "message": "Pattern deleted successfully"
}
```

---

## Module 5: Shift Swap Management

### 5.1 Shift Swap Request List

**Route:** `/admin/shift-swaps`

**API Endpoint:**
```
POST /api/shift-swap/list
Body:
{
  "company_id": 1,
  "requester_id": 25,           // Optional filter
  "target_employee_id": 26,     // Optional filter
  "target_consent": 0,          // 0=pending, 1=approved, 2=rejected
  "approval_status": 0,         // 0=pending, 1=approved, 2=rejected
  "page": 1,
  "limit": 20
}

Response:
{
  "success": true,
  "data": [
    {
      "swap_id": 1,
      "requester_id": 25,
      "target_employee_id": 26,
      "requester_assignment_id": 100,
      "target_assignment_id": 101,
      "swap_reason": "Personal emergency",
      "target_consent": 1,        // 0=pending, 1=approved, 2=rejected
      "approval_status": 0,       // 0=pending, 1=approved, 2=rejected
      "rejection_reason": null,
      "created_at": "2025-01-10T08:30:00.000Z",
      "requester": {
        "employee_id": 25,
        "employee_code": "EMP001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "target_employee": {
        "employee_id": 26,
        "employee_code": "EMP002",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "requester_assignment": {
        "assignment_id": 100,
        "assignment_date": "2025-01-15",
        "shift": {
          "shift_name": "Morning Shift",
          "start_time": "09:00:00",
          "end_time": "18:00:00"
        }
      },
      "target_assignment": {
        "assignment_id": 101,
        "assignment_date": "2025-01-16",
        "shift": {
          "shift_name": "Evening Shift",
          "start_time": "14:00:00",
          "end_time": "22:00:00"
        }
      }
    }
  ],
  "pagination": { ... }
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────┐
│ Shift Swap Requests                              │
│                                                   │
│ [All] [Pending (5)] [Approved] [Rejected]       │
└──────────────────────────────────────────────────┘

Swap Request #1001                  [Pending Approval]
┌───────────────────────────────────────────────────┐
│                                                    │
│  FROM                    ↔️             TO         │
│  ┌──────────────┐              ┌──────────────┐  │
│  │ 📷 John Doe  │              │ 📷 Jane Smith│  │
│  │ EMP001       │              │ EMP002       │  │
│  │              │              │              │  │
│  │ Morning      │    SWAP      │ Evening      │  │
│  │ 09:00 - 18:00│   ◄────►     │ 14:00 - 22:00│  │
│  │ Jan 15, 2025 │              │ Jan 16, 2025 │  │
│  └──────────────┘              └──────────────┘  │
│                                                    │
│  Reason: Personal emergency                        │
│  Requested: Jan 10, 2025 8:30 AM                  │
│                                                    │
│  Status:                                           │
│  ✓ Accepted by Jane Smith                         │
│  ⏳ Pending Manager Approval                       │
│                                                    │
│  [View Details] [✓ Approve] [✗ Reject]           │
│                                                    │
└───────────────────────────────────────────────────┘
```

---

### 5.2 Create Swap Request

**API Endpoint:**
```
POST /api/shift-swap/create
Body:
{
  "company_id": 1,
  "requester_id": 25,
  "target_employee_id": 26,
  "requester_assignment_id": 100,
  "target_assignment_id": 101,
  "swap_reason": "Personal emergency",
  "requester_comments": "Need to attend family function"
}

Response:
{
  "success": true,
  "message": "Swap request created successfully",
  "data": {
    "swap_id": 50,
    "target_consent": 0,      // Pending by default
    "approval_status": 0      // Pending by default
  }
}
```

---

### 5.3 Respond to Swap Request (Target Employee)

**API Endpoint:**
```
POST /api/shift-swap/respond
Body:
{
  "company_id": 1,
  "swap_id": 1,
  "target_consent": 1,        // 1=approve, 2=reject
  "target_comments": "Happy to help!"
}

Response:
{
  "success": true,
  "message": "Swap response recorded successfully",
  "data": { ... }
}
```

**For Rejection:**
```
Body:
{
  "company_id": 1,
  "swap_id": 1,
  "target_consent": 2,        // Reject
  "rejection_reason": "Already have plans that day"
}
```

---

### 5.4 Manager Approval/Rejection

**Approve Swap:**
```
POST /api/shift-swap/respond
Body:
{
  "company_id": 1,
  "swap_id": 1,
  "approval_status": 1,       // 1=approve, 2=reject
  "approval_comments": "Approved due to emergency"
}

Response:
{
  "success": true,
  "message": "Swap approved successfully - shifts have been swapped",
  "data": { ... }
}
```

**Reject Swap:**
```
Body:
{
  "company_id": 1,
  "swap_id": 1,
  "approval_status": 2,       // Reject
  "rejection_reason": "Insufficient coverage for that date"
}
```

---

### 5.5 Get Pending Swaps (Current User)

**API Endpoint:**
```
POST /api/shift-swap/pending
Body:
{
  "company_id": 1
}

Response:
{
  "success": true,
  "data": [
    // Array of swap requests pending for current user (as target or approver)
  ]
}
```

---

### 5.6 Cancel Swap Request

**API Endpoint:**
```
POST /api/shift-swap/cancel
Body:
{
  "company_id": 1,
  "swap_id": 1
}

Response:
{
  "success": true,
  "message": "Swap request cancelled successfully"
}
```

---

## Authentication & Headers

**All API requests require:**

```javascript
headers: {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
}
```

**Getting token from login:**
```
POST /api/auth/login
Body:
{
  "email": "user@company.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "company_id": 1,
      "employee_id": 25,
      ...
    }
  }
}
```

---

## Error Handling

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

### Error Handling in UI:

```javascript
try {
  const response = await api.post('/roster/create', data);

  if (response.data.success) {
    toast.success(response.data.message);
    // Update UI
  }
} catch (error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.message || 'Something went wrong';
    toast.error(message);

    if (error.response.status === 401) {
      // Redirect to login
      router.push('/login');
    }
  } else if (error.request) {
    // Network error
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

---

## UI Components & Styling

### Color Scheme:

```css
/* Shift Colors */
--morning-shift: #E3F2FD;      /* Light Blue */
--evening-shift: #FFE0B2;      /* Light Orange */
--night-shift: #1A237E;        /* Dark Blue */
--off-day: #F5F5F5;            /* Gray */

/* Status Colors */
--active: #4CAF50;             /* Green */
--inactive: #9E9E9E;           /* Gray */
--pending: #FF9800;            /* Orange */
--approved: #4CAF50;           /* Green */
--rejected: #F44336;           /* Red */

/* UI Colors */
--primary: #1976D2;            /* Blue */
--secondary: #FFA726;          /* Orange */
--success: #4CAF50;            /* Green */
--warning: #FF9800;            /* Amber */
--error: #F44336;              /* Red */
```

### Toast Notifications:

```javascript
// Success
toast.success("Roster created successfully");

// Error
toast.error("Failed to create roster");

// Warning
toast.warning("This action cannot be undone");

// Info
toast.info("Loading roster data...");
```

### Loading States:

```html
<!-- Button Loading -->
<button disabled>
  <span class="spinner"></span>
  Creating...
</button>

<!-- Page Loading -->
<div class="loading-overlay">
  <div class="spinner-large"></div>
  <p>Loading roster data...</p>
</div>

<!-- Skeleton Loader -->
<div class="skeleton-card">
  <div class="skeleton-title"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Setup API service layer with axios
- [ ] Configure authentication interceptors
- [ ] Implement error handling
- [ ] Setup routing
- [ ] Create base layout components

### Phase 2: Roster Management
- [ ] Roster list page with filters
- [ ] Create roster modal with dynamic patterns
- [ ] Edit roster functionality
- [ ] Delete roster with confirmation
- [ ] Pagination

### Phase 3: Employee Assignment
- [ ] Assign employees modal
- [ ] Employee search and filters
- [ ] Remove employees functionality
- [ ] Bulk selection

### Phase 4: Roster Assignments
- [ ] Single assignment creation
- [ ] Bulk assignment functionality
- [ ] Assignment list view
- [ ] Update/delete assignments
- [ ] Employee roster view (date range)

### Phase 5: Rotating Patterns
- [ ] Pattern list page
- [ ] Create pattern with shift order
- [ ] Edit pattern
- [ ] Delete pattern
- [ ] Pattern preview

### Phase 6: Shift Swaps
- [ ] Swap request list
- [ ] Create swap request
- [ ] Target employee response
- [ ] Manager approval/rejection
- [ ] Pending swaps view
- [ ] Cancel request

### Phase 7: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Form validations
- [ ] Responsive design
- [ ] Testing

---

## Testing with Postman

All APIs are already implemented and tested. You can find them in:
**Postman Collection: "13. Roster Management"**

Make sure to:
1. Set the environment variable `base_url` to `http://localhost:3000/api`
2. After login, the `access_token` will be automatically set
3. Test all endpoints before starting UI development

---

## Support & Questions

If you encounter any issues with the APIs or need clarification:
1. Check the Postman collection for working examples
2. Review the controller files for exact request/response formats
3. Check backend logs for detailed error messages

---

**Good luck with the implementation! 🚀**
