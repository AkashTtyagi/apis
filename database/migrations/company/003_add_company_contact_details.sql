-- Migration: Add company contact and address details to hrms_companies table
-- Date: 2025-10-15
-- Description: Add fields for registered address, contact details, and timezone
-- These fields are optional and updated by admin after company onboarding

-- Add registered address fields
ALTER TABLE hrms_companies
ADD COLUMN registered_address TEXT NULL COMMENT 'Registered office address' AFTER org_industry,
ADD COLUMN pin_code VARCHAR(20) NULL COMMENT 'PIN/ZIP code' AFTER registered_address,
ADD COLUMN state_id INT NULL COMMENT 'Foreign key to hrms_state_master' AFTER pin_code,
ADD COLUMN city_id INT NULL COMMENT 'Foreign key to hrms_city_master' AFTER state_id;

-- Add contact details
ALTER TABLE hrms_companies
ADD COLUMN phone_number VARCHAR(20) NULL COMMENT 'Company phone number' AFTER city_id,
ADD COLUMN fax_number VARCHAR(20) NULL COMMENT 'Company fax number' AFTER phone_number,
ADD COLUMN contact_person_id INT NULL COMMENT 'Foreign key to hrms_employees - primary contact person' AFTER fax_number;

-- Add timezone (using timezone_id that we'll add)
ALTER TABLE hrms_companies
ADD COLUMN timezone_id INT NULL COMMENT 'Foreign key to hrms_timezone_master - company timezone' AFTER contact_person_id;

-- Create indexes for foreign key fields
CREATE INDEX idx_hrms_companies_state_id ON hrms_companies(state_id);
CREATE INDEX idx_hrms_companies_city_id ON hrms_companies(city_id);
CREATE INDEX idx_hrms_companies_contact_person_id ON hrms_companies(contact_person_id);
CREATE INDEX idx_hrms_companies_timezone_id ON hrms_companies(timezone_id);
CREATE INDEX idx_hrms_companies_pin_code ON hrms_companies(pin_code);
