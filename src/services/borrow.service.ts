import { prisma } from "../config/db/database";
import type { BorrowedBook, Prisma } from ".prisma/client";
import { sendBookDueReminderEmail } from "../utils/email";

export class BorrowService {
  private BORROW_DURATION_DAYS = 14;
  private FINE_RATE_PER_DAY = 1.0;

  async borrowBook(userId: string, bookId: string): Promise<BorrowedBook> {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        borrowedBooks: {
          where: {
            userId,
            returnedAt: null,
          },
        },
      },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    if (book.availableCopies <= 0) {
      throw new Error("No copies available for borrowing");
    }

    if (book.borrowedBooks.length > 0) {
      throw new Error("User already has an active borrow for this book");
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + this.BORROW_DURATION_DAYS);

    return prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });

      return tx.borrowedBook.create({
        data: {
          userId,
          bookId,
          dueDate,
        },
        include: {
          book: true,
          user: true,
        },
      });
    });
  }

  calculateFine(borrowedBook: BorrowedBook): number {
    if (!borrowedBook.dueDate || borrowedBook.returnedAt) {
      return 0;
    }

    const currentDate = new Date();
    const dueDate = new Date(borrowedBook.dueDate);

    if (currentDate <= dueDate) {
      return 0;
    }

    const overdueDays = Math.floor(
      (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return overdueDays * this.FINE_RATE_PER_DAY;
  }

  async returnBook(userId: string, bookId: string): Promise<BorrowedBook> {
    const borrowedBook = await prisma.borrowedBook.findFirst({
      where: {
        userId,
        bookId,
        returnedAt: null,
      },
    });

    if (!borrowedBook) {
      throw new Error("No active borrow found for this book");
    }

    const fine = this.calculateFine(borrowedBook);

    return prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      });

      const updatedBorrow = await tx.borrowedBook.update({
        where: { id: borrowedBook.id },
        data: {
          returnedAt: new Date(),
        },
        include: {
          book: true,
          user: true,
        },
      });

      if (fine > 0) {
        await tx.transaction.create({
          data: {
            userId,
            borrowedBookId: borrowedBook.id,
            amount: fine,
            status: "PENDING",
          },
        });
      }

      return updatedBorrow;
    });
  }

  async getUserBorrows(
    userId: string,
    params: {
      status?: "active" | "returned" | "overdue";
      skip?: number;
      take?: number;
    },
  ): Promise<{ borrows: BorrowedBook[]; total: number }> {
    const where: Prisma.BorrowedBookWhereInput = {
      userId,
      ...(params.status === "active" && {
        returnedAt: null,
        dueDate: {
          gt: new Date(),
        },
      }),
      ...(params.status === "returned" && {
        returnedAt: {
          not: null,
        },
      }),
      ...(params.status === "overdue" && {
        returnedAt: null,
        dueDate: {
          lt: new Date(),
        },
      }),
    };

    const [borrows, total] = await Promise.all([
      prisma.borrowedBook.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          book: true,
          user: true,
        },
        orderBy: {
          borrowedAt: "desc",
        },
      }),
      prisma.borrowedBook.count({ where }),
    ]);

    return { borrows, total };
  }

  async getBookBorrows(
    bookId: string,
    params: {
      status?: "active" | "returned" | "overdue";
      skip?: number;
      take?: number;
    },
  ): Promise<{ borrows: BorrowedBook[]; total: number }> {
    const where: Prisma.BorrowedBookWhereInput = {
      bookId,
      ...(params.status === "active" && {
        returnedAt: null,
        dueDate: {
          gt: new Date(),
        },
      }),
      ...(params.status === "returned" && {
        returnedAt: {
          not: null,
        },
      }),
      ...(params.status === "overdue" && {
        returnedAt: null,
        dueDate: {
          lt: new Date(),
        },
      }),
    };

    const [borrows, total] = await Promise.all([
      prisma.borrowedBook.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          book: true,
          user: true,
        },
        orderBy: {
          borrowedAt: "desc",
        },
      }),
      prisma.borrowedBook.count({ where }),
    ]);

    return { borrows, total };
  }

  async sendDueReminders(): Promise<number> {
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

    await Promise.all(
      dueBorrowings.map(async (borrowing) => {
        await sendBookDueReminderEmail(
          borrowing.user.email,
          borrowing.book.title,
          borrowing.dueDate,
        );
      }),
    );

    return dueBorrowings.length;
  }
}
