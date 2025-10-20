# HRMS Postman Collections

## 📦 Main Collection File (USE THIS)

### ✅ **HRMS_Complete_Collection.postman_collection.json**
**This is the COMPLETE merged collection with ALL API endpoints.**

- **Total Sections**: 23
- **Total Endpoints**: 100+
- **Status**: ✅ Complete and Ready to Use
- **Last Updated**: October 20, 2025

#### Sections Included:
1. Health Check
2. Authentication (5 endpoints)
3. Onboarding (1 endpoint)
4. Employees (7 endpoints)
5. Templates (9 endpoints)
6. Departments (3 endpoints)
7. Sub-Departments (3 endpoints)
8. Leave Types (4 endpoints)
9. Leave Policies (7 endpoints)
10. Leave Balance (2 endpoints)
11. Leave Credit Cron (1 endpoint)
12. Master Data (3 endpoints)
13. Shift Management (8 endpoints)
14. Roster Management (8 endpoints)
15. Rotating Shift Patterns (8 endpoints)
16. Shift Swap Requests (9 endpoints)
17. Attendance Requests (Employee) (10 endpoints)
18. **Attendance Requests (Admin)** (6 endpoints)
19. **Company Management** (2 endpoints)
20. **Designation Management** (3 endpoints)
21. **Grade Management** (3 endpoints)
22. **Level Management** (3 endpoints)
23. **Holiday Management** (13 endpoints)
    - Holiday Bank (6 endpoints)
    - Holiday Policy (7 endpoints)
24. **Workflow Management** (34 endpoints)
    - Workflow Requests (User) (9 endpoints)
    - Workflow Configuration (Admin) (25 endpoints)

**Sections 18-24 (marked in bold) are newly added APIs.**

---

## 📋 Other Files (Reference Only)

### HRMS_API_Collection.postman_collection.json
- **Status**: ⚠️ Partial (Sections 1-16 only)
- **Use Case**: Reference only, use Complete Collection instead

### COMPLETE_MISSING_APIS.postman_collection.json
- **Status**: ⚠️ Partial (Sections 17-23 only)
- **Use Case**: Reference only, use Complete Collection instead

### REMAINING_APIs_TO_ADD.md
- **Status**: 📝 Documentation
- **Use Case**: Reference document showing API specifications

---

## 🚀 How to Import

### Import Complete Collection (Recommended)
1. Open Postman
2. Click **Import** button
3. Select `HRMS_Complete_Collection.postman_collection.json`
4. Click **Import**
5. ✅ Done! All 23 sections with 100+ endpoints are now available

---

## ⚙️ Configuration

After importing, set the following **Collection Variables**:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| base_url | API base URL | http://localhost:3000/api |
| auth_token | JWT authentication token | Auto-set after login |
| company_id | Company ID | 1 |
| user_id | User ID | 1 |
| employee_id | Employee ID | 1 |

**Note**: auth_token is automatically set when you successfully login using the "Login" endpoint.

---

## 🔐 Authentication

Most endpoints require Bearer token authentication. To get started:

1. **First-time Setup**: Use "Set Password (First Time)" endpoint
2. **Login**: Use "Login" endpoint - this will auto-set auth_token
3. **Use APIs**: All subsequent API calls will automatically use the token

---

**Last Updated**: October 20, 2025
**Total Endpoints**: 100+
