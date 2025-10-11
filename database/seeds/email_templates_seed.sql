-- =====================================================
-- HRMS Email Templates Seed Data
-- Default email templates (company_id = NULL)
-- =====================================================

-- Note: This file contains default email templates
-- Run this after creating the tables

-- 1. Set Password / Welcome Email (for new users)
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'set_password',
    'Set Password - New User Welcome',
    'Welcome to {{company_name}} - Set Your Password',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
        </div>
        <div class="content">
            <p>Dear {{user_name}},</p>

            <p>Welcome aboard! We are excited to have you as part of our team.</p>

            <p>To get started, please set your password by clicking the button below:</p>

            <p style="text-align: center;">
                <a href="{{set_password_link}}" class="button">Set Your Password</a>
            </p>

            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{set_password_link}}</p>

            <p><strong>Note:</strong> This link will expire in 24 hours for security purposes.</p>

            <p>If you did not expect this email, please ignore it or contact your HR department.</p>

            <p>Best regards,<br>{{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('user_name', 'company_name', 'set_password_link'),
    1,
    NOW(),
    NOW()
);

-- 2. Reset Password Email
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'reset_password',
    'Reset Password Request',
    'Reset Your Password - {{company_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Dear {{user_name}},</p>

            <p>We received a request to reset your password for your {{company_name}} account.</p>

            <p>Click the button below to reset your password:</p>

            <p style="text-align: center;">
                <a href="{{reset_link}}" class="button">Reset Password</a>
            </p>

            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #f5576c;">{{reset_link}}</p>

            <div class="alert">
                <strong>Security Notice:</strong>
                <ul>
                    <li>This link will expire in 24 hours</li>
                    <li>If you did not request this, please ignore this email</li>
                    <li>Your password will remain unchanged unless you click the link above</li>
                </ul>
            </div>

            <p>For security reasons, we recommend choosing a strong password that you haven''t used before.</p>

            <p>Best regards,<br>{{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('user_name', 'company_name', 'reset_link'),
    1,
    NOW(),
    NOW()
);

-- 3. Password Changed Successfully
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'password_changed',
    'Password Changed Confirmation',
    'Your Password Has Been Changed - {{company_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 12px; margin: 20px 0; color: #0c5460; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
            <div class="success-icon">✓</div>

            <p>Dear {{user_name}},</p>

            <p>This email confirms that your password for {{company_name}} has been successfully changed.</p>

            <p><strong>Change Details:</strong></p>
            <ul>
                <li>Date: {{change_date}}</li>
                <li>Time: {{change_time}}</li>
            </ul>

            <div class="alert">
                <strong>Did not make this change?</strong><br>
                If you did not change your password, please contact your HR department immediately.
            </div>

            <p>For your security, we recommend:</p>
            <ul>
                <li>Never share your password with anyone</li>
                <li>Use a unique password for your work account</li>
                <li>Change your password regularly</li>
            </ul>

            <p>Best regards,<br>{{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('user_name', 'company_name', 'change_date', 'change_time'),
    1,
    NOW(),
    NOW()
);

-- 4. Welcome to Company (After Password Set)
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'welcome_onboard',
    'Welcome to the Company',
    'Welcome to {{company_name}} - Your Journey Begins!',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #43e97b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
            <p>We''re thrilled to have you on board</p>
        </div>
        <div class="content">
            <p>Dear {{user_name}},</p>

            <p>Congratulations! You have successfully completed your account setup.</p>

            <div class="info-box">
                <h3>Your Account Details</h3>
                <p><strong>Employee ID:</strong> {{employee_code}}</p>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Department:</strong> {{department_name}}</p>
                <p><strong>Joining Date:</strong> {{joining_date}}</p>
            </div>

            <p><strong>What''s Next?</strong></p>
            <ul>
                <li>Complete your profile information</li>
                <li>Review company policies and guidelines</li>
                <li>Set up your preferences</li>
                <li>Connect with your team</li>
            </ul>

            <p>If you have any questions, please don''t hesitate to reach out to the HR department.</p>

            <p>We look forward to your contributions!</p>

            <p>Best regards,<br>{{company_name}} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('user_name', 'company_name', 'employee_code', 'email', 'department_name', 'joining_date'),
    1,
    NOW(),
    NOW()
);

-- 5. Leave Request Submitted
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'leave_request_submitted',
    'Leave Request Submitted',
    'Leave Request Submitted - {{leave_type}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .leave-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Request Submitted</h1>
        </div>
        <div class="content">
            <p>Dear {{employee_name}},</p>

            <p>Your leave request has been successfully submitted and is pending approval.</p>

            <div class="leave-details">
                <h3>Leave Details</h3>
                <p><strong>Leave Type:</strong> {{leave_type}}</p>
                <p><strong>From Date:</strong> {{from_date}}</p>
                <p><strong>To Date:</strong> {{to_date}}</p>
                <p><strong>Total Days:</strong> {{total_days}}</p>
                <p><strong>Reason:</strong> {{reason}}</p>
            </div>

            <p>Your request will be reviewed by your manager. You will be notified once a decision has been made.</p>

            <p>Best regards,<br>{{company_name}} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('employee_name', 'company_name', 'leave_type', 'from_date', 'to_date', 'total_days', 'reason'),
    1,
    NOW(),
    NOW()
);

-- 6. Leave Request Approved
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'leave_approved',
    'Leave Request Approved',
    'Leave Request Approved - {{leave_type}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { display: inline-block; background: #43e97b; color: white; padding: 10px 20px; border-radius: 20px; margin: 10px 0; }
        .leave-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Request Approved ✓</h1>
        </div>
        <div class="content">
            <p>Dear {{employee_name}},</p>

            <p>Good news! Your leave request has been <span class="success-badge">APPROVED</span></p>

            <div class="leave-details">
                <h3>Approved Leave Details</h3>
                <p><strong>Leave Type:</strong> {{leave_type}}</p>
                <p><strong>From Date:</strong> {{from_date}}</p>
                <p><strong>To Date:</strong> {{to_date}}</p>
                <p><strong>Total Days:</strong> {{total_days}}</p>
                <p><strong>Approved By:</strong> {{approved_by}}</p>
                <p><strong>Approval Date:</strong> {{approval_date}}</p>
                {{#if manager_comments}}
                <p><strong>Manager Comments:</strong> {{manager_comments}}</p>
                {{/if}}
            </div>

            <p><strong>Remaining Leave Balance:</strong> {{remaining_balance}} days</p>

            <p>Enjoy your time off!</p>

            <p>Best regards,<br>{{company_name}} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('employee_name', 'company_name', 'leave_type', 'from_date', 'to_date', 'total_days', 'approved_by', 'approval_date', 'manager_comments', 'remaining_balance'),
    1,
    NOW(),
    NOW()
);

-- 7. Leave Request Rejected
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'leave_rejected',
    'Leave Request Rejected',
    'Leave Request Update - {{leave_type}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reject-badge { display: inline-block; background: #f5576c; color: white; padding: 10px 20px; border-radius: 20px; margin: 10px 0; }
        .leave-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Request Update</h1>
        </div>
        <div class="content">
            <p>Dear {{employee_name}},</p>

            <p>We regret to inform you that your leave request has been <span class="reject-badge">REJECTED</span></p>

            <div class="leave-details">
                <h3>Leave Request Details</h3>
                <p><strong>Leave Type:</strong> {{leave_type}}</p>
                <p><strong>From Date:</strong> {{from_date}}</p>
                <p><strong>To Date:</strong> {{to_date}}</p>
                <p><strong>Total Days:</strong> {{total_days}}</p>
                <p><strong>Rejected By:</strong> {{rejected_by}}</p>
                <p><strong>Rejection Date:</strong> {{rejection_date}}</p>
            </div>

            {{#if rejection_reason}}
            <div class="info-box">
                <strong>Reason for Rejection:</strong><br>
                {{rejection_reason}}
            </div>
            {{/if}}

            <p>If you have any questions about this decision, please discuss with your manager or contact the HR department.</p>

            <p>Best regards,<br>{{company_name}} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('employee_name', 'company_name', 'leave_type', 'from_date', 'to_date', 'total_days', 'rejected_by', 'rejection_date', 'rejection_reason'),
    1,
    NOW(),
    NOW()
);

-- 8. Leave Balance Update
INSERT INTO hrms_email_templates (
    company_id, slug, name, subject, body, variables, is_active, created_at, updated_at
) VALUES (
    NULL,
    'leave_balance_update',
    'Leave Balance Updated',
    'Your Leave Balance Has Been Updated - {{company_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .balance-table { width: 100%; background: white; margin: 20px 0; border-radius: 5px; overflow: hidden; }
        .balance-table th { background: #4facfe; color: white; padding: 12px; text-align: left; }
        .balance-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Balance Updated</h1>
        </div>
        <div class="content">
            <p>Dear {{employee_name}},</p>

            <p>Your leave balance has been updated for the {{leave_cycle_year}} leave cycle.</p>

            <table class="balance-table">
                <thead>
                    <tr>
                        <th>Leave Type</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{leave_type}}</td>
                        <td>{{balance}} days</td>
                    </tr>
                </tbody>
            </table>

            <p><strong>Update Reason:</strong> {{update_reason}}</p>

            <p>You can view your complete leave balance in the employee portal.</p>

            <p>Best regards,<br>{{company_name}} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>',
    JSON_ARRAY('employee_name', 'company_name', 'leave_type', 'balance', 'leave_cycle_year', 'update_reason'),
    1,
    NOW(),
    NOW()
);

-- =====================================================
-- Summary:
-- Total Default Email Templates: 8
--
-- Templates:
-- 1. set_password - Welcome email for new users
-- 2. reset_password - Password reset email
-- 3. password_changed - Password change confirmation
-- 4. welcome_onboard - Welcome message after setup
-- 5. leave_request_submitted - Leave request confirmation
-- 6. leave_approved - Leave approval notification
-- 7. leave_rejected - Leave rejection notification
-- 8. leave_balance_update - Leave balance update notification
-- =====================================================
