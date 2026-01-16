-- Add Restricted Holiday Workflow Master Entry
-- workflow_master_id for restricted holiday applications

-- Insert restricted holiday workflow type (next ID after 22)
INSERT INTO hrms_workflow_master (workflow_for_name, workflow_code, description, display_order, is_active) VALUES
('Restricted Holiday', 'RESTRICTED_HOLIDAY', 'Restricted/Optional holiday request workflow', 23, TRUE)
ON DUPLICATE KEY UPDATE workflow_for_name = workflow_for_name;

-- Get the ID for restricted holiday workflow (for reference in code)
-- SELECT id FROM hrms_workflow_master WHERE workflow_code = 'RESTRICTED_HOLIDAY';

-- Note: The service uses workflow_code lookup to get the correct ID dynamically
-- This ensures compatibility across different environments
