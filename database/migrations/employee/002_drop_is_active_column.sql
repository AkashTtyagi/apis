-- Migration: Replace is_active with is_deleted in hrms_employees table
-- Date: 2025-10-15
-- Description: Replace is_active column with is_deleted for better clarity

-- Rename is_active to is_deleted and invert logic
ALTER TABLE hrms_employees
CHANGE COLUMN is_active is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Not Deleted, 1=Deleted (Soft Delete)';
