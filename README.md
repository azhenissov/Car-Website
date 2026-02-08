# Car Website - Backend API

A modern, scalable Node.js/Express backend for a car marketplace/rental platform with user authentication, car listing management, and advanced features like role-based access control and email notifications.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Frontend](#frontend)
- [Development](#development)
- [Contributing](#contributing)
- [Advanced Features](#advanced-features)

## Features

### Core Features
-  User authentication with JWT tokens
-  Secure password hashing with bcrypt
-  Role-based access control (Admin, User, Premium User, Moderator)
-  Car listing CRUD operations
-  Advanced search and filtering
-  User profile management
-  Input validation with Joi
-  Comprehensive error handling
-  Security headers with Helmet
-  CORS enabled

### Advanced Features
-  Email notifications with Nodemailer
-  Role-based authorization
-  Pagination support
-  Full-text search capabilities
-  View tracking for listings
-  Rating and review system ready
-  Password encryption and verification

## Architecture

```
car-website/
├── config/                  # Configuration files
│   ├── constants.js        # App constants and enums
│   └── database.js         # MongoDB connection
├── controllers/             # Business logic
│   ├── authController.js   # Auth endpoints
│   ├── userController.js   # User management
│   └── carController.js    # Car listing management
├── middleware/              # Custom middleware
│   ├── authMiddleware.js   # JWT verification & RBAC
│   ├── errorMiddleware.js  # Global error handler
│   └── validationMiddleware.js # Input validation
├── models/                  # MongoDB schemas
│   ├── User.js             # User schema
│   └── Car.js              # Car listing schema
├── routes/                  # API endpoints
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   └── carRoutes.js        # Car endpoints
├── utils/                   # Utility functions
│   ├── emailService.js     # Email functionality
│   ├── jwtUtils.js         # JWT utilities
│   └── validators.js       # Joi validation schemas
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── server.js               # Main server file
```

##  Prerequisites

- Node.js v14+ or higher
- MongoDB 4.4+ (local or cloud)
- npm or yarn

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd car-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-website

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Email (Optional)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server should run on `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | localhost:27017 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `EMAIL_HOST` | SMTP host | smtp.mailtrap.io |
| `EMAIL_PORT` | SMTP port | 2525 |
| `CORS_ORIGIN` | Allowed origin | * |

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints (Public)

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password_123",
  "confirmPassword": "secure_password_123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### User Endpoints (Private)

All user endpoints require authentication. Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

#### 3. Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "user",
    "isEmailVerified": false,
    "address": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### 5. Delete User Account
```http
DELETE /users/account
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Car Listing Endpoints

#### 6. Create Car Listing (Private)
```http
POST /cars
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "2022 BMW X5",
  "description": "Luxury SUV in perfect condition",
  "brand": "BMW",
  "model": "X5",
  "year": 2022,
  "price": 45000,
  "mileage": 15000,
  "transmission": "automatic",
  "fuelType": "diesel",
  "color": "Black",
  "features": ["Navigation", "Sunroof", "Heated Seats"],
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Car listing created successfully",
  "car": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "2022 BMW X5",
    "brand": "BMW",
    "model": "X5",
    "year": 2022,
    "price": 45000,
    "status": "available",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe"
    },
    "views": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 7. Get All Car Listings (Public)
```http
GET /cars?status=available&brand=BMW&minPrice=40000&maxPrice=50000&page=1&limit=10&search=X5
```

**Query Parameters:**
- `status`: Filter by status (available, sold, rented, under_review)
- `brand`: Filter by brand
- `model`: Filter by model
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Full-text search

**Response (200 OK):**
```json
{
  "success": true,
  "cars": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "2022 BMW X5",
      "price": 45000,
      "status": "available",
      "views": 5,
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### 8. Get Car Listing by ID (Public)
```http
GET /cars/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "car": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "2022 BMW X5",
    "description": "Luxury SUV in perfect condition",
    "brand": "BMW",
    "model": "X5",
    "year": 2022,
    "price": 45000,
    "mileage": 15000,
    "transmission": "automatic",
    "fuelType": "diesel",
    "color": "Black",
    "status": "available",
    "views": 6,
    "rating": 4.5,
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "features": ["Navigation", "Sunroof", "Heated Seats"],
    "reviews": []
  }
}
```

#### 9. Update Car Listing (Private - Owner/Admin)
```http
PUT /cars/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 43000,
  "mileage": 16000,
  "status": "available"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car listing updated successfully",
  "car": { ... }
}
```

#### 10. Delete Car Listing (Private - Owner/Admin)
```http
DELETE /cars/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car listing deleted successfully"
}
```

#### 11. Get User's Car Listings (Private)
```http
GET /cars/user/listings
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "cars": [ ... ],
  "pagination": { ... }
}
```

## Database Models

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (admin, user, premium_user, moderator),
  isEmailVerified: Boolean,
  profilePicture: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Car Schema
```javascript
{
  title: String (required),
  description: String (required),
  brand: String (required),
  model: String (required),
  year: Number (required),
  price: Number (required),
  mileage: Number (required),
  transmission: String (manual, automatic),
  fuelType: String (petrol, diesel, electric, hybrid),
  color: String,
  status: String (available, sold, rented, under_review),
  owner: ObjectId (User reference),
  images: Array,
  features: Array,
  location: {
    city: String,
    state: String,
    country: String
  },
  views: Number,
  rating: Number (0-5),
  reviews: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication

### JWT Flow

1. **User registers/logs in** → Receives JWT token
2. **Token included in requests** → `Authorization: Bearer <token>`
3. **Middleware validates token** → Extracts user info
4. **Request proceeds** → With authenticated user context

### Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId: "...", role: "user", iat: ..., exp: ... }
Signature: HMACSHA256(Header.Payload, SECRET)
```

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Compared securely during login

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "details": [ // Optional validation details
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `500` - Internal Server Error

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect GitHub to Render
3. Create new Web Service
4. Set Environment Variables in Render dashboard
5. Deploy!

### Deploy to Railway

1. Connect GitHub repo
2. Create new project
3. Add MongoDB service
4. Configure environment variables
5. Deploy automatically on push

### Deploy to Replit

1. Import repository
2. Create `.env` file with secrets
3. Run `npm install && npm start`
4. Share the URL

## Frontend

The project includes a frontend client located in the `/frontend` directory with the following features:

### Frontend Architecture
```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling
├── app.js             # Client-side JavaScript
├── nginx.conf         # Nginx configuration for production
└── Dockerfile         # Docker containerization
```

### Frontend Features
- **Responsive Design**: Mobile-friendly interface
- **User Authentication**: Login and registration forms
- **Car Listings**: Browse, search, and filter car listings
- **User Dashboard**: Profile management and listing control
- **Real-time Updates**: Live data from backend API

### Frontend Screenshots

#### Account Creation
![Account Creation](https://github.com/azhenissov/Car-Website/blob/main/Account%20creation.jpg?raw=true)

#### Sign In
![Sign In](https://github.com/azhenissov/Car-Website/blob/main/Sign%20in.jpg?raw=true)

#### Main Page
![Main Page](https://raw.githubusercontent.com/azhenissov/Car-Website/32aa0ad4d64626441a3c047817aa28d564a88db7/home%20page.jpg)

#### Car Explore
![Car Explore](https://github.com/azhenissov/Car-Website/blob/main/car%20explore.jpg?raw=true)

#### Car Listing Management
![Car Listing Management](https://github.com/azhenissov/Car-Website/blob/main/car%20listing%20management.jpg?raw=true)

#### About Us
![About Us](https://github.com/azhenissov/Car-Website/blob/main/about%20us.jpg?raw=true)

## Development

### Development Setup

1. **Backend Development**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server with auto-reload
   npm run dev
   ```

2. **Frontend Development**
   ```bash
   # Serve frontend files
   cd frontend
   python -m http.server 3000  # or use any static file server
   ```

3. **Database Setup for Development**
   ```bash
   # Using MongoDB Atlas (recommended)
   # Or local MongoDB
   mongod --dbpath /data/db
   ```

### Development Tools

- **ESLint**: Code linting and formatting
- **Nodemon**: Auto-restart server on changes
- **Postman**: API testing and documentation
- **Docker**: Containerization for consistent environments

### Project Structure

```
car-website/
├── config/                  # Configuration files
│   ├── constants.js        # App constants and enums
│   └── database.js         # MongoDB connection
├── controllers/             # Business logic
│   ├── authController.js   # Auth endpoints
│   ├── userController.js   # User management
│   └── carController.js    # Car listing management
├── middleware/              # Custom middleware
│   ├── authMiddleware.js   # JWT verification & RBAC
│   ├── errorMiddleware.js  # Global error handler
│   └── validationMiddleware.js # Input validation
├── models/                  # MongoDB schemas
│   ├── User.js             # User schema
│   └── Car.js              # Car listing schema
├── routes/                  # API endpoints
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   └── carRoutes.js        # Car endpoints
├── utils/                   # Utility functions
│   ├── emailService.js     # Email functionality
│   ├── jwtUtils.js         # JWT utilities
│   └── validators.js       # Joi validation schemas
├── frontend/                # Client-side code
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # CSS styling
│   ├── app.js             # Client-side JavaScript
│   ├── nginx.conf         # Nginx configuration
│   └── Dockerfile         # Frontend containerization
├── docs/                    # Documentation
│   └── project-report.md   # Project documentation
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Backend containerization
└── server.js               # Main server file
```

### API Testing

Use the provided Postman collection or test manually:

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","confirmPassword":"password123"}'

# Test car listing
curl -X GET http://localhost:5000/api/cars
```

## Contributing

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/Car-Website.git
   cd Car-Website
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```
5. **Push to your fork and create a pull request**

### Code Style

- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Write tests for new features
- Update documentation for API changes

### Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Code Review**: All changes require pull request review
3. **Testing**: Ensure all tests pass before merging
4. **Documentation**: Update README and API docs for new features

### Issue Reporting

When reporting issues, please include:
- **Environment details** (Node.js version, OS, etc.)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Error messages** and stack traces if applicable

## Advanced Features

### 1. Role-Based Access Control (RBAC)

Roles defined in `config/constants.js`:
- **Admin**: Full access, can delete any listing
- **User**: Standard access, can manage own listings
- **Premium User**: Additional features (reserved for future)
- **Moderator**: Can review and moderate listings

Use in routes:
```javascript
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteCarListing);
```

### 2. Email Service Integration

Configured with Nodemailer (supports Gmail, Mailtrap, SendGrid, etc.)

```javascript
const { sendVerificationEmail } = require('../utils/emailService');
await sendVerificationEmail(email, username, verificationLink);
```

### 3. Docker Support

The project includes Docker support for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build individual services
docker build -f Dockerfile -t car-website-backend .
docker build -f frontend/Dockerfile -t car-website-frontend .
```

### 4. Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Protection against abuse

## Sample .env Configuration

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/car-website

JWT_SECRET=your_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass

CORS_ORIGIN=http://localhost:3000

ADMIN_EMAIL=admin@carwebsite.com
ADMIN_PASSWORD=admin_password_change_in_production
```

## Testing Endpoints

Use tools like Postman or Thunder Client to test:

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Copy token
3. **Get Profile**: `GET /api/users/profile` with token
4. **Create Car**: `POST /api/cars` with token
5. **Get Cars**: `GET /api/cars` (public)
6. **Update Car**: `PUT /api/cars/:id` with token
7. **Delete Car**: `DELETE /api/cars/:id` with token
