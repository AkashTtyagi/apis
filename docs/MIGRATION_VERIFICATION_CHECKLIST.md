# Migration Verification Checklist

## Overview
This document provides a comprehensive checklist to verify the successful implementation of:
1. **Addon Modules System** - Companies can add/remove modules beyond base package
2. **Module-Menu Many-to-Many Mapping** - Flexible mapping between modules and menus

---

## Database Migrations

### Migration 1: Company Addon Modules
**File**: `database/migrations/package/004_create_company_addon_modules.sql`

**What it does**:
- Creates `hrms_company_addon_modules` table
- Allows companies to have addon modules beyond base package
- No date restrictions (active until removed)

**Run migration**:
```bash
mysql -u root -p hrms_db < database/migrations/package/004_create_company_addon_modules.sql
```

**Verify**:
```sql
-- Check table created
DESCRIBE hrms_company_addon_modules;

-- Expected columns:
-- id, company_id, module_id, is_active, added_by, created_at, updated_at

-- Check indexes
SHOW INDEX FROM hrms_company_addon_modules;
-- Should have: PRIMARY, unique_company_module, idx_company, idx_module, idx_active
```

### Migration 2: Module-Menu Mapping
**File**: `database/migrations/role_permission/005_module_menu_mapping.sql`

**What it does**:
- Creates `hrms_module_menus` junction table (many-to-many)
- Migrates existing data from `hrms_menus.module_id` to junction table
- Drops `module_id` column from `hrms_menus`

**Run migration**:
```bash
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
```

**Verify**:
```sql
-- 1. Check module_id removed from hrms_menus
SHOW COLUMNS FROM hrms_menus;
-- Should NOT have 'module_id' column

-- 2. Check new junction table
DESCRIBE hrms_module_menus;
-- Expected columns: id, module_id, menu_id, is_active, created_by, created_at, updated_at

-- 3. Check data migrated
SELECT COUNT(*) as total_mappings FROM hrms_module_menus;
-- Should match previous count of menus with module_id

-- 4. View sample mappings
SELECT
    m.module_code,
    m.module_name,
    menu.menu_code,
    menu.menu_name
FROM hrms_module_menus mm
JOIN hrms_modules m ON mm.module_id = m.id
JOIN hrms_menus menu ON mm.menu_id = menu.id
WHERE mm.is_active = TRUE
LIMIT 10;
```

---

## Code Changes Summary

### 1. New Models Created

#### `src/models/package/HrmsCompanyAddonModule.js`
- Model for company addon modules
- Fields: id, company_id, module_id, is_active, added_by
- Exported in `src/models/package/index.js`

#### `src/models/role_permission/HrmsModuleMenu.js`
- Junction table for module-menu many-to-many relationship
- Fields: id, module_id, menu_id, is_active, created_by
- Exported in `src/models/role_permission/index.js`

### 2. Model Updates

#### `src/models/role_permission/HrmsMenu.js`
**Changed**: Removed `module_id` field from model definition

#### `src/models/role_permission/index.js`
**Changed**: Added many-to-many associations between HrmsModule and HrmsMenu

#### `src/models/package/index.js`
**Changed**: Added associations for HrmsCompanyAddonModule

### 3. Service Layer Updates

#### `src/services/package/companyPackage.service.js`
**New Functions**:
- `getAllParentCompanies()` - Get all parent companies
- `addAddonModule(companyId, moduleId, userId)` - Add addon to company
- `removeAddonModule(companyId, moduleId)` - Remove addon from company
- `getCompanyAddonModules(companyId)` - Get company's addon modules

**Updated Functions**:
- `getCompanyModules(companyId)` - Now combines base package + addons

#### `src/services/role_permission/menu.service.js`
**Updated Functions**:

1. **`getMenusByApplication(applicationId, filters)`**
   - Changed: Uses many-to-many relationship with modules
   - Module filter applied through junction table

2. **`getMenuById(menuId)`**
   - Changed: Includes modules array instead of single module
   - Uses junction table for module associations

3. **`createMenu(menuData, userId)`**
   - Changed: Removed `module_id` parameter
   - Added: Optional `module_ids` array to create module-menu mappings
   - Automatically creates mappings if module_ids provided

4. **`getUserMenus(userId, companyId, applicationId)`**
   - Added: Step 2 - Query module-menu mappings
   - Changed: Filters menus by accessible menu IDs from mappings
   - Changed: Includes modules array with menus

5. **`getUserScreenPermissions(userId, companyId, applicationId, menuId)`**
   - Changed: Checks access via module-menu mappings
   - Changed: Validates company has access to any module the menu belongs to

6. **`getUserMenusList(userId, companyId, applicationId)`**
   - Added: Step 2 - Query module-menu mappings
   - Changed: Filters menus by accessible menu IDs from mappings
   - Changed: Includes modules array with menus

7. **`getUserMenuPermissions(userId, companyId, applicationId)`**
   - Added: Step 2 - Query module-menu mappings
   - Changed: Filters screen menus by accessible menu IDs from mappings

### 4. Controller Updates

#### `src/controllers/package/companyPackage.controller.js`
**New Functions**:
- `getAllParentCompanies()` - Controller for listing parent companies
- `addAddonModule()` - Controller for adding addon
- `removeAddonModule()` - Controller for removing addon
- `getCompanyAddonModules()` - Controller for listing addons

**No changes needed**: Menu controller automatically handles new structure

### 5. Route Updates

#### `src/routes/package/companyPackage.routes.js`
**New Routes**:
- `POST /api/package/company-packages/get-all-companies`
- `POST /api/package/company-packages/add-addon`
- `POST /api/package/company-packages/remove-addon`
- `POST /api/package/company-packages/get-addons`

---

## Testing Checklist

### Phase 1: Database Migration Verification
- [ ] Migration 004 executed successfully
- [ ] Migration 005 executed successfully
- [ ] `hrms_company_addon_modules` table exists
- [ ] `hrms_module_menus` table exists
- [ ] `module_id` removed from `hrms_menus`
- [ ] Existing data migrated to junction table
- [ ] All constraints and indexes created

### Phase 2: Addon Module Functionality
- [ ] Add addon module to a company
- [ ] Remove addon module from a company
- [ ] Reactivate previously removed addon
- [ ] List all addons for a company
- [ ] Verify unique constraint (can't add same addon twice)
- [ ] Verify cascade delete (removing module removes addons)

### Phase 3: Module-Menu Mapping
- [ ] Create new menu with `module_ids` array
- [ ] Map existing menu to multiple modules
- [ ] Remove menu-module mapping
- [ ] Verify shared menu appears in multiple modules
- [ ] Verify menu appears only in mapped modules

### Phase 4: User Menu Access
- [ ] User sees only menus from base package modules
- [ ] Add addon module → verify new menus appear
- [ ] Remove addon module → verify menus disappear
- [ ] Shared menu accessible if any module is accessible
- [ ] Super admin sees all permissions (within package modules)
- [ ] Regular user sees only granted permissions

### Phase 5: API Endpoints
Test all updated endpoints:

```bash
# 1. Get parent companies
curl -X POST http://localhost:5001/api/package/company-packages/get-all-companies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# 2. Add addon module
curl -X POST http://localhost:5001/api/package/company-packages/add-addon \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 23,
    "module_id": 5
  }'

# 3. Get user menus
curl -X POST http://localhost:5001/api/menus/get-user-menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 42,
    "company_id": 23,
    "application_id": 1
  }'

# 4. Get user menu list
curl -X POST http://localhost:5001/api/menus/get-user-menus-list \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 42,
    "company_id": 23,
    "application_id": 1
  }'

# 5. Get screen permissions
curl -X POST http://localhost:5001/api/menus/get-user-screen-permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 42,
    "company_id": 23,
    "application_id": 1,
    "menu_id": 101
  }'
```

### Phase 6: Edge Cases
- [ ] Company with no active package
- [ ] Company with base package but no addons
- [ ] Company with inactive addon modules
- [ ] Menu mapped to no modules
- [ ] Menu mapped to modules company doesn't have access to
- [ ] User with no roles
- [ ] User with multiple roles
- [ ] Container menu with no accessible children

---

## Rollback Plan

If issues arise, rollback in reverse order:

### Step 1: Rollback Code Changes
```bash
git checkout <previous-commit-hash>
```

### Step 2: Rollback Migration 005 (Module-Menu Mapping)
```sql
-- Add module_id back to hrms_menus
ALTER TABLE hrms_menus
ADD COLUMN module_id INT UNSIGNED NULL AFTER application_id,
ADD INDEX idx_module (module_id);

-- Restore module_id from junction table (take first mapping)
UPDATE hrms_menus menu
JOIN (
    SELECT menu_id, MIN(module_id) as module_id
    FROM hrms_module_menus
    WHERE is_active = TRUE
    GROUP BY menu_id
) mm ON menu.id = mm.menu_id
SET menu.module_id = mm.module_id;

-- Drop junction table
DROP TABLE IF EXISTS hrms_module_menus;
```

### Step 3: Rollback Migration 004 (Addon Modules)
```sql
DROP TABLE IF EXISTS hrms_company_addon_modules;
```

---

## Performance Considerations

### Indexes Required
All necessary indexes are created by migrations:
- `hrms_module_menus`: module_id, menu_id, unique(module_id, menu_id)
- `hrms_company_addon_modules`: company_id, module_id, unique(company_id, module_id)

### Query Performance
- Module-menu mappings cached in junction table
- Use `IN` clause for filtering by multiple module IDs
- Proper indexes on foreign keys for fast joins

### Potential Bottlenecks
- Large companies with many addon modules
- Menus mapped to many modules
- Users with many roles

**Optimization**: Consider caching user menu structure at application level

---

## Breaking Changes

### API Changes
**None** - All existing endpoints maintain backward compatibility

### Database Schema Changes
1. **`hrms_menus.module_id` removed** - Migration handles data migration
2. **New table `hrms_module_menus`** - Junction table for mapping
3. **New table `hrms_company_addon_modules`** - Addon module tracking

### Code Changes
Functions that directly accessed `menu.module_id` need updating:
- ✅ `getMenusByApplication()` - Updated
- ✅ `getMenuById()` - Updated
- ✅ `createMenu()` - Updated
- ✅ `getUserScreenPermissions()` - Updated
- ✅ `getUserMenus()` - Updated
- ✅ `getUserMenusList()` - Updated
- ✅ `getUserMenuPermissions()` - Updated

**Action Required**: Search codebase for any other references to `menu.module_id`

```bash
# Search for potential issues
grep -r "menu\.module_id" src/
grep -r "menu_data\.module_id" src/
grep -r "module_id.*menu" src/
```

---

## Common Issues & Solutions

### Issue 1: Migration fails - foreign key constraint
**Cause**: Invalid module_id or menu_id in existing data
**Solution**: Clean up orphaned records before migration
```sql
DELETE FROM hrms_menus WHERE module_id IS NOT NULL AND module_id NOT IN (SELECT id FROM hrms_modules);
```

### Issue 2: Menus not appearing for user
**Cause**: No module-menu mappings exist
**Solution**: Create mappings in `hrms_module_menus`
```sql
INSERT INTO hrms_module_menus (module_id, menu_id, is_active, created_by)
VALUES (1, 101, TRUE, 1);
```

### Issue 3: Addon module not showing menus
**Cause**: Menus not mapped to addon module
**Solution**: Add menu-module mappings for addon module

### Issue 4: Performance slow with many modules
**Cause**: Multiple queries for module-menu mappings
**Solution**: Ensure indexes exist and consider query optimization

---

## Success Criteria

✅ **All migrations completed without errors**
✅ **No data loss during migration**
✅ **All existing menus accessible after migration**
✅ **Addon module CRUD operations working**
✅ **User menu access respects package + addon modules**
✅ **Shared menus working across multiple modules**
✅ **API endpoints returning correct data**
✅ **Super admin permissions working**
✅ **Regular user permissions working**
✅ **No console errors or warnings**

---

## Documentation References

- [User Menu Access Flow](./USER_MENU_ACCESS_FLOW.md)
- [Module-Menu Mapping Guide](./MODULE_MENU_MAPPING_GUIDE.md)
- [Addon Modules API Guide](./ADDON_MODULES_API_GUIDE.md)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-12
**Author**: HRMS Development Team
