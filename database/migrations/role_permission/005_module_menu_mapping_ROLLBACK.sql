-- =====================================================
-- ROLLBACK: Module-Menu Mapping Migration
-- Version: 005
-- Description: Rollback changes from migration 005
--   1. Add module_id back to hrms_menus
--   2. Restore data from hrms_module_menus
--   3. Drop hrms_module_menus table
-- =====================================================

USE hrms_db;

-- =====================================================
-- Step 1: Add module_id column back to hrms_menus
-- =====================================================

-- Check if module_id already exists
SET @column_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND column_name = 'module_id'
);

-- Add module_id column if it doesn't exist
SET @add_column_sql = IF(
    @column_exists = 0,
    'ALTER TABLE `hrms_menus`
     ADD COLUMN `module_id` INT UNSIGNED NULL AFTER `application_id`,
     ADD INDEX `idx_module_id` (`module_id`)',
    'SELECT "Column module_id already exists in hrms_menus, skipping..." AS message'
);

PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Step 2: Restore data from hrms_module_menus
-- =====================================================

-- Check if hrms_module_menus table exists
SET @table_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE table_schema = DATABASE()
      AND table_name = 'hrms_module_menus'
);

-- Restore module_id from junction table (take first mapping for each menu)
SET @restore_sql = IF(
    @table_exists > 0 AND @column_exists = 0,
    'UPDATE hrms_menus menu
     JOIN (
         SELECT menu_id, MIN(module_id) as module_id
         FROM hrms_module_menus
         WHERE is_active = TRUE
         GROUP BY menu_id
     ) mm ON menu.id = mm.menu_id
     SET menu.module_id = mm.module_id',
    'SELECT "Cannot restore data, either table does not exist or column already has data..." AS message'
);

PREPARE stmt FROM @restore_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Step 3: Add foreign key constraint back
-- =====================================================

-- Check if foreign key already exists
SET @fk_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE constraint_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND constraint_name = 'fk_menu_module'
      AND constraint_type = 'FOREIGN KEY'
);

-- Add foreign key constraint if it doesn't exist and column has data
SET @add_fk_sql = IF(
    @fk_exists = 0 AND @column_exists = 0,
    'ALTER TABLE `hrms_menus`
     ADD CONSTRAINT `fk_menu_module`
     FOREIGN KEY (`module_id`)
     REFERENCES `hrms_modules` (`id`)
     ON DELETE RESTRICT',
    'SELECT "Foreign key fk_menu_module already exists or cannot be added, skipping..." AS message'
);

PREPARE stmt FROM @add_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Step 4: Drop hrms_module_menus table (CAUTION!)
-- =====================================================

-- WARNING: This will delete all module-menu mappings
-- Only run this if you're sure you want to rollback completely

-- Uncomment the following line to drop the table:
-- DROP TABLE IF EXISTS `hrms_module_menus`;

-- =====================================================
-- Step 5: Update table comment
-- =====================================================

ALTER TABLE `hrms_menus`
    COMMENT='Menu hierarchy (N-level) with module foreign key';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if module_id restored
SELECT 'Checking module_id column...' AS status;
SHOW COLUMNS FROM hrms_menus LIKE 'module_id';

-- Check data restoration
SELECT
    COUNT(*) as total_menus,
    COUNT(module_id) as menus_with_module,
    COUNT(*) - COUNT(module_id) as menus_without_module
FROM hrms_menus;

-- Check sample data
SELECT
    menu.id,
    menu.menu_code,
    menu.menu_name,
    menu.module_id,
    m.module_code,
    m.module_name
FROM hrms_menus menu
LEFT JOIN hrms_modules m ON menu.module_id = m.id
LIMIT 10;

-- =====================================================
-- Rollback Complete
-- =====================================================

SELECT '
=====================================================
ROLLBACK COMPLETED SUCCESSFULLY
=====================================================

NOTE: The hrms_module_menus table was NOT dropped automatically.
If you want to remove it completely, run:

    DROP TABLE IF EXISTS hrms_module_menus;

WARNING: This will permanently delete all module-menu mappings!
Only do this if you are absolutely sure.
=====================================================
' AS IMPORTANT_MESSAGE;
