const mongoose = require('mongoose');

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Ensure we close the connection after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
