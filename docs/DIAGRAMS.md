# System Diagrams

## 🏗️ Architecture Diagrams

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
        API_CLIENT[API Client]
    end
    
    subgraph "API Gateway Layer"
        LB[Load Balancer]
        CORS[CORS Middleware]
    end
    
    subgraph "Application Layer"
        ROUTER[Express Router]
        AUTH_MW[Auth Middleware]
        OWNER_MW[Owner Middleware]
        CONTROLLER[Controllers]
    end
    
    subgraph "Business Logic Layer"
        HELPERS[Helper Functions]
        SERVICES[Business Services]
        VALIDATION[Input Validation]
    end
    
    subgraph "Data Access Layer"
        MODELS[Mongoose Models]
        REPOSITORY[Repository Functions]
    end
    
    subgraph "Infrastructure Layer"
        MONGODB[(MongoDB)]
        REDIS[(Redis Cache)]
        LOGS[Logging System]
    end
    
    WEB --> LB
    MOBILE --> LB
    API_CLIENT --> LB
    
    LB --> CORS
    CORS --> ROUTER
    
    ROUTER --> AUTH_MW
    AUTH_MW --> OWNER_MW
    OWNER_MW --> CONTROLLER
    
    CONTROLLER --> HELPERS
    CONTROLLER --> SERVICES
    CONTROLLER --> VALIDATION
    
    SERVICES --> MODELS
    SERVICES --> REPOSITORY
    
    MODELS --> MONGODB
    REPOSITORY --> MONGODB
    SERVICES --> REDIS
    CONTROLLER --> LOGS
```

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant AuthMW as Auth Middleware
    participant OwnerMW as Owner Middleware
    participant Controller
    participant Database
    participant Response

    Client->>Router: HTTP Request
    Router->>AuthMW: Route to Middleware
    
    alt Authentication Required
        AuthMW->>AuthMW: Extract Session Token
        AuthMW->>Database: Verify Token
        Database-->>AuthMW: User Data
        AuthMW->>AuthMW: Attach User to Request
    end
    
    AuthMW->>OwnerMW: Pass to Next Middleware
    
    alt Ownership Required
        OwnerMW->>OwnerMW: Check User ID Match
        OwnerMW->>OwnerMW: Validate Ownership
    end
    
    OwnerMW->>Controller: Pass to Controller
    Controller->>Controller: Business Logic
    Controller->>Database: Query/Update Data
    Database-->>Controller: Return Data
    Controller->>Response: Format Response
    Response-->>Client: HTTP Response
```

## 🔐 Authentication Flow Diagrams

### User Registration Flow

```mermaid
flowchart TD
    START([User Registration Request]) --> VALIDATE{Validate Input}
    VALIDATE -->|Invalid| ERROR1[Return 400 Bad Request]
    VALIDATE -->|Valid| CHECK_EMAIL{Email Exists?}
    
    CHECK_EMAIL -->|Yes| ERROR2[Return 400 User Exists]
    CHECK_EMAIL -->|No| GENERATE_SALT[Generate Salt]
    
    GENERATE_SALT --> HASH_PASSWORD[Hash Password with Salt]
    HASH_PASSWORD --> CREATE_USER[Create User in Database]
    CREATE_USER --> SUCCESS[Return 200 with User Data]
    
    ERROR1 --> END([End])
    ERROR2 --> END
    SUCCESS --> END
```

### User Login Flow

```mermaid
flowchart TD
    START([User Login Request]) --> VALIDATE{Validate Input}
    VALIDATE -->|Invalid| ERROR1[Return 400 Bad Request]
    VALIDATE -->|Valid| FIND_USER[Find User by Email]
    
    FIND_USER --> USER_EXISTS{User Exists?}
    USER_EXISTS -->|No| ERROR2[Return 400 User Not Found]
    USER_EXISTS -->|Yes| GET_PASSWORD[Get Password & Salt]
    
    GET_PASSWORD --> HASH_INPUT[Hash Input Password]
    HASH_INPUT --> COMPARE{Passwords Match?}
    
    COMPARE -->|No| ERROR3[Return 403 Forbidden]
    COMPARE -->|Yes| GENERATE_TOKEN[Generate Session Token]
    
    GENERATE_TOKEN --> SAVE_TOKEN[Save Token to Database]
    SAVE_TOKEN --> SET_COOKIE[Set Cookie with Token]
    SET_COOKIE --> SUCCESS[Return 200 with User Data]
    
    ERROR1 --> END([End])
    ERROR2 --> END
    ERROR3 --> END
    SUCCESS --> END
```

### Session Validation Flow

```mermaid
flowchart TD
    START([Protected Request]) --> EXTRACT_TOKEN[Extract Token from Cookie]
    EXTRACT_TOKEN --> TOKEN_EXISTS{Token Exists?}
    
    TOKEN_EXISTS -->|No| ERROR1[Return 403 Forbidden]
    TOKEN_EXISTS -->|Yes| FIND_USER[Find User by Token]
    
    FIND_USER --> USER_EXISTS{User Exists?}
    USER_EXISTS -->|No| ERROR2[Return 403 Forbidden]
    USER_EXISTS -->|Yes| ATTACH_USER[Attach User to Request]
    
    ATTACH_USER --> NEXT[Call Next Middleware/Controller]
    NEXT --> SUCCESS[Process Request]
    
    ERROR1 --> END([End])
    ERROR2 --> END
    SUCCESS --> END
```

## 🗄️ Database Schema Diagrams

### User Document Structure

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string username
        string email
        object authentication
        date createdAt
        date updatedAt
    }
    
    AUTHENTICATION {
        string password
        string salt
        string sessionToken
    }
    
    USER ||--|| AUTHENTICATION : contains
```

### Database Relationships

```mermaid
graph LR
    subgraph "MongoDB Collections"
        USERS[Users Collection]
        SESSIONS[Sessions Collection]
        LOGS[Logs Collection]
    end
    
    subgraph "User Document"
        USER_ID[User ID]
        USERNAME[Username]
        EMAIL[Email]
        AUTH[Authentication Object]
    end
    
    subgraph "Authentication Object"
        PASSWORD[Password Hash]
        SALT[Salt]
        TOKEN[Session Token]
    end
    
    USERS --> USER_ID
    USERS --> USERNAME
    USERS --> EMAIL
    USERS --> AUTH
    
    AUTH --> PASSWORD
    AUTH --> SALT
    AUTH --> TOKEN
```

## 🔄 Data Flow Diagrams

### User CRUD Operations

```mermaid
flowchart TD
    subgraph "Create User"
        C1[POST /users] --> C2[Validate Input]
        C2 --> C3[Hash Password]
        C3 --> C4[Save to Database]
        C4 --> C5[Return User Data]
    end
    
    subgraph "Read User"
        R1[GET /users/:id] --> R2[Find User by ID]
        R2 --> R3[Return User Data]
    end
    
    subgraph "Update User"
        U1[PATCH /users/:id] --> U2[Validate Ownership]
        U2 --> U3[Update User Data]
        U3 --> U4[Save to Database]
        U4 --> U5[Return Updated Data]
    end
    
    subgraph "Delete User"
        D1[DELETE /users/:id] --> D2[Validate Ownership]
        D2 --> D3[Delete from Database]
        D3 --> D4[Return Success]
    end
```

### Password Hashing Process

```mermaid
flowchart TD
    START([User Password]) --> GENERATE_SALT[Generate Random Salt]
    GENERATE_SALT --> COMBINE[Combine Salt + Password]
    COMBINE --> ADD_SECRET[Add Secret Key]
    ADD_SECRET --> HMAC[HMAC-SHA256 Hash]
    HMAC --> HEX[Convert to Hexadecimal]
    HEX --> STORE[Store Salt + Hash in Database]
    
    subgraph "Verification Process"
        INPUT([Input Password]) --> GET_SALT[Get Stored Salt]
        GET_SALT --> COMBINE2[Combine Salt + Input Password]
        COMBINE2 --> ADD_SECRET2[Add Secret Key]
        ADD_SECRET2 --> HMAC2[HMAC-SHA256 Hash]
        HMAC2 --> COMPARE[Compare with Stored Hash]
        COMPARE --> MATCH{Match?}
        MATCH -->|Yes| SUCCESS[Authentication Success]
        MATCH -->|No| FAIL[Authentication Failed]
    end
```

## 🚀 Deployment Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Development Machine"
        IDE[VS Code/IDE]
        NODE[Node.js Runtime]
        NODEMON[Nodemon]
        LOCAL_MONGO[(Local MongoDB)]
    end
    
    subgraph "Development Process"
        CODE[Write Code]
        SAVE[Save File]
        RELOAD[Auto Reload]
        TEST[Test API]
    end
    
    IDE --> CODE
    CODE --> SAVE
    SAVE --> NODEMON
    NODEMON --> RELOAD
    RELOAD --> NODE
    NODE --> LOCAL_MONGO
    NODE --> TEST
```

### Production Environment

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[NGINX/HAProxy]
    end
    
    subgraph "Application Servers"
        APP1[Node.js App 1]
        APP2[Node.js App 2]
        APP3[Node.js App 3]
    end
    
    subgraph "Database Layer"
        MONGO_PRIMARY[(MongoDB Primary)]
        MONGO_SECONDARY[(MongoDB Secondary)]
    end
    
    subgraph "Caching Layer"
        REDIS[(Redis Cache)]
    end
    
    subgraph "Monitoring"
        LOGS[Log Aggregation]
        METRICS[Performance Metrics]
        ALERTS[Alert System]
    end
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> MONGO_PRIMARY
    APP2 --> MONGO_PRIMARY
    APP3 --> MONGO_PRIMARY
    
    MONGO_PRIMARY --> MONGO_SECONDARY
    
    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS
    
    APP1 --> LOGS
    APP2 --> LOGS
    APP3 --> LOGS
    
    LOGS --> METRICS
    METRICS --> ALERTS
```

## 🔧 Component Interaction Diagram

### Middleware Chain

```mermaid
graph LR
    REQUEST[HTTP Request] --> CORS[CORS Middleware]
    CORS --> COMPRESSION[Compression Middleware]
    COMPRESSION --> COOKIE[Cookie Parser]
    COOKIE --> BODY[Body Parser]
    BODY --> ROUTER[Router]
    
    ROUTER --> AUTH[Auth Middleware]
    AUTH --> OWNER[Owner Middleware]
    OWNER --> CONTROLLER[Controller]
    
    CONTROLLER --> RESPONSE[HTTP Response]
    
    subgraph "Error Handling"
        ERROR[Error Handler]
    end
    
    AUTH -.-> ERROR
    OWNER -.-> ERROR
    CONTROLLER -.-> ERROR
    ERROR --> RESPONSE
```

### Module Dependencies

```mermaid
graph TD
    subgraph "Entry Point"
        INDEX[index.ts]
    end
    
    subgraph "Router Layer"
        MAIN_ROUTER[router/index.ts]
        AUTH_ROUTER[router/authentication.ts]
        USER_ROUTER[router/users.ts]
    end
    
    subgraph "Controller Layer"
        AUTH_CONTROLLER[controllers/authentication.ts]
        USER_CONTROLLER[controllers/users.ts]
    end
    
    subgraph "Middleware Layer"
        MIDDLEWARE[middlewares/index.ts]
    end
    
    subgraph "Helper Layer"
        HELPERS[helpers/index.ts]
    end
    
    subgraph "Database Layer"
        USER_DB[db/user.ts]
    end
    
    INDEX --> MAIN_ROUTER
    MAIN_ROUTER --> AUTH_ROUTER
    MAIN_ROUTER --> USER_ROUTER
    
    AUTH_ROUTER --> AUTH_CONTROLLER
    USER_ROUTER --> USER_CONTROLLER
    
    AUTH_CONTROLLER --> HELPERS
    AUTH_CONTROLLER --> USER_DB
    USER_CONTROLLER --> USER_DB
    
    AUTH_ROUTER --> MIDDLEWARE
    USER_ROUTER --> MIDDLEWARE
    
    MIDDLEWARE --> USER_DB
```

## 📊 Performance Monitoring Diagram

### Request Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer
    participant App
    participant Database
    participant Cache
    participant Monitor

    Client->>LoadBalancer: HTTP Request
    LoadBalancer->>App: Forward Request
    App->>Monitor: Log Request Start
    
    App->>Cache: Check Cache
    alt Cache Hit
        Cache-->>App: Return Cached Data
    else Cache Miss
        App->>Database: Query Database
        Database-->>App: Return Data
        App->>Cache: Store in Cache
    end
    
    App->>Monitor: Log Request End
    App-->>LoadBalancer: HTTP Response
    LoadBalancer-->>Client: HTTP Response
    
    Monitor->>Monitor: Calculate Metrics
    Monitor->>Monitor: Check Alerts
```

## 🛡️ Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        HTTPS[HTTPS/TLS]
        FIREWALL[Firewall]
    end
    
    subgraph "Application Security"
        CORS[CORS Policy]
        RATE_LIMIT[Rate Limiting]
        VALIDATION[Input Validation]
    end
    
    subgraph "Authentication Security"
        PASSWORD_HASH[Password Hashing]
        SESSION_TOKEN[Session Tokens]
        COOKIE_SECURITY[Cookie Security]
    end
    
    subgraph "Authorization Security"
        AUTH_MIDDLEWARE[Auth Middleware]
        OWNER_CHECK[Ownership Validation]
        PERMISSION_CHECK[Permission Checks]
    end
    
    subgraph "Data Security"
        ENCRYPTION[Data Encryption]
        BACKUP[Secure Backups]
        AUDIT[Audit Logs]
    end
    
    HTTPS --> CORS
    FIREWALL --> RATE_LIMIT
    CORS --> VALIDATION
    RATE_LIMIT --> PASSWORD_HASH
    VALIDATION --> SESSION_TOKEN
    PASSWORD_HASH --> AUTH_MIDDLEWARE
    SESSION_TOKEN --> OWNER_CHECK
    COOKIE_SECURITY --> PERMISSION_CHECK
    AUTH_MIDDLEWARE --> ENCRYPTION
    OWNER_CHECK --> BACKUP
    PERMISSION_CHECK --> AUDIT
```

## 📈 Scalability Diagram

### Horizontal Scaling

```mermaid
graph TB
    subgraph "Client Layer"
        CLIENTS[Multiple Clients]
    end
    
    subgraph "Load Balancer"
        LB[Load Balancer]
    end
    
    subgraph "Application Tier"
        APP1[App Instance 1]
        APP2[App Instance 2]
        APP3[App Instance 3]
        APP4[App Instance N]
    end
    
    subgraph "Database Tier"
        MONGO_SHARD1[(MongoDB Shard 1)]
        MONGO_SHARD2[(MongoDB Shard 2)]
        MONGO_SHARD3[(MongoDB Shard 3)]
    end
    
    subgraph "Cache Tier"
        REDIS_CLUSTER[(Redis Cluster)]
    end
    
    CLIENTS --> LB
    LB --> APP1
    LB --> APP2
    LB --> APP3
    LB --> APP4
    
    APP1 --> MONGO_SHARD1
    APP2 --> MONGO_SHARD2
    APP3 --> MONGO_SHARD3
    APP4 --> MONGO_SHARD1
    
    APP1 --> REDIS_CLUSTER
    APP2 --> REDIS_CLUSTER
    APP3 --> REDIS_CLUSTER
    APP4 --> REDIS_CLUSTER
```

These diagrams provide a comprehensive visual representation of the system architecture, data flows, security layers, and scalability considerations for the RESTful API project.
