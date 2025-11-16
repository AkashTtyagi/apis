# Expense Management - Implementation Roadmap

## Project Structure

### Code Location
All expense module code will be placed under:
```
src/microservices/expense/
```

This structure allows the expense module to be easily separated into an independent microservice in the future.

### Documentation Structure
```
docs/expense/
├── locationgroup/     # Phase 1.1
├── category/          # Phase 1.2
├── currency/          # Phase 1.3
├── policy/            # Phase 2.1
├── settings/          # Phase 2.2
├── advance/           # Phase 3.1
├── payment/           # Phase 4.1
├── audit/             # Phase 4.2
└── reports/           # Phase 5.1
```

---

## Implementation Phases

### **Phase 1: Foundation (Week 1-3)**
Core master data setup required for expense management

#### 1.1 Location Group Management
**Duration:** 3-4 days
**Documentation:** `docs/expense/locationgroup/`
**Dependencies:** None
**Priority:** High

**Deliverables:**
- Database schema for location groups
- CRUD APIs for location group management
- Integration with HRMS location master
- Admin UI for location group configuration

#### 1.2 Expense Category Management
**Duration:** 5-7 days
**Documentation:** `docs/expense/category/`
**Dependencies:** Location Group Management
**Priority:** High

**Deliverables:**
- Database schema for expense categories with all types (Amount, Mileage, Per Diem, Time-based)
- Custom fields configuration
- Expense limits (Global & Location-based)
- Filing rules configuration
- CRUD APIs for category management
- Admin UI for category setup

#### 1.3 Currency Management
**Duration:** 2-3 days
**Documentation:** `docs/expense/currency/`
**Dependencies:** None
**Priority:** Medium

**Deliverables:**
- Database schema for currency policies
- Exchange rate management (manual entry)
- CRUD APIs for currency management
- Admin UI for currency configuration

---

### **Phase 2: Policy & Configuration (Week 4-5)**
Policy engine and system-wide settings

#### 2.1 Expense Policy Management
**Duration:** 5-6 days
**Documentation:** `docs/expense/policy/`
**Dependencies:** Category Management, Location Groups
**Priority:** High

**Deliverables:**
- Database schema for expense policies
- Policy applicability rules (Employee, Department, Grade, Location)
- Category-policy mapping
- Overall spending caps
- Post-submission controls
- CRUD APIs for policy management
- Admin UI for policy configuration

#### 2.2 General Settings
**Duration:** 3-4 days
**Documentation:** `docs/expense/settings/`
**Dependencies:** None
**Priority:** Medium

**Deliverables:**
- System-wide settings configuration
- Submission window configuration
- Date & time settings
- Distance & mileage settings
- Violation detection rules
- Audit trail settings
- Admin UI for settings management

---

### **Phase 3: Core Functionality (Week 6-9)**
Employee-facing features

#### 3.1 Advance Payment Management
**Duration:** 4-5 days
**Documentation:** `docs/expense/advance/`
**Dependencies:** Policy Management, HRMS Workflow
**Priority:** High

**Deliverables:**
- Database schema for advance requests
- Advance request submission
- Approval workflow integration (HRMS)
- Advance disbursement tracking
- Settlement process
- Recovery management
- Employee & Admin APIs
- Employee & Admin UI

#### 3.2 Expense Filing - Leave Request
**Duration:** 5-6 days
**Documentation:** `docs/expense/category/`
**Dependencies:** Category Management, Policy Management, HRMS Workflow
**Priority:** High

**Deliverables:**
- Database schema for expense requests
- Leave expense filing (similar to leave application)
- Policy validation (limits, frequency, date rules)
- Document upload
- Employee expense submission API
- Employee UI for filing

#### 3.3 Expense Filing - Other Categories
**Duration:** 6-7 days
**Documentation:** `docs/expense/category/`
**Dependencies:** Expense Filing - Leave
**Priority:** High

**Deliverables:**
- On Duty expense filing
- WFH expense filing
- Mileage-based expense filing
- Per Diem expense filing
- Short Leave expense filing
- Regularization expense filing
- Category-specific validations
- Employee APIs & UI

#### 3.4 My Expenses & Request Management
**Duration:** 4-5 days
**Documentation:** `docs/expense/category/`
**Dependencies:** Expense Filing modules
**Priority:** High

**Deliverables:**
- View my expense requests (all types)
- Filter & search expenses
- Expense details view
- Withdraw expense request
- Edit draft expenses
- Expense status tracking
- Employee APIs & UI

---

### **Phase 4: Processing & Compliance (Week 10-12)**
Admin processing and audit features

#### 4.1 Admin Expense Management
**Duration:** 6-7 days
**Documentation:** `docs/expense/payment/`
**Dependencies:** Expense Filing, HRMS Workflow
**Priority:** High

**Deliverables:**
- View all expense requests (unified view)
- Advanced filtering & search
- Request details view
- Approve/Reject requests (via HRMS workflow override)
- Bulk approve/reject
- Admin dashboard with statistics
- Admin APIs & UI

#### 4.2 Payment Processing
**Duration:** 7-8 days
**Documentation:** `docs/expense/payment/`
**Dependencies:** Admin Expense Management, Advance Management
**Priority:** High

**Deliverables:**
- Database schema for payments
- Bank sheet generation (NEFT/RTGS/IMPS formats)
- Payment cycle configuration
- Advance adjustment in payments
- Manual reconciliation
- Payment status tracking
- Failed payment handling
- Finance APIs & UI

#### 4.3 Audit & Compliance
**Duration:** 4-5 days
**Documentation:** `docs/expense/audit/`
**Dependencies:** All expense modules
**Priority:** High

**Deliverables:**
- Comprehensive audit trail logging
- Policy violation detection
- Duplicate expense detection
- Compliance reports
- Audit log viewer
- Admin APIs & UI

---

### **Phase 5: Analytics & Reporting (Week 13-14)**
Reporting and insights

#### 5.1 Standard Reports
**Duration:** 5-6 days
**Documentation:** `docs/expense/reports/`
**Dependencies:** All expense modules
**Priority:** Medium

**Deliverables:**
- Expense summary report
- Pending approvals report
- Budget utilization report
- Payment status report
- Tax report
- Compliance report
- Mileage report
- Per Diem report
- Advance report
- Bank sheet report
- Report APIs & UI

#### 5.2 Custom Report Builder
**Duration:** 4-5 days
**Documentation:** `docs/expense/reports/`
**Dependencies:** Standard Reports
**Priority:** Low

**Deliverables:**
- Drag-drop report designer
- Custom field selection
- Filters and grouping
- Report scheduling
- Export functionality (CSV, Excel, PDF)
- Report builder UI

#### 5.3 Dashboards & Visualizations
**Duration:** 4-5 days
**Documentation:** `docs/expense/reports/`
**Dependencies:** Standard Reports
**Priority:** Medium

**Deliverables:**
- Executive dashboard
- Employee leaderboard
- Category analysis
- Policy violation summary
- Payment metrics
- Interactive charts
- Dashboard UI

---

## Implementation Guidelines

### Database Design Principles
1. All tables should have audit fields (created_by, created_at, updated_by, updated_at)
2. Soft delete support (deleted_at, deleted_by)
3. Foreign keys to HRMS tables (employees, departments, locations)
4. Use Sequelize models with proper associations
5. Migration files for all schema changes

### API Design Principles
1. Follow RESTful conventions (use POST for all APIs as per current pattern)
2. Request/response format consistent with existing HRMS APIs
3. Use existing authentication middleware (JWT)
4. Integrate with HRMS workflow engine for approvals
5. Proper error handling and validation

### Code Organization
```
src/
├── models/
│   └── expense/
│       ├── ExpenseLocationGroup.js
│       ├── ExpenseLocationGroupMapping.js
│       ├── ExpenseCategory.js
│       ├── CurrencyPolicy.js
│       ├── ExpensePolicy.js
│       ├── ExpenseRequest.js
│       ├── Advance.js
│       ├── Payment.js
│       └── ...
│
└── microservices/
    └── expense/
        ├── controllers/
        │   ├── admin/
        │   │   ├── locationGroup.controller.js
        │   │   ├── expenseCategory.controller.js
        │   │   ├── adminExpense.controller.js
        │   │   └── ...
        │   ├── employee/
        │   │   ├── employeeExpense.controller.js
        │   │   ├── advance.controller.js
        │   │   └── ...
        │   └── manager/
        │       └── managerExpense.controller.js
        ├── services/
        │   ├── locationGroup.service.js
        │   ├── expenseCategory.service.js
        │   ├── expensePolicy.service.js
        │   ├── expenseValidation.service.js
        │   ├── advance.service.js
        │   ├── payment.service.js
        │   └── ...
        ├── routes/
        │   ├── admin.expense.routes.js
        │   ├── employee.expense.routes.js
        │   └── manager.expense.routes.js
        ├── middleware/
        │   ├── expenseValidation.middleware.js
        │   └── ...
        └── utils/
            ├── bankSheetGenerator.js
            ├── policyValidator.js
            └── ...
```

### Integration Points
1. **HRMS Employee Master** - For employee data, join dates, exit dates
2. **HRMS Department Master** - For department allocation
3. **HRMS Location Master** - For location groups and filtering
4. **HRMS Workflow Engine** - For approval workflows
5. **HRMS Holiday Calendar** - For date validations
6. **HRMS Notification System** - For alerts and notifications
7. **Future: Payroll Module** - For payment integration and salary deductions

---

## Testing Strategy

### Unit Testing
- All service layer functions
- Validation logic
- Calculation logic (mileage, per diem, limits)

### Integration Testing
- API endpoints
- Database operations
- HRMS integrations

### End-to-End Testing
- Complete expense lifecycle (filing → approval → payment)
- Policy validation scenarios
- Workflow integrations

---

## Deployment Strategy

### Phase-wise Rollout
1. Deploy Phase 1 → Test with admin users
2. Deploy Phase 2 → Test with limited employees
3. Deploy Phase 3 → Pilot with one department
4. Deploy Phase 4 → Gradual rollout to all departments
5. Deploy Phase 5 → Full production

### Database Migrations
- Use Sequelize migrations
- Always include rollback scripts
- Test migrations on staging first

### Future Microservice Separation
The code structure under `src/microservices/expense/` allows for easy extraction into a separate microservice:
- Independent database (or schema)
- API Gateway for routing
- Separate deployment pipeline
- Service-to-service communication with HRMS

---

## Success Metrics

### Technical Metrics
- API response time < 500ms
- 99.9% uptime
- Zero data loss
- Audit trail for 100% operations

### Business Metrics
- Time to process expense: < 5 days
- Payment processing time: < 7 days
- Policy violation rate: < 5%
- User adoption: > 90%

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Total Estimated Duration:** 14 weeks (3.5 months)
