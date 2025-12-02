-- Quick Super Admin Assignment (Copy-Paste Each Line)

-- Line 1: Create role master if not exists
INSERT IGNORE INTO hrms_role_masters (role_code, role_name, role_description, application_id, is_super_admin, display_order, is_active, created_at)
VALUES ('SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules', NULL, 1, 0, 1, NOW());

-- Line 2: Create role for company 23 if not exists
INSERT INTO hrms_roles (company_id, role_master_id, application_id, role_code, role_name, role_description, is_super_admin, is_active, created_at, created_by)
SELECT 23, id, NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access', 1, 1, NOW(), 23
FROM hrms_role_masters WHERE role_code = 'SUPER_ADMIN'
AND NOT EXISTS (SELECT 1 FROM hrms_roles WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL);

-- Line 3: Assign to user 23
INSERT INTO hrms_user_roles (user_id, role_id, company_id, application_id, is_active, assigned_at, assigned_by, created_at)
SELECT 23, id, 23, NULL, 1, NOW(), 23, NOW()
FROM hrms_roles WHERE company_id = 23 AND is_super_admin = 1 AND application_id IS NULL
AND NOT EXISTS (SELECT 1 FROM hrms_user_roles ur JOIN hrms_roles r ON ur.role_id = r.id WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1);

-- Line 4: Verify
SELECT u.id, u.email, r.role_name, r.is_super_admin, ur.is_active
FROM hrms_user_roles ur
JOIN hrms_roles r ON ur.role_id = r.id
JOIN hrms_user_details u ON ur.user_id = u.id
WHERE ur.user_id = 23 AND r.is_super_admin = 1 AND ur.is_active = 1;



utilized 
: 29 
assign : - 30 

krni :26.5 

2.5 / 28 = per day 

1.875 = 21 days in february



promation period leave utilized :- 16.875 







Bajaj Result 4 



probation period leave utilized :- 15 


