# Car Website Project Report

## Project Proposal

### Project Title
**Car Website - Online Car Marketplace and Rental Platform**

### Topic
This project is a comprehensive car marketplace and rental platform built using Node.js, Express, and MongoDB. The application allows users to register, authenticate, and manage car listings for sale or rent. It features role-based access control, email verification, and a robust API for managing car inventory with search and filtering capabilities.

### Why This Project Was Chosen
The automotive industry is rapidly moving towards digital platforms, and there's a growing demand for comprehensive online solutions that connect car sellers, renters, and buyers. This project addresses the need for a modern, secure, and scalable platform that streamlines the car buying and renting process while providing advanced features like user management, car listing management, and secure authentication.

### Main Features
- **User Authentication & Management**
  - User registration with email verification
  - Secure JWT-based authentication
  - Role-based access control (Admin, User, Premium User, Moderator)
  - User profile management
  - Password security with bcrypt hashing

- **Car Listing Management**
  - Create, read, update, and delete car listings
  - Multiple image upload support
  - Car search and filtering capabilities
  - Car status tracking (Available, Sold, Rented, Under Review)
  - Car reviews and ratings system

- **Security Features**
  - Input validation and sanitization
  - CORS configuration
  - Helmet security headers
  - Password encryption
  - JWT token authentication

- **API Features**
  - RESTful API design
  - Comprehensive error handling
  - Input validation using Joi
  - Rate limiting and security measures
  - Health check endpoints

### Team Members

- Usen Asylan
- Nurasyl Orazbek
- Anuar Zhenisov
- Ahmetov Rasul

## Database Design (Schemas)

### User Collection
```javascript
{
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'premium_user', 'moderator'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}
```

### Car Collection
```javascript
{
  title: {
    type: String,
    required: [true, 'Please provide a car title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please provide car brand'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please provide car model'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Please provide year of manufacture'],
    min: [1900, 'Year must be valid'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in future'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative'],
  },
  mileage: {
    type: Number,
    required: [true, 'Please provide mileage'],
    min: [0, 'Mileage cannot be negative'],
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    required: true,
  },
  color: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'under_review'],
    default: 'available',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  images: [
    {
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  features: [String],
  location: {
    city: String,
    state: String,
    country: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}
```

## API Endpoint List

### Authentication Endpoints
- **POST** `/api/auth/register` - User registration with email verification
- **POST** `/api/auth/login` - User login with JWT token generation

### User Management Endpoints
- **GET** `/api/users/profile` - Get user profile (Protected)
- **PUT** `/api/users/profile` - Update user profile (Protected)
- **DELETE** `/api/users/account` - Delete user account (Protected)

### Car Management Endpoints
- **GET** `/api/cars` - Get all car listings with search and filtering
- **GET** `/api/cars/:id` - Get specific car listing by ID
- **POST** `/api/cars` - Create new car listing (Protected)
- **PUT** `/api/cars/:id` - Update car listing (Protected)
- **DELETE** `/api/cars/:id` - Delete car listing (Protected)
- **GET** `/api/cars/user/listings` - Get user's car listings (Protected)

### Additional Endpoints
- **GET** `/health` - Server health check

## Technology Stack

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token for authentication
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Nodemailer** - Email functionality
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Jest** - Testing framework
- **dotenv** - Environment variable management

## Project Structure

```
Car-Website/
├── config/
│   ├── constants.js      # Application constants
│   └── database.js       # Database connection
├── controllers/          # Business logic
│   ├── authController.js
│   ├── carController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
├── models/              # Database models
│   ├── Car.js
│   └── User.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── carRoutes.js
│   └── userRoutes.js
├── utils/               # Utility functions
│   ├── emailService.js
│   ├── jwtUtils.js
│   └── validators.js
├── docs/                # Documentation
├── server.js            # Main application file
├── package.json         # Project dependencies
└── README.md           # Project documentation
```

## Security Features

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - Password encryption with bcrypt

2. **Input Validation**
   - Joi schema validation
   - Input sanitization
   - SQL injection prevention

3. **Security Headers**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting capabilities

4. **Data Protection**
   - Password hashing
   - Email verification
   - Secure session management

## Future Enhancements

1. **Frontend Integration**
   - React/Vue.js frontend application
   - Mobile application development
   - Progressive Web App (PWA) features

2. **Advanced Features**
   - Real-time chat between users
   - Car comparison tool
   - Advanced search and filtering
   - Payment integration for transactions

3. **Analytics & Monitoring**
   - User behavior analytics
   - Performance monitoring
   - Error tracking and logging

4. **Scalability Improvements**
   - Caching with Redis
   - Load balancing
   - Database optimization
   - Microservices architecture

## Conclusion

The Car Website project provides a solid foundation for a modern car marketplace platform. With its robust authentication system, comprehensive car listing management, and scalable architecture, it's well-positioned to meet the demands of the automotive industry. The team has successfully implemented core features while maintaining security best practices and following modern development standards.

The project demonstrates strong technical capabilities across the team members, with each contributing their expertise to create a cohesive and functional application. The modular architecture allows for easy maintenance and future enhancements, making it an excellent foundation for further development.