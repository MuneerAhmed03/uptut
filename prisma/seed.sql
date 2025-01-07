-- Users
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isEmailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', 'admin@library.com', '$2a$10$6lA7Tkv0gOO5ILpR.pX1XeGHmGUqnzL6bB2PS1F2QOv6IsZiv1Aqe', 'Admin', 'User', 'ADMIN', true, true, NOW(), NOW()),
  ('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'member@library.com', '$2a$10$6lA7Tkv0gOO5ILpR.pX1XeGHmGUqnzL6bB2PS1F2QOv6IsZiv1Aqe', 'Regular', 'Member', 'MEMBER', true, true, NOW(), NOW()),
  ('3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', 'john.doe@example.com', '$2a$10$6lA7Tkv0gOO5ILpR.pX1XeGHmGUqnzL6bB2PS1F2QOv6IsZiv1Aqe', 'John', 'Doe', 'MEMBER', true, true, NOW(), NOW());

-- Authors
INSERT INTO "Author" (id, name, bio, "createdAt", "updatedAt")
VALUES
  ('1d2e3f4g-5h6i-7j8k-9l0m-1n2o3p4q5r6s', 'George Orwell', 'English novelist and essayist', NOW(), NOW()),
  ('2e3f4g5h-6i7j-8k9l-0m1n-2o3p4q5r6s7t', 'Jane Austen', 'English novelist known for romantic fiction', NOW(), NOW()),
  ('3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u', 'J.K. Rowling', 'British author best known for Harry Potter series', NOW(), NOW());

-- Categories
INSERT INTO "Category" (id, name, "createdAt", "updatedAt")
VALUES
  ('1g2h3i4j-5k6l-7m8n-9o0p-1q2r3s4t5u6v', 'Fiction', NOW(), NOW()),
  ('2h3i4j5k-6l7m-8n9o-0p1q-2r3s4t5u6v7w', 'Science Fiction', NOW(), NOW()),
  ('3i4j5k6l-7m8n-9o0p-1q2r-3s4t5u6v7w8x', 'Romance', NOW(), NOW()),
  ('4j5k6l7m-8n9o-0p1q-2r3s-4t5u6v7w8x9y', 'Fantasy', NOW(), NOW());

-- Books
INSERT INTO "Book" (id, isbn, title, description, "totalCopies", "availableCopies", "createdAt", "updatedAt")
VALUES
  ('1j2k3l4m-5n6o-7p8q-9r0s-1t2u3v4w5x6y', '9780451524935', '1984', 'A dystopian novel by George Orwell', 5, 3, NOW(), NOW()),
  ('2k3l4m5n-6o7p-8q9r-0s1t-2u3v4w5x6y7z', '9780141439518', 'Pride and Prejudice', 'A romantic novel by Jane Austen', 3, 2, NOW(), NOW()),
  ('3l4m5n6o-7p8q-9r0s-1t2u-3v4w5x6y7z8a', '9780439708180', 'Harry Potter and the Sorcerer''s Stone', 'First book in the Harry Potter series', 4, 2, NOW(), NOW()),
  ('4m5n6o7p-8q9r-0s1t-2u3v-4w5x6y7z8a9b', '9780141187761', 'Animal Farm', 'An allegorical novella by George Orwell', 3, 3, NOW(), NOW());

-- AuthorsOnBooks
INSERT INTO "AuthorsOnBooks" ("bookId", "authorId")
VALUES
  ('1j2k3l4m-5n6o-7p8q-9r0s-1t2u3v4w5x6y', '1d2e3f4g-5h6i-7j8k-9l0m-1n2o3p4q5r6s'),
  ('2k3l4m5n-6o7p-8q9r-0s1t-2u3v4w5x6y7z', '2e3f4g5h-6i7j-8k9l-0m1n-2o3p4q5r6s7t'),
  ('3l4m5n6o-7p8q-9r0s-1t2u-3v4w5x6y7z8a', '3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u'),
  ('4m5n6o7p-8q9r-0s1t-2u3v-4w5x6y7z8a9b', '1d2e3f4g-5h6i-7j8k-9l0m-1n2o3p4q5r6s');

-- CategoriesOnBooks
INSERT INTO "CategoriesOnBooks" ("bookId", "categoryId")
VALUES
  ('1j2k3l4m-5n6o-7p8q-9r0s-1t2u3v4w5x6y', '2h3i4j5k-6l7m-8n9o-0p1q-2r3s4t5u6v7w'),
  ('2k3l4m5n-6o7p-8q9r-0s1t-2u3v4w5x6y7z', '3i4j5k6l-7m8n-9o0p-1q2r-3s4t5u6v7w8x'),
  ('3l4m5n6o-7p8q-9r0s-1t2u-3v4w5x6y7z8a', '4j5k6l7m-8n9o-0p1q-2r3s-4t5u6v7w8x9y'),
  ('4m5n6o7p-8q9r-0s1t-2u3v-4w5x6y7z8a9b', '1g2h3i4j-5k6l-7m8n-9o0p-1q2r3s4t5u6v');

-- BorrowedBooks (some returned, some active, some overdue)
INSERT INTO "BorrowedBook" (id, "userId", "bookId", "borrowedAt", "dueDate", "returnedAt")
VALUES
  ('1m2n3o4p-5q6r-7s8t-9u0v-1w2x3y4z5a6b', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '1j2k3l4m-5n6o-7p8q-9r0s-1t2u3v4w5x6y', NOW() - INTERVAL '30 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days'),
  ('2n3o4p5q-6r7s-8t9u-0v1w-2x3y4z5a6b7c', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '2k3l4m5n-6o7p-8q9r-0s1t-2u3v4w5x6y7z', NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days', NULL),
  ('3o4p5q6r-7s8t-9u0v-1w2x-3y4z5a6b7c8d', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '3l4m5n6o-7p8q-9r0s-1t2u-3v4w5x6y7z8a', NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days', NULL);

-- Transactions (fines for overdue books)
INSERT INTO "Transaction" (id, "userId", "borrowedBookId", amount, status, "createdAt", "updatedAt")
VALUES
  ('1p2q3r4s-5t6u-7v8w-9x0y-1z2a3b4c5d6e', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '3o4p5q6r-7s8t-9u0v-1w2x-3y4z5a6b7c8d', 10.50, 'PENDING', NOW(), NOW()); 