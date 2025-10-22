-- Migration: Add entity_id to hrms_employees table
-- Description: Add entity_id column to store generic entity reference at employee level
-- Date: 2025-10-22

-- Add entity_id column
ALTER TABLE hrms_employees
ADD COLUMN entity_id INT UNSIGNED NULL COMMENT 'Generic entity reference' AFTER company_id;

-- Add index for entity_id
ALTER TABLE hrms_employees
ADD INDEX idx_entity_id (entity_id);
