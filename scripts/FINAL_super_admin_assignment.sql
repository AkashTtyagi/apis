-- ✅ FINAL CORRECTED: Super Admin Assignment for User 23
-- Fixed: hrms_role_master (singular) and removed is_super_admin from role_master

-- Step 1: Create role master if not exists (NO is_super_admin field here)
INSERT IGNORE INTO hrms_role_master (role_code, role_name, role_description, application_id, display_order, is_active, created_at)
VALUES ('SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules', NULL, 0, 1, NOW());

-- Step 2: Check what was created
SELECT id, role_code, role_name, application_id FROM hrms_role_master WHERE role_code = 'SUPER_ADMIN';

-- Step 3: Create role for company 23 (is_super_admin field is in hrms_roles table)
INSERT INTO hrms_roles (company_id, role_master_id, application_id, role_code, role_name, role_description, is_super_admin, is_active, created_at, created_by)
SELECT 23, id, NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access', 1, 1, NOW(), 23
FROM hrms_role_master WHERE role_code = 'SUPER_ADMIN'
AND NOT EXISTS (SELECT 1 FROM hrms_roles WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL);

-- Step 4: Check what role was created
SELECT id, company_id, role_name, is_super_admin, application_id FROM hrms_roles WHERE company_id = 23 AND is_super_admin = 1;

-- Step 5: Assign to user 23
INSERT INTO hrms_user_roles (user_id, role_id, company_id, application_id, is_active, assigned_at, assigned_by, created_at)
SELECT 23, id, 23, NULL, 1, NOW(), 23, NOW()
FROM hrms_roles WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM hrms_user_roles ur
    JOIN hrms_roles r ON ur.role_id = r.id
    WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1
);

-- Step 6: FINAL VERIFICATION ✅
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
WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1;
