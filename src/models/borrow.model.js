const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  person: {
    type: String,
    required: [true, 'Person name is required'],
    trim: true
  },
  borrowedAt: {
    type: Date,
    default: Date.now
  },
  returnedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
borrowRecordSchema.index({ book: 1, returnedAt: 1 });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
