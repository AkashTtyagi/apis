# HRMS Policy Management System

## Overview
Complete Employee Policy Management System with version control, flexible applicability rules (following workflow pattern), force acknowledgment with ESS blocking, notifications, and audit trails.

## Features Implemented

### 1. Policy Categories
- Create, update, and list policy categories
- Categories organize policies (HR Policies, IT Policies, Code of Conduct, etc.)
- Sortable with display order

### 2. Policy CRUD Operations
- **Create Policy**: Define policy with acknowledgment requirements
- **Update Policy**: Modify policy settings
- **Delete Policy**: Soft delete policies
- **List Policies**: Filter by category, acknowledgment requirements, status
- **Policy Details**: Get complete policy information with versions and applicability

### 3. Version Control
- **Create Versions**: Add new versions with change tracking
- **Publish Versions**: Make a version active
- **Rollback**: Revert to previous versions
- **Version History**: Track all changes with previous_version_id linkage
- **Change Summary**: Document what changed between versions

### 4. Policy Applicability (Following Workflow Pattern)
The applicability system uses the EXACT same pattern as `HrmsWorkflowApplicability`:

#### Applicability Types
- `company`: Apply to entire company
- `entity`: Apply to specific entities
- `location`: Apply to specific locations
- `level`: Apply to specific employee levels
- `designation`: Apply to specific designations
- `department`: Apply to specific departments
- `sub_department`: Apply to specific sub-departments
- `employee`: Apply to specific employees
- `grade`: Apply to specific grades

#### How It Works
```json
{
  "policy_id": 1,
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "1",
      "is_excluded": false,
      "priority": 1
    },
    {
      "applicability_type": "department",
      "applicability_value": "5",
      "is_excluded": true,
      "priority": 2
    }
  ]
}
```

This means: Apply to entire company (id=1) EXCEPT department id=5

#### Advanced Filtering
You can add secondary filters:
```json
{
  "applicability_type": "designation",
  "applicability_value": "1,2,3",
  "advanced_applicability_type": "location",
  "advanced_applicability_value": "10,11"
}
```

This means: Managers (designation 1,2,3) at Mumbai & Delhi locations (10,11)

#### Key Fields
- `applicability_type`: Primary filter (ENUM)
- `applicability_value`: Comma-separated IDs (TEXT)
- `is_excluded`: Include/Exclude logic (BOOLEAN)
- `advanced_applicability_type`: Secondary filter (STRING)
- `advanced_applicability_value`: Secondary IDs (TEXT)
- `priority`: Conflict resolution (lower = higher priority)

### 5. Force Acknowledgment & ESS Blocking
- **requires_acknowledgment**: Policy needs employee acknowledgment
- **force_acknowledgment**: Block complete ESS access if not acknowledged
- **grace_period_days**: Days before blocking starts (0 = immediate)
- **ESS Blocking**: Employee cannot access ANY ESS functionality until acknowledged

### 6. Acknowledgment Tracking
- Track assignment date, assigned by
- Record acknowledgment timestamp, IP, device
- Optional employee comments
- Due dates with reminder tracking
- Grace period management
- ESS block status

### 7. Audit Trail
Complete event logging:
- `assigned`: Policy assigned to employee
- `viewed`: Employee viewed policy
- `acknowledged`: Employee acknowledged policy
- `reminder_sent`: Reminder notification sent
- `ess_blocked`: ESS access blocked
- `ess_unblocked`: ESS access restored
- `re_assigned`: Policy re-assigned

Each event captures:
- Who performed action (or system)
- When it happened
- IP address & user agent
- Additional contextual data (JSON)

### 8. Notification System
- **Notification Types**:
  - `assignment`: Policy assigned
  - `reminder`: Pending acknowledgment reminder
  - `escalation`: Overdue escalation
  - `ess_blocking_warning`: Warning before blocking
  - `version_update`: New version published

- **Channels**: email, in_app, sms, push
- **Status Tracking**: pending, sent, failed, cancelled
- **Retry Logic**: Configurable retry count
- **Scheduled Delivery**: Queue-based notification system

### 9. Policy Attachments
- Support for PDF, DOC, DOCX, images
- Version-specific or policy-wide attachments
- File size tracking
- MIME type validation
- Display order management

## Database Tables Created

### Core Tables
1. **hrms_policy_categories**: Policy categories
2. **hrms_policies**: Master policies table
3. **hrms_policy_versions**: Version history with rollback
4. **hrms_policy_attachments**: File attachments
5. **hrms_policy_applicability**: Who should see this policy (workflow pattern)
6. **hrms_employee_policy_acknowledgments**: Employee acknowledgment tracking
7. **hrms_policy_acknowledgment_audit**: Complete audit trail
8. **hrms_policy_notifications**: Notification queue

## Files Created

### Database Migration
- `database/migrations/policy/001_create_policy_tables.sql`

### Models (Sequelize)
- `src/models/policy/HrmsPolicyCategory.js`
- `src/models/policy/HrmsPolicy.js`
- `src/models/policy/HrmsPolicyVersion.js`
- `src/models/policy/HrmsPolicyAttachment.js`
- `src/models/policy/HrmsPolicyApplicability.js` (follows workflow pattern)
- `src/models/policy/HrmsEmployeePolicyAcknowledgment.js`
- `src/models/policy/HrmsPolicyAcknowledgmentAudit.js`
- `src/models/policy/HrmsPolicyNotification.js`
- `src/models/policy/index.js`

### Service Layer
- `src/services/policy.service.js`
  - Category management
  - Policy CRUD operations
  - Version control with rollback
  - Applicability management
  - Assignment and acknowledgment logic
  - ESS blocking checks

### Controllers
- `src/controllers/policy.controller.js`
  - All HTTP request handlers
  - Input validation
  - Error handling

### Routes
- `src/routes/policy.routes.js`
  - All API endpoints defined
- Updated `src/routes/index.js` to register policy routes

### Postman Collection
- `postman/Policy_Management_Folder.json`
  - Complete API collection ready to import
  - Examples for all use cases

## API Endpoints

### Policy Categories
```
POST /api/policy/categories/create
POST /api/policy/categories/list
POST /api/policy/categories/update
```

### Policy CRUD
```
POST /api/policy/create
POST /api/policy/list
POST /api/policy/details
POST /api/policy/update
POST /api/policy/delete
```

### Version Management
```
POST /api/policy/version/create
POST /api/policy/version/publish
POST /api/policy/version/rollback
```

### Applicability
```
POST /api/policy/applicability/set
POST /api/policy/applicability/get
```

### Assignment
```
POST /api/policy/assign
```

### Employee Actions
```
POST /api/policy/employee/pending
POST /api/policy/employee/check-block
POST /api/policy/employee/acknowledge
```

## Setup Instructions

### 1. Run Database Migration
```bash
# Execute the SQL file
mysql -u your_user -p your_database < database/migrations/policy/001_create_policy_tables.sql
```

### 2. Server Already Configured
The routes are already registered in `src/routes/index.js`:
```javascript
router.use('/policy', policyRoutes);
```

### 3. Import Postman Collection
1. Open Postman
2. Import `postman/Policy_Management_Folder.json`
3. The folder will be added to your existing HRMS collection
4. Set environment variables:
   - `base_url`: http://localhost:3000/api
   - `company_id`: Your company ID
   - `employee_id`: Your employee ID

## Usage Examples

### Example 1: Create Company-Wide Policy
```javascript
// 1. Create policy
POST /api/policy/create
{
  "company_id": 1,
  "category_id": 1,
  "policy_title": "Code of Conduct 2025",
  "policy_slug": "code_of_conduct_2025",
  "requires_acknowledgment": true,
  "force_acknowledgment": true,
  "grace_period_days": 7
}

// 2. Set applicability (entire company)
POST /api/policy/applicability/set
{
  "policy_id": 1,
  "applicability_rules": [
    {
      "applicability_type": "company",
      "applicability_value": "1",
      "is_excluded": false,
      "priority": 1
    }
  ]
}

// 3. Assign to employees
POST /api/policy/assign
{
  "policy_id": 1
}
```

### Example 2: Department-Specific Policy with Exclusions
```javascript
// Apply to IT department (id=3) EXCEPT senior managers (designation=5)
POST /api/policy/applicability/set
{
  "policy_id": 2,
  "applicability_rules": [
    {
      "applicability_type": "department",
      "applicability_value": "3",
      "is_excluded": false,
      "priority": 1
    },
    {
      "applicability_type": "designation",
      "applicability_value": "5",
      "is_excluded": true,
      "priority": 2
    }
  ]
}
```

### Example 3: Employee Acknowledges Policy
```javascript
// Employee checks pending policies
POST /api/policy/employee/pending
{
  "employee_id": 10
}

// Employee acknowledges
POST /api/policy/employee/acknowledge
{
  "acknowledgment_id": 1,
  "employee_id": 10,
  "acknowledgment_comments": "I have read and understood the policy"
}
```

### Example 4: Version Management
```javascript
// Create new version
POST /api/policy/version/create
{
  "policy_id": 1,
  "version_title": "Code of Conduct v2.0",
  "version_description": "Updated with remote work guidelines",
  "policy_content": "<h1>Updated Policy Content</h1>",
  "change_summary": "Added remote work section",
  "publish_immediately": false
}

// Publish version when ready
POST /api/policy/version/publish
{
  "version_id": 2
}

// Rollback if needed
POST /api/policy/version/rollback
{
  "policy_id": 1,
  "target_version_number": 1
}
```

## Key Design Decisions

### 1. ESS Blocking Strategy
- Initially considered module-specific blocking (attendance, leave, etc.)
- **Final decision**: Block entire ESS access for simplicity
- Removed `hrms_employee_module_blocks` table
- Employee cannot access ANY ESS feature until acknowledged

### 2. Applicability Pattern
- **Followed exact pattern** from `HrmsWorkflowApplicability` model
- Uses `applicability_value` (TEXT, comma-separated IDs) instead of multiple nullable columns
- Supports advanced filtering with secondary criteria
- `is_excluded` for exclusion logic
- `priority` for conflict resolution

### 3. Soft Deletes
- All main entities support soft delete (`deleted_at`)
- Audit logs are permanent (no soft delete)
- Maintains data integrity and history

### 4. Grace Periods
- Configurable per policy
- `grace_period_days = 0` means immediate blocking
- `grace_period_days > 0` gives employees time to acknowledge
- Grace period tracked in acknowledgment records

## Future Enhancements (Not Implemented)

1. **Employee Matching Logic**: Complete implementation in `assignPolicyToEmployees` to match employees based on applicability rules

2. **Notification Worker**: Background job to process notification queue and send emails/SMS

3. **Analytics Dashboard**: Endpoints for:
   - Policy acknowledgment rates
   - Overdue acknowledgments
   - Department-wise compliance
   - Version adoption tracking

4. **ESS Middleware**: Middleware to check policy blocks before allowing ESS access

5. **Bulk Operations**: Bulk policy assignment/revocation

6. **Policy Templates**: Pre-built policy templates for common use cases

7. **Digital Signatures**: Capture employee signature on acknowledgment

8. **Policy Quiz**: Optional quiz before acknowledgment

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Create policy categories via API
- [ ] Create policies with different acknowledgment settings
- [ ] Set applicability rules (company, department, employee levels)
- [ ] Create and publish policy versions
- [ ] Test rollback functionality
- [ ] Assign policies to employees
- [ ] Check employee pending policies
- [ ] Acknowledge policies as employee
- [ ] Verify ESS block status changes
- [ ] Check audit logs are created
- [ ] Test with multiple applicability rules and exclusions

## Notes

- All timestamps use MySQL TIMESTAMP type
- JSON fields used for flexible data (notification_channels, additional_data)
- Indexes optimized for common queries
- Foreign key constraints maintain referential integrity
- Follows existing HRMS patterns for consistency

## Support

For issues or questions, refer to:
1. Database schema: `database/migrations/policy/001_create_policy_tables.sql`
2. Service logic: `src/services/policy.service.js`
3. Postman examples: `postman/Policy_Management_Folder.json`
