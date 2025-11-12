-- =====================================================
-- MIGRATION: Create Company Add-on Modules Table
-- Version: 004
-- Description: Track additional modules purchased by companies
--              beyond their base package (NO dates required)
-- =====================================================

USE hrms_db;

-- =====================================================
-- Create hrms_company_addon_modules table
-- =====================================================

CREATE TABLE IF NOT EXISTS `hrms_company_addon_modules` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `company_id` INT NOT NULL COMMENT 'FK to hrms_companies',
    `module_id` INT UNSIGNED NOT NULL COMMENT 'FK to hrms_modules - addon module',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Active status',
    `added_by` INT NULL COMMENT 'User who added this addon',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Unique constraint: one company cannot have duplicate addon module
    CONSTRAINT `unique_company_module` UNIQUE (`company_id`, `module_id`),

    -- Foreign keys
    CONSTRAINT `fk_addon_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `hrms_companies` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_addon_module`
        FOREIGN KEY (`module_id`)
        REFERENCES `hrms_modules` (`id`)
        ON DELETE CASCADE,

    -- Indexes for performance
    INDEX `idx_company` (`company_id`),
    INDEX `idx_module` (`module_id`),
    INDEX `idx_active` (`is_active`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Add-on modules purchased by company beyond base package';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Example: Company 23 purchased PAYROLL and RECRUITMENT as add-ons
-- INSERT INTO `hrms_company_addon_modules`
--   (`company_id`, `module_id`, `is_active`, `added_by`)
-- VALUES
--   (23, 5, TRUE, 1),  -- PAYROLL addon
--   (23, 8, TRUE, 1);  -- RECRUITMENT addon

-- =====================================================
-- Migration Complete
-- =====================================================
