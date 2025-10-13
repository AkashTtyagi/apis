-- Workflow Master Seed Data
-- Populate default workflow types

INSERT INTO hrms_workflow_master (workflow_for_name, workflow_code, description, display_order, is_active) VALUES
('Leave', 'LEAVE', 'Leave approval workflow', 1, TRUE),
('On Duty', 'ONDUTY', 'On duty approval workflow', 2, TRUE),
('Regularization', 'REGULARIZATION', 'Attendance regularization workflow', 3, TRUE),
('Work From Home', 'WFH', 'Work from home approval workflow', 4, TRUE),
('Short Leave', 'SHORT_LEAVE', 'Short leave approval workflow', 5, TRUE),
('Comp Off', 'COMPOFF', 'Compensatory off approval workflow', 6, TRUE),
('Overtime', 'OVERTIME', 'Overtime approval workflow', 7, TRUE),
('Leave Encashment', 'LEAVE_ENCASHMENT', 'Leave encashment workflow', 8, TRUE),
('Travel Request', 'TRAVEL', 'Travel request approval workflow', 9, TRUE),
('Expense Claim', 'EXPENSE_CLAIM', 'Expense claim approval workflow', 10, TRUE),
('Asset Request', 'ASSET_REQUEST', 'Asset request workflow', 11, TRUE),
('Resignation', 'RESIGNATION', 'Resignation approval workflow', 12, TRUE),
('Loan Request', 'LOAN_REQUEST', 'Loan request workflow', 13, TRUE),
('Advance Salary', 'ADVANCE_SALARY', 'Advance salary request workflow', 14, TRUE),
('Transfer Request', 'TRANSFER_REQUEST', 'Transfer request workflow', 15, TRUE),
('Training Request', 'TRAINING_REQUEST', 'Training request workflow', 16, TRUE),
('IT Declaration', 'IT_DECLARATION', 'IT declaration workflow', 17, TRUE),
('Exit Interview', 'EXIT_INTERVIEW', 'Exit interview workflow', 18, TRUE),
('Grievance', 'GRIEVANCE', 'Grievance handling workflow', 19, TRUE),
('Performance Review', 'PERFORMANCE_REVIEW', 'Performance review workflow', 20, TRUE);
