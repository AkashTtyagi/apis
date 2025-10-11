# Leave Credit Cron Job Documentation

## Overview
The leave credit cron service automatically credits leaves to employees based on the configured `credit_frequency` in leave types. It updates both `HrmsLeaveLedger` (transaction log) and `HrmsEmployeeLeaveBalance` (cached balances).

## Installation

### Required Package
Install `node-cron` package:
```bash
npm install node-cron
```

## Credit Frequencies

The system supports the following credit frequencies:

1. **monthly** - Credits leaves monthly on a specific day
2. **quarterly** - Credits leaves every 3 months (Jan, Apr, Jul, Oct)
3. **half_yearly** - Credits leaves twice a year (Jan, Jul)
4. **yearly** - Credits leaves once a year (January)
5. **manual** - No automatic credit (e.g., Compensatory Off, Marriage Leave)

## How It Works

### Automatic Scheduling
The cron job runs **daily at 00:01 AM** and checks:
- Monthly credits: Runs on the configured `credit_day_of_month`
- Quarterly credits: Runs on the 1st day of quarters (Jan 1, Apr 1, Jul 1, Oct 1)
- Half-yearly credits: Runs on Jan 1 and Jul 1
- Yearly credits: Runs on Jan 1

### Eligibility Checks
Before crediting leaves, the system checks:

1. **Employee Status** - Must be in `applicable_to_status` (e.g., "0,1" for Active and Probation)
2. **Gender** - Must match `applicable_to_gender` (male, female, transgender, all)
3. **Joining Period** - Respects `restrict_after_joining_period` rules
4. **Marital Status** - For marriage leave, checks `credit_only_married`
5. **Leave Policy** - Employee must have an active leave policy with this leave type

### Credit Amount Selection
The system uses status-based credit amounts:
- **Status 0 (Active)**: Uses `active_leaves_to_credit` or falls back to `number_of_leaves_to_credit`
- **Status 1 (Probation)**: Uses `probation_leaves_to_credit`
- **Status 2 (Internship)**: Uses `intern_leaves_to_credit`
- **Status 3 (Separated)**: Uses `separated_leaves_to_credit` (usually 0)
- **Status 4 (Absconded)**: No credits
- **Status 5 (Terminated)**: No credits
- **Status 6 (Suspended)**: Uses `suspended_leaves_to_credit`

### Transaction Flow

1. **Fetch Latest Balance** - Retrieves `balance_after_transaction` from last ledger entry
2. **Calculate New Balance** - Adds credit amount (with rounding if configured)
3. **Create Ledger Entry** - Immutable record in `HrmsLeaveLedger`
   - `transaction_type`: 'credit'
   - `reference_type`: 'auto_credit'
   - `remarks`: 'Auto credit - {frequency}'
4. **Update Balance Table** - Creates/updates `HrmsEmployeeLeaveBalance` for current month/year

## API Endpoints

### Manual Execution (for Testing/Admin)

#### Run Full Daily Cron
```http
POST /api/cron/leave-credit/run
Authorization: Bearer <token>
```

#### Run Specific Frequency
```http
POST /api/cron/leave-credit/run-frequency
Authorization: Bearer <token>
Content-Type: application/json

{
  "frequency": "monthly",
  "day_of_month": 1
}
```

**Valid frequencies**: `monthly`, `quarterly`, `half_yearly`, `yearly`

## File Structure

```
src/
├── services/
│   └── leaveCreditCron.service.js    # Core credit logic
├── crons/
│   └── leaveCreditScheduler.js       # Cron scheduler
├── controllers/
│   └── leaveCreditCron.controller.js # Manual execution endpoints
└── routes/
    └── leaveCreditCron.routes.js     # API routes
```

## Server Integration

The cron scheduler is automatically started when the server starts:

```javascript
// In src/server.js
const { startLeaveCreditScheduler } = require('./crons/leaveCreditScheduler');

// Start leave credit cron scheduler
leaveCreditCronTask = startLeaveCreditScheduler();
```

And gracefully stopped on shutdown:
```javascript
if (leaveCreditCronTask) {
  stopLeaveCreditScheduler(leaveCreditCronTask);
}
```

## Logging

The cron service provides detailed console logs:
- Start/end of each cron run
- Leave types being processed
- Employees credited
- Any eligibility failures
- Total credits processed

Example output:
```
============================================================
🔄 DAILY LEAVE CREDIT CRON JOB STARTED
Date: 2024-01-01T00:01:00.000Z
============================================================

📅 Processing yearly leave credits for 2024-01-01

  Processing Paid Leave (PL)
  Found 150 eligible employee(s)
  ✓ Credited 18.00 PL to employee EMP00001
  ✓ Credited 12.00 PL to employee EMP00002 (probation)
  ...

✓ Successfully processed 150 leave credit(s)

============================================================
✓ DAILY LEAVE CREDIT CRON JOB COMPLETED
============================================================
```

## Timezone Configuration

Default timezone is set to **Asia/Kolkata** in `leaveCreditScheduler.js`:

```javascript
const scheduledTask = cron.schedule(cronSchedule, async () => {
  // ...
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Change this for your timezone
});
```

## Error Handling

- Database transactions ensure atomicity
- Failed credits for one employee don't affect others
- Errors are logged with employee details
- Transaction rollback on fatal errors

## Testing

### Test Monthly Credit on Day 15
```bash
curl -X POST http://localhost:3000/api/cron/leave-credit/run-frequency \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"frequency": "monthly", "day_of_month": 15}'
```

### Test Full Daily Cron
```bash
curl -X POST http://localhost:3000/api/cron/leave-credit/run \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Tables Updated

### HrmsLeaveLedger
- New record created for each credit
- Immutable transaction log
- Contains `balance_after_transaction`

### HrmsEmployeeLeaveBalance
- Updated with new balance
- Indexed by employee_id, leave_type_id, month, year
- Cached for performance

## Performance Considerations

- Uses database transactions for consistency
- Processes employees in batches
- Efficient queries with proper indexing
- Balance cached in HrmsEmployeeLeaveBalance to avoid recalculation

## Future Enhancements

- Email notifications to employees on credit
- Dashboard for viewing credit history
- Admin override for manual adjustments
- Support for prorated credits based on joining date
