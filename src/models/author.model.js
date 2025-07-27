const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  photo: {
    type: String,
    required: [true, 'Photo is required']
  }
}, {
  timestamps: true
});

// Virtual for author's full name
authorSchema.virtual('fullName').get(function() {
  return `${this.firstname} ${this.lastname}`;
});

module.exports = mongoose.model('Author', authorSchema);
