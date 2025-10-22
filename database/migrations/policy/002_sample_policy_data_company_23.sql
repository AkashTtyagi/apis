-- =====================================================
-- Sample Policy Data for Company ID 23
-- =====================================================
-- Description: Create sample policies with categories, versions, and applicability
-- Company ID: 23
-- Date: 2025-10-22
-- =====================================================

-- =====================================================
-- 1. CREATE POLICY CATEGORIES
-- =====================================================

-- HR Policies Category
INSERT INTO hrms_policy_categories (
    company_id,
    category_name,
    category_slug,
    category_description,
    display_order,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    'HR Policies',
    'hr_policies',
    'Human Resources related policies including leave, attendance, and code of conduct',
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- IT Policies Category
INSERT INTO hrms_policy_categories (
    company_id,
    category_name,
    category_slug,
    category_description,
    display_order,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    'IT Policies',
    'it_policies',
    'Information Technology and Security policies',
    2,
    1,
    1,
    NOW(),
    NOW()
);

-- Compliance Policies Category
INSERT INTO hrms_policy_categories (
    company_id,
    category_name,
    category_slug,
    category_description,
    display_order,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    'Compliance Policies',
    'compliance_policies',
    'Legal and regulatory compliance policies',
    3,
    1,
    1,
    NOW(),
    NOW()
);

-- =====================================================
-- 2. CREATE POLICIES
-- =====================================================

-- Policy 1: Leave Policy
INSERT INTO hrms_policies (
    company_id,
    category_id,
    policy_title,
    policy_slug,
    policy_description,
    current_version_number,
    requires_acknowledgment,
    force_acknowledgment,
    grace_period_days,
    send_notifications,
    notification_channels,
    reminder_frequency_days,
    effective_from,
    expires_on,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    (SELECT id FROM hrms_policy_categories WHERE company_id = 23 AND category_slug = 'hr_policies' LIMIT 1),
    'Leave Policy 2025',
    'leave_policy_2025',
    'Company leave policy including annual leave, sick leave, and special leave provisions for the year 2025',
    1,
    1,
    1,
    7,
    1,
    '["email", "in_app"]',
    3,
    '2025-01-01',
    '2025-12-31',
    1,
    1,
    NOW(),
    NOW()
);

-- Policy 2: Code of Conduct
INSERT INTO hrms_policies (
    company_id,
    category_id,
    policy_title,
    policy_slug,
    policy_description,
    current_version_number,
    requires_acknowledgment,
    force_acknowledgment,
    grace_period_days,
    send_notifications,
    notification_channels,
    reminder_frequency_days,
    effective_from,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    (SELECT id FROM hrms_policy_categories WHERE company_id = 23 AND category_slug = 'hr_policies' LIMIT 1),
    'Code of Conduct',
    'code_of_conduct',
    'Employee code of conduct outlining expected behavior, ethics, and professional standards',
    1,
    1,
    1,
    5,
    1,
    '["email", "in_app", "sms"]',
    2,
    '2025-01-01',
    1,
    1,
    NOW(),
    NOW()
);

-- Policy 3: Work From Home Policy
INSERT INTO hrms_policies (
    company_id,
    category_id,
    policy_title,
    policy_slug,
    policy_description,
    current_version_number,
    requires_acknowledgment,
    force_acknowledgment,
    grace_period_days,
    send_notifications,
    notification_channels,
    reminder_frequency_days,
    effective_from,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    (SELECT id FROM hrms_policy_categories WHERE company_id = 23 AND category_slug = 'hr_policies' LIMIT 1),
    'Work From Home Policy',
    'wfh_policy',
    'Guidelines and requirements for employees working from home',
    1,
    1,
    0,
    0,
    1,
    '["email", "in_app"]',
    3,
    '2025-01-01',
    1,
    1,
    NOW(),
    NOW()
);

-- Policy 4: Data Security Policy
INSERT INTO hrms_policies (
    company_id,
    category_id,
    policy_title,
    policy_slug,
    policy_description,
    current_version_number,
    requires_acknowledgment,
    force_acknowledgment,
    grace_period_days,
    send_notifications,
    notification_channels,
    reminder_frequency_days,
    effective_from,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    (SELECT id FROM hrms_policy_categories WHERE company_id = 23 AND category_slug = 'it_policies' LIMIT 1),
    'Data Security and Privacy Policy',
    'data_security_policy',
    'Information security policy covering data handling, password management, and privacy compliance',
    1,
    1,
    1,
    10,
    1,
    '["email", "in_app"]',
    5,
    '2025-01-01',
    1,
    1,
    NOW(),
    NOW()
);

-- Policy 5: Anti-Harassment Policy
INSERT INTO hrms_policies (
    company_id,
    category_id,
    policy_title,
    policy_slug,
    policy_description,
    current_version_number,
    requires_acknowledgment,
    force_acknowledgment,
    grace_period_days,
    send_notifications,
    notification_channels,
    reminder_frequency_days,
    effective_from,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    23,
    (SELECT id FROM hrms_policy_categories WHERE company_id = 23 AND category_slug = 'compliance_policies' LIMIT 1),
    'Anti-Harassment Policy',
    'anti_harassment_policy',
    'Zero-tolerance policy against workplace harassment and discrimination',
    1,
    1,
    1,
    3,
    1,
    '["email", "in_app", "sms"]',
    2,
    '2025-01-01',
    1,
    1,
    NOW(),
    NOW()
);

-- =====================================================
-- 3. CREATE POLICY VERSIONS (Version 1 for each policy)
-- =====================================================

-- Version for Leave Policy
INSERT INTO hrms_policy_versions (
    policy_id,
    version_number,
    version_title,
    version_description,
    policy_content,
    is_current_version,
    published_at,
    published_by,
    change_summary,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'leave_policy_2025' LIMIT 1),
    1,
    'Leave Policy 2025 - Version 1.0',
    'Initial version of leave policy for 2025',
    '<h1>Leave Policy 2025</h1>
    <h2>1. Annual Leave</h2>
    <p>Employees are entitled to 20 days of annual leave per year.</p>
    <h2>2. Sick Leave</h2>
    <p>Employees can avail up to 12 days of sick leave per year with medical certificate.</p>
    <h2>3. Special Leave</h2>
    <p>Special leave provisions for marriage, bereavement, and other exceptional circumstances.</p>',
    1,
    NOW(),
    1,
    'Initial version',
    1,
    NOW(),
    NOW()
);

-- Version for Code of Conduct
INSERT INTO hrms_policy_versions (
    policy_id,
    version_number,
    version_title,
    version_description,
    policy_content,
    is_current_version,
    published_at,
    published_by,
    change_summary,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'code_of_conduct' LIMIT 1),
    1,
    'Code of Conduct - Version 1.0',
    'Initial version of company code of conduct',
    '<h1>Code of Conduct</h1>
    <h2>1. Professional Behavior</h2>
    <p>Maintain professional conduct at all times.</p>
    <h2>2. Respect and Dignity</h2>
    <p>Treat all colleagues with respect and dignity.</p>
    <h2>3. Confidentiality</h2>
    <p>Maintain confidentiality of company information.</p>',
    1,
    NOW(),
    1,
    'Initial version',
    1,
    NOW(),
    NOW()
);

-- Version for WFH Policy
INSERT INTO hrms_policy_versions (
    policy_id,
    version_number,
    version_title,
    version_description,
    policy_content,
    is_current_version,
    published_at,
    published_by,
    change_summary,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'wfh_policy' LIMIT 1),
    1,
    'Work From Home Policy - Version 1.0',
    'Initial WFH policy',
    '<h1>Work From Home Policy</h1>
    <h2>1. Eligibility</h2>
    <p>WFH available for eligible positions with manager approval.</p>
    <h2>2. Requirements</h2>
    <p>Stable internet, dedicated workspace, and regular availability during work hours.</p>',
    1,
    NOW(),
    1,
    'Initial version',
    1,
    NOW(),
    NOW()
);

-- Version for Data Security Policy
INSERT INTO hrms_policy_versions (
    policy_id,
    version_number,
    version_title,
    version_description,
    policy_content,
    is_current_version,
    published_at,
    published_by,
    change_summary,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'data_security_policy' LIMIT 1),
    1,
    'Data Security Policy - Version 1.0',
    'Initial data security and privacy policy',
    '<h1>Data Security and Privacy Policy</h1>
    <h2>1. Data Protection</h2>
    <p>All company and customer data must be protected.</p>
    <h2>2. Password Management</h2>
    <p>Use strong passwords and change regularly.</p>
    <h2>3. Access Control</h2>
    <p>Access company data only as required for job duties.</p>',
    1,
    NOW(),
    1,
    'Initial version',
    1,
    NOW(),
    NOW()
);

-- Version for Anti-Harassment Policy
INSERT INTO hrms_policy_versions (
    policy_id,
    version_number,
    version_title,
    version_description,
    policy_content,
    is_current_version,
    published_at,
    published_by,
    change_summary,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'anti_harassment_policy' LIMIT 1),
    1,
    'Anti-Harassment Policy - Version 1.0',
    'Initial anti-harassment policy',
    '<h1>Anti-Harassment Policy</h1>
    <h2>Zero Tolerance</h2>
    <p>Company maintains zero tolerance for workplace harassment.</p>
    <h2>Reporting</h2>
    <p>Report any incidents immediately to HR.</p>
    <h2>Investigation</h2>
    <p>All complaints will be investigated promptly and confidentially.</p>',
    1,
    NOW(),
    1,
    'Initial version',
    1,
    NOW(),
    NOW()
);

-- =====================================================
-- 4. CREATE POLICY APPLICABILITY (Company-wide for all policies)
-- =====================================================

-- Applicability for Leave Policy (entire company)
INSERT INTO hrms_policy_applicability (
    policy_id,
    applicability_type,
    applicability_value,
    company_id,
    is_excluded,
    advanced_applicability_type,
    advanced_applicability_value,
    priority,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'leave_policy_2025' LIMIT 1),
    'company',
    '23',
    23,
    0,
    'none',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- Applicability for Code of Conduct (entire company)
INSERT INTO hrms_policy_applicability (
    policy_id,
    applicability_type,
    applicability_value,
    company_id,
    is_excluded,
    advanced_applicability_type,
    advanced_applicability_value,
    priority,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'code_of_conduct' LIMIT 1),
    'company',
    '23',
    23,
    0,
    'none',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- Applicability for WFH Policy (entire company)
INSERT INTO hrms_policy_applicability (
    policy_id,
    applicability_type,
    applicability_value,
    company_id,
    is_excluded,
    advanced_applicability_type,
    advanced_applicability_value,
    priority,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'wfh_policy' LIMIT 1),
    'company',
    '23',
    23,
    0,
    'none',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- Applicability for Data Security Policy (entire company)
INSERT INTO hrms_policy_applicability (
    policy_id,
    applicability_type,
    applicability_value,
    company_id,
    is_excluded,
    advanced_applicability_type,
    advanced_applicability_value,
    priority,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'data_security_policy' LIMIT 1),
    'company',
    '23',
    23,
    0,
    'none',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- Applicability for Anti-Harassment Policy (entire company)
INSERT INTO hrms_policy_applicability (
    policy_id,
    applicability_type,
    applicability_value,
    company_id,
    is_excluded,
    advanced_applicability_type,
    advanced_applicability_value,
    priority,
    is_active,
    created_by,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM hrms_policies WHERE company_id = 23 AND policy_slug = 'anti_harassment_policy' LIMIT 1),
    'company',
    '23',
    23,
    0,
    'none',
    NULL,
    1,
    1,
    1,
    NOW(),
    NOW()
);

-- =====================================================
-- SUMMARY
-- =====================================================
-- Created for Company ID: 23
--
-- 3 Categories:
--   1. HR Policies
--   2. IT Policies
--   3. Compliance Policies
--
-- 5 Policies:
--   1. Leave Policy 2025 (force_acknowledgment: YES, grace: 7 days)
--   2. Code of Conduct (force_acknowledgment: YES, grace: 5 days)
--   3. Work From Home Policy (force_acknowledgment: NO)
--   4. Data Security Policy (force_acknowledgment: YES, grace: 10 days)
--   5. Anti-Harassment Policy (force_acknowledgment: YES, grace: 3 days)
--
-- Each policy has:
--   ✓ Version 1.0 with content
--   ✓ Company-wide applicability
--   ✓ Notification settings configured
--
-- Next Steps:
-- 1. Run this SQL file
-- 2. Use Admin API to assign policies to employees
-- 3. Employees can view and acknowledge via ESS API
-- =====================================================
