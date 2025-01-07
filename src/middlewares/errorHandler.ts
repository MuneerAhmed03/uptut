import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'error',
          message: 'A unique constraint would be violated.',
        });
      case 'P2025':
        return res.status(404).json({
          status: 'error',
          message: 'Record not found.',
        });
      default:
        logger.error('Prisma Error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Database error occurred.',
        });
    }
  }

  logger.error('Unexpected Error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}; 