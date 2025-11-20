-- Migration: Add notes and updated_by columns to hrms_company_packages
-- Date: 2025-11-20
-- Description: Add notes field for additional information and updated_by field for tracking updates

-- Add notes column
ALTER TABLE hrms_company_packages
ADD COLUMN notes TEXT NULL COMMENT 'Additional notes or comments'
AFTER end_date;

-- Add updated_by column
ALTER TABLE hrms_company_packages
ADD COLUMN updated_by INT NULL COMMENT 'User ID who last updated this record'
AFTER assigned_by;
