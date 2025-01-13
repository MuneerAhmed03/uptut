import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { ZodError } from "zod";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const errors = err.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return res.status(400).json({
      message: errors,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    let statusCode = Number(err.code);
    let message = err.message;
    return res.status(statusCode).json({ message });
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({
      message: "Invalid data provided",
    });
  }

  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error";
  return res.status(500).json({ message });
};
