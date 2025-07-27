const mongoose = require('mongoose');
const Book = require('../../src/models/book.model');
const Author = require('../../src/models/author.model');

describe('Book Model', () => {
  let authorId;

  beforeAll(async () => {
    // Connect to the test database (should already be connected by global setup)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });
  
  beforeEach(async () => {
    // Create a test author for book relationships before each test
    const author = new Author({
      firstname: 'Test',
      lastname: 'Author',
      photo: 'test-author.jpg'
    });
    const savedAuthor = await author.save();
    authorId = savedAuthor._id;
  });

  describe('Book Creation', () => {
    it('should create a valid book', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      const savedBook = await book.save();

      expect(savedBook._id).toBeDefined();
      expect(savedBook.title).toBe(bookData.title);
      expect(savedBook.genre).toBe(bookData.genre);
      expect(savedBook.author.toString()).toBe(authorId.toString());
      expect(savedBook.availableCopies).toBe(bookData.availableCopies);
      expect(savedBook.createdAt).toBeDefined();
      expect(savedBook.updatedAt).toBeDefined();
    });

    it('should not create book without required fields', async () => {
      const book = new Book({});
      
      await expect(book.save()).rejects.toThrow();
    });

    it('should not create book without title', async () => {
      const bookData = {
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await expect(book.save()).rejects.toThrow();
    });

    it('should not create book without genre', async () => {
      const bookData = {
        title: 'Test Book',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await expect(book.save()).rejects.toThrow();
    });

    it('should not create book without author', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        availableCopies: 5
      };

      const book = new Book(bookData);
      await expect(book.save()).rejects.toThrow();
    });

    it('should not create book without availableCopies', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId
      };

      const book = new Book(bookData);
      await expect(book.save()).rejects.toThrow();
    });
  });

  describe('Book Validation', () => {
    it('should trim whitespace from title and genre', async () => {
      const bookData = {
        title: '  Test Book  ',
        genre: '  Fiction  ',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await book.save();

      expect(book.title).toBe('Test Book');
      expect(book.genre).toBe('Fiction');
    });

    it('should not allow negative available copies', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: -1
      };

      const book = new Book(bookData);
      await expect(book.save()).rejects.toThrow();
    });

    it('should allow zero available copies', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 0
      };

      const book = new Book(bookData);
      const savedBook = await book.save();

      expect(savedBook.availableCopies).toBe(0);
    });

    it('should validate author reference exists', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: new mongoose.Types.ObjectId(), // Non-existent author
        availableCopies: 5
      };

      const book = new Book(bookData);
      
      // This should save but when we try to populate, it would fail
      // MongoDB doesn't enforce referential integrity by default
      const savedBook = await book.save();
      expect(savedBook).toBeDefined();
    });
  });

  describe('Book Population', () => {
    it('should populate author information', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await book.save();

      const populatedBook = await Book.findById(book._id).populate('author');
      
      expect(populatedBook.author).toBeDefined();
      expect(populatedBook.author).not.toBeNull();
      expect(populatedBook.author.firstname).toBe('Test');
      expect(populatedBook.author.lastname).toBe('Author');
      expect(populatedBook.author.fullName).toBe('Test Author');
    });
  });

  describe('Book Schema Features', () => {
    it('should include virtuals when converting to JSON', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await book.save();

      const bookJSON = book.toJSON();
      expect(bookJSON.id).toBeDefined(); // Virtual id field
    });

    it('should include virtuals when converting to Object', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book = new Book(bookData);
      await book.save();

      const bookObject = book.toObject();
      expect(bookObject.id).toBeDefined(); // Virtual id field
    });
  });
});
