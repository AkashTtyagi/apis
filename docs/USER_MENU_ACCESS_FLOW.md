# User Menu Access Flow - Updated Architecture

## Overview
User menu access is now controlled by **Package-based Module Access** + **Module-Menu Mapping** + **Role Permissions**.

---

## Complete Access Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Login                                │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: Get Company's Accessible Modules                   │
│  ┌────────────────┐       ┌────────────────┐                │
│  │ Base Package   │   +   │ Addon Modules  │                │
│  │ (3 modules)    │       │ (2 modules)    │                │
│  └────────────────┘       └────────────────┘                │
│  Result: [COREHR, ATTENDANCE, LEAVE, PAYROLL, RECRUITMENT]  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Get Menus Mapped to These Modules                  │
│  Query hrms_module_menus junction table                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ COREHR   │───>│ Menu 101 │    │ Menu 105 │              │
│  │          │    │ Menu 102 │    │ ...      │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│  ┌──────────┐    ┌──────────┐                               │
│  │ PAYROLL  │───>│ Menu 201 │                               │
│  │          │    │ Menu 202 │                               │
│  └──────────┘    └──────────┘                               │
│  Result: Menu IDs [101, 102, 105, 201, 202, ...]           │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Filter by Application                              │
│  Get only menus for requested application (ESS/ADMIN)       │
│  Result: Menu objects for ESS application                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 4: Get User's Roles (including Super Admin)           │
│  Query hrms_user_roles with role permissions                │
│  Result: User roles with menu permissions                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 5: Get User-Specific Permission Overrides             │
│  Query hrms_user_menu_permissions                           │
│  Result: Grant/Revoke overrides                             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 6: Build Permission Map                               │
│  Combine role permissions + user overrides                  │
│  Super Admin → ALL permissions                              │
│  Result: {menu_id: [VIEW, CREATE, UPDATE, ...]}            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 7: Attach Permissions to Menus                        │
│  Add permission arrays to each menu object                  │
│  Result: Menus with permissions attached                    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 8: Filter & Build Tree                                │
│  Remove menus without access                                │
│  Build hierarchical menu tree                               │
│  Result: Final menu tree for user                           │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Return Menus   │
                   └─────────────────┘
```

---

## Key Changes

### ✅ What Changed:
1. **Removed `module_id` from `hrms_menus`** - Menus are now independent
2. **Created `hrms_module_menus` junction table** - Many-to-many mapping
3. **Updated menu access queries** - Now check module-menu mappings first
4. **Support for addon modules** - Combines base package + addons

### ❌ What Did NOT Change:
- Role-based permissions (still work the same)
- Menu hierarchy (parent-child relationships)
- Super admin logic (still gets all permissions)
- Permission types (VIEW, CREATE, UPDATE, DELETE, etc.)

---

## Code Examples

### Example 1: User with Base Package Only
```javascript
// Company 23 has Base Package: "Startup Plan"
// Modules: [COREHR, ATTENDANCE, LEAVE]

await getUserMenus(userId: 42, companyId: 23, applicationId: 1);

// Result:
[
  {
    menu_code: "EMP_DASHBOARD",
    menu_name: "Employee Dashboard",
    modules: [{module_code: "COREHR", module_name: "Core HR"}],
    permissions: ["VIEW"],
    has_access: true
  },
  {
    menu_code: "ATT_DASHBOARD",
    menu_name: "Attendance Dashboard",
    modules: [{module_code: "ATTENDANCE", module_name: "Attendance"}],
    permissions: ["VIEW", "CREATE"],
    has_access: true
  }
  // No PAYROLL or RECRUITMENT menus (not in package)
]
```

### Example 2: User with Base Package + Addons
```javascript
// Company 23 has:
// Base Package: [COREHR, ATTENDANCE, LEAVE]
// Addons: [PAYROLL, RECRUITMENT]

await getUserMenus(userId: 42, companyId: 23, applicationId: 2);

// Result:
[
  {
    menu_code: "EMP_LIST",
    menu_name: "Employee List",
    modules: [{module_code: "COREHR", module_name: "Core HR"}],
    permissions: ["VIEW", "CREATE", "UPDATE"],
    has_access: true
  },
  {
    menu_code: "PAY_RUN",
    menu_name: "Payroll Run",
    modules: [{module_code: "PAYROLL", module_name: "Payroll"}],  // ← From addon!
    permissions: ["VIEW"],
    has_access: true
  },
  {
    menu_code: "RECRUIT_JOBS",
    menu_name: "Job Postings",
    modules: [{module_code: "RECRUITMENT", module_name: "Recruitment"}],  // ← From addon!
    permissions: ["VIEW", "CREATE"],
    has_access: true
  }
]
```

### Example 3: Shared Menu Across Modules
```javascript
// Menu "Reports" is mapped to ALL modules
// hrms_module_menus:
//   (module_id: 1, menu_id: 999)  -- COREHR → Reports
//   (module_id: 2, menu_id: 999)  -- ATTENDANCE → Reports
//   (module_id: 5, menu_id: 999)  -- PAYROLL → Reports

// User sees this menu if they have ANY of these modules
{
  menu_code: "REPORTS",
  menu_name: "Reports",
  modules: [
    {module_code: "COREHR", module_name: "Core HR"},
    {module_code: "ATTENDANCE", module_name: "Attendance"},
    {module_code: "PAYROLL", module_name: "Payroll"}
  ],
  permissions: ["VIEW", "EXPORT"],
  has_access: true
}
```

---

## Database Queries

### Query 1: Get User's Accessible Modules
```sql
-- Base package modules
SELECT m.*
FROM hrms_modules m
JOIN hrms_package_modules pm ON m.id = pm.module_id
JOIN hrms_company_packages cp ON pm.package_id = cp.package_id
WHERE cp.company_id = 23
  AND cp.is_active = TRUE
  AND pm.is_active = TRUE

UNION

-- Addon modules
SELECT m.*
FROM hrms_modules m
JOIN hrms_company_addon_modules addon ON m.id = addon.module_id
WHERE addon.company_id = 23
  AND addon.is_active = TRUE;
```

### Query 2: Get Menus for Accessible Modules
```sql
-- Get menu IDs mapped to company's modules
SELECT DISTINCT mm.menu_id
FROM hrms_module_menus mm
WHERE mm.module_id IN (1, 2, 3, 5, 8)  -- Company's module IDs
  AND mm.is_active = TRUE;

-- Get menu details
SELECT menu.*, GROUP_CONCAT(m.module_code) as modules
FROM hrms_menus menu
JOIN hrms_module_menus mm ON menu.id = mm.menu_id
JOIN hrms_modules m ON mm.module_id = m.id
WHERE menu.id IN (101, 102, 201, ...)  -- Menu IDs from above
  AND menu.application_id = 1
  AND menu.is_active = TRUE
GROUP BY menu.id
ORDER BY menu.display_order;
```

---

## API Response Structure

### GET `/api/role-permission/user-menus`
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "menu_code": "EMP_DASHBOARD",
      "menu_name": "Employee Dashboard",
      "menu_type": "screen",
      "route_path": "/employee/dashboard",
      "parent_menu_id": null,
      "display_order": 1,
      "modules": [
        {
          "id": 1,
          "module_code": "COREHR",
          "module_name": "Core HR"
        }
      ],
      "permissions": ["VIEW", "CREATE"],
      "has_access": true,
      "children": []
    },
    {
      "id": 100,
      "menu_code": "PAYROLL_MENU",
      "menu_name": "Payroll",
      "menu_type": "container",
      "route_path": null,
      "parent_menu_id": null,
      "display_order": 5,
      "modules": [
        {
          "id": 5,
          "module_code": "PAYROLL",
          "module_name": "Payroll Management"
        }
      ],
      "permissions": [],
      "has_access": true,
      "children": [
        {
          "id": 201,
          "menu_code": "PAY_RUN",
          "menu_name": "Payroll Run",
          "menu_type": "screen",
          "route_path": "/payroll/run",
          "permissions": ["VIEW", "CREATE", "UPDATE"],
          "has_access": true
        }
      ]
    }
  ]
}
```

---

## Important Notes

### 1. Module Access is Primary Filter
- User can ONLY see menus from modules in their package/addons
- Even with role permissions, if module not accessible → menu not shown

### 2. Role Permissions Applied After Module Filter
- Module access: "Can you see this menu category?"
- Role permissions: "What actions can you perform on this menu?"

### 3. Super Admin Respects Package
- Super admin does NOT get unlimited module access
- Super admin gets ALL permissions within their package modules only
- This is by design - package = purchased features

### 4. Menu Hierarchy Preserved
- Container menus shown if any child menu is accessible
- Empty containers are hidden automatically
- Parent-child relationships work as before

---

## Testing Checklist

- [ ] User with base package only sees base modules menus
- [ ] User with addons sees base + addon menus
- [ ] Shared menu appears for all relevant modules
- [ ] Super admin sees all permissions (within package modules)
- [ ] Regular user sees only granted permissions
- [ ] Empty containers are hidden
- [ ] Menu hierarchy is correct
- [ ] Different applications work independently
- [ ] Removing addon removes addon menus

---

## Files Modified

1. ✅ `src/services/role_permission/menu.service.js`
   - Updated `getUserMenus()` function
   - Updated `getUserMenusList()` function
   - Added `HrmsModuleMenu` import
   - Added module-menu mapping queries

2. ✅ `src/models/role_permission/HrmsMenu.js`
   - Removed `module_id` field

3. ✅ `src/models/role_permission/HrmsModuleMenu.js`
   - Created new junction table model

4. ✅ `src/models/role_permission/index.js`
   - Updated associations for many-to-many relationship

5. ✅ `database/migrations/role_permission/005_module_menu_mapping.sql`
   - Migration to create junction table
   - Migration to remove module_id from hrms_menus

---

## Migration Instructions

### Run Migration:
```bash
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
```

### Verify:
```sql
-- Check module_id removed
SHOW COLUMNS FROM hrms_menus;

-- Check new table
DESCRIBE hrms_module_menus;

-- Check data migrated
SELECT COUNT(*) FROM hrms_module_menus;
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-12
**Author:** HRMS Development Team
