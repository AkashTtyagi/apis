# Migration Fix Guide - Foreign Key Constraint Issue

## Problem
When running migration `005_module_menu_mapping.sql`, you encountered:
```
SQL Error [1828] [HY000]: Cannot drop column 'module_id': needed in a foreign key constraint 'fk_menu_module'
```

## Root Cause
The `hrms_menus` table has a foreign key constraint named `fk_menu_module` on the `module_id` column. MySQL requires foreign key constraints to be dropped before dropping the column they reference.

## Solution Applied

### Updated Migration Script
The migration script has been updated to include a new step that drops the foreign key constraint **before** dropping the column:

**New Step 3.1: Drop Foreign Key Constraint**
```sql
-- Drop foreign key constraint if exists
SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE constraint_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND constraint_name = 'fk_menu_module'
      AND constraint_type = 'FOREIGN KEY'
);

SET @drop_fk_sql = IF(
    @fk_exists > 0,
    'ALTER TABLE `hrms_menus` DROP FOREIGN KEY `fk_menu_module`',
    'SELECT "Foreign key fk_menu_module does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### Execution Order (Fixed)
1. ✅ Create `hrms_module_menus` junction table
2. ✅ Migrate existing data from `hrms_menus.module_id`
3. ✅ **Drop foreign key constraint `fk_menu_module`** (NEW STEP)
4. ✅ Drop index `idx_module_id` or `idx_module`
5. ✅ Drop column `module_id`
6. ✅ Update table comment

---

## How to Run the Fixed Migration

### Option 1: Fresh Migration (If not run yet)
```bash
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
```

### Option 2: If Migration Partially Completed
If the migration created `hrms_module_menus` but failed at dropping the column:

1. **Run the fixed migration again** - It's idempotent and will skip completed steps:
   ```bash
   mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
   ```

### Option 3: Manual Fix (If needed)
If you prefer to fix manually:

```sql
USE hrms_db;

-- 1. Drop the foreign key constraint
ALTER TABLE `hrms_menus` DROP FOREIGN KEY `fk_menu_module`;

-- 2. Drop any indexes on module_id
ALTER TABLE `hrms_menus` DROP INDEX `idx_module_id`;
-- OR if the index has a different name:
ALTER TABLE `hrms_menus` DROP INDEX `idx_module`;

-- 3. Drop the column
ALTER TABLE `hrms_menus` DROP COLUMN `module_id`;
```

---

## Verification

After running the migration, verify it succeeded:

```sql
-- 1. Check that module_id column is gone
SHOW COLUMNS FROM hrms_menus LIKE 'module_id';
-- Should return empty result

-- 2. Check hrms_module_menus table exists and has data
SELECT COUNT(*) as total_mappings FROM hrms_module_menus;
-- Should show number of migrated mappings

-- 3. View sample mappings
SELECT
    m.module_code,
    m.module_name,
    menu.menu_code,
    menu.menu_name,
    mm.is_active
FROM hrms_module_menus mm
JOIN hrms_modules m ON mm.module_id = m.id
JOIN hrms_menus menu ON mm.menu_id = menu.id
WHERE mm.is_active = TRUE
LIMIT 10;
```

---

## Rollback (If Needed)

If you need to rollback the migration, use the provided rollback script:

```bash
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping_ROLLBACK.sql
```

**Warning:** The rollback script will:
1. Add `module_id` column back to `hrms_menus`
2. Restore data from `hrms_module_menus` (takes first module for each menu)
3. Add foreign key constraint back
4. **DOES NOT automatically drop `hrms_module_menus` table** (for safety)

To completely rollback, after running the script, manually drop the table:
```sql
DROP TABLE IF EXISTS hrms_module_menus;
```

---

## Files Updated

### 1. Migration Script (Fixed)
- **File:** `/database/migrations/role_permission/005_module_menu_mapping.sql`
- **Status:** ✅ Fixed
- **Changes:** Added step to drop foreign key constraint before dropping column

### 2. Rollback Script (New)
- **File:** `/database/migrations/role_permission/005_module_menu_mapping_ROLLBACK.sql`
- **Status:** ✅ Created
- **Purpose:** Undo the migration if needed

---

## Common Issues & Solutions

### Issue 1: "Foreign key constraint does not exist"
**Symptom:** Message says foreign key doesn't exist but column still can't be dropped

**Solution:** Check for different constraint name:
```sql
-- Find the actual constraint name
SELECT
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE table_schema = DATABASE()
  AND table_name = 'hrms_menus'
  AND constraint_type = 'FOREIGN KEY';

-- Drop using the actual name
ALTER TABLE hrms_menus DROP FOREIGN KEY <actual_constraint_name>;
```

### Issue 2: "Data truncation error during migration"
**Symptom:** Error when migrating data to junction table

**Solution:** Check for NULL or invalid module_id values:
```sql
-- Find problematic records
SELECT id, menu_code, menu_name, module_id
FROM hrms_menus
WHERE module_id IS NULL OR module_id NOT IN (SELECT id FROM hrms_modules);

-- Clean up before migration
DELETE FROM hrms_menus
WHERE module_id IS NOT NULL
  AND module_id NOT IN (SELECT id FROM hrms_modules);
```

### Issue 3: Migration runs but column not dropped
**Symptom:** Script completes but column still exists

**Solution:** Check variable value:
```sql
-- Check if column detection worked
SELECT COUNT(1) as column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'hrms_menus'
  AND column_name = 'module_id';

-- If column exists (returns 1), manually run:
ALTER TABLE hrms_menus DROP FOREIGN KEY fk_menu_module;
ALTER TABLE hrms_menus DROP COLUMN module_id;
```

---

## Next Steps

After successful migration:

1. ✅ **Restart Application Server**
   ```bash
   npm restart
   # or
   pm2 restart hrms
   ```

2. ✅ **Test Menu Access**
   - Test user login
   - Verify menus load correctly
   - Check addon module functionality

3. ✅ **Run Application Tests**
   ```bash
   npm test
   ```

4. ✅ **Monitor Logs**
   - Check for any Sequelize errors
   - Verify no SQL errors related to module_id

---

## Support

If you encounter any other issues:

1. Check the error message carefully
2. Review `/docs/MIGRATION_VERIFICATION_CHECKLIST.md`
3. Check `/docs/MODULE_MENU_IMPLEMENTATION_SUMMARY.md`
4. Review database logs: `/var/log/mysql/error.log`

---

**Document Created:** 2025-01-12
**Status:** ✅ Issue Fixed
**Migration File:** `005_module_menu_mapping.sql`
