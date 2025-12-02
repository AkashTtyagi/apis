-- Script to assign Super Admin role to User ID 23
-- Date: 2025-11-20
-- Description: Create super admin role for company 23 and assign to user 23
-- CORRECTED: Table name is hrms_role_master (SINGULAR)

-- Step 1: Check if Super Admin role master exists
SELECT id, role_code, role_name FROM hrms_role_master WHERE role_code = 'SUPER_ADMIN' LIMIT 1;

-- If not exists, create it (uncomment below):
-- INSERT INTO hrms_role_master (role_code, role_name, role_description, application_id, display_order, is_active, created_at)
-- VALUES ('SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules', NULL, 0, 1, NOW());

-- Step 2: Check if Super Admin role exists for company 23
SELECT id, company_id, role_name, is_super_admin, application_id
FROM hrms_roles
WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL;

-- Step 3: Create Super Admin role for company 23 (if not exists)
-- Get role_master_id first from step 1
SET @role_master_id = (SELECT id FROM hrms_role_master WHERE role_code = 'SUPER_ADMIN' LIMIT 1);

INSERT INTO hrms_roles (
    company_id,
    role_master_id,
    application_id,
    role_code,
    role_name,
    role_description,
    is_super_admin,
    is_active,
    created_at,
    created_by
)
SELECT
    23,
    @role_master_id,
    NULL,
    'SUPER_ADMIN',
    'Super Administrator',
    'Full system access to all applications and modules',
    1,
    1,
    NOW(),
    23
WHERE NOT EXISTS (
    SELECT 1 FROM hrms_roles
    WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
);

-- Step 4: Get the role_id
SET @super_admin_role_id = (
    SELECT id FROM hrms_roles
    WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
    LIMIT 1
);

-- Step 5: Assign Super Admin role to user 23
INSERT INTO hrms_user_roles (
    user_id,
    role_id,
    company_id,
    application_id,
    is_active,
    assigned_at,
    assigned_by,
    created_at
)
SELECT
    23,
    @super_admin_role_id,
    23,
    NULL,
    1,
    NOW(),
    23,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM hrms_user_roles
    WHERE user_id = 23 AND role_id = @super_admin_role_id AND is_active = 1
);

-- Step 6: Log audit trail
INSERT INTO hrms_role_permission_audit_log (
    company_id,
    user_id,
    action,
    entity_type,
    entity_id,
    changed_by,
    change_details,
    created_at
)
VALUES (
    23,
    23,
    'role_assigned',
    'user_role',
    (SELECT id FROM hrms_user_roles WHERE user_id = 23 AND role_id = @super_admin_role_id AND is_active = 1 LIMIT 1),
    23,
    JSON_OBJECT(
        'role_id', @super_admin_role_id,
        'role_name', 'Super Administrator',
        'application_id', NULL,
        'is_super_admin', true,
        'note', 'Super admin role - access to all applications'
    ),
    NOW()
);

-- Step 7: Verify assignment
SELECT
    u.id as user_id,
    u.email,
    r.id as role_id,
    r.role_name,
    r.is_super_admin,
    ur.application_id,
    ur.is_active,
    ur.assigned_at
FROM hrms_user_roles ur
JOIN hrms_roles r ON ur.role_id = r.id
JOIN hrms_user_details u ON ur.user_id = u.id
WHERE ur.user_id = 23 AND ur.is_active = 1;
