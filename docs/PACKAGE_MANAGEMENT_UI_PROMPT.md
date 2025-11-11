# HRMS Package Management UI - Frontend Development Prompt

## Overview
Create a comprehensive **Package Management System** frontend for an HRMS application. This system manages packages (subscription tiers), modules (features), and company package assignments. The UI should be modern, responsive, and fully integrated with the backend APIs.

---

## System Architecture

### Core Entities
1. **Packages** - Subscription tiers (Basic, Standard, Enterprise)
2. **Modules** - Feature modules (Employee, Payroll, Attendance, etc.)
3. **Package-Module Mapping** - Which modules are included in each package
4. **Company Package Assignment** - Which package is assigned to which company

### Key Relationships
- One Package contains Many Modules
- One Module can be in Many Packages
- One Company has One Active Package (with history)
- Package determines Module access for Company

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

### Phase 4: Polish & Enhancement
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
2. **Module Assignment:** Modules can be in multiple packages
3. **Package Deletion:** Check if any active company packages exist before deleting
4. **Module Deletion:** Check if any packages use this module before deleting
5. **Unlimited Values:** NULL values for max_users and max_entities mean unlimited
6. **Date Validation:** end_date must be after start_date
7. **Active Package:** A package is active if:
   - is_active = true
   - start_date <= today
   - end_date is NULL OR end_date >= today

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

---

## Conclusion

This document provides a complete specification for building the Package Management UI. Follow the API contracts exactly as specified, implement all the UI components described, and adhere to the UI/UX guidelines for a consistent user experience.

For any clarifications or changes to the API, coordinate with the backend team. All API endpoints follow POST method convention as per the project standards.

**Happy Coding!**
