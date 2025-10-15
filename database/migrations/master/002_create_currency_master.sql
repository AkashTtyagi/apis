-- Migration: Create Currency Master Table
-- Date: 2025-10-15
-- Description: Create table for storing all world currencies

CREATE TABLE IF NOT EXISTS hrms_currency_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE COMMENT 'ISO 4217 currency code (e.g., USD, EUR, INR)',
    currency_name VARCHAR(100) NOT NULL COMMENT 'Full currency name (e.g., US Dollar, Euro, Indian Rupee)',
    currency_symbol VARCHAR(10) NULL COMMENT 'Currency symbol (e.g., $, €, ₹)',
    country_name VARCHAR(100) NULL COMMENT 'Primary country using this currency',
    country_code VARCHAR(3) NULL COMMENT 'ISO 3166-1 alpha-3 country code',
    decimal_places TINYINT DEFAULT 2 COMMENT 'Number of decimal places (usually 2, some currencies use 0 or 3)',
    display_format VARCHAR(50) DEFAULT '{symbol}{amount}' COMMENT 'Display format template (e.g., {symbol}{amount}, {amount} {code})',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
    display_order INT DEFAULT 999 COMMENT 'Display order in dropdowns (lower = higher priority)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_currency_code (currency_code),
    INDEX idx_country_code (country_code),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master table for all world currencies';
