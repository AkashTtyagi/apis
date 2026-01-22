-- =====================================================
-- Expense Settings - ALTER/DROP Script
-- Run this to update existing database
-- =====================================================

-- =====================================================
-- 1. DROP Redundant Tables
-- =====================================================
DROP TABLE IF EXISTS `hrms_expense_settings_audit_log`;
DROP TABLE IF EXISTS `hrms_expense_mileage_rates`;
DROP TABLE IF EXISTS `hrms_expense_per_diem_rates`;
DROP TABLE IF EXISTS `hrms_expense_holidays`;

-- =====================================================
-- 2. DROP Columns from hrms_expense_settings
-- (Columns that were removed during cleanup)
-- =====================================================

-- Drop expense_module_enabled (subscription controlled)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `expense_module_enabled`;

-- Drop Date/Time Settings (company level)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `fiscal_year_start_month`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `fiscal_year_start_day`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `date_format`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `time_format`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `timezone`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `week_start_day`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `working_days`;

-- Drop Mileage Settings (handled in category)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `distance_unit`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `default_mileage_rate`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `mileage_calculation_method`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `google_maps_api_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `google_maps_api_key`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_round_trip_calculation`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_daily_mileage`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_monthly_mileage`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `require_odometer_reading`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `require_route_details`;

-- Drop Per Diem Settings (handled in category)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `per_diem_calculation_method`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `per_diem_full_day_hours`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `per_diem_half_day_hours`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `per_diem_include_travel_days`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `per_diem_deduct_meals_provided`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `meal_deduction_breakfast_percent`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `meal_deduction_lunch_percent`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `meal_deduction_dinner_percent`;

-- Drop Receipt Settings (app-wide)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allowed_file_types`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_file_size_mb`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_files_per_expense`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `require_original_receipt`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `receipt_retention_days`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `auto_ocr_enabled`;

-- Drop Notification Settings (handled in workflow)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `email_notifications_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `push_notifications_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `sms_notifications_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `notify_on_submission`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `notify_on_approval`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `notify_on_rejection`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `notify_on_payment`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `pending_approval_reminder_hours`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `escalation_reminder_hours`;

-- Drop Payment Settings (handled in payroll)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `payment_cycle`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `payment_day`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `minimum_payment_amount`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `payment_consolidation`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `bank_transfer_format`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `include_tax_in_reimbursement`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `tds_applicable`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `tds_threshold`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `tds_rate`;

-- Drop Integration Settings (not needed)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `erp_integration_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `erp_system`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `erp_sync_frequency`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `accounting_integration_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `default_expense_account`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `default_liability_account`;

-- Drop UI/UX Settings (not needed)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `default_list_page_size`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `show_expense_summary_dashboard`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_draft_save`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `auto_save_interval_seconds`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `show_policy_hints`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `show_limit_warnings`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_expense_templates`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_recurring_expenses`;

-- Drop Approval Settings (handled in workflow)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `default_workflow_id`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `auto_approve_below_amount`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `auto_approve_categories`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `skip_approval_for_self`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `manager_approval_limit`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `require_budget_check`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `budget_exceed_action`;

-- Drop Submission/Policy overlap Settings (handled in policy)
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `submission_window_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `submission_window_start_day`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `submission_window_end_day`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_past_date_expense`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_past_days`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `allow_future_date_expense`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `max_future_days`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `receipt_required_threshold`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `duplicate_detection_enabled`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `duplicate_check_fields`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `duplicate_check_days`;
ALTER TABLE `hrms_expense_settings` DROP COLUMN IF EXISTS `auto_adjust_advance`;

-- =====================================================
-- Final Table Structure (17 columns):
-- - id, company_id
-- - expense_code_prefix, expense_code_format, expense_code_sequence_length, auto_generate_expense_code
-- - policy_violation_action, over_limit_action, suspicious_pattern_detection, round_amount_threshold, weekend_expense_flag, holiday_expense_flag
-- - audit_trail_enabled, audit_log_retention_days, log_all_views, log_field_changes, ip_tracking_enabled, device_tracking_enabled, geo_location_tracking
-- - is_active, created_by, created_at, updated_by, updated_at
-- =====================================================
