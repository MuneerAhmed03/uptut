# Library Management System

A robust backend system for managing a library's books, users, and borrowing activities.

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

4. Run database migrations:
```bash
docker-compose exec app npx prisma migrate deploy
```

The application will be available at `http://localhost:3000`.

## API Documentation

### Authentication APIs
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/verify-email - Verify email

### Book Management APIs
- GET /api/books/search - Search books
- GET /api/books/:id - Get book details
- POST /api/books - Add new book (Admin)
- PUT /api/books/:id - Update book (Admin)
- DELETE /api/books/:id - Delete book (Admin)

### Borrowing APIs
- POST /api/borrow - Borrow a book
- POST /api/borrow/:id/return - Return a book
- GET /api/borrow/history - Get borrowing history

### Payment APIs
- GET /api/payments/fines - Get user fines
- POST /api/payments/fines/:id/pay - Pay a fine
- GET /api/payments/history - Get payment history
- GET /api/payments/invoice/:id - Generate invoice

### Analytics APIs (Admin only)
- GET /api/analytics/most-borrowed - Get most borrowed books
- GET /api/analytics/monthly-report - Get monthly usage report
- GET /api/analytics/overdue-stats - Get overdue statistics

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