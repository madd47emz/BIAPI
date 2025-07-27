const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
const { testUser } = require('../fixtures/testData');

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to the test database (should already be connected by global setup)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const user = new User(testUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(testUser.username);
      expect(savedUser.email).toBe(testUser.email);
      expect(savedUser.password).not.toBe(testUser.password); // Should be hashed
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should not create user without required fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with invalid email', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email'
      };
      
      const user = new User(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with short password', async () => {
      const invalidUser = {
        ...testUser,
        password: '123'
      };
      
      const user = new User(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create user with short username', async () => {
      const invalidUser = {
        ...testUser,
        username: 'ab'
      };
      
      const user = new User(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create duplicate users with same email', async () => {
      const user1 = new User(testUser);
      await user1.save();

      const user2 = new User({
        ...testUser,
        username: 'different-username'
      });
      
      await expect(user2.save()).rejects.toThrow();
    });

    it('should not create duplicate users with same username', async () => {
      const user1 = new User(testUser);
      await user1.save();

      const user2 = new User({
        ...testUser,
        email: 'different@email.com'
      });
      
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User(testUser);
      await user.save();

      expect(user.password).not.toBe(testUser.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not hash password if not modified', async () => {
      const user = new User(testUser);
      await user.save();
      
      const originalHash = user.password;
      user.username = 'updated-username';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const user = new User(testUser);
      await user.save();

      const isMatch = await user.matchPassword(testUser.password);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = new User(testUser);
      await user.save();

      const isMatch = await user.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Schema Validation', () => {
    it('should trim whitespace from username and email', async () => {
      const userWithSpaces = {
        username: '  testuser  ',
        email: '  test@example.com  ',
        password: 'password123'
      };

      const user = new User(userWithSpaces);
      await user.save();

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should convert email to lowercase', async () => {
      const userWithUppercaseEmail = {
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const user = new User(userWithUppercaseEmail);
      await user.save();

      expect(user.email).toBe('test@example.com');
    });
  });
});
