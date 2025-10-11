-- =====================================================
-- Default Leave Types Seed Data
-- Insert default leave types for HRMS system
-- company_id = 0 represents system default leaves
-- =====================================================

-- Note: These are master leave types that can be cloned/customized by clients
-- When a client creates a custom leave type, they set master_id to reference these defaults

-- =====================================================
-- 1. PAID LEAVE
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit, probation_leaves_to_credit,
    round_off_credited_leaves, lapse_balance_before_next_cycle,
    can_request_half_day, can_employee_request,
    backdated_leave_allowed, days_allowed_for_backdated_leave,
    future_dated_leave_allowed,
    restrict_after_joining_period,
    max_leaves_to_carry_forward, max_carry_forward_count,
    carry_forward_method,
    is_active, created_at
) VALUES (
    NULL, 0, 'PL', 'Paid Leave',
    1, 12, 'paid', TRUE,
    'both', '0,1', 'all',
    'yearly', 1, 18.00,
    18.00, 12.00,
    TRUE, FALSE,
    TRUE, TRUE,
    FALSE, 0,
    TRUE,
    'exclude_probation_period',
    'specific', 15.00,
    'auto',
    TRUE, NOW()
);

-- =====================================================
-- 2. COMPENSATORY OFF
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit,
    can_request_half_day, can_employee_request,
    backdated_leave_allowed, future_dated_leave_allowed,
    restrict_after_joining_period,
    max_leaves_to_carry_forward, carry_forward_method,
    is_active, created_at
) VALUES (
    NULL, 0, 'COMP', 'Compensatory Off',
    1, 12, 'paid', TRUE,
    'both', '0', 'all',
    'manual', 1, 0.00,
    0.00,
    TRUE, TRUE,
    FALSE, TRUE,
    'no_restriction',
    'zero', 'manual',
    TRUE, NOW()
);

-- =====================================================
-- 3. LEAVE WITHOUT PAY (LOP)
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit, probation_leaves_to_credit, intern_leaves_to_credit, contractor_leaves_to_credit,
    can_request_half_day, can_employee_request,
    backdated_leave_allowed, days_allowed_for_backdated_leave,
    future_dated_leave_allowed,
    manager_can_apply_backdated, days_allowed_manager_backdated,
    restrict_after_joining_period,
    max_leaves_to_carry_forward, is_active, created_at
) VALUES (
    NULL, 0, 'LWP', 'Leave Without Pay',
    1, 12, 'unpaid', FALSE,
    'both', '0,1,2,3', 'all',
    'yearly', 1, 999.00,
    999.00, 999.00, 999.00, 999.00,
    TRUE, TRUE,
    TRUE, 15,
    TRUE,
    TRUE, 30,
    'no_restriction',
    'zero', TRUE, NOW()
);

-- =====================================================
-- 4. MARRIAGE LEAVE
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit,
    credit_only_married,
    can_request_half_day, can_employee_request,
    max_requests_per_tenure,
    backdated_leave_allowed, future_dated_leave_allowed,
    document_required,
    restrict_after_joining_period,
    max_leaves_to_carry_forward, is_active, created_at
) VALUES (
    NULL, 0, 'MAR', 'Marriage Leave',
    1, 12, 'paid', FALSE,
    'both', '0', 'all',
    'manual', 1, 5.00,
    5.00,
    FALSE,
    FALSE, TRUE,
    1,
    FALSE, TRUE,
    TRUE,
    'no_restriction',
    'zero', TRUE, NOW()
);

-- =====================================================
-- 5. MATERNITY LEAVE
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit, probation_leaves_to_credit,
    can_request_half_day, can_employee_request,
    backdated_leave_allowed, future_dated_leave_allowed,
    document_required, restrict_after_joining_period,
    max_leaves_to_carry_forward, is_active, created_at
) VALUES (
    NULL, 0, 'MAT', 'Maternity Leave',
    1, 12, 'paid', FALSE,
    'both', '0,1', 'female',
    'manual', 1, 180.00,
    180.00, 180.00,
    FALSE, TRUE,
    FALSE, TRUE,
    TRUE, 'no_restriction',
    'zero', TRUE, NOW()
);

-- =====================================================
-- 6. PATERNITY LEAVE
-- =====================================================
INSERT INTO hrms_leave_master (
    master_id, company_id, leave_code, leave_name,
    leave_cycle_start_month, leave_cycle_end_month, leave_type, is_encashment_allowed,
    applicable_to_esi, applicable_to_status, applicable_to_gender,
    credit_frequency, credit_day_of_month, number_of_leaves_to_credit,
    active_leaves_to_credit, probation_leaves_to_credit,
    can_request_half_day, can_employee_request,
    backdated_leave_allowed, future_dated_leave_allowed,
    document_required, restrict_after_joining_period,
    max_leaves_to_carry_forward, is_active, created_at
) VALUES (
    NULL, 0, 'PAT', 'Paternity Leave',
    1, 12, 'paid', FALSE,
    'both', '0,1', 'male',
    'manual', 1, 15.00,
    15.00, 15.00,
    FALSE, TRUE,
    FALSE, TRUE,
    TRUE, 'no_restriction',
    'zero', TRUE, NOW()
);

-- =====================================================
-- Verification Query
-- =====================================================
-- SELECT leave_code, leave_name, leave_type, applicable_to_gender, number_of_leaves_to_credit
-- FROM hrms_leave_master
-- WHERE company_id = 0
-- ORDER BY id;
