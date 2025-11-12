-- =====================================================
-- MIGRATION: Module-Menu Mapping
-- Version: 005
-- Description:
--   1. Create hrms_module_menus mapping table
--   2. Migrate existing menu-module relationships
--   3. Drop module_id from hrms_menus
-- =====================================================

USE hrms_db;

-- =====================================================
-- Step 1: Create hrms_module_menus mapping table
-- =====================================================

CREATE TABLE IF NOT EXISTS `hrms_module_menus` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `module_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_modules',
    `menu_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_menus',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Active status',
    `created_by` INT NULL COMMENT 'User who created mapping',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Unique constraint: one menu can be mapped once per module
    CONSTRAINT `unique_module_menu` UNIQUE (`module_id`, `menu_id`),

    -- Foreign keys
    CONSTRAINT `fk_module_menu_module`
        FOREIGN KEY (`module_id`)
        REFERENCES `hrms_modules` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_module_menu_menu`
        FOREIGN KEY (`menu_id`)
        REFERENCES `hrms_menus` (`id`)
        ON DELETE CASCADE,

    -- Indexes for performance
    INDEX `idx_module` (`module_id`),
    INDEX `idx_menu` (`menu_id`),
    INDEX `idx_active` (`is_active`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Many-to-many mapping between modules and menus';

-- =====================================================
-- Step 2: Migrate existing data (if module_id exists in hrms_menus)
-- =====================================================

-- Check if module_id column exists before migrating
SET @column_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND column_name = 'module_id'
);

-- If module_id exists, migrate data
SET @migrate_sql = IF(
    @column_exists > 0,
    'INSERT INTO hrms_module_menus (module_id, menu_id, is_active, created_at)
     SELECT module_id, id, is_active, created_at
     FROM hrms_menus
     WHERE module_id IS NOT NULL
     ON DUPLICATE KEY UPDATE updated_at = NOW()',
    'SELECT "No module_id column found, skipping migration..." AS message'
);

PREPARE stmt FROM @migrate_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Step 3: Drop module_id from hrms_menus
-- =====================================================

-- Step 3.1: Drop foreign key constraint if exists
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

-- Step 3.2: Drop index if exists
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND index_name = 'idx_module_id'
);

SET @drop_index_sql = IF(
    @index_exists > 0,
    'ALTER TABLE `hrms_menus` DROP INDEX `idx_module_id`',
    'SELECT "Index idx_module_id does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Also check for 'idx_module' index (alternative name)
SET @index_exists2 = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE table_schema = DATABASE()
      AND table_name = 'hrms_menus'
      AND index_name = 'idx_module'
);

SET @drop_index_sql2 = IF(
    @index_exists2 > 0,
    'ALTER TABLE `hrms_menus` DROP INDEX `idx_module`',
    'SELECT "Index idx_module does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_index_sql2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3.3: Drop module_id column if exists
SET @drop_column_sql = IF(
    @column_exists > 0,
    'ALTER TABLE `hrms_menus` DROP COLUMN `module_id`',
    'SELECT "Column module_id does not exist in hrms_menus, skipping..." AS message'
);

PREPARE stmt FROM @drop_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Step 4: Update table comment
-- =====================================================

ALTER TABLE `hrms_menus`
    COMMENT='Menu hierarchy (N-level). Module mapping moved to hrms_module_menus';

-- =====================================================
-- Verification Queries (uncomment to test)
-- =====================================================

-- Check mapping table
-- SELECT COUNT(*) as total_mappings FROM hrms_module_menus;

-- Check if module_id dropped from hrms_menus
-- SHOW COLUMNS FROM hrms_menus LIKE 'module_id';

-- View module-menu relationships
-- SELECT
--     m.module_code,
--     m.module_name,
--     menu.menu_code,
--     menu.menu_name,
--     mm.is_active
-- FROM hrms_module_menus mm
-- JOIN hrms_modules m ON mm.module_id = m.id
-- JOIN hrms_menus menu ON mm.menu_id = menu.id
-- WHERE mm.is_active = TRUE
-- ORDER BY m.display_order, menu.display_order;

-- =====================================================
-- Migration Complete
-- =====================================================
