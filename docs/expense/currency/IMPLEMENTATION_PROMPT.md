# Phase 1.3: Currency Management - Implementation Prompt

## Overview
Implement Currency Management module for the Expense Management system. This module allows admins to configure supported currencies, set exchange rates, define currency policies, and manage multi-currency expense handling for organizations with international operations.

---

## Task Description

You are implementing the **Currency Management** module for an HRMS Expense Management system. This module allows administrators to:
1. Configure supported currencies for the organization
2. Set and manage exchange rates (manual entry)
3. Define base/reporting currency
4. Configure currency policies (rounding, conversion rules)
5. Track exchange rate history for audit purposes

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Dependencies
- **None** (Independent foundation module)

---

## Database Schema

### Table 1: `hrms_expense_currencies`
Supported currencies for the organization.

```sql
CREATE TABLE hrms_expense_currencies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

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
  country_id INT COMMENT 'FK to hrms_countries - Primary country for this currency',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by INT,

  -- Indexes
  INDEX idx_company_active (company_id, is_active),
  INDEX idx_currency_code (currency_code),
  INDEX idx_base_currency (company_id, is_base_currency),
  UNIQUE INDEX idx_company_currency (company_id, currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 2: `hrms_expense_exchange_rates`
Exchange rates for currency conversion.

```sql
CREATE TABLE hrms_expense_exchange_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Currency Pair
  from_currency_id INT NOT NULL COMMENT 'FK to hrms_expense_currencies - Source currency',
  to_currency_id INT NOT NULL COMMENT 'FK to hrms_expense_currencies - Target currency',

  -- Exchange Rate
  exchange_rate DECIMAL(18,8) NOT NULL COMMENT 'Conversion rate (from_currency * rate = to_currency)',
  inverse_rate DECIMAL(18,8) COMMENT 'Inverse rate for reverse conversion',

  -- Effective Period
  effective_from DATE NOT NULL COMMENT 'Rate effective from date',
  effective_to DATE COMMENT 'Rate effective until date (null = current)',

  -- Rate Source
  rate_source ENUM('Manual', 'API', 'Bank') DEFAULT 'Manual' COMMENT 'How the rate was obtained',
  source_reference VARCHAR(255) COMMENT 'Reference for the rate source',

  -- Status
  is_active TINYINT(1) NOT NULL DEFAULT 1,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 3: `hrms_expense_currency_policy`
Currency conversion and rounding policies.

```sql
CREATE TABLE hrms_expense_currency_policy (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

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
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  UNIQUE INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Table 4: `hrms_expense_exchange_rate_history`
Audit log for exchange rate changes.

```sql
CREATE TABLE hrms_expense_exchange_rate_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exchange_rate_id INT NOT NULL COMMENT 'FK to hrms_expense_exchange_rates',
  company_id INT NOT NULL,

  -- Change Details
  action ENUM('Create', 'Update', 'Deactivate') NOT NULL,
  old_rate DECIMAL(18,8) COMMENT 'Previous exchange rate',
  new_rate DECIMAL(18,8) COMMENT 'New exchange rate',
  old_effective_from DATE,
  new_effective_from DATE,
  old_effective_to DATE,
  new_effective_to DATE,

  -- Change Reason
  change_reason TEXT COMMENT 'Reason for the change',

  -- Audit fields
  changed_by INT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_exchange_rate (exchange_rate_id),
  INDEX idx_company (company_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

### Admin APIs

#### 1. Create/Add Currency
**Endpoint:** `POST /api/expense/admin/currencies/create`

**Request Body:**
```json
{
  "currency_code": "USD",
  "currency_name": "US Dollar",
  "currency_symbol": "$",
  "currency_symbol_position": "Before",
  "decimal_places": 2,
  "decimal_separator": ".",
  "thousands_separator": ",",
  "is_base_currency": false,
  "is_default_expense_currency": false,
  "country_id": 2,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency added successfully",
  "data": {
    "id": 2,
    "currency_code": "USD",
    "currency_name": "US Dollar",
    "currency_symbol": "$",
    "is_base_currency": false,
    "is_active": true,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

**Validations:**
- currency_code must be valid 3-letter ISO 4217 code
- currency_code must be unique per company
- Only one currency can be base_currency per company
- Only one currency can be default_expense_currency per company
- decimal_places must be between 0 and 4

---

#### 2. Get All Currencies
**Endpoint:** `POST /api/expense/admin/currencies/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "Dollar",
  "limit": 50,
  "offset": 0,
  "sort_by": "currency_code",
  "sort_order": "asc"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "currency_code": "INR",
      "currency_name": "Indian Rupee",
      "currency_symbol": "₹",
      "currency_symbol_position": "Before",
      "decimal_places": 2,
      "is_base_currency": true,
      "is_default_expense_currency": true,
      "country_name": "India",
      "is_active": true,
      "exchange_rates_count": 3,
      "created_at": "2025-11-13T10:00:00.000Z"
    },
    {
      "id": 2,
      "currency_code": "USD",
      "currency_name": "US Dollar",
      "currency_symbol": "$",
      "currency_symbol_position": "Before",
      "decimal_places": 2,
      "is_base_currency": false,
      "is_default_expense_currency": false,
      "country_name": "United States",
      "is_active": true,
      "exchange_rates_count": 1,
      "latest_rate_to_base": 83.25,
      "created_at": "2025-11-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "total_pages": 1,
    "current_page": 1
  }
}
```

---

#### 3. Get Currency Details
**Endpoint:** `POST /api/expense/admin/currencies/details`

**Request Body:**
```json
{
  "currency_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "currency_code": "USD",
    "currency_name": "US Dollar",
    "currency_symbol": "$",
    "currency_symbol_position": "Before",
    "decimal_places": 2,
    "decimal_separator": ".",
    "thousands_separator": ",",
    "is_base_currency": false,
    "is_default_expense_currency": false,
    "country_id": 2,
    "country_name": "United States",
    "is_active": true,
    "current_exchange_rate": {
      "id": 1,
      "to_currency": "INR",
      "rate": 83.25,
      "effective_from": "2025-11-01",
      "rate_source": "Manual"
    },
    "recent_rates": [
      {
        "id": 1,
        "rate": 83.25,
        "effective_from": "2025-11-01",
        "effective_to": null
      },
      {
        "id": 2,
        "rate": 82.90,
        "effective_from": "2025-10-01",
        "effective_to": "2025-10-31"
      }
    ],
    "created_by": 1,
    "created_at": "2025-11-13T10:00:00.000Z",
    "updated_by": null,
    "updated_at": null
  }
}
```

---

#### 4. Update Currency
**Endpoint:** `POST /api/expense/admin/currencies/update`

**Request Body:**
```json
{
  "currency_id": 2,
  "currency_name": "United States Dollar",
  "currency_symbol_position": "Before",
  "decimal_places": 2,
  "is_default_expense_currency": true,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency updated successfully",
  "data": {
    "id": 2,
    "currency_code": "USD",
    "currency_name": "United States Dollar",
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

**Notes:**
- currency_code cannot be updated once created
- If setting is_base_currency to true, existing base currency is automatically unset
- If setting is_default_expense_currency to true, existing default is automatically unset

---

#### 5. Delete Currency
**Endpoint:** `POST /api/expense/admin/currencies/delete`

**Request Body:**
```json
{
  "currency_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency deleted successfully"
}
```

**Validations:**
- Cannot delete base currency
- Cannot delete currency if expenses exist in that currency
- Soft delete (set deleted_at, deleted_by)
- Also deactivate related exchange rates

---

#### 6. Set Base Currency
**Endpoint:** `POST /api/expense/admin/currencies/set-base`

**Request Body:**
```json
{
  "currency_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Base currency updated successfully",
  "data": {
    "base_currency": {
      "id": 1,
      "currency_code": "INR",
      "currency_name": "Indian Rupee"
    }
  }
}
```

**Notes:**
- Updates is_base_currency to true for selected currency
- Sets is_base_currency to false for previous base currency
- Recalculates all exchange rates relative to new base

---

#### 7. Add/Update Exchange Rate
**Endpoint:** `POST /api/expense/admin/currencies/exchange-rates/upsert`

**Request Body:**
```json
{
  "from_currency_id": 2,
  "to_currency_id": 1,
  "exchange_rate": 83.50,
  "effective_from": "2025-11-15",
  "effective_to": null,
  "rate_source": "Manual",
  "source_reference": "RBI Reference Rate",
  "change_reason": "Monthly rate update based on RBI reference"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rate added successfully",
  "data": {
    "id": 3,
    "from_currency": "USD",
    "to_currency": "INR",
    "exchange_rate": 83.50,
    "inverse_rate": 0.01197605,
    "effective_from": "2025-11-15",
    "effective_to": null,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

**Validations:**
- Both currencies must be active
- effective_from is required
- exchange_rate must be > 0
- Cannot have overlapping effective periods for same currency pair
- Previous rate's effective_to is auto-set when new rate is added

---

#### 8. Get Exchange Rates
**Endpoint:** `POST /api/expense/admin/currencies/exchange-rates/list`

**Request Body:**
```json
{
  "from_currency_id": 2,
  "to_currency_id": 1,
  "effective_date": "2025-11-13",
  "include_history": true,
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_rate": {
      "id": 2,
      "from_currency_code": "USD",
      "from_currency_name": "US Dollar",
      "to_currency_code": "INR",
      "to_currency_name": "Indian Rupee",
      "exchange_rate": 83.25,
      "inverse_rate": 0.01201201,
      "effective_from": "2025-11-01",
      "effective_to": null,
      "rate_source": "Manual",
      "is_active": true
    },
    "history": [
      {
        "id": 2,
        "exchange_rate": 83.25,
        "effective_from": "2025-11-01",
        "effective_to": null,
        "rate_source": "Manual",
        "created_at": "2025-11-01T10:00:00.000Z"
      },
      {
        "id": 1,
        "exchange_rate": 82.90,
        "effective_from": "2025-10-01",
        "effective_to": "2025-10-31",
        "rate_source": "Manual",
        "created_at": "2025-10-01T10:00:00.000Z"
      }
    ]
  },
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### 9. Delete Exchange Rate
**Endpoint:** `POST /api/expense/admin/currencies/exchange-rates/delete`

**Request Body:**
```json
{
  "exchange_rate_id": 3,
  "delete_reason": "Incorrect rate entry"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rate deleted successfully"
}
```

**Validations:**
- Cannot delete rate if expenses have been filed using it
- Logs deletion in history table

---

#### 10. Bulk Update Exchange Rates
**Endpoint:** `POST /api/expense/admin/currencies/exchange-rates/bulk-update`

**Request Body:**
```json
{
  "effective_from": "2025-11-15",
  "rate_source": "Manual",
  "source_reference": "Monthly bulk update",
  "rates": [
    {
      "from_currency_id": 2,
      "to_currency_id": 1,
      "exchange_rate": 83.50
    },
    {
      "from_currency_id": 3,
      "to_currency_id": 1,
      "exchange_rate": 89.75
    },
    {
      "from_currency_id": 4,
      "to_currency_id": 1,
      "exchange_rate": 105.20
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exchange rates updated successfully",
  "data": {
    "updated_count": 3,
    "rates": [
      {"from": "USD", "to": "INR", "rate": 83.50},
      {"from": "EUR", "to": "INR", "rate": 89.75},
      {"from": "GBP", "to": "INR", "rate": 105.20}
    ]
  }
}
```

---

#### 11. Get/Update Currency Policy
**Endpoint:** `POST /api/expense/admin/currencies/policy/get`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "allow_multi_currency_expenses": true,
    "auto_convert_to_base": true,
    "conversion_timing": "Submission",
    "rate_tolerance_percentage": 5.00,
    "allow_manual_rate_override": false,
    "require_rate_justification": true,
    "rounding_method": "Round",
    "rounding_precision": 2,
    "use_expense_date_rate": true,
    "fallback_to_nearest_rate": true,
    "max_rate_age_days": 7,
    "show_original_amount": true,
    "show_conversion_rate": true,
    "base_currency": {
      "id": 1,
      "code": "INR",
      "name": "Indian Rupee",
      "symbol": "₹"
    },
    "default_expense_currency": {
      "id": 1,
      "code": "INR",
      "name": "Indian Rupee",
      "symbol": "₹"
    }
  }
}
```

---

#### 12. Update Currency Policy
**Endpoint:** `POST /api/expense/admin/currencies/policy/update`

**Request Body:**
```json
{
  "allow_multi_currency_expenses": true,
  "auto_convert_to_base": true,
  "conversion_timing": "Approval",
  "rate_tolerance_percentage": 10.00,
  "allow_manual_rate_override": true,
  "require_rate_justification": true,
  "rounding_method": "Round",
  "rounding_precision": 2,
  "use_expense_date_rate": true,
  "max_rate_age_days": 14
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency policy updated successfully",
  "data": {
    "id": 1,
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

---

#### 13. Convert Amount
**Endpoint:** `POST /api/expense/admin/currencies/convert`

**Request Body:**
```json
{
  "amount": 1000,
  "from_currency_id": 2,
  "to_currency_id": 1,
  "conversion_date": "2025-11-13"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original_amount": 1000,
    "original_currency": "USD",
    "converted_amount": 83250.00,
    "target_currency": "INR",
    "exchange_rate": 83.25,
    "rate_date": "2025-11-01",
    "rate_source": "Manual"
  }
}
```

---

#### 14. Get Currency Dropdown Data
**Endpoint:** `POST /api/expense/admin/currencies/dropdown`

**Request Body:**
```json
{
  "include_inactive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currencies": [
      {
        "id": 1,
        "code": "INR",
        "name": "Indian Rupee",
        "symbol": "₹",
        "is_base": true,
        "is_default": true
      },
      {
        "id": 2,
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$",
        "is_base": false,
        "is_default": false
      }
    ],
    "symbol_positions": [
      {"value": "Before", "label": "Before Amount ($100)"},
      {"value": "After", "label": "After Amount (100$)"}
    ],
    "rounding_methods": [
      {"value": "Round", "label": "Round (Standard)"},
      {"value": "Floor", "label": "Floor (Round Down)"},
      {"value": "Ceiling", "label": "Ceiling (Round Up)"},
      {"value": "Truncate", "label": "Truncate (Cut Off)"}
    ],
    "conversion_timings": [
      {"value": "Submission", "label": "At Submission"},
      {"value": "Approval", "label": "At Approval"},
      {"value": "Payment", "label": "At Payment"}
    ],
    "rate_sources": [
      {"value": "Manual", "label": "Manual Entry"},
      {"value": "API", "label": "External API"},
      {"value": "Bank", "label": "Bank Rate"}
    ]
  }
}
```

---

#### 15. Get Exchange Rate History (Audit)
**Endpoint:** `POST /api/expense/admin/currencies/exchange-rates/history`

**Request Body:**
```json
{
  "exchange_rate_id": 2,
  "from_date": "2025-10-01",
  "to_date": "2025-11-30",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "Create",
      "old_rate": null,
      "new_rate": 82.90,
      "old_effective_from": null,
      "new_effective_from": "2025-10-01",
      "change_reason": "Initial rate setup",
      "changed_by_name": "Admin User",
      "changed_at": "2025-10-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "action": "Update",
      "old_rate": 82.90,
      "new_rate": 83.25,
      "old_effective_from": "2025-10-01",
      "new_effective_from": "2025-11-01",
      "change_reason": "Monthly rate revision",
      "changed_by_name": "Admin User",
      "changed_at": "2025-11-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── index.js (add new exports)
│       ├── ExpenseLocationGroup.js (existing)
│       ├── ExpenseLocationGroupMapping.js (existing)
│       ├── ExpenseCategory.js (Phase 1.2)
│       ├── ExpenseCurrency.js (new)
│       ├── ExpenseExchangeRate.js (new)
│       ├── ExpenseCurrencyPolicy.js (new)
│       └── ExpenseExchangeRateHistory.js (new)
│
└── microservices/
    └── expense/
        ├── controllers/
        │   └── admin/
        │       ├── locationGroup.controller.js (existing)
        │       ├── expenseCategory.controller.js (Phase 1.2)
        │       └── currency.controller.js (new)
        ├── services/
        │   ├── locationGroup.service.js (existing)
        │   ├── expenseCategory.service.js (Phase 1.2)
        │   └── currency.service.js (new)
        └── routes/
            └── admin.expense.routes.js (update with new routes)
```

---

## Implementation Steps

### Step 1: Create Sequelize Models (Day 1)

**File:** `src/models/expense/ExpenseCurrency.js`
- Currency master with ISO code, symbol, display settings
- Flags for base currency and default currency

**File:** `src/models/expense/ExpenseExchangeRate.js`
- Exchange rates with effective dates
- Currency pair associations

**File:** `src/models/expense/ExpenseCurrencyPolicy.js`
- Company-wide currency policy settings
- One record per company

**File:** `src/models/expense/ExpenseExchangeRateHistory.js`
- Audit log for rate changes

**Define Associations:**
```javascript
// Currency -> Exchange Rates (as from_currency)
ExpenseCurrency.hasMany(ExpenseExchangeRate, {
  foreignKey: 'from_currency_id',
  as: 'ratesFrom'
});

// Currency -> Exchange Rates (as to_currency)
ExpenseCurrency.hasMany(ExpenseExchangeRate, {
  foreignKey: 'to_currency_id',
  as: 'ratesTo'
});

// Exchange Rate -> From Currency
ExpenseExchangeRate.belongsTo(ExpenseCurrency, {
  foreignKey: 'from_currency_id',
  as: 'fromCurrency'
});

// Exchange Rate -> To Currency
ExpenseExchangeRate.belongsTo(ExpenseCurrency, {
  foreignKey: 'to_currency_id',
  as: 'toCurrency'
});

// Exchange Rate -> History
ExpenseExchangeRate.hasMany(ExpenseExchangeRateHistory, {
  foreignKey: 'exchange_rate_id',
  as: 'history'
});

// Currency -> Country (optional)
ExpenseCurrency.belongsTo(HrmsCountryMaster, {
  foreignKey: 'country_id',
  as: 'country'
});
```

---

### Step 2: Create Service Layer (Day 1-2)

**File:** `src/microservices/expense/services/currency.service.js`

Implement all business logic:
- `createCurrency` - Add new currency
- `getAllCurrencies` - Get currencies with filters
- `getCurrencyDetails` - Get full details with rates
- `updateCurrency` - Update currency settings
- `deleteCurrency` - Soft delete with validations
- `setBaseCurrency` - Update base currency
- `upsertExchangeRate` - Add/update exchange rate
- `getExchangeRates` - Get rates with history
- `deleteExchangeRate` - Delete rate with audit
- `bulkUpdateRates` - Bulk rate update
- `getCurrencyPolicy` - Get policy settings
- `updateCurrencyPolicy` - Update policy
- `convertAmount` - Convert between currencies
- `getDropdownData` - Get all dropdown options
- `getExchangeRateHistory` - Get audit history

**Helper Functions:**
- `getEffectiveRate(fromCurrencyId, toCurrencyId, date)` - Get rate for specific date
- `calculateInverseRate(rate)` - Calculate inverse
- `applyRounding(amount, method, precision)` - Apply rounding
- `logRateChange(rateId, action, oldData, newData, reason, userId)` - Audit logging

---

### Step 3: Create Controller (Day 2)

**File:** `src/microservices/expense/controllers/admin/currency.controller.js`

Implement all controller methods following thin controller pattern:
- `createCurrency`
- `getAllCurrencies`
- `getCurrencyDetails`
- `updateCurrency`
- `deleteCurrency`
- `setBaseCurrency`
- `upsertExchangeRate`
- `getExchangeRates`
- `deleteExchangeRate`
- `bulkUpdateRates`
- `getCurrencyPolicy`
- `updateCurrencyPolicy`
- `convertAmount`
- `getDropdownData`
- `getExchangeRateHistory`

---

### Step 4: Update Routes (Day 2)

**File:** `src/microservices/expense/routes/admin.expense.routes.js`

Add new routes:
```javascript
// Currency Management
router.post('/currencies/create', currencyController.createCurrency);
router.post('/currencies/list', currencyController.getAllCurrencies);
router.post('/currencies/details', currencyController.getCurrencyDetails);
router.post('/currencies/update', currencyController.updateCurrency);
router.post('/currencies/delete', currencyController.deleteCurrency);
router.post('/currencies/set-base', currencyController.setBaseCurrency);
router.post('/currencies/dropdown', currencyController.getDropdownData);

// Exchange Rates
router.post('/currencies/exchange-rates/upsert', currencyController.upsertExchangeRate);
router.post('/currencies/exchange-rates/list', currencyController.getExchangeRates);
router.post('/currencies/exchange-rates/delete', currencyController.deleteExchangeRate);
router.post('/currencies/exchange-rates/bulk-update', currencyController.bulkUpdateRates);
router.post('/currencies/exchange-rates/history', currencyController.getExchangeRateHistory);

// Currency Policy
router.post('/currencies/policy/get', currencyController.getCurrencyPolicy);
router.post('/currencies/policy/update', currencyController.updateCurrencyPolicy);

// Conversion
router.post('/currencies/convert', currencyController.convertAmount);
```

---

### Step 5: Create SQL Migration (Day 2-3)

**File:** `scripts/sql/expense/003_create_currencies.sql`

- Create all four tables with proper indexes
- Add foreign key constraints
- Insert default currencies (INR, USD, EUR, GBP, etc.)
- Insert default currency policy

---

### Step 6: Testing (Day 3)

#### Test Cases:

**Currency CRUD:**
1. Create currency with valid data
2. Create currency with duplicate code (should fail)
3. Get all currencies with filters
4. Get currency details with rates
5. Update currency settings
6. Delete currency without expenses
7. Delete currency with expenses (should fail)
8. Delete base currency (should fail)
9. Set new base currency

**Exchange Rates:**
10. Add new exchange rate
11. Update existing rate (auto-close previous)
12. Get current rate for currency pair
13. Get rate for specific date
14. Delete unused rate
15. Bulk update rates

**Currency Policy:**
16. Get currency policy
17. Update policy settings
18. Test conversion with different rounding methods

**Conversion:**
19. Convert amount using current rate
20. Convert using historical rate
21. Convert when no rate available (should fail/warn)
22. Test rate tolerance validation

---

## Integration Points

### HRMS Tables Used:
1. `hrms_company` - For company_id filtering
2. `hrms_users` - For created_by, updated_by
3. `hrms_countries` - For country association with currency

### Future Integration:
- Expense filing will use currency_id
- Payments will use conversion for bank transfers
- Reports will show multi-currency breakdowns

---

## Success Criteria

### Technical:
- All APIs working with proper validation
- Database schema with proper indexes
- Sequelize models with associations
- Transaction support for complex operations
- Audit trail for rate changes
- Error handling and proper status codes

### Functional:
- Admin can configure multiple currencies
- Admin can manage exchange rates with history
- Only one base currency per company
- Rates have effective date periods
- Conversion utility function works correctly
- Currency policy applies to conversions

---

## Sample Data for Testing

```sql
-- Insert common currencies
INSERT INTO hrms_expense_currencies
(company_id, currency_code, currency_name, currency_symbol, currency_symbol_position,
 decimal_places, is_base_currency, is_default_expense_currency, is_active, created_by)
VALUES
(1, 'INR', 'Indian Rupee', '₹', 'Before', 2, 1, 1, 1, 1),
(1, 'USD', 'US Dollar', '$', 'Before', 2, 0, 0, 1, 1),
(1, 'EUR', 'Euro', '€', 'Before', 2, 0, 0, 1, 1),
(1, 'GBP', 'British Pound', '£', 'Before', 2, 0, 0, 1, 1),
(1, 'AED', 'UAE Dirham', 'د.إ', 'Before', 2, 0, 0, 1, 1),
(1, 'SGD', 'Singapore Dollar', 'S$', 'Before', 2, 0, 0, 1, 1);

-- Insert exchange rates (to INR base)
INSERT INTO hrms_expense_exchange_rates
(company_id, from_currency_id, to_currency_id, exchange_rate, inverse_rate,
 effective_from, rate_source, is_active, created_by)
VALUES
(1, 2, 1, 83.25, 0.01201201, '2025-11-01', 'Manual', 1, 1),
(1, 3, 1, 89.50, 0.01117318, '2025-11-01', 'Manual', 1, 1),
(1, 4, 1, 105.20, 0.00950570, '2025-11-01', 'Manual', 1, 1),
(1, 5, 1, 22.67, 0.04411117, '2025-11-01', 'Manual', 1, 1),
(1, 6, 1, 61.85, 0.01616815, '2025-11-01', 'Manual', 1, 1);

-- Insert default currency policy
INSERT INTO hrms_expense_currency_policy
(company_id, allow_multi_currency_expenses, auto_convert_to_base, conversion_timing,
 rate_tolerance_percentage, rounding_method, rounding_precision, use_expense_date_rate,
 fallback_to_nearest_rate, max_rate_age_days, show_original_amount, show_conversion_rate,
 created_by)
VALUES
(1, 1, 1, 'Submission', 5.00, 'Round', 2, 1, 1, 7, 1, 1, 1);
```

---

## Common ISO 4217 Currency Codes Reference

| Code | Currency Name | Symbol |
|------|---------------|--------|
| INR | Indian Rupee | ₹ |
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| AED | UAE Dirham | د.إ |
| SGD | Singapore Dollar | S$ |
| JPY | Japanese Yen | ¥ |
| AUD | Australian Dollar | A$ |
| CAD | Canadian Dollar | C$ |
| CHF | Swiss Franc | CHF |

---

## Notes

- Keep code modular for future microservice extraction
- Follow existing HRMS coding standards
- Always log exchange rate changes for audit
- Inverse rate should be auto-calculated
- Handle date-based rate lookup efficiently
- Consider caching frequently used rates
- Currency conversion will be used by expense filing module

---

**Estimated Duration:** 2-3 days
**Priority:** Medium
**Dependencies:** None (Independent foundation module)
