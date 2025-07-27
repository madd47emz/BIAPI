const request = require('supertest');
const path = require('path');
const createTestApp = require('../testApp');
const { testUser } = require('../fixtures/testData');

describe('Borrow API', () => {
  let app;
  let authToken;
  let authorId;
  let bookId;
  let testImagePath;

  beforeAll(async () => {
    app = await createTestApp();
    testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
  });

  beforeEach(async () => {
    // Register and login a user to get auth token
    await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    authToken = loginResponse.body.token;

    // Create a test author
    const authorResponse = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${authToken}`)
      .field('firstname', 'Test')
      .field('lastname', 'Author')
      .attach('photo', testImagePath);

    authorId = authorResponse.body.author._id;

    // Create a test book
    const bookData = {
      title: 'Test Book',
      genre: 'Fiction',
      author: authorId,
      availableCopies: 5
    };

    const bookResponse = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookData);

    bookId = bookResponse.body.book._id;
  });

  describe('POST /api/borrow', () => {
    it('should create a borrow record with valid data', async () => {
      const borrowData = {
        book: bookId,
        person: 'John Borrower'
      };

      const response = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.borrowRecord).toBeDefined();
      expect(response.body.borrowRecord.book).toBe(bookId);
      expect(response.body.borrowRecord.person).toBe(borrowData.person);
      expect(response.body.borrowRecord.borrowedAt).toBeDefined();
      expect(response.body.borrowRecord.returnedAt).toBeNull();
    });

    it('should not create borrow record without authentication', async () => {
      const borrowData = {
        book: bookId,
        person: 'John Borrower'
      };

      const response = await request(app)
        .post('/api/borrow')
        .send(borrowData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create borrow record without required fields', async () => {
      const response = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create borrow record for non-existent book', async () => {
      const borrowData = {
        book: '507f1f77bcf86cd799439011', // Non-existent book ID
        person: 'John Borrower'
      };

      const response = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not create borrow record when no copies available', async () => {
      // Update book to have 0 available copies
      await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ availableCopies: 0 });

      const borrowData = {
        book: bookId,
        person: 'John Borrower'
      };

      const response = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('available');
    });
  });

  describe('GET /api/borrow', () => {
    beforeEach(async () => {
      // Create some borrow records
      const borrowData1 = {
        book: bookId,
        person: 'John Borrower'
      };

      const borrowData2 = {
        book: bookId,
        person: 'Jane Borrower'
      };

      await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData1);

      await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData2);
    });

    it('should get all borrowed books with authentication', async () => {
      const response = await request(app)
        .get('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.borrowedBooks).toBeDefined();
      expect(response.body.borrowedBooks.length).toBe(2);
    });

    it('should not get borrowed books without authentication', async () => {
      const response = await request(app)
        .get('/api/borrow')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should populate book information in borrowed books list', async () => {
      const response = await request(app)
        .get('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.borrowedBooks[0].book).toBeDefined();
      expect(response.body.borrowedBooks[0].book.title).toBe('Test Book');
    });
  });

  describe('POST /api/borrow/return/:id', () => {
    let borrowRecordId;

    beforeEach(async () => {
      // Create a borrow record to return
      const borrowData = {
        book: bookId,
        person: 'John Borrower'
      };

      const borrowResponse = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${authToken}`)
        .send(borrowData);

      borrowRecordId = borrowResponse.body.borrowRecord._id;
    });

    it('should return book with valid borrow record ID', async () => {
      const response = await request(app)
        .post(`/api/borrow/return/${borrowRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.borrowRecord.returnedAt).toBeDefined();
      expect(response.body.message).toContain('returned');
    });

    it('should not return book without authentication', async () => {
      const response = await request(app)
        .post(`/api/borrow/return/${borrowRecordId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent borrow record', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/borrow/return/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not return already returned book', async () => {
      // First return
      await request(app)
        .post(`/api/borrow/return/${borrowRecordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to return again
      const response = await request(app)
        .post(`/api/borrow/return/${borrowRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already returned');
    });

    it('should increment available copies when book is returned', async () => {
      // Get initial available copies
      const initialBookResponse = await request(app)
        .get('/api/books')
        .expect(200);
      
      const initialBook = initialBookResponse.body.books.find(book => book._id === bookId);
      const initialCopies = initialBook.availableCopies;

      // Return the book
      await request(app)
        .post(`/api/borrow/return/${borrowRecordId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Check available copies increased
      const finalBookResponse = await request(app)
        .get('/api/books')
        .expect(200);
      
      const finalBook = finalBookResponse.body.books.find(book => book._id === bookId);
      expect(finalBook.availableCopies).toBe(initialCopies + 1);
    });
  });
});
