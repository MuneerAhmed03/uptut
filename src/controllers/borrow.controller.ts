import { Request, Response, NextFunction } from "express";
import { BorrowService } from "../services/borrow.service";
import { borrowBookSchema, borrowQuerySchema } from "../models/borrow.schema";
import { logger } from "../utils/logger";

const borrowService = new BorrowService();

export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = borrowBookSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await borrowService.borrowBook(userId, validatedData.bookId);

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user!.id;

    const result = await borrowService.returnBook(userId, bookId);

    res.json({
      status: "success",
      message: "Book returned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBorrowingHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const validatedQuery = borrowQuerySchema.parse(req.query);

    const result = await borrowService.getUserBorrows(userId, {
      status: validatedQuery.status,
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    });

    res.json({
      status: "success",
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
    logger.error("Error sending due reminders:", error);
    throw error;
  }
};
