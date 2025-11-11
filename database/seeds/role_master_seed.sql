-- =====================================================
-- SEED: HRMS Role Master Data
-- Description: Populate default role masters for all applications
-- Prerequisites: Run after applications are seeded
-- =====================================================

USE hrms_db;

-- =====================================================
-- 1. Super Admin Role Master (application_id = NULL)
-- =====================================================

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  (NULL, 'SUPER_ADMIN', 'Super Administrator', 'Full system access to all applications and modules. Can manage everything including system settings, users, roles, and permissions.', 0, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `display_order` = VALUES(`display_order`),
  `is_active` = TRUE;

-- =====================================================
-- 2. ESS Application Role Masters
-- =====================================================

-- Get ESS application ID
SET @app_ess_id = (SELECT id FROM hrms_applications WHERE app_code = 'ESS' LIMIT 1);

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  -- Employee Role
  (@app_ess_id, 'EMPLOYEE', 'Employee', 'Standard employee with access to personal information, attendance, leave requests, and self-service features.', 10, TRUE, 1),

  -- Team Lead Role
  (@app_ess_id, 'TEAM_LEAD', 'Team Lead', 'Team lead with employee access plus ability to view and approve team member requests.', 20, TRUE, 1),

  -- Manager Role
  (@app_ess_id, 'MANAGER', 'Manager', 'Manager with access to team management, approvals, reporting, and performance management features.', 30, TRUE, 1),

  -- Contractor Role
  (@app_ess_id, 'CONTRACTOR', 'Contractor', 'External contractor with limited access to timesheet, documents, and personal information.', 40, TRUE, 1),

  -- Intern Role
  (@app_ess_id, 'INTERN', 'Intern', 'Intern with basic access to self-service features and learning materials.', 50, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `display_order` = VALUES(`display_order`),
  `is_active` = TRUE;

-- =====================================================
-- 3. ADMIN Application Role Masters
-- =====================================================

-- Get ADMIN application ID
SET @app_admin_id = (SELECT id FROM hrms_applications WHERE app_code = 'ADMIN' LIMIT 1);

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  -- System Admin Role
  (@app_admin_id, 'SYSTEM_ADMIN', 'System Administrator', 'Full administrative access to system configuration, user management, company settings, and all admin features.', 10, TRUE, 1),

  -- HR Admin Role
  (@app_admin_id, 'HR_ADMIN', 'HR Administrator', 'Full HR administrative access including employee management, organizational structure, policies, and HR operations.', 20, TRUE, 1),

  -- HR Manager Role
  (@app_admin_id, 'HR_MANAGER', 'HR Manager', 'HR manager with access to employee data, reports, approvals, and HR analytics.', 30, TRUE, 1),

  -- Department Head Role
  (@app_admin_id, 'DEPARTMENT_HEAD', 'Department Head', 'Department head with access to department management, budgets, and departmental reports.', 40, TRUE, 1),

  -- Recruitment Admin Role
  (@app_admin_id, 'RECRUITMENT_ADMIN', 'Recruitment Administrator', 'Manages recruitment module including job postings, candidate tracking, and hiring workflows.', 50, TRUE, 1),

  -- Training Admin Role
  (@app_admin_id, 'TRAINING_ADMIN', 'Training Administrator', 'Manages training and development module including courses, schedules, and certifications.', 60, TRUE, 1),

  -- Asset Admin Role
  (@app_admin_id, 'ASSET_ADMIN', 'Asset Administrator', 'Manages company assets including allocation, tracking, maintenance, and disposal.', 70, TRUE, 1),

  -- Document Admin Role
  (@app_admin_id, 'DOCUMENT_ADMIN', 'Document Administrator', 'Manages document repository, templates, policies, and document workflows.', 80, TRUE, 1),

  -- Admin Viewer Role
  (@app_admin_id, 'ADMIN_VIEWER', 'Admin Viewer', 'Read-only access to administrative data and reports. Cannot modify any settings or data.', 90, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `display_order` = VALUES(`display_order`),
  `is_active` = TRUE;

-- =====================================================
-- 4. PAYROLL Application Role Masters
-- =====================================================

-- Get PAYROLL application ID
SET @app_payroll_id = (SELECT id FROM hrms_applications WHERE app_code = 'PAYROLL' LIMIT 1);

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  -- Payroll Admin Role
  (@app_payroll_id, 'PAYROLL_ADMIN', 'Payroll Administrator', 'Full payroll administrative access including salary structures, payroll processing, compliance, and configuration.', 10, TRUE, 1),

  -- Payroll Manager Role
  (@app_payroll_id, 'PAYROLL_MANAGER', 'Payroll Manager', 'Manages payroll operations including approvals, reports, audits, and payroll analytics.', 20, TRUE, 1),

  -- Payroll Processor Role
  (@app_payroll_id, 'PAYROLL_PROCESSOR', 'Payroll Processor', 'Processes payroll including data entry, calculations, and payroll run execution.', 30, TRUE, 1),

  -- Finance Manager Role
  (@app_payroll_id, 'FINANCE_MANAGER', 'Finance Manager', 'Reviews and approves payroll, manages budgets, and accesses financial reports.', 40, TRUE, 1),

  -- Accountant Role
  (@app_payroll_id, 'ACCOUNTANT', 'Accountant', 'Manages accounting entries, reconciliation, and financial records related to payroll.', 50, TRUE, 1),

  -- Payroll Auditor Role
  (@app_payroll_id, 'PAYROLL_AUDITOR', 'Payroll Auditor', 'Audits payroll data, compliance, and financial accuracy. Read-only access with audit logs.', 60, TRUE, 1),

  -- Payroll Viewer Role
  (@app_payroll_id, 'PAYROLL_VIEWER', 'Payroll Viewer', 'Read-only access to payroll reports and summaries. Cannot view sensitive salary details.', 70, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `display_order` = VALUES(`display_order`),
  `is_active` = TRUE;

-- =====================================================
-- 5. TRAVEL Application Role Masters
-- =====================================================

-- Get TRAVEL application ID
SET @app_travel_id = (SELECT id FROM hrms_applications WHERE app_code = 'TRAVEL' LIMIT 1);

INSERT INTO `hrms_role_master`
  (`application_id`, `role_code`, `role_name`, `role_description`, `display_order`, `is_active`, `created_by`)
VALUES
  -- Travel Admin Role
  (@app_travel_id, 'TRAVEL_ADMIN', 'Travel Administrator', 'Full travel desk administrative access including policies, vendors, bookings, and configuration.', 10, TRUE, 1),

  -- Travel Manager Role
  (@app_travel_id, 'TRAVEL_MANAGER', 'Travel Manager', 'Manages travel operations including approvals, vendor management, and travel analytics.', 20, TRUE, 1),

  -- Travel Coordinator Role
  (@app_travel_id, 'TRAVEL_COORDINATOR', 'Travel Coordinator', 'Coordinates travel bookings, arrangements, and assists employees with travel requests.', 30, TRUE, 1),

  -- Expense Approver Role
  (@app_travel_id, 'EXPENSE_APPROVER', 'Expense Approver', 'Reviews and approves travel expenses and reimbursement requests.', 40, TRUE, 1),

  -- Travel Requester Role
  (@app_travel_id, 'TRAVEL_REQUESTER', 'Travel Requester', 'Standard employee who can create travel requests, view bookings, and submit expense claims.', 50, TRUE, 1),

  -- Travel Viewer Role
  (@app_travel_id, 'TRAVEL_VIEWER', 'Travel Viewer', 'Read-only access to travel data and reports. Cannot create or approve requests.', 60, TRUE, 1)
ON DUPLICATE KEY UPDATE
  `role_name` = VALUES(`role_name`),
  `role_description` = VALUES(`role_description`),
  `display_order` = VALUES(`display_order`),
  `is_active` = TRUE;

-- =====================================================
-- 6. Verification Queries
-- =====================================================

-- Check super admin role master
SELECT 'Super Admin Role Master:' as 'Section';
SELECT id, application_id, role_code, role_name, display_order
FROM hrms_role_master
WHERE application_id IS NULL;

-- Check ESS role masters
SELECT '' as '';
SELECT 'ESS Application Role Masters:' as 'Section';
SELECT rm.id, rm.role_code, rm.role_name, rm.display_order, a.app_name
FROM hrms_role_master rm
INNER JOIN hrms_applications a ON rm.application_id = a.id
WHERE a.app_code = 'ESS'
ORDER BY rm.display_order;

-- Check ADMIN role masters
SELECT '' as '';
SELECT 'ADMIN Application Role Masters:' as 'Section';
SELECT rm.id, rm.role_code, rm.role_name, rm.display_order, a.app_name
FROM hrms_role_master rm
INNER JOIN hrms_applications a ON rm.application_id = a.id
WHERE a.app_code = 'ADMIN'
ORDER BY rm.display_order;

-- Check PAYROLL role masters
SELECT '' as '';
SELECT 'PAYROLL Application Role Masters:' as 'Section';
SELECT rm.id, rm.role_code, rm.role_name, rm.display_order, a.app_name
FROM hrms_role_master rm
INNER JOIN hrms_applications a ON rm.application_id = a.id
WHERE a.app_code = 'PAYROLL'
ORDER BY rm.display_order;

-- Check TRAVEL role masters
SELECT '' as '';
SELECT 'TRAVEL Application Role Masters:' as 'Section';
SELECT rm.id, rm.role_code, rm.role_name, rm.display_order, a.app_name
FROM hrms_role_master rm
INNER JOIN hrms_applications a ON rm.application_id = a.id
WHERE a.app_code = 'TRAVEL'
ORDER BY rm.display_order;

-- Summary count
SELECT '' as '';
SELECT 'Summary:' as 'Section';
SELECT
  a.app_code,
  a.app_name,
  COUNT(rm.id) as role_count
FROM hrms_applications a
LEFT JOIN hrms_role_master rm ON a.id = rm.application_id
WHERE a.is_active = TRUE
GROUP BY a.app_code, a.app_name
UNION ALL
SELECT
  'SUPER_ADMIN' as app_code,
  'Super Admin (All Apps)' as app_name,
  COUNT(*) as role_count
FROM hrms_role_master
WHERE application_id IS NULL
ORDER BY app_code;

-- =====================================================
-- SEED COMPLETE
-- =====================================================

-- NOTES:
-- 1. Super Admin role (application_id = NULL) provides access to ALL applications
-- 2. Each application has specific role masters tailored to its functionality
-- 3. Use POST /api/role-permission/roles/create-from-master to create company roles
-- 4. Reporting Manager role is NOT included in ADMIN application as per requirements
-- 5. All roles can be customized per company after creation
-- 6. Display order determines the sequence in role selection dropdowns
