const Book = require('../models/book.model');
const BorrowRecord = require('../models/borrow.model');

// Create a book
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all books with optional filters
exports.getAllBooks = async (req, res) => {
  try {
    let query = {};
    
    // Apply filters if provided
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.author) query.author = req.query.author;
    
    // Get books with populated author
    const books = await Book.find(query).populate('author');
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    // Check if book has active borrowers
    const activeBorrows = await BorrowRecord.countDocuments({
      book: req.params.id,
      returnedAt: null
    });
    
    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book that is currently borrowed'
      });
    }
    
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Delete associated borrow records
    await BorrowRecord.deleteMany({ book: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
