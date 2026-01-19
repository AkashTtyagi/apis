-- ============================================================================
-- Phase 1.3: Currency Management Tables
-- Description: Creates tables for currency management, exchange rates, and policies
-- Author: System
-- Date: 2025-01-19
-- ============================================================================

-- ============================================================================
-- TABLE 1: hrms_expense_currencies
-- Purpose: Supported currencies for the organization
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_currencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Currency Information
    currency_code VARCHAR(3) NOT NULL COMMENT 'ISO 4217 currency code (e.g., INR, USD, EUR)',
    currency_name VARCHAR(100) NOT NULL COMMENT 'Full currency name (e.g., Indian Rupee)',
    currency_symbol VARCHAR(10) NOT NULL COMMENT 'Currency symbol (e.g., ₹, $, €)',
    currency_symbol_position ENUM('Before', 'After') DEFAULT 'Before' COMMENT 'Symbol position relative to amount',

    -- Display Configuration
    decimal_places INT DEFAULT 2 COMMENT 'Number of decimal places (0-4)',
    decimal_separator VARCHAR(1) DEFAULT '.' COMMENT 'Decimal separator character',
    thousands_separator VARCHAR(1) DEFAULT ',' COMMENT 'Thousands separator character',

    -- Currency Role
    is_base_currency TINYINT(1) DEFAULT 0 COMMENT '1=Base/reporting currency for the company',
    is_default_expense_currency TINYINT(1) DEFAULT 0 COMMENT '1=Default currency for new expenses',

    -- Country Association (optional)
    country_id INT NULL COMMENT 'FK to hrms_countries - Primary country for this currency',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by INT NULL COMMENT 'User ID who deleted this record',

    -- Indexes
    INDEX idx_company_active (company_id, is_active),
    INDEX idx_currency_code (currency_code),
    INDEX idx_base_currency (company_id, is_base_currency),
    UNIQUE INDEX idx_company_currency (company_id, currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Supported currencies for expense management';

-- ============================================================================
-- TABLE 2: hrms_expense_exchange_rates
-- Purpose: Exchange rates for currency conversion
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_exchange_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Currency Pair
    from_currency_id INT NOT NULL COMMENT 'FK to hrms_expense_currencies - Source currency',
    to_currency_id INT NOT NULL COMMENT 'FK to hrms_expense_currencies - Target currency',

    -- Exchange Rate
    exchange_rate DECIMAL(18,8) NOT NULL COMMENT 'Conversion rate (from_currency * rate = to_currency)',

    -- Effective Period
    effective_from DATE NOT NULL COMMENT 'Rate effective from date',
    effective_to DATE NULL COMMENT 'Rate effective until date (null = current)',

    -- Rate Source
    rate_source ENUM('Manual', 'API', 'Bank') DEFAULT 'Manual' COMMENT 'How the rate was obtained',
    source_reference VARCHAR(255) NULL COMMENT 'Reference for the rate source',

    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_rate_from_currency FOREIGN KEY (from_currency_id)
        REFERENCES hrms_expense_currencies(id) ON DELETE CASCADE,
    CONSTRAINT fk_rate_to_currency FOREIGN KEY (to_currency_id)
        REFERENCES hrms_expense_currencies(id) ON DELETE CASCADE,

    -- Indexes
    INDEX idx_company (company_id),
    INDEX idx_from_currency (from_currency_id),
    INDEX idx_to_currency (to_currency_id),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_currency_pair_date (from_currency_id, to_currency_id, effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Exchange rates for currency conversion';

-- ============================================================================
-- TABLE 3: hrms_expense_currency_policy
-- Purpose: Currency conversion and rounding policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_currency_policy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies (one policy per company)',

    -- Conversion Settings
    allow_multi_currency_expenses TINYINT(1) DEFAULT 1 COMMENT '1=Allow expenses in multiple currencies',
    auto_convert_to_base TINYINT(1) DEFAULT 1 COMMENT '1=Auto convert all expenses to base currency',
    conversion_timing ENUM('Submission', 'Approval', 'Payment') DEFAULT 'Submission'
        COMMENT 'When to apply conversion',

    -- Exchange Rate Settings
    rate_tolerance_percentage DECIMAL(5,2) DEFAULT 5.00
        COMMENT 'Allowed variance from system rate (%)',
    allow_manual_rate_override TINYINT(1) DEFAULT 0
        COMMENT '1=Allow users to enter custom rate',
    require_rate_justification TINYINT(1) DEFAULT 1
        COMMENT '1=Require justification for manual rate',

    -- Rounding Settings
    rounding_method ENUM('Round', 'Floor', 'Ceiling', 'Truncate') DEFAULT 'Round'
        COMMENT 'Method for rounding converted amounts',
    rounding_precision INT DEFAULT 2 COMMENT 'Decimal places for rounding',

    -- Historical Rate Settings
    use_expense_date_rate TINYINT(1) DEFAULT 1
        COMMENT '1=Use rate from expense date, 0=Use current rate',
    fallback_to_nearest_rate TINYINT(1) DEFAULT 1
        COMMENT '1=Use nearest available rate if exact date not found',
    max_rate_age_days INT DEFAULT 7
        COMMENT 'Maximum age of rate to use (days)',

    -- Display Settings
    show_original_amount TINYINT(1) DEFAULT 1
        COMMENT '1=Show original amount alongside converted',
    show_conversion_rate TINYINT(1) DEFAULT 1
        COMMENT '1=Show applied conversion rate',

    -- Audit fields
    created_by INT NOT NULL COMMENT 'User ID who created this record',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL COMMENT 'User ID who last updated this record',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    UNIQUE INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Currency conversion and rounding policies';

-- ============================================================================
-- TABLE 4: hrms_expense_exchange_rate_history
-- Purpose: Audit log for exchange rate changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS hrms_expense_exchange_rate_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exchange_rate_id INT NOT NULL COMMENT 'FK to hrms_expense_exchange_rates',
    company_id INT NOT NULL COMMENT 'Foreign key to hrms_companies',

    -- Change Details
    action ENUM('Create', 'Update', 'Deactivate') NOT NULL COMMENT 'Type of action performed',
    old_rate DECIMAL(18,8) NULL COMMENT 'Previous exchange rate',
    new_rate DECIMAL(18,8) NULL COMMENT 'New exchange rate',
    old_effective_from DATE NULL COMMENT 'Previous effective from date',
    new_effective_from DATE NULL COMMENT 'New effective from date',
    old_effective_to DATE NULL COMMENT 'Previous effective to date',
    new_effective_to DATE NULL COMMENT 'New effective to date',

    -- Change Reason
    change_reason TEXT NULL COMMENT 'Reason for the change',

    -- Audit fields
    changed_by INT NOT NULL COMMENT 'User ID who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of the change',

    -- Indexes
    INDEX idx_exchange_rate (exchange_rate_id),
    INDEX idx_company (company_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for exchange rate changes';

-- ============================================================================
-- SAMPLE DATA (Uncomment to insert default currencies)
-- ============================================================================

/*
-- Insert common currencies for company_id = 1
INSERT INTO hrms_expense_currencies
(company_id, currency_code, currency_name, currency_symbol, currency_symbol_position,
 decimal_places, is_base_currency, is_default_expense_currency, is_active, created_by)
VALUES
(1, 'INR', 'Indian Rupee', '₹', 'Before', 2, 1, 1, 1, 1),
(1, 'USD', 'US Dollar', '$', 'Before', 2, 0, 0, 1, 1),
(1, 'EUR', 'Euro', '€', 'Before', 2, 0, 0, 1, 1),
(1, 'GBP', 'British Pound', '£', 'Before', 2, 0, 0, 1, 1),
(1, 'AED', 'UAE Dirham', 'د.إ', 'Before', 2, 0, 0, 1, 1),
(1, 'SGD', 'Singapore Dollar', 'S$', 'Before', 2, 0, 0, 1, 1),
(1, 'JPY', 'Japanese Yen', '¥', 'Before', 0, 0, 0, 1, 1),
(1, 'AUD', 'Australian Dollar', 'A$', 'Before', 2, 0, 0, 1, 1),
(1, 'CAD', 'Canadian Dollar', 'C$', 'Before', 2, 0, 0, 1, 1),
(1, 'CHF', 'Swiss Franc', 'CHF', 'Before', 2, 0, 0, 1, 1);

-- Insert exchange rates (to INR base) for company_id = 1
-- Note: Rates are approximate and for demonstration purposes
INSERT INTO hrms_expense_exchange_rates
(company_id, from_currency_id, to_currency_id, exchange_rate,
 effective_from, rate_source, is_active, created_by)
VALUES
(1, 2, 1, 83.25, '2025-01-01', 'Manual', 1, 1),   -- USD to INR
(1, 3, 1, 89.50, '2025-01-01', 'Manual', 1, 1),   -- EUR to INR
(1, 4, 1, 105.20, '2025-01-01', 'Manual', 1, 1),  -- GBP to INR
(1, 5, 1, 22.67, '2025-01-01', 'Manual', 1, 1),   -- AED to INR
(1, 6, 1, 61.85, '2025-01-01', 'Manual', 1, 1),   -- SGD to INR
(1, 7, 1, 0.5450, '2025-01-01', 'Manual', 1, 1),  -- JPY to INR
(1, 8, 1, 53.60, '2025-01-01', 'Manual', 1, 1),   -- AUD to INR
(1, 9, 1, 59.80, '2025-01-01', 'Manual', 1, 1),   -- CAD to INR
(1, 10, 1, 94.20, '2025-01-01', 'Manual', 1, 1);  -- CHF to INR

-- Insert default currency policy for company_id = 1
INSERT INTO hrms_expense_currency_policy
(company_id, allow_multi_currency_expenses, auto_convert_to_base, conversion_timing,
 rate_tolerance_percentage, allow_manual_rate_override, require_rate_justification,
 rounding_method, rounding_precision, use_expense_date_rate, fallback_to_nearest_rate,
 max_rate_age_days, show_original_amount, show_conversion_rate, created_by)
VALUES
(1, 1, 1, 'Submission', 5.00, 0, 1, 'Round', 2, 1, 1, 7, 1, 1, 1);
*/

-- ============================================================================
-- ROLLBACK SCRIPT (Use with caution)
-- ============================================================================

/*
DROP TABLE IF EXISTS hrms_expense_exchange_rate_history;
DROP TABLE IF EXISTS hrms_expense_exchange_rates;
DROP TABLE IF EXISTS hrms_expense_currency_policy;
DROP TABLE IF EXISTS hrms_expense_currencies;
*/
