const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createBorrow,
  returnBook,
  listBorrowed
} = require('../controllers/borrow.controller');

// Create borrow record
router.post('/', protect, createBorrow);

// Mark book as returned
router.post('/return/:id', protect, returnBook);

// List borrowed books
router.get('/', protect, listBorrowed);

module.exports = router;
