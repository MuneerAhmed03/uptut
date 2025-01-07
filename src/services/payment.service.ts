import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';

export class PaymentService {
  async getFines(userId: string) {
    const fines = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        borrowedBook: {
          include: {
            book: true,
          },
        },
      },
    });

    const total = fines.reduce((sum, fine) => sum + fine.amount, 0);

    return { fines, total };
  }

  async payFine(userId: string, transactionId: string, paymentMethod: PaymentMethod) {
    return prisma.$transaction(async (tx) => {
      const fine = await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
          status: 'PENDING',
        },
      });

      if (!fine) {
        throw new AppError(404, 'Fine not found or already paid');
      }

      const updatedFine = await tx.transaction.update({
        where: { id: fine.id },
        data: {
          status: 'PAID',
          updatedAt: new Date(),
        },
      });

      return updatedFine;
    });
  }

  async getPaymentHistory(userId: string, status?: string) {
    const whereClause = {
      userId,
      ...(status && { status: status.toUpperCase() }),
    };

    const payments = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        borrowedBook: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return { payments, total };
  }

  async generateInvoice(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        borrowedBook: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return {
      invoiceNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
      date: transaction.createdAt,
      status: transaction.status,
      customer: {
        name: `${transaction.user.firstName} ${transaction.user.lastName}`,
        email: transaction.user.email,
      },
      book: {
        title: transaction.borrowedBook.book.title,
        isbn: transaction.borrowedBook.book.isbn,
      },
      borrowing: {
        borrowedAt: transaction.borrowedBook.borrowedAt,
        dueDate: transaction.borrowedBook.dueDate,
        returnedAt: transaction.borrowedBook.returnedAt,
      },
      amount: transaction.amount,
      currency: 'USD',
    };
  }
} 