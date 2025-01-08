import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import {
  dateRangeSchema,
  analyticsQuerySchema,
} from "../models/analytics.schema";

const analyticsService = new AnalyticsService();

export const getMostBorrowedBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedQuery = analyticsQuerySchema.parse(req.query);
    const books = await analyticsService.getMostBorrowedBooks(
      validatedQuery.limit,
    );

    res.json({
      status: "success",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = dateRangeSchema.parse(req.query);
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    const report = await analyticsService.getMonthlyReport(startDate, endDate);

    res.json({
      status: "success",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await analyticsService.getOverdueStats();

    res.json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
