// User Roles
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  PREMIUM_USER: 'premium_user',
  MODERATOR: 'moderator',
};

// Car Listing Status
const CAR_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RENTED: 'rented',
  UNDER_REVIEW: 'under_review',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  CAR_NOT_FOUND: 'Car listing not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
};

module.exports = {
  ROLES,
  CAR_STATUS,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
