-- =====================================================
-- Role & Permission Management System
-- Migration: Create all role and permission tables
-- Date: 2025-10-23
--
-- NOTE: This system works with Package Management
-- Menus are assigned to modules, and modules are in packages
-- Company can only access menus from their package's modules
-- =====================================================

-- =====================================================
-- 1. APPLICATIONS TABLE (GLOBAL)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_applications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `app_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'ESS, ADMIN, PAYROLL',
  `app_name` VARCHAR(100) NOT NULL,
  `app_description` TEXT DEFAULT NULL,
  `app_icon` VARCHAR(255) DEFAULT NULL,
  `app_url` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_app_code` (`app_code`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global applications';

-- =====================================================
-- 2. MENUS TABLE (GLOBAL - N-Level Hierarchy)
-- Menus belong to modules (from package management)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_applications',
  `module_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_modules - which module this menu belongs to',
  `parent_menu_id` INT UNSIGNED DEFAULT NULL COMMENT 'Parent menu for N-level hierarchy',
  `menu_code` VARCHAR(100) NOT NULL,
  `menu_name` VARCHAR(150) NOT NULL,
  `menu_type` ENUM('container', 'screen') NOT NULL COMMENT 'container=grouping, screen=page',
  `menu_icon` VARCHAR(100) DEFAULT NULL,
  `route_path` VARCHAR(255) DEFAULT NULL COMMENT 'Frontend route (screen type only)',
  `component_path` VARCHAR(255) DEFAULT NULL COMMENT 'Component path (screen type only)',
  `menu_description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_app_menu_code` (`application_id`, `menu_code`),
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_module_id` (`module_id`),
  INDEX `idx_parent_menu_id` (`parent_menu_id`),
  INDEX `idx_menu_type` (`menu_type`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_menu_application` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_module` FOREIGN KEY (`module_id`) REFERENCES `hrms_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_menu_id`) REFERENCES `hrms_menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global menus assigned to modules';

-- =====================================================
-- 3. PERMISSIONS MASTER TABLE (GLOBAL)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_permissions_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `permission_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'VIEW, ADD, EDIT, DELETE',
  `permission_name` VARCHAR(100) NOT NULL,
  `permission_description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_permission_code` (`permission_code`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global permissions';

-- =====================================================
-- 4. ROLE MASTER TABLE (GLOBAL - Template Roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_role_master` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `application_id` INT UNSIGNED NOT NULL,
  `role_code` VARCHAR(50) NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `role_description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_app_role_code` (`application_id`, `role_code`),
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_role_master_app` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global role master - template roles';

-- =====================================================
-- 5. ROLE MASTER MENU PERMISSIONS (GLOBAL)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_role_master_menu_permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_master_id` INT UNSIGNED NOT NULL,
  `menu_id` INT UNSIGNED NOT NULL COMMENT 'Must be screen type',
  `permission_id` INT UNSIGNED NOT NULL,
  `is_granted` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_rm_menu_perm` (`role_master_id`, `menu_id`, `permission_id`),
  INDEX `idx_role_master_id` (`role_master_id`),
  INDEX `idx_menu_id` (`menu_id`),
  INDEX `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rmmp_role_master` FOREIGN KEY (`role_master_id`) REFERENCES `hrms_role_master` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rmmp_menu` FOREIGN KEY (`menu_id`) REFERENCES `hrms_menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rmmp_permission` FOREIGN KEY (`permission_id`) REFERENCES `hrms_permissions_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Role master permissions';

-- =====================================================
-- 6. COMPANY ROLES TABLE (COMPANY-SPECIFIC)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `application_id` INT UNSIGNED NOT NULL,
  `role_master_id` INT UNSIGNED DEFAULT NULL COMMENT 'NULL if custom role',
  `role_code` VARCHAR(50) NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `role_description` TEXT DEFAULT NULL,
  `is_system_role` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_company_app_role` (`company_id`, `application_id`, `role_code`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_role_master_id` (`role_master_id`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_role_app` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_role_master` FOREIGN KEY (`role_master_id`) REFERENCES `hrms_role_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Company-specific roles';

-- =====================================================
-- 7. ROLE MENU PERMISSIONS (COMPANY-SPECIFIC)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_role_menu_permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` INT UNSIGNED NOT NULL,
  `menu_id` INT UNSIGNED NOT NULL COMMENT 'Must be screen type',
  `permission_id` INT UNSIGNED NOT NULL,
  `is_granted` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_role_menu_perm` (`role_id`, `menu_id`, `permission_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_menu_id` (`menu_id`),
  INDEX `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_rmp_role` FOREIGN KEY (`role_id`) REFERENCES `hrms_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rmp_menu` FOREIGN KEY (`menu_id`) REFERENCES `hrms_menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rmp_permission` FOREIGN KEY (`permission_id`) REFERENCES `hrms_permissions_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Role menu permissions';

-- =====================================================
-- 8. USER ROLES (COMPANY-SPECIFIC)
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_user_roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `application_id` INT UNSIGNED NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `assigned_by` INT DEFAULT NULL,
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_by` INT DEFAULT NULL,
  `revoked_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_user_role_app` (`user_id`, `role_id`, `application_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `hrms_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_app` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User role assignments';

-- =====================================================
-- 9. USER MENU PERMISSIONS (USER-SPECIFIC OVERRIDES)
-- Extra or restricted permissions for individual users
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_user_menu_permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `application_id` INT UNSIGNED NOT NULL,
  `menu_id` INT UNSIGNED NOT NULL COMMENT 'Must be screen type',
  `permission_id` INT UNSIGNED NOT NULL,
  `permission_type` ENUM('grant', 'revoke') NOT NULL COMMENT 'grant=add extra, revoke=remove from role',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_user_menu_perm` (`user_id`, `application_id`, `menu_id`, `permission_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_menu_id` (`menu_id`),
  INDEX `idx_permission_id` (`permission_id`),
  INDEX `idx_permission_type` (`permission_type`),
  CONSTRAINT `fk_ump_app` FOREIGN KEY (`application_id`) REFERENCES `hrms_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ump_menu` FOREIGN KEY (`menu_id`) REFERENCES `hrms_menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ump_permission` FOREIGN KEY (`permission_id`) REFERENCES `hrms_permissions_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User-specific permission overrides';

-- =====================================================
-- 10. AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_role_permission_audit_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` INT DEFAULT NULL,
  `entity_type` ENUM('application', 'menu', 'role_master', 'role', 'user_role', 'user_permission') NOT NULL,
  `entity_id` INT UNSIGNED NOT NULL,
  `action` ENUM('create', 'update', 'delete', 'assign', 'revoke', 'grant') NOT NULL,
  `old_value` JSON DEFAULT NULL,
  `new_value` JSON DEFAULT NULL,
  `changed_by` INT NOT NULL,
  `change_description` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_changed_by` (`changed_by`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for role and permission changes';

-- =====================================================
-- SEED DEFAULT PERMISSIONS
-- =====================================================
INSERT INTO `hrms_permissions_master` (`permission_code`, `permission_name`, `permission_description`, `display_order`, `is_active`) VALUES
('VIEW', 'View', 'Can view the screen/data', 1, TRUE),
('ADD', 'Add', 'Can add new records', 2, TRUE),
('EDIT', 'Edit', 'Can edit existing records', 3, TRUE),
('DELETE', 'Delete', 'Can delete records', 4, TRUE),
('EXPORT', 'Export', 'Can export data', 5, TRUE),
('APPROVE', 'Approve', 'Can approve requests/records', 6, TRUE),
('REJECT', 'Reject', 'Can reject requests/records', 7, TRUE),
('PRINT', 'Print', 'Can print records', 8, TRUE)
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- =====================================================
-- SEED DEFAULT APPLICATIONS
-- =====================================================
INSERT INTO `hrms_applications` (`app_code`, `app_name`, `app_description`, `app_icon`, `display_order`, `is_active`) VALUES
('ESS', 'Employee Self Service', 'Employee portal for self-service operations', 'user-circle', 1, TRUE),
('ADMIN', 'Admin Portal', 'Administrative functions and employee management', 'shield', 2, TRUE),
('PAYROLL', 'Payroll Management', 'Payroll processing and salary management', 'dollar-sign', 3, TRUE),
('TRAVEL', 'Travel Desk', 'Travel requests and expense management', 'plane', 4, TRUE),
('ATTENDANCE', 'Attendance Management', 'Attendance tracking and leave management', 'calendar-check', 5, TRUE),
('RECRUITMENT', 'Recruitment', 'Hiring and candidate management', 'users', 6, TRUE)
ON DUPLICATE KEY UPDATE app_name = VALUES(app_name);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
