# Menu Management UI Documentation

## Overview
This document describes the UI specifications for the Menu Management module. This is an admin interface for creating and managing the application's menu structure.

---

## API Endpoints Reference

### Base URL
```
/api/role-permission/menus
```

### Available APIs for Menu Management

1. **POST /get-by-application** - Get all menus for an application
2. **POST /get-by-id** - Get menu details by ID
3. **POST /create** - Create a new menu
4. **POST /update** - Update an existing menu
5. **POST /delete** - Delete a menu

---

## Page Structure

### 1. Menu Management Dashboard

**Route:** `/admin/menu-management`

#### Layout Components

##### A. Header Section
```
+--------------------------------------------------+
|  Menu Management                      [+ Add Menu]|
+--------------------------------------------------+
```

**Elements:**
- Page Title: "Menu Management"
- Primary Action Button: "+ Add Menu" (Opens Create Menu Modal)

##### B. Filters Section
```
+--------------------------------------------------+
| Application: [Dropdown]    Module: [Dropdown]    |
| Status: [All/Active/Inactive]         [Search 🔍] |
+--------------------------------------------------+
```

**Filter Fields:**
- **Application Dropdown** (Required)
  - API: Use your existing applications API
  - Display: `application_name`
  - Value: `application_id`
  - Default: First application or previously selected

- **Module Dropdown** (Optional)
  - API: Use your existing modules API
  - Display: `module_name`
  - Value: `module_id`
  - Clear option: "All Modules"

- **Status Dropdown**
  - Options: `All`, `Active`, `Inactive`
  - Maps to: `is_active` (true/false/undefined)

- **Search Input**
  - Placeholder: "Search by menu name or code..."
  - Searches in: `menu_name`, `menu_code`

##### C. Menu Tree Table

**API Call:**
```javascript
POST /api/role-permission/menus/get-by-application

Request Body:
{
  "application_id": 1,        // Required
  "module_id": 2,             // Optional (from filter)
  "is_active": true           // Optional (from filter)
}

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "application_id": 1,
      "parent_menu_id": null,
      "menu_code": "DASHBOARD",
      "menu_name": "Dashboard",
      "menu_type": "container",
      "menu_icon": "dashboard",
      "route_path": null,
      "component_path": null,
      "menu_description": "Main dashboard container",
      "display_order": 1,
      "is_active": true,
      "modules": [
        {
          "id": 1,
          "module_code": "CORE",
          "module_name": "Core Module"
        }
      ],
      "children": [
        {
          "id": 2,
          "parent_menu_id": 1,
          "menu_code": "HOME",
          "menu_name": "Home",
          "menu_type": "screen",
          // ... other fields
        }
      ]
    }
  ],
  "count": 10
}
```

**Table Structure (Hierarchical Tree Table):**

```
+----+-------+------------------+-------------+-----------+--------------+--------+----------+
| ID | Icon  | Menu Name        | Menu Code   | Type      | Route Path   | Status | Actions  |
+----+-------+------------------+-------------+-----------+--------------+--------+----------+
| 1  | 📊    | Dashboard        | DASHBOARD   | Container | -            | Active | [···]    |
|    └─ 2  | 🏠  | Home         | HOME        | Screen    | /home        | Active | [···]    |
|    └─ 3  | 📈  | Analytics    | ANALYTICS   | Screen    | /analytics   | Active | [···]    |
| 4  | 👥    | Employees        | EMPLOYEES   | Container | -            | Active | [···]    |
|    └─ 5  | 📋  | Employee List| EMP_LIST    | Screen    | /employees   | Active | [···]    |
+----+-------+------------------+-------------+-----------+--------------+--------+----------+
```

**Table Columns:**

1. **ID** - Menu ID (numeric)
2. **Icon** - Visual icon representation (`menu_icon`)
3. **Menu Name** - Display name with hierarchy indentation (`menu_name`)
4. **Menu Code** - Unique code (`menu_code`)
5. **Type** - Badge component (`menu_type`)
   - Container: Blue badge
   - Screen: Green badge
6. **Route Path** - Frontend route (`route_path`)
   - Show "-" for container types
7. **Status** - Toggle switch (`is_active`)
   - Active: Green toggle ON
   - Inactive: Gray toggle OFF
8. **Actions** - Dropdown menu button
   - View Details
   - Edit
   - Delete
   - Move Up/Down (for reordering)

**Table Features:**
- Expandable/Collapsible rows for parent menus
- Drag and drop for reordering (updates `display_order`)
- Indentation to show hierarchy levels
- Sorting by display_order (default)
- Client-side search filtering

**Module Tags:**
- Display module badges below menu name if associated
- Show count: "3 modules" if multiple

---

## 2. Create/Edit Menu Modal

### Modal Header
```
+--------------------------------------------------+
| [x] Create New Menu / Edit Menu                   |
+--------------------------------------------------+
```

### Form Layout

#### Tab 1: Basic Information

```javascript
POST /api/role-permission/menus/create

Request Body:
{
  "application_id": 1,           // Required
  "parent_menu_id": null,        // Optional (for child menus)
  "menu_code": "DASHBOARD",      // Required, unique per application
  "menu_name": "Dashboard",      // Required
  "menu_type": "container",      // Required: "container" or "screen"
  "menu_icon": "dashboard",      // Optional
  "route_path": "/dashboard",    // Required if menu_type = "screen"
  "component_path": "Dashboard", // Optional
  "menu_description": "Main dashboard",  // Optional
  "display_order": 1,            // Optional, default: 0
  "module_ids": [1, 2, 3]       // Optional array of module IDs
}

Response:
{
  "success": true,
  "message": "Menu created successfully",
  "data": {
    "id": 1,
    "application_id": 1,
    // ... all menu fields
  }
}
```

**Form Fields:**

1. **Application** (Dropdown) *Required*
   ```
   Label: Application
   Type: Select
   Options: Fetch from applications API
   Display: application_name
   Value: application_id
   Validation: Required
   Disabled: true (when editing)
   ```

2. **Parent Menu** (Dropdown) *Optional*
   ```
   Label: Parent Menu
   Type: Select (Searchable)
   Options: All container menus from selected application
   Display: menu_name (with hierarchy path)
   Value: menu_id (parent_menu_id)
   Placeholder: "Select parent menu (leave empty for top level)"
   Help Text: "Select a parent menu to create a nested menu structure"
   Validation: Optional
   ```

3. **Menu Code** (Text Input) *Required*
   ```
   Label: Menu Code
   Type: Text
   Placeholder: "e.g., DASHBOARD, EMP_LIST"
   Max Length: 100
   Pattern: Uppercase, alphanumeric with underscore
   Validation:
     - Required
     - Unique within application
     - Pattern: ^[A-Z0-9_]+$
   Disabled: true (when editing)
   Help Text: "Unique identifier for this menu (uppercase, no spaces)"
   ```

4. **Menu Name** (Text Input) *Required*
   ```
   Label: Menu Name
   Type: Text
   Placeholder: "e.g., Dashboard"
   Max Length: 150
   Validation: Required
   Help Text: "Display name shown to users"
   ```

5. **Menu Type** (Radio Button) *Required*
   ```
   Label: Menu Type
   Type: Radio Button Group
   Options:
     - Container (📁) - For grouping menus
     - Screen (📄) - For actual pages
   Default: Container
   Validation: Required
   Disabled: true (when editing - type cannot be changed)
   ```

6. **Menu Icon** (Icon Picker) *Optional*
   ```
   Label: Menu Icon
   Type: Icon Picker Component
   Options: Material Icons / Font Awesome
   Placeholder: "Select an icon"
   Display: Icon preview with name
   Help Text: "Icon to display in navigation"
   ```

7. **Route Path** (Text Input) *Conditional*
   ```
   Label: Route Path
   Type: Text
   Placeholder: "/dashboard"
   Validation:
     - Required if menu_type = "screen"
     - Pattern: Must start with /
     - Max Length: 255
   Visible: Only when menu_type = "screen"
   Help Text: "Frontend route path (e.g., /employees/list)"
   ```

8. **Component Path** (Text Input) *Optional*
   ```
   Label: Component Path
   Type: Text
   Placeholder: "Dashboard/Index"
   Max Length: 255
   Validation: Optional
   Visible: Only when menu_type = "screen"
   Help Text: "Component file path (optional)"
   ```

9. **Display Order** (Number Input) *Optional*
   ```
   Label: Display Order
   Type: Number
   Default: 0
   Min: 0
   Validation: Optional, non-negative integer
   Help Text: "Order in which this menu appears (lower numbers first)"
   ```

10. **Description** (Textarea) *Optional*
    ```
    Label: Description
    Type: Textarea
    Rows: 3
    Max Length: 1000
    Placeholder: "Enter menu description..."
    Help Text: "Internal description for documentation"
    ```

11. **Status** (Switch) *Required*
    ```
    Label: Active Status
    Type: Toggle Switch
    Default: true (Active)
    Help Text: "Inactive menus won't be visible to users"
    ```

#### Tab 2: Module Mapping

**Purpose:** Link this menu to specific modules (for package-based access control)

```
+--------------------------------------------------+
| Associated Modules                                |
+--------------------------------------------------+
| [x] Core Module                                   |
| [x] Attendance Module                             |
| [ ] Leave Management                              |
| [ ] Payroll Module                                |
+--------------------------------------------------+
| Help: Select which modules can access this menu   |
+--------------------------------------------------+
```

**Form Fields:**

1. **Module Selection** (Multi-select Checkboxes)
   ```
   Label: Associated Modules
   Type: Checkbox Group
   Options: Fetch from modules API
   Display: module_name
   Value: module_id
   Help Text: "Users with access to these modules will see this menu"
   Validation: Optional (can create menu without module mapping)
   Data: Saves to module_ids array in request
   ```

**Features:**
- Search/filter modules
- "Select All" / "Deselect All" options
- Show module count: "3 modules selected"
- Group modules by category if available

---

## 3. View Menu Details Modal

**API Call:**
```javascript
POST /api/role-permission/menus/get-by-id

Request Body:
{
  "id": 1
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "parent_menu_id": null,
    "menu_code": "DASHBOARD",
    "menu_name": "Dashboard",
    "menu_type": "container",
    "menu_icon": "dashboard",
    "route_path": null,
    "component_path": null,
    "menu_description": "Main dashboard container",
    "display_order": 1,
    "is_active": true,
    "created_by": 1,
    "updated_by": 2,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-02T00:00:00.000Z",
    "application": {
      "id": 1,
      "application_name": "HRMS Admin"
    },
    "modules": [
      {
        "id": 1,
        "module_code": "CORE",
        "module_name": "Core Module"
      }
    ],
    "parent": {
      "id": 0,
      "menu_name": "Root"
    },
    "children": [
      {
        "id": 2,
        "menu_name": "Home"
      }
    ]
  }
}
```

**Modal Layout:**

```
+--------------------------------------------------+
| Menu Details                              [Edit] [X]|
+--------------------------------------------------+
| Application:    HRMS Admin                        |
| Menu Code:      DASHBOARD                         |
| Menu Name:      Dashboard                         |
| Type:           [Container]                       |
| Icon:           📊 dashboard                      |
| Display Order:  1                                 |
| Status:         ● Active                          |
+--------------------------------------------------+
| Parent Menu:    (None - Top Level)                |
| Child Menus:    2 menus                           |
|   - Home                                          |
|   - Analytics                                     |
+--------------------------------------------------+
| Associated Modules:                               |
|   [Core Module] [Attendance Module]               |
+--------------------------------------------------+
| Description:                                      |
|   Main dashboard container for the application    |
+--------------------------------------------------+
| Created:  Jan 1, 2025 by Admin User               |
| Modified: Jan 2, 2025 by Manager User             |
+--------------------------------------------------+
```

---

## 4. Update Menu

**API Call:**
```javascript
POST /api/role-permission/menus/update

Request Body:
{
  "id": 1,                      // Required
  "menu_name": "New Name",      // Optional
  "menu_icon": "new-icon",      // Optional
  "route_path": "/new-path",    // Optional
  "component_path": "NewComp",  // Optional
  "menu_description": "...",    // Optional
  "display_order": 2,           // Optional
  "is_active": false            // Optional
}

Response:
{
  "success": true,
  "message": "Menu updated successfully",
  "data": {
    // updated menu object
  }
}
```

**Note:** Use the same modal as Create, but:
- Pre-fill all fields with existing data
- Disable fields: `application_id`, `menu_code`, `menu_type`
- Show "Update Menu" as title
- Button text: "Update" instead of "Create"

---

## 5. Delete Menu

**API Call:**
```javascript
POST /api/role-permission/menus/delete

Request Body:
{
  "id": 1
}

Response (Success):
{
  "success": true,
  "message": "Menu deleted successfully"
}

Response (Error - Has Children):
{
  "success": false,
  "message": "Cannot delete menu with children. Delete children first."
}
```

**Confirmation Modal:**

```
+--------------------------------------------------+
| Delete Menu                                   [X] |
+--------------------------------------------------+
| ⚠️  Are you sure you want to delete this menu?   |
|                                                   |
| Menu Name: Dashboard                              |
| Menu Code: DASHBOARD                              |
|                                                   |
| This action cannot be undone.                     |
|                                                   |
| Note: You cannot delete menus that have child     |
| menus. Please delete or move child menus first.   |
+--------------------------------------------------+
|                    [Cancel]  [Delete Menu]        |
+--------------------------------------------------+
```

**Delete Button:** Red, secondary action

---

## UI/UX Best Practices

### 1. Validation Rules

**Client-side:**
- Real-time validation on blur
- Show error messages below fields
- Disable submit button if form invalid

**Server-side:**
- Handle all error responses
- Show toast notifications for success/error
- Display specific error messages from API

### 2. Loading States

**During API Calls:**
- Show loading spinner on buttons
- Disable form inputs during submission
- Show skeleton loaders for table
- Display "Loading..." overlay on modals

### 3. Success/Error Messages

**Toast Notifications:**
```javascript
// Success
"Menu created successfully"
"Menu updated successfully"
"Menu deleted successfully"

// Errors
"Failed to create menu: [error message]"
"Menu code already exists in this application"
"Cannot delete menu with children"
```

### 4. Empty States

**No Menus Found:**
```
+--------------------------------------------------+
|                    📋                             |
|         No menus found                            |
|                                                   |
|   Create your first menu to get started           |
|                                                   |
|              [+ Create Menu]                      |
+--------------------------------------------------+
```

### 5. Hierarchy Visualization

**Tree Indentation:**
- Use 20px indentation per level
- Show tree lines connecting parent-child
- Collapsible parent items with expand/collapse icons
- Maximum visible depth: 5 levels (add horizontal scroll if deeper)

### 6. Responsive Design

**Desktop (> 1024px):**
- Full table with all columns
- Modal width: 600px

**Tablet (768px - 1024px):**
- Hide display_order column
- Modal width: 90%

**Mobile (< 768px):**
- Card-based layout instead of table
- Stack menu items vertically
- Full-width modal

---

## Component Hierarchy

```
MenuManagementPage/
├── Header
│   ├── PageTitle
│   └── AddMenuButton
├── FiltersSection
│   ├── ApplicationDropdown
│   ├── ModuleDropdown
│   ├── StatusDropdown
│   └── SearchInput
├── MenuTreeTable
│   ├── TableHeader
│   ├── MenuRow (recursive for hierarchy)
│   │   ├── ExpandCollapseIcon
│   │   ├── MenuIcon
│   │   ├── MenuInfo
│   │   ├── StatusToggle
│   │   └── ActionsDropdown
│   └── EmptyState
└── Modals
    ├── CreateEditMenuModal
    │   ├── FormTabs
    │   │   ├── BasicInfoTab
    │   │   │   ├── ApplicationSelect
    │   │   │   ├── ParentMenuSelect
    │   │   │   ├── MenuCodeInput
    │   │   │   ├── MenuNameInput
    │   │   │   ├── MenuTypeRadio
    │   │   │   ├── IconPicker
    │   │   │   ├── RoutePathInput
    │   │   │   ├── ComponentPathInput
    │   │   │   ├── DisplayOrderInput
    │   │   │   ├── DescriptionTextarea
    │   │   │   └── StatusSwitch
    │   │   └── ModuleMappingTab
    │   │       └── ModuleCheckboxGroup
    │   └── ModalActions (Cancel/Submit)
    ├── ViewMenuModal
    │   ├── MenuDetails
    │   └── EditButton
    └── DeleteConfirmationModal
        └── ConfirmationActions
```

---

## State Management

**Required State Variables:**

```javascript
// Page State
const [selectedApplication, setSelectedApplication] = useState(null);
const [selectedModule, setSelectedModule] = useState(null);
const [statusFilter, setStatusFilter] = useState('all');
const [searchQuery, setSearchQuery] = useState('');

// Data State
const [menus, setMenus] = useState([]);
const [applications, setApplications] = useState([]);
const [modules, setModules] = useState([]);
const [loading, setLoading] = useState(false);

// Modal State
const [showCreateModal, setShowCreateModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showViewModal, setShowViewModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedMenu, setSelectedMenu] = useState(null);

// Form State
const [formData, setFormData] = useState({
  application_id: null,
  parent_menu_id: null,
  menu_code: '',
  menu_name: '',
  menu_type: 'container',
  menu_icon: '',
  route_path: '',
  component_path: '',
  menu_description: '',
  display_order: 0,
  is_active: true,
  module_ids: []
});
const [formErrors, setFormErrors] = useState({});
```

---

## Sample API Call Functions

```javascript
// Get menus by application
const fetchMenus = async () => {
  setLoading(true);
  try {
    const response = await api.post('/api/role-permission/menus/get-by-application', {
      application_id: selectedApplication,
      module_id: selectedModule || undefined,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
    });

    if (response.data.success) {
      setMenus(response.data.data);
    }
  } catch (error) {
    toast.error('Failed to fetch menus');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Create menu
const handleCreateMenu = async (formData) => {
  try {
    const response = await api.post('/api/role-permission/menus/create', formData);

    if (response.data.success) {
      toast.success('Menu created successfully');
      setShowCreateModal(false);
      fetchMenus(); // Refresh list
    }
  } catch (error) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to create menu');
    }
  }
};

// Update menu
const handleUpdateMenu = async (id, updateData) => {
  try {
    const response = await api.post('/api/role-permission/menus/update', {
      id,
      ...updateData
    });

    if (response.data.success) {
      toast.success('Menu updated successfully');
      setShowEditModal(false);
      fetchMenus();
    }
  } catch (error) {
    toast.error('Failed to update menu');
  }
};

// Delete menu
const handleDeleteMenu = async (id) => {
  try {
    const response = await api.post('/api/role-permission/menus/delete', { id });

    if (response.data.success) {
      toast.success('Menu deleted successfully');
      setShowDeleteModal(false);
      fetchMenus();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to delete menu');
    }
  }
};

// Get menu details
const fetchMenuDetails = async (id) => {
  try {
    const response = await api.post('/api/role-permission/menus/get-by-id', { id });

    if (response.data.success) {
      setSelectedMenu(response.data.data);
      setShowViewModal(true);
    }
  } catch (error) {
    toast.error('Failed to fetch menu details');
  }
};
```

---

## Security Considerations

1. **Authorization:**
   - Only admin users should access this page
   - Verify user has permission to manage menus
   - Add middleware: `requireAuth`, `requirePermission('MENU_MANAGE')`

2. **Input Validation:**
   - Sanitize all text inputs
   - Validate menu_code pattern on client and server
   - Check for SQL injection attempts

3. **CSRF Protection:**
   - Include CSRF token in all POST requests
   - Validate tokens on backend

---

## Testing Checklist

### Functional Testing
- [ ] Create container menu
- [ ] Create screen menu with route
- [ ] Create nested menu (child of parent)
- [ ] Update menu name and icon
- [ ] Toggle menu status (active/inactive)
- [ ] Delete menu without children
- [ ] Attempt to delete menu with children (should fail)
- [ ] Filter by application
- [ ] Filter by module
- [ ] Filter by status
- [ ] Search menus by name/code
- [ ] View menu details
- [ ] Associate menu with modules

### Edge Cases
- [ ] Create menu with existing code (should fail)
- [ ] Create screen menu without route (should fail)
- [ ] Create deeply nested menu (5+ levels)
- [ ] Create menu with special characters in name
- [ ] Create menu with very long description

### UI/UX Testing
- [ ] Modal opens and closes properly
- [ ] Form validation shows errors
- [ ] Loading states display correctly
- [ ] Success/error toasts appear
- [ ] Table hierarchy expands/collapses
- [ ] Responsive layout on mobile
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Future Enhancements

1. **Drag & Drop Reordering:**
   - Allow visual reordering of menus
   - Update display_order automatically

2. **Bulk Operations:**
   - Bulk activate/deactivate menus
   - Bulk module assignment

3. **Menu Preview:**
   - Show how menu will look in navigation
   - Real-time preview in modal

4. **Export/Import:**
   - Export menu structure as JSON
   - Import menus from file

5. **Audit Log:**
   - Show who created/modified each menu
   - Track all menu changes with timestamps

6. **Menu Templates:**
   - Save common menu structures as templates
   - Quick create from template

---

## Additional Notes

- All APIs use POST method for consistency
- All responses follow the same structure: `{ success, message?, data?, count? }`
- Date formats: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- All timestamps in UTC
- User authentication required for all endpoints (add auth middleware)

---

## Support & Documentation

For API details, refer to:
- Controller: `src/controllers/role_permission/menu.controller.js`
- Service: `src/services/role_permission/menu.service.js`
- Model: `src/models/role_permission/HrmsMenu.js`
- Routes: `src/routes/role_permission/menu.routes.js`
