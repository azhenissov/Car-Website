const Joi = require('joi');

// User Registration Validation
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    firstName: Joi.string().max(50).allow(''),
    lastName: Joi.string().max(50).allow(''),
    phone: Joi.any(), // No validation for phone
  });

  return schema.validate(data);
};

// User Login Validation
const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

// Car Listing Validation
const validateCarListing = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    price: Joi.number().min(0).required(),
    mileage: Joi.number().min(0).required(),
    transmission: Joi.string().valid('manual', 'automatic').required(),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
    color: Joi.string(),
    features: Joi.array().items(Joi.string()),
    location: Joi.object({
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
    }),
  });

  return schema.validate(data);
};

// User Profile Update Validation
const validateUserProfileUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).allow(''),
    email: Joi.string().email().allow(''),
    firstName: Joi.string().max(50).allow(''),
    lastName: Joi.string().max(50).allow(''),
    phone: Joi.any(), // No validation for phone
    address: Joi.object({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      zipCode: Joi.string().allow(''),
      country: Joi.string().allow(''),
    }),
  });

  return schema.validate(data);
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCarListing,
  validateUserProfileUpdate,
};
