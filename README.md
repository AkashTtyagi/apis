# HRMS Backend System

A scalable and maintainable HRMS (Human Resource Management System) backend built with Node.js, Express, MySQL (Sequelize ORM), and Redis.

## 🏗️ Architecture

This project follows **clean architecture** principles with clear separation of concerns:

- **Controllers**: Handle HTTP requests/responses (presentation layer)
- **Services**: Contain business logic (application layer)
- **Models**: Define data structures and database schema (data layer)
- **Routes**: Define API endpoints
- **Middlewares**: Handle cross-cutting concerns (validation, error handling)
- **Utils**: Reusable utility functions
- **Configs**: Configuration management

## 📁 Project Structure

```
HRMS/
├── src/
│   ├── configs/              # Configuration files
│   │   ├── env.config.js     # Environment variables configuration
│   │   ├── database.config.js # Database configuration
│   │   └── redis.config.js   # Redis configuration
│   ├── controllers/          # HTTP request handlers
│   │   └── organization.controller.js
│   ├── services/             # Business logic layer
│   │   └── organization.service.js
│   ├── models/               # Sequelize models
│   │   ├── index.js
│   │   └── Organization.js
│   ├── routes/               # API routes
│   │   ├── index.js
│   │   └── organization.routes.js
│   ├── middlewares/          # Custom middleware
│   │   ├── errorHandler.js
│   │   └── validators/
│   │       └── organization.validator.js
│   ├── utils/                # Utility functions
│   │   ├── database.js       # Database connection
│   │   └── redis.js          # Redis connection and helpers
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Features

- ✅ Clean architecture with modular design
- ✅ Sequelize ORM for MySQL database operations
- ✅ Redis integration for caching
- ✅ Input validation using express-validator
- ✅ Centralized error handling
- ✅ Security best practices (Helmet, CORS)
- ✅ Request logging with Morgan
- ✅ Graceful shutdown handling
- ✅ Environment-based configuration
- ✅ RESTful API design

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **Redis** (v6 or higher)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd HRMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration**
   ```env
   NODE_ENV=development
   PORT=3000

   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=hrms_db
   DB_USER=root
   DB_PASSWORD=your_password

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

5. **Create MySQL database**
   ```sql
   CREATE DATABASE hrms_db;
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Organization Onboarding

**POST** `/api/organization/onboard`

Onboard a new organization with validation and Redis caching.

**Request Body:**
```json
{
  "org_name": "Tech Corp Inc",
  "contact_person": "John Doe",
  "email": "contact@techcorp.com",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Organization onboarded successfully",
  "data": {
    "id": 1,
    "org_name": "Tech Corp Inc",
    "contact_person": "John Doe",
    "email": "contact@techcorp.com",
    "phone": "+1234567890",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### Get All Organizations

**GET** `/api/organization?limit=10&offset=0`

Retrieve all organizations with pagination (uses raw SQL query).

### Get Organization by ID

**GET** `/api/organization/:id`

Retrieve a specific organization (checks Redis cache first).

### Update Organization

**PUT** `/api/organization/:id`

Update organization details.

### Delete Organization

**DELETE** `/api/organization/:id`

Delete an organization.

### Health Check

**GET** `/api/health`

Check if the API is running.

## 🔴 Redis Caching Strategy

Organizations are cached in Redis after creation with:
- **Key pattern**: `organization:{id}` and `organization:email:{email}`
- **Expiration**: 24 hours (86400 seconds)
- **Cache-aside pattern**: Check cache first, fallback to database

## 🗄️ Database Schema

### Organizations Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| org_name | VARCHAR(255) | NOT NULL |
| contact_person | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| phone | VARCHAR(20) | NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **MySQL2** - MySQL client
- **Redis** - In-memory data store
- **express-validator** - Request validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management

## 📝 Code Examples

### Raw SQL Query Example

```javascript
// In organization.service.js
const query = `
  SELECT id, org_name, contact_person, email, phone, created_at, updated_at
  FROM organizations
  ORDER BY created_at DESC
  LIMIT :limit OFFSET :offset
`;

const { results } = await executeRawQuery(query, {
  replacements: { limit, offset },
  type: 'SELECT'
});
```

### Redis Caching Example

```javascript
// Store in cache
await setCache('organization:1', organizationData, 86400);

// Retrieve from cache
const cachedData = await getCache('organization:1');
```

## 🔒 Security Features

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable cross-origin requests
- **Input Validation**: All inputs validated before processing
- **SQL Injection Prevention**: Parameterized queries via Sequelize
- **Error Handling**: Sensitive information hidden in production

## 🚦 Error Handling

The application includes comprehensive error handling:

- **Validation Errors** (400): Invalid input data
- **Not Found Errors** (404): Resource doesn't exist
- **Conflict Errors** (409): Duplicate entries
- **Server Errors** (500): Internal server errors

## 📈 Scalability Considerations

- **Modular Architecture**: Easy to add new modules (employees, departments, etc.)
- **Service Layer**: Business logic separated for reusability
- **Caching Strategy**: Redis reduces database load
- **Connection Pooling**: Configured for optimal database connections
- **Graceful Shutdown**: Ensures clean connection closure

## 🔄 Future Enhancements

This foundation can be extended with:

- Employee management
- Department management
- Attendance tracking
- Leave management
- Payroll system
- Performance reviews
- Authentication & Authorization (JWT)
- API rate limiting
- Unit and integration tests

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for scalable HRMS solutions**
