# Master Management System - Complete UI Implementation Guide

## Overview
This document provides complete specifications for building the Master Management UI modules with integration to existing backend APIs. All backend APIs are already implemented and tested.

**Covered Modules:**
1. Grade Management
2. Skill Management
3. Channel Management
4. Business Unit Management
5. Category Management
6. Branch Management
7. Location Management
8. Zone Management
9. Cost Center Management
10. Division Management

---

## Backend API Configuration

**Base URL:** `http://localhost:3000/api`
**Authentication:** Bearer Token in `Authorization` header
**Company Context:** Automatically injected from `req.user.company_id` (from JWT token)
**Request Format:** Mixed (POST for create/update, GET with query params for list)

---

## Common UI Pattern for All Master Modules

All master management modules follow a similar CRUD pattern. Below is the standard structure:

### Standard Page Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Module Name] Management          [+ Add New] [Export]   │
└──────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────┐
│ 🔍 [Search...]                                           │
│ Status: [All ▼] [Active ✓] [Inactive]                  │
│ [Additional Filters...]                                  │
│ [Clear Filters]                                          │
└──────────────────────────────────────────────────────────┘

Data Table:
┌──────────────────────────────────────────────────────────┐
│ Code      │ Name          │ [Specific] │ Status │ Actions│
├──────────────────────────────────────────────────────────┤
│ GRD001    │ Senior Grade  │ Level: 5   │ Active │ ✏️ 🗑️  │
│ GRD002    │ Junior Grade  │ Level: 2   │ Active │ ✏️ 🗑️  │
│ GRD003    │ Manager Grade │ Level: 8   │Inactive│ ✏️ 🗑️  │
└──────────────────────────────────────────────────────────┘

[Showing 1-10 of 45]  [< Previous] [1] [2] [3] [4] [Next >]
```

---

## Module 1: Grade Management

### 1.1 Grade List Page

**Route:** `/admin/grades`

**API Endpoint:**
```
POST /api/grades/list
Headers:
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
Body:
{
  "company_id": 1,      // From req.user.company_id
  "activeOnly": true    // Optional, default: true (false to get all)
}

Response:
{
  "success": true,
  "message": "Grades retrieved successfully",
  "data": {
    "grades": [
      {
        "grade_id": 1,
        "company_id": 1,
        "grade_code": "GRD001",
        "grade_name": "Senior Manager",
        "description": "Senior management grade",
        "level": 8,
        "is_active": true,
        "created_at": "2025-01-15T10:30:00.000Z",
        "updated_at": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Grade Management                  [+ Add Grade] [Export] │
└──────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search by code or name...                             │
│ Status: [All ▼] [Active ✓] [Inactive]                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Code    │ Grade Name       │ Level │ Description    │ Status │ Actions │
├──────────────────────────────────────────────────────────────┤
│ GRD001  │ Senior Manager   │   8   │ Senior mgmt... │ Active │ ✏️ 🗑️   │
│ GRD002  │ Manager          │   6   │ Management...  │ Active │ ✏️ 🗑️   │
│ GRD003  │ Executive        │   4   │ Executive...   │ Active │ ✏️ 🗑️   │
│ GRD004  │ Staff            │   2   │ Staff level    │Inactive│ ✏️ 🗑️   │
└──────────────────────────────────────────────────────────────┘
```

---

### 1.2 Create Grade Modal

**API Endpoint:**
```
POST /api/grades/create
Headers:
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
Body:
{
  "company_id": 1,           // From req.user.company_id
  "grade_code": "GRD001",
  "grade_name": "Senior Manager",
  "description": "Senior management grade",
  "level": 8
}

Response:
{
  "success": true,
  "message": "Grade created successfully",
  "data": {
    "grade": {
      "grade_id": 10,
      "grade_code": "GRD001",
      "grade_name": "Senior Manager",
      "description": "Senior management grade",
      "level": 8,
      "is_active": true
    }
  }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────┐
│  Add New Grade                       [✕]   │
├─────────────────────────────────────────────┤
│                                              │
│  Grade Code *                                │
│  ┌────────────────────────────────────┐    │
│  │ GRD001                             │    │
│  └────────────────────────────────────┘    │
│                                              │
│  Grade Name *                                │
│  ┌────────────────────────────────────┐    │
│  │ Senior Manager                     │    │
│  └────────────────────────────────────┘    │
│                                              │
│  Level *                                     │
│  ┌────────────────────────────────────┐    │
│  │ 8                                  │    │
│  └────────────────────────────────────┘    │
│  (1-10 scale)                                │
│                                              │
│  Description                                 │
│  ┌────────────────────────────────────┐    │
│  │ Senior management grade            │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                              │
├─────────────────────────────────────────────┤
│                  [Cancel]  [Create Grade]   │
└─────────────────────────────────────────────┘
```

**Validations:**
- Grade Code: Required, alphanumeric, max 20 chars, unique per company
- Grade Name: Required, min 2 chars, max 100 chars
- Level: Required, number between 1-10
- Description: Optional, max 500 chars

---

### 1.3 Update Grade

**API Endpoint:**
```
POST /api/grades/update
Body:
{
  "grade_id": 1,
  "grade_code": "GRD001",
  "grade_name": "Senior Manager Updated",
  "description": "Updated description",
  "level": 9,
  "is_active": true      // Can activate/deactivate
}

Response:
{
  "success": true,
  "message": "Grade updated successfully",
  "data": [1]  // Number of affected rows
}
```

**UI:** Same modal as Create, but pre-filled with existing data. Add toggle for "Active/Inactive" status.

---

## Module 2: Skill Management

### 2.1 Skill List Page

**Route:** `/admin/skills`

**API Endpoint:**
```
POST /api/skills/list
Body:
{
  "is_active": true,           // Optional filter
  "search": "java",            // Optional search
  "skill_category": "Technical", // Optional filter
  "id": 5                      // Optional: get specific skill
}

Response:
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": [
    {
      "skill_id": 1,
      "company_id": 1,
      "skill_name": "Java Programming",
      "skill_code": "SKILL001",
      "skill_category": "Technical",
      "description": "Java programming language",
      "proficiency_levels": ["Beginner", "Intermediate", "Advanced"],
      "is_active": true,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Skill Management                  [+ Add Skill] [Export] │
└──────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search skills...                                      │
│ Category: [All ▼] [Technical] [Soft Skills] [Language]  │
│ Status: [All ▼] [Active ✓] [Inactive]                  │
└──────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Code     │ Skill Name    │ Category  │ Proficiency    │ Status │ Actions │
├────────────────────────────────────────────────────────────────────┤
│ SKILL001 │ Java Program  │ Technical │ Beg, Int, Adv  │ Active │ ✏️ 🗑️   │
│ SKILL002 │ Communication │ Soft      │ Basic, Expert  │ Active │ ✏️ 🗑️   │
│ SKILL003 │ Spanish       │ Language  │ A1, A2, B1, B2 │ Active │ ✏️ 🗑️   │
└────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Create Skill Modal

**API Endpoint:**
```
POST /api/skills/create
Body:
{
  "skill_name": "Java Programming",
  "skill_code": "SKILL001",
  "skill_category": "Technical",
  "description": "Java programming language",
  "proficiency_levels": ["Beginner", "Intermediate", "Advanced"]
}

Response:
{
  "success": true,
  "message": "Skill created successfully",
  "data": {
    "skill_id": 10,
    "skill_name": "Java Programming",
    ...
  }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────┐
│  Add New Skill                        [✕]   │
├──────────────────────────────────────────────┤
│                                               │
│  Skill Code *                                 │
│  ┌─────────────────────────────────────┐    │
│  │ SKILL001                            │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Skill Name *                                 │
│  ┌─────────────────────────────────────┐    │
│  │ Java Programming                    │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Category *                                   │
│  ┌─────────────────────────────────────┐    │
│  │ Technical                        ▼  │    │
│  └─────────────────────────────────────┘    │
│  (Options: Technical, Soft Skills,            │
│   Language, Domain Knowledge)                 │
│                                               │
│  Description                                  │
│  ┌─────────────────────────────────────┐    │
│  │ Java programming language           │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Proficiency Levels *                         │
│  ┌─────────────────────────────────────┐    │
│  │ Beginner                   [Remove] │    │
│  ├─────────────────────────────────────┤    │
│  │ Intermediate               [Remove] │    │
│  ├─────────────────────────────────────┤    │
│  │ Advanced                   [Remove] │    │
│  └─────────────────────────────────────┘    │
│  [+ Add Level]                                │
│                                               │
├──────────────────────────────────────────────┤
│                   [Cancel]  [Create Skill]   │
└──────────────────────────────────────────────┘
```

---

### 2.3 Update Skill

**API Endpoint:**
```
POST /api/skills/update
Body:
{
  "skill_id": 1,
  "skill_name": "Updated Java Programming",
  "skill_code": "SKILL001",
  "skill_category": "Technical",
  "description": "Updated description",
  "proficiency_levels": ["Beginner", "Intermediate", "Advanced", "Expert"],
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Skill updated successfully",
  "data": { ... }
}
```

---

## Module 3: Channel Management

### 3.1 Channel List Page

**Route:** `/admin/channels`

**API Endpoint:**
```
POST /api/channels/list
Query Parameters:
?is_active=true
&search=retail
&channel_type=offline
&id=5

Response:
{
  "success": true,
  "message": "Channels retrieved successfully",
  "data": [
    {
      "channel_id": 1,
      "company_id": 1,
      "channel_code": "CHN001",
      "channel_name": "Retail Stores",
      "channel_type": "offline",
      "description": "Physical retail stores",
      "is_active": true,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Channel Management               [+ Add Channel] [Export]   │
└─────────────────────────────────────────────────────────────┘

Filters:
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search channels...                                       │
│ Type: [All ▼] [Online] [Offline] [Hybrid]                 │
│ Status: [All ▼] [Active ✓] [Inactive]                     │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Code    │ Channel Name  │ Type    │ Description   │ Status │ Actions │
├────────────────────────────────────────────────────────────────┤
│ CHN001  │ Retail Stores │ Offline │ Physical...   │ Active │ ✏️ 🗑️   │
│ CHN002  │ E-commerce    │ Online  │ Online store  │ Active │ ✏️ 🗑️   │
│ CHN003  │ Mobile App    │ Online  │ Mobile app    │ Active │ ✏️ 🗑️   │
└────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Create Channel

**API Endpoint:**
```
POST /api/channels/create
Body:
{
  "channel_code": "CHN001",
  "channel_name": "Retail Stores",
  "channel_type": "offline",     // Options: online, offline, hybrid
  "description": "Physical retail stores"
}

Response:
{
  "success": true,
  "message": "Channel created successfully",
  "data": { ... }
}
```

**Modal Layout:**

```
┌─────────────────────────────────────────────┐
│  Add New Channel                     [✕]   │
├─────────────────────────────────────────────┤
│                                              │
│  Channel Code *                              │
│  ┌────────────────────────────────────┐    │
│  │ CHN001                             │    │
│  └────────────────────────────────────┘    │
│                                              │
│  Channel Name *                              │
│  ┌────────────────────────────────────┐    │
│  │ Retail Stores                      │    │
│  └────────────────────────────────────┘    │
│                                              │
│  Channel Type *                              │
│  ⚪ Online  ⚫ Offline  ⚪ Hybrid            │
│                                              │
│  Description                                 │
│  ┌────────────────────────────────────┐    │
│  │ Physical retail stores             │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                              │
├─────────────────────────────────────────────┤
│                 [Cancel]  [Create Channel]  │
└─────────────────────────────────────────────┘
```

---

### 3.3 Update Channel

**API Endpoint:**
```
POST /api/channels/update/:id
Body:
{
  "channel_code": "CHN001",
  "channel_name": "Updated Retail Stores",
  "channel_type": "offline",
  "description": "Updated description",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Channel updated successfully",
  "data": { ... }
}
```

---

## Module 4: Business Unit Management

### 4.1 Business Unit List Page

**Route:** `/admin/business-units`

**API Endpoint:**
```
POST /api/business-units/list
Query Parameters:
?is_active=true
&search=sales
&division_id=5
&id=10

Response:
{
  "success": true,
  "message": "Business units retrieved successfully",
  "data": [
    {
      "business_unit_id": 1,
      "company_id": 1,
      "business_unit_code": "BU001",
      "business_unit_name": "Sales Division",
      "division_id": 5,
      "description": "Sales business unit",
      "is_active": true,
      "division": {
        "division_id": 5,
        "division_name": "Commercial"
      }
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Business Unit Management     [+ Add Business Unit] [Export]  │
└──────────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search business units...                                  │
│ Division: [All ▼] [Commercial] [Operations] [Support]       │
│ Status: [All ▼] [Active ✓] [Inactive]                      │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Code  │ Business Unit  │ Division    │ Description  │ Status │ Actions │
├────────────────────────────────────────────────────────────────────┤
│ BU001 │ Sales Division │ Commercial  │ Sales BU     │ Active │ ✏️ 🗑️   │
│ BU002 │ Marketing      │ Commercial  │ Marketing    │ Active │ ✏️ 🗑️   │
│ BU003 │ Operations     │ Operations  │ Ops unit     │ Active │ ✏️ 🗑️   │
└────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Create Business Unit

**API Endpoint:**
```
POST /api/business-units/create
Body:
{
  "business_unit_code": "BU001",
  "business_unit_name": "Sales Division",
  "division_id": 5,              // Optional: Link to division
  "description": "Sales business unit"
}

Response:
{
  "success": true,
  "message": "Business unit created successfully",
  "data": { ... }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────┐
│  Add New Business Unit                [✕]   │
├──────────────────────────────────────────────┤
│                                               │
│  Business Unit Code *                         │
│  ┌─────────────────────────────────────┐    │
│  │ BU001                               │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Business Unit Name *                         │
│  ┌─────────────────────────────────────┐    │
│  │ Sales Division                      │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Division (Optional)                          │
│  ┌─────────────────────────────────────┐    │
│  │ Commercial                       ▼  │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Description                                  │
│  ┌─────────────────────────────────────┐    │
│  │ Sales business unit                 │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                               │
├──────────────────────────────────────────────┤
│            [Cancel]  [Create Business Unit]  │
└──────────────────────────────────────────────┘
```

---

### 4.3 Update Business Unit

**API Endpoint:**
```
POST /api/business-units/update/:id
Body:
{
  "business_unit_code": "BU001",
  "business_unit_name": "Updated Sales Division",
  "division_id": 5,
  "description": "Updated description",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Business unit updated successfully",
  "data": { ... }
}
```

---

## Module 5: Category Management

### 5.1 Category List Page

**Route:** `/admin/categories`

**API Endpoint:**
```
POST /api/categories/list
Query Parameters:
?is_active=true
&search=permanent
&id=5

Response:
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "category_id": 1,
      "company_id": 1,
      "category_code": "CAT001",
      "category_name": "Permanent",
      "description": "Permanent employees",
      "is_active": true
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Category Management            [+ Add Category] [Export] │
└──────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search categories...                                  │
│ Status: [All ▼] [Active ✓] [Inactive]                  │
└──────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Code    │ Category Name │ Description      │ Status │ Actions │
├────────────────────────────────────────────────────────────┤
│ CAT001  │ Permanent     │ Permanent emp... │ Active │ ✏️ 🗑️   │
│ CAT002  │ Contract      │ Contract emp...  │ Active │ ✏️ 🗑️   │
│ CAT003  │ Temporary     │ Temporary emp... │ Active │ ✏️ 🗑️   │
└────────────────────────────────────────────────────────────┘
```

---

### 5.2 Create Category

**API Endpoint:**
```
POST /api/categories/create
Body:
{
  "category_code": "CAT001",
  "category_name": "Permanent",
  "description": "Permanent employees"
}

Response:
{
  "success": true,
  "message": "Category created successfully",
  "data": { ... }
}
```

---

### 5.3 Update Category

**API Endpoint:**
```
POST /api/categories/update/:id
Body:
{
  "category_code": "CAT001",
  "category_name": "Updated Permanent",
  "description": "Updated description",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

---

## Module 6: Branch Management

### 6.1 Branch List Page

**Route:** `/admin/branches`

**API Endpoint:**
```
POST /api/branches/list
Query Parameters:
?is_active=true
&search=mumbai
&branch_type=regional
&region_id=5
&zone_id=10
&id=15

Response:
{
  "success": true,
  "message": "Branches retrieved successfully",
  "data": [
    {
      "branch_id": 1,
      "company_id": 1,
      "branch_code": "BR001",
      "branch_name": "Mumbai Branch",
      "branch_type": "regional",
      "region_id": 5,
      "zone_id": 10,
      "address": "Mumbai, Maharashtra",
      "is_active": true,
      "region": {
        "region_id": 5,
        "region_name": "West Region"
      },
      "zone": {
        "zone_id": 10,
        "zone_name": "Zone A"
      }
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Branch Management                [+ Add Branch] [Export]     │
└──────────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search branches...                                        │
│ Type: [All ▼] [Regional] [Local] [Head Office]             │
│ Region: [All ▼] [West] [East] [North] [South]              │
│ Zone: [All ▼] [Zone A] [Zone B] [Zone C]                   │
│ Status: [All ▼] [Active ✓] [Inactive]                      │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ Code  │ Branch Name │ Type     │ Region │ Zone   │ Status │ Actions   │
├────────────────────────────────────────────────────────────────────────┤
│ BR001 │ Mumbai      │ Regional │ West   │ Zone A │ Active │ ✏️ 🗑️ 📍  │
│ BR002 │ Delhi       │ Regional │ North  │ Zone B │ Active │ ✏️ 🗑️ 📍  │
│ BR003 │ Bangalore   │ Regional │ South  │ Zone C │ Active │ ✏️ 🗑️ 📍  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Create Branch

**API Endpoint:**
```
POST /api/branches/create
Body:
{
  "branch_code": "BR001",
  "branch_name": "Mumbai Branch",
  "branch_type": "regional",    // Options: regional, local, head_office
  "region_id": 5,               // Optional
  "zone_id": 10,                // Optional
  "address": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001",
  "contact_person": "John Doe",
  "contact_number": "+91-9876543210",
  "email": "mumbai@company.com"
}

Response:
{
  "success": true,
  "message": "Branch created successfully",
  "data": { ... }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────┐
│  Add New Branch                       [✕]   │
├──────────────────────────────────────────────┤
│                                               │
│  Branch Code *                                │
│  ┌─────────────────────────────────────┐    │
│  │ BR001                               │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Branch Name *                                │
│  ┌─────────────────────────────────────┐    │
│  │ Mumbai Branch                       │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Branch Type *                                │
│  ⚪ Regional  ⚫ Local  ⚪ Head Office        │
│                                               │
│  Region                                       │
│  ┌─────────────────────────────────────┐    │
│  │ West Region                      ▼  │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Zone                                         │
│  ┌─────────────────────────────────────┐    │
│  │ Zone A                           ▼  │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Address *                                    │
│  ┌─────────────────────────────────────┐    │
│  │ 123 Main Street, Mumbai             │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  City *          State *          Pincode    │
│  ┌──────────┐  ┌──────────┐    ┌─────────┐ │
│  │ Mumbai   │  │Maharashtra│    │ 400001  │ │
│  └──────────┘  └──────────┘    └─────────┘ │
│                                               │
│  Contact Person        Contact Number        │
│  ┌──────────────┐    ┌──────────────────┐  │
│  │ John Doe     │    │ +91-9876543210   │  │
│  └──────────────┘    └──────────────────┘  │
│                                               │
│  Email                                        │
│  ┌─────────────────────────────────────┐    │
│  │ mumbai@company.com                  │    │
│  └─────────────────────────────────────┘    │
│                                               │
├──────────────────────────────────────────────┤
│                 [Cancel]  [Create Branch]    │
└──────────────────────────────────────────────┘
```

---

### 6.3 Update Branch

**API Endpoint:**
```
POST /api/branches/update/:id
Body:
{
  "branch_code": "BR001",
  "branch_name": "Updated Mumbai Branch",
  "branch_type": "regional",
  "region_id": 5,
  "zone_id": 10,
  "address": "Updated address",
  "is_active": true,
  ...
}

Response:
{
  "success": true,
  "message": "Branch updated successfully",
  "data": { ... }
}
```

---

## Module 7: Location Management

### 7.1 Location List Page

**Route:** `/admin/locations`

**API Endpoint:**
```
POST /api/locations/list
Query Parameters:
?is_active=true
&search=warehouse
&location_type=warehouse
&branch_id=5
&id=10

Response:
{
  "success": true,
  "message": "Locations retrieved successfully",
  "data": [
    {
      "location_id": 1,
      "company_id": 1,
      "location_code": "LOC001",
      "location_name": "Main Warehouse",
      "location_type": "warehouse",
      "branch_id": 5,
      "address": "Industrial Area, Mumbai",
      "is_active": true,
      "branch": {
        "branch_id": 5,
        "branch_name": "Mumbai Branch"
      }
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ Location Management            [+ Add Location] [Export]     │
└──────────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search locations...                                       │
│ Type: [All ▼] [Office] [Warehouse] [Factory] [Showroom]    │
│ Branch: [All ▼] [Mumbai] [Delhi] [Bangalore]               │
│ Status: [All ▼] [Active ✓] [Inactive]                      │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Code   │ Location Name │ Type      │ Branch │ Status │ Actions   │
├────────────────────────────────────────────────────────────────────┤
│ LOC001 │ Main Warehouse│ Warehouse │ Mumbai │ Active │ ✏️ 🗑️ 📍  │
│ LOC002 │ Head Office   │ Office    │ Delhi  │ Active │ ✏️ 🗑️ 📍  │
│ LOC003 │ Showroom A    │ Showroom  │ Mumbai │ Active │ ✏️ 🗑️ 📍  │
└────────────────────────────────────────────────────────────────────┘
```

---

### 7.2 Create Location

**API Endpoint:**
```
POST /api/locations/create
Body:
{
  "location_code": "LOC001",
  "location_name": "Main Warehouse",
  "location_type": "warehouse",  // Options: office, warehouse, factory, showroom
  "branch_id": 5,                // Optional: Link to branch
  "address": "Industrial Area, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "capacity": 1000,              // Optional: sq ft or units
  "contact_person": "Jane Doe",
  "contact_number": "+91-9876543210"
}

Response:
{
  "success": true,
  "message": "Location created successfully",
  "data": { ... }
}
```

---

### 7.3 Update Location

**API Endpoint:**
```
POST /api/locations/update/:id
Body:
{
  "location_code": "LOC001",
  "location_name": "Updated Main Warehouse",
  "location_type": "warehouse",
  "branch_id": 5,
  "is_active": true,
  ...
}

Response:
{
  "success": true,
  "message": "Location updated successfully",
  "data": { ... }
}
```

---

## Module 8: Zone Management

### 8.1 Zone List Page

**Route:** `/admin/zones`

**API Endpoint:**
```
POST /api/zones/list
Query Parameters:
?is_active=true
&search=zone
&region_id=5
&id=10

Response:
{
  "success": true,
  "message": "Zones retrieved successfully",
  "data": [
    {
      "zone_id": 1,
      "company_id": 1,
      "zone_code": "ZONE001",
      "zone_name": "Zone A",
      "region_id": 5,
      "description": "Western zone A",
      "is_active": true,
      "region": {
        "region_id": 5,
        "region_name": "West Region"
      }
    }
  ]
}
```

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Zone Management                  [+ Add Zone] [Export]   │
└──────────────────────────────────────────────────────────┘

Filters:
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search zones...                                       │
│ Region: [All ▼] [West] [East] [North] [South]          │
│ Status: [All ▼] [Active ✓] [Inactive]                  │
└──────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Code     │ Zone Name │ Region │ Description │ Status │ Actions │
├───────────────────────────────────────────────────────────────┤
│ ZONE001  │ Zone A    │ West   │ Western...  │ Active │ ✏️ 🗑️   │
│ ZONE002  │ Zone B    │ East   │ Eastern...  │ Active │ ✏️ 🗑️   │
│ ZONE003  │ Zone C    │ North  │ Northern... │ Active │ ✏️ 🗑️   │
└───────────────────────────────────────────────────────────────┘
```

---

### 8.2 Create Zone

**API Endpoint:**
```
POST /api/zones/create
Body:
{
  "zone_code": "ZONE001",
  "zone_name": "Zone A",
  "region_id": 5,          // Optional: Link to region
  "description": "Western zone A",
  "zone_head": "John Manager",
  "contact_number": "+91-9876543210"
}

Response:
{
  "success": true,
  "message": "Zone created successfully",
  "data": { ... }
}
```

---

### 8.3 Update Zone

**API Endpoint:**
```
POST /api/zones/update/:id
Body:
{
  "zone_code": "ZONE001",
  "zone_name": "Updated Zone A",
  "region_id": 5,
  "description": "Updated description",
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Zone updated successfully",
  "data": { ... }
}
```

---

## Module 9: Cost Center Management

### 9.1 Cost Center List Page

**Route:** `/admin/cost-centers`

**API Endpoint:**
```
POST /api/cost-centers/list
Query Parameters:
?is_active=true
&search=marketing
&parent_cost_center_id=5
&id=10

Response:
{
  "success": true,
  "message": "Cost centers retrieved successfully",
  "data": [
    {
      "cost_center_id": 1,
      "company_id": 1,
      "cost_center_code": "CC001",
      "cost_center_name": "Marketing Department",
      "parent_cost_center_id": null,
      "description": "Marketing cost center",
      "budget_amount": 500000,
      "is_active": true,
      "parent": null,
      "children": [
        {
          "cost_center_id": 2,
          "cost_center_name": "Digital Marketing"
        }
      ]
    }
  ]
}
```

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│ Cost Center Management       [+ Add Cost Center] [Export]      │
└────────────────────────────────────────────────────────────────┘

Filters:
┌────────────────────────────────────────────────────────────────┐
│ 🔍 Search cost centers...                                      │
│ Parent: [All ▼] [Marketing] [Sales] [Operations]              │
│ Status: [All ▼] [Active ✓] [Inactive]                        │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Code  │ Cost Center      │ Parent    │ Budget    │ Status │ Actions    │
├─────────────────────────────────────────────────────────────────────────┤
│ CC001 │ Marketing Dept   │ -         │ 500,000   │ Active │ ✏️ 🗑️ 👁️   │
│ CC002 │  └ Digital Mktg  │ Marketing │ 200,000   │ Active │ ✏️ 🗑️      │
│ CC003 │  └ Print Media   │ Marketing │ 100,000   │ Active │ ✏️ 🗑️      │
│ CC004 │ Sales Dept       │ -         │ 300,000   │ Active │ ✏️ 🗑️ 👁️   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 9.2 Create Cost Center

**API Endpoint:**
```
POST /api/cost-centers/create
Body:
{
  "cost_center_code": "CC001",
  "cost_center_name": "Marketing Department",
  "parent_cost_center_id": null,    // Optional: for hierarchical structure
  "description": "Marketing cost center",
  "budget_amount": 500000,
  "manager_id": 25,                 // Optional: Employee managing this
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}

Response:
{
  "success": true,
  "message": "Cost center created successfully",
  "data": { ... }
}
```

**Modal Layout:**

```
┌──────────────────────────────────────────────┐
│  Add New Cost Center                  [✕]   │
├──────────────────────────────────────────────┤
│                                               │
│  Cost Center Code *                           │
│  ┌─────────────────────────────────────┐    │
│  │ CC001                               │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Cost Center Name *                           │
│  ┌─────────────────────────────────────┐    │
│  │ Marketing Department                │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Parent Cost Center (Optional)                │
│  ┌─────────────────────────────────────┐    │
│  │ None                             ▼  │    │
│  └─────────────────────────────────────┘    │
│  (For creating sub-cost centers)              │
│                                               │
│  Budget Amount                                │
│  ┌─────────────────────────────────────┐    │
│  │ 500000                              │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Manager (Optional)                           │
│  ┌─────────────────────────────────────┐    │
│  │ John Doe                         ▼  │    │
│  └─────────────────────────────────────┘    │
│                                               │
│  Period                                       │
│  Start: [2025-01-01 📅]                      │
│  End:   [2025-12-31 📅]                      │
│                                               │
│  Description                                  │
│  ┌─────────────────────────────────────┐    │
│  │ Marketing cost center               │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                               │
├──────────────────────────────────────────────┤
│            [Cancel]  [Create Cost Center]    │
└──────────────────────────────────────────────┘
```

---

### 9.3 Update Cost Center

**API Endpoint:**
```
POST /api/cost-centers/update/:id
Body:
{
  "cost_center_code": "CC001",
  "cost_center_name": "Updated Marketing Department",
  "parent_cost_center_id": null,
  "budget_amount": 600000,
  "is_active": true,
  ...
}

Response:
{
  "success": true,
  "message": "Cost center updated successfully",
  "data": { ... }
}
```

---

## Module 10: Division Management

**Note:** Division management is part of the unified master data API and doesn't have dedicated routes. It can be managed through the master data endpoints or can be added as a separate module following the same pattern as other organizational modules.

### 10.1 Division List (Via Master API)

**API Endpoint:**
```
POST /api/master/data
Body:
{
  "master_type": "division",
  "filters": {
    "is_active": true
  },
  "search": "commercial"
}

Response:
{
  "success": true,
  "message": "Master data retrieved successfully",
  "data": [
    {
      "division_id": 1,
      "company_id": 1,
      "division_code": "DIV001",
      "division_name": "Commercial",
      "description": "Commercial division",
      "head_employee_id": 25,
      "is_active": true
    }
  ]
}
```

**Alternative:** If you want dedicated division routes, follow the same pattern as other modules (create separate routes/controllers).

---

## Common Features Across All Modules

### 1. Search Functionality
- Real-time search across code, name, and description fields
- Debounce search input (300ms delay)
- Clear search button

### 2. Filters
- Status filter (Active/Inactive/All)
- Module-specific filters (e.g., division_id for business units)
- Clear all filters button
- Persist filters in URL query params

### 3. Bulk Actions
```
┌────────────────────────────────────────────────┐
│ ☑ Select All (25 items)                       │
│ Selected: 3 items                              │
│ [Activate] [Deactivate] [Export Selected]     │
└────────────────────────────────────────────────┘
```

### 4. Export Functionality
- Export to Excel (.xlsx)
- Export to CSV
- Export to PDF
- Include filters in export

### 5. Import Functionality (Optional)
```
┌────────────────────────────────────────────┐
│  Import [Module Name]              [✕]    │
├────────────────────────────────────────────┤
│                                             │
│  [Download Template]                        │
│                                             │
│  ┌───────────────────────────────────┐    │
│  │  Drag & drop Excel file here      │    │
│  │  or click to browse                │    │
│  └───────────────────────────────────┘    │
│                                             │
│  Instructions:                              │
│  1. Download the template                   │
│  2. Fill in the data                        │
│  3. Upload the completed file               │
│                                             │
├────────────────────────────────────────────┤
│                [Cancel]  [Import]          │
└────────────────────────────────────────────┘
```

### 6. Delete Confirmation
```
┌────────────────────────────────────┐
│ Delete [Module Name]?              │
├────────────────────────────────────┤
│                                    │
│ Are you sure you want to delete:   │
│ • [Name] ([Code])                  │
│                                    │
│ This action cannot be undone.      │
│                                    │
│ [Cancel]  [Delete]                 │
└────────────────────────────────────┘
```

### 7. Activate/Deactivate Toggle
- In update modal, add toggle switch for is_active
- Visual indicator in list (green dot for active, gray for inactive)
- Bulk activate/deactivate action

---

## Authentication & Headers

**All API requests require:**

```javascript
headers: {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
}
```

**Company ID is automatically extracted from JWT token** via `req.user.company_id`

**Getting token from login:**
```
POST /api/auth/login
Body:
{
  "email": "user@company.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "company_id": 1,
      "employee_id": 25,
      ...
    }
  }
}
```

---

## Error Handling

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes:
- `200` - Success (GET, POST update)
- `201` - Created (POST create)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

### Error Handling in UI:

```javascript
try {
  const response = await api.post('/grades/create', data);

  if (response.data.success) {
    toast.success(response.data.message);
    // Refresh list
    fetchGrades();
    // Close modal
    setModalOpen(false);
  }
} catch (error) {
  if (error.response) {
    const message = error.response.data.message || 'Something went wrong';
    toast.error(message);

    if (error.response.status === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.response.status === 400) {
      // Show validation errors
      setFieldErrors(error.response.data.errors);
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

---

## UI Components & Styling

### Color Scheme:

```css
/* Status Colors */
--active: #4CAF50;             /* Green */
--inactive: #9E9E9E;           /* Gray */
--pending: #FF9800;            /* Orange */

/* UI Colors */
--primary: #1976D2;            /* Blue */
--secondary: #FFA726;          /* Orange */
--success: #4CAF50;            /* Green */
--warning: #FF9800;            /* Amber */
--error: #F44336;              /* Red */
--info: #2196F3;               /* Light Blue */

/* Background Colors */
--bg-primary: #F5F5F5;         /* Light Gray */
--bg-surface: #FFFFFF;         /* White */
--bg-hover: #F0F0F0;           /* Hover state */

/* Text Colors */
--text-primary: #212121;       /* Dark */
--text-secondary: #757575;     /* Gray */
--text-disabled: #BDBDBD;      /* Light Gray */

/* Border Colors */
--border-light: #E0E0E0;
--border-medium: #BDBDBD;
--border-dark: #9E9E9E;
```

### Toast Notifications:

```javascript
// Success
toast.success("Grade created successfully");

// Error
toast.error("Failed to create grade");

// Warning
toast.warning("This will deactivate the grade");

// Info
toast.info("Loading data...");
```

### Loading States:

```html
<!-- Button Loading -->
<button disabled>
  <span class="spinner"></span>
  Creating...
</button>

<!-- Table Loading (Skeleton) -->
<div class="skeleton-table">
  <div class="skeleton-row">
    <div class="skeleton-cell"></div>
    <div class="skeleton-cell"></div>
    <div class="skeleton-cell"></div>
  </div>
</div>

<!-- Page Loading -->
<div class="loading-overlay">
  <div class="spinner-large"></div>
  <p>Loading grades...</p>
</div>
```

### Data Table Component:

```javascript
// Use libraries like:
// - React Table / TanStack Table
// - AG Grid
// - Material-UI DataGrid
// - Ant Design Table

Features needed:
- Sorting (click column headers)
- Pagination (client-side or server-side)
- Row selection (checkboxes)
- Inline editing (optional)
- Responsive design
- Empty state
- Loading state
```

---

## Implementation Checklist

### Phase 1: Foundation (All Modules)
- [ ] Setup API service layer with axios
- [ ] Configure authentication interceptors
- [ ] Implement error handling middleware
- [ ] Setup routing for all master modules
- [ ] Create base layout components
- [ ] Implement common data table component
- [ ] Create common modal component
- [ ] Setup toast notifications

### Phase 2: Grade Management
- [ ] Grade list page with filters
- [ ] Create grade modal
- [ ] Edit grade functionality
- [ ] Delete grade with confirmation
- [ ] Activate/deactivate toggle
- [ ] Search functionality
- [ ] Export to Excel/CSV

### Phase 3: Skill Management
- [ ] Skill list page with filters
- [ ] Create skill modal with proficiency levels
- [ ] Edit skill functionality
- [ ] Delete skill
- [ ] Category filter
- [ ] Export functionality

### Phase 4: Channel Management
- [ ] Channel list page
- [ ] Create/Edit channel
- [ ] Channel type filter
- [ ] Delete channel

### Phase 5: Business Unit Management
- [ ] Business unit list page
- [ ] Create/Edit business unit
- [ ] Division filter
- [ ] Delete business unit

### Phase 6: Category Management
- [ ] Category list page
- [ ] Create/Edit category
- [ ] Delete category

### Phase 7: Branch Management
- [ ] Branch list page with advanced filters
- [ ] Create/Edit branch with location details
- [ ] Region/Zone filters
- [ ] Branch type filter
- [ ] Map integration (optional)
- [ ] Delete branch

### Phase 8: Location Management
- [ ] Location list page
- [ ] Create/Edit location
- [ ] Location type filter
- [ ] Branch filter
- [ ] Delete location

### Phase 9: Zone Management
- [ ] Zone list page
- [ ] Create/Edit zone
- [ ] Region filter
- [ ] Delete zone

### Phase 10: Cost Center Management
- [ ] Cost center list page
- [ ] Create/Edit cost center
- [ ] Hierarchical tree view
- [ ] Parent cost center filter
- [ ] Budget tracking
- [ ] Delete cost center

### Phase 11: Division Management (Optional)
- [ ] Division list page
- [ ] Create/Edit division
- [ ] Delete division

### Phase 12: Common Features
- [ ] Bulk actions (activate/deactivate)
- [ ] Import functionality (Excel upload)
- [ ] Advanced search
- [ ] Column visibility toggle
- [ ] Saved filters
- [ ] Recently viewed items

### Phase 13: Polish & Testing
- [ ] Loading states for all operations
- [ ] Error handling and user feedback
- [ ] Form validations
- [ ] Responsive design (mobile/tablet)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User acceptance testing

---

## API Summary Table

| Module | Create Endpoint | Update Endpoint | List Endpoint | Request Type |
|--------|----------------|-----------------|---------------|--------------|
| Grade | POST /api/grades/create | POST /api/grades/update | POST /api/grades/list | POST (body) |
| Skill | POST /api/skills/create | POST /api/skills/update | POST /api/skills/list | POST (body) |
| Channel | POST /api/channels/create | POST /api/channels/update/:id | POST /api/channels/list | POST / GET (query) |
| Business Unit | POST /api/business-units/create | POST /api/business-units/update/:id | POST /api/business-units/list | POST / GET (query) |
| Category | POST /api/categories/create | POST /api/categories/update/:id | POST /api/categories/list | POST / GET (query) |
| Branch | POST /api/branches/create | POST /api/branches/update/:id | POST /api/branches/list | POST / GET (query) |
| Location | POST /api/locations/create | POST /api/locations/update/:id | POST /api/locations/list | POST / GET (query) |
| Zone | POST /api/zones/create | POST /api/zones/update/:id | POST /api/zones/list | POST / GET (query) |
| Cost Center | POST /api/cost-centers/create | POST /api/cost-centers/update/:id | POST /api/cost-centers/list | POST / GET (query) |
| Division | POST /api/master/data | - | POST /api/master/data | POST (body) |

---

## Best Practices

1. **Consistent UI/UX**: Use the same layout pattern for all modules
2. **Validation**: Client-side validation before API calls
3. **Confirmation Dialogs**: Always confirm destructive actions (delete)
4. **Loading States**: Show loading indicators during API calls
5. **Error Messages**: Display clear, user-friendly error messages
6. **Success Feedback**: Show success toasts after operations
7. **Optimistic Updates**: Update UI immediately, revert on error
8. **Caching**: Cache frequently accessed data (e.g., dropdown options)
9. **Debouncing**: Debounce search inputs to reduce API calls
10. **Accessibility**: Ensure keyboard navigation and screen reader support

---

## Testing Recommendations

### Unit Tests:
- Form validation logic
- Data transformation functions
- API service layer

### Integration Tests:
- CRUD operations for each module
- Filter and search functionality
- Bulk actions

### E2E Tests:
- Complete user flows (create → edit → delete)
- Navigation between modules
- Error handling scenarios

---

## Support & Questions

If you encounter any issues with the APIs or need clarification:
1. Check the controller files for exact request/response formats
2. Check backend logs for detailed error messages
3. Use Postman to test API endpoints independently
4. Refer to the model files for data structure

---

**Good luck with the implementation! 🚀**
