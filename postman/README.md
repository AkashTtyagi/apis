# HRMS API - Postman Collection

This directory contains Postman collection and environment files for testing all HRMS APIs.

## Files Included

1. **HRMS_API_Collection.postman_collection.json** - Complete API collection with all endpoints
2. **HRMS_Environment.postman_environment.json** - Environment variables configuration

## How to Import

### Import Collection

1. Open Postman
2. Click on **Import** button (top left)
3. Select `HRMS_API_Collection.postman_collection.json`
4. Click **Import**

### Import Environment

1. Open Postman
2. Click on **Import** button
3. Select `HRMS_Environment.postman_environment.json`
4. Click **Import**
5. Select "HRMS Environment" from the environment dropdown (top right)

## Environment Variables

The following variables are pre-configured:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:3000/api` | API base URL |
| `auth_token` | _(empty)_ | JWT authentication token (auto-populated on login) |
| `company_id` | `1` | Current company ID |
| `user_id` | `1` | Current user ID |
| `employee_id` | `1` | Current employee ID |

### Updating Environment Variables

1. Click the **Environment** icon (eye icon) in top right
2. Click on "HRMS Environment"
3. Update the values as needed
4. Click **Save**

## API Collection Structure

The collection is organized into the following folders:

### 1. Health Check
- **GET** `/health` - Check API status

### 2. Authentication (5 APIs)
- **POST** `/auth/set-password` - Set password for first time
- **POST** `/auth/login` - User login (auto-saves token)
- **POST** `/auth/forgot-password` - Request password reset
- **POST** `/auth/reset-password` - Reset password with token
- **POST** `/auth/resend-set-password` - Resend password setup email

### 3. Onboarding (1 API)
- **POST** `/onboarding` - Create company and user

### 4. Employees (6 APIs)
- **POST** `/employees` - Create employee
- **PUT** `/employees/:id` - Update employee
- **GET** `/employees/:id` - Get employee by ID
- **GET** `/employees/company` - Get all employees by company
- **POST** `/employees/activate/:user_id` - Activate user
- **POST** `/employees/resend-activation/:user_id` - Resend activation email

### 5. Templates (8 APIs)
- **GET** `/templates` - Get all templates
- **GET** `/templates/:template_slug` - Get template by slug
- **POST** `/templates/sections` - Create section
- **PUT** `/templates/sections/:id` - Update section
- **DELETE** `/templates/sections/:id` - Delete section
- **POST** `/templates/fields` - Create field
- **PUT** `/templates/fields/:id` - Update field
- **DELETE** `/templates/fields/:id` - Delete field

### 6. Departments (3 APIs)
All department routes use POST method:
- **POST** `/departments/create` - Create organization department
- **POST** `/departments/update` - Update organization department
- **POST** `/departments/list` - Get organization departments

### 7. Sub-Departments (3 APIs)
All sub-department routes use POST method:
- **POST** `/sub-departments/create` - Create sub-department
- **POST** `/sub-departments/update` - Update sub-department
- **POST** `/sub-departments/list` - Get sub-departments

### 8. Leave Types (6 APIs)
- **POST** `/leave-types` - Create leave type
- **PUT** `/leave-types/:id` - Update leave type
- **GET** `/leave-types` - Get all leave types
- **GET** `/leave-types/:id` - Get leave type by ID
- **DELETE** `/leave-types/:id` - Delete leave type (soft delete)
- **GET** `/leave-types/:id/audit-logs` - Get audit logs

### 9. Leave Policies (6 APIs)
- **POST** `/leave-policies/create` - Create leave policy
- **POST** `/leave-policies/update` - Update leave policy
- **GET** `/leave-policies` - Get all leave policies
- **GET** `/leave-policies/:id` - Get leave policy by ID
- **DELETE** `/leave-policies/:id` - Delete leave policy
- **PATCH** `/leave-policies/:policyId/leave-types/:leaveTypeId/toggle` - Toggle leave type

### 10. Leave Balance (2 APIs)
- **GET** `/leave-balance/:employeeId` - Get employee leave balance
- **POST** `/leave-balance/transaction` - Process leave transaction

### 11. Leave Credit Cron (1 API)
- **POST** `/cron/leave-credit/run` - Manually run leave credit cron

## Quick Start Guide

### Step 1: Onboard Company and User

```http
POST /api/onboarding
```

Body:
```json
{
  "org_name": "Tech Solutions Inc",
  "country_id": 1,
  "org_industry": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "admin@techsolutions.com",
  "phone": "+1234567890"
}
```

### Step 2: Set Password

The onboarding API will send a password setup email. Use the token from that email:

```http
POST /api/auth/set-password
```

Body:
```json
{
  "token": "your-token-from-email",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

### Step 3: Login

```http
POST /api/auth/login
```

Body:
```json
{
  "email": "admin@techsolutions.com",
  "password": "Password@123"
}
```

**Note:** The `auth_token` is automatically saved to the environment variables after successful login.

### Step 4: Use Authenticated APIs

All subsequent API calls will automatically use the saved `auth_token` from the Bearer token authentication.

## Authentication

Most APIs require authentication. The collection is configured to automatically use the `auth_token` variable in the Authorization header.

**Bearer Token:** `{{auth_token}}`

The token is automatically saved when you:
1. Successfully login via `/auth/login`
2. Successfully set password via `/auth/set-password`

## Request Examples

### Creating an Employee

```http
POST /api/employees
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "employee_code": "EMP001",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567891",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "date_of_joining": "2024-01-01",
  "department_id": 1,
  "employment_type": "full_time",
  "status": 0
}
```

### Creating a Leave Type

```http
POST /api/leave-types
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "leave_code": "CL",
  "leave_name": "Casual Leave",
  "leave_cycle_start_month": 1,
  "leave_cycle_end_month": 12,
  "leave_type": "paid",
  "credit_frequency": "monthly",
  "number_of_leaves_to_credit": 12,
  "active_leaves_to_credit": 12,
  "probation_leaves_to_credit": 6,
  "can_request_half_day": true,
  "can_employee_request": true
}
```

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

## Tips

1. **Auto-save tokens:** Login and Set Password requests automatically save the auth token
2. **Use variables:** Use `{{variable_name}}` syntax to reference environment variables
3. **Update IDs:** After creating resources, update the environment variables with their IDs
4. **Test scripts:** Some requests have test scripts that auto-save response data to variables
5. **Sequential testing:** Follow the "Quick Start Guide" order for first-time testing

## Troubleshooting

### Token Expired
If you get 401 errors, your token might have expired. Login again to get a new token.

### Missing Variables
Ensure you have selected "HRMS Environment" from the environment dropdown in Postman.

### Connection Error
Verify that your backend server is running and the `base_url` in environment variables is correct.

## Support

For API documentation and more details, refer to:
- API Documentation: `/docs` (if available)
- Implementation docs: `LEAVE_MANAGEMENT_IMPLEMENTATION.md`
- Database schema: `database/create_all_tables.sql`

## Notes

- All timestamps are in ISO 8601 format
- Dates are in `YYYY-MM-DD` format
- Soft deletes are used (items aren't permanently deleted)
- Most APIs require authentication except onboarding and auth routes
- Department and Sub-department APIs use POST method for all operations
