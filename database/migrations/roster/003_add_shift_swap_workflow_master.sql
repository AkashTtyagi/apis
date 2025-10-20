-- =====================================================
-- Add SHIFT_SWAP Workflow Master
-- =====================================================
-- Purpose: Insert workflow master for shift swap requests
-- This allows shift swap to use the common workflow approval system
-- =====================================================

INSERT INTO hrms_workflow_master (
    workflow_code,
    workflow_name,
    workflow_description,
    is_active,
    created_at,
    updated_at
) VALUES (
    'SHIFT_SWAP',
    'Shift Swap Request',
    'Employee-to-employee shift swap approval workflow',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE
    workflow_name = 'Shift Swap Request',
    workflow_description = 'Employee-to-employee shift swap approval workflow',
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the workflow master was created:
-- SELECT * FROM hrms_workflow_master WHERE workflow_code = 'SHIFT_SWAP';
-- =====================================================
