-- Migration: Create Holiday Policy Mapping Table
-- Date: 2025-10-15
-- Description: Maps holidays from holiday bank to holiday policies

CREATE TABLE IF NOT EXISTS hrms_holiday_policy_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL COMMENT 'Foreign key to hrms_holiday_policy',
    holiday_id INT NOT NULL COMMENT 'Foreign key to hrms_holiday_bank',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_policy_id (policy_id),
    INDEX idx_holiday_id (holiday_id),
    INDEX idx_is_active (is_active),
    UNIQUE INDEX idx_policy_holiday (policy_id, holiday_id),

    CONSTRAINT fk_holiday_mapping_policy FOREIGN KEY (policy_id)
        REFERENCES hrms_holiday_policy(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_holiday_mapping_holiday FOREIGN KEY (holiday_id)
        REFERENCES hrms_holiday_bank(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Holiday Policy Mapping - Links holidays to policies';
