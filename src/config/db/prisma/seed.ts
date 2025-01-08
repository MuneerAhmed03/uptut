import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const memberPassword = await bcrypt.hash("member123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@library.com" },
      update: {},
      create: {
        email: "admin@library.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isActive: true,
      },
    });

    const member = await prisma.user.upsert({
      where: { email: "member@library.com" },
      update: {},
      create: {
        email: "member@library.com",
        password: memberPassword,
        firstName: "Regular",
        lastName: "Member",
        role: UserRole.MEMBER,
        isEmailVerified: true,
        isActive: true,
      },
    });

    const johnDoe = await prisma.user.upsert({
      where: { email: "john.doe@example.com" },
      update: {},
      create: {
        email: "john.doe@example.com",
        password: memberPassword,
        firstName: "John",
        lastName: "Doe",
        role: UserRole.MEMBER,
        isEmailVerified: true,
        isActive: true,
      },
    });

    const georgeOrwell = await prisma.author.upsert({
      where: { id: "1d2e3f4g-5h6i-7j8k-9l0m-1n2o3p4q5r6s" },
      update: {},
      create: {
        name: "George Orwell",
        bio: "English novelist and essayist",
      },
    });

    const janeAusten = await prisma.author.upsert({
      where: { id: "2e3f4g5h-6i7j-8k9l-0m1n-2o3p4q5r6s7t" },
      update: {},
      create: {
        name: "Jane Austen",
        bio: "English novelist known for romantic fiction",
      },
    });

    const jkRowling = await prisma.author.upsert({
      where: { id: "3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u" },
      update: {},
      create: {
        name: "J.K. Rowling",
        bio: "British author best known for Harry Potter series",
      },
    });

    const fiction = await prisma.category.upsert({
      where: { name: "Fiction" },
      update: {},
      create: { name: "Fiction" },
    });

    const sciFi = await prisma.category.upsert({
      where: { name: "Science Fiction" },
      update: {},
      create: { name: "Science Fiction" },
    });

    const romance = await prisma.category.upsert({
      where: { name: "Romance" },
      update: {},
      create: { name: "Romance" },
    });

    const fantasy = await prisma.category.upsert({
      where: { name: "Fantasy" },
      update: {},
      create: { name: "Fantasy" },
    });

    const book1984 = await prisma.book.upsert({
      where: { isbn: "9780451524935" },
      update: {},
      create: {
        isbn: "9780451524935",
        title: "1984",
        description: "A dystopian novel by George Orwell",
        totalCopies: 5,
        availableCopies: 3,
        authors: {
          create: {
            author: {
              connect: { id: georgeOrwell.id },
            },
          },
        },
        categories: {
          create: {
            category: {
              connect: { id: sciFi.id },
            },
          },
        },
      },
    });

    const prideAndPrejudice = await prisma.book.upsert({
      where: { isbn: "9780141439518" },
      update: {},
      create: {
        isbn: "9780141439518",
        title: "Pride and Prejudice",
        description: "A romantic novel by Jane Austen",
        totalCopies: 3,
        availableCopies: 2,
        authors: {
          create: {
            author: {
              connect: { id: janeAusten.id },
            },
          },
        },
        categories: {
          create: {
            category: {
              connect: { id: romance.id },
            },
          },
        },
      },
    });

    const harryPotter = await prisma.book.upsert({
      where: { isbn: "9780439708180" },
      update: {},
      create: {
        isbn: "9780439708180",
        title: "Harry Potter and the Sorcerer's Stone",
        description: "First book in the Harry Potter series",
        totalCopies: 4,
        availableCopies: 2,
        authors: {
          create: {
            author: {
              connect: { id: jkRowling.id },
            },
          },
        },
        categories: {
          create: {
            category: {
              connect: { id: fantasy.id },
            },
          },
        },
      },
    });

    const returnedBorrow = await prisma.borrowedBook.create({
      data: {
        userId: member.id,
        bookId: book1984.id,
        borrowedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
        returnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    });

    const activeBorrow = await prisma.borrowedBook.create({
      data: {
        userId: johnDoe.id,
        bookId: prideAndPrejudice.id,
        borrowedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // due in 4 days
      },
    });

    const overdueBorrow = await prisma.borrowedBook.create({
      data: {
        userId: member.id,
        bookId: harryPotter.id,
        borrowedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days overdue
      },
    });

    await prisma.transaction.create({
      data: {
        userId: member.id,
        borrowedBookId: overdueBorrow.id,
        amount: 10.5,
        status: "PENDING",
      },
    });

    console.log("Database has been seeded. 🌱");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
