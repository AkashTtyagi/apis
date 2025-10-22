-- Migration: Add entity_id to hrms_template_sections
-- Description: Support entity-level templates
-- Logic: company_id = entity_id means company-level template
--         company_id != entity_id means entity-specific template
-- Date: 2025-10-22

-- Add entity_id column
ALTER TABLE hrms_template_sections
ADD COLUMN entity_id INT UNSIGNED NULL COMMENT 'Entity ID (same as company_id for company-level, different for entity-specific)' AFTER company_id;

-- Update existing records: Set entity_id = company_id (make all existing templates company-level)
UPDATE hrms_template_sections
SET entity_id = company_id
WHERE entity_id IS NULL;

-- Make entity_id NOT NULL after setting values
ALTER TABLE hrms_template_sections
MODIFY COLUMN entity_id INT UNSIGNED NOT NULL;

-- Add index for entity_id
ALTER TABLE hrms_template_sections
ADD INDEX idx_entity_id (entity_id);

-- Add composite index for efficient queries
ALTER TABLE hrms_template_sections
ADD INDEX idx_company_entity_template (company_id, entity_id, template_id);
