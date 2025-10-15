-- Update Employee Type Field in Template
-- Date: 2025-10-15
-- Description: Update employment_type field to employee_type_id and change from select to master_select

-- Update the employment_type field to employee_type_id
UPDATE hrms_template_fields
SET
    field_slug = 'employee_type_id',
    field_label = 'Employee Type',
    field_type = 'master_select',
    field_options = NULL,
    master_slug = 'employee_type',
    default_value = NULL,
    updated_at = NOW()
WHERE field_slug = 'employment_type'
AND field_label = 'Employment Type';

-- Verification query (run separately to check)
-- SELECT id, field_slug, field_label, field_type, field_options, master_slug, default_value
-- FROM hrms_template_fields
-- WHERE field_slug = 'employee_type_id';
