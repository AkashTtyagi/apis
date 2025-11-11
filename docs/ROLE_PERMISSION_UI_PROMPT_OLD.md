# Role & Permission Management UI - Complete Implementation Guide

## Overview
This document provides complete specifications for building the Role & Permission Management UI with integration to existing backend APIs. The backend APIs are already implemented for managing applications, menus, roles, permissions, and user access control with a multi-level permission system.

---

## Backend API Configuration

**Base URL:** `http://localhost:3000/api`
**Authentication:** Bearer Token in `Authorization` header
**Organization Context:** `company_id` in request body (automatically extracted from JWT token where applicable)
**Request Format:** All POST requests with JSON body

---

## Permission System Architecture

### Permission Hierarchy
1. **Package Level**: Company's package determines which modules are accessible
2. **Role Level**: User inherits permissions from assigned roles
3. **User Override Level**:
   - `grant` type adds extra permissions
   - `revoke` type removes permissions

### Permission Formula
```
Final User Permissions = (Role Permissions + User Grant Permissions) - User Revoke Permissions
```

---

## Module 1: Permission Master Management

### 1.1 Permission List/Dashboard

**Route:** `/admin/permissions`

**API Endpoint:**
```
POST /api/role-permission/permissions/get-all
Body:
{
  "is_active": true  // optional
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "permission_code": "VIEW",
      "permission_name": "View",
      "permission_description": "Can view the screen/data",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "permission_code": "ADD",
      "permission_name": "Add",
      "permission_description": "Can add new records",
      "display_order": 2,
      "is_active": true
    }
  ],
  "count": 8
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Permission Master                 [+ Create Permission] │
└────────────────────────────────────────────────────────┘

Search & Filters:
┌────────────────────────────────────────────────────────┐
│ 🔍 [Search permissions...]                              │
│ Status: [All ▼] [Active ✓] [Inactive]                 │
└────────────────────────────────────────────────────────┘

Permissions Table:
┌─────────────────────────────────────────────────────────────┐
│ Code        Name      Description              Order  Active │
├─────────────────────────────────────────────────────────────┤
│ VIEW        View      Can view the screen/data   1     ✓   │ [⚙]
│ ADD         Add       Can add new records        2     ✓   │ [⚙]
│ EDIT        Edit      Can edit existing records  3     ✓   │ [⚙]
│ DELETE      Delete    Can delete records         4     ✓   │ [⚙]
│ EXPORT      Export    Can export data            5     ✓   │ [⚙]
│ APPROVE     Approve   Can approve requests       6     ✓   │ [⚙]
│ REJECT      Reject    Can reject requests        7     ✓   │ [⚙]
│ PRINT       Print     Can print records          8     ✓   │ [⚙]
└─────────────────────────────────────────────────────────────┘

[⚙] Actions Dropdown:
  • Edit Permission
  • Activate/Deactivate
```

**Default Permissions:**
1. VIEW - Can view the screen/data
2. ADD - Can add new records
3. EDIT - Can edit existing records
4. DELETE - Can delete records
5. EXPORT - Can export data
6. APPROVE - Can approve requests/records
7. REJECT - Can reject requests/records
8. PRINT - Can print records

---

### 1.2 Create Permission Modal

**API Endpoint:**
```
POST /api/role-permission/permissions/create
Body:
{
  "permission_code": "CUSTOM_PERMISSION",
  "permission_name": "Custom Permission",
  "permission_description": "Custom permission description",
  "display_order": 10
}

Response:
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "id": 9,
    "permission_code": "CUSTOM_PERMISSION",
    "permission_name": "Custom Permission",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create Permission                       [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Permission Code *                               │
│  ┌──────────────────────────────────────────┐  │
│  │ CUSTOM_PERMISSION                        │  │
│  └──────────────────────────────────────────┘  │
│  Uppercase, alphanumeric, underscores only      │
│                                                  │
│  Permission Name *                               │
│  ┌──────────────────────────────────────────┐  │
│  │ Custom Permission                        │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Custom permission description            │  │
│  │                                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Display Order *                                 │
│  ┌──────────┐                                   │
│  │    10    │                                    │
│  └──────────┘                                   │
│                                                  │
│  Status                                          │
│  ☑ Active                                       │
│                                                  │
├─────────────────────────────────────────────────┤
│                [Cancel]  [Create Permission]    │
└─────────────────────────────────────────────────┘
```

**Validations:**
- Permission Code: Required, uppercase alphanumeric with underscores, unique
- Permission Name: Required, min 2 chars, max 100 chars
- Display Order: Required, number >= 0

---

### 1.3 Update Permission

**API Endpoint:**
```
POST /api/role-permission/permissions/update
Body:
{
  "id": 1,
  "permission_name": "Updated Name",
  "permission_description": "Updated description",
  "display_order": 5,
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Permission updated successfully",
  "data": { ... }
}
```

**UI:** Same modal as Create, but pre-filled with existing data. Permission Code is read-only.

---

## Module 2: Role Master Management (Global Templates)

### 2.1 Role Master List

**Route:** `/admin/role-masters`

**API Endpoint:**
```
POST /api/role-permission/roles/masters/get-all
Body:
{
  "is_active": true  // optional
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "application_id": 1,
      "role_code": "HR_MANAGER",
      "role_name": "HR Manager",
      "role_description": "Human Resource Manager",
      "display_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Role Master (Global Templates)      [+ Create Role]   │
└────────────────────────────────────────────────────────┘

Search & Filters:
┌────────────────────────────────────────────────────────┐
│ 🔍 [Search roles...]                                    │
│ Application: [All ▼]  Status: [All ▼] [Active ✓]     │
└────────────────────────────────────────────────────────┘

Role Master Cards:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 👤 HR Manager    │  │ 💼 Manager       │  │ 👨‍💻 Employee       │
│ ─────────────────│  │ ─────────────────│  │ ─────────────────│
│ Code: HR_MANAGER │  │ Code: MANAGER    │  │ Code: EMPLOYEE   │
│ App: Admin       │  │ App: ESS         │  │ App: ESS         │
│ Order: 1         │  │ Order: 2         │  │ Order: 3         │
│                  │  │                  │  │                  │
│ [Active ✓]       │  │ [Active ✓]       │  │ [Active ✓]       │
│                  │  │                  │  │                  │
│ [Edit]           │  │ [Edit]           │  │ [Edit]           │
│ [Permissions]    │  │ [Permissions]    │  │ [Permissions]    │
│ [Clone]          │  │ [Clone]          │  │ [Clone]          │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### 2.2 Create Role Master

**API Endpoint:**
```
POST /api/role-permission/roles/masters/create
Body:
{
  "application_id": 1,
  "role_code": "HR_MANAGER",
  "role_name": "HR Manager",
  "role_description": "Human Resource Manager",
  "display_order": 1
}

Response:
{
  "success": true,
  "message": "Role master created successfully",
  "data": {
    "id": 1,
    "role_code": "HR_MANAGER",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create Role Master                      [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Application *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Admin ▼]                                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Role Code *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ HR_MANAGER                               │  │
│  └──────────────────────────────────────────┘  │
│  Uppercase, alphanumeric, underscores only      │
│                                                  │
│  Role Name *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ HR Manager                               │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Human Resource Manager role              │  │
│  │                                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Display Order *                                 │
│  ┌──────────┐                                   │
│  │    1     │                                    │
│  └──────────┘                                   │
│                                                  │
│  Status                                          │
│  ☑ Active                                       │
│                                                  │
├─────────────────────────────────────────────────┤
│            [Cancel]  [Create & Set Permissions] │
└─────────────────────────────────────────────────┘
```

---

### 2.3 Assign Permissions to Role Master

**Get Application Menus:**
```
POST /api/role-permission/menus/get-by-application
Body:
{
  "application_id": 1,
  "is_active": true
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "application_id": 1,
      "module_id": 1,
      "parent_menu_id": null,
      "menu_code": "EMPLOYEE_MANAGEMENT",
      "menu_name": "Employee Management",
      "menu_type": "container",
      "menu_icon": "users",
      "display_order": 1,
      "children": [
        {
          "id": 2,
          "menu_code": "EMPLOYEE_LIST",
          "menu_name": "Employee List",
          "menu_type": "screen",
          "route_path": "/employees",
          "display_order": 1
        }
      ]
    }
  ]
}
```

**Assign Permissions API:**
```
POST /api/role-permission/roles/assign-permissions
Body:
{
  "role_id": 10,
  "permissions": [
    {
      "menu_id": 5,
      "permission_id": 1,
      "is_granted": true
    },
    {
      "menu_id": 5,
      "permission_id": 2,
      "is_granted": true
    }
  ]
}

Response:
{
  "success": true,
  "message": "Permissions assigned successfully",
  "count": 2
}
```

**Modal Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Role Permissions: HR Manager                           [✕]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Application: Admin                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📂 Employee Management (Container)                      │  │
│  │   ├─ 📄 Employee List (Screen)                          │  │
│  │   │   ☑ View  ☑ Add  ☑ Edit  ☐ Delete  ☑ Export       │  │
│  │   │                                                      │  │
│  │   ├─ 📄 Employee Details (Screen)                       │  │
│  │   │   ☑ View  ☐ Add  ☑ Edit  ☐ Delete  ☐ Export       │  │
│  │   │                                                      │  │
│  │   └─ 📄 Employee Onboarding (Screen)                    │  │
│  │       ☑ View  ☑ Add  ☑ Edit  ☐ Delete  ☐ Export       │  │
│  │                                                      │  │
│  │ 📂 Attendance Management (Container)                    │  │
│  │   ├─ 📄 Attendance Report (Screen)                      │  │
│  │   │   ☑ View  ☐ Add  ☐ Edit  ☐ Delete  ☑ Export       │  │
│  │   │   ☑ Approve  ☑ Reject                              │  │
│  │   │                                                      │  │
│  │   └─ 📄 Leave Requests (Screen)                         │  │
│  │       ☑ View  ☐ Add  ☐ Edit  ☐ Delete  ☐ Export       │  │
│  │       ☑ Approve  ☑ Reject                              │  │
│  │                                                          │  │
│  │ 📂 Payroll (Container)                                   │  │
│  │   ├─ 📄 Salary Processing (Screen)                      │  │
│  │   │   ☑ View  ☑ Add  ☑ Edit  ☐ Delete  ☑ Export       │  │
│  │   │   ☑ Approve  ☐ Reject  ☑ Print                     │  │
│  │   │                                                      │  │
│  │   └─ 📄 Payslips (Screen)                               │  │
│  │       ☑ View  ☐ Add  ☐ Edit  ☐ Delete  ☑ Export       │  │
│  │       ☐ Approve  ☐ Reject  ☑ Print                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Bulk Actions:                                                  │
│  [Select All Screens] [Deselect All] [Grant All VIEW]         │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                      [Cancel]  [Save Permissions]              │
└────────────────────────────────────────────────────────────────┘
```

**UI Interactions:**
- Container menus are collapsible/expandable
- Only screen-type menus can have permissions assigned
- Checkboxes for each permission type (VIEW, ADD, EDIT, DELETE, etc.)
- Bulk actions for faster configuration

---

## Module 3: Company Role Management

### 3.1 Company Roles List

**Route:** `/admin/roles`

**API Endpoint:**
```
POST /api/role-permission/roles/get-company-roles
Body:
{
  "company_id": 100,
  "application_id": 1,
  "is_active": true
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 10,
      "company_id": 100,
      "application_id": 1,
      "role_master_id": 1,
      "role_code": "HR_MANAGER",
      "role_name": "HR Manager",
      "role_description": "Company HR Manager",
      "is_system_role": false,
      "is_active": true,
      "roleMaster": {
        "id": 1,
        "role_name": "HR Manager"
      },
      "permissions": [
        {
          "menu_id": 5,
          "permission_id": 1,
          "is_granted": true
        }
      ]
    }
  ],
  "count": 1
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Company Roles                                           │
│                [Create from Master ▼] [Create Custom]  │
└────────────────────────────────────────────────────────┘

Search & Filters:
┌────────────────────────────────────────────────────────┐
│ 🔍 [Search roles...]                                    │
│ Application: [All ▼]  Type: [All ▼]  Status: [All ▼] │
└────────────────────────────────────────────────────────┘

Roles Table:
┌─────────────────────────────────────────────────────────────────┐
│ Role Name      Code         App    Type      Users  Active  │
├─────────────────────────────────────────────────────────────────┤
│ HR Manager     HR_MANAGER   Admin  Template   5      ✓      │ [⚙]
│ Manager        MANAGER      ESS    Template   12     ✓      │ [⚙]
│ Employee       EMPLOYEE     ESS    Template   50     ✓      │ [⚙]
│ Custom Admin   CUST_ADMIN   Admin  Custom     2      ✓      │ [⚙]
└─────────────────────────────────────────────────────────────────┘

[⚙] Actions Dropdown:
  • View Details
  • Edit Role
  • Manage Permissions
  • Assign to Users
  • Clone Role
  • Activate/Deactivate
  • Delete (if no users assigned)
```

**Type Indicators:**
- Template: Created from role master
- Custom: Directly created (role_master_id is null)
- System: System role (cannot be deleted)

---

### 3.2 Create Role from Master

**Get Role Masters:**
```
POST /api/role-permission/roles/masters/get-all
Body:
{
  "is_active": true
}
// Returns list of available role masters
```

**Create from Master API:**
```
POST /api/role-permission/roles/create-from-master
Body:
{
  "company_id": 100,
  "application_id": 1,
  "role_master_id": 1
}

Response:
{
  "success": true,
  "message": "Role created from master successfully",
  "data": {
    "id": 10,
    "role_code": "HR_MANAGER",
    "role_name": "HR Manager",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create Role from Master                 [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Select Role Master *                            │
│  ┌──────────────────────────────────────────┐  │
│  │ [HR Manager ▼]                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Preview:                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ Role Code: HR_MANAGER                    │  │
│  │ Role Name: HR Manager                    │  │
│  │ Application: Admin                       │  │
│  │ Description: Human Resource Manager      │  │
│  │                                           │  │
│  │ This will copy all permissions from      │  │
│  │ the master role to your company.         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ℹ️ Note: You can modify permissions after     │
│    creating the role.                           │
│                                                  │
├─────────────────────────────────────────────────┤
│                    [Cancel]  [Create Role]      │
└─────────────────────────────────────────────────┘
```

**After Creation:** Automatically inherit all permissions from role master.

---

### 3.3 Create Custom Role

**API Endpoint:**
```
POST /api/role-permission/roles/create-custom
Body:
{
  "company_id": 100,
  "application_id": 1,
  "role_code": "CUSTOM_ROLE",
  "role_name": "Custom Role",
  "role_description": "Custom company role",
  "is_system_role": false
}

Response:
{
  "success": true,
  "message": "Custom role created successfully",
  "data": {
    "id": 11,
    "role_code": "CUSTOM_ROLE",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create Custom Role                      [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Application *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Admin ▼]                                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Role Code *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ CUSTOM_ROLE                              │  │
│  └──────────────────────────────────────────┘  │
│  Uppercase, alphanumeric, underscores only      │
│                                                  │
│  Role Name *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Custom Role                              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Custom company role                      │  │
│  │                                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ☐ System Role                                  │
│     (Cannot be deleted)                         │
│                                                  │
│  Status                                          │
│  ☑ Active                                       │
│                                                  │
├─────────────────────────────────────────────────┤
│           [Cancel]  [Create & Set Permissions]  │
└─────────────────────────────────────────────────┘
```

---

## Module 4: Menu Management

### 4.1 Menu Hierarchy View

**Route:** `/admin/menus`

**API Endpoint:**
```
POST /api/role-permission/menus/get-by-application
Body:
{
  "application_id": 1,
  "module_id": 1,
  "is_active": true
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "application_id": 1,
      "module_id": 1,
      "parent_menu_id": null,
      "menu_code": "EMPLOYEE_MANAGEMENT",
      "menu_name": "Employee Management",
      "menu_type": "container",
      "menu_icon": "users",
      "route_path": null,
      "component_path": null,
      "display_order": 1,
      "is_active": true,
      "module": {
        "id": 1,
        "module_code": "EMPLOYEE",
        "module_name": "Employee Module"
      },
      "children": [
        {
          "id": 2,
          "menu_code": "EMPLOYEE_LIST",
          "menu_name": "Employee List",
          "menu_type": "screen",
          "route_path": "/employees",
          "component_path": "/pages/employees/EmployeeList.jsx",
          "display_order": 1,
          "is_active": true,
          "children": []
        }
      ]
    }
  ]
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Menu Management                        [+ Create Menu] │
└────────────────────────────────────────────────────────┘

Filters:
┌────────────────────────────────────────────────────────┐
│ Application: [Admin ▼]  Module: [All ▼]               │
│ Status: [All ▼] [Active ✓] [Inactive]                 │
└────────────────────────────────────────────────────────┘

Menu Tree (Hierarchical):
┌────────────────────────────────────────────────────────┐
│ 📂 Employee Management (Container)              [⚙]   │
│   ├─ 📄 Employee List (Screen)                  [⚙]   │
│   │   Route: /employees                                │
│   │   Component: /pages/employees/EmployeeList.jsx     │
│   │                                                     │
│   ├─ 📄 Employee Details (Screen)               [⚙]   │
│   │   Route: /employees/:id                            │
│   │   Component: /pages/employees/EmployeeDetails.jsx  │
│   │                                                     │
│   └─ 📄 Employee Onboarding (Screen)            [⚙]   │
│       Route: /employees/onboard                        │
│       Component: /pages/employees/Onboarding.jsx       │
│                                                         │
│ 📂 Attendance Management (Container)            [⚙]   │
│   ├─ 📄 Attendance Dashboard (Screen)           [⚙]   │
│   │   Route: /attendance                               │
│   │                                                     │
│   └─ 📄 Leave Requests (Screen)                 [⚙]   │
│       Route: /leave-requests                           │
│                                                         │
│ 📂 Payroll (Container)                          [⚙]   │
│   ├─ 📄 Salary Processing (Screen)              [⚙]   │
│   └─ 📄 Payslips (Screen)                       [⚙]   │
└────────────────────────────────────────────────────────┘

[⚙] Actions Dropdown:
  • Edit Menu
  • Add Submenu
  • Delete Menu
  • Activate/Deactivate
```

**Menu Types:**
- Container: Navigation grouping (no route, can have children)
- Screen: Actual page with route (can have permissions)

---

### 4.2 Create Menu

**API Endpoint:**
```
POST /api/role-permission/menus/create
Body:
{
  "application_id": 1,
  "module_id": 1,
  "parent_menu_id": null,
  "menu_code": "EMPLOYEE_LIST",
  "menu_name": "Employee List",
  "menu_type": "screen",
  "menu_icon": "list",
  "route_path": "/employees",
  "component_path": "/pages/employees/EmployeeList.jsx",
  "menu_description": "List all employees",
  "display_order": 1
}

Response:
{
  "success": true,
  "message": "Menu created successfully",
  "data": {
    "id": 2,
    "menu_code": "EMPLOYEE_LIST",
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Create Menu                             [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Application *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Admin ▼]                                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Module *                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ [Employee Module ▼]                      │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Parent Menu (Optional)                          │
│  ┌──────────────────────────────────────────┐  │
│  │ [Employee Management ▼]                  │  │
│  └──────────────────────────────────────────┘  │
│  Leave empty for top-level menu                 │
│                                                  │
│  Menu Type *                                     │
│  ○ Container  ● Screen                          │
│                                                  │
│  Menu Code *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ EMPLOYEE_LIST                            │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Menu Name *                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ Employee List                            │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Menu Icon                                       │
│  ┌──────────────────────────────────────────┐  │
│  │ list                                     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [Only shown if type = screen]                  │
│  Route Path *                                    │
│  ┌──────────────────────────────────────────┐  │
│  │ /employees                               │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Component Path                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ /pages/employees/EmployeeList.jsx        │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Description                                     │
│  ┌──────────────────────────────────────────┐  │
│  │ List all employees                       │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Display Order *                                 │
│  ┌──────────┐                                   │
│  │    1     │                                    │
│  └──────────┘                                   │
│                                                  │
│  ☑ Active                                       │
│                                                  │
├─────────────────────────────────────────────────┤
│                    [Cancel]  [Create Menu]      │
└─────────────────────────────────────────────────┘
```

---

## Module 5: User Role Assignment

### 5.1 User Roles Management

**Route:** `/admin/user-roles`

**API Endpoint:**
```
POST /api/role-permission/permissions/users/get-roles
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 500,
      "role_id": 10,
      "application_id": 1,
      "is_active": true,
      "assigned_by": 1,
      "assigned_at": "2025-01-01T00:00:00.000Z",
      "role": {
        "id": 10,
        "role_code": "HR_MANAGER",
        "role_name": "HR Manager",
        "application_id": 1
      }
    }
  ],
  "count": 1
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ User Roles Management                                   │
└────────────────────────────────────────────────────────┘

User Selection:
┌────────────────────────────────────────────────────────┐
│ Select Employee:                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ [Search employees...] 🔍                         │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ Selected: John Doe (john@company.com)                  │
│ Employee Code: EMP001                                   │
└────────────────────────────────────────────────────────┘

Current Roles:
┌────────────────────────────────────────────────────────┐
│ Application    Role Name      Assigned By    Date      │
├────────────────────────────────────────────────────────┤
│ Admin          HR Manager     Admin          Jan 1    │ [Revoke]
│ ESS            Employee       Admin          Jan 1    │ [Revoke]
└────────────────────────────────────────────────────────┘

[+ Assign New Role]

Permission Overrides (Grant/Revoke):
┌────────────────────────────────────────────────────────┐
│ Screen              Permission    Type      Date       │
├────────────────────────────────────────────────────────┤
│ Employee List       DELETE        Grant     Jan 15    │ [Remove]
│ Salary Processing   EDIT          Revoke    Jan 10    │ [Remove]
└────────────────────────────────────────────────────────┘

[+ Add Permission Override]
```

---

### 5.2 Assign Role to User

**API Endpoint:**
```
POST /api/role-permission/permissions/users/assign-role
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1,
  "role_id": 10
}

Response:
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": {
    "id": 1,
    "user_id": 500,
    "role_id": 10,
    ...
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Assign Role to User                     [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  User: John Doe (john@company.com)              │
│  Employee Code: EMP001                           │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  Application *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Admin ▼]                                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Role *                                          │
│  ┌──────────────────────────────────────────┐  │
│  │ [HR Manager ▼]                           │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Role Details:                                   │
│  • Role Code: HR_MANAGER                        │
│  • Description: Human Resource Manager          │
│  • Permissions: 45 granted                      │
│                                                  │
│  ℹ️ This user will inherit all permissions     │
│    from this role. You can add overrides later. │
│                                                  │
├─────────────────────────────────────────────────┤
│                    [Cancel]  [Assign Role]      │
└─────────────────────────────────────────────────┘
```

---

### 5.3 User Permission Overrides

**Grant Permission API:**
```
POST /api/role-permission/permissions/users/grant-permission
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1,
  "menu_id": 5,
  "permission_id": 4
}

Response:
{
  "success": true,
  "message": "Permission granted to user successfully",
  "data": {
    "id": 1,
    "permission_type": "grant",
    ...
  }
}
```

**Revoke Permission API:**
```
POST /api/role-permission/permissions/users/revoke-permission
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1,
  "menu_id": 5,
  "permission_id": 1
}

Response:
{
  "success": true,
  "message": "Permission revoked from user successfully"
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────────┐
│  Add Permission Override                 [✕]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  User: John Doe (john@company.com)              │
│                                                  │
│  Override Type *                                 │
│  ○ Grant (Add extra permission)                 │
│  ● Revoke (Remove permission from role)         │
│                                                  │
│  Application *                                   │
│  ┌──────────────────────────────────────────┐  │
│  │ [Admin ▼]                                │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Screen *                                        │
│  ┌──────────────────────────────────────────┐  │
│  │ [Employee List ▼]                        │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Permission *                                    │
│  ┌──────────────────────────────────────────┐  │
│  │ [DELETE ▼]                               │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Current Status:                                 │
│  • User has this permission from role? No       │
│  • Action: Grant DELETE access                  │
│                                                  │
│  ⚠️  Override will take precedence over role    │
│      permissions.                                │
│                                                  │
├─────────────────────────────────────────────────┤
│                [Cancel]  [Add Override]         │
└─────────────────────────────────────────────────┘
```

---

### 5.4 Bulk Permission Operations

**Bulk Grant API:**
```
POST /api/role-permission/permissions/users/bulk-grant
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1,
  "permissions": [
    {
      "menu_id": 5,
      "permission_id": 1
    },
    {
      "menu_id": 6,
      "permission_id": 2
    }
  ]
}

Response:
{
  "success": true,
  "message": "Bulk permissions granted successfully",
  "count": 2
}
```

**UI:** Multi-select interface for granting/revoking multiple permissions at once.

---

## Module 6: User Menu Access (Frontend)

### 6.1 Get User Navigation Menu

**Route:** Used by frontend to build navigation

**API Endpoint:**
```
POST /api/role-permission/menus/get-user-menus
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "menu_code": "EMPLOYEE_MANAGEMENT",
      "menu_name": "Employee Management",
      "menu_type": "container",
      "menu_icon": "users",
      "route_path": null,
      "display_order": 1,
      "permissions": [],
      "has_access": true,
      "children": [
        {
          "id": 2,
          "menu_code": "EMPLOYEE_LIST",
          "menu_name": "Employee List",
          "menu_type": "screen",
          "route_path": "/employees",
          "menu_icon": "list",
          "display_order": 1,
          "permissions": ["VIEW", "ADD", "EDIT"],
          "has_access": true,
          "children": []
        },
        {
          "id": 3,
          "menu_code": "EMPLOYEE_DETAILS",
          "menu_name": "Employee Details",
          "menu_type": "screen",
          "route_path": "/employees/:id",
          "permissions": ["VIEW", "EDIT"],
          "has_access": true,
          "children": []
        }
      ]
    }
  ]
}
```

**Frontend Usage:**

```javascript
// Fetch user menus on login
const response = await api.post('/role-permission/menus/get-user-menus', {
  user_id: user.id,
  company_id: user.company_id,
  application_id: 1 // or get from context
});

const menus = response.data.data;

// Build navigation
function buildNavigation(menus) {
  return menus.filter(menu => menu.has_access).map(menu => ({
    label: menu.menu_name,
    icon: menu.menu_icon,
    route: menu.route_path,
    children: buildNavigation(menu.children)
  }));
}

// Check permissions on a screen
function hasPermission(screenCode, permissionCode) {
  const menu = findMenuByCode(menus, screenCode);
  return menu?.permissions.includes(permissionCode);
}

// Use in components
{hasPermission('EMPLOYEE_LIST', 'ADD') && (
  <button>Add Employee</button>
)}

{hasPermission('EMPLOYEE_LIST', 'DELETE') && (
  <button>Delete</button>
)}
```

---

### 6.2 Get Specific Screen Permissions

**API Endpoint:**
```
POST /api/role-permission/menus/get-user-screen-permissions
Body:
{
  "user_id": 500,
  "company_id": 100,
  "application_id": 1,
  "menu_id": 5
}

Response:
{
  "success": true,
  "data": {
    "menu_id": 5,
    "menu_name": "Employee List",
    "menu_type": "screen",
    "route_path": "/employees",
    "permissions": ["VIEW", "ADD", "EDIT", "DELETE", "EXPORT"]
  }
}
```

**Use Case:** Check permissions for a specific screen dynamically.

---

## Module 7: Audit Logs

### 7.1 Permission Change Audit

**Route:** `/admin/audit-logs`

**API Endpoint:**
```
POST /api/role-permission/permissions/users/audit-logs
Body:
{
  "user_id": 500,
  "company_id": 100,
  "action": "assign",
  "entity_type": "user_role",
  "from_date": "2025-01-01",
  "limit": 50
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 100,
      "entity_type": "user_role",
      "entity_id": 1,
      "action": "assign",
      "old_value": null,
      "new_value": {
        "user_id": 500,
        "role_id": 10,
        "role_name": "HR Manager"
      },
      "changed_by": 1,
      "change_description": "Role assigned to user",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-01-01T00:00:00.000Z",
      "changedByUser": {
        "email": "admin@company.com",
        "employee": {
          "first_name": "Admin",
          "last_name": "User"
        }
      }
    }
  ],
  "count": 1
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Permission Audit Logs                                   │
└────────────────────────────────────────────────────────┘

Filters:
┌────────────────────────────────────────────────────────┐
│ User: [All ▼]  Entity: [All ▼]  Action: [All ▼]       │
│ From: [📅 2025-01-01]  To: [📅 2025-01-31]            │
│ [Apply Filters]  [Clear]                               │
└────────────────────────────────────────────────────────┘

Audit Timeline:
┌────────────────────────────────────────────────────────┐
│ 2025-01-15 14:30:00                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ Action: Role Assigned                                  │
│ Entity: User Role (#1)                                 │
│ User: John Doe (john@company.com)                      │
│ Changed By: Admin User (admin@company.com)             │
│ IP: 192.168.1.1                                        │
│                                                         │
│ Changes:                                                │
│ + Assigned role: HR Manager (HR_MANAGER)               │
│                                                         │
│ [View Details]                                          │
│                                                         │
│ 2025-01-15 14:25:00                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ Action: Permission Granted                             │
│ Entity: User Permission (#1)                           │
│ User: John Doe (john@company.com)                      │
│ Changed By: Admin User (admin@company.com)             │
│                                                         │
│ Changes:                                                │
│ + Granted: Employee List > DELETE permission           │
│                                                         │
│ [View Details]                                          │
└────────────────────────────────────────────────────────┘
```

**Entity Types:**
- application
- menu
- role_master
- role
- user_role
- user_permission

**Actions:**
- create
- update
- delete
- assign
- revoke
- grant

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
      "id": 1,
      "company_id": 1,
      "employee_id": 25,
      ...
    }
  }
}
```

**Token contains:**
- `id`: User ID
- `company_id`: Company ID
- `employee_id`: Employee ID

---

## Error Handling

### Error Response Format:
```json
{
  "success": false,
  "error": "Error description"
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
  const response = await api.post('/role-permission/roles/create', data);

  if (response.data.success) {
    toast.success(response.data.message);
  }
} catch (error) {
  if (error.response) {
    const message = error.response.data.error || 'Something went wrong';
    toast.error(message);

    if (error.response.status === 401) {
      router.push('/login');
    } else if (error.response.status === 403) {
      toast.error('You do not have permission');
    }
  } else if (error.request) {
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
/* Status Colors */
--active: #4CAF50;             /* Green */
--inactive: #9E9E9E;           /* Gray */
--granted: #4CAF50;            /* Green */
--revoked: #F44336;            /* Red */

/* Permission Type Colors */
--view: #2196F3;               /* Blue */
--add: #4CAF50;                /* Green */
--edit: #FF9800;               /* Orange */
--delete: #F44336;             /* Red */
--export: #9C27B0;             /* Purple */
--approve: #00BCD4;            /* Cyan */
--reject: #FF5722;             /* Deep Orange */
--print: #607D8B;              /* Blue Gray */

/* UI Colors */
--primary: #1976D2;            /* Blue */
--secondary: #FFA726;          /* Orange */
--success: #4CAF50;            /* Green */
--warning: #FF9800;            /* Amber */
--error: #F44336;              /* Red */
--info: #2196F3;               /* Blue */
```

### Icons:
- Role Icons: 👤 👨‍💼 👨‍💻 🛡️
- Menu Icons: 📂 📄 📋 📊
- Action Icons: ⚙ ✏️ 🗑️ ✓ ✗
- Permission Icons: 👁️ ➕ ✏️ 🗑️ 📥 ✅ ❌ 🖨️

### Toast Notifications:

```javascript
// Success
toast.success("Role assigned successfully");

// Error
toast.error("Failed to assign role");

// Warning
toast.warning("User already has this role");

// Info
toast.info("Loading permissions...");
```

---

## Permission-Based UI Rendering

### Frontend Permission Check:

```javascript
// Store user permissions in context/store after login
const [userPermissions, setUserPermissions] = useState({});

// Load permissions
useEffect(() => {
  async function loadPermissions() {
    const response = await api.post('/role-permission/menus/get-user-menus', {
      user_id: user.id,
      company_id: user.company_id,
      application_id: currentApp.id
    });

    // Build permission map
    const permMap = {};
    function buildMap(menus) {
      menus.forEach(menu => {
        if (menu.menu_type === 'screen') {
          permMap[menu.menu_code] = menu.permissions;
        }
        if (menu.children) {
          buildMap(menu.children);
        }
      });
    }
    buildMap(response.data.data);

    setUserPermissions(permMap);
  }

  loadPermissions();
}, [user, currentApp]);

// Check permission helper
function hasPermission(screenCode, permissionCode) {
  return userPermissions[screenCode]?.includes(permissionCode) || false;
}

// Use in components
{hasPermission('EMPLOYEE_LIST', 'ADD') && (
  <button onClick={handleAdd}>Add Employee</button>
)}

{hasPermission('EMPLOYEE_LIST', 'DELETE') && (
  <button onClick={handleDelete}>Delete</button>
)}

{hasPermission('SALARY_PROCESSING', 'APPROVE') && (
  <button onClick={handleApprove}>Approve Salary</button>
)}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Setup API service layer with axios
- [ ] Configure authentication interceptors
- [ ] Implement error handling
- [ ] Setup routing
- [ ] Create base layout components

### Phase 2: Permission Master
- [ ] Permission list page
- [ ] Create permission modal
- [ ] Edit permission functionality
- [ ] Activate/deactivate permission

### Phase 3: Role Master Management
- [ ] Role master list page
- [ ] Create role master modal
- [ ] Edit role master
- [ ] Assign permissions to role master
- [ ] Clone role master

### Phase 4: Company Role Management
- [ ] Company roles list page
- [ ] Create role from master
- [ ] Create custom role
- [ ] Edit company role
- [ ] Manage role permissions
- [ ] Clone company role

### Phase 5: Menu Management
- [ ] Menu hierarchy view
- [ ] Create menu (container/screen)
- [ ] Edit menu
- [ ] Delete menu with confirmation
- [ ] Drag-and-drop reordering

### Phase 6: User Role Assignment
- [ ] User roles management page
- [ ] Assign role to user
- [ ] Revoke role from user
- [ ] View user's assigned roles

### Phase 7: User Permission Overrides
- [ ] Grant permission to user
- [ ] Revoke permission from user
- [ ] Remove permission override
- [ ] Bulk grant/revoke operations
- [ ] View user permission overrides

### Phase 8: Frontend Integration
- [ ] Fetch user menus on login
- [ ] Build dynamic navigation
- [ ] Permission-based UI rendering
- [ ] Route guards for protected pages
- [ ] Screen-level permission checks

### Phase 9: Audit & Reporting
- [ ] Audit logs page with filters
- [ ] Audit timeline view
- [ ] Export audit logs
- [ ] User permission report
- [ ] Role usage report

### Phase 10: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Form validations
- [ ] Responsive design
- [ ] Accessibility (ARIA labels)
- [ ] Testing

---

## Data Models (TypeScript)

```typescript
interface Permission {
  id: number;
  permission_code: string;
  permission_name: string;
  permission_description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RoleMaster {
  id: number;
  application_id: number;
  role_code: string;
  role_name: string;
  role_description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  company_id: number;
  application_id: number;
  role_master_id: number | null;
  role_code: string;
  role_name: string;
  role_description: string;
  is_system_role: boolean;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  roleMaster?: RoleMaster;
  permissions?: RoleMenuPermission[];
}

interface Menu {
  id: number;
  application_id: number;
  module_id: number;
  parent_menu_id: number | null;
  menu_code: string;
  menu_name: string;
  menu_type: 'container' | 'screen';
  menu_icon: string | null;
  route_path: string | null;
  component_path: string | null;
  menu_description: string | null;
  display_order: number;
  is_active: boolean;
  children?: Menu[];
}

interface RoleMenuPermission {
  id: number;
  role_id: number;
  menu_id: number;
  permission_id: number;
  is_granted: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  menu?: Menu;
  permission?: Permission;
}

interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  application_id: number;
  is_active: boolean;
  assigned_by: number;
  assigned_at: string;
  revoked_by: number | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
}

interface UserMenuPermission {
  id: number;
  user_id: number;
  application_id: number;
  menu_id: number;
  permission_id: number;
  permission_type: 'grant' | 'revoke';
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  menu?: Menu;
  permission?: Permission;
}

interface UserMenu {
  id: number;
  menu_code: string;
  menu_name: string;
  menu_type: 'container' | 'screen';
  menu_icon: string | null;
  route_path: string | null;
  display_order: number;
  permissions: string[]; // Array of permission codes
  has_access: boolean;
  children: UserMenu[];
}

interface AuditLog {
  id: number;
  company_id: number;
  entity_type: 'application' | 'menu' | 'role_master' | 'role' | 'user_role' | 'user_permission';
  entity_id: number;
  action: 'create' | 'update' | 'delete' | 'assign' | 'revoke' | 'grant';
  old_value: any;
  new_value: any;
  changed_by: number;
  change_description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  changedByUser?: User;
}
```

---

## API Quick Reference

### Permission APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/permissions/get-all | Get all permissions |
| POST /api/role-permission/permissions/get-by-id | Get permission by ID |
| POST /api/role-permission/permissions/get-by-code | Get permission by code |
| POST /api/role-permission/permissions/create | Create permission |
| POST /api/role-permission/permissions/update | Update permission |
| POST /api/role-permission/permissions/delete | Delete permission |

### Role Master APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/roles/masters/get-all | Get all role masters |
| POST /api/role-permission/roles/masters/get-by-id | Get role master by ID |
| POST /api/role-permission/roles/masters/create | Create role master |
| POST /api/role-permission/roles/masters/update | Update role master |
| POST /api/role-permission/roles/masters/delete | Delete role master |

### Company Role APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/roles/get-company-roles | Get company roles |
| POST /api/role-permission/roles/get-by-id | Get role by ID |
| POST /api/role-permission/roles/create-from-master | Create role from master |
| POST /api/role-permission/roles/create-custom | Create custom role |
| POST /api/role-permission/roles/update | Update role |
| POST /api/role-permission/roles/delete | Delete role |
| POST /api/role-permission/roles/assign-permissions | Assign permissions to role |
| POST /api/role-permission/roles/revoke-permissions | Revoke permissions from role |
| POST /api/role-permission/roles/get-permissions | Get role permissions |

### Menu APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/menus/get-by-application | Get menus by application |
| POST /api/role-permission/menus/get-by-id | Get menu by ID |
| POST /api/role-permission/menus/create | Create menu |
| POST /api/role-permission/menus/update | Update menu |
| POST /api/role-permission/menus/delete | Delete menu |
| POST /api/role-permission/menus/get-user-menus | Get user menus with permissions |
| POST /api/role-permission/menus/get-user-screen-permissions | Get user screen permissions |

### User Role APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/permissions/users/assign-role | Assign role to user |
| POST /api/role-permission/permissions/users/revoke-role | Revoke role from user |
| POST /api/role-permission/permissions/users/get-roles | Get user roles |

### User Permission Override APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/permissions/users/grant-permission | Grant permission to user |
| POST /api/role-permission/permissions/users/revoke-permission | Revoke permission from user |
| POST /api/role-permission/permissions/users/remove-override | Remove permission override |
| POST /api/role-permission/permissions/users/get-overrides | Get user permission overrides |
| POST /api/role-permission/permissions/users/bulk-grant | Bulk grant permissions |
| POST /api/role-permission/permissions/users/bulk-revoke | Bulk revoke permissions |

### Audit APIs
| Endpoint | Description |
|----------|-------------|
| POST /api/role-permission/permissions/users/audit-logs | Get audit logs |

---

## Testing with Postman

All APIs can be tested using Postman.

Make sure to:
1. Set environment variable `base_url` to `http://localhost:3000/api`
2. After login, `access_token` will be automatically set
3. Test all endpoints before starting UI development
4. Verify permission logic with different role combinations

---

## Advanced Features

### 1. Role Cloning
Clone existing roles with all permissions for quick setup.

### 2. Permission Templates
Save common permission sets as templates for quick assignment.

### 3. Bulk User Assignment
Assign roles to multiple users at once (CSV import).

### 4. Permission Preview
Preview user's final permissions before saving.

### 5. Role Comparison
Compare permissions between two roles side-by-side.

### 6. Permission Impact Analysis
Show how many users will be affected by permission changes.

---

## Support & Questions

If you encounter any issues with the APIs:
1. Check backend logs for detailed error messages
2. Verify JWT token is valid and not expired
3. Ensure `company_id` is being extracted correctly from token
4. Verify user has proper roles and permissions to perform actions
5. Check audit logs for permission changes

---

**Good luck with the implementation! 🚀**
