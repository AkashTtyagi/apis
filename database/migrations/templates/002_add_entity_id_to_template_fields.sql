-- Migration: Add entity_id to hrms_template_fields
-- Description: Support entity-level template fields
-- Logic: company_id = entity_id means company-level template
--         company_id != entity_id means entity-specific template
-- Date: 2025-10-22

-- Add entity_id column
ALTER TABLE hrms_template_fields
ADD COLUMN entity_id INT UNSIGNED NULL COMMENT 'Entity ID (same as company_id for company-level, different for entity-specific)' AFTER company_id;

-- Update existing records: Set entity_id = company_id for non-null company_id (make all existing templates company-level)
UPDATE hrms_template_fields
SET entity_id = company_id
WHERE company_id IS NOT NULL AND entity_id IS NULL;

-- For default templates (company_id = NULL), keep entity_id = NULL (they will be handled separately)
-- No action needed for NULL company_id records

-- Add index for entity_id
ALTER TABLE hrms_template_fields
ADD INDEX idx_entity_id (entity_id);

-- Add composite index for efficient queries
ALTER TABLE hrms_template_fields
ADD INDEX idx_company_entity_template (company_id, entity_id, template_id);
