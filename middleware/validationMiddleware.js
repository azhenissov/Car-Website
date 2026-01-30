const { validateUserRegistration, validateUserLogin, validateUserProfileUpdate, validateCarListing } = require('../utils/validators');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

// Validate User Registration
const validateRegistration = (req, res, next) => {
  const { error, value } = validateUserRegistration(req.body);

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  req.body = value;
  next();
};

// Validate User Login
const validateLogin = (req, res, next) => {
  const { error, value } = validateUserLogin(req.body);

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  req.body = value;
  next();
};

// Validate Car Listing
const validateCar = (req, res, next) => {
  const { error, value } = validateCarListing(req.body);

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  req.body = value;
  next();
};

// Validate User Profile Update
const validateProfileUpdate = (req, res, next) => {
  const { error, value } = validateUserProfileUpdate(req.body);

  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCar,
  validateProfileUpdate,
};
