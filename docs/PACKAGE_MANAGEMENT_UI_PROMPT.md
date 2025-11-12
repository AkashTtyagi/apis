# HRMS Package Management UI - Frontend Development Prompt

## 🆕 What's New in Version 2.0

### Major Features Added (January 2025)

#### 1. 🎁 Addon Modules System
Companies can now purchase **additional modules beyond their base package**:
- ✅ Add/Remove addon modules without date restrictions
- ✅ 4 new APIs for addon management
- ✅ Flexible upselling opportunities
- ✅ Independent from package expiry

#### 2. 🔗 Module-Menu Many-to-Many Mapping
Menus can now belong to **multiple modules** simultaneously:
- ✅ Shared menus across modules (e.g., "Reports" in all modules)
- ✅ No menu duplication needed
- ✅ Flexible module-menu relationships
- ✅ New junction table architecture

#### 3. 🔄 Updated Access Flow
User menu access now combines:
- ✅ Base Package Modules (from assigned package)
- ✅ Addon Modules (purchased separately)
- ✅ Module-Menu Mappings (many-to-many)
- ✅ Role Permissions (existing system)

### Quick Links
- [New APIs](#4--company-addon-module-apis) - Addon module management endpoints
- [Updated Models](#-company-addon-module-model) - New data structures
- [UI Requirements](#4--company-addon-management-screen) - Addon UI specs
- [Architecture](#-module-menu-architecture) - Module-menu mapping details

---

## Overview
Create a comprehensive **Package Management System** frontend for an HRMS application. This system manages packages (subscription tiers), modules (features), company package assignments, and **addon modules**. The UI should be modern, responsive, and fully integrated with the backend APIs.

---

## System Architecture

### Core Entities
1. **Packages** - Subscription tiers (Basic, Standard, Enterprise)
2. **Modules** - Feature modules (Employee, Payroll, Attendance, etc.)
3. **Package-Module Mapping** - Which modules are included in each package
4. **Company Package Assignment** - Which package is assigned to which company
5. **Company Addon Modules** - 🆕 Additional modules beyond base package
6. **Module-Menu Mapping** - 🆕 Many-to-many mapping between modules and menus

### Key Relationships
- One Package contains Many Modules (many-to-many)
- One Module can be in Many Packages (many-to-many)
- One Company has One Active Package (with history)
- 🆕 One Company can have Multiple Addon Modules (beyond base package)
- 🆕 One Menu can belong to Multiple Modules (many-to-many)
- Package + Addon Modules determine Module access for Company
- Module access determines Menu access for Users

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPANY                                  │
│  (Company ID: 23, Name: "Acme Corp")                           │
└────────────┬───────────────────────────┬────────────────────────┘
             │                           │
             │ Has Active Package        │ Has Addon Modules
             ▼                           ▼
    ┌────────────────┐          ┌───────────────────┐
    │  BASE PACKAGE  │          │  ADDON MODULES    │
    │  "Standard"    │          │  (Independent)    │
    ├────────────────┤          ├───────────────────┤
    │ • COREHR       │          │ • PAYROLL         │
    │ • ATTENDANCE   │          │ • RECRUITMENT     │
    │ • LEAVE        │          └───────────────────┘
    └────────┬───────┘                   │
             │                           │
             └───────────┬───────────────┘
                         │
                         │ Combined Accessible Modules
                         ▼
              ┌──────────────────────┐
              │  ACCESSIBLE MODULES  │
              │  (Base + Addons)     │
              ├──────────────────────┤
              │ 1. COREHR            │
              │ 2. ATTENDANCE        │
              │ 3. LEAVE             │
              │ 4. PAYROLL (addon)   │
              │ 5. RECRUITMENT (addon)│
              └──────────┬───────────┘
                         │
                         │ Mapped to Menus (via hrms_module_menus)
                         ▼
              ┌──────────────────────┐
              │   ACCESSIBLE MENUS   │
              ├──────────────────────┤
              │ • Dashboard          │
              │ • Employee List      │
              │ • Attendance Report  │
              │ • Payroll Run        │
              │ • Reports (shared!)  │
              │ • Job Postings       │
              └──────────┬───────────┘
                         │
                         │ + Role Permissions
                         ▼
              ┌──────────────────────┐
              │   USER MENU ACCESS   │
              │   (Final Result)     │
              └──────────────────────┘
```

**Key Points:**
- 🟢 Base package provides foundation modules
- 🔵 Addon modules extend beyond base package
- 🟡 Menus can be shared across multiple modules
- 🔴 Role permissions filter final menu access

---

## Data Models

### Package Model
```typescript
interface Package {
  id: number;
  package_code: string;          // "BASIC", "STANDARD", "ENTERPRISE"
  package_name: string;
  package_description?: string;
  price_monthly?: number;        // Decimal(10,2)
  price_yearly?: number;         // Decimal(10,2)
  max_users?: number;            // NULL = unlimited
  max_entities?: number;         // NULL = unlimited
  display_order: number;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  modules?: Module[];            // Included when fetched with relations
}
```

### Module Model
```typescript
interface Module {
  id: number;
  module_code: string;           // "EMPLOYEE", "PAYROLL", "ATTENDANCE"
  module_name: string;
  module_description?: string;
  module_icon?: string;
  display_order: number;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  packages?: Package[];          // Included when fetched with relations
}
```

### Company Package Model
```typescript
interface CompanyPackage {
  id: number;
  company_id: number;
  package_id: number;
  start_date: string;            // DATEONLY format: "YYYY-MM-DD"
  end_date?: string;             // NULL = lifetime
  is_active: boolean;
  assigned_by?: number;
  created_at: string;
  updated_at: string;
  package?: Package;             // Included when fetched with relations
}
```

### 🆕 Company Addon Module Model
```typescript
interface CompanyAddonModule {
  id: number;
  company_id: number;
  module_id: number;
  is_active: boolean;
  added_by?: number;
  created_at: string;
  updated_at: string;
  module?: Module;               // Included when fetched with relations
}
```

**Note:** Addon modules allow companies to extend beyond their base package. No date restrictions - addons are active until manually removed.

### 🆕 Module Menu Mapping Model
```typescript
interface ModuleMenu {
  id: number;
  module_id: number;
  menu_id: number;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  module?: Module;               // Included when fetched with relations
  menu?: Menu;                   // Included when fetched with relations
}
```

**Note:** Many-to-many mapping between modules and menus. One menu can belong to multiple modules (e.g., "Reports" menu in all modules).

### 🆕 Menu Model (Reference)
```typescript
interface Menu {
  id: number;
  application_id: number;
  // 🚫 module_id REMOVED - now uses many-to-many relationship
  parent_menu_id?: number;
  menu_code: string;
  menu_name: string;
  menu_type: 'container' | 'screen';
  menu_icon?: string;
  route_path?: string;
  component_path?: string;
  menu_description?: string;
  display_order: number;
  is_active: boolean;
  modules?: Module[];            // 🆕 Many-to-many relationship
}
```

---

## API Endpoints

### Base URL
```
/api/package
```

### 1. Package Management APIs

#### GET All Packages
**Endpoint:** `POST /api/package/packages/get-all`

**Request Body:**
```json
{
  "is_active": true  // Optional filter
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "package_code": "BASIC",
      "package_name": "Basic Package",
      "package_description": "Essential features for small teams",
      "price_monthly": 99.00,
      "price_yearly": 999.00,
      "max_users": 10,
      "max_entities": 1,
      "display_order": 1,
      "is_active": true,
      "modules": [
        {
          "id": 1,
          "module_code": "EMPLOYEE",
          "module_name": "Employee Management",
          "is_active": true
        }
      ]
    }
  ],
  "count": 1
}
```

#### GET Package by ID
**Endpoint:** `POST /api/package/packages/get-by-id`

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "package_code": "BASIC",
    "package_name": "Basic Package",
    "modules": [...]
  }
}
```

#### CREATE Package
**Endpoint:** `POST /api/package/packages/create`

**Request Body:**
```json
{
  "package_code": "PREMIUM",
  "package_name": "Premium Package",
  "package_description": "Advanced features for growing businesses",
  "price_monthly": 299.00,
  "price_yearly": 2999.00,
  "max_users": 50,
  "max_entities": 5,
  "display_order": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package created successfully",
  "data": {
    "id": 2,
    "package_code": "PREMIUM",
    ...
  }
}
```

#### UPDATE Package
**Endpoint:** `POST /api/package/packages/update`

**Request Body:**
```json
{
  "id": 1,
  "package_name": "Updated Basic Package",
  "price_monthly": 129.00,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package updated successfully",
  "data": {...}
}
```

#### DELETE Package
**Endpoint:** `POST /api/package/packages/delete`

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package deleted successfully"
}
```

#### ASSIGN Modules to Package
**Endpoint:** `POST /api/package/packages/assign-modules`

**Request Body:**
```json
{
  "package_id": 1,
  "module_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Modules assigned to package successfully",
  "data": {
    "count": 3
  }
}
```

#### REMOVE Module from Package
**Endpoint:** `POST /api/package/packages/remove-module`

**Request Body:**
```json
{
  "package_id": 1,
  "module_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module removed from package successfully"
}
```

#### GET Package Modules
**Endpoint:** `POST /api/package/packages/get-modules`

**Request Body:**
```json
{
  "package_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_code": "EMPLOYEE",
      "module_name": "Employee Management",
      ...
    }
  ]
}
```

---

### 2. Module Management APIs

#### GET All Modules
**Endpoint:** `POST /api/package/modules/get-all`

**Request Body:**
```json
{
  "is_active": true  // Optional filter
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_code": "EMPLOYEE",
      "module_name": "Employee Management",
      "module_description": "Manage employee records",
      "module_icon": "user-group",
      "display_order": 1,
      "is_active": true,
      "packages": [...]
    }
  ],
  "count": 1
}
```

#### GET Module by ID
**Endpoint:** `POST /api/package/modules/get-by-id`

**Request Body:**
```json
{
  "id": 1
}
```

#### CREATE Module
**Endpoint:** `POST /api/package/modules/create`

**Request Body:**
```json
{
  "module_code": "LEAVE",
  "module_name": "Leave Management",
  "module_description": "Manage employee leaves",
  "module_icon": "calendar",
  "display_order": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {...}
}
```

#### UPDATE Module
**Endpoint:** `POST /api/package/modules/update`

**Request Body:**
```json
{
  "id": 1,
  "module_name": "Updated Module Name",
  "is_active": true
}
```

#### DELETE Module
**Endpoint:** `POST /api/package/modules/delete`

**Request Body:**
```json
{
  "id": 1
}
```

---

### 3. Company Package Assignment APIs

#### ASSIGN Package to Company
**Endpoint:** `POST /api/package/company-packages/assign`

**Request Body:**
```json
{
  "company_id": 1,
  "package_id": 2,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"  // Optional, NULL = lifetime
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package assigned to company successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "package_id": 2,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true
  }
}
```

**Note:** This automatically deactivates any existing active packages for the company.

#### GET Company's Active Package
**Endpoint:** `POST /api/package/company-packages/get-active`

**Request Body:**
```json
{
  "company_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 1,
    "package_id": 2,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true,
    "package": {
      "id": 2,
      "package_code": "STANDARD",
      "package_name": "Standard Package",
      "modules": [
        {
          "id": 1,
          "module_code": "EMPLOYEE",
          "module_name": "Employee Management",
          "is_active": true
        },
        {
          "id": 2,
          "module_code": "PAYROLL",
          "module_name": "Payroll Management",
          "is_active": true
        }
      ]
    }
  }
}
```

#### GET Company Package History
**Endpoint:** `POST /api/package/company-packages/get-history`

**Request Body:**
```json
{
  "company_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "company_id": 1,
      "package_id": 2,
      "start_date": "2025-01-01",
      "is_active": true,
      "package": {...}
    },
    {
      "id": 1,
      "company_id": 1,
      "package_id": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "is_active": false,
      "package": {...}
    }
  ]
}
```

#### UPDATE Company Package
**Endpoint:** `POST /api/package/company-packages/update`

**Request Body:**
```json
{
  "company_id": 1,
  "end_date": "2026-12-31",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company package updated successfully",
  "data": {...}
}
```

#### GET Company Accessible Modules
**Endpoint:** `POST /api/package/company-packages/get-modules`

**Request Body:**
```json
{
  "company_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_code": "EMPLOYEE",
      "module_name": "Employee Management",
      ...
    },
    {
      "id": 2,
      "module_code": "PAYROLL",
      "module_name": "Payroll Management",
      ...
    }
  ]
}
```

#### CHECK Module Access
**Endpoint:** `POST /api/package/company-packages/check-module-access`

**Request Body:**
```json
{
  "company_id": 1,
  "module_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "module_id": 2
  }
}
```

**Note:** This now checks both base package modules AND addon modules.

---

### 4. 🆕 Company Addon Module APIs

Addon modules allow companies to purchase additional modules beyond their base package. These work independently without date restrictions.

#### GET All Parent Companies
**Endpoint:** `POST /api/package/company-packages/get-all-companies`

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "org_name": "Acme Corporation",
      "country_id": 1,
      "currency_id": 1,
      "is_parent_company": 1,
      "is_active": true
    }
  ],
  "count": 1
}
```

**Use Case:** List all parent companies for package/addon assignment.

#### ADD Addon Module to Company
**Endpoint:** `POST /api/package/company-packages/add-addon`

**Request Body:**
```json
{
  "company_id": 23,
  "module_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Addon module added successfully",
  "data": {
    "id": 1,
    "company_id": 23,
    "module_id": 5,
    "is_active": true,
    "added_by": 1
  }
}
```

**Business Rules:**
- Cannot add same addon twice (unique constraint)
- Can reactivate previously removed addon
- Addon is active until manually removed (no expiry dates)
- Module must exist and be active

**Error Responses:**
```json
// Module already assigned
{
  "success": false,
  "error": "This addon module is already assigned to the company"
}

// Module not found
{
  "success": false,
  "error": "Module not found or inactive"
}
```

#### REMOVE Addon Module from Company
**Endpoint:** `POST /api/package/company-packages/remove-addon`

**Request Body:**
```json
{
  "company_id": 23,
  "module_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Addon module removed successfully",
  "data": {
    "id": 1,
    "company_id": 23,
    "module_id": 5,
    "is_active": false
  }
}
```

**Business Rules:**
- Soft delete (sets is_active = false)
- Can be reactivated later
- Returns error if addon not found or already inactive

**Error Response:**
```json
{
  "success": false,
  "error": "Addon module not found or already inactive"
}
```

#### GET Company Addon Modules
**Endpoint:** `POST /api/package/company-packages/get-addons`

**Request Body:**
```json
{
  "company_id": 23
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 23,
      "module_id": 5,
      "is_active": true,
      "module": {
        "id": 5,
        "module_code": "PAYROLL",
        "module_name": "Payroll Management",
        "module_description": "Complete payroll processing",
        "module_icon": "currency-dollar",
        "is_active": true
      }
    },
    {
      "id": 2,
      "company_id": 23,
      "module_id": 8,
      "is_active": true,
      "module": {
        "id": 8,
        "module_code": "RECRUITMENT",
        "module_name": "Recruitment Module",
        "module_description": "End-to-end hiring process",
        "module_icon": "user-plus",
        "is_active": true
      }
    }
  ],
  "count": 2
}
```

**Use Case:** Display all addon modules purchased by a company for management.

#### 🔄 UPDATED: GET Company Accessible Modules
**Endpoint:** `POST /api/package/company-packages/get-modules`

**Response NOW Includes:**
- Base package modules
- Addon modules
- Deduplicated list (if module in both, shown once)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_code": "COREHR",
      "module_name": "Core HR",
      "source": "base_package"
    },
    {
      "id": 2,
      "module_code": "ATTENDANCE",
      "module_name": "Attendance",
      "source": "base_package"
    },
    {
      "id": 5,
      "module_code": "PAYROLL",
      "module_name": "Payroll Management",
      "source": "addon"
    },
    {
      "id": 8,
      "module_code": "RECRUITMENT",
      "module_name": "Recruitment",
      "source": "addon"
    }
  ],
  "count": 4
}
```

---

## UI Requirements

### 1. Package Management Screen

**Layout:** Card-based grid layout with action buttons

**Features:**
- Display all packages in a grid/card format
- Each package card shows:
  - Package name and code
  - Description
  - Monthly/Yearly pricing
  - Max users and entities (show "Unlimited" if NULL)
  - Active/Inactive status badge
  - Included modules count
- Actions:
  - Create new package button (top-right)
  - Edit package (card action)
  - Delete package (card action with confirmation)
  - View/Manage modules (card action)
- Filtering:
  - Filter by active/inactive status
- Sorting:
  - Sort by display_order (default)
  - Sort by price

**Create/Edit Package Form:**
```typescript
Fields:
- package_code: text (required, uppercase, readonly on edit)
- package_name: text (required)
- package_description: textarea (optional)
- price_monthly: number with 2 decimals (optional)
- price_yearly: number with 2 decimals (optional)
- max_users: number (optional, checkbox for unlimited)
- max_entities: number (optional, checkbox for unlimited)
- display_order: number (required, default: 0)
- is_active: toggle switch (default: true)
```

**Module Assignment Modal:**
- Show package name at top
- Display all available modules with checkboxes
- Currently assigned modules are pre-checked
- Show module details (name, description, icon)
- Bulk select/deselect buttons
- Save button to update assignments

---

### 2. Module Management Screen

**Layout:** Data table with inline actions

**Features:**
- Display all modules in a table
- Columns:
  - Icon (if available)
  - Module Code
  - Module Name
  - Description
  - Display Order
  - Status (Active/Inactive badge)
  - Packages Count
  - Actions (Edit, Delete)
- Actions:
  - Create new module button
  - Edit module (inline or modal)
  - Delete module (with confirmation)
  - View packages using this module
- Filtering:
  - Filter by active/inactive
- Search:
  - Search by module name or code

**Create/Edit Module Form:**
```typescript
Fields:
- module_code: text (required, uppercase, readonly on edit)
- module_name: text (required)
- module_description: textarea (optional)
- module_icon: icon picker or text (optional)
- display_order: number (required, default: 0)
- is_active: toggle switch (default: true)
```

---

### 3. Company Package Assignment Screen

**Layout:** Split view - Company list on left, Package details on right

**Features:**

**Left Panel - Company List:**
- Searchable list of companies
- Show company name and current package badge
- Click to select company

**Right Panel - Company Details:**
When a company is selected:

**Section 1: Current Active Package**
- Package card showing:
  - Package name and code
  - Start date and end date
  - Status badge (Active/Expired/Upcoming)
  - Pricing information
  - Included modules list with icons
- Actions:
  - Change package button
  - Extend package button
  - Deactivate package button

**Section 2: Available Modules**
- Grid of module cards showing all modules in current package
- Each card shows:
  - Module icon
  - Module name
  - Access status (Granted/Revoked)

**Section 3: Package History**
- Timeline view showing:
  - Previous packages
  - Start and end dates
  - Duration
  - Package details
- Expandable cards for each history entry

**Assign Package Modal:**
```typescript
Fields:
- package_id: dropdown (required, show package name with pricing)
- start_date: date picker (required, default: today)
- end_date: date picker (optional, checkbox for lifetime)

Display:
- Preview selected package details
- Show modules included in selected package
- Show warning if downgrading (fewer modules)
```

---

### 4. 🆕 Company Addon Management Screen

**Layout:** Enhanced company details view with addon module management

**Features:**

**Section 1: Company Overview**
- Company name and details
- Current package badge
- Package expiry information

**Section 2: Base Package Modules**
- Display modules from current package
- Read-only list with module cards
- Show module icons and names
- Badge showing "Base Package"

**Section 3: Addon Modules Management** 🆕
- **Available Addons Section:**
  - Grid/list of modules NOT in base package
  - Each addon shows:
    - Module icon and name
    - Description
    - "Add Addon" button
    - Pricing (if available)
  - Search/filter functionality

- **Active Addons Section:**
  - Grid/list of currently active addon modules
  - Each addon shows:
    - Module icon and name
    - Added date
    - Added by user
    - "Remove Addon" button (with confirmation)
    - Badge showing "Addon"
  - Count of active addons

**Section 4: All Accessible Modules**
- Combined view showing:
  - Base package modules (with badge)
  - Addon modules (with badge)
  - Total count
  - Visual distinction between base and addon

**Add Addon Modal:**
```typescript
Display:
- Module selection dropdown or cards
- Module details preview
- Confirmation message
- "Add Addon" button

Validation:
- Cannot add module already in base package
- Cannot add module already added as addon
- Show warning if module dependencies exist
```

**Remove Addon Confirmation:**
```typescript
Display:
- Module name and icon
- Warning: "This will remove access to all menus in this module"
- List of affected menus/users (if available)
- "Confirm Remove" and "Cancel" buttons

Business Rules:
- Soft delete (can be re-added later)
- No date restrictions
- Immediate effect on user menu access
```

**Addon Module Card Component:**
```typescript
Props:
- module: Module
- isAddon: boolean
- isActive: boolean
- onAdd?: () => void
- onRemove?: () => void
- addedDate?: string
- addedBy?: string
```

---

## UI Components to Create

### 1. PackageCard Component
```typescript
Props:
- package: Package
- onEdit: (id) => void
- onDelete: (id) => void
- onManageModules: (id) => void
```

### 2. ModuleList Component
```typescript
Props:
- modules: Module[]
- selectedModuleIds?: number[]
- onSelect?: (moduleIds: number[]) => void
- readOnly?: boolean
```

### 3. PackageComparisonTable Component
```typescript
Props:
- packages: Package[]
- highlightPackageId?: number
```
Display features comparison across packages

### 4. CompanyPackageCard Component
```typescript
Props:
- companyPackage: CompanyPackage
- onChangePackage: () => void
- onExtend: () => void
- onDeactivate: () => void
```

### 5. PackageHistoryTimeline Component
```typescript
Props:
- history: CompanyPackage[]
```

### 6. 🆕 AddonModuleManager Component
```typescript
Props:
- companyId: number
- baseModules: Module[]
- addonModules: CompanyAddonModule[]
- onAddAddon: (moduleId: number) => Promise<void>
- onRemoveAddon: (moduleId: number) => Promise<void>
```

Features:
- Display available addons
- Display active addons
- Handle add/remove operations
- Show confirmation dialogs

### 7. 🆕 ModuleMenuMapping Component
```typescript
Props:
- moduleId: number
- assignedMenus: Menu[]
- availableMenus: Menu[]
- onAssignMenu: (menuId: number) => Promise<void>
- onRemoveMenu: (menuId: number) => Promise<void>
```

Features:
- Show menus assigned to module
- Show available menus for assignment
- Support multi-select for bulk operations
- Display menu hierarchy

---

## 🆕 Module-Menu Architecture

### Key Changes
1. **Removed:** `module_id` field from menus table
2. **Added:** `hrms_module_menus` junction table for many-to-many mapping
3. **Impact:** One menu can now belong to multiple modules

### Benefits
- ✅ Shared menus across modules (e.g., "Reports", "Dashboard")
- ✅ Flexible menu-module relationships
- ✅ Easy to add/remove modules from menus
- ✅ No need to duplicate menus for multiple modules

### Menu Access Flow

```
User Login
    ↓
Get Company's Accessible Modules (Base Package + Addons)
    ↓
Get Menus Mapped to Those Modules (via hrms_module_menus)
    ↓
Filter by Application (ESS/Admin)
    ↓
Apply Role Permissions
    ↓
Apply User-Specific Overrides
    ↓
Build Menu Tree
    ↓
Return Final Menus
```

### Example: Shared Menu

**Scenario:** "Reports" menu should appear in ALL modules

**Implementation:**
```json
// hrms_module_menus junction table
[
  { "module_id": 1, "menu_id": 205, "is_active": true },  // COREHR → Reports
  { "module_id": 2, "menu_id": 205, "is_active": true },  // ATTENDANCE → Reports
  { "module_id": 5, "menu_id": 205, "is_active": true },  // PAYROLL → Reports
  { "module_id": 8, "menu_id": 205, "is_active": true }   // RECRUITMENT → Reports
]
```

**Result:** Users with access to ANY of these modules can see the "Reports" menu.

---

## Technical Requirements

### State Management
- Use React Context or Redux for global state
- Cache API responses for packages and modules
- Handle loading and error states gracefully

### Form Validation
- Package Code: Required, uppercase, alphanumeric with underscore
- Module Code: Required, uppercase, alphanumeric with underscore
- Prices: Positive numbers with 2 decimals
- Dates: Valid date format, end_date >= start_date
- Max values: Positive integers or NULL

### Error Handling
```typescript
// API error response format
{
  "success": false,
  "error": "Error message here"
}
```

Handle errors with:
- Toast notifications for user feedback
- Form field error messages
- Fallback UI for failed data loads

### API Integration Pattern
```typescript
// Example API service function
const getAllPackages = async (filters?: { is_active?: boolean }) => {
  try {
    const response = await fetch('/api/package/packages/get-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(filters || {})
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch packages');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};
```

### Authentication
All API calls require authentication token in headers:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

User ID is extracted from token on backend (req.user.id)

---

## UI/UX Guidelines

### Design Principles
1. **Consistency:** Use consistent spacing, colors, and typography
2. **Clarity:** Clear labels, helpful tooltips, and inline validation
3. **Responsiveness:** Mobile-first design, works on all screen sizes
4. **Accessibility:** Proper ARIA labels, keyboard navigation, screen reader support
5. **Performance:** Lazy loading, pagination for large lists, optimistic UI updates

### Color Scheme Suggestions
- Primary: Blue for actions and active states
- Success: Green for active/success states
- Warning: Orange for warnings and pending states
- Danger: Red for delete actions and inactive states
- Neutral: Gray for disabled and secondary elements

### Typography
- Headings: Bold, clear hierarchy
- Body: Readable font size (14-16px)
- Labels: Medium weight, slightly smaller
- Monospace: For codes (package_code, module_code)

### Spacing
- Cards: 16-24px padding
- Sections: 32-48px margin between major sections
- Form fields: 16px gap between fields
- Buttons: 8px gap between button groups

---

## Implementation Checklist

### Phase 1: Package Management
- [ ] Create Package list view with cards
- [ ] Implement Package create form
- [ ] Implement Package edit form
- [ ] Implement Package delete with confirmation
- [ ] Create Module assignment modal
- [ ] Test all Package CRUD operations

### Phase 2: Module Management
- [ ] Create Module table view
- [ ] Implement Module create form
- [ ] Implement Module edit form
- [ ] Implement Module delete with confirmation
- [ ] Add search and filter functionality
- [ ] Test all Module CRUD operations

### Phase 3: Company Package Assignment
- [ ] Create company list with search
- [ ] Create current package display
- [ ] Create assign package modal
- [ ] Implement package change functionality
- [ ] Create accessible modules view
- [ ] Create package history timeline
- [ ] Test package assignment flow

### Phase 3.5: 🆕 Company Addon Module Management
- [ ] Create addon modules section in company view
- [ ] Display base package modules (read-only)
- [ ] Display active addon modules with badges
- [ ] Implement "Add Addon" functionality
- [ ] Implement "Remove Addon" with confirmation
- [ ] Show combined accessible modules list
- [ ] Test addon add/remove operations
- [ ] Verify menu access updates with addons

### Phase 4: 🆕 Module-Menu Mapping (Optional/Advanced)
- [ ] Create module-menu mapping interface
- [ ] Display menus assigned to module
- [ ] Implement bulk menu assignment
- [ ] Support shared menus across modules
- [ ] Test menu visibility with module changes

### Phase 5: Polish & Enhancement
- [ ] Add loading states for all API calls
- [ ] Add error handling and user feedback
- [ ] Implement responsive design
- [ ] Add keyboard shortcuts
- [ ] Optimize performance
- [ ] Write unit tests
- [ ] Add integration tests
- [ ] Documentation

---

## Example User Flows

### Flow 1: Create a New Package
1. User clicks "Create Package" button
2. Modal/form opens with empty fields
3. User fills in package details
4. User clicks "Save"
5. API call to create package
6. Success toast notification
7. Package list refreshes with new package

### Flow 2: Assign Modules to Package
1. User clicks "Manage Modules" on a package card
2. Modal opens showing all modules
3. Currently assigned modules are checked
4. User checks/unchecks modules
5. User clicks "Save"
6. API calls to assign/remove modules
7. Success toast notification
8. Modal closes, package card shows updated module count

### Flow 3: Assign Package to Company
1. User selects company from left panel
2. Current package details load in right panel
3. User clicks "Change Package"
4. Modal opens with package dropdown
5. User selects new package
6. Preview shows new package details
7. User sets start and end dates
8. User clicks "Assign"
9. API call to assign package
10. Success toast notification
11. Current package section updates
12. New entry appears in history timeline

### 🆕 Flow 4: Add Addon Module to Company
1. User selects company from left panel
2. Company details load showing base package modules
3. User scrolls to "Available Addons" section
4. User sees list of modules NOT in base package
5. User clicks "Add Addon" on a module card
6. Confirmation modal shows module details and impact
7. User confirms addition
8. API call to add addon module
9. Success toast notification
10. Addon appears in "Active Addons" section
11. Combined modules list updates
12. User menu access updates (if applicable)

### 🆕 Flow 5: Remove Addon Module from Company
1. User views company's active addon modules
2. User clicks "Remove Addon" on an addon card
3. Confirmation dialog shows:
   - Module details
   - Warning about menu access removal
   - Affected users (if shown)
4. User confirms removal
5. API call to remove addon module
6. Success toast notification
7. Addon removed from "Active Addons" section
8. Appears back in "Available Addons" section
9. Combined modules list updates
10. User menu access updates (if applicable)

---

## Best Practices

### API Calls
1. Always handle loading states
2. Always handle errors gracefully
3. Use debouncing for search inputs
4. Cache GET requests when appropriate
5. Show optimistic UI updates for better UX

### Forms
1. Validate on blur and submit
2. Show inline error messages
3. Disable submit button during API call
4. Reset form after successful submission
5. Confirm before discarding unsaved changes

### Data Display
1. Show loading skeletons instead of spinners
2. Display empty states with helpful messages
3. Use pagination for large lists (if needed)
4. Show data counts (e.g., "Showing 10 of 25 packages")
5. Allow sorting and filtering

### Confirmation Dialogs
Always confirm destructive actions:
- Deleting packages
- Deleting modules
- Removing modules from packages
- Deactivating company packages

### Accessibility
1. Use semantic HTML
2. Add ARIA labels
3. Ensure keyboard navigation works
4. Maintain proper focus management
5. Use sufficient color contrast

---

## Additional Notes

### Business Rules
1. **Package Assignment:** Only one active package per company at a time
2. **Module Assignment:** Modules can be in multiple packages (many-to-many)
3. **🆕 Addon Modules:** Companies can have multiple addon modules beyond base package
4. **🆕 Addon Restrictions:**
   - Cannot add module already in base package as addon
   - Cannot add same addon twice (unique constraint)
   - Can reactivate previously removed addons
   - No expiry dates - active until manually removed
5. **🆕 Menu-Module Mapping:** Menus can belong to multiple modules (many-to-many)
6. **🆕 Menu Access:** Users see menus from (Base Package Modules + Addon Modules)
7. **Package Deletion:** Check if any active company packages exist before deleting
8. **Module Deletion:** Check if any packages or addons use this module before deleting
9. **Unlimited Values:** NULL values for max_users and max_entities mean unlimited
10. **Date Validation:** end_date must be after start_date
11. **Active Package:** A package is active if:
    - is_active = true
    - start_date <= today
    - end_date is NULL OR end_date >= today
12. **🆕 Module Access Priority:** If module exists in both base package and addon, show as base package
13. **🆕 Shared Menus:** If menu is in multiple modules and user has access to ANY module, show the menu

### Performance Considerations
1. Fetch packages with modules in a single API call
2. Use optimistic UI updates for better perceived performance
3. Implement lazy loading for large lists
4. Cache frequently accessed data
5. Debounce search and filter inputs

### Future Enhancements
1. Package features comparison table
2. Package upgrade/downgrade wizards
3. Usage analytics and reporting
4. Automated package expiry notifications
5. Bulk company package assignments
6. Package templates
7. Custom pricing per company
8. Trial periods support

---

## Testing Scenarios

### Test Case 1: Create Package with Modules
1. Create a new package
2. Assign multiple modules to it
3. Verify modules appear in package details
4. Edit package and verify changes persist

### Test Case 2: Company Package Assignment
1. Assign package to company
2. Verify previous active package is deactivated
3. Check company has access to all package modules
4. Verify package history is updated

### Test Case 3: Module Access Validation
1. Assign package with specific modules to company
2. Verify company can access only those modules
3. Change to different package
4. Verify module access updates accordingly

### Test Case 4: Package Expiry
1. Assign package with end_date in past
2. Verify package is not returned as active
3. Extend end_date to future
4. Verify package becomes active again

### Test Case 5: Delete Package with Dependencies
1. Assign package to a company
2. Try to delete the package
3. Should show error or warning
4. After removing company assignments, deletion should succeed

### 🆕 Test Case 6: Addon Module Assignment
1. Assign base package to company (e.g., with COREHR, ATTENDANCE)
2. Verify company sees only base package modules
3. Add PAYROLL as addon module
4. Verify PAYROLL appears in accessible modules
5. Verify users see PAYROLL menus
6. Add RECRUITMENT as addon module
7. Verify both addons appear in company's module list

### 🆕 Test Case 7: Addon Module Removal
1. Company has base package + 2 addon modules
2. Remove one addon module (e.g., PAYROLL)
3. Verify module removed from accessible list
4. Verify users no longer see PAYROLL menus
5. Verify other addon still accessible
6. Re-add the removed addon
7. Verify module reactivates successfully

### 🆕 Test Case 8: Addon vs Base Package Priority
1. Assign package with COREHR module
2. Try to add COREHR as addon
3. Should show error (already in base package)
4. Verify no duplicate modules in accessible list
5. Change to different package without COREHR
6. Now should be able to add COREHR as addon

### 🆕 Test Case 9: Shared Menu Access
1. Create "Reports" menu mapped to multiple modules
2. Company has access to module A only
3. Verify "Reports" menu appears
4. Add module B as addon
5. Verify "Reports" menu still appears (no duplication)
6. Remove module A (Reports mapped to A and B)
7. Verify "Reports" menu still appears (via module B)

### 🆕 Test Case 10: Menu Visibility with Addons
1. User has base package with 3 modules (10 menus)
2. Note visible menu count
3. Add addon module with 5 additional menus
4. Verify menu count increases to 15
5. Remove addon module
6. Verify menu count returns to 10
7. Verify no errors in role permissions

---

## 🆕 Summary of Recent Updates

### Version 2.0 Changes (January 2025)

#### 1. Addon Modules System
- **New Feature:** Companies can now add modules beyond their base package
- **4 New APIs:** Add addon, Remove addon, Get addons, Get all companies
- **No Date Restrictions:** Addons active until manually removed
- **Reactivation Support:** Previously removed addons can be re-added
- **Impact:** Flexible upselling and custom module combinations

#### 2. Module-Menu Many-to-Many Mapping
- **Architecture Change:** Removed `module_id` from menus table
- **New Junction Table:** `hrms_module_menus` for flexible mapping
- **Shared Menus:** One menu can belong to multiple modules
- **Example Use Case:** "Reports" menu appears in all modules
- **Impact:** Reduced menu duplication, flexible module design

#### 3. Updated Menu Access Flow
- **New Flow:** Base Package Modules + Addon Modules → Menu Access
- **Updated API:** Company accessible modules now includes addons
- **User Experience:** Users see menus from all accessible modules
- **Priority:** If module in both package and addon, show as base package

#### 4. UI Components Added
- **AddonModuleManager:** Manage company addon modules
- **ModuleMenuMapping:** Assign menus to modules (advanced)
- **Enhanced Views:** Base modules + Addon modules distinction

### Database Changes
```sql
-- New Tables Created
✅ hrms_company_addon_modules
✅ hrms_module_menus

-- Schema Changes
🚫 Removed: module_id from hrms_menus
✅ Added: Many-to-many relationships via junction tables
```

### Migration Required
Before deploying UI changes, backend migrations must be run:
```bash
# Run addon modules migration
mysql -u root -p hrms_db < database/migrations/package/004_create_company_addon_modules.sql

# Run module-menu mapping migration
mysql -u root -p hrms_db < database/migrations/role_permission/005_module_menu_mapping.sql
```

### Documentation References
- **Addon Modules:** `/docs/ADDON_MODULES_API_GUIDE.md`
- **Module-Menu Mapping:** `/docs/MODULE_MENU_MAPPING_GUIDE.md`
- **User Access Flow:** `/docs/USER_MENU_ACCESS_FLOW.md`
- **Implementation Summary:** `/docs/MODULE_MENU_IMPLEMENTATION_SUMMARY.md`
- **Verification Checklist:** `/docs/MIGRATION_VERIFICATION_CHECKLIST.md`

---

## Conclusion

This document provides a **complete and updated** specification for building the Package Management UI with the latest addon modules and module-menu mapping features.

### Key Implementation Points:
1. ✅ Follow API contracts exactly as specified
2. ✅ Implement all UI components described
3. ✅ Handle addon module management properly
4. ✅ Support module-menu many-to-many relationships
5. ✅ Adhere to UI/UX guidelines for consistency
6. ✅ Test all user flows thoroughly

### Before You Start:
- Verify backend migrations have been run
- Review all new API endpoints
- Understand addon module business rules
- Familiarize with module-menu mapping architecture

### Need Help?
For any clarifications or changes to the API, coordinate with the backend team. All API endpoints follow POST method convention as per the project standards.

**Version:** 2.0
**Last Updated:** January 2025
**Status:** ✅ Production Ready

**Happy Coding!**
