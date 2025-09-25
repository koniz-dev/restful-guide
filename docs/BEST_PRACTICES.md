# Best Practices Guide

## 🎯 Code Quality & Standards

### TypeScript Best Practices

#### 1. **Strict Type Safety**
```typescript
// ✅ Good: Explicit typing
const user: User = await getUserById(id);
const expectedHash: string = authentication(salt, password);

// ❌ Bad: Any types
const user: any = await getUserById(id);
const expectedHash = authentication(salt, password);
```

#### 2. **Null Safety**
```typescript
// ✅ Good: Proper null checks
if (!user || !user.authentication) {
    return res.sendStatus(400);
}
const auth = user.authentication!; // Non-null assertion after check

// ❌ Bad: Unsafe access
const auth = user.authentication; // Could be undefined
```

#### 3. **Type Assertions**
```typescript
// ✅ Good: Safe type assertion with checks
const currentUserId = get(req, "identity._id") as string | undefined;
if (!currentUserId || currentUserId.toString() !== id) {
    return res.sendStatus(403);
}

// ❌ Bad: Unsafe type assertion
const currentUserId = get(req, "identity._id") as string;
```

### Error Handling Best Practices

#### 1. **Consistent Error Responses**
```typescript
// ✅ Good: Consistent error handling
export const register = async (req: express.Request, res: express.Response) => {
    try {
        // Business logic
        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};
```

#### 2. **Specific Error Codes**
```typescript
// ✅ Good: Specific HTTP status codes
if (!user) {
    return res.sendStatus(404); // Not Found
}
if (!sessionToken) {
    return res.sendStatus(403); // Forbidden
}
if (!username) {
    return res.sendStatus(400); // Bad Request
}
```

#### 3. **Error Logging**
```typescript
// ✅ Good: Detailed error logging
catch (error) {
    console.log('Authentication error:', error);
    return res.sendStatus(400);
}
```

## 🔐 Security Best Practices

### 1. **Password Security**
```typescript
// ✅ Good: Strong password hashing
const salt = random(); // 128 bytes of randomness
const hashedPassword = authentication(salt, password);

// ✅ Good: HMAC with secret key
export const authentication = (salt: string, password: string) => {
    return crypto.createHmac("sha256", [salt, password].join("/"))
        .update(process.env.SECRET!)
        .digest("hex");
};
```

### 2. **Session Management**
```typescript
// ✅ Good: Secure session tokens
const salt = random();
user.authentication.sessionToken = authentication(salt, user._id.toString());

// ✅ Good: HTTP-only cookies
res.cookie(process.env.AUTH_TOKEN_NAME!, auth.sessionToken, { 
    domain: "localhost", 
    path: "/" 
});
```

### 3. **Environment Variables**
```typescript
// ✅ Good: Environment-based configuration
const PORT = process.env.PORT || 8080;
const sessionToken = req.cookies[process.env.AUTH_TOKEN_NAME!];

// ❌ Bad: Hardcoded values
const PORT = 8080;
const sessionToken = req.cookies["AUTH_TOKEN"];
```

### 4. **Input Validation**
```typescript
// ✅ Good: Input validation
const { username, email, password } = req.body;
if (!username || !email || !password) {
    return res.sendStatus(400);
}

// ✅ Good: Database validation
const existingUser = await getUserByEmail(email);
if (existingUser) {
    return res.sendStatus(400);
}
```

## 🏗️ Architecture Best Practices

### 1. **Separation of Concerns**
```typescript
// ✅ Good: Clear layer separation
// Router: Route definition only
router.post("/auth/register", register);

// Controller: Business logic
export const register = async (req, res) => {
    // Business logic here
};

// Database: Data operations only
export const createUser = (values) => new UserModel(values).save();
```

### 2. **Single Responsibility Principle**
```typescript
// ✅ Good: Each function has one responsibility
export const isAuthenticated = async (req, res, next) => {
    // Only handles authentication
};

export const isOwner = async (req, res, next) => {
    // Only handles ownership validation
};
```

### 3. **Dependency Injection**
```typescript
// ✅ Good: Dependencies passed as parameters
export default (router: express.Router) => {
    router.post("/auth/register", register);
};

// ✅ Good: Environment dependencies
mongoose.connect(process.env.MONGO_URL!);
```

## 📁 File Organization Best Practices

### 1. **Consistent Naming**
```
// ✅ Good: Clear, descriptive names
src/
├── controllers/
│   ├── authentication.ts
│   └── users.ts
├── middlewares/
│   └── index.ts
└── router/
    ├── authentication.ts
    └── users.ts
```

### 2. **Import Organization**
```typescript
// ✅ Good: Organized imports
import express from "express";

import { createUser, getUserByEmail } from "../db/user";
import { random, authentication } from "../helpers";
```

### 3. **Export Patterns**
```typescript
// ✅ Good: Named exports for utilities
export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (salt: string, password: string) => { ... };

// ✅ Good: Default export for main functionality
export default (router: express.Router) => { ... };
```

## 🚀 Performance Best Practices

### 1. **Database Optimization**
```typescript
// ✅ Good: Selective field loading
const user = await getUserByEmail(email).select(
    "+authentication.salt +authentication.password"
);

// ✅ Good: Efficient queries
export const getUserBySessionToken = (sessionToken: string) => 
    UserModel.findOne({ "authentication.sessionToken": sessionToken });
```

### 2. **Response Optimization**
```typescript
// ✅ Good: Compression middleware
app.use(compression());

// ✅ Good: Efficient response format
return res.status(200).json(user).end();
```

### 3. **Connection Management**
```typescript
// ✅ Good: Connection pooling
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL!);
```

## 🧪 Testing Best Practices

### 1. **Testable Code Structure**
```typescript
// ✅ Good: Pure functions for testing
export const authentication = (salt: string, password: string) => {
    return crypto.createHmac("sha256", [salt, password].join("/"))
        .update(process.env.SECRET!)
        .digest("hex");
};

// ✅ Good: Dependency injection for mocking
export const register = async (req, res, createUserFn = createUser) => {
    const user = await createUserFn({ username, email, authentication });
};
```

### 2. **Error Testing**
```typescript
// ✅ Good: Test error scenarios
describe('Authentication', () => {
    it('should return 400 for missing credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(400);
    });
});
```

## 📝 Documentation Best Practices

### 1. **Code Comments**
```typescript
// ✅ Good: Explain why, not what
const auth = user.authentication!; // Non-null assertion after null check
const expectedHash = authentication(auth.salt as string, password);
```

### 2. **API Documentation**
```typescript
// ✅ Good: Clear endpoint documentation
/**
 * POST /auth/register
 * Register a new user
 * 
 * Body: { username: string, email: string, password: string }
 * Response: 200 with user data or 400 for errors
 */
```

### 3. **README Structure**
```markdown
# ✅ Good: Comprehensive README
- Clear project description
- Installation instructions
- API documentation
- Environment variables
- Contributing guidelines
```

## 🔄 Version Control Best Practices

### 1. **Commit Messages**
```bash
# ✅ Good: Clear, descriptive commits
git commit -m "feat: add user authentication middleware"
git commit -m "fix: resolve TypeScript null safety issues"
git commit -m "docs: update API documentation"
```

### 2. **Branch Naming**
```bash
# ✅ Good: Descriptive branch names
feature/user-authentication
fix/password-hashing-bug
docs/api-documentation
```

### 3. **Code Review**
```typescript
// ✅ Good: Review checklist
- [ ] TypeScript types are correct
- [ ] Error handling is proper
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Tests are included
```

## 🚀 Deployment Best Practices

### 1. **Environment Configuration**
```bash
# ✅ Good: Environment-specific configs
# Development
NODE_ENV=development
PORT=8080

# Production
NODE_ENV=production
PORT=80
```

### 2. **Health Checks**
```typescript
// ✅ Good: Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
});
```

### 3. **Logging**
```typescript
// ✅ Good: Structured logging
console.log('User registered:', { 
    userId: user._id, 
    email: user.email,
    timestamp: new Date().toISOString()
});
```

## 🎯 Code Review Checklist

### Security
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authentication/authorization proper
- [ ] SQL injection prevention
- [ ] XSS protection

### Performance
- [ ] Database queries optimized
- [ ] Response compression enabled
- [ ] Connection pooling configured
- [ ] Memory leaks prevented

### Code Quality
- [ ] TypeScript types correct
- [ ] Error handling comprehensive
- [ ] Code is readable and maintainable
- [ ] Tests are included
- [ ] Documentation updated
