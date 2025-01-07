# **Backend Internship Assignment**

## **Project Title: Advanced Library Management System**

### **Objective:**

Develop a backend system for managing a library\'s books, users, and
borrowing activities. The system should include database design, RESTful
APIs, authentication, error handling, and some advanced backend
features. Use **Node.js**, **TypeScript**, and **Express**. The database
should be **PostgreSQL**.

### **Task Breakdown:**

#### **1. Database Design (PostgreSQL)** {#database-design-postgresql}

Design the schema for the following entities:

1.  **Users** - For storing user information (librarians and members).

2.  **Books** - For storing book details.

3.  **BorrowedBooks** - For tracking borrowed books and return dates.

4.  **Transactions** - For tracking fines and payments.

5.  **Categories** - For categorizing books into genres.

6.  **Authors** - To manage author information and link authors to books
    > (many-to-many).

**Constraints & Relationships:**

- Each book has a unique ISBN.

- A book can have multiple copies.

- A user can borrow multiple books but cannot borrow more than 3 books
  > at a time.

- Books must be returned within 14 days; otherwise, a fine is incurred
  > (1 USD per day).

- Books can have multiple authors and belong to multiple categories.

- Users must have an email verified before borrowing books.

- Implement soft deletes for users and books.

Deliverables:

- SQL script to create tables.

- Database relationship diagram (optional but recommended).

#### **2. API Development** {#api-development}

Develop the following RESTful APIs:

1.  **Authentication APIs:  
    > **

    - Register/Login users (use JWT for authentication).

    - Role-based access (admin vs member).

    - Email verification for new users.

2.  **Book Management APIs:  
    > **

    - Add/Edit/Delete books (admin only).

    - Get book details by ISBN or title.

    - Search books by category, author, or availability.

3.  **User Management APIs:  
    > **

    - View user details.

    - Track borrowed books and fines.

    - Enable/disable user accounts.

4.  **Borrow and Return APIs:  
    > **

    - Borrow a book.

    - Return a book and calculate fines.

    - Check borrowing limits before processing requests.

5.  **Payment APIs:  
    > **

    - Pay fines for late returns.

    - Generate invoices for payments.

6.  **Analytics APIs (Advanced):  
    > **

    - Get statistics on most borrowed books.

    - Generate monthly usage reports for admins.

Deliverables:

- API endpoints documented in **Postman** or **Swagger**.

#### **3. General Backend Requirements** {#general-backend-requirements}

- Use **Prisma** for database interaction.

- Implement middleware for logging and error handling.

- Ensure proper validation of inputs using **zod** or **Joi**.

- Create reusable utilities for database connections and error messages.

- Add request rate limiting to prevent abuse.

### **Bonus Tasks**

1.  Implement a cache mechanism (e.g., **Redis**) for frequently
    > accessed endpoints.

2.  Create a scheduler to send email reminders for book return
    > deadlines.

3.  Deploy the application to a cloud platform (e.g., **Vercel** or
    > **Render**).

4.  Implement WebSocket support for real-time notifications (e.g.,
    > reminders).



**Follow this folder structure for submission**:  
/src

/controllers

/models

/routes

/middlewares

/services

/config

README.md

package.json

tsconfig.json

.env.example

- 

