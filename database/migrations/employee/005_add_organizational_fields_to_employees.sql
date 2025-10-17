-- Migration: Add organizational hierarchy fields to hrms_employees
-- Date: 2025-01-16
-- Description: Add optional organizational master fields to employee table
--              All fields are nullable (not mandatory)

ALTER TABLE hrms_employees
    ADD COLUMN cost_center_id INT NULL COMMENT 'Foreign key to hrms_cost_center_master' AFTER leave_policy_id,
    ADD COLUMN division_id INT NULL COMMENT 'Foreign key to hrms_division_master' AFTER cost_center_id,
    ADD COLUMN region_id INT NULL COMMENT 'Foreign key to hrms_region_master' AFTER division_id,
    ADD COLUMN zone_id INT NULL COMMENT 'Foreign key to hrms_zone_master' AFTER region_id,
    ADD COLUMN business_unit_id INT NULL COMMENT 'Foreign key to hrms_business_unit_master' AFTER zone_id,
    ADD COLUMN channel_id INT NULL COMMENT 'Foreign key to hrms_channel_master' AFTER business_unit_id,
    ADD COLUMN category_id INT NULL COMMENT 'Foreign key to hrms_category_master' AFTER channel_id,
    ADD COLUMN grade_id INT NULL COMMENT 'Foreign key to hrms_grades' AFTER category_id,
    ADD COLUMN branch_id INT NULL COMMENT 'Foreign key to hrms_branch_master' AFTER grade_id,
    ADD COLUMN location_id INT NULL COMMENT 'Foreign key to hrms_location_master' AFTER branch_id;

-- Add indexes for performance
ALTER TABLE hrms_employees
    ADD INDEX idx_cost_center_id (cost_center_id),
    ADD INDEX idx_division_id (division_id),
    ADD INDEX idx_region_id (region_id),
    ADD INDEX idx_zone_id (zone_id),
    ADD INDEX idx_business_unit_id (business_unit_id),
    ADD INDEX idx_channel_id (channel_id),
    ADD INDEX idx_category_id (category_id),
    ADD INDEX idx_grade_id (grade_id),
    ADD INDEX idx_branch_id (branch_id),
    ADD INDEX idx_location_id (location_id);

-- Add foreign key constraints (SET NULL on delete to keep employee records)
ALTER TABLE hrms_employees
    ADD CONSTRAINT fk_employee_cost_center FOREIGN KEY (cost_center_id)
        REFERENCES hrms_cost_center_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_division FOREIGN KEY (division_id)
        REFERENCES hrms_division_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_region FOREIGN KEY (region_id)
        REFERENCES hrms_region_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_zone FOREIGN KEY (zone_id)
        REFERENCES hrms_zone_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_business_unit FOREIGN KEY (business_unit_id)
        REFERENCES hrms_business_unit_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_channel FOREIGN KEY (channel_id)
        REFERENCES hrms_channel_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_category FOREIGN KEY (category_id)
        REFERENCES hrms_category_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_grade FOREIGN KEY (grade_id)
        REFERENCES hrms_grades (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_branch FOREIGN KEY (branch_id)
        REFERENCES hrms_branch_master (id) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_employee_location FOREIGN KEY (location_id)
        REFERENCES hrms_location_master (id) ON DELETE SET NULL ON UPDATE CASCADE;
