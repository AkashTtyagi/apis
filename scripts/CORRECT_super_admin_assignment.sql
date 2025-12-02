-- ✅ CORRECT Super Admin Assignment for User 23
-- Based on actual table structures from models
-- Date: 2025-11-21

-- =============================================================================
-- TABLE STRUCTURES (Reference):
-- =============================================================================
-- hrms_role_master: id, role_code, role_name, role_description, application_id, display_order, is_active, created_by, updated_by, created_at, updated_at
-- hrms_roles: id, company_id, role_master_id, application_id, role_code, role_name, role_description, is_system_role, is_super_admin, is_active, created_by, updated_by, created_at, updated_at
-- hrms_user_roles: id, user_id, role_id, application_id, is_active, assigned_by, assigned_at, revoked_by, revoked_at, created_at, updated_at
-- hrms_role_permission_audit_log: id, company_id, entity_type, entity_id, action, old_value, new_value, changed_by, change_description, ip_address, created_at, updated_at
-- =============================================================================

-- Step 1: Check if Super Admin role master exists
SELECT id, role_code, role_name, application_id
FROM hrms_role_master
WHERE role_code = 'SUPER_ADMIN'
LIMIT 1;

-- Step 2: Create role master if not exists (NO is_super_admin field in role_master table)
INSERT IGNORE INTO hrms_role_master (
    role_code,
    role_name,
    role_description,
    application_id,
    display_order,
    is_active,
    created_at
)
VALUES (
    'SUPER_ADMIN',
    'Super Administrator',
    'Full system access to all applications and modules',
    NULL,  -- NULL = super admin
    0,
    1,
    NOW()
);

-- Step 3: Check if Super Admin role exists for company 23
SELECT id, company_id, role_code, role_name, is_super_admin, application_id
FROM hrms_roles
WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
LIMIT 1;

-- Step 4: Create Super Admin role for company 23 (if not exists)
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
    23,  -- company_id
    id,  -- role_master_id
    NULL,  -- application_id = NULL for super admin
    'SUPER_ADMIN',
    'Super Administrator',
    'Full system access to all applications and modules',
    1,  -- is_super_admin = TRUE
    1,  -- is_active
    NOW(),
    23  -- created_by
FROM hrms_role_master
WHERE role_code = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM hrms_roles
    WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
);

-- Step 5: Get the super admin role_id
SET @super_admin_role_id = (
    SELECT id FROM hrms_roles
    WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
    LIMIT 1
);

-- Step 6: Check current role assignment
SELECT ur.id, ur.user_id, ur.role_id, ur.application_id, ur.is_active, r.role_name, r.is_super_admin
FROM hrms_user_roles ur
JOIN hrms_roles r ON ur.role_id = r.id
WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1
LIMIT 1;

-- Step 7: Assign Super Admin role to user 23 (NO company_id in user_roles table!)
INSERT INTO hrms_user_roles (
    user_id,
    role_id,
    application_id,  -- NULL = super admin access to all apps
    is_active,
    assigned_by,
    assigned_at,
    created_at
)
SELECT
    23,  -- user_id
    @super_admin_role_id,  -- role_id
    NULL,  -- application_id = NULL for super admin
    1,  -- is_active
    23,  -- assigned_by
    NOW(),  -- assigned_at
    NOW()  -- created_at
WHERE @super_admin_role_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM hrms_user_roles ur
    JOIN hrms_roles r ON ur.role_id = r.id
    WHERE ur.user_id = 23
    AND r.is_super_admin = 1
    AND ur.is_active = 1
);

-- Step 8: Add audit log entry (company_id IS in audit log table)
INSERT INTO hrms_role_permission_audit_log (
    company_id,
    entity_type,
    entity_id,
    action,
    new_value,
    changed_by,
    change_description,
    created_at
)
SELECT
    23,  -- company_id
    'user_role',
    ur.id,
    'assign',
    JSON_OBJECT(
        'user_id', 23,
        'role_id', @super_admin_role_id,
        'role_name', 'Super Administrator',
        'is_super_admin', TRUE,
        'application_id', NULL
    ),
    23,  -- changed_by
    'Super admin role assigned to user 23 - full access to all applications',
    NOW()
FROM hrms_user_roles ur
WHERE ur.user_id = 23 AND ur.role_id = @super_admin_role_id AND ur.is_active = 1
LIMIT 1;

-- Step 9: FINAL VERIFICATION ✅
SELECT
    u.id AS user_id,
    u.email,
    r.id AS role_id,
    r.role_name,
    r.is_super_admin,
    r.company_id,
    ur.application_id AS user_role_app_id,
    ur.is_active,
    ur.assigned_at
FROM hrms_user_roles ur
JOIN hrms_roles r ON ur.role_id = r.id
JOIN hrms_user_details u ON ur.user_id = u.id
WHERE ur.user_id = 23
AND r.is_super_admin = 1
AND ur.is_active = 1;
