const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rate-limit.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  refreshToken
} = require('../controllers/auth.controller');

// Register new user
router.post('/signup', authLimiter, signup);

// Login user
router.post('/login', authLimiter, login);

// Forgot password
router.post('/forgot-password', authLimiter, forgotPassword);

// Reset password
router.post('/reset-password', authLimiter, resetPassword);

// Refresh token
router.post('/refresh-token', protect, refreshToken);

module.exports = router;
