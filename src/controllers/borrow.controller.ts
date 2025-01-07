import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BorrowService } from '../services/borrow.service';
import { logger } from '../utils/logger';

const borrowSchema = z.object({
  bookId: z.string().uuid(),
  dueDate: z.string().transform(str => new Date(str)),
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

    const result = await borrowService.borrowBook(
      userId,
      validatedData.bookId,
      validatedData.dueDate
    );

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
    const { id: bookId } = req.params;
    const userId = req.user!.id;

    const result = await borrowService.returnBook(userId, bookId);

    res.json({
      status: 'success',
      message: 'Book returned successfully',
      data: result,
    });
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
    const status = req.query.status as 'active' | 'returned' | 'overdue' | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await borrowService.getUserBorrows(userId, {
      status,
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      status: 'success',
      data: result,
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