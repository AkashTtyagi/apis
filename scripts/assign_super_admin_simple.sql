-- Simple Step-by-Step Super Admin Assignment for User 23
-- Run each query separately to see results

-- STEP 1: Check if role master exists
SELECT id, role_code, role_name, is_super_admin
FROM hrms_role_masters
WHERE role_code = 'SUPER_ADMIN'
LIMIT 1;

-- If above returns empty, run this to create:
-- INSERT INTO hrms_role_masters (role_code, role_name, role_description, application_id, is_super_admin, display_order, is_active, created_at)
-- VALUES ('SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules', NULL, 1, 0, 1, NOW());

-- STEP 2: Check if super admin role exists for company 23
SELECT id, company_id, role_name, is_super_admin, application_id
FROM hrms_roles
WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
LIMIT 1;

-- If above returns empty, run this to create (replace <role_master_id> with id from Step 1):
-- INSERT INTO hrms_roles (company_id, role_master_id, application_id, role_code, role_name, role_description, is_super_admin, is_active, created_at, created_by)
-- VALUES (23, <role_master_id>, NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access', 1, 1, NOW(), 23);

-- STEP 3: Check if user already has super admin role
SELECT ur.id, ur.user_id, ur.role_id, ur.is_active, r.role_name
FROM hrms_user_roles ur
JOIN hrms_roles r ON ur.role_id = r.id
WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1
LIMIT 1;

-- If above returns empty, run this to assign (replace <role_id> with id from Step 2):
-- INSERT INTO hrms_user_roles (user_id, role_id, company_id, application_id, is_active, assigned_at, assigned_by, created_at)
-- VALUES (23, <role_id>, 23, NULL, 1, NOW(), 23, NOW());

-- STEP 4: Verify final assignment
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
