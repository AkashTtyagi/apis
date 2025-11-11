-- =====================================================
-- SEED: Super Admin Role Master
-- Description: Create default Super Admin role master and example setup
-- Prerequisites: Run after 002_add_super_admin_support.sql migration
-- =====================================================

USE hrms_db;

-- =====================================================
-- 1. Insert Super Admin Role Master (if not exists)
-- =====================================================

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  (NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules. Can manage everything including system settings, users, roles, and permissions.', 0, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `is_active` = TRUE;

-- =====================================================
-- 2. Example: Create Super Admin Role for a Company
-- =====================================================
-- Uncomment and modify the following if you want to create
-- super admin role for a specific company

/*
-- Get the super admin role master ID
SET @super_admin_master_id = (SELECT id FROM hrms_role_master WHERE role_code = 'SUPER_ADMIN' AND application_id IS NULL);

-- Get all active applications
SET @app_admin_id = (SELECT id FROM hrms_applications WHERE application_code = 'ADMIN' LIMIT 1);
SET @app_ess_id = (SELECT id FROM hrms_applications WHERE application_code = 'ESS' LIMIT 1);

-- Replace 100 with your company_id
SET @company_id = 100;

-- Create super admin role for Admin application
INSERT INTO `hrms_roles`
  (`company_id`, `application_id`, `role_master_id`, `role_code`, `role_name`, `role_description`, `is_super_admin`, `is_system_role`, `is_active`, `created_by`)
VALUES
  (@company_id, @app_admin_id, @super_admin_master_id, 'SUPER_ADMIN', 'Super Administrator (Admin)', 'Full access to Admin application', TRUE, TRUE, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `is_active` = TRUE;

-- Create super admin role for ESS application
INSERT INTO `hrms_roles`
  (`company_id`, `application_id`, `role_master_id`, `role_code`, `role_name`, `role_description`, `is_super_admin`, `is_system_role`, `is_active`, `created_by`)
VALUES
  (@company_id, @app_ess_id, @super_admin_master_id, 'SUPER_ADMIN', 'Super Administrator (ESS)', 'Full access to ESS application', TRUE, TRUE, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `is_active` = TRUE;
*/

-- =====================================================
-- 3. Example: Assign Super Admin Role to a User
-- =====================================================
-- Uncomment and modify the following to assign super admin
-- role to a specific user

/*
-- Get super admin role IDs for the company
SET @super_admin_role_admin = (SELECT id FROM hrms_roles WHERE company_id = @company_id AND application_id = @app_admin_id AND is_super_admin = TRUE LIMIT 1);
SET @super_admin_role_ess = (SELECT id FROM hrms_roles WHERE company_id = @company_id AND application_id = @app_ess_id AND is_super_admin = TRUE LIMIT 1);

-- Replace 1 with your user_id
SET @user_id = 1;

-- Assign super admin role for Admin application
INSERT INTO `hrms_user_roles`
  (`user_id`, `role_id`, `company_id`, `application_id`, `is_active`, `assigned_at`, `assigned_by`)
VALUES
  (@user_id, @super_admin_role_admin, @company_id, @app_admin_id, TRUE, NOW(), 1)
ON DUPLICATE KEY UPDATE
  `is_active` = TRUE,
  `assigned_at` = NOW();

-- Assign super admin role for ESS application
INSERT INTO `hrms_user_roles`
  (`user_id`, `role_id`, `company_id`, `application_id`, `is_active`, `assigned_at`, `assigned_by`)
VALUES
  (@user_id, @super_admin_role_ess, @company_id, @app_ess_id, TRUE, NOW(), 1)
ON DUPLICATE KEY UPDATE
  `is_active` = TRUE,
  `assigned_at` = NOW();
*/

-- =====================================================
-- 4. Verification Queries
-- =====================================================

-- Check super admin role master
SELECT * FROM hrms_role_master WHERE application_id IS NULL;

-- Check super admin roles for companies (uncomment if you created them)
-- SELECT * FROM hrms_roles WHERE is_super_admin = TRUE;

-- Check super admin user assignments (uncomment if you created them)
-- SELECT
--   u.email,
--   e.first_name,
--   e.last_name,
--   r.role_name,
--   a.application_name,
--   ur.assigned_at
-- FROM hrms_user_roles ur
-- INNER JOIN hrms_roles r ON ur.role_id = r.id
-- INNER JOIN hrms_user_details u ON ur.user_id = u.id
-- INNER JOIN hrms_applications a ON ur.application_id = a.id
-- LEFT JOIN hrms_employees e ON u.id = e.user_id
-- WHERE r.is_super_admin = TRUE;

-- =====================================================
-- SEED COMPLETE
-- =====================================================

-- NOTES:
-- 1. Super Admin role master has application_id = NULL
-- 2. When creating company roles from this master, roles are created for ALL applications
-- 3. Super admin users get ALL permissions on ALL menus across ALL applications
-- 4. Use the API endpoint POST /api/role-permission/roles/create-from-master with the super admin role_master_id
--    to automatically create roles for all applications
-- 5. To assign super admin to a user, use POST /api/role-permission/permissions/users/assign-role
--    with any one of the super admin role IDs - it will automatically assign across all applications
