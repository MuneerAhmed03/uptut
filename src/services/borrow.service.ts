import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { sendBookDueReminderEmail } from '../utils/email';

const MAX_BORROWED_BOOKS = 3;
const BORROW_DURATION_DAYS = 14;
const FINE_PER_DAY = 1; 

export class BorrowService {
  async borrowBook(userId: string, bookId: string) {
    const activeBorrowings = await prisma.borrowedBook.count({
      where: {
        userId,
        returnedAt: null,
      },
    });

    if (activeBorrowings >= MAX_BORROWED_BOOKS) {
      throw new AppError(400, `You cannot borrow more than ${MAX_BORROWED_BOOKS} books at a time`);
    }

    const unpaidFines = await prisma.transaction.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (unpaidFines) {
      throw new AppError(400, 'You have unpaid fines. Please clear them before borrowing new books');
    }

    return prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new AppError(404, 'Book not found');
      }

      if (book.availableCopies <= 0) {
        throw new AppError(400, 'No copies available for borrowing');
      }

      const existingBorrowing = await tx.borrowedBook.findFirst({
        where: {
          userId,
          bookId: book.id,
          returnedAt: null,
        },
      });

      if (existingBorrowing) {
        throw new AppError(400, 'You already have this book borrowed');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS);

      const borrowing = await tx.borrowedBook.create({
        data: {
          userId,
          bookId: book.id,
          dueDate,
        },
      });

      await tx.book.update({
        where: { id: book.id },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });

      return borrowing;
    });
  }

  async returnBook(userId: string, borrowId: string) {
    return prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowedBook.findFirst({
        where: {
          id: borrowId,
          userId,
          returnedAt: null,
        },
        include: {
          book: true,
        },
      });

      if (!borrowing) {
        throw new AppError(404, 'Borrowing record not found');
      }

      const now = new Date();
      const dueDate = new Date(borrowing.dueDate);

      let fine = null;
      if (now > dueDate) {
        const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const fineAmount = daysLate * FINE_PER_DAY;

        fine = await tx.transaction.create({
          data: {
            userId,
            borrowedBookId: borrowing.id,
            amount: fineAmount,
          },
        });
      }

      const updatedBorrowing = await tx.borrowedBook.update({
        where: { id: borrowing.id },
        data: {
          returnedAt: now,
        },
      });

      await tx.book.update({
        where: { id: borrowing.bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      });

      return { borrowing: updatedBorrowing, fine };
    });
  }

  async getBorrowingHistory(userId: string, status?: 'active' | 'returned') {
    const whereClause = {
      userId,
      ...(status === 'active' && { returnedAt: null }),
      ...(status === 'returned' && { returnedAt: { not: null } }),
    };

    return prisma.borrowedBook.findMany({
      where: whereClause,
      include: {
        book: {
          include: {
            authors: {
              include: {
                author: true,
              },
            },
          },
        },
        fine: true,
      },
      orderBy: {
        borrowedAt: 'desc',
      },
    });
  }

  async sendDueReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const dueBorrowings = await prisma.borrowedBook.findMany({
      where: {
        returnedAt: null,
        dueDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        user: true,
        book: true,
      },
    });

    for (const borrowing of dueBorrowings) {
      await sendBookDueReminderEmail(
        borrowing.user.email,
        borrowing.book.title,
        borrowing.dueDate
      );
    }

    return dueBorrowings.length;
  }
} 