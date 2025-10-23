-- =====================================================
-- Add Organizational Masters to Employee Template Fields
-- Date: 2025-01-16
-- Description: Add organizational hierarchy master fields to employee template
--              These are optional fields that companies can use based on their needs
-- =====================================================

-- Template ID: 1 (employee_template)
-- Section ID: 4 (employment_details)

-- =====================================================
-- ORGANIZATIONAL MASTER FIELDS
-- All fields are optional (is_required = 0) and use master_select type
-- These will be added after the existing employment fields
-- =====================================================

-- Cost Center (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'cost_center_id', 'Cost Center', 'master_select', 'cost_center',
    0, 'integer', 'Select cost center', 'Cost center for budgeting and expense tracking',
    20, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Division (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'division_id', 'Division', 'master_select', 'division',
    0, 'integer', 'Select division', 'Business division or vertical',
    21, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Region (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'region_id', 'Region', 'master_select', 'region',
    0, 'integer', 'Select region', 'Geographical region',
    22, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Zone (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'zone_id', 'Zone', 'master_select', 'zone',
    0, 'integer', 'Select zone', 'Geographical zone within region',
    23, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Business Unit (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'business_unit_id', 'Business Unit', 'master_select', 'business_unit',
    0, 'integer', 'Select business unit', 'Strategic business unit',
    24, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Channel (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'channel_id', 'Channel', 'master_select', 'channel',
    0, 'integer', 'Select channel', 'Sales or distribution channel',
    25, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Category (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'category_id', 'Category', 'master_select', 'category',
    0, 'integer', 'Select category', 'Employee category or classification',
    26, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Grade (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'grade_id', 'Grade', 'master_select', 'grade',
    0, 'integer', 'Select grade', 'Employee grade or level',
    27, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Branch (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'branch_id', 'Branch', 'master_select', 'branch',
    0, 'integer', 'Select branch', 'Office branch or location',
    28, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- Location (Direct Field - Optional)
INSERT INTO hrms_template_fields (
    company_id, template_id, section_id,
    field_slug, field_label, field_type, master_slug,
    is_required, data_type, placeholder, help_text,
    display_order, field_width,
    is_default_field, is_direct_field, is_active,
    created_at, updated_at
)
VALUES (
    NULL, 1, 4,
    'location_id', 'Location', 'master_select', 'location',
    0, 'integer', 'Select location', 'Specific work location within branch',
    29, 'half',
    1, 1, 1,
    NOW(), NOW()
);

-- =====================================================
-- Summary:
-- Added 10 organizational master fields to employee template
-- Template ID: 1 (employee_template)
-- Section ID: 4 (employment_details)
-- All fields are optional (is_required = 0)
-- All fields are direct fields (stored in hrms_employees table)
-- Field type: master_select (will fetch data from respective master tables)
-- Display order: 20-29 (after existing employment fields)
--
-- Master Fields Added:
-- 1. Cost Center (cost_center_id)
-- 2. Division (division_id)
-- 3. Region (region_id)
-- 4. Zone (zone_id)
-- 5. Business Unit (business_unit_id)
-- 6. Channel (channel_id)
-- 7. Category (category_id)
-- 8. Grade (grade_id)
-- 9. Branch (branch_id)
-- 10. Location (location_id)
-- =====================================================
