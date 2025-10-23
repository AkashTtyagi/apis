# Package & Role Permission Management System

## Complete Architecture Documentation

### Database Tables Structure

#### Package Management Tables
1. **hrms_packages** - Global packages (Basic, Standard, Enterprise)
2. **hrms_modules** - Global modules (Employee, Payroll, Attendance, etc.)
3. **hrms_package_modules** - Package-Module mapping
4. **hrms_company_packages** - Company package assignments

#### Role & Permission Tables
5. **hrms_applications** - Global applications (ESS, Admin, etc.)
6. **hrms_menus** - Global menus (assigned to modules, N-level hierarchy)
7. **hrms_permissions_master** - Global permissions (View, Add, Edit, Delete, etc.)
8. **hrms_role_master** - Global template roles
9. **hrms_role_master_menu_permissions** - Role master permissions
10. **hrms_roles** - Company-specific roles
11. **hrms_role_menu_permissions** - Company role permissions
12. **hrms_user_roles** - User role assignments
13. **hrms_user_menu_permissions** - User-specific permission overrides
14. **hrms_role_permission_audit_log** - Audit log

### System Flow

```
Company X
  ↓
Assigned Package: BASIC
  ↓
Basic Package contains Modules:
  - Employee Management
  - Attendance
  ↓
Employee Management Module contains Menus:
  - Employee List (screen)
  - Employee Details (screen)
    - Documents (screen)
  ↓
Company creates Role: "HR Manager"
  ↓
HR Manager role has permissions:
  - Employee List: [VIEW, ADD, EDIT]
  - Employee Details: [VIEW, EDIT]
  ↓
User "Akash" assigned role: "HR Manager"
  ↓
Admin gives Akash extra permission:
  - Employee Details: [DELETE] (user-specific override)
  ↓
Final Permissions for Akash:
  - Employee List: [VIEW, ADD, EDIT] (from role)
  - Employee Details: [VIEW, EDIT, DELETE] (role + user override)
```

### Folder Structure Created

```
database/
└── migrations/
    ├── package_management/
    │   └── 001_create_package_management_tables.sql
    └── role_permission/
        └── 001_create_role_permission_system.sql

src/
├── models/
│   ├── package/
│   │   ├── HrmsPackage.js ✅
│   │   ├── HrmsModule.js ✅
│   │   ├── HrmsPackageModule.js ✅
│   │   ├── HrmsCompanyPackage.js ✅
│   │   └── index.js ✅
│   └── role_permission/
│       ├── HrmsApplication.js ✅
│       ├── HrmsMenu.js (pending)
│       ├── HrmsPermissionMaster.js (pending)
│       ├── HrmsRoleMaster.js (pending)
│       ├── HrmsRoleMasterMenuPermission.js (pending)
│       ├── HrmsRole.js (pending)
│       ├── HrmsRoleMenuPermission.js (pending)
│       ├── HrmsUserRole.js (pending)
│       ├── HrmsUserMenuPermission.js (pending)
│       ├── HrmsRolePermissionAuditLog.js (pending)
│       └── index.js (pending)
│
├── services/
│   ├── package/
│   │   ├── package.service.js (pending)
│   │   ├── module.service.js (pending)
│   │   └── companyPackage.service.js (pending)
│   └── role_permission/
│       ├── application.service.js (pending)
│       ├── menu.service.js (pending)
│       ├── role.service.js (pending)
│       ├── permission.service.js (pending)
│       └── userPermission.service.js (pending)
│
├── controllers/
│   ├── package/
│   │   ├── package.controller.js (pending)
│   │   ├── module.controller.js (pending)
│   │   └── companyPackage.controller.js (pending)
│   └── role_permission/
│       ├── application.controller.js (pending)
│       ├── menu.controller.js (pending)
│       ├── role.controller.js (pending)
│       └── permission.controller.js (pending)
│
└── routes/
    ├── package/
    │   ├── package.routes.js (pending)
    │   ├── module.routes.js (pending)
    │   └── companyPackage.routes.js (pending)
    └── role_permission/
        ├── application.routes.js (pending)
        ├── menu.routes.js (pending)
        ├── role.routes.js (pending)
        └── permission.routes.js (pending)
```

### Key API Endpoints (To Be Created)

#### Package Management APIs
```
POST   /api/packages - Create package
GET    /api/packages - Get all packages
GET    /api/packages/:id - Get package by ID
PUT    /api/packages/:id - Update package
DELETE /api/packages/:id - Delete package

POST   /api/modules - Create module
GET    /api/modules - Get all modules
GET    /api/modules/:id - Get module by ID
PUT    /api/modules/:id - Update module
DELETE /api/modules/:id - Delete module

POST   /api/packages/:id/modules - Assign module to package
DELETE /api/packages/:id/modules/:moduleId - Remove module from package
GET    /api/packages/:id/modules - Get all modules in package

POST   /api/companies/:id/package - Assign package to company
GET    /api/companies/:id/package - Get company's current package
PUT    /api/companies/:id/package - Update company package
```

#### Role & Permission APIs
```
GET    /api/applications - Get all applications
GET    /api/applications/:id/menus - Get menus for application

POST   /api/menus - Create menu
GET    /api/menus - Get all menus
GET    /api/menus/:id - Get menu by ID with children
PUT    /api/menus/:id - Update menu
DELETE /api/menus/:id - Delete menu

GET    /api/permissions - Get all permissions

POST   /api/roles - Create role
GET    /api/roles - Get all roles for company
GET    /api/roles/:id - Get role by ID with permissions
PUT    /api/roles/:id - Update role
DELETE /api/roles/:id - Delete role

POST   /api/roles/:id/permissions - Assign permissions to role
PUT    /api/roles/:id/permissions - Update role permissions
GET    /api/roles/:id/permissions - Get role permissions

POST   /api/users/:id/roles - Assign role to user
DELETE /api/users/:id/roles/:roleId - Remove role from user
GET    /api/users/:id/roles - Get user roles

POST   /api/users/:id/permissions - Grant/Revoke user-specific permission
GET    /api/users/:id/permissions - Get user permissions (merged role + user)
DELETE /api/users/:id/permissions/:id - Remove user-specific permission

GET    /api/users/:userId/application/:appId/menus - Get user menus with permissions
GET    /api/users/:userId/screen/:menuId/permissions - Get user permissions for specific screen
```

### Important Business Logic

#### Menu Access Logic
```javascript
// Pseudocode for getUserMenus(userId, applicationId)
1. Get user's company_id
2. Get company's active package
3. Get modules in that package
4. Get menus in those modules for the application
5. Get user's roles for the application
6. Get role permissions for those menus
7. Get user-specific permission overrides
8. Merge and return:
   - Show only menus from company's package
   - For each menu:
     - permissions = role_permissions + user_granted_permissions - user_revoked_permissions
```

#### Permission Priority
```
1. User-specific REVOKE = Highest (removes permission even if role has it)
2. User-specific GRANT = High (adds permission even if role doesn't have it)
3. Role permissions = Normal (default permissions from role)
```

### Next Steps
1. ✅ Database schema created
2. ✅ Migrations created
3. ✅ Folder structure created
4. ✅ Package models created
5. ⏳ Role & permission models - IN PROGRESS
6. ⏳ Service layer
7. ⏳ Controllers
8. ⏳ Routes
9. ⏳ Middleware for permission checking
10. ⏳ API documentation

