-- =====================================================
-- Migration: Remove Name Fields from hrms_user_details
-- Reason: Name fields moved to hrms_employees table
-- =====================================================

-- Drop the name columns from hrms_user_details table
ALTER TABLE `hrms_user_details`
  DROP COLUMN `first_name`,
  DROP COLUMN `middle_name`,
  DROP COLUMN `last_name`;

-- Add comment to table
ALTER TABLE `hrms_user_details`
COMMENT = 'User authentication and account information - personal details stored in hrms_employees';

-- =====================================================
-- Note: After running this migration:
-- - hrms_user_details stores only authentication info
-- - All personal details are in hrms_employees table
-- =====================================================
