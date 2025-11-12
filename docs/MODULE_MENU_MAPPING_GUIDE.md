# Module-Menu Mapping Architecture

## Overview
Removed `module_id` from `hrms_menus` table and created a **many-to-many** relationship between Modules and Menus through `hrms_module_menus` mapping table.

---

## Why This Change?

### Old Architecture ❌
```
Module (1) -----> (N) Menu
    ↓ (direct FK)
One menu = One module only
```

**Problems:**
- One menu can belong to only ONE module
- No flexibility for shared menus across modules
- Hard-coded module dependency

### New Architecture ✅
```
Module (N) <-----> (N) Menu
         ↓ (junction table)
    hrms_module_menus
```

**Benefits:**
- ✅ One menu can belong to MULTIPLE modules
- ✅ Flexible menu-module mapping
- ✅ Easy to add/remove modules from menus
- ✅ Granular control per menu

---

## Database Structure

### Table 1: `hrms_menus` (Updated)
```sql
CREATE TABLE hrms_menus (
    id INT UNSIGNED PRIMARY KEY,
    application_id INT UNSIGNED NOT NULL,    -- FK to hrms_applications
    -- module_id REMOVED! ✅
    parent_menu_id INT UNSIGNED NULL,        -- Self-referencing hierarchy
    menu_code VARCHAR(100) NOT NULL,
    menu_name VARCHAR(150) NOT NULL,
    menu_type ENUM('container', 'screen'),
    route_path VARCHAR(255) NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    ...
);
```

### Table 2: `hrms_module_menus` (New Junction Table)
```sql
CREATE TABLE hrms_module_menus (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    module_id INT UNSIGNED NOT NULL,         -- FK to hrms_modules
    menu_id INT UNSIGNED NOT NULL,           -- FK to hrms_menus
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE KEY unique_module_menu (module_id, menu_id),
    FOREIGN KEY (module_id) REFERENCES hrms_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES hrms_menus(id) ON DELETE CASCADE
);
```

---

## Relationships Diagram

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  hrms_modules   │         │ hrms_module_menus    │         │   hrms_menus    │
│─────────────────│         │──────────────────────│         │─────────────────│
│ • id (PK)       │────────>│ • id (PK)            │<────────│ • id (PK)       │
│ • module_code   │   (N)   │ • module_id (FK)     │   (N)   │ • menu_code     │
│ • module_name   │         │ • menu_id (FK)       │         │ • menu_name     │
│ • is_active     │         │ • is_active          │         │ • menu_type     │
└─────────────────┘         └──────────────────────┘         │ • route_path    │
                                                              │ • parent_menu_id│
                                                              └─────────────────┘
```

---

## Example Scenarios

### Scenario 1: Employee Dashboard Menu
**Requirement:** Show "Employee Dashboard" in both COREHR and PAYROLL modules

**Old Way (NOT possible):**
```
Menu: Employee Dashboard
└─ module_id = 1 (COREHR only)  ❌ Can't add to PAYROLL
```

**New Way:**
```
Menu: Employee Dashboard (id=101)

hrms_module_menus:
├─ module_id=1 (COREHR), menu_id=101      ✅
└─ module_id=5 (PAYROLL), menu_id=101     ✅
```

### Scenario 2: Reports Menu
**Requirement:** "Reports" menu should appear in ALL modules

**Mapping:**
```sql
INSERT INTO hrms_module_menus (module_id, menu_id) VALUES
(1, 205),  -- COREHR -> Reports
(2, 205),  -- ATTENDANCE -> Reports
(3, 205),  -- LEAVE -> Reports
(5, 205),  -- PAYROLL -> Reports
(8, 205);  -- RECRUITMENT -> Reports
```

---

## SQL Queries

### Query 1: Get All Menus for a Module
```sql
SELECT
    m.module_code,
    m.module_name,
    menu.id as menu_id,
    menu.menu_code,
    menu.menu_name,
    menu.menu_type,
    menu.route_path,
    mm.is_active
FROM hrms_modules m
JOIN hrms_module_menus mm ON m.id = mm.module_id
JOIN hrms_menus menu ON mm.menu_id = menu.id
WHERE m.id = 1  -- COREHR module
  AND mm.is_active = TRUE
  AND menu.is_active = TRUE
ORDER BY menu.display_order;
```

### Query 2: Get All Modules for a Menu
```sql
SELECT
    menu.menu_code,
    menu.menu_name,
    m.module_code,
    m.module_name
FROM hrms_menus menu
JOIN hrms_module_menus mm ON menu.id = mm.menu_id
JOIN hrms_modules m ON mm.module_id = m.id
WHERE menu.id = 101  -- Employee Dashboard
  AND mm.is_active = TRUE
  AND m.is_active = TRUE;
```

### Query 3: Get Company's Accessible Menus (with Module + Addon check)
```sql
-- Get all menus from accessible modules (base package + addons)
SELECT DISTINCT
    menu.id,
    menu.menu_code,
    menu.menu_name,
    menu.menu_type,
    menu.route_path,
    menu.parent_menu_id,
    GROUP_CONCAT(DISTINCT m.module_code) as modules
FROM hrms_menus menu
JOIN hrms_module_menus mm ON menu.id = mm.menu_id AND mm.is_active = TRUE
JOIN hrms_modules m ON mm.module_id = m.id AND m.is_active = TRUE
WHERE m.id IN (
    -- Base package modules
    SELECT pm.module_id
    FROM hrms_company_packages cp
    JOIN hrms_package_modules pm ON cp.package_id = pm.package_id
    WHERE cp.company_id = 23
      AND cp.is_active = TRUE
      AND pm.is_active = TRUE

    UNION

    -- Addon modules
    SELECT addon.module_id
    FROM hrms_company_addon_modules addon
    WHERE addon.company_id = 23
      AND addon.is_active = TRUE
)
AND menu.is_active = TRUE
GROUP BY menu.id
ORDER BY menu.display_order;
```

---

## Sequelize Queries

### Example 1: Get Module with Menus
```javascript
const { HrmsModule, HrmsMenu, HrmsModuleMenu } = require('../models/role_permission');

// Get module with all its menus
const moduleWithMenus = await HrmsModule.findOne({
    where: {
        module_code: 'COREHR',
        is_active: true
    },
    include: [
        {
            model: HrmsMenu,
            as: 'menus',
            through: {
                model: HrmsModuleMenu,
                where: { is_active: true },
                attributes: []
            },
            where: { is_active: true },
            required: false
        }
    ]
});

console.log(moduleWithMenus.menus); // Array of menus for COREHR module
```

### Example 2: Get Menu with Modules
```javascript
// Get menu and all modules it belongs to
const menuWithModules = await HrmsMenu.findOne({
    where: {
        menu_code: 'EMP_DASHBOARD',
        is_active: true
    },
    include: [
        {
            model: HrmsModule,
            as: 'modules',
            through: {
                model: HrmsModuleMenu,
                where: { is_active: true },
                attributes: ['is_active', 'created_at']
            },
            where: { is_active: true },
            required: false
        }
    ]
});

console.log(menuWithModules.modules); // Array of modules this menu belongs to
```

### Example 3: Add Menu to Module
```javascript
const { HrmsModuleMenu } = require('../models/role_permission');

// Add "Reports" menu to PAYROLL module
const mapping = await HrmsModuleMenu.create({
    module_id: 5,  // PAYROLL
    menu_id: 205,  // Reports menu
    is_active: true,
    created_by: 1
});
```

### Example 4: Remove Menu from Module
```javascript
// Soft delete: deactivate mapping
await HrmsModuleMenu.update(
    { is_active: false },
    {
        where: {
            module_id: 5,
            menu_id: 205
        }
    }
);

// Hard delete: remove mapping completely
await HrmsModuleMenu.destroy({
    where: {
        module_id: 5,
        menu_id: 205
    }
});
```

---

## Migration Steps

### Step 1: Run Migration
```bash
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
```

### Step 2: Verify Migration
```sql
-- Check if module_id dropped from hrms_menus
SHOW COLUMNS FROM hrms_menus;

-- Check new mapping table
SELECT COUNT(*) as total_mappings FROM hrms_module_menus;

-- View some mappings
SELECT
    m.module_code,
    menu.menu_code,
    menu.menu_name
FROM hrms_module_menus mm
JOIN hrms_modules m ON mm.module_id = m.id
JOIN hrms_menus menu ON mm.menu_id = menu.id
WHERE mm.is_active = TRUE
LIMIT 10;
```

---

## API Examples (Future Implementation)

### Endpoint 1: Add Menu to Module
```bash
POST /api/role-permission/module-menu-mapping/add

Request:
{
  "module_id": 5,
  "menu_id": 205
}

Response:
{
  "success": true,
  "message": "Menu added to module successfully",
  "data": {
    "id": 1,
    "module_id": 5,
    "menu_id": 205,
    "is_active": true
  }
}
```

### Endpoint 2: Remove Menu from Module
```bash
POST /api/role-permission/module-menu-mapping/remove

Request:
{
  "module_id": 5,
  "menu_id": 205
}

Response:
{
  "success": true,
  "message": "Menu removed from module successfully"
}
```

### Endpoint 3: Get Module's Menus
```bash
POST /api/role-permission/module-menu-mapping/get-module-menus

Request:
{
  "module_id": 5
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 201,
      "menu_code": "PAY_DASHBOARD",
      "menu_name": "Payroll Dashboard",
      "menu_type": "screen",
      "route_path": "/payroll/dashboard"
    },
    {
      "id": 205,
      "menu_code": "REPORTS",
      "menu_name": "Reports",
      "menu_type": "container"
    }
  ],
  "count": 2
}
```

---

## Benefits Summary

| Feature | Old (Direct FK) | New (Many-to-Many) |
|---------|----------------|-------------------|
| **One menu, one module** | ✅ | ✅ |
| **One menu, multiple modules** | ❌ | ✅ |
| **Shared menus** | ❌ | ✅ |
| **Flexible mapping** | ❌ | ✅ |
| **Easy add/remove** | ❌ | ✅ |
| **Menu independence** | ❌ | ✅ |
| **Granular control** | ❌ | ✅ |

---

## Important Notes

1. **Backward Compatibility**: Migration automatically copies existing `module_id` relationships to the new mapping table

2. **Cascade Delete**: Deleting a module or menu will automatically remove all mappings

3. **Unique Constraint**: Same menu cannot be mapped twice to same module

4. **Soft Delete Support**: Use `is_active` flag to temporarily disable menu in a module

5. **Role Permissions**: Still work the same way - permissions are on menus, not modules

6. **Menu Hierarchy**: Parent-child menu relationships remain unchanged

---

## Testing Checklist

- [ ] Run migration successfully
- [ ] Verify module_id dropped from hrms_menus
- [ ] Verify hrms_module_menus table created
- [ ] Check existing data migrated correctly
- [ ] Test adding menu to module
- [ ] Test removing menu from module
- [ ] Test shared menu across multiple modules
- [ ] Verify role permissions still work
- [ ] Test company module access (base + addon)
- [ ] Test user menu access flow

---

## Files Modified/Created

### Created:
1. ✅ `database/migrations/role_permission/005_module_menu_mapping.sql`
2. ✅ `src/models/role_permission/HrmsModuleMenu.js`

### Modified:
1. ✅ `src/models/role_permission/HrmsMenu.js` - Removed `module_id` field
2. ✅ `src/models/role_permission/index.js` - Updated associations

---

**Document Version:** 1.0
**Last Updated:** 2025-01-12
**Author:** HRMS Development Team
