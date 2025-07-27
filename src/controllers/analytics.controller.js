const Book = require('../models/book.model');
const BorrowRecord = require('../models/borrow.model');
const mongoose = require('mongoose');

// Get top 3 authors whose books have been borrowed the most
exports.getTopAuthors = async (req, res) => {
  try {
    const topAuthors = await BorrowRecord.aggregate([
      // Join with the books collection
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      // Unwind the array to get book details
      { $unwind: '$bookDetails' },
      // Join with authors collection to get author details
      {
        $lookup: {
          from: 'authors',
          localField: 'bookDetails.author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      // Unwind the author array
      { $unwind: '$authorDetails' },
      // Group by author and count borrows
      {
        $group: {
          _id: '$authorDetails._id',
          authorName: { $first: { $concat: ['$authorDetails.firstname', ' ', '$authorDetails.lastname'] } },
          photo: { $first: '$authorDetails.photo' },
          borrowCount: { $sum: 1 }
        }
      },
      // Sort by borrow count in descending order
      { $sort: { borrowCount: -1 } },
      // Limit to top 3
      { $limit: 3 }
    ]);
    
    res.status(200).json({
      success: true,
      data: topAuthors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get list of genres ordered by most borrowed
exports.getTopGenres = async (req, res) => {
  try {
    const topGenres = await BorrowRecord.aggregate([
      // Join with the books collection
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      // Unwind the array to get book details
      { $unwind: '$bookDetails' },
      // Group by genre and count borrows
      {
        $group: {
          _id: '$bookDetails.genre',
          genre: { $first: '$bookDetails.genre' },
          borrowCount: { $sum: 1 }
        }
      },
      // Sort by borrow count in descending order
      { $sort: { borrowCount: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: topGenres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
