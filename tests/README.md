# Testing Documentation

This document describes the test suite for the Library Book Management API.

## Test Structure

```
tests/
├── fixtures/           # Test data and helper files
│   ├── testData.js      # Sample test data
│   └── test-image.jpg   # Fake image for upload tests
├── integration/         # Integration tests (API endpoints)
│   ├── auth.test.js     # Authentication tests
│   ├── authors.test.js  # Authors API tests
│   ├── books.test.js    # Books API tests
│   └── borrow.test.js   # Borrow/Return API tests
├── unit/               # Unit tests (models, utilities)
│   ├── user.model.test.js
│   ├── author.model.test.js
│   └── book.model.test.js
├── globalSetup.js      # Global test setup (MongoDB Memory Server)
├── globalTeardown.js   # Global test cleanup
├── setup.js           # Test setup hooks
└── testApp.js         # Test application factory
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: Node.js
- **Test Pattern**: `**/*.test.js` and `**/*.spec.js`
- **Coverage**: Includes all `src/**/*.js` files except `server.js`
- **Timeout**: 30 seconds for async operations
- **Setup**: Uses MongoDB Memory Server for isolated testing

### Environment Variables (Test)
- `MONGODB_URI`: Set to in-memory MongoDB instance
- `JWT_SECRET`: Test JWT secret
- `JWT_EXPIRATION`: 1 hour
- `NODE_ENV`: test

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Test Features

### Database Testing
- **In-Memory MongoDB**: Tests use MongoDB Memory Server for fast, isolated testing
- **Clean State**: Database is cleared before each test
- **No External Dependencies**: Tests don't require a running MongoDB instance

### Authentication Testing
- **JWT Token Generation**: Tests create real JWT tokens for authenticated endpoints
- **Permission Testing**: Verifies protected routes require authentication
- **User Registration/Login**: Tests complete auth flow

### File Upload Testing
- **Fake Image Files**: Uses dummy files for upload testing
- **Multer Integration**: Tests file upload middleware
- **File Validation**: Tests file requirements and restrictions

### API Testing
- **Complete CRUD Operations**: Tests Create, Read, Update, Delete for all resources
- **Error Handling**: Tests various error scenarios and edge cases
- **Input Validation**: Tests model validation and request validation
- **Response Format**: Verifies API response structure and data

## Test Data

### Test User
```javascript
{
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
}
```

### Test Author
```javascript
{
  firstname: 'Test',
  lastname: 'Author',
  photo: 'test-image.jpg'
}
```

### Test Book
```javascript
{
  title: 'Test Book',
  genre: 'Fiction',
  author: authorId,
  availableCopies: 5
}
```

## Common Test Patterns

### Setting Up Authentication
```javascript
beforeEach(async () => {
  // Register user
  await request(app)
    .post('/api/auth/signup')
    .send(testUser);

  // Login and get token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    });

  authToken = loginResponse.body.token;
});
```

### Testing Protected Endpoints
```javascript
it('should require authentication', async () => {
  const response = await request(app)
    .post('/api/protected-endpoint')
    .send(data)
    .expect(401);

  expect(response.body.success).toBe(false);
});

it('should work with authentication', async () => {
  const response = await request(app)
    .post('/api/protected-endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .send(data)
    .expect(200);

  expect(response.body.success).toBe(true);
});
```

### Testing File Uploads
```javascript
it('should upload file successfully', async () => {
  const response = await request(app)
    .post('/api/upload-endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .field('name', 'Test Name')
    .attach('photo', testImagePath)
    .expect(201);

  expect(response.body.success).toBe(true);
});
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is cleared before each test
3. **Real Operations**: Tests use actual database operations, not mocks
4. **Error Cases**: Tests include both success and failure scenarios
5. **Async Handling**: Proper async/await usage throughout
6. **Descriptive Names**: Test names clearly describe what is being tested
7. **Arrange-Act-Assert**: Tests follow clear structure

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure no other MongoDB instances conflict
2. **File Permissions**: Test image files need read permissions
3. **Async Issues**: Always use async/await for database operations
4. **Token Expiry**: JWT tokens are valid for test duration

### Debug Tips

1. Use `console.log()` in tests for debugging
2. Run single test file: `npx jest tests/integration/auth.test.js`
3. Run specific test: `npx jest -t "should create user"`
4. Use `--verbose` flag for detailed output
