-- Migration: Create hrms_timezone_master table
-- Date: 2025-10-15
-- Description: Master table for storing all world timezones

CREATE TABLE IF NOT EXISTS hrms_timezone_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timezone_name VARCHAR(100) NOT NULL COMMENT 'Timezone identifier (e.g., Asia/Kolkata)',
    timezone_offset VARCHAR(10) NOT NULL COMMENT 'UTC offset (e.g., +05:30, -08:00)',
    timezone_offset_minutes INT NOT NULL COMMENT 'Offset in minutes from UTC',
    country_code VARCHAR(5) NULL COMMENT 'ISO country code',
    timezone_abbr VARCHAR(10) NULL COMMENT 'Timezone abbreviation (e.g., IST, PST)',
    display_name VARCHAR(200) NOT NULL COMMENT 'Human readable timezone name',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_timezone_name (timezone_name),
    INDEX idx_country_code (country_code),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_timezone_name (timezone_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master table for timezone information';
