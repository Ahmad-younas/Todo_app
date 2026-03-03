# Authentication API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. User Signup
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "owner" // optional: "owner" or "invited_member", defaults to "owner"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login
**POST** `/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Refresh Access Token
**POST** `/auth/refresh-token`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Get User Profile
**GET** `/auth/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "owner",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

### JWT Implementation
- **Access Token**: Short-lived (15 minutes by default)
- **Refresh Token**: Long-lived (7 days by default)
- Tokens are signed with separate secrets for enhanced security
- Token expiry is configurable via environment variables

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 8 characters
- Passwords are never returned in API responses

### Authentication Middleware
- Validates JWT tokens on protected routes
- Extracts user information from token payload
- Returns appropriate error messages for expired or invalid tokens

## Environment Variables

Required environment variables in `.env`:

```env
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email, password, and name are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npm run migration:run
```

3. Start the development server:
```bash
npm run dev
```

4. The API will be available at `http://localhost:3000`
