-- =====================================================
-- Organizational Masters Migration
-- Date: 2025-01-16
-- Description: Create organizational master tables
--              Companies can use any combination based on needs
--              All are optional for employee assignment
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. COST CENTER MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_cost_center_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',
    cost_center_code VARCHAR(50) NOT NULL COMMENT 'Unique cost center code',
    cost_center_name VARCHAR(200) NOT NULL COMMENT 'Cost center name',
    description TEXT NULL,
    parent_cost_center_id INT NULL COMMENT 'Parent cost center for hierarchy',
    cost_center_head_id INT NULL COMMENT 'Employee ID of cost center head',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_cost_center_code (cost_center_code),
    INDEX idx_parent_cost_center_id (parent_cost_center_id),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_cost_center (company_id, cost_center_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. DIVISION MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_division_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    division_code VARCHAR(50) NOT NULL,
    division_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    division_head_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_division_code (division_code),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_division (company_id, division_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. REGION MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_region_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    region_code VARCHAR(50) NOT NULL,
    region_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    region_head_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_region_code (region_code),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_region (company_id, region_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. ZONE MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_zone_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    region_id INT NULL COMMENT 'Optional parent region',
    zone_code VARCHAR(50) NOT NULL,
    zone_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    zone_head_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_region_id (region_id),
    INDEX idx_zone_code (zone_code),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_zone (company_id, zone_code),

    CONSTRAINT fk_zone_region FOREIGN KEY (region_id)
        REFERENCES hrms_region_master (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. BUSINESS UNIT MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_business_unit_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    division_id INT NULL COMMENT 'Optional parent division',
    business_unit_code VARCHAR(50) NOT NULL,
    business_unit_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    business_unit_head_id INT NULL,
    cost_center_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_division_id (division_id),
    INDEX idx_cost_center_id (cost_center_id),
    INDEX idx_business_unit_code (business_unit_code),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_bu (company_id, business_unit_code),

    CONSTRAINT fk_bu_division FOREIGN KEY (division_id)
        REFERENCES hrms_division_master (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_bu_cost_center FOREIGN KEY (cost_center_id)
        REFERENCES hrms_cost_center_master (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. CHANNEL MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_channel_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    channel_code VARCHAR(50) NOT NULL,
    channel_name VARCHAR(200) NOT NULL,
    channel_type ENUM('direct', 'retail', 'online', 'partner', 'distributor', 'franchise', 'other') NULL,
    description TEXT NULL,
    channel_head_id INT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_channel_code (channel_code),
    INDEX idx_channel_type (channel_type),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_channel (company_id, channel_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. CATEGORY MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_category_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_category (company_id, category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. BRANCH MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_branch_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    region_id INT NULL,
    zone_id INT NULL,
    business_unit_id INT NULL,
    channel_id INT NULL,
    cost_center_id INT NULL,
    branch_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(200) NOT NULL,
    branch_type ENUM('head_office', 'regional_office', 'branch_office', 'warehouse', 'factory', 'retail_store', 'virtual', 'other') NOT NULL DEFAULT 'branch_office',
    description TEXT NULL,
    branch_head_id INT NULL,

    -- Address
    address_line1 VARCHAR(255) NULL,
    address_line2 VARCHAR(255) NULL,
    country_id INT UNSIGNED NULL,
    state_id INT UNSIGNED NULL,
    city_id INT UNSIGNED NULL,
    postal_code VARCHAR(20) NULL,

    -- Contact
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,

    -- GPS
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_region_id (region_id),
    INDEX idx_zone_id (zone_id),
    INDEX idx_business_unit_id (business_unit_id),
    INDEX idx_channel_id (channel_id),
    INDEX idx_cost_center_id (cost_center_id),
    INDEX idx_branch_code (branch_code),
    INDEX idx_branch_type (branch_type),
    INDEX idx_country_id (country_id),
    INDEX idx_state_id (state_id),
    INDEX idx_city_id (city_id),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_branch (company_id, branch_code),

    CONSTRAINT fk_branch_region FOREIGN KEY (region_id) REFERENCES hrms_region_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_zone FOREIGN KEY (zone_id) REFERENCES hrms_zone_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_bu FOREIGN KEY (business_unit_id) REFERENCES hrms_business_unit_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_channel FOREIGN KEY (channel_id) REFERENCES hrms_channel_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_cost_center FOREIGN KEY (cost_center_id) REFERENCES hrms_cost_center_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_country FOREIGN KEY (country_id) REFERENCES hrms_country_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_state FOREIGN KEY (state_id) REFERENCES hrms_state_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_branch_city FOREIGN KEY (city_id) REFERENCES hrms_city_master (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. LOCATION MASTER
-- =====================================================
CREATE TABLE IF NOT EXISTS hrms_location_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    branch_id INT NULL,
    location_code VARCHAR(50) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    location_type ENUM('office', 'workstation', 'meeting_room', 'production_floor', 'warehouse', 'remote', 'client_site', 'other') NOT NULL DEFAULT 'office',
    description TEXT NULL,
    capacity INT NULL,

    -- Address (if different from branch)
    address_line1 VARCHAR(255) NULL,
    address_line2 VARCHAR(255) NULL,
    country_id INT UNSIGNED NULL,
    state_id INT UNSIGNED NULL,
    city_id INT UNSIGNED NULL,
    postal_code VARCHAR(20) NULL,

    -- GPS
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_company_id (company_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_location_code (location_code),
    INDEX idx_location_type (location_type),
    INDEX idx_country_id (country_id),
    INDEX idx_state_id (state_id),
    INDEX idx_city_id (city_id),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    UNIQUE KEY unique_company_location (company_id, location_code),

    CONSTRAINT fk_location_branch FOREIGN KEY (branch_id) REFERENCES hrms_branch_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_location_country FOREIGN KEY (country_id) REFERENCES hrms_country_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_location_state FOREIGN KEY (state_id) REFERENCES hrms_state_master (id) ON DELETE SET NULL,
    CONSTRAINT fk_location_city FOREIGN KEY (city_id) REFERENCES hrms_city_master (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
