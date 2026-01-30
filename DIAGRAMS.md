# Architecture & Data Flow Diagrams

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                            │
│                    (React, Vue, Angular, etc.)                       │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTP/HTTPS
                              ↓
                    ┌─────────────────────┐
                    │   CORS Middleware   │
                    └──────────┬──────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS SERVER (Node.js)                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                    Global Middleware Stack                       │ │
│ │  ┌──────────────┐  ┌─────────┐  ┌────────────┐  ┌──────────┐   │ │
│ │  │   Helmet()   │→ │ CORS()  │→ │express.json│→ │ Routes   │   │ │
│ │  └──────────────┘  └─────────┘  └────────────┘  └──────────┘   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │                    Route-Specific Middleware                      ││
│ │  ┌──────────────────┐  ┌───────────────┐  ┌────────────────┐   ││
│ │  │validateRegistration│→│authenticate()│→ │authorize()     │   ││
│ │  └──────────────────┘  └───────────────┘  └────────────────┘   ││
│ └────────────┬────────────────────────────────────────────────────┘│
│              │                                                       │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │                      CONTROLLERS                                │ │
│ │  ┌──────────────┐  ┌──────────┐  ┌──────────────┐             │ │
│ │  │authController│  │userCtrl  │  │carController │             │ │
│ │  └──────────────┘  └──────────┘  └──────────────┘             │ │
│ └────────────┬───────────────────────────────────────────────────┘ │
│              │                                                       │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │                      MODELS (Mongoose)                          │ │
│ │  ┌──────────┐              ┌─────────┐                         │ │
│ │  │User Model│              │Car Model│                         │ │
│ │  │(Schema + │              │(Schema +│                         │ │
│ │  │Methods)  │              │Methods) │                         │ │
│ │  └──────────┘              └─────────┘                         │ │
│ └────────────┬───────────────────────────────────────────────────┘ │
│              │                                                       │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │                   ERROR HANDLING                                │ │
│ │          Global Error Handler Middleware                        │ │
│ └──────────────────────────────────────────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────────────┘
                      │ Responses (JSON)
┌─────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 MongoDB (Cloud or Local)                      │  │
│  │  ┌──────────────┐              ┌──────────────┐              │  │
│  │  │Users Table   │              │Cars Table    │              │  │
│  │  │(with indexes)│              │(with indexes)│              │  │
│  │  └──────────────┘              └──────────────┘              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request-Response Cycle

### Successful Flow (200/201)
```
┌─────────────┐
│   Request   │ POST /api/cars
│  (with JWT) │ { title, brand, model, ... }
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────┐
│ 1. Parse JSON Middleware         │
│    (express.json)                │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ 2. Authentication Middleware     │
│    - Extract JWT from header     │
│    - Verify token               │
│    - Attach user to req.user    │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ 3. Validation Middleware         │
│    - Validate input with Joi     │
│    - Check required fields       │
│    - Type checking              │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ 4. Controller                    │
│    - Create Car document         │
│    - Save to MongoDB             │
│    - Populate references         │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ 5. Response                      │
│    - Status: 201 Created         │
│    - Body: { success, car }      │
└──────┬───────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│ HTTP/1.1 201 Created                                │
│ Content-Type: application/json                      │
│                                                     │
│ {                                                   │
│   "success": true,                                  │
│   "message": "Car listing created successfully",    │
│   "car": { _id, title, brand, model, ... }        │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

### Error Flow (400/401/404)
```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────┐
│ 1. Parse JSON Middleware         │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ 2. Validation Middleware         │
│    (Invalid input detected!)     │
│    ✗ Missing required field      │
│    ✗ Invalid email format        │
│    ✗ Price is negative           │
└──────┬───────────────────────────┘
       │
       ↓ (Error thrown)
┌──────────────────────────────────┐
│ Global Error Handler             │
│ - Catch error                    │
│ - Format error message           │
│ - Determine status code          │
└──────┬───────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│ HTTP/1.1 400 Bad Request                            │
│ Content-Type: application/json                      │
│                                                     │
│ {                                                   │
│   "success": false,                                 │
│   "message": "Validation error",                    │
│   "details": [                                      │
│     {                                               │
│       "field": "price",                             │
│       "message": "Price cannot be negative"         │
│     }                                               │
│   ]                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## 3. Authentication Flow

```
┌────────────────────────────────────────────────────────────────┐
│                       USER REGISTERS                            │
│                  POST /api/auth/register                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
       ┌─────────────────────────────┐
       │ 1. Validate input with Joi  │
       │    - Check username         │
       │    - Check email format     │
       │    - Check password strength│
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌─────────────────────────────┐
       │ 2. Check duplicate user     │
       │    Query: User.findOne()    │
       │    by email or username     │
       └──────────┬──────────────────┘
                  │
                  ├─ User exists? → 409 Conflict
                  │
                  ↓ (User doesn't exist)
       ┌─────────────────────────────┐
       │ 3. Create new User          │
       │    new User({ ... })        │
       │    (password hashing in     │
       │     pre-save middleware)    │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌─────────────────────────────┐
       │ 4. Save to MongoDB          │
       │    await user.save()        │
       │    ← bcryptjs hashes pwd    │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌─────────────────────────────┐
       │ 5. Generate JWT Token       │
       │    generateToken(            │
       │      userId, role           │
       │    )                        │
       │    Header: {alg, typ}       │
       │    Payload: {userId, role}  │
       │    Signature: HMAC-SHA256   │
       └──────────┬──────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────────┐
│           201 Created + JWT Token                              │
│   { success, token, user }                                     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    USER LOGINS                                 │
│                POST /api/auth/login                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
       ┌─────────────────────────────┐
       │ 1. Validate email/password  │
       │    Check format             │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌─────────────────────────────┐
       │ 2. Find user by email       │
       │    User.findOne({email})    │
       │    + select password field  │
       └──────────┬──────────────────┘
                  │
                  ├─ User not found? → 401 Unauthorized
                  │
                  ↓ (User found)
       ┌─────────────────────────────┐
       │ 3. Compare passwords        │
       │    bcrypt.compare(           │
       │      inputPassword,         │
       │      hashedPassword         │
       │    )                        │
       └──────────┬──────────────────┘
                  │
                  ├─ Passwords don't match? → 401 Unauthorized
                  │
                  ↓ (Password matches)
       ┌─────────────────────────────┐
       │ 4. Generate JWT Token       │
       │    Same as registration     │
       └──────────┬──────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────────┐
│           200 OK + JWT Token                                   │
│   { success, token, user }                                     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│              USING TOKEN IN PROTECTED ROUTES                   │
│          GET /api/users/profile                                │
│          Headers: Authorization: Bearer {token}                │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
       ┌─────────────────────────────┐
       │ 1. Extract token from       │
       │    Authorization header     │
       │    "Bearer eyJhbGciOi..."   │
       └──────────┬──────────────────┘
                  │
                  ├─ No token? → 401 Unauthorized
                  │
                  ↓ (Token exists)
       ┌─────────────────────────────┐
       │ 2. Verify token             │
       │    jwt.verify(token, secret)│
       │    - Check signature        │
       │    - Check expiration       │
       └──────────┬──────────────────┘
                  │
                  ├─ Invalid/expired? → 401 Unauthorized
                  │
                  ↓ (Valid token)
       ┌─────────────────────────────┐
       │ 3. Extract user info        │
       │    Decode payload           │
       │    req.user = {             │
       │      userId, role, exp      │
       │    }                        │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌─────────────────────────────┐
       │ 4. Proceed to controller    │
       │    with user context        │
       │    Access req.user.userId   │
       └──────────┬──────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────────┐
│           200 OK + User Data                                   │
│   { success, user }                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Role-Based Access Control (RBAC) Flow

```
┌────────────────────────────────────────────────────────────────┐
│        DELETE /api/cars/:id (Admin Only Route)                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
       ┌─────────────────────────────┐
       │ 1. authenticate() Middleware│
       │    Verify JWT token         │
       │    Extract user info        │
       │    req.user = {             │
       │      userId: "123...",      │
       │      role: "user"           │
       │    }                        │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌──────────────────────────────┐
       │ 2. authorize(ADMIN) Check    │
       │    Is user.role == "admin"?  │
       │                              │
       │    Current user role: "user" │
       │    Required role: "admin"    │
       └──────────┬───────────────────┘
                  │
                  ├─ Role mismatch!
                  │
                  ↓
┌────────────────────────────────────────────────────────────────┐
│           403 Forbidden                                        │
│   { success: false,                                            │
│     message: "You do not have permission to access..." }       │
└────────────────────────────────────────────────────────────────┘

              vs.

┌────────────────────────────────────────────────────────────────┐
│        DELETE /api/cars/:id (User Can Delete Own Car)          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
       ┌─────────────────────────────┐
       │ 1. authenticate() Middleware│
       │    req.user.userId = "1"    │
       │    req.user.role = "user"   │
       └──────────┬──────────────────┘
                  │
                  ↓
       ┌──────────────────────────────┐
       │ 2. Controller checks:        │
       │    Does car.owner === userId?│
       │                              │
       │    Car owner: "1"            │
       │    Current user: "1"         │
       │    MATCH!                    │
       └──────────┬───────────────────┘
                  │
                  ↓
       ┌──────────────────────────────┐
       │ 3. Delete car from database  │
       └──────────┬───────────────────┘
                  │
                  ↓
┌────────────────────────────────────────────────────────────────┐
│           200 OK                                               │
│   { success: true,                                             │
│     message: "Car listing deleted successfully" }              │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Database Relationships

```
┌──────────────────────────────────────┐
│           Users Collection           │
├──────────────────────────────────────┤
│ _id: ObjectId (PK)                   │
│ username: String (Unique)            │
│ email: String (Unique)               │
│ password: String (Hashed)            │
│ firstName: String                    │
│ lastName: String                     │
│ role: String (admin, user, etc.)     │
│ address: Object                      │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└────────┬─────────────────────────────┘
         │
         │ (One-to-Many)
         │
         ├─────────────────────────────┐
         │                             │
         ↓                             ↓
┌──────────────────────────────────────┐
│           Cars Collection            │
├──────────────────────────────────────┤
│ _id: ObjectId (PK)                   │
│ title: String                        │
│ brand: String                        │
│ model: String                        │
│ year: Number                         │
│ price: Number                        │
│ owner: ObjectId (FK → Users._id)    │
│ views: Number                        │
│ rating: Number                       │
│ status: String                       │
│ reviews: Array                       │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└──────────────────────────────────────┘

Example Query:
  db.Cars.findOne({_id: "car_123"})
    .populate('owner')  ← Replaces ObjectId with actual User doc
```

---

## 6. Middleware Execution Order

```
Incoming Request
       │
       ↓
┌────────────────────────┐
│ helmet()               │ ← Security headers
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ cors()                 │ ← Cross-origin requests
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ express.json()         │ ← Parse JSON body
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ Route Matching         │ ← Find matching route
└────────┬───────────────┘
         │
         ↓ (for protected routes)
┌────────────────────────────────────┐
│ validateX (validationMiddleware)   │ ← Validate input
└────────┬─────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ authenticate (authMiddleware)      │ ← Verify JWT
└────────┬─────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ authorize (authMiddleware)         │ ← Check role
└────────┬─────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Controller Function                │ ← Business logic
└────────┬─────────────────────────┘
         │
         ↓ (if error occurs)
┌────────────────────────────────────┐
│ errorHandler (errorMiddleware)     │ ← Handle error
└────────┬─────────────────────────┘
         │
         ↓
    Response
```

---

## 7. Request Validation Pipeline

```
┌─────────────────────────┐
│    Input Data           │
│ { username, email, pwd} │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ Joi Schema Validation               │
├─────────────────────────────────────┤
│ ✓ username: string, 3-30 chars      │
│ ✓ email: valid email format         │
│ ✓ password: min 6 chars             │
│ ✓ confirmPassword: must match pwd   │
└────────┬────────────────────────────┘
         │
         ├─ Validation fails?
         │  ├─ Return 400 Bad Request
         │  ├─ Details: [{ field, msg }]
         │  └─ Stop processing
         │
         ↓ (Validation passes)
┌─────────────────────────────────────┐
│ Controller Logic                    │
├─────────────────────────────────────┤
│ 1. Check if user exists             │
│ 2. Hash password                    │
│ 3. Save to database                 │
│ 4. Generate token                   │
│ 5. Return success response          │
└─────────────────────────────────────┘
```

---

**These diagrams show how requests flow through your entire backend system!**
