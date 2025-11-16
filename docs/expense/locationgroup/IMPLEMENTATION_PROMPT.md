# Phase 1.1: Location Group Management - Implementation Prompt

## Overview
Implement Location Group Management module for the Expense Management system. This is the foundation module that allows admins to configure geographical clusters for applying location-based expense limits and policies.

---

## Task Description

You are implementing the **Location Group Management** module for an HRMS Expense Management system. This module allows administrators to create and manage geographical groupings (e.g., "Metro Cities Tier 1", "International Locations") that will be used for location-based expense policies and limits.

---

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (existing HRMS authentication)
- **Code Location:** `src/microservices/expense/`

---

## Database Schema

### Table: `hrms_expense_location_groups`

```sql
CREATE TABLE hrms_expense_location_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,

  -- Basic Information
  group_name VARCHAR(100) NOT NULL,
  group_code VARCHAR(50) NOT NULL UNIQUE,
  group_description TEXT,

  -- Cost of Living Index
  cost_of_living_index ENUM('Low', 'Medium', 'High', 'Very High') DEFAULT 'Medium',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by INT,

  FOREIGN KEY (company_id) REFERENCES hrms_company(id),
  FOREIGN KEY (created_by) REFERENCES hrms_users(id),
  FOREIGN KEY (updated_by) REFERENCES hrms_users(id),
  FOREIGN KEY (deleted_by) REFERENCES hrms_users(id),

  INDEX idx_company_active (company_id, is_active),
  INDEX idx_group_code (group_code)
);
```

### Table: `hrms_expense_location_group_mappings`

```sql
CREATE TABLE hrms_expense_location_group_mappings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_group_id INT NOT NULL,

  -- Geographical Hierarchy (references HRMS location master)
  country_id INT,
  state_id INT,
  city_id INT,
  postal_code_range VARCHAR(255), -- e.g., "110001-110099" or "110001,110002,110003"

  -- Audit fields
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (location_group_id) REFERENCES hrms_expense_location_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (country_id) REFERENCES hrms_countries(id),
  FOREIGN KEY (state_id) REFERENCES hrms_states(id),
  FOREIGN KEY (city_id) REFERENCES hrms_cities(id),
  FOREIGN KEY (created_by) REFERENCES hrms_users(id),
  FOREIGN KEY (updated_by) REFERENCES hrms_users(id),

  INDEX idx_location_group (location_group_id),
  INDEX idx_country (country_id),
  INDEX idx_state (state_id),
  INDEX idx_city (city_id)
);
```

---

## API Endpoints

### Admin APIs

#### 1. Create Location Group
**Endpoint:** `POST /api/expense/admin/location-groups/create`

**Request Body:**
```json
{
  "group_name": "Metro Cities Tier 1",
  "group_code": "LOC-METRO-T1",
  "group_description": "Major metropolitan cities with high cost of living",
  "cost_of_living_index": "Very High",
  "is_active": true,
  "locations": [
    {
      "country_id": 1,
      "state_id": 5,
      "city_id": 10,
      "postal_code_range": "110001-110099"
    },
    {
      "country_id": 1,
      "state_id": 6,
      "city_id": 15,
      "postal_code_range": "400001-400100"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location group created successfully",
  "data": {
    "id": 1,
    "group_name": "Metro Cities Tier 1",
    "group_code": "LOC-METRO-T1",
    "group_description": "Major metropolitan cities with high cost of living",
    "cost_of_living_index": "Very High",
    "is_active": true,
    "locations_count": 2,
    "created_at": "2025-11-13T10:00:00.000Z"
  }
}
```

**Validations:**
- group_name is required and max 100 characters
- group_code is required, unique, and max 50 characters
- cost_of_living_index must be one of: Low, Medium, High, Very High
- At least one location mapping is recommended (warning if empty)
- Duplicate group_code should return 400 error

---

#### 2. Get All Location Groups
**Endpoint:** `POST /api/expense/admin/location-groups/list`

**Request Body:**
```json
{
  "is_active": true,
  "search": "Metro",
  "cost_of_living_index": "Very High",
  "limit": 50,
  "offset": 0,
  "sort_by": "group_name",
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
      "group_name": "Metro Cities Tier 1",
      "group_code": "LOC-METRO-T1",
      "group_description": "Major metropolitan cities...",
      "cost_of_living_index": "Very High",
      "is_active": true,
      "locations_count": 2,
      "created_at": "2025-11-13T10:00:00.000Z",
      "created_by_name": "Admin User"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "total_pages": 1,
    "current_page": 1
  }
}
```

---

#### 3. Get Location Group Details
**Endpoint:** `POST /api/expense/admin/location-groups/details`

**Request Body:**
```json
{
  "location_group_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "group_name": "Metro Cities Tier 1",
    "group_code": "LOC-METRO-T1",
    "group_description": "Major metropolitan cities with high cost of living",
    "cost_of_living_index": "Very High",
    "is_active": true,
    "locations": [
      {
        "id": 1,
        "country_id": 1,
        "country_name": "India",
        "state_id": 5,
        "state_name": "Delhi",
        "city_id": 10,
        "city_name": "New Delhi",
        "postal_code_range": "110001-110099"
      },
      {
        "id": 2,
        "country_id": 1,
        "country_name": "India",
        "state_id": 6,
        "state_name": "Maharashtra",
        "city_id": 15,
        "city_name": "Mumbai",
        "postal_code_range": "400001-400100"
      }
    ],
    "created_by": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "created_at": "2025-11-13T10:00:00.000Z",
    "updated_by": null,
    "updated_at": null,
    "change_history": []
  }
}
```

---

#### 4. Update Location Group
**Endpoint:** `POST /api/expense/admin/location-groups/update`

**Request Body:**
```json
{
  "location_group_id": 1,
  "group_name": "Metro Cities Tier 1 - Updated",
  "group_description": "Updated description",
  "cost_of_living_index": "High",
  "is_active": true,
  "locations": [
    {
      "id": 1,
      "country_id": 1,
      "state_id": 5,
      "city_id": 10,
      "postal_code_range": "110001-110099"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location group updated successfully",
  "data": {
    "id": 1,
    "group_name": "Metro Cities Tier 1 - Updated",
    "updated_at": "2025-11-13T11:00:00.000Z"
  }
}
```

**Note:**
- group_code cannot be updated once created
- Updating locations will delete old mappings and create new ones (soft delete old, insert new)
- Log change history in audit trail

---

#### 5. Delete Location Group
**Endpoint:** `POST /api/expense/admin/location-groups/delete`

**Request Body:**
```json
{
  "location_group_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location group deleted successfully"
}
```

**Validations:**
- Check if location group is used in any expense categories or policies
- If in use, return error: "Cannot delete location group as it is being used in expense categories/policies"
- Soft delete (set deleted_at, deleted_by)

---

#### 6. Get Location Dropdown Data
**Endpoint:** `POST /api/expense/admin/location-groups/locations/dropdown`

**Request Body:**
```json
{
  "country_id": 1,
  "state_id": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "countries": [
      { "id": 1, "name": "India", "code": "IN", "flag": "🇮🇳" }
    ],
    "states": [
      { "id": 5, "name": "Delhi", "country_id": 1 }
    ],
    "cities": [
      { "id": 10, "name": "New Delhi", "state_id": 5 }
    ]
  }
}
```

**Note:** Use existing HRMS location tables

---

## File Structure

```
src/
├── models/
│   └── expense/
│       ├── ExpenseLocationGroup.js
│       └── ExpenseLocationGroupMapping.js
│
└── microservices/
    └── expense/
        ├── controllers/
        │   └── admin/
        │       └── locationGroup.controller.js
        ├── services/
        │   └── locationGroup.service.js
        ├── routes/
        │   └── admin.expense.routes.js
        └── middleware/
            └── expenseAuth.middleware.js (reuse existing auth)
```

---

## Implementation Steps

### Step 1: Create Sequelize Models (Day 1)

**File:** `src/models/expense/ExpenseLocationGroup.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const ExpenseLocationGroup = sequelize.define('ExpenseLocationGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hrms_company',
      key: 'id'
    }
  },
  group_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  group_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  group_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cost_of_living_index: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Very High'),
    defaultValue: 'Medium'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'hrms_expense_location_groups',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = ExpenseLocationGroup;
```

**File:** `src/models/expense/ExpenseLocationGroupMapping.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const ExpenseLocationGroupMapping = sequelize.define('ExpenseLocationGroupMapping', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hrms_expense_location_groups',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hrms_countries',
      key: 'id'
    }
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hrms_states',
      key: 'id'
    }
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hrms_cities',
      key: 'id'
    }
  },
  postal_code_range: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'hrms_expense_location_group_mappings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ExpenseLocationGroupMapping;
```

**Define Associations:**
```javascript
// In models/index.js or association file
ExpenseLocationGroup.hasMany(ExpenseLocationGroupMapping, {
  foreignKey: 'location_group_id',
  as: 'locations'
});

ExpenseLocationGroupMapping.belongsTo(ExpenseLocationGroup, {
  foreignKey: 'location_group_id',
  as: 'locationGroup'
});
```

---

### Step 2: Create Service Layer (Day 2)

**File:** `src/microservices/expense/services/locationGroup.service.js`

Implement all business logic:
- Create location group with mappings (transaction)
- Get all location groups with filters and pagination
- Get location group details with all mappings
- Update location group (handle location mappings)
- Delete location group (check dependencies, soft delete)
- Get location dropdown data from HRMS tables

---

### Step 3: Create Controller (Day 2-3)

**File:** `src/microservices/expense/controllers/admin/locationGroup.controller.js`

Implement all controller methods:
- createLocationGroup
- getAllLocationGroups
- getLocationGroupDetails
- updateLocationGroup
- deleteLocationGroup
- getLocationDropdownData

Follow thin controller pattern - delegate to service layer

---

### Step 4: Create Routes (Day 3)

**File:** `src/microservices/expense/routes/admin.expense.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const locationGroupController = require('../controllers/admin/locationGroup.controller');
const { authenticateJWT, authorizeRoles } = require('../../../middleware/auth.middleware');

// Location Group Management APIs
router.post('/location-groups/create',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.createLocationGroup
);

router.post('/location-groups/list',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.getAllLocationGroups
);

router.post('/location-groups/details',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.getLocationGroupDetails
);

router.post('/location-groups/update',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.updateLocationGroup
);

router.post('/location-groups/delete',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.deleteLocationGroup
);

router.post('/location-groups/locations/dropdown',
  authenticateJWT,
  authorizeRoles(['admin']),
  locationGroupController.getLocationDropdownData
);

module.exports = router;
```

**Mount in main app:**
```javascript
// In src/app.js or src/index.js
app.use('/api/expense/admin', require('./microservices/expense/routes/admin.expense.routes'));
```

---

### Step 5: Testing (Day 4)

#### Unit Tests
- Test service layer methods
- Test validation logic
- Test duplicate detection

#### Integration Tests
- Test all API endpoints
- Test with Postman/Thunder Client
- Test error scenarios

#### Test Cases:
1. ✅ Create location group with valid data
2. ✅ Create location group with duplicate group_code (should fail)
3. ✅ Create location group without locations (should warn)
4. ✅ Get all location groups with filters
5. ✅ Get location group details
6. ✅ Update location group
7. ✅ Update location group - change locations
8. ✅ Delete unused location group
9. ✅ Try to delete location group in use (should fail)
10. ✅ Get location dropdown data

---

## Integration Points

### HRMS Tables Used:
1. `hrms_company` - For company_id filtering
2. `hrms_users` - For created_by, updated_by
3. `hrms_countries` - For country dropdown and mapping
4. `hrms_states` - For state dropdown and mapping
5. `hrms_cities` - For city dropdown and mapping

### Authentication:
- Use existing JWT authentication middleware
- Check user role (admin only)
- Get company_id from req.user

---

## Success Criteria

### Technical:
✅ All APIs working with proper validation
✅ Database schema created with proper indexes
✅ Sequelize models with associations
✅ Audit trail (created_by, updated_by, timestamps)
✅ Soft delete implementation
✅ Error handling and proper status codes
✅ Integration with HRMS location master

### Functional:
✅ Admin can create/update/delete location groups
✅ Admin can map multiple locations to a group
✅ Location groups can be filtered and searched
✅ Cannot delete location group if in use
✅ Dropdown data loads from HRMS tables

---

## Sample Data for Testing

```sql
-- Insert sample location group
INSERT INTO hrms_expense_location_groups
(company_id, group_name, group_code, group_description, cost_of_living_index, is_active, created_by)
VALUES
(1, 'Metro Cities Tier 1', 'LOC-METRO-T1', 'Major metropolitan cities with high cost of living', 'Very High', true, 1);

-- Insert location mappings
INSERT INTO hrms_expense_location_group_mappings
(location_group_id, country_id, state_id, city_id, postal_code_range, created_by)
VALUES
(1, 1, 5, 10, '110001-110099', 1),
(1, 1, 6, 15, '400001-400100', 1);
```

---

## Notes
- Keep code modular for future microservice extraction
- Follow existing HRMS coding standards
- Use transactions for create/update operations with mappings
- Log all changes for audit trail
- Handle errors gracefully with meaningful messages

---

**Estimated Duration:** 3-4 days
**Priority:** High
**Dependencies:** None (Foundation module)
