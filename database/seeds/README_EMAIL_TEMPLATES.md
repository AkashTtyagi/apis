# HRMS Email Templates - Seed Data

## Overview
This file contains default email templates for the HRMS system. These templates are used for various automated email notifications throughout the application.

## Installation

### Option 1: Using MySQL Client
```bash
mysql -h 103.160.145.136 -u hrms_user -p'hrms@2024secure' hrms_db < database/seeds/email_templates_seed.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open `email_templates_seed.sql`
4. Execute the script

### Option 3: Manual Copy-Paste
Copy the SQL content and run it in your preferred MySQL client.

## Available Templates

### 1. **Set Password / Welcome Email** (`set_password`)
- **Purpose**: Sent to new users when their account is created
- **Subject**: Welcome to {{company_name}} - Set Your Password
- **Variables**:
  - `user_name` - Employee's full name
  - `company_name` - Company name
  - `set_password_link` - Password setup link (expires in 24 hours)

### 2. **Reset Password** (`reset_password`)
- **Purpose**: Sent when user requests password reset
- **Subject**: Reset Your Password - {{company_name}}
- **Variables**:
  - `user_name` - Employee's full name
  - `company_name` - Company name
  - `reset_link` - Password reset link (expires in 24 hours)

### 3. **Password Changed** (`password_changed`)
- **Purpose**: Confirmation email after password change
- **Subject**: Your Password Has Been Changed - {{company_name}}
- **Variables**:
  - `user_name` - Employee's full name
  - `company_name` - Company name
  - `change_date` - Date of password change
  - `change_time` - Time of password change

### 4. **Welcome Onboard** (`welcome_onboard`)
- **Purpose**: Welcome message after user completes setup
- **Subject**: Welcome to {{company_name}} - Your Journey Begins!
- **Variables**:
  - `user_name` - Employee's full name
  - `company_name` - Company name
  - `employee_code` - Employee ID/Code
  - `email` - Employee email
  - `department_name` - Department name
  - `joining_date` - Joining date

### 5. **Leave Request Submitted** (`leave_request_submitted`)
- **Purpose**: Confirmation when leave request is submitted
- **Subject**: Leave Request Submitted - {{leave_type}}
- **Variables**:
  - `employee_name` - Employee's full name
  - `company_name` - Company name
  - `leave_type` - Type of leave
  - `from_date` - Leave start date
  - `to_date` - Leave end date
  - `total_days` - Total number of days
  - `reason` - Leave reason

### 6. **Leave Approved** (`leave_approved`)
- **Purpose**: Notification when leave is approved
- **Subject**: Leave Request Approved - {{leave_type}}
- **Variables**:
  - `employee_name` - Employee's full name
  - `company_name` - Company name
  - `leave_type` - Type of leave
  - `from_date` - Leave start date
  - `to_date` - Leave end date
  - `total_days` - Total number of days
  - `approved_by` - Approver's name
  - `approval_date` - Date of approval
  - `manager_comments` - Optional manager comments
  - `remaining_balance` - Remaining leave balance

### 7. **Leave Rejected** (`leave_rejected`)
- **Purpose**: Notification when leave is rejected
- **Subject**: Leave Request Update - {{leave_type}}
- **Variables**:
  - `employee_name` - Employee's full name
  - `company_name` - Company name
  - `leave_type` - Type of leave
  - `from_date` - Leave start date
  - `to_date` - Leave end date
  - `total_days` - Total number of days
  - `rejected_by` - Rejector's name
  - `rejection_date` - Date of rejection
  - `rejection_reason` - Reason for rejection

### 8. **Leave Balance Update** (`leave_balance_update`)
- **Purpose**: Notification when leave balance is updated
- **Subject**: Your Leave Balance Has Been Updated - {{company_name}}
- **Variables**:
  - `employee_name` - Employee's full name
  - `company_name` - Company name
  - `leave_type` - Type of leave
  - `balance` - Current balance
  - `leave_cycle_year` - Leave cycle year
  - `update_reason` - Reason for balance update

## Usage in Code

### Sending Emails with Templates

```javascript
const { sendEmail } = require('../utils/email');

// Example: Send password set email
await sendEmail({
    to: 'user@example.com',
    slug: 'set_password',
    variables: {
        user_name: 'John Doe',
        company_name: 'Tech Corp',
        set_password_link: 'https://example.com/set-password?token=xyz'
    },
    company_id: 1  // or null for default template
});

// Example: Send leave approved email
await sendEmail({
    to: 'employee@example.com',
    slug: 'leave_approved',
    variables: {
        employee_name: 'Jane Smith',
        company_name: 'Tech Corp',
        leave_type: 'Annual Leave',
        from_date: '2025-01-15',
        to_date: '2025-01-20',
        total_days: '5',
        approved_by: 'Manager Name',
        approval_date: '2025-01-10',
        remaining_balance: '10'
    },
    company_id: 1
});
```

## Customization

### Company-Specific Templates

To create a company-specific template (overrides default):

```sql
INSERT INTO hrms_email_templates (
    company_id,     -- Set to specific company ID
    slug,           -- Same slug as default template
    name,
    subject,
    body,
    variables,
    is_active,
    created_at,
    updated_at
) VALUES (
    123,  -- Company ID
    'set_password',
    'Custom Welcome Email',
    'Welcome to Our Company!',
    '<html>Custom HTML template...</html>',
    JSON_ARRAY('user_name', 'set_password_link'),
    1,
    NOW(),
    NOW()
);
```

### Variable Syntax

Templates use double curly braces for variables:
```html
<p>Dear {{user_name}},</p>
<p>Your balance is {{balance}} days.</p>
```

### Conditional Content (Future Enhancement)

For conditional sections (currently not implemented, but structure supports it):
```html
{{#if manager_comments}}
<p><strong>Comments:</strong> {{manager_comments}}</p>
{{/if}}
```

## Design Features

All templates include:
- ✅ Responsive design (mobile-friendly)
- ✅ Professional gradient headers
- ✅ Clear call-to-action buttons
- ✅ Security notices where applicable
- ✅ Branded footer
- ✅ Inline CSS (works in all email clients)
- ✅ UTF-8 character support

## Testing Templates

### Test Email Sending

```javascript
// In your test file or controller
const { sendEmail } = require('../utils/email');

const testEmailTemplate = async () => {
    try {
        await sendEmail({
            to: 'test@yopmail.com',
            slug: 'set_password',
            variables: {
                user_name: 'Test User',
                company_name: 'Test Company',
                set_password_link: 'http://localhost:3000/set-password?token=test123'
            },
            company_id: null  // Use default template
        });
        console.log('✓ Test email sent successfully');
    } catch (error) {
        console.error('✗ Email sending failed:', error.message);
    }
};

testEmailTemplate();
```

## Notes

1. **Default Templates** (`company_id = NULL`):
   - Used when no company-specific template exists
   - Cannot be deleted (only deactivated)
   - Serve as fallback for all companies

2. **Template Priority**:
   - Company-specific template (if exists)
   - Default template (if company-specific not found)

3. **Security**:
   - Password reset/set links expire in 24 hours
   - All email templates include security notices
   - Links are one-time use only

4. **Localization** (Future):
   - Currently templates are in English
   - Structure supports multiple language templates
   - Can be extended with `language` field

## Troubleshooting

### Template Not Found
```
Error: Email template not found for slug: set_password
```
**Solution**: Run the seed script to create default templates

### Variables Not Replaced
```
Email shows {{user_name}} instead of actual name
```
**Solution**: Ensure you're passing the correct variable names in the `variables` object

### HTML Not Rendering
```
Email shows HTML code instead of formatted content
```
**Solution**: Ensure your email client supports HTML emails and check SMTP configuration

## Support

For issues or questions:
1. Check the email utility (`src/utils/email.js`)
2. Verify SMTP configuration
3. Check email template model (`src/models/HrmsEmailTemplate.js`)
4. Review email sending logs

---

**Created**: 2025-01-11
**Version**: 1.0
**Total Templates**: 8
