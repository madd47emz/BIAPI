const Author = require('../models/author.model');
const Book = require('../models/book.model');
const path = require('path');
const fs = require('fs');

// Create an author
exports.createAuthor = async (req, res) => {
  try {
    // Check if photo was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }

    // Create author with photo path
    const author = await Author.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      photo: `/uploads/authors/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      data: author
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all authors
exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    
    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update author data
exports.updateAuthor = async (req, res) => {
  try {
    const { firstname, lastname } = req.body;
    const updateData = {};
    
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update author photo
exports.updateAuthorPhoto = async (req, res) => {
  try {
    // Check if photo was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required'
      });
    }
    
    // Find author
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      // Remove uploaded file if author not found
      fs.unlinkSync(path.join(__dirname, '../../public', req.file.path));
      
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    // Delete old photo if it exists
    if (author.photo) {
      const oldPhotoPath = path.join(__dirname, '../../public', author.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    // Update author with new photo
    author.photo = `/uploads/authors/${req.file.filename}`;
    await author.save();
    
    res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete author
exports.deleteAuthor = async (req, res) => {
  try {
    // Check if author has books
    const bookCount = await Book.countDocuments({ author: req.params.id });
    
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete author with associated books. Delete books first.'
      });
    }
    
    const author = await Author.findByIdAndDelete(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    // Delete author photo
    if (author.photo) {
      const photoPath = path.join(__dirname, '../../public', author.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Author deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
