-- =====================================================
-- Add Leave-specific columns to hrms_workflow_requests
-- =====================================================
-- Version: 1.0
-- Created: 2025-01-20
-- Description: Add leave_type, from_date, to_date columns
--
-- Purpose:
--   - leave_type: FK to hrms_leave_master (ID)
--   - from_date: Start date for leave/onduty/wfh
--   - to_date: End date for leave/onduty/wfh
-- =====================================================

-- Add columns to hrms_workflow_requests
ALTER TABLE hrms_workflow_requests
ADD COLUMN leave_type INT NULL COMMENT 'FK to hrms_leave_master (for leave workflow)',
ADD COLUMN from_date DATE NULL COMMENT 'Start date (leave/onduty/wfh)',
ADD COLUMN to_date DATE NULL COMMENT 'End date (leave/onduty/wfh)',
ADD INDEX idx_leave_type (leave_type),
ADD INDEX idx_from_date (from_date),
ADD INDEX idx_to_date (to_date);

-- Add foreign key constraint
ALTER TABLE hrms_workflow_requests
ADD CONSTRAINT fk_workflow_request_leave_type
FOREIGN KEY (leave_type)
REFERENCES hrms_leave_master(id)
ON DELETE SET NULL;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- Migration completed successfully
--
-- Summary:
-- ✅ Added leave_type (FK to hrms_leave_master)
-- ✅ Added from_date and to_date columns
-- ✅ Added indexes for performance
-- ✅ Added foreign key constraint
--
-- Usage Examples:
-- 1. Single date leave:
--    from_date = 2025-01-20, to_date = 2025-01-20
--
-- 2. Continuous leave:
--    from_date = 2025-01-20, to_date = 2025-01-25
--
-- 3. Multiple specific dates (non-continuous):
--    from_date = 2025-01-20 (first), to_date = 2025-01-30 (last)
--    Exact dates in request_data JSON: specific_dates: ['2025-01-20', '2025-01-22', '2025-01-30']
-- =====================================================
