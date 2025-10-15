-- Migration: Add currency_id to hrms_companies table
-- Date: 2025-10-15
-- Description: Add foreign key reference to hrms_currency_master

-- Add currency_id column
ALTER TABLE hrms_companies
ADD COLUMN currency_id INT NULL COMMENT 'Foreign key to hrms_currency_master - company operating currency' AFTER country_id;

-- Create index for currency_id
CREATE INDEX idx_hrms_companies_currency_id ON hrms_companies(currency_id);
