# Expense Management Module - Documentation

## Overview
This directory contains all documentation for the HRMS Expense Management module. The module is designed to be implemented in phases and can be extracted as an independent microservice in the future.

---

## Directory Structure

```
docs/expense/
├── README.md                           # This file - Overview and navigation
├── HRMS_Expense_Management_System.md  # Complete feature specification
├── IMPLEMENTATION_ROADMAP.md          # Phase-wise implementation plan
│
├── locationgroup/                     # Phase 1.1
│   └── IMPLEMENTATION_PROMPT.md       # ✅ Created - Ready to implement
│
├── category/                          # Phase 1.2
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── currency/                          # Phase 1.3
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── policy/                            # Phase 2.1
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── settings/                          # Phase 2.2
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── advance/                           # Phase 3.1
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── payment/                           # Phase 4.1
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
├── audit/                             # Phase 4.2
│   └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
│
└── reports/                           # Phase 5.1
    └── IMPLEMENTATION_PROMPT.md       # ⏳ To be created
```

---

## Code Location

Expense module code structure:
```
src/
├── models/
│   └── expense/              # All expense-related Sequelize models
│       ├── ExpenseLocationGroup.js
│       ├── ExpenseCategory.js
│       └── ...
│
└── microservices/
    └── expense/              # Main expense microservice code
        ├── controllers/
        ├── services/
        ├── routes/
        ├── middleware/
        └── utils/
```

This structure ensures:
- **Modularity:** Models separate, business logic in microservices
- **Separation:** Clear boundary from other HRMS modules
- **Future-ready:** Can be extracted as independent microservice
- **Scalability:** Can be deployed separately when needed

---

## Implementation Phases

### **Phase 1: Foundation (Week 1-3)**
Core master data setup

| Module | Status | Duration | Documentation |
|--------|--------|----------|---------------|
| 1.1 Location Group Management | 📋 Ready to start | 3-4 days | [IMPLEMENTATION_PROMPT.md](locationgroup/IMPLEMENTATION_PROMPT.md) |
| 1.2 Expense Category Management | ⏳ Pending | 5-7 days | To be created |
| 1.3 Currency Management | ⏳ Pending | 2-3 days | To be created |

### **Phase 2: Policy & Configuration (Week 4-5)**
Policy engine and system-wide settings

| Module | Status | Duration | Documentation |
|--------|--------|----------|---------------|
| 2.1 Expense Policy Management | ⏳ Pending | 5-6 days | To be created |
| 2.2 General Settings | ⏳ Pending | 3-4 days | To be created |

### **Phase 3: Core Functionality (Week 6-9)**
Employee-facing features

| Module | Status | Duration | Documentation |
|--------|--------|----------|---------------|
| 3.1 Advance Payment Management | ⏳ Pending | 4-5 days | To be created |
| 3.2 Expense Filing - All Types | ⏳ Pending | 11-13 days | To be created |
| 3.3 My Expenses Management | ⏳ Pending | 4-5 days | To be created |

### **Phase 4: Processing & Compliance (Week 10-12)**
Admin processing and audit

| Module | Status | Duration | Documentation |
|--------|--------|----------|---------------|
| 4.1 Admin Expense Management | ⏳ Pending | 6-7 days | To be created |
| 4.2 Payment Processing | ⏳ Pending | 7-8 days | To be created |
| 4.3 Audit & Compliance | ⏳ Pending | 4-5 days | To be created |

### **Phase 5: Analytics & Reporting (Week 13-14)**
Reporting and insights

| Module | Status | Duration | Documentation |
|--------|--------|----------|---------------|
| 5.1 Standard Reports | ⏳ Pending | 5-6 days | To be created |
| 5.2 Custom Report Builder | ⏳ Pending | 4-5 days | To be created |
| 5.3 Dashboards | ⏳ Pending | 4-5 days | To be created |

**Total Duration:** ~14 weeks (3.5 months)

---

## Getting Started

### Step 1: Read the Documentation
1. Start with [HRMS_Expense_Management_System.md](../HRMS_Expense_Management_System.md) for complete feature specifications
2. Review [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) for overall architecture and guidelines

### Step 2: Phase 1.1 - Location Group Management
1. Read [locationgroup/IMPLEMENTATION_PROMPT.md](locationgroup/IMPLEMENTATION_PROMPT.md)
2. Create database schema using provided SQL
3. Implement Sequelize models
4. Create service layer
5. Create controller
6. Create routes
7. Test all endpoints

### Step 3: Continue with Next Phases
After completing Phase 1.1, implementation prompts for other modules will be created.

---

## Key Design Principles

### 1. Microservice-Ready Architecture
```
src/
├── models/
│   └── expense/               # Database models (Sequelize)
│       ├── ExpenseLocationGroup.js
│       ├── ExpenseCategory.js
│       └── ...
│
└── microservices/
    └── expense/
        ├── controllers/       # Request handlers (thin layer)
        │   ├── admin/         # Admin-facing APIs
        │   ├── employee/      # Employee-facing APIs
        │   └── manager/       # Manager-facing APIs
        ├── services/          # Business logic (thick layer)
        ├── routes/            # API routes
        ├── middleware/        # Custom middleware
        └── utils/             # Helper functions
```

### 2. Database Design
- All tables prefix: `hrms_expense_*`
- Audit fields: created_by, created_at, updated_by, updated_at
- Soft delete: deleted_at, deleted_by
- Foreign keys to HRMS tables
- Proper indexes for performance

### 3. API Conventions
- **Method:** All APIs use POST (as per current HRMS pattern)
- **Authentication:** JWT from existing HRMS system
- **Request Body:** All parameters in JSON body
- **Response Format:**
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": {...},
    "pagination": {...}  // if applicable
  }
  ```

### 4. Integration Points
- **HRMS Employee Master:** Employee data, join/exit dates
- **HRMS Department Master:** Department allocation
- **HRMS Location Master:** Countries, states, cities
- **HRMS Workflow Engine:** Approval workflows
- **HRMS Holiday Calendar:** Date validations
- **HRMS Notification System:** Alerts
- **Future Payroll Module:** Payment integration

---

## Testing Strategy

### Unit Tests
- Service layer functions
- Validation logic
- Calculation logic

### Integration Tests
- API endpoints
- Database operations
- HRMS integrations

### End-to-End Tests
- Complete workflows
- Policy validations
- Approval processes

---

## Deployment Strategy

### Development
1. Create feature branch for each phase
2. Implement in `src/microservices/expense/`
3. Test locally with existing HRMS
4. Code review
5. Merge to development branch

### Staging
1. Deploy with database migrations
2. Test with sample data
3. Integration testing with HRMS modules
4. User acceptance testing

### Production
1. Phase-wise rollout
2. Monitor performance
3. Gather feedback
4. Iterate

---

## Module Dependencies

```
Location Groups (1.1)
  └─> Expense Categories (1.2)
        ├─> Currency Management (1.3)
        │
        └─> Expense Policy (2.1)
              ├─> General Settings (2.2)
              │
              └─> Advance Management (3.1)
                    │
                    ├─> Expense Filing (3.2)
                    │     └─> My Expenses (3.3)
                    │           │
                    │           └─> Admin Management (4.1)
                    │                 │
                    │                 ├─> Payment Processing (4.2)
                    │                 │
                    │                 └─> Audit & Compliance (4.3)
                    │                       │
                    │                       └─> Reports (5.1, 5.2, 5.3)
```

---

## Deferred Modules

These modules are NOT included in current scope and will be implemented later:

### 1. Vendor & Merchant Management
- Will be implemented after core expense functionality
- Basic vendor tracking may be included in initial version

### 2. Project & Cost Center Mapping
- Will be implemented with Timesheet module
- Ensures consistency with time tracking and project billing

### 3. External Integrations
- No third-party OCR (will build custom in-house solution)
- No external APIs for routes, maps, currency rates
- All features implemented with manual/internal data

---

## Support & Questions

For questions or clarifications:
1. Refer to feature specification: [HRMS_Expense_Management_System.md](../HRMS_Expense_Management_System.md)
2. Check implementation roadmap: [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
3. Review phase-specific prompts in respective folders
4. Consult with tech lead or project manager

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial documentation structure created |
| 1.1 | 2025-11-13 | Phase 1.1 (Location Groups) implementation prompt added |

---

## Next Steps

1. ✅ **Phase 1.1** - Implement Location Group Management (3-4 days)
2. ⏳ **Phase 1.2** - Create implementation prompt for Expense Category Management
3. ⏳ **Phase 1.3** - Create implementation prompt for Currency Management
4. ⏳ Continue with subsequent phases

---

**Last Updated:** 2025-11-13
**Maintained By:** Development Team
**Status:** In Progress - Phase 1.1 Ready
