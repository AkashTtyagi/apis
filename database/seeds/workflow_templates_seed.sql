/**
 * Workflow Templates Seeder
 * Pre-configured workflow templates for common use cases
 * These can be copied and customized per company
 *
 * USAGE:
 * 1. Run workflow_master_seed.sql first (if not already done)
 * 2. Run this file to create template workflow configurations
 * 3. Companies can use these as templates through the API
 *
 * NOTE: This creates templates with company_id = 0 (template marker)
 * When a company is onboarded, these templates can be copied with their company_id
 */

-- ============================================================
-- TEMPLATE 1: SIMPLE LEAVE WORKFLOW
-- Single Stage: Reporting Manager Approval
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,  -- Template marker
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'LEAVE' LIMIT 1),
    'Simple Leave Workflow (RM Only)',
    'TEMPLATE_LEAVE_SIMPLE',
    'Single stage approval by reporting manager - suitable for small teams',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @simple_leave_workflow_id = LAST_INSERT_ID();

-- Stage 1: Reporting Manager Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @simple_leave_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @simple_leave_stage1_id = LAST_INSERT_ID();

-- Approver: Reporting Manager
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES (
    @simple_leave_stage1_id, 'RM', 1, FALSE, TRUE,
    TRUE, NOW(), NOW()
);


-- ============================================================
-- TEMPLATE 2: TWO STAGE LEAVE WORKFLOW
-- Stage 1: Reporting Manager
-- Stage 2: HR Admin
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'LEAVE' LIMIT 1),
    'Standard Leave Workflow (RM + HR)',
    'TEMPLATE_LEAVE_STANDARD',
    'Two stage approval: Reporting Manager followed by HR Admin',
    FALSE, TRUE, NULL,
    NOW(), NOW()
);

SET @standard_leave_workflow_id = LAST_INSERT_ID();

-- Stage 1: Reporting Manager Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @standard_leave_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @standard_leave_stage1_id = LAST_INSERT_ID();

-- Stage 2: HR Admin Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @standard_leave_workflow_id, 'HR Admin Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 1, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @standard_leave_stage2_id = LAST_INSERT_ID();

-- Update stage 1 next stage
UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @standard_leave_stage2_id
WHERE id = @standard_leave_stage1_id;

-- Approvers
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@standard_leave_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@standard_leave_stage2_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 3: THREE STAGE LEAVE WORKFLOW (FOR EXTENDED LEAVES)
-- Stage 1: Reporting Manager
-- Stage 2: HOD (Head of Department)
-- Stage 3: HR Admin
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'LEAVE' LIMIT 1),
    'Extended Leave Workflow (RM + HOD + HR)',
    'TEMPLATE_LEAVE_EXTENDED',
    'Three stage approval for leaves > 5 days: RM, HOD, HR',
    FALSE, TRUE, NULL,
    NOW(), NOW()
);

SET @extended_leave_workflow_id = LAST_INSERT_ID();

-- Stage 1: Reporting Manager
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @extended_leave_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @extended_leave_stage1_id = LAST_INSERT_ID();

-- Stage 2: HOD Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @extended_leave_workflow_id, 'Head of Department Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 2, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @extended_leave_stage2_id = LAST_INSERT_ID();

-- Stage 3: HR Admin
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @extended_leave_workflow_id, 'HR Admin Approval', 3, 'approval', 'OR',
    TRUE, FALSE, 1, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @extended_leave_stage3_id = LAST_INSERT_ID();

-- Update stage links
UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @extended_leave_stage2_id
WHERE id = @extended_leave_stage1_id;

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @extended_leave_stage3_id
WHERE id = @extended_leave_stage2_id;

-- Approvers
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@extended_leave_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@extended_leave_stage2_id, 'HOD', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@extended_leave_stage3_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 4: AUTO-APPROVE SHORT LEAVE WORKFLOW
-- Stage 1: Auto-approve for short leaves (notification only)
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'SHORT_LEAVE' LIMIT 1),
    'Auto Approve Short Leave',
    'TEMPLATE_SHORT_LEAVE_AUTO',
    'Auto-approve short leaves with RM notification',
    TRUE, TRUE, 0,  -- Auto-approve immediately
    NOW(), NOW()
);

SET @short_leave_workflow_id = LAST_INSERT_ID();

-- Stage 1: Auto Approve + RM Notification
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @short_leave_workflow_id, 'Auto Approval + RM Notification', 1, 'notify_only', 'OR',
    FALSE, FALSE, NULL, NULL,
    'final_reject', TRUE, FALSE, FALSE,
    TRUE, NOW(), NOW()
);

SET @short_leave_stage1_id = LAST_INSERT_ID();

-- Approver: Auto Approve
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES (
    @short_leave_stage1_id, 'AUTO_APPROVE', 1, FALSE, FALSE,
    TRUE, NOW(), NOW()
);


-- ============================================================
-- TEMPLATE 5: ON DUTY REQUEST WORKFLOW
-- Stage 1: Reporting Manager
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'ONDUTY' LIMIT 1),
    'Simple On Duty Workflow (RM)',
    'TEMPLATE_ONDUTY_SIMPLE',
    'Single stage RM approval for on duty requests',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @onduty_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @onduty_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 1, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @onduty_stage1_id = LAST_INSERT_ID();

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES (
    @onduty_stage1_id, 'RM', 1, FALSE, TRUE,
    TRUE, NOW(), NOW()
);


-- ============================================================
-- TEMPLATE 6: ATTENDANCE REGULARIZATION WORKFLOW
-- Stage 1: Reporting Manager
-- Stage 2: HR Admin (for verification)
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'REGULARIZATION' LIMIT 1),
    'Standard Regularization Workflow (RM + HR)',
    'TEMPLATE_REGULARIZATION_STANDARD',
    'Two stage approval: RM for approval, HR for verification',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @regularization_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @regularization_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @regularization_stage1_id = LAST_INSERT_ID();

-- Stage 2: HR Verification
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @regularization_workflow_id, 'HR Verification', 2, 'approval', 'OR',
    TRUE, FALSE, 1, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @regularization_stage2_id = LAST_INSERT_ID();

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @regularization_stage2_id
WHERE id = @regularization_stage1_id;

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@regularization_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@regularization_stage2_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 7: WORK FROM HOME WORKFLOW
-- Stage 1: Reporting Manager
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'WFH' LIMIT 1),
    'Simple WFH Workflow (RM)',
    'TEMPLATE_WFH_SIMPLE',
    'Single stage RM approval for work from home requests',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @wfh_workflow_id = LAST_INSERT_ID();

INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @wfh_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 1, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @wfh_stage1_id = LAST_INSERT_ID();

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES (
    @wfh_stage1_id, 'RM', 1, FALSE, TRUE,
    TRUE, NOW(), NOW()
);


-- ============================================================
-- TEMPLATE 8: COMP OFF WORKFLOW
-- Stage 1: Reporting Manager
-- Stage 2: HR Admin
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'COMPOFF' LIMIT 1),
    'Standard Comp Off Workflow (RM + HR)',
    'TEMPLATE_COMPOFF_STANDARD',
    'Two stage approval for compensatory off requests',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @compoff_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @compoff_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @compoff_stage1_id = LAST_INSERT_ID();

-- Stage 2: HR Admin
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @compoff_workflow_id, 'HR Admin Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 1, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @compoff_stage2_id = LAST_INSERT_ID();

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @compoff_stage2_id
WHERE id = @compoff_stage1_id;

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@compoff_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@compoff_stage2_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 9: OVERTIME WORKFLOW
-- Stage 1: Reporting Manager
-- Stage 2: HOD (for high overtime hours)
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'OVERTIME' LIMIT 1),
    'Standard Overtime Workflow (RM + HOD)',
    'TEMPLATE_OVERTIME_STANDARD',
    'Two stage approval for overtime requests',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @overtime_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @overtime_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 2, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @overtime_stage1_id = LAST_INSERT_ID();

-- Stage 2: HOD Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @overtime_workflow_id, 'HOD Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 1, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @overtime_stage2_id = LAST_INSERT_ID();

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @overtime_stage2_id
WHERE id = @overtime_stage1_id;

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@overtime_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@overtime_stage2_id, 'HOD', 1, FALSE, TRUE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 10: RESIGNATION WORKFLOW
-- Stage 1: Reporting Manager
-- Stage 2: HOD
-- Stage 3: HR Admin (Exit formalities)
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'RESIGNATION' LIMIT 1),
    'Standard Resignation Workflow (RM + HOD + HR)',
    'TEMPLATE_RESIGNATION_STANDARD',
    'Three stage resignation approval with exit formalities',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @resignation_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @resignation_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 3, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @resignation_stage1_id = LAST_INSERT_ID();

-- Stage 2: HOD Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @resignation_workflow_id, 'HOD Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 3, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @resignation_stage2_id = LAST_INSERT_ID();

-- Stage 3: HR Exit Formalities
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @resignation_workflow_id, 'HR Exit Formalities', 3, 'approval', 'OR',
    TRUE, FALSE, 5, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @resignation_stage3_id = LAST_INSERT_ID();

-- Update stage links
UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @resignation_stage2_id
WHERE id = @resignation_stage1_id;

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @resignation_stage3_id
WHERE id = @resignation_stage2_id;

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@resignation_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@resignation_stage2_id, 'HOD', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@resignation_stage3_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 11: EXPENSE CLAIM WORKFLOW
-- Stage 1: Reporting Manager (up to limit)
-- Stage 2: HOD (for amounts above threshold)
-- Stage 3: Finance Admin
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'EXPENSE_CLAIM' LIMIT 1),
    'Standard Expense Claim Workflow',
    'TEMPLATE_EXPENSE_STANDARD',
    'Multi-stage expense claim approval with finance verification',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @expense_workflow_id = LAST_INSERT_ID();

-- Stage 1: RM Approval
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @expense_workflow_id, 'Reporting Manager Approval', 1, 'approval', 'OR',
    TRUE, FALSE, 3, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @expense_stage1_id = LAST_INSERT_ID();

-- Stage 2: HOD Approval (conditional - for high amounts)
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @expense_workflow_id, 'HOD Approval (High Amount)', 2, 'approval', 'OR',
    FALSE, TRUE, 2, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @expense_stage2_id = LAST_INSERT_ID();

-- Stage 3: Finance Admin
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @expense_workflow_id, 'Finance Verification', 3, 'approval', 'OR',
    TRUE, FALSE, 2, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @expense_stage3_id = LAST_INSERT_ID();

-- Update stage links
UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @expense_stage2_id
WHERE id = @expense_stage1_id;

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @expense_stage3_id
WHERE id = @expense_stage2_id;

INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@expense_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@expense_stage2_id, 'HOD', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@expense_stage3_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- TEMPLATE 12: PARALLEL APPROVAL WORKFLOW (DEMO)
-- Shows how multiple approvers work with AND logic
-- All approvers must approve for stage to pass
-- ============================================================
INSERT INTO hrms_workflow_config (
    company_id, workflow_master_id, workflow_name, workflow_code,
    description, is_default, is_active, auto_approve_days,
    created_at, updated_at
) VALUES (
    0,
    (SELECT id FROM hrms_workflow_master WHERE workflow_code = 'TRAVEL' LIMIT 1),
    'Parallel Approval Travel Workflow',
    'TEMPLATE_TRAVEL_PARALLEL',
    'Demonstration of parallel approval - RM AND HOD must approve',
    TRUE, TRUE, NULL,
    NOW(), NOW()
);

SET @travel_workflow_id = LAST_INSERT_ID();

-- Stage 1: Parallel Approval (RM AND HOD both must approve)
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @travel_workflow_id, 'Management Approval (RM AND HOD)', 1, 'approval', 'AND',
    TRUE, FALSE, 3, 'notify',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @travel_stage1_id = LAST_INSERT_ID();

-- Stage 2: HR Admin
INSERT INTO hrms_workflow_stages (
    workflow_config_id, stage_name, stage_order, stage_type, approver_logic,
    is_mandatory, can_skip, sla_days, pending_action,
    on_reject_action, send_email_on_assign, send_email_on_approve, send_email_on_reject,
    is_active, created_at, updated_at
) VALUES (
    @travel_workflow_id, 'HR Admin Final Approval', 2, 'approval', 'OR',
    TRUE, FALSE, 2, 'escalate',
    'final_reject', TRUE, TRUE, TRUE,
    TRUE, NOW(), NOW()
);

SET @travel_stage2_id = LAST_INSERT_ID();

UPDATE hrms_workflow_stages
SET on_approve_next_stage_id = @travel_stage2_id
WHERE id = @travel_stage1_id;

-- Multiple approvers with AND logic
INSERT INTO hrms_workflow_stage_approvers (
    stage_id, approver_type, approver_order, has_condition, allow_delegation,
    is_active, created_at, updated_at
) VALUES
    (@travel_stage1_id, 'RM', 1, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@travel_stage1_id, 'HOD', 2, FALSE, TRUE, TRUE, NOW(), NOW()),
    (@travel_stage2_id, 'HR_ADMIN', 1, FALSE, FALSE, TRUE, NOW(), NOW());


-- ============================================================
-- Summary Report
-- ============================================================
SELECT
    'WORKFLOW TEMPLATES SEEDED SUCCESSFULLY' as Status,
    COUNT(*) as Total_Templates
FROM hrms_workflow_config
WHERE company_id = 0;

SELECT
    wc.workflow_code,
    wc.workflow_name,
    wc.description,
    COUNT(ws.id) as stages_count
FROM hrms_workflow_config wc
LEFT JOIN hrms_workflow_stages ws ON ws.workflow_config_id = wc.id
WHERE wc.company_id = 0
GROUP BY wc.id, wc.workflow_code, wc.workflow_name, wc.description
ORDER BY wc.id;
