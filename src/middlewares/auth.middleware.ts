import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Not authorized to access this resource');
    }

    next();
  };
};

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const MAX_REQUESTS = 100;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  const ip = req.ip;
  const now = Date.now();
  const key = `rateLimit:${ip}`;

  try {

    const requests = global.rateLimitMap?.get(key) || { count: 0, resetTime: now + WINDOW_MS };

    if (!global.rateLimitMap) {
      global.rateLimitMap = new Map();
    }

    if (now > requests.resetTime) {
      requests.count = 1;
      requests.resetTime = now + WINDOW_MS;
    } else if (requests.count >= MAX_REQUESTS) {
      throw new AppError(429, 'Too many requests. Please try again later.');
    } else {
      requests.count++;
    }

    global.rateLimitMap.set(key, requests);

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - requests.count);
    res.setHeader('X-RateLimit-Reset', requests.resetTime);

    next();
  } catch (error) {
    next(error);
  }
}; 