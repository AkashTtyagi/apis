-- Migration: Rename entity_id to parent_enterprise_id in hrms_companies table
-- Date: 2025-10-15
-- Description: Rename entity_id column to parent_enterprise_id for better clarity

-- Rename the column
ALTER TABLE hrms_companies
CHANGE COLUMN entity_id parent_enterprise_id INT NULL COMMENT 'Foreign key to parent enterprise (for multi-company hierarchy)';

-- Note: Index will be automatically renamed by MySQL
-- If you need to explicitly rename the index, uncomment below:
-- DROP INDEX idx_entity_id ON hrms_companies;
-- CREATE INDEX idx_parent_enterprise_id ON hrms_companies(parent_enterprise_id);
