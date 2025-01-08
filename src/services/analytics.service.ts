import { prisma } from "../config/db/database";
import type { Book, User, Category } from ".prisma/client";

interface BookAnalytics {
  id: string;
  title: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authors: string[];
  categories: string[];
}

interface UserAnalytics {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  borrowCount: number;
}

interface CategoryAnalytics {
  name: string;
  bookCount: number;
  borrowCount: number;
}

export class AnalyticsService {
  async getBookAnalytics(): Promise<BookAnalytics[]> {
    const books = await prisma.book.findMany({
      include: {
        borrowedBooks: true,
        authors: {
          include: {
            author: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return books.map(
      (
        book: Book & {
          borrowedBooks: any[];
          authors: { author: { name: string } }[];
          categories: { category: { name: string } }[];
        },
      ) => ({
        id: book.id,
        title: book.title,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        borrowCount: book.borrowedBooks.length,
        authors: book.authors.map((a) => a.author.name),
        categories: book.categories.map((c) => c.category.name),
      }),
    );
  }

  async getDashboardStats() {
    const [
      totalBooks,
      totalUsers,
      activeUsers,
      totalBorrows,
      popularCategories,
      overdueBooks,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.user.findMany({
        where: {
          borrowedBooks: {
            some: {},
          },
        },
        include: {
          borrowedBooks: true,
        },
      }),
      prisma.borrowedBook.count(),
      prisma.category.findMany({
        include: {
          books: {
            include: {
              book: {
                include: {
                  borrowedBooks: true,
                },
              },
            },
          },
        },
      }),
      prisma.borrowedBook.findMany({
        where: {
          returnedAt: null,
          dueDate: {
            lt: new Date(),
          },
        },
        include: {
          book: true,
          user: true,
        },
      }),
    ]);

    return {
      totalBooks,
      totalUsers,
      totalBorrows,
      activeUsers: activeUsers.map((user: User & { borrowedBooks: any[] }) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        borrowCount: user.borrowedBooks.length,
      })),
      popularCategories: popularCategories.map(
        (
          category: Category & {
            books: {
              book: {
                borrowedBooks: any[];
              };
            }[];
          },
        ) => ({
          name: category.name,
          bookCount: category.books.length,
          borrowCount: category.books.reduce(
            (sum, { book }) => sum + book.borrowedBooks.length,
            0,
          ),
        }),
      ),
      overdue: {
        count: overdueBooks.length,
        totalFinesPending: overdueBooks.reduce((sum: number, book: any) => {
          const daysOverdue = Math.floor(
            (new Date().getTime() - new Date(book.dueDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return sum + daysOverdue * 1;
        }, 0),
        books: overdueBooks.map((book: any) => ({
          id: book.id,
          bookTitle: book.book.title,
          userName: `${book.user.firstName} ${book.user.lastName}`,
          dueDate: book.dueDate,
          daysOverdue: Math.floor(
            (new Date().getTime() - new Date(book.dueDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        })),
      },
    };
  }

  async getMostBorrowedBooks(limit: number = 10) {
    const books = await prisma.book.findMany({
      take: limit,
      include: {
        borrowedBooks: true,
        authors: {
          include: {
            author: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        borrowedBooks: {
          _count: "desc",
        },
      },
    });

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      borrowCount: book.borrowedBooks.length,
      authors: book.authors.map((a) => a.author.name),
      categories: book.categories.map((c) => c.category.name),
    }));
  }

  async getMonthlyReport(startDate: Date, endDate: Date) {
    const [borrowings, returns, newUsers, totalFines] = await Promise.all([
      prisma.borrowedBook.count({
        where: {
          borrowedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.borrowedBook.count({
        where: {
          returnedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          status: "PAID",
          updatedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      statistics: {
        totalBorrowings: borrowings,
        totalReturns: returns,
        newUsers,
        finesCollected: totalFines._sum.amount || 0,
      },
    };
  }

  async getOverdueStats() {
    const overdueBooks = await prisma.borrowedBook.findMany({
      where: {
        returnedAt: null,
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        book: true,
        user: true,
      },
    });

    return {
      totalOverdue: overdueBooks.length,
      totalFinesPending: overdueBooks.reduce((sum, book) => {
        const daysOverdue = Math.ceil(
          (new Date().getTime() - new Date(book.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return sum + daysOverdue;
      }, 0),
      books: overdueBooks.map((book) => ({
        id: book.id,
        bookTitle: book.book.title,
        borrower: {
          id: book.user.id,
          name: `${book.user.firstName} ${book.user.lastName}`,
          email: book.user.email,
        },
        dueDate: book.dueDate,
        daysOverdue: Math.ceil(
          (new Date().getTime() - new Date(book.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    };
  }
}
