-- =====================================================
-- Expense Location Groups Migration
-- Creates tables for location group management
-- Run this SQL to create the expense location group tables
-- =====================================================

-- Create hrms_expense_location_groups table
CREATE TABLE IF NOT EXISTS hrms_expense_location_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,

    -- Basic Information
    group_name VARCHAR(100) NOT NULL COMMENT 'Name of the location group (e.g., Metro Cities Tier 1)',
    group_code VARCHAR(50) NOT NULL COMMENT 'Unique code for the location group',
    group_description TEXT COMMENT 'Description of the location group',

    -- Cost of Living Index
    cost_of_living_index ENUM('Low', 'Medium', 'High', 'Very High') DEFAULT 'Medium' COMMENT 'Cost of living index for expense calculations',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by INT COMMENT 'User ID who deleted this record',

    -- Indexes
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_group_code (group_code),
    UNIQUE INDEX idx_company_group_code (company_id, group_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create hrms_expense_location_group_mappings table
CREATE TABLE IF NOT EXISTS hrms_expense_location_group_mappings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_group_id INT NOT NULL COMMENT 'FK to hrms_expense_location_groups',

    -- Geographical Hierarchy (references HRMS location master)
    country_id INT COMMENT 'FK to hrms_countries',
    state_id INT COMMENT 'FK to hrms_states',
    city_id INT COMMENT 'FK to hrms_cities',
    postal_code_range VARCHAR(255) COMMENT 'Postal code range (e.g., "110001-110099" or "110001,110002,110003")',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_mapping_location_group FOREIGN KEY (location_group_id)
        REFERENCES hrms_expense_location_groups(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_location_group (location_group_id),
    INDEX idx_country (country_id),
    INDEX idx_state (state_id),
    INDEX idx_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data for Testing (Optional)
-- =====================================================

-- Uncomment below to insert sample data:
/*
INSERT INTO hrms_expense_location_groups
(company_id, group_name, group_code, group_description, cost_of_living_index, is_active, created_by)
VALUES
(1, 'Metro Cities Tier 1', 'LOC-METRO-T1', 'Major metropolitan cities with high cost of living (Delhi, Mumbai, Bangalore)', 'Very High', 1, 1),
(1, 'Metro Cities Tier 2', 'LOC-METRO-T2', 'Second tier metro cities (Pune, Hyderabad, Chennai)', 'High', 1, 1),
(1, 'Tier 2 Cities', 'LOC-TIER2', 'Tier 2 cities with moderate cost of living', 'Medium', 1, 1),
(1, 'Tier 3 Cities', 'LOC-TIER3', 'Smaller cities and towns', 'Low', 1, 1),
(1, 'International - US', 'LOC-INT-US', 'United States locations', 'Very High', 1, 1);
*/

SELECT 'Expense Location Groups tables created successfully!' AS result;
