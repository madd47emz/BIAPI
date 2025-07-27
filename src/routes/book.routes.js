const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook
} = require('../controllers/book.controller');

// Create book route
router.post('/', protect, createBook);

// Get all books (with optional filters)
router.get('/', getAllBooks);

// Update book
router.put('/:id', protect, updateBook);

// Delete book
router.delete('/:id', protect, deleteBook);

module.exports = router;
