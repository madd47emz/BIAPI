const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const authorRoutes = require('../src/routes/author.routes');
const bookRoutes = require('../src/routes/book.routes');
const borrowRoutes = require('../src/routes/borrow.routes');
const analyticsRoutes = require('../src/routes/analytics.routes');
const authRoutes = require('../src/routes/auth.routes');

const createTestApp = async () => {
  // Connect to test database (already set up by globalSetup)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Initialize express app
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Serve static files
  app.use(express.static(path.join(__dirname, '../public')));

  // API routes (without rate limiting for tests)
  app.use('/api/authors', authorRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/borrow', borrowRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/auth', authRoutes);

  // Root route
  app.get('/', (req, res) => {
    res.send('Library Book Management API is running!');
  });

  // Handle 404 errors
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  });

  return app;
};

module.exports = createTestApp;
