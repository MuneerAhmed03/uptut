import prisma from '../config/database';

export class AnalyticsService {
  async getMostBorrowedBooks(limit: number = 10) {
    const books = await prisma.book.findMany({
      take: Number(limit),
      include: {
        _count: {
          select: {
            borrowedBooks: true,
          },
        },
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
          _count: 'desc',
        },
      },
    });

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      totalBorrows: book._count.borrowedBooks,
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
          status: 'PAID',
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

    const activeUsers = await prisma.user.findMany({
      take: 5,
      where: {
        borrowedBooks: {
          some: {
            borrowedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            borrowedBooks: true,
          },
        },
      },
      orderBy: {
        borrowedBooks: {
          _count: 'desc',
        },
      },
    });

    const popularCategories = await prisma.category.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            books: {
              where: {
                book: {
                  borrowedBooks: {
                    some: {
                      borrowedAt: {
                        gte: startDate,
                        lte: endDate,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        books: {
          _count: 'desc',
        },
      },
    });

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      statistics: {
        totalBorrowings: borrowings,
        totalReturns: returns,
        newUsers,
        finesCollected: totalFines._sum.amount || 0,
      },
      activeUsers: activeUsers.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        totalBorrowings: user._count.borrowedBooks,
      })),
      popularCategories: popularCategories.map((category) => ({
        id: category.id,
        name: category.name,
        totalBorrowings: category._count.books,
      })),
    };
  }

  async getOverdueStats() {
    const now = new Date();

    const overdueBooks = await prisma.borrowedBook.findMany({
      where: {
        returnedAt: null,
        dueDate: {
          lt: now,
        },
      },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      totalOverdue: overdueBooks.length,
      totalFinesPending: overdueBooks.reduce((sum, book) => {
        const daysOverdue = Math.ceil(
          (now.getTime() - new Date(book.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + daysOverdue;
      }, 0),
      books: overdueBooks.map((book) => ({
        id: book.id,
        bookTitle: book.book.title,
        isbn: book.book.isbn,
        borrower: {
          id: book.user.id,
          name: `${book.user.firstName} ${book.user.lastName}`,
          email: book.user.email,
        },
        dueDate: book.dueDate,
        daysOverdue: Math.ceil(
          (now.getTime() - new Date(book.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    };
  }
} 