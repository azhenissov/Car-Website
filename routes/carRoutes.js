const express = require('express');
const router = express.Router();
const {
  createCarListing,
  getAllCarListings,
  getCarListingById,
  updateCarListing,
  deleteCarListing,
  getUserCarListings,
} = require('../controllers/carController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCar } = require('../middleware/validationMiddleware');
const { ROLES } = require('../config/constants');

// Public Routes
router.get('/', getAllCarListings);
router.get('/:id', getCarListingById);

// Private Routes
router.post('/', authenticate, validateCar, createCarListing);
router.put('/:id', authenticate, validateCar, updateCarListing);
router.delete('/:id', authenticate, deleteCarListing);
router.get('/user/listings', authenticate, getUserCarListings);

module.exports = router;
