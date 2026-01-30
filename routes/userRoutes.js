const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, deleteUserAccount } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validationMiddleware');

// Private Routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, validateProfileUpdate, updateUserProfile);
router.delete('/account', authenticate, deleteUserAccount);

module.exports = router;
