const request = require('supertest');
const path = require('path');
const createTestApp = require('../testApp');
const { testUser } = require('../fixtures/testData');

describe('Authors API', () => {
  let app;
  let authToken;
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
  });

  describe('POST /api/authors', () => {
    it('should create a new author with valid data and photo', async () => {
      const response = await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .attach('photo', testImagePath)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.firstname).toBe('John');
      expect(response.body.data.lastname).toBe('Doe');
      expect(response.body.data.photo).toBeDefined();
    });

    it('should not create author without authentication', async () => {
      const response = await request(app)
        .post('/api/authors')
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .attach('photo', testImagePath)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create author without photo', async () => {
      const response = await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create author without required fields', async () => {
      const response = await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('photo', testImagePath)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/authors', () => {
    beforeEach(async () => {
      // Create test authors
      await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .attach('photo', testImagePath);

      await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'Jane')
        .field('lastname', 'Smith')
        .attach('photo', testImagePath);
    });

    it('should get all authors without authentication', async () => {
      const response = await request(app)
        .get('/api/authors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(2);
    });

    it('should return empty array when no authors exist', async () => {
      // Clear all authors first
      const authorsResponse = await request(app).get('/api/authors');
      const authors = authorsResponse.body.data;
      
      for (const author of authors) {
        await request(app)
          .delete(`/api/authors/${author._id}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      const response = await request(app)
        .get('/api/authors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('PUT /api/authors/:id', () => {
    let authorId;

    beforeEach(async () => {
      // Create a test author
      const createResponse = await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .attach('photo', testImagePath);

      authorId = createResponse.body.data._id;
    });

    it('should update author with valid data', async () => {
      const updateData = {
        firstname: 'Updated John',
        lastname: 'Updated Doe'
      };

      const response = await request(app)
        .put(`/api/authors/${authorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstname).toBe(updateData.firstname);
      expect(response.body.data.lastname).toBe(updateData.lastname);
    });

    it('should not update author without authentication', async () => {
      const response = await request(app)
        .put(`/api/authors/${authorId}`)
        .send({ firstname: 'Updated Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent author', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/authors/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstname: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/authors/:id', () => {
    let authorId;

    beforeEach(async () => {
      // Create a test author
      const createResponse = await request(app)
        .post('/api/authors')
        .set('Authorization', `Bearer ${authToken}`)
        .field('firstname', 'John')
        .field('lastname', 'Doe')
        .attach('photo', testImagePath);

      authorId = createResponse.body.data._id;
    });

    it('should delete author with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/authors/${authorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify author is actually deleted
      const getResponse = await request(app).get('/api/authors');
      const authorExists = getResponse.body.data.some(author => author._id === authorId);
      expect(authorExists).toBe(false);
    });

    it('should not delete author without authentication', async () => {
      const response = await request(app)
        .delete(`/api/authors/${authorId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent author', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/authors/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
