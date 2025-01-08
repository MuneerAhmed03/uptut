# Library Management System

A robust backend system for managing a library's books, users, and borrowing activities.

Swagger Docs: https://uptut.onrender.com/docs/

## Features

- User Authentication with JWT
- Role-based Access Control (Admin/Member)
- Book Management
- Borrowing System
- Fine Management
- Email Notifications
- Analytics and Reports

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis
- Docker

## Project Structure

```
/src
  /config        # Configuration files
  /controllers   # Request handlers
  /middlewares   # Express middlewares
  /models        # Database models (Prisma schema)
  /routes        # API routes
  /services      # Business logic
  /utils         # Utility functions
/prisma          # Prisma schema and migrations
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or higher
- npm or yarn

## Setup and Running

1. Clone the repository:

```bash
git clone <repository-url>
cd library-management-system
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Start the application using Docker:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

# Detailed System Design for Library Management System

## Overview

This section outlines the design of a Library Management System (LMS) that supports essential library functions such as user management, book cataloging, borrowing, payments, and analytics. The system is modular, scalable, and follows modern software design principles.

---

## Architecture

### System Components

1. **Frontend**: User interface to interact with the system (e.g., web application).
2. **Backend**: RESTful API to handle business logic and data management.
3. **Database**: Persistent storage for structured data using PostgreSQL.
4. **Cache**: Redis for caching frequently accessed data.
5. **Authentication**: JWT-based authentication for secure user sessions.

### Tech Stack

- **Programming Language**: TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Cache**: Redis
- **Containerization**: Docker

---

## Database Design

### Entities

1. **User**

2. **Book**

3. **Author**

4. **Category**

5. **BorrowedBook**

6. **Transaction**

### Relationships

- **AuthorsOnBooks**: Many-to-many relationship between `Author` and `Book`.
- **CategoriesOnBooks**: Many-to-many relationship between `Category` and `Book`.
- **Foreign Keys**:
  - `BorrowedBook.userId` references `User.id`
  - `BorrowedBook.bookId` references `Book.id`
  - `Transaction.userId` references `User.id`
  - `Transaction.borrowedBookId` references `BorrowedBook.id`

---

## API Design

### Authentication

1. **Register** (`POST /auth/register`): Registers a new user.
2. **Login** (`POST /auth/login`): Authenticates a user.
3. **Email Verification** (`GET /auth/verify-email`): Verifies user email.

### Book Management

1. **Search Books** (`GET /books/search`): Searches books with filters.
2. **Get Book Details** (`GET /books/:isbn`): Retrieves book details.
3. **Create Book** (`POST /books`): Adds a new book (Admin only).
4. **Update Book** (`PUT /books/:isbn`): Updates book details (Admin only).
5. **Delete Book** (`DELETE /books/:isbn`): Deletes a book (Admin only).

### Borrowing

1. **Borrow Book** (`POST /borrow`): Borrows a book.
2. **Return Book** (`POST /borrow/:isbn/return`): Returns a borrowed book.
3. **Borrowing History** (`GET /borrow/history`): Retrieves borrowing history.

### Payments

1. **Get Fines** (`GET /payment/fines`): Retrieves outstanding fines.
2. **Pay Fine** (`POST /payment/fines/pay`): Pays a fine.
3. **Payment History** (`GET /payment/history`): Fetches payment history.

### Analytics (Admin Only)

1. **Most Borrowed Books** (`GET /analytics/most-borrowed`)
2. **Monthly Report** (`GET /analytics/monthly-report`)
3. **Overdue Stats** (`GET /analytics/overdue-stats`)

---

## Middleware Design

1. **Authentication Middleware**: Ensures the user is authenticated.
2. **Authorization Middleware**: Checks user roles for resource access.
3. **Cache Middleware**: Reduces load on the database for read-heavy endpoints.
4. **Rate Limiting Middleware**: Controls API usage to prevent abuse.
5. **Error Handling Middleware**: Standardized error handling across APIs.
6. **Validation Middleware**: Validates incoming request payloads.

---

## Key Features

### Caching

- **Why**: Improves performance by reducing database calls.
- **Implementation**: Redis is used to store query results for frequently accessed endpoints.

### Scalability

- Designed with modularity to allow for scaling both horizontally and vertically.
- Utilizes Docker for environment standardization and easy deployment.

### Security

1. **Authentication**: Implements JWT for secure user sessions.
2. **Encryption**: Uses bcrypt for password hashing.
3. **Role-based Access Control**: Restricts access to resources based on roles.

### Monitoring

- **Request Logging**: Logs request details for debugging and analytics.
- **Error Logging**: Captures errors in a structured format.

---

## Deployment

### Environment Variables

- `DATABASE_URL`: Database connection string.
- `REDIS_URL`: Redis connection string.
- `JWT_SECRET`: Secret key for JWT.

### Steps

1. **Build**: Use Docker to create images.
2. **Deploy**: Push to a container orchestration platform (e.g., Kubernetes).
3. **Seed Data**: Use provided scripts to seed the database.

---

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## License

ISC
