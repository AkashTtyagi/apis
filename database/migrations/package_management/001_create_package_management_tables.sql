-- =====================================================
-- Package Management System
-- Migration: Create package, module, and assignment tables
-- Date: 2025-10-23
-- =====================================================

-- =====================================================
-- 1. PACKAGES TABLE (GLOBAL)
-- Basic, Standard, Enterprise packages
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_packages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'BASIC, STANDARD, ENTERPRISE',
  `package_name` VARCHAR(100) NOT NULL COMMENT 'Package display name',
  `package_description` TEXT DEFAULT NULL,
  `price_monthly` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Monthly price',
  `price_yearly` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Yearly price',
  `max_users` INT DEFAULT NULL COMMENT 'Maximum users allowed, NULL = unlimited',
  `max_entities` INT DEFAULT NULL COMMENT 'Maximum entities allowed, NULL = unlimited',
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_package_code` (`package_code`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global packages - Basic, Standard, Enterprise';

-- =====================================================
-- 2. MODULES TABLE (GLOBAL)
-- Employee Management, Payroll, Attendance, etc.
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_modules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `module_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'EMPLOYEE, PAYROLL, ATTENDANCE',
  `module_name` VARCHAR(100) NOT NULL COMMENT 'Module display name',
  `module_description` TEXT DEFAULT NULL,
  `module_icon` VARCHAR(100) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_module_code` (`module_code`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global modules - groups of related menus';

-- =====================================================
-- 3. PACKAGE MODULE MAPPING (GLOBAL)
-- Defines which modules are included in which package
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_package_modules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `package_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_packages',
  `module_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_modules',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_package_module` (`package_id`, `module_id`),
  INDEX `idx_package_id` (`package_id`),
  INDEX `idx_module_id` (`module_id`),
  CONSTRAINT `fk_pm_package` FOREIGN KEY (`package_id`) REFERENCES `hrms_packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pm_module` FOREIGN KEY (`module_id`) REFERENCES `hrms_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps modules to packages';

-- =====================================================
-- 4. COMPANY PACKAGE ASSIGNMENT (COMPANY-SPECIFIC)
-- Assigns package to company
-- =====================================================
CREATE TABLE IF NOT EXISTS `hrms_company_packages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL COMMENT 'Company ID',
  `package_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_packages',
  `start_date` DATE NOT NULL COMMENT 'Package activation date',
  `end_date` DATE DEFAULT NULL COMMENT 'Package expiry date, NULL = lifetime',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `assigned_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_package_id` (`package_id`),
  INDEX `idx_is_active` (`is_active`),
  CONSTRAINT `fk_cp_package` FOREIGN KEY (`package_id`) REFERENCES `hrms_packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Company package assignments';

-- =====================================================
-- SEED DEFAULT PACKAGES
-- =====================================================
INSERT INTO `hrms_packages` (`package_code`, `package_name`, `package_description`, `display_order`, `is_active`) VALUES
('BASIC', 'Basic', 'Basic package with essential features', 1, TRUE),
('STANDARD', 'Standard', 'Standard package with advanced features', 2, TRUE),
('ENTERPRISE', 'Enterprise', 'Enterprise package with all features', 3, TRUE)
ON DUPLICATE KEY UPDATE package_name = VALUES(package_name);

-- =====================================================
-- SEED DEFAULT MODULES
-- =====================================================
INSERT INTO `hrms_modules` (`module_code`, `module_name`, `module_description`, `module_icon`, `display_order`, `is_active`) VALUES
('EMPLOYEE', 'Employee Management', 'Employee data and management', 'users', 1, TRUE),
('ATTENDANCE', 'Attendance', 'Attendance and leave management', 'calendar', 2, TRUE),
('PAYROLL', 'Payroll', 'Salary and payroll processing', 'dollar-sign', 3, TRUE),
('TRAVEL', 'Travel', 'Travel requests and expenses', 'plane', 4, TRUE),
('RECRUITMENT', 'Recruitment', 'Hiring and onboarding', 'user-plus', 5, TRUE),
('PERFORMANCE', 'Performance', 'Performance reviews and goals', 'star', 6, TRUE)
ON DUPLICATE KEY UPDATE module_name = VALUES(module_name);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
