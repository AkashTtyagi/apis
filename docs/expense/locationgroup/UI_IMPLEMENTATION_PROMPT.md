# Phase 1.1: Location Group Management - UI Implementation Document

## Overview
Location Groups are geographical clusters used to apply location-based expense limits, per diem rates, and policies.

---

## Navigation
```
Admin Panel → Expense Management → Settings → Location Groups
```
**Route:** `/admin/expense/settings/location-groups`

---

## Screen 1: Location Groups List

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Home > Expense > Settings > Location Groups                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Location Groups                                         [+ Add New]    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Search: [______________]  Status: [All ▼]  COL Index: [All ▼]   │   │
│  │                                                       [Reset]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │   │ Group Name     │ Code    │ Countries│ COL Index │ Status │Act│  │
│  ├───┼────────────────┼─────────┼──────────┼───────────┼────────┼───┤  │
│  │ ☐ │ Metro Cities   │ LOC-001 │ India    │ Very High │ Active │👁✏🗑│  │
│  │ ☐ │ Tier-2 Cities  │ LOC-002 │ India    │ High      │ Active │👁✏🗑│  │
│  │ ☐ │ International  │ LOC-003 │ USA, UK  │ Very High │ Active │👁✏🗑│  │
│  │ ☐ │ Remote Areas   │ LOC-004 │ India    │ Low       │Inactive│👁✏🗑│  │
│  └───┴────────────────┴─────────┴──────────┴───────────┴────────┴───┘  │
│                                                                         │
│  Showing 1-4 of 4                                    [< 1 2 3 >]       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Field | Sortable | Filterable | Width |
|--------|-------|----------|------------|-------|
| Checkbox | - | No | No | 40px |
| Group Name | `group_name` | Yes | Search | Auto |
| Code | `group_code` | Yes | Search | 100px |
| Countries | `countries` (count/names) | No | No | 120px |
| COL Index | `cost_of_living_index` | Yes | Dropdown | 100px |
| Status | `is_active` | Yes | Dropdown | 80px |
| Actions | - | No | No | 100px |

### Filters

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Search in name, code |
| Status | Dropdown | All, Active, Inactive |
| COL Index | Dropdown | All, Low, Medium, High, Very High |

### Actions
- **View (👁):** Open View Modal
- **Edit (✏):** Open Edit Modal
- **Delete (🗑):** Confirmation dialog

---

## Screen 2: Add/Edit Location Group (Modal/Page)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Add Location Group                                                [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─── Basic Information ───────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  Group Name *                                                    │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ Metro Cities Tier 1                                        │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  Group Code *                        Auto-generate: ☑            │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ LOC-001                                                    │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │  ℹ️ Format: LOC-XXX. Must be unique.                             │   │
│  │                                                                  │   │
│  │  Description                                                     │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ Top metropolitan cities with highest cost of living        │ │   │
│  │  │                                                            │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── Geographical Hierarchy ──────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  Country * (Multi-select)                                        │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ 🇮🇳 India  ✕  │  🔍 Search countries...                     │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  State/Province * (Multi-select) - Based on selected countries   │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ Maharashtra ✕ │ Karnataka ✕ │ Delhi ✕ │  🔍 Search...      │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │                                                                  │   │
│  │  City * (Multi-select) - Based on selected states                │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ Mumbai ✕ │ Delhi ✕ │ Bangalore ✕ │ Chennai ✕ │  🔍 Search  │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │  [+ Add Custom City]                                             │   │
│  │                                                                  │   │
│  │  Postal/ZIP Code Range (Optional)                                │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │ 110001-110099, 400001-400099                               │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │  ℹ️ Format: Range (110001-110099) or comma-separated values      │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── Additional Configuration ────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  Cost of Living Index *                                          │   │
│  │  ○ Low   ○ Medium   ○ High   ◉ Very High                        │   │
│  │  ℹ️ Used by AI for smart limit recommendations                   │   │
│  │                                                                  │   │
│  │  Status                                                          │   │
│  │  ◉ Active   ○ Inactive                                          │   │
│  │  ℹ️ Inactive groups won't appear in policy selection             │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                              [Cancel]    [Save]         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Form Fields Specification

| Field | Type | Required | Validation | Max Length |
|-------|------|----------|------------|------------|
| Group Name | Text Input | Yes | Not empty | 100 chars |
| Group Code | Text Input | Yes | Unique, Format: LOC-XXX | 20 chars |
| Description | Textarea | No | - | 500 chars |
| Country | Multi-select Dropdown | Yes | Min 1 selection | - |
| State/Province | Multi-select Dropdown | Yes | Min 1 selection, Dependent on Country | - |
| City | Multi-select Dropdown | Yes | Min 1 selection, Dependent on State | - |
| Postal/ZIP Range | Text Input | No | Valid format | 500 chars |
| Cost of Living Index | Radio Group | Yes | - | - |
| Status | Radio Group | Yes | Default: Active | - |

### Dropdown Data Sources

| Field | Source |
|-------|--------|
| Country | HRMS Location Master (`/api/master/countries`) |
| State/Province | HRMS Location Master (`/api/master/states?country_id=X`) |
| City | HRMS Location Master (`/api/master/cities?state_id=X`) |

### Cost of Living Index Options
- Low
- Medium
- High
- Very High

---

## Screen 3: View Location Group (Modal)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Location Group Details                                            [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Metro Cities Tier 1                          [Very High] [Active]│  │
│  │  Code: LOC-001                                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Description                                                            │
│  ─────────────────────────────────────────────────────────────────────  │
│  Top metropolitan cities with highest cost of living and expense limits │
│                                                                         │
│  Geographical Coverage                                                  │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Countries: India                                                       │
│                                                                         │
│  States & Cities:                                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ State           │ Cities                                       │    │
│  ├─────────────────┼──────────────────────────────────────────────┤    │
│  │ Maharashtra     │ Mumbai, Pune                                 │    │
│  │ Karnataka       │ Bangalore                                    │    │
│  │ Delhi           │ New Delhi                                    │    │
│  │ Tamil Nadu      │ Chennai                                      │    │
│  │ Telangana       │ Hyderabad                                    │    │
│  └─────────────────┴──────────────────────────────────────────────┘    │
│                                                                         │
│  Postal/ZIP Codes: 110001-110099, 400001-400099, 560001-560099         │
│                                                                         │
│  Usage Information                                                      │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Used in 3 Expense Policies                                          │
│  • Used in 5 Per Diem Rate configurations                              │
│  • Used in 2 Category Limit configurations                             │
│                                                                         │
│  Audit Information                                                      │
│  ─────────────────────────────────────────────────────────────────────  │
│  Created By: Admin User           Created At: 15 Jan 2025, 10:30 AM    │
│  Modified By: Finance Manager     Modified At: 18 Jan 2025, 02:15 PM   │
│  [View Change History]                                                  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                              [Edit]         [Close]     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## UI Flows

### Flow 1: List Page Load
```
Page Load
    │
    ├── Show skeleton loader
    │
    ├── API Call: GET location groups list
    │   POST /api/admin/expense/location-groups/list
    │   Body: { page: 1, limit: 10 }
    │
    ├── Success?
    │   ├── Yes → Render table with data
    │   └── No → Show error message with retry button
    │
    └── Empty data?
        ├── Yes → Show empty state with "Create First Group" button
        └── No → Show table
```

### Flow 2: Add Location Group
```
Click [+ Add New]
    │
    ├── Open Add Modal/Navigate to Add Page
    │
    ├── Load Countries dropdown
    │   API: GET /api/master/countries
    │
    ├── User selects Country
    │   │
    │   └── Load States for selected countries
    │       API: GET /api/master/states?country_ids=1,2
    │
    ├── User selects States
    │   │
    │   └── Load Cities for selected states
    │       API: GET /api/master/cities?state_ids=1,2,3
    │
    ├── User fills all fields
    │
    ├── Click [Save]
    │   │
    │   ├── Client-side validation
    │   │   ├── Fail → Show field errors
    │   │   └── Pass → Continue
    │   │
    │   ├── API Call: POST /api/admin/expense/location-groups/create
    │   │
    │   └── Response
    │       ├── Success → Toast "Created successfully", Close modal, Refresh list
    │       └── Error → Show error message (e.g., "Code already exists")
    │
    └── Click [Cancel] → Close modal without saving
```

### Flow 3: Edit Location Group
```
Click Edit (✏) icon
    │
    ├── Open Edit Modal
    │
    ├── API Call: GET /api/admin/expense/location-groups/details
    │   Body: { id: X }
    │
    ├── Load Countries, States, Cities dropdowns
    │
    ├── Populate form with existing data
    │   Note: Group Code field is disabled
    │
    ├── User modifies fields
    │
    ├── Click [Save]
    │   │
    │   ├── Validate fields
    │   │
    │   ├── API Call: POST /api/admin/expense/location-groups/update
    │   │
    │   └── Success → Toast, Close, Refresh
    │
    └── Click [Cancel] → Discard changes, Close
```

### Flow 4: Delete Location Group
```
Click Delete (🗑) icon
    │
    ├── API Call: Check usage
    │   POST /api/admin/expense/location-groups/check-usage
    │   Body: { id: X }
    │
    ├── Is in use?
    │   │
    │   ├── Yes → Show warning dialog
    │   │   "This location group is used in 3 policies.
    │   │    Are you sure you want to delete?"
    │   │   [Cancel] [Delete Anyway]
    │   │
    │   └── No → Show simple confirmation
    │       "Are you sure you want to delete 'Metro Cities'?"
    │       [Cancel] [Delete]
    │
    ├── Click [Delete]
    │   │
    │   ├── API Call: POST /api/admin/expense/location-groups/delete
    │   │
    │   └── Response
    │       ├── Success → Toast "Deleted", Refresh list
    │       └── Error → Show error message
    │
    └── Click [Cancel] → Close dialog
```

### Flow 5: View Location Group
```
Click View (👁) icon OR Click on Group Name
    │
    ├── Open View Modal
    │
    ├── API Call: GET /api/admin/expense/location-groups/details
    │   Body: { id: X, include_usage: true }
    │
    ├── Display all details
    │
    ├── Click [View Change History]
    │   │
    │   └── Open Change History Modal/Drawer
    │       API: GET /api/admin/expense/location-groups/history
    │
    ├── Click [Edit] → Close View, Open Edit Modal
    │
    └── Click [Close] → Close modal
```

### Flow 6: Cascading Dropdown (Country → State → City)
```
User selects Country(s)
    │
    ├── Clear State selection
    ├── Clear City selection
    │
    ├── API Call: GET /api/master/states?country_ids=X,Y
    │
    └── Populate State dropdown

User selects State(s)
    │
    ├── Clear City selection
    │
    ├── API Call: GET /api/master/cities?state_ids=X,Y,Z
    │
    └── Populate City dropdown

User selects City(s)
    │
    └── Store selected cities
```

---

## API Integration

### API 1: List Location Groups
```
Endpoint: POST /api/admin/expense/location-groups/list

Request:
{
    "search": "metro",
    "is_active": true,
    "cost_of_living_index": "Very High",
    "page": 1,
    "limit": 10,
    "sort_by": "group_name",
    "sort_order": "ASC"
}

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "group_name": "Metro Cities Tier 1",
            "group_code": "LOC-001",
            "description": "Top metro cities...",
            "cost_of_living_index": "Very High",
            "is_active": true,
            "countries": ["India"],
            "country_count": 1,
            "state_count": 5,
            "city_count": 6,
            "created_at": "2025-01-15T10:30:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 15,
        "total_pages": 2
    }
}
```

### API 2: Get Details
```
Endpoint: POST /api/admin/expense/location-groups/details

Request:
{
    "id": 1,
    "include_usage": true
}

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "group_name": "Metro Cities Tier 1",
        "group_code": "LOC-001",
        "description": "Top metro cities with highest expense limits",
        "cost_of_living_index": "Very High",
        "is_active": true,
        "postal_code_range": "110001-110099, 400001-400099",
        "countries": [
            { "id": 1, "name": "India", "code": "IN" }
        ],
        "states": [
            { "id": 1, "name": "Maharashtra", "country_id": 1 },
            { "id": 2, "name": "Karnataka", "country_id": 1 }
        ],
        "cities": [
            { "id": 1, "name": "Mumbai", "state_id": 1 },
            { "id": 2, "name": "Bangalore", "state_id": 2 }
        ],
        "usage": {
            "policies_count": 3,
            "per_diem_rates_count": 5,
            "category_limits_count": 2
        },
        "created_by_name": "Admin User",
        "created_at": "2025-01-15T10:30:00Z",
        "updated_by_name": "Finance Manager",
        "updated_at": "2025-01-18T14:15:00Z"
    }
}
```

### API 3: Create
```
Endpoint: POST /api/admin/expense/location-groups/create

Request:
{
    "group_name": "Metro Cities Tier 1",
    "group_code": "LOC-001",
    "description": "Top metro cities...",
    "country_ids": [1],
    "state_ids": [1, 2, 3, 4, 5],
    "city_ids": [1, 2, 3, 4, 5, 6],
    "postal_code_range": "110001-110099",
    "cost_of_living_index": "Very High",
    "is_active": true
}

Response (Success):
{
    "success": true,
    "message": "Location group created successfully",
    "data": { "id": 1, "group_code": "LOC-001" }
}

Response (Error):
{
    "success": false,
    "message": "Location group with code 'LOC-001' already exists"
}
```

### API 4: Update
```
Endpoint: POST /api/admin/expense/location-groups/update

Request:
{
    "id": 1,
    "group_name": "Metro Cities Tier 1 Updated",
    "description": "Updated description...",
    "country_ids": [1],
    "state_ids": [1, 2, 3, 4, 5, 6],
    "city_ids": [1, 2, 3, 4, 5, 6, 7],
    "postal_code_range": "110001-110099, 400001-400099",
    "cost_of_living_index": "Very High",
    "is_active": true
}

Response:
{
    "success": true,
    "message": "Location group updated successfully"
}
```

### API 5: Delete
```
Endpoint: POST /api/admin/expense/location-groups/delete

Request:
{
    "id": 1
}

Response (Success):
{
    "success": true,
    "message": "Location group deleted successfully"
}

Response (Error - In Use):
{
    "success": false,
    "message": "Cannot delete. Location group is used in 3 expense policies.",
    "usage": {
        "policies": ["Sales Travel Policy", "IT Team Policy"],
        "per_diem_rates": 5
    }
}
```

### API 6: Check Usage
```
Endpoint: POST /api/admin/expense/location-groups/check-usage

Request:
{
    "id": 1
}

Response:
{
    "success": true,
    "data": {
        "is_in_use": true,
        "usage": {
            "policies_count": 3,
            "policies": ["Sales Travel Policy", "IT Team Policy", "HR Policy"],
            "per_diem_rates_count": 5,
            "category_limits_count": 2
        }
    }
}
```

### API 7: Get Change History
```
Endpoint: POST /api/admin/expense/location-groups/history

Request:
{
    "id": 1,
    "page": 1,
    "limit": 20
}

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "action": "Updated",
            "field_changed": "description",
            "old_value": "Old description",
            "new_value": "New description",
            "changed_by_name": "Admin User",
            "changed_at": "2025-01-18T14:15:00Z"
        },
        {
            "id": 2,
            "action": "Created",
            "changed_by_name": "Admin User",
            "changed_at": "2025-01-15T10:30:00Z"
        }
    ]
}
```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Group Name | Required | "Group name is required" |
| Group Name | Max 100 chars | "Maximum 100 characters allowed" |
| Group Code | Required | "Group code is required" |
| Group Code | Format LOC-XXX | "Invalid format. Use LOC-XXX" |
| Group Code | Unique | "Group code already exists" |
| Description | Max 500 chars | "Maximum 500 characters allowed" |
| Country | Min 1 selection | "Select at least one country" |
| State | Min 1 selection | "Select at least one state" |
| City | Min 1 selection | "Select at least one city" |
| Postal Range | Valid format | "Invalid format. Use range (100001-100099) or comma-separated" |
| COL Index | Required | "Select cost of living index" |

---

## Empty & Loading States

### Empty State (No Data)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     📍 No Location Groups                       │
│                                                                 │
│     Location groups help you apply location-based               │
│     expense limits and per diem rates.                          │
│                                                                 │
│                  [+ Create First Location Group]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Empty State (No Search Results)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     🔍 No Results Found                         │
│                                                                 │
│     No location groups match your search criteria.              │
│                                                                 │
│                      [Clear Filters]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Loading States
| Component | Loading State |
|-----------|---------------|
| List Page | Table skeleton (5 rows) |
| Modal Open | Content spinner |
| Dropdown Load | Inline spinner + "Loading..." |
| Form Submit | Button disabled + spinner + "Saving..." |
| Delete | Button spinner + "Deleting..." |

---

## Error Handling

| Error | UI Behavior |
|-------|-------------|
| Network Error | Toast: "Unable to connect. Please try again." + Retry button |
| 400 Bad Request | Show validation errors from API |
| 401 Unauthorized | Redirect to login |
| 403 Forbidden | Toast: "You don't have permission to perform this action" |
| 404 Not Found | Toast: "Location group not found" |
| 409 Conflict (Duplicate) | Inline error under Group Code field |
| 500 Server Error | Toast: "Something went wrong. Please try again later." |

---

## Permissions

| Permission Code | Description | UI Impact |
|-----------------|-------------|-----------|
| `expense.location_groups.view` | View location groups | Can see list & details |
| `expense.location_groups.create` | Create location group | Show [+ Add New] button |
| `expense.location_groups.edit` | Edit location group | Show Edit action |
| `expense.location_groups.delete` | Delete location group | Show Delete action |

---

## File Structure

```
src/
├── pages/
│   └── admin/
│       └── expense/
│           └── settings/
│               └── locationGroups/
│                   ├── index.jsx                # List page
│                   ├── AddEditModal.jsx         # Add/Edit modal
│                   ├── ViewModal.jsx            # View details modal
│                   ├── ChangeHistoryDrawer.jsx  # Change history
│                   └── styles.scss
├── services/
│   └── expense/
│       └── locationGroup.service.js             # API calls
└── constants/
    └── expense/
        └── locationGroup.constants.js           # COL options, etc.
```

---

## Summary

| Item | Count |
|------|-------|
| Screens | 1 List + 3 Modals |
| Form Fields | 9 |
| API Endpoints | 7 |
| Table Columns | 7 |
| Filters | 3 |
