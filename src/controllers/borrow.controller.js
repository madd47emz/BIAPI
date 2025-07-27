const Book = require('../models/book.model');
const BorrowRecord = require('../models/borrow.model');

// Create a borrow record
exports.createBorrow = async (req, res) => {
  try {
    const { bookId, person } = req.body;
    
    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for borrowing'
      });
    }
    
    // Create borrow record
    const borrowRecord = await BorrowRecord.create({
      book: bookId,
      person
    });
    
    // Update available copies
    book.availableCopies -= 1;
    await book.save();
    
    res.status(201).json({
      success: true,
      data: borrowRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark a book as returned
exports.returnBook = async (req, res) => {
  try {
    // Find borrow record
    const borrowRecord = await BorrowRecord.findById(req.params.id);
    
    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }
    
    if (borrowRecord.returnedAt) {
      return res.status(400).json({
        success: false,
        message: 'Book already returned'
      });
    }
    
    // Update return date
    borrowRecord.returnedAt = new Date();
    await borrowRecord.save();
    
    // Update available copies
    const book = await Book.findById(borrowRecord.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
    
    res.status(200).json({
      success: true,
      data: borrowRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// List borrowed books (that haven't been returned yet)
exports.listBorrowed = async (req, res) => {
  try {
    const borrowRecords = await BorrowRecord.find({
      returnedAt: null
    }).populate({
      path: 'book',
      populate: { path: 'author' }
    });
    
    res.status(200).json({
      success: true,
      count: borrowRecords.length,
      data: borrowRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
