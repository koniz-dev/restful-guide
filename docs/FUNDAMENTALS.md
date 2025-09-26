# RESTful API Fundamentals

## 🌐 What is REST?

**REST (Representational State Transfer)** is an architectural style for designing networked applications. It provides a set of constraints and principles for creating web services.

### REST Principles

#### 1. **Stateless**
- Each request contains all information needed to process it
- Server doesn't store client state between requests
- Session tokens are used for authentication, not server-side sessions

#### 2. **Client-Server Architecture**
- Clear separation between client and server
- Client handles UI/UX, server handles data and business logic
- Independent evolution of client and server

#### 3. **Cacheable**
- Responses must define themselves as cacheable or non-cacheable
- Improves performance and scalability
- Reduces server load

#### 4. **Uniform Interface**
- Consistent way of interacting with resources
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Standard status codes and response formats

#### 5. **Layered System**
- Architecture can be composed of hierarchical layers
- Each layer only knows about the layer directly below it
- Enables load balancing and caching

## 🔗 HTTP Methods & REST

### Standard HTTP Methods

| Method | Purpose | Idempotent | Safe | Body |
|--------|---------|------------|------|------|
| GET | Retrieve data | ✅ | ✅ | ❌ |
| POST | Create new resource | ❌ | ❌ | ✅ |
| PUT | Update entire resource | ✅ | ❌ | ✅ |
| PATCH | Partial update | ❌ | ❌ | ✅ |
| DELETE | Remove resource | ✅ | ❌ | ❌ |

### RESTful URL Design

#### ✅ Good URL Patterns
```
GET    /users           # Get all users
GET    /users/123       # Get user with ID 123
POST   /users           # Create new user
PUT    /users/123       # Update entire user 123
PATCH  /users/123       # Partial update user 123
DELETE /users/123       # Delete user 123

GET    /users/123/posts # Get posts by user 123
POST   /users/123/posts # Create post for user 123
```

#### ❌ Bad URL Patterns
```
GET    /getUsers        # Verb in URL
POST   /createUser      # Verb in URL
GET    /user?id=123     # Query param for resource ID
POST   /updateUser      # Wrong method for update
```

## 📊 HTTP Status Codes

### 2xx Success
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Success but no content returned

### 3xx Redirection
- **301 Moved Permanently**: Resource moved permanently
- **302 Found**: Resource temporarily moved

### 4xx Client Error
- **400 Bad Request**: Invalid request syntax or missing required fields
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Access denied (authenticated but not authorized)
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate user registration)

### 5xx Server Error
- **500 Internal Server Error**: Server error
- **502 Bad Gateway**: Invalid response from upstream
- **503 Service Unavailable**: Service temporarily unavailable

## 🔐 Authentication & Authorization

### Authentication vs Authorization

#### Authentication (Who are you?)
- Verifies user identity
- Login process
- Session token generation

#### Authorization (What can you do?)
- Determines user permissions
- Access control
- Resource ownership validation

### Common Authentication Methods

#### 1. **Session-based Authentication**
```typescript
// Login
const sessionToken = generateToken(user);
res.cookie('AUTH_TOKEN', sessionToken);

// Verify
const token = req.cookies['AUTH_TOKEN'];
const user = await verifyToken(token);
```

#### 2. **JWT (JSON Web Tokens)**
```typescript
// Generate JWT
const token = jwt.sign({ userId: user.id }, secret);

// Verify JWT
const decoded = jwt.verify(token, secret);
```

#### 3. **API Keys**
```typescript
// Check API key
const apiKey = req.headers['x-api-key'];
const isValid = await validateApiKey(apiKey);
```

## 🗄️ Database Design for REST APIs

### MongoDB Document Structure

#### User Document
```typescript
{
  _id: ObjectId,
  username: String,
  email: String,
  authentication: {
    password: String,      // Hashed
    salt: String,         // For hashing
    sessionToken: String  // Current session
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Database Operations

#### CRUD Operations
```typescript
// Create
const user = await UserModel.create(userData);

// Read
const user = await UserModel.findById(id);
const users = await UserModel.find({ active: true });

// Update
const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

// Delete
await UserModel.findByIdAndDelete(id);
```

## 🛡️ Security Fundamentals

### Password Security

#### Hashing vs Encryption
- **Hashing**: One-way transformation (bcrypt, SHA-256)
- **Encryption**: Two-way transformation (AES, RSA)

#### Salt and Pepper
```typescript
// Salt: Random data added to password before hashing
const salt = crypto.randomBytes(128).toString('base64');
const hash = hashFunction(password + salt);

// Pepper: Secret key added to password
const hash = hashFunction(password + salt + pepper);
```

### Input Validation

#### Server-side Validation
```typescript
// Required fields validation
if (!username || !email || !password) {
    return res.sendStatus(400); // Bad Request - missing required fields
}

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.sendStatus(400); // Bad Request - invalid email format
}

// Password strength validation
if (password.length < 8) {
    return res.sendStatus(400); // Bad Request - password too weak
}

// Check for duplicate user
const existingUser = await getUserByEmail(email);
if (existingUser) {
    return res.sendStatus(409); // Conflict - user already exists
}
```

### CORS (Cross-Origin Resource Sharing)

```typescript
// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true
}));
```

## 📝 API Documentation

### OpenAPI/Swagger Specification

```yaml
openapi: 3.0.0
info:
  title: RESTful API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: List of users
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                email:
                  type: string
                password:
                  type: string
```

### Response Format Standards

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "message": "User created successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

## 🚀 Performance Optimization

### Database Optimization

#### Indexing
```typescript
// Create indexes for frequently queried fields
userSchema.index({ email: 1 }); // Unique index
userSchema.index({ username: 1 }); // Regular index
userSchema.index({ 'authentication.sessionToken': 1 }); // Compound index
```

#### Query Optimization
```typescript
// Select only needed fields
const user = await UserModel.findById(id).select('username email');

// Use lean() for read-only operations
const users = await UserModel.find().lean();

// Pagination
const users = await UserModel.find()
  .skip(page * limit)
  .limit(limit);
```

### Caching Strategies

#### Memory Caching
```typescript
const cache = new Map();

const getCachedUser = (id) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  const user = await UserModel.findById(id);
  cache.set(id, user);
  return user;
};
```

#### Redis Caching
```typescript
const redis = require('redis');
const client = redis.createClient();

const getCachedUser = async (id) => {
  const cached = await client.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  const user = await UserModel.findById(id);
  await client.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
};
```

## 🧪 Testing REST APIs

### Unit Testing
```typescript
describe('User Controller', () => {
  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/users')
      .send(userData)
      .expect(201);
      
    expect(response.body.username).toBe(userData.username);
  });
});
```

### Integration Testing
```typescript
describe('Authentication Flow', () => {
  it('should authenticate user and return token', async () => {
    // Register user
    await request(app)
      .post('/auth/register')
      .send(userData);
    
    // Login user
    const response = await request(app)
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);
      
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
```

## 🔄 API Versioning

### URL Versioning
```
GET /v1/users
GET /v2/users
```

### Header Versioning
```
GET /users
Accept: application/vnd.api+json;version=1
```

### Query Parameter Versioning
```
GET /users?version=1
```

## 📊 Monitoring & Analytics

### Request Logging
```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

### Performance Metrics
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

### Health Checks
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await checkDatabaseConnection()
  };
  res.json(health);
});
```

## 🎯 Best Practices Summary

### Design Principles
1. **Consistency**: Use consistent naming and response formats
2. **Simplicity**: Keep APIs simple and intuitive
3. **Stateless**: Don't store client state on server
4. **Cacheable**: Design for caching when possible
5. **Layered**: Use layered architecture

### Security Principles
1. **Authentication**: Always authenticate users
2. **Authorization**: Check permissions for each request
3. **Input Validation**: Validate all input data
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Implement rate limiting

### Performance Principles
1. **Database Optimization**: Use indexes and efficient queries
2. **Caching**: Implement appropriate caching strategies
3. **Compression**: Use response compression
4. **Pagination**: Implement pagination for large datasets
5. **Monitoring**: Monitor performance and errors
