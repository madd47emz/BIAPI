const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { 
  createAuthor, 
  getAllAuthors, 
  updateAuthor, 
  updateAuthorPhoto, 
  deleteAuthor 
} = require('../controllers/author.controller');

// Create author route (requires photo upload)
router.post('/', protect, upload.single('photo'), createAuthor);

// Get all authors
router.get('/', getAllAuthors);

// Update author data
router.put('/:id', protect, updateAuthor);

// Update author photo
router.put('/:id/photo', protect, upload.single('photo'), updateAuthorPhoto);

// Delete author
router.delete('/:id', protect, deleteAuthor);

module.exports = router;
