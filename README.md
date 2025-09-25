# RESTful API Guide

A comprehensive RESTful API built with Node.js, Express, TypeScript, and MongoDB. This project demonstrates best practices for building scalable and secure web APIs.

## 🚀 Features

- **Authentication System**: Secure user registration and login with session tokens
- **User Management**: CRUD operations for user profiles
- **Middleware Protection**: Route protection with authentication and ownership validation
- **Environment Configuration**: Flexible configuration with environment variables
- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB Integration**: Robust database operations with Mongoose
- **Security**: Password hashing with salt, secure cookies, and CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom JWT-like session tokens
- **Security**: bcrypt-style password hashing with crypto
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authentication.ts # Auth controllers (register, login)
│   └── users.ts         # User CRUD controllers
├── db/                  # Database layer
│   └── user.ts          # User model and database operations
├── helpers/             # Utility functions
│   └── index.ts         # Authentication helpers (salt, hash)
├── middlewares/         # Express middlewares
│   └── index.ts         # Authentication and ownership middlewares
├── router/              # Route definitions
│   ├── index.ts         # Main router setup
│   ├── authentication.ts # Auth routes
│   └── users.ts         # User routes
└── index.ts             # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/koniz-dev/restful-guide.git
   cd restful-guide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   MONGO_URL=mongodb://localhost:27017/restful-guide
   
   # Authentication
   SECRET=your-secret-key-here
   AUTH_TOKEN_NAME=AUTH_TOKEN
   
   # Server
   PORT=8080
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:8080` (or your configured PORT).

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | `{ username, email, password }` |
| POST | `/auth/login` | Login user | `{ email, password }` |

### Users

| Method | Endpoint | Description | Auth Required | Body |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get all users | ✅ | - |
| GET | `/users/:id` | Get user by ID | ✅ | - |
| PATCH | `/users/:id` | Update user | ✅ + Owner | `{ username }` |
| DELETE | `/users/:id` | Delete user | ✅ + Owner | - |

## 🔐 Authentication Flow

1. **Registration**: User provides username, email, password
   - Password is hashed with salt using HMAC-SHA256
   - User data is stored in MongoDB

2. **Login**: User provides email and password
   - System verifies password against stored hash
   - Session token is generated and stored in cookie
   - Token is used for subsequent authenticated requests

3. **Protected Routes**: Middleware validates session token
   - Extracts token from cookie
   - Verifies token against database
   - Attaches user data to request object

## 🛡️ Security Features

- **Password Hashing**: HMAC-SHA256 with salt and secret key
- **Session Management**: Secure session tokens stored in HTTP-only cookies
- **Route Protection**: Authentication middleware for protected endpoints
- **Ownership Validation**: Users can only modify their own data
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Sensitive data stored in environment variables

## 🧪 Testing the API

### Register a new user
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get all users (requires authentication)
```bash
curl -X GET http://localhost:8080/users \
  -H "Cookie: AUTH_TOKEN=your-session-token"
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

### Code Style

- TypeScript with strict mode enabled
- ES2022 modules
- Consistent 4-space indentation
- Clear separation of concerns (controllers, services, models)

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URL` | MongoDB connection string | - | ✅ |
| `SECRET` | Secret key for password hashing | - | ✅ |
| `AUTH_TOKEN_NAME` | Cookie name for session token | `AUTH_TOKEN` | ❌ |
| `PORT` | Server port | `8080` | ❌ |

## 🤝 Contributing

1. Fork the repository: [https://github.com/koniz-dev/restful-guide](https://github.com/koniz-dev/restful-guide)
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- TypeScript for type safety
- The Node.js community for excellent tooling
