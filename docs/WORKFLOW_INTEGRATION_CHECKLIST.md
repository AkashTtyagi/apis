# Workflow Management System - Integration Checklist ✅

## Pre-Integration Checklist

- [ ] Node.js version 14+ installed
- [ ] MySQL database created and accessible
- [ ] Existing HRMS models (HrmsEmployee, HrmsUser) are set up
- [ ] Express.js application is running
- [ ] Git repository is initialized (for version control)

---

## Installation Steps

### 1. Install Dependencies (5 minutes)

```bash
npm install nodemailer node-cron
```

**Required packages:**
- ✅ nodemailer - Email sending
- ✅ node-cron - Auto-action scheduler
- ✅ sequelize - ORM (should already be installed)
- ✅ mysql2 - MySQL driver (should already be installed)

---

### 2. Database Setup (10-15 minutes)

**Run migrations in order:**

```bash
# Option 1: Run all migrations at once
for file in database/migrations/workflow/*.sql; do
  echo "Running $file..."
  mysql -u root -p hrms_database < "$file"
done

# Option 2: Run individually
mysql -u root -p hrms_database < database/migrations/workflow/001_create_hrms_workflow_master.sql
mysql -u root -p hrms_database < database/migrations/workflow/002_create_hrms_workflow_config.sql
# ... (continue with all 12 files)

# Run seed data
mysql -u root -p hrms_database < database/seeds/workflow_master_seed.sql
```

**Verification:**
```sql
-- Check tables are created
SHOW TABLES LIKE 'hrms_workflow%';

-- Should show 12 tables:
-- hrms_workflow_master
-- hrms_workflow_config
-- hrms_workflow_stages
-- hrms_workflow_stage_approvers
-- hrms_workflow_conditions
-- hrms_workflow_condition_rules
-- hrms_workflow_applicability
-- hrms_workflow_requests
-- hrms_workflow_actions
-- hrms_workflow_email_templates
-- hrms_workflow_versions
-- hrms_workflow_stage_assignments

-- Check seed data
SELECT * FROM hrms_workflow_master;
-- Should show 20 workflow types
```

---

### 3. Environment Configuration (5 minutes)

**Copy configuration from `.env.workflow.example` to your `.env` file:**

```env
# Minimum required configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com
APP_URL=http://localhost:3000
```

**Test SMTP connection:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('SMTP Error:', error);
    } else {
        console.log('✓ SMTP Server is ready');
    }
});
```

---

### 4. Model Integration (2 minutes)

**Ensure workflow models are imported in your main models index:**

In `src/models/index.js`:

```javascript
// Import workflow models
const workflowModels = require('./workflow');

// Export all models
module.exports = {
    // Your existing models
    HrmsEmployee,
    HrmsUser,
    // ... other models

    // Workflow models
    ...workflowModels
};
```

---

### 5. Route Integration (5 minutes)

**In your main application file (e.g., `src/app.js` or `server.js`):**

```javascript
const express = require('express');
const app = express();

// Import workflow routes
const workflowRoutes = require('./src/routes/workflow.routes');

// Use workflow routes
app.use('/api/workflow', workflowRoutes);

// Your other routes...

module.exports = app;
```

**Test route is accessible:**
```bash
curl http://localhost:3000/api/workflow/admin/masters
```

---

### 6. Scheduler Initialization (5 minutes)

**In your server startup file (e.g., `server.js`):**

```javascript
const app = require('./src/app');
const autoActionScheduler = require('./src/services/workflow/autoActionScheduler.service');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);

    // Initialize workflow scheduler
    const schedulers = autoActionScheduler.initializeScheduler();
    console.log('✓ Workflow auto-action scheduler initialized');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    autoActionScheduler.stopScheduler(schedulers);
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});
```

---

### 7. Authentication Middleware Setup (10 minutes)

**Option A: If you already have auth middleware, update routes:**

In `src/routes/workflow.routes.js`, uncomment:

```javascript
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.use(authMiddleware.authenticate);
router.use('/admin', adminMiddleware.checkAdmin);
```

**Option B: If you don't have auth middleware, create basic one:**

```javascript
// src/middleware/auth.middleware.js
const authenticate = (req, res, next) => {
    // TODO: Implement your authentication logic
    // For now, mock user for testing
    req.user = {
        user_id: 1,
        employee_id: 1,
        company_id: 1,
        email: 'test@example.com'
    };
    next();
};

module.exports = { authenticate };
```

---

## Testing Checklist

### Phase 1: Basic Functionality (30 minutes)

- [ ] **Test 1: Get Workflow Masters**
  ```bash
  curl http://localhost:3000/api/workflow/admin/masters
  ```
  ✅ Should return 20 workflow types

- [ ] **Test 2: Create Simple Workflow Config**
  ```bash
  curl -X POST http://localhost:3000/api/workflow/admin/configs \
    -H "Content-Type: application/json" \
    -d '{
      "company_id": 1,
      "workflow_master_id": 1,
      "workflow_name": "Test Leave Workflow",
      "is_default": true,
      "stages": [{
        "stage_name": "Manager Approval",
        "stage_order": 1,
        "approvers": [{
          "approver_type": "REPORTING_MANAGER"
        }]
      }]
    }'
  ```
  ✅ Should create workflow config

- [ ] **Test 3: Submit Workflow Request**
  ```bash
  curl -X POST http://localhost:3000/api/workflow/requests/submit \
    -H "Content-Type: application/json" \
    -d '{
      "workflow_master_id": 1,
      "request_data": {
        "leave_type": "Annual Leave",
        "from_date": "2024-12-25",
        "to_date": "2024-12-27",
        "duration": 3,
        "reason": "Year-end vacation"
      }
    }'
  ```
  ✅ Should create request with pending status

- [ ] **Test 4: Get Pending Approvals**
  ```bash
  curl http://localhost:3000/api/workflow/requests/pending-approvals
  ```
  ✅ Should show pending approval

- [ ] **Test 5: Approve Request**
  ```bash
  curl -X POST http://localhost:3000/api/workflow/requests/1/approve \
    -H "Content-Type: application/json" \
    -d '{
      "remarks": "Approved"
    }'
  ```
  ✅ Should approve and complete workflow

### Phase 2: Advanced Features (1 hour)

- [ ] **Test 6: Conditional Logic**
  - Create workflow with auto-reject condition
  - Submit request that triggers condition
  - Verify auto-rejection

- [ ] **Test 7: Multi-Stage Approval**
  - Create 3-stage workflow
  - Submit request
  - Approve at each stage
  - Verify progression

- [ ] **Test 8: Email Notifications**
  - Submit request
  - Check email received
  - Approve request
  - Check approval email

- [ ] **Test 9: SLA Monitoring**
  - Create workflow with 1-hour SLA
  - Submit request
  - Wait 1+ hours (or manually update sla_due_date in DB)
  - Trigger scheduler manually
  - Verify auto-action

- [ ] **Test 10: Withdrawal**
  - Submit request
  - Withdraw it
  - Verify status changes to 'withdrawn'

### Phase 3: Admin Features (30 minutes)

- [ ] **Test 11: Clone Workflow**
  ```bash
  curl -X POST http://localhost:3000/api/workflow/admin/configs/1/clone \
    -H "Content-Type: application/json" \
    -d '{
      "workflow_name": "Cloned Workflow"
    }'
  ```

- [ ] **Test 12: Version History**
  ```bash
  curl http://localhost:3000/api/workflow/admin/configs/1/versions
  ```

- [ ] **Test 13: Update Workflow Config**
  ```bash
  curl -X PUT http://localhost:3000/api/workflow/admin/configs/1 \
    -H "Content-Type: application/json" \
    -d '{
      "workflow_name": "Updated Workflow Name"
    }'
  ```

---

## Verification Checklist

### Database Verification

```sql
-- Check workflow configs exist
SELECT * FROM hrms_workflow_config;

-- Check stages are created
SELECT * FROM hrms_workflow_stages;

-- Check workflow requests
SELECT
    request_number,
    request_status,
    employee_id,
    workflow_master_id
FROM hrms_workflow_requests;

-- Check workflow actions (audit trail)
SELECT
    action_type,
    action_by_user_id,
    remarks,
    action_taken_at
FROM hrms_workflow_actions
ORDER BY action_taken_at DESC;
```

### API Verification

**Check all endpoints are accessible:**

```bash
# End-user endpoints
curl http://localhost:3000/api/workflow/requests/my-requests
curl http://localhost:3000/api/workflow/requests/pending-approvals
curl http://localhost:3000/api/workflow/requests/dashboard

# Admin endpoints
curl http://localhost:3000/api/workflow/admin/masters
curl http://localhost:3000/api/workflow/admin/configs
```

### Scheduler Verification

```bash
# Check server logs for:
✓ Workflow auto-action scheduler initialized
   - Main scheduler: Every 1 hour
   - SLA warnings: Every 30 minutes
```

### Email Verification

- [ ] Check SMTP connection on startup (no errors)
- [ ] Submit test request and receive email
- [ ] Approve request and receive email
- [ ] Check email logs in database

---

## Common Issues & Solutions

### Issue 1: "Workflow master not found"
**Solution:** Run seed data: `mysql -u root -p database_name < database/seeds/workflow_master_seed.sql`

### Issue 2: "Employee not found"
**Solution:** Ensure you have employees in `hrms_employee` table with proper company_id

### Issue 3: "No applicable workflow found"
**Solution:** Create a default workflow with `is_default: true` and no applicability rules

### Issue 4: Emails not sending
**Solution:**
1. Check SMTP credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check nodemailer logs in console

### Issue 5: Scheduler not running
**Solution:** Ensure `autoActionScheduler.initializeScheduler()` is called after server starts

### Issue 6: Routes return 404
**Solution:** Check `app.use('/api/workflow', workflowRoutes)` is added to main app file

---

## Post-Integration Tasks

### Immediate (Same Day)

- [ ] Create default workflow configs for each workflow type
- [ ] Configure email templates
- [ ] Set up applicability rules for different departments
- [ ] Test end-to-end workflow for each type

### Short-term (1 Week)

- [ ] Create admin panel UI for workflow configuration
- [ ] Create end-user UI for request submission
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy

### Medium-term (1 Month)

- [ ] User training and documentation
- [ ] Performance testing and optimization
- [ ] Security audit
- [ ] Analytics and reporting setup

---

## Quick Reference

### Key Files

- **Routes:** `src/routes/workflow.routes.js`
- **Controllers:** `src/controllers/workflow/`
- **Services:** `src/services/workflow/`
- **Models:** `src/models/workflow/`
- **Migrations:** `database/migrations/workflow/`
- **Documentation:** `WORKFLOW_IMPLEMENTATION_COMPLETE.md`

### Key Commands

```bash
# Start server with workflow
npm start

# Run migrations
mysql -u root -p database < migration.sql

# Test API
curl http://localhost:3000/api/workflow/admin/masters

# Manual scheduler trigger (in Node REPL)
const scheduler = require('./src/services/workflow/autoActionScheduler.service');
scheduler.manualTrigger();
```

### Support Resources

- 📖 Complete Guide: `WORKFLOW_IMPLEMENTATION_COMPLETE.md`
- 🏗️ Architecture: `WORKFLOW_SYSTEM_ARCHITECTURE.md`
- 📚 API Reference: `WORKFLOW_API_QUICK_REFERENCE.md`
- 🔧 Implementation Details: `WORKFLOW_IMPLEMENTATION_SUMMARY.md`

---

## Success Criteria

Your integration is successful when:

✅ All 12 database tables are created
✅ Seed data shows 20 workflow types
✅ Server starts without errors
✅ Scheduler initializes successfully
✅ API endpoints return data (not 404)
✅ Can create workflow config via API
✅ Can submit workflow request
✅ Can approve/reject requests
✅ Email notifications are sent
✅ Auto-actions trigger on SLA breach
✅ Audit trail records all actions

---

**Integration Time Estimate:** 1-2 hours
**Testing Time Estimate:** 2-3 hours
**Total Time to Production:** 4-6 hours

---

**Generated with Claude Code** 🤖
