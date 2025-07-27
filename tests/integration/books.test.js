const request = require('supertest');
const path = require('path');
const createTestApp = require('../testApp');
const { testUser } = require('../fixtures/testData');

describe('Books API', () => {
  let app;
  let authToken;
  let authorId;
  let testImagePath;

  beforeAll(async () => {
    app = await createTestApp();
    testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    // Create a test image file for upload tests
    const fs = require('fs');
    const buffer = Buffer.from('fake-image-data');
    fs.writeFileSync(testImagePath, buffer);
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

    // Create a test author for book tests
    const authorResponse = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${authToken}`)
      .field('firstname', 'Test')
      .field('lastname', 'Author')
      .attach('photo', testImagePath);

    authorId = authorResponse.body.author._id;
  });

  afterAll(async () => {
    // Clean up test image
    const fs = require('fs');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  describe('POST /api/books', () => {
    it('should create a new book with valid data', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.book).toBeDefined();
      expect(response.body.book.title).toBe(bookData.title);
      expect(response.body.book.genre).toBe(bookData.genre);
      expect(response.body.book.author).toBe(authorId);
      expect(response.body.book.availableCopies).toBe(bookData.availableCopies);
    });

    it('should not create book without authentication', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create book without required fields', async () => {
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create book with invalid author ID', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: '507f1f77bcf86cd799439011', // Non-existent author ID
        availableCopies: 5
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create book with negative copies', async () => {
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: -1
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      // Create test books
      const book1Data = {
        title: 'Fiction Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const book2Data = {
        title: 'Science Book',
        genre: 'Science',
        author: authorId,
        availableCopies: 3
      };

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(book1Data);

      await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(book2Data);
    });

    it('should get all books without authentication', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.books).toBeDefined();
      expect(response.body.books.length).toBe(2);
    });

    it('should filter books by genre', async () => {
      const response = await request(app)
        .get('/api/books?genre=Fiction')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.books).toBeDefined();
      expect(response.body.books.length).toBe(1);
      expect(response.body.books[0].genre).toBe('Fiction');
    });

    it('should filter books by author', async () => {
      const response = await request(app)
        .get(`/api/books?author=${authorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.books).toBeDefined();
      expect(response.body.books.length).toBe(2);
    });

    it('should return empty array when no books match filter', async () => {
      const response = await request(app)
        .get('/api/books?genre=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.books).toEqual([]);
    });
  });

  describe('PUT /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      // Create a test book
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData);

      bookId = createResponse.body.book._id;
    });

    it('should update book with valid data', async () => {
      const updateData = {
        title: 'Updated Test Book',
        genre: 'Updated Fiction',
        availableCopies: 10
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.book.title).toBe(updateData.title);
      expect(response.body.book.genre).toBe(updateData.genre);
      expect(response.body.book.availableCopies).toBe(updateData.availableCopies);
    });

    it('should not update book without authentication', async () => {
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/books/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not update book with negative copies', async () => {
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ availableCopies: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/books/:id', () => {
    let bookId;

    beforeEach(async () => {
      // Create a test book
      const bookData = {
        title: 'Test Book',
        genre: 'Fiction',
        author: authorId,
        availableCopies: 5
      };

      const createResponse = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookData);

      bookId = createResponse.body.book._id;
    });

    it('should delete book with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify book is actually deleted
      const getResponse = await request(app)
        .get('/api/books');
      
      const bookExists = getResponse.body.books.some(book => book._id === bookId);
      expect(bookExists).toBe(false);
    });

    it('should not delete book without authentication', async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/books/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
