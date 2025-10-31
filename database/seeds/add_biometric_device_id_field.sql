-- =====================================================
-- Add Biometric Device ID Field to Employee Template
-- This field stores the client's unique biometric ID for employee
-- Used for mapping biometric attendance punches to employees
-- =====================================================

-- Get the employee template ID
SET @template_id = (SELECT id FROM hrms_templates WHERE template_slug = 'employee_template' LIMIT 1);

-- Get the Employment Details section ID
SET @section_employment = (SELECT id FROM hrms_template_sections WHERE template_id = @template_id AND section_slug = 'employment_details' LIMIT 1);

-- Add Biometric Device ID field to Employment Details section
-- This is a DIRECT field (stored in hrms_employees table)
INSERT INTO hrms_template_fields (
    company_id,
    entity_id,
    country_id,
    template_id,
    section_id,
    field_slug,
    field_label,
    field_type,
    is_required,
    max_length,
    data_type,
    placeholder,
    help_text,
    display_order,
    field_width,
    is_default_field,
    is_direct_field,
    is_active,
    created_at,
    updated_at
)
VALUES (
    NULL,                                   -- company_id (NULL for default)
    NULL,                                   -- entity_id (NULL for default)
    0,                                      -- country_id (0 = global)
    @template_id,                          -- template_id
    @section_employment,                   -- section_id
    'biometric_device_id',                 -- field_slug (matches column in hrms_employees)
    'Biometric Device ID',                 -- field_label
    'text',                                -- field_type
    0,                                     -- is_required (optional)
    100,                                   -- max_length
    'string',                              -- data_type
    'Enter biometric device ID',           -- placeholder
    'Unique biometric ID provided by client for attendance mapping', -- help_text
    99,                                    -- display_order (add at end of section)
    'half',                                -- field_width
    0,                                     -- is_default_field (not a system default)
    1,                                     -- is_direct_field (stored in hrms_employees table)
    1,                                     -- is_active
    NOW(),                                 -- created_at
    NOW()                                  -- updated_at
);

-- Verify the insert
SELECT
    id,
    field_slug,
    field_label,
    field_type,
    is_direct_field,
    section_id
FROM hrms_template_fields
WHERE field_slug = 'biometric_device_id';
