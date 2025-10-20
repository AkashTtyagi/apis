-- =====================================================
-- Shift Swap System - Database Migration
-- =====================================================
-- Version: 1.0
-- Created: 2025-01-20
-- Description: Employee-to-employee shift swap with workflow approval
--
-- Tables Created:
--   1. hrms_shift_swap_requests - Shift swap requests with workflow integration
-- =====================================================

-- =====================================================
-- TABLE: hrms_shift_swap_requests
-- =====================================================
-- Purpose: Employee-to-employee shift swap requests
-- Employee requests to swap shift with another employee on specific date
-- Goes through target consent and workflow approval process
--
-- Flow:
-- 1. Requester creates swap request (target_consent = 0)
-- 2. Target employee gives consent (target_consent: 0=Pending, 1=Approved, 2=Rejected)
-- 3. If approved, workflow request created
-- 4. Workflow approver approves/rejects (approval_status: 0=Pending, 1=Approved, 2=Rejected)

CREATE TABLE IF NOT EXISTS hrms_shift_swap_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,

    -- Requestor (employee who wants to swap)
    requester_employee_id INT NOT NULL COMMENT 'Employee requesting the swap',

    -- Target (employee to swap with)
    target_employee_id INT NOT NULL COMMENT 'Employee with whom swap is requested',

    -- Swap Date
    swap_date DATE NOT NULL COMMENT 'Date for which shift swap is requested',

    -- Current shifts on swap_date
    requester_current_shift_id INT NOT NULL COMMENT 'Requester current shift on swap date',
    target_current_shift_id INT NOT NULL COMMENT 'Target employee current shift on swap date',

    -- Reason
    swap_reason TEXT DEFAULT NULL COMMENT 'Reason for swap request',

    -- Target Consent (0=Pending, 1=Approved, 2=Rejected)
    target_consent TINYINT NOT NULL DEFAULT 0
        COMMENT '0=Pending consent, 1=Approved by target, 2=Rejected by target',
    target_consent_at TIMESTAMP NULL DEFAULT NULL,
    target_rejection_reason TEXT DEFAULT NULL COMMENT 'Reason if target rejects',

    -- Workflow Integration
    workflow_config_id INT DEFAULT NULL COMMENT 'Foreign key to hrms_workflow_configs',
    workflow_request_id INT DEFAULT NULL COMMENT 'Foreign key to hrms_workflow_requests',

    -- Approval Status (0=Pending, 1=Approved, 2=Rejected by workflow)
    approval_status TINYINT NOT NULL DEFAULT 0
        COMMENT '0=Pending workflow approval, 1=Approved by workflow, 2=Rejected by workflow',
    approved_by INT DEFAULT NULL COMMENT 'User who approved (from workflow)',
    approved_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL COMMENT 'Rejection reason from workflow approver',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,

    -- Audit
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,

    -- Indexes
    INDEX idx_company_id (company_id),
    INDEX idx_requester (requester_employee_id),
    INDEX idx_target (target_employee_id),
    INDEX idx_swap_date (swap_date),
    INDEX idx_approval_status (approval_status),
    INDEX idx_target_consent (target_consent),
    INDEX idx_workflow_config (workflow_config_id),
    INDEX idx_workflow_request (workflow_request_id),
    INDEX idx_is_active (is_active),

    -- Foreign Keys
    CONSTRAINT fk_swap_company FOREIGN KEY (company_id)
        REFERENCES hrms_companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_requester FOREIGN KEY (requester_employee_id)
        REFERENCES hrms_employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_target FOREIGN KEY (target_employee_id)
        REFERENCES hrms_employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_requester_shift FOREIGN KEY (requester_current_shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_target_shift FOREIGN KEY (target_current_shift_id)
        REFERENCES hrms_shift_master(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee shift swap requests with workflow approval';

-- =====================================================
-- Insert SHIFT_SWAP Workflow Master
-- =====================================================
-- Add workflow master entry for shift swap requests
-- This allows shift swap to use common workflow approval system

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
-- END OF MIGRATION
-- =====================================================
-- Migration completed successfully
--
-- Summary:
-- ✅ 1 table created for shift swap system
-- ✅ Target consent mechanism (0=Pending, 1=Approved, 2=Rejected)
-- ✅ Workflow integration for final approval
-- ✅ SHIFT_SWAP workflow master added
--
-- Flow:
-- 1. Employee creates swap request
-- 2. Target employee approves/rejects (target_consent)
-- 3. If approved, workflow request created
-- 4. Workflow approver uses common /api/workflows/approve endpoint
-- 5. On workflow approval, shift swap becomes active
--
-- Priority in shift calculation:
-- Default Shift < Rotating Shift < Roster < Shift Swap (Highest)
--
-- Next steps:
-- 1. Run this migration
-- 2. Create workflow config for SHIFT_SWAP
-- 3. Test shift swap flow
-- =====================================================
