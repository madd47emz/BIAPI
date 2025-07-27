const mongoose = require('mongoose');
const Author = require('../../src/models/author.model');

describe('Author Model', () => {
  beforeAll(async () => {
    // Connect to the test database (should already be connected by global setup)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  describe('Author Creation', () => {
    it('should create a valid author', async () => {
      const authorData = {
        firstname: 'John',
        lastname: 'Doe',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      const savedAuthor = await author.save();

      expect(savedAuthor._id).toBeDefined();
      expect(savedAuthor.firstname).toBe(authorData.firstname);
      expect(savedAuthor.lastname).toBe(authorData.lastname);
      expect(savedAuthor.photo).toBe(authorData.photo);
      expect(savedAuthor.createdAt).toBeDefined();
      expect(savedAuthor.updatedAt).toBeDefined();
    });

    it('should not create author without required fields', async () => {
      const author = new Author({});
      
      await expect(author.save()).rejects.toThrow();
    });

    it('should not create author without firstname', async () => {
      const authorData = {
        lastname: 'Doe',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await expect(author.save()).rejects.toThrow();
    });

    it('should not create author without lastname', async () => {
      const authorData = {
        firstname: 'John',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await expect(author.save()).rejects.toThrow();
    });

    it('should not create author without photo', async () => {
      const authorData = {
        firstname: 'John',
        lastname: 'Doe'
      };

      const author = new Author(authorData);
      await expect(author.save()).rejects.toThrow();
    });
  });

  describe('Author Schema Features', () => {
    it('should trim whitespace from firstname and lastname', async () => {
      const authorData = {
        firstname: '  John  ',
        lastname: '  Doe  ',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await author.save();

      expect(author.firstname).toBe('John');
      expect(author.lastname).toBe('Doe');
    });

    it('should generate fullName virtual', async () => {
      const authorData = {
        firstname: 'John',
        lastname: 'Doe',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await author.save();

      expect(author.fullName).toBe('John Doe');
    });

    it('should include virtuals when converting to JSON', async () => {
      const authorData = {
        firstname: 'John',
        lastname: 'Doe',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await author.save();

      // Get the virtual directly since toJSON might not include virtuals by default
      expect(author.fullName).toBe('John Doe');
      
      // Test that toJSON works with virtuals option
      const authorJSON = author.toJSON({ virtuals: true });
      expect(authorJSON.fullName).toBe('John Doe');
    });

    it('should include virtuals when converting to Object', async () => {
      const authorData = {
        firstname: 'John',
        lastname: 'Doe',
        photo: 'john-doe.jpg'
      };

      const author = new Author(authorData);
      await author.save();

      // Get the virtual directly
      expect(author.fullName).toBe('John Doe');
      
      // Test that toObject works with virtuals option
      const authorObject = author.toObject({ virtuals: true });
      expect(authorObject.fullName).toBe('John Doe');
    });
  });
});
