-- Migration: Add country_id to hrms_template_fields
-- Description: Support country-specific template fields
-- Logic: country_id = 0 means global/default fields applicable to all countries
--         country_id > 0 means country-specific fields
-- When company/entity is onboarded, both country_id = 0 AND company's country_id fields will be copied
-- Date: 2025-10-23

-- Add country_id column with default value 0
ALTER TABLE hrms_template_fields
ADD COLUMN country_id INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Country ID (0 = global/all countries, >0 = country-specific)' AFTER entity_id;

-- Update existing records: Set country_id = 0 for all existing records (make them global by default)
UPDATE hrms_template_fields
SET country_id = 0
WHERE country_id IS NULL OR country_id = 0;

-- Add index for country_id
ALTER TABLE hrms_template_fields
ADD INDEX idx_country_id (country_id);

-- Add composite index for efficient queries
ALTER TABLE hrms_template_fields
ADD INDEX idx_company_country_template (company_id, country_id, template_id);

-- Drop old unique constraint
ALTER TABLE hrms_template_fields
DROP INDEX unique_company_template_section_field;

-- Add new unique constraint including country_id
ALTER TABLE hrms_template_fields
ADD UNIQUE INDEX unique_company_country_template_section_field (company_id, country_id, template_id, section_id, field_slug);
