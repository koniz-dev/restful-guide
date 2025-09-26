# Knowledge Base

## 📚 Core Concepts & Technologies

### Node.js Fundamentals

#### Event Loop
```javascript
// Understanding the Event Loop
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2
```

#### Modules & Exports
```javascript
// CommonJS (older)
module.exports = { function1, function2 };
const { function1 } = require('./module');

// ES Modules (modern)
export { function1, function2 };
import { function1 } from './module.js';
```

#### Async/Await vs Promises
```javascript
// Promises
getUserById(id)
  .then(user => updateUser(user))
  .then(updatedUser => res.json(updatedUser))
  .catch(error => res.status(500).json({ error }));

// Async/Await
try {
  const user = await getUserById(id);
  const updatedUser = await updateUser(user);
  res.json(updatedUser);
} catch (error) {
  res.status(500).json({ error });
}
```

### Express.js Deep Dive

#### Middleware Pattern
```javascript
// Middleware function signature
const middleware = (req, res, next) => {
  // Process request
  // Call next() to continue
  // Or send response to end chain
};

// Middleware types
app.use(express.json());           // Built-in middleware
app.use('/api', router);           // Router middleware
app.use(authMiddleware);           // Custom middleware
```

#### Request/Response Objects
```javascript
// Request object properties
req.body      // Parsed request body
req.params    // Route parameters (/users/:id)
req.query     // Query string parameters (?name=value)
req.headers   // HTTP headers
req.cookies   // Parsed cookies
req.user      // Custom user data (from middleware)

// Response methods
res.json(data)           // Send JSON response
res.status(201).json()   // Set status and send JSON (201 for created resources)
res.sendStatus(404)      // Send status only
res.cookie(name, value)  // Set cookie
res.redirect(url)        // Redirect to URL
```

### MongoDB & Mongoose

#### Schema Design
```javascript
// User schema with validation
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false }
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
```

#### Query Optimization
```javascript
// Efficient queries
const user = await UserModel
  .findById(id)
  .select('username email')  // Only select needed fields
  .lean();                   // Return plain objects (faster)

// Indexing for performance
userSchema.index({ email: 1 });                    // Single field index
userSchema.index({ username: 1, email: 1 });       // Compound index
userSchema.index({ 'authentication.sessionToken': 1 }); // Nested field index

// Aggregation pipeline
const stats = await UserModel.aggregate([
  { $match: { active: true } },
  { $group: { _id: null, count: { $sum: 1 } } }
]);
```

### TypeScript Advanced Concepts

#### Type Definitions
```typescript
// Interface definitions
interface User {
  _id: string;
  username: string;
  email: string;
  authentication: {
    password: string;
    salt: string;
    sessionToken?: string;
  };
}

// Generic types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Utility types
type PartialUser = Partial<User>;
type UserEmail = Pick<User, 'email'>;
type UserWithoutAuth = Omit<User, 'authentication'>;
```

#### Advanced TypeScript Patterns
```typescript
// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

// Mapped types
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'
```

## 🔐 Security Knowledge

### Cryptography Fundamentals

#### Hashing vs Encryption
```javascript
// Hashing (one-way)
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(data).digest('hex');

// HMAC (keyed hashing)
const hmac = crypto.createHmac('sha256', secretKey).update(data).digest('hex');

// Encryption (two-way)
const cipher = crypto.createCipher('aes192', password);
let encrypted = cipher.update(data, 'utf8', 'hex');
encrypted += cipher.final('hex');
```

#### Password Security Best Practices
```javascript
// Strong password requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Password strength checker
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, strength: score >= 4 ? 'strong' : 'weak' };
}
```

### Session Management

#### Session vs Token-based Auth
```javascript
// Session-based (server-side storage)
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));

// Token-based (stateless)
const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
const decoded = jwt.verify(token, secret);
```

#### Secure Cookie Configuration
```javascript
// Secure cookie settings
res.cookie('token', value, {
  httpOnly: true,    // Prevent XSS
  secure: true,      // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 3600000,   // 1 hour
  domain: '.example.com',
  path: '/'
});
```

## 🚀 Performance Optimization

### Database Performance

#### Connection Pooling
```javascript
// Mongoose connection with pooling
mongoose.connect(uri, {
  maxPoolSize: 10,        // Maximum number of connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

#### Query Optimization Techniques
```javascript
// Efficient pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const users = await UserModel
  .find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 })
  .lean();

// Count total for pagination metadata
const total = await UserModel.countDocuments();
const totalPages = Math.ceil(total / limit);
```

### Caching Strategies

#### Memory Caching
```javascript
// Simple in-memory cache
class MemoryCache {
  constructor(ttl = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

#### Redis Caching
```javascript
// Redis implementation
const redis = require('redis');
const client = redis.createClient();

async function getCachedUser(id) {
  const cached = await client.get(`user:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const user = await UserModel.findById(id);
  if (user) {
    await client.setex(`user:${id}`, 3600, JSON.stringify(user));
  }
  
  return user;
}
```

## 🧪 Testing Strategies

### Unit Testing
```javascript
// Jest unit test example
describe('Authentication Helper', () => {
  test('should generate random salt', () => {
    const salt1 = random();
    const salt2 = random();
    
    expect(salt1).not.toBe(salt2);
    expect(salt1).toHaveLength(171); // base64 of 128 bytes
  });
  
  test('should hash password consistently', () => {
    const salt = 'test-salt';
    const password = 'test-password';
    
    const hash1 = authentication(salt, password);
    const hash2 = authentication(salt, password);
    
    expect(hash1).toBe(hash2);
  });
});
```

### Integration Testing
```javascript
// Supertest integration test
const request = require('supertest');
const app = require('../src/index');

describe('User API', () => {
  test('should create user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.username).toBe(userData.username);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.authentication).toBeUndefined(); // Password hidden
  });
});
```

### Test Database Setup
```javascript
// Test database configuration
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});
```

## 📊 Monitoring & Debugging

### Logging Best Practices
```javascript
// Structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});
```

### Error Handling
```javascript
// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled Error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }
  
  // Default to 500 for unexpected server errors
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});
```

## 📊 HTTP Status Codes Best Practices

### Proper Status Code Usage

```typescript
// ✅ Correct status codes for different scenarios

// 2xx Success
res.status(200).json(data);        // GET requests - data retrieved
res.status(201).json(newResource); // POST requests - resource created
res.status(204).send();            // DELETE requests - resource deleted

// 4xx Client Errors
res.sendStatus(400); // Bad Request - invalid input or missing fields
res.sendStatus(401); // Unauthorized - authentication failed
res.sendStatus(403); // Forbidden - authenticated but not authorized
res.sendStatus(404); // Not Found - resource doesn't exist
res.sendStatus(409); // Conflict - resource already exists

// 5xx Server Errors
res.sendStatus(500); // Internal Server Error - unexpected server error
```

### Common Mistakes to Avoid

```typescript
// ❌ Wrong: Using 400 for authentication errors
if (!user || !user.authentication) {
    return res.sendStatus(400); // Should be 401
}

// ❌ Wrong: Using 400 for duplicate resources
if (existingUser) {
    return res.sendStatus(400); // Should be 409
}

// ❌ Wrong: Using 400 for server errors
catch (error) {
    return res.sendStatus(400); // Should be 500
}

// ✅ Correct usage
if (!user || !user.authentication) {
    return res.sendStatus(401); // Unauthorized
}

if (existingUser) {
    return res.sendStatus(409); // Conflict
}

catch (error) {
    return res.sendStatus(500); // Internal Server Error
}
```

## 🔧 Development Tools

### Code Quality Tools
```json
// ESLint configuration
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}

// Prettier configuration
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Development Scripts
```json
// package.json scripts
{
  "scripts": {
    "start": "nodemon",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  }
}
```

## 🚀 Deployment Knowledge

### Environment Configuration
```javascript
// Environment validation
const requiredEnvVars = [
  'MONGO_URL',
  'SECRET',
  'PORT'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Environment-specific configurations
const config = {
  development: {
    mongoUrl: process.env.MONGO_URL,
    port: process.env.PORT || 8080,
    logLevel: 'debug'
  },
  production: {
    mongoUrl: process.env.MONGO_URL,
    port: process.env.PORT || 80,
    logLevel: 'info'
  }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGO_URL=mongodb://mongo:27017/restful-guide
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

This knowledge base provides comprehensive coverage of the technologies, concepts, and best practices used in the RESTful API project, serving as a reference for developers working on the system.
