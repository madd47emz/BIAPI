const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getTopAuthors,
  getTopGenres
} = require('../controllers/analytics.controller');

// Get top authors
router.get('/top-authors', protect, getTopAuthors);

// Get top genres
router.get('/top-genres', protect, getTopGenres);

module.exports = router;
