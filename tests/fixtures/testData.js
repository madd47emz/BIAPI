const bcrypt = require('bcryptjs');

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const testUser2 = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password123'
};

const testAuthor = {
  name: 'Test Author',
  bio: 'A test author for testing purposes'
};

const testAuthor2 = {
  name: 'Jane Smith',
  bio: 'Another test author'
};

const testBook = {
  title: 'Test Book',
  genre: 'Fiction',
  availableCopies: 5
};

const testBook2 = {
  title: 'Another Test Book',
  genre: 'Non-Fiction',
  availableCopies: 3
};

module.exports = {
  testUser,
  testUser2,
  testAuthor,
  testAuthor2,
  testBook,
  testBook2
};
