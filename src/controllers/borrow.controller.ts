import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BorrowService } from '../services/borrow.service';
import { logger } from '../utils/logger';

const borrowSchema = z.object({
  bookId: z.string().uuid(),
});

const borrowService = new BorrowService();

export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = borrowSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await borrowService.borrowBook(userId, validatedData.bookId);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await borrowService.returnBook(userId, id);

    const response: any = {
      status: 'success',
      message: 'Book returned successfully',
      data: {
        borrowing: result.borrowing,
      },
    };

    if (result.fine) {
      response.data.fine = result.fine;
      response.message = `Book returned successfully. A fine of $${result.fine.amount} has been charged for late return.`;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBorrowingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as 'active' | 'returned' | undefined;

    const borrowings = await borrowService.getBorrowingHistory(userId, status);

    res.json({
      status: 'success',
      data: borrowings,
    });
  } catch (error) {
    next(error);
  }
};

export const sendDueReminders = async () => {
  try {
    const remindersSent = await borrowService.sendDueReminders();
    return remindersSent;
  } catch (error) {
    logger.error('Error sending due reminders:', error);
    throw error;
  }
}; 