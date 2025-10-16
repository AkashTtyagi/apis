-- Migration: Create Holiday Bank Table
-- Date: 2025-10-15
-- Description: Store all holidays that can be added to holiday policies

CREATE TABLE IF NOT EXISTS hrms_holiday_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_name VARCHAR(255) NOT NULL COMMENT 'Name of the holiday (e.g., Independence Day, Christmas)',
    holiday_date DATE NOT NULL COMMENT 'Date of the holiday',
    is_national_holiday TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=National Holiday, 0=Restricted/Optional Holiday',
    description TEXT NULL COMMENT 'Additional description about the holiday',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_by INT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_holiday_date (holiday_date),
    INDEX idx_is_national_holiday (is_national_holiday),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Bank - Master list of all holidays';
