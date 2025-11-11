-- =====================================================
-- MIGRATION: Add Super Admin Support
-- Version: 002
-- Description: Allow NULL application_id in hrms_role_master for Super Admin roles
--              Super Admin roles have access to ALL applications
-- =====================================================

USE hrms_db;

-- =====================================================
-- 1. Modify hrms_role_master to support Super Admin
-- =====================================================

-- Make application_id nullable (NULL = Super Admin with all app access)
ALTER TABLE `hrms_role_master`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin (access to all applications), INT = specific application';

-- Drop existing unique index if exists
SET @index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_role_master'
    AND index_name = 'unique_app_role_code'
);

SET @drop_index_sql = IF(
  @index_exists > 0,
  'ALTER TABLE `hrms_role_master` DROP INDEX `unique_app_role_code`',
  'SELECT "Index unique_app_role_code does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add new index if not exists
SET @index_new_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_role_master'
    AND index_name = 'idx_app_role_code'
);

SET @add_index_sql = IF(
  @index_new_exists = 0,
  'ALTER TABLE `hrms_role_master` ADD INDEX `idx_app_role_code` (`application_id`, `role_code`)',
  'SELECT "Index idx_app_role_code already exists, skipping..." AS message'
);

PREPARE stmt FROM @add_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update foreign key constraint to allow NULL
SET @fk_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_role_master'
    AND constraint_name = 'fk_role_master_app'
);

SET @drop_fk_sql = IF(
  @fk_exists > 0,
  'ALTER TABLE `hrms_role_master` DROP FOREIGN KEY `fk_role_master_app`',
  'SELECT "Foreign key fk_role_master_app does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Re-add foreign key constraint that allows NULL
SET @add_fk_sql = IF(
  @fk_exists > 0,
  'ALTER TABLE `hrms_role_master` ADD CONSTRAINT `fk_role_master_app` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE',
  'SELECT "Foreign key not re-added as it did not exist..." AS message'
);

PREPARE stmt FROM @add_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update table comment
ALTER TABLE `hrms_role_master`
  COMMENT='Global role master - template roles. application_id=NULL for Super Admin';

-- =====================================================
-- 2. Add is_super_admin flag to hrms_roles (optional helper)
-- =====================================================

-- Add flag to easily identify super admin roles in company roles (if not exists)
SET @column_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_roles'
    AND column_name = 'is_super_admin'
);

SET @add_column_sql = IF(
  @column_exists = 0,
  'ALTER TABLE `hrms_roles` ADD COLUMN `is_super_admin` BOOLEAN NOT NULL DEFAULT FALSE COMMENT "TRUE if role is created from super admin role master" AFTER `is_system_role`',
  'SELECT "Column is_super_admin already exists, skipping..." AS message'
);

PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for quick super admin checks (if not exists)
SET @index_roles_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_roles'
    AND index_name = 'idx_super_admin'
);

SET @add_roles_index_sql = IF(
  @index_roles_exists = 0,
  'ALTER TABLE `hrms_roles` ADD INDEX `idx_super_admin` (`company_id`, `is_super_admin`)',
  'SELECT "Index idx_super_admin already exists, skipping..." AS message'
);

PREPARE stmt FROM @add_roles_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make application_id nullable in hrms_roles for super admin support
ALTER TABLE `hrms_roles`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin (access to all applications), INT = specific application';

-- Update table comment for hrms_roles
ALTER TABLE `hrms_roles`
  COMMENT='Company-specific roles. application_id=NULL for Super Admin roles with access to all apps';

-- Drop unique index on hrms_roles (allows duplicate NULL application_id)
-- MySQL treats NULL != NULL in unique indexes, so we need regular index instead
SET @unique_role_index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_roles'
    AND index_name = 'unique_company_app_role'
);

SET @drop_unique_role_sql = IF(
  @unique_role_index_exists > 0,
  'ALTER TABLE `hrms_roles` DROP INDEX `unique_company_app_role`',
  'SELECT "Index unique_company_app_role does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_unique_role_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add non-unique index for performance (allows multiple NULL for super admin)
SET @role_index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name = 'hrms_roles'
    AND index_name = 'idx_company_app_role'
);

SET @add_role_index_sql = IF(
  @role_index_exists = 0,
  'ALTER TABLE `hrms_roles` ADD INDEX `idx_company_app_role` (`company_id`, `application_id`, `role_code`)',
  'SELECT "Index idx_company_app_role already exists, skipping..." AS message'
);

PREPARE stmt FROM @add_role_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make application_id nullable in hrms_user_roles for super admin user assignments
ALTER TABLE `hrms_user_roles`
  MODIFY COLUMN `application_id` INT UNSIGNED NULL
  COMMENT 'NULL = Super Admin user (access to all applications), INT = specific application';

-- Update table comment for hrms_user_roles
ALTER TABLE `hrms_user_roles`
  COMMENT='User role assignments. application_id=NULL for Super Admin users with access to all apps';

-- =====================================================
-- 3. Insert Super Admin Role Master
-- =====================================================

-- Create Super Admin role master (application_id = NULL)
-- Using INSERT IGNORE to avoid errors if already exists
INSERT IGNORE INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  (NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules. Can manage everything.', 0, TRUE, 1);

-- =====================================================
-- 4. Add Comments for Documentation
-- =====================================================

ALTER TABLE `hrms_role_master`
  MODIFY COLUMN `role_code` VARCHAR(50) NOT NULL
  COMMENT 'Unique role code. SUPER_ADMIN for super admin roles.';

ALTER TABLE `hrms_role_master`
  MODIFY COLUMN `role_description` TEXT DEFAULT NULL
  COMMENT 'Role description. For super admin: describes full system access';

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verification query (uncomment to verify)
-- SELECT * FROM hrms_role_master WHERE application_id IS NULL;
