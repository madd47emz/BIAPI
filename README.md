# 📚 Library Book Management API

This project implements a **Library Book Management** system using a REST API.

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account

### Deployment Options

#### Option 1: Deploy to Render
1. Fork/clone this repository to GitHub
2. Sign up at [render.com](https://render.com)
3. Create a new Web Service and connect your GitHub repo
4. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT authentication
   - `JWT_EXPIRATION` - Token expiration (e.g., "7d")
5. Deploy the service

#### Option 2: Deploy to Heroku
1. Install Heroku CLI: `brew install heroku`
2. Login: `heroku login`
3. Create app: `heroku create library-api`
4. Set environment variables:
   ```
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set JWT_EXPIRATION="7d"
   ```
5. Deploy: `git push heroku main`

#### Option 3: Local Deployment
1. Clone this repository
2. Run `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=7d
   ```
4. Run `npm start`

---

## 🧱 Data Models

### 📘 Author
```json
{
  "_id": ObjectId,
  "firstname": String,
  "lastname": String,
  "photo": String
}
```

### 📗 Book
```json
{
  "_id": ObjectId,
  "title": String,
  "genre": String,
  "author": ObjectId, // ref to Author
  "availableCopies": Number
}
```

### 📙 Borrow Record
```json
{
  "_id": ObjectId,
  "book": ObjectId,    // ref to Book
  "person": String,    // name of the person who borrowed the book
  "borrowedAt": Date,
  "returnedAt": Date
}
```

---

## 📡 API Endpoints

### 👤 Authors

- `POST /authors` — Create an author (**photo is required**)
- `GET /authors` — List all authors
- `PUT /authors/:id` — Update author data
- `PUT /authors/:id/photo` — Update author photo
- `DELETE /authors/:id` — Delete an author

---

### 📚 Books

- `POST /books` — Create a book
- `GET /books` — List all books (with populated author, optional filters: genre & author)
- `PUT /books/:id` — Update a book
- `DELETE /books/:id` — Delete a book

---

### 🔄 Borrow Records

- `POST /borrow` — Create a borrow record (**only if availableCopies > 0**)
- `POST /return/:id` — Mark a book as returned
- `GET /borrow` — List borrowed books

---

### 📊 Analytics (preferably using MongoDB Aggregation)

- `GET /top-authors` — Top 3 authors whose books have been borrowed the most
- `GET /top-genres` — List of genres ordered by most borrowed

---

## 🔐 Bonus: Authentication (Optional)

Basic JWT Authentication (not directly related to library features):

- `POST /auth/signup` — Register a new user
- `POST /auth/login` — Authenticate & return a JWT token
- `POST /auth/forgot-password` — Send password reset link/code
- `POST /auth/reset-password` — Reset user password
- `POST /auth/refresh-token` — Refresh JWT access token

---

## ✅ Notes

- Follow **clean code** and **best practices**
- Implement **basic API security** (input validation, rate limiting, etc.)
- Once done:
  - 📁 Host your code on **GitHub** and share the repository link
  - 📫 Share your **Postman collection**

---