# Error Logging System

## Overview
The HRMS application now includes a comprehensive error logging system that displays detailed error information including file names, line numbers, and stack traces for easy debugging.

## Features

### 1. **Detailed Console Output**
When an error occurs, you'll see a formatted error message like this:

```
================================================================================
ERROR OCCURRED
================================================================================
Context: POST /api/employees/details
Time: 2025-10-15T10:30:45.123Z
File: src/services/employee.service.js
Line: 142 Column: 15
Full Path: /Users/akashtyagi/Documents/HRMS/src/services/employee.service.js
Error Type: Error
Message: Unknown column 'NaN' in 'where clause'
SQL Query:
SELECT `id`, `company_id`, `user_id`, `employee_code`, `first_name`...
WHERE `id` = NaN AND `company_id` = 13
SQL Message: Unknown column 'NaN' in 'where clause'

Stack Trace:
Error: Unknown column 'NaN' in 'where clause'
    at Query.Sequence._packetToError (/path/to/node_modules/mysql2/lib/commands/query.js:42:25)
    at Query.ErrorPacket (/path/to/node_modules/mysql2/lib/commands/query.js:398:18)
    at getEmployeeById (src/services/employee.service.js:142:15)
    ...
================================================================================
```

### 2. **Color-Coded Output**
- **Red**: Error messages and critical information
- **Yellow**: Warning messages, file names, line numbers
- **Cyan**: Labels and section headers
- **Gray**: Secondary information like full paths and stack traces

### 3. **Development Mode Enhancement**
In development mode, API responses include file location details:

```json
{
  "success": false,
  "message": "Unknown column 'NaN' in 'where clause'",
  "timestamp": "2025-10-15T10:30:45.123Z",
  "error": {
    "name": "Error",
    "message": "Unknown column 'NaN' in 'where clause'",
    "file": "src/services/employee.service.js",
    "line": "142",
    "column": "15",
    "stack": "Error: Unknown column 'NaN' in 'where clause'\n    at ..."
  }
}
```

## Usage

### Automatic Error Logging
All errors are automatically caught and logged by the error middleware. No changes needed to existing code.

### Manual Error Logging
You can also manually log errors in your code:

```javascript
const { logError, logWarning } = require('./utils/errorLogger');

try {
  // Your code here
} catch (error) {
  logError(error, 'Custom Context');
  throw error; // Re-throw if needed
}

// For warnings
logWarning('This is a warning message', 'Optional Context');
```

### Async Route Handlers
Use the `asyncHandler` wrapper to automatically catch async errors:

```javascript
const { asyncHandler } = require('./utils/errorLogger');

router.post('/example', asyncHandler(async (req, res) => {
  // Any errors thrown here will be automatically caught
  const result = await someAsyncOperation();
  res.json(result);
}));
```

## Error Information Displayed

### Core Details
- **Context**: HTTP method and URL (e.g., POST /api/employees/details)
- **Timestamp**: Exact time of error
- **File**: Source file where error occurred
- **Line Number**: Exact line in the file
- **Column**: Column position in the line
- **Error Type**: Name of the error (Error, TypeError, etc.)
- **Message**: Human-readable error message

### Database Errors
For SQL/database errors, additional information is shown:
- **SQL Query**: The actual query that failed
- **SQL Message**: Database-specific error message
- **Error Code**: Database error code (if available)
- **Error Number**: Database error number (if available)

### Stack Trace
Complete stack trace with color coding for easy navigation.

## Benefits

1. **Fast Debugging**: Instantly know which file and line caused the error
2. **Better Logging**: All errors are logged in a consistent, readable format
3. **Development Aid**: Stack traces and file locations help developers quickly identify issues
4. **Production Safety**: Sensitive error details are hidden in production mode
5. **Easy Maintenance**: Centralized error handling makes it easy to update error behavior

## Configuration

The error logger automatically:
- Filters out `node_modules` from stack traces
- Shows relative paths from `src/` directory
- Works with all types of errors (synchronous, async, database, etc.)
- Adapts output based on `NODE_ENV` (development vs production)

## Example Error Scenarios

### Scenario 1: Database Query Error
```
File: src/services/employee.service.js
Line: 142
Message: Unknown column 'NaN' in 'where clause'
```

### Scenario 2: Validation Error
```
File: src/controllers/employee.controller.js
Line: 58
Message: Validation failed: Employee code is required
```

### Scenario 3: Authentication Error
```
File: src/middlewares/auth.middleware.js
Line: 32
Message: Invalid token. User or employee not found
```

## Notes

- Error logging is **automatically enabled** - no setup required
- File paths are simplified to show only relevant parts
- Stack traces skip node_modules for clarity
- All timestamps are in ISO 8601 format
- Color coding only works in terminals that support ANSI colors
