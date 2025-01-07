import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { logger } from '../utils/logger';

const DEFAULT_EXPIRATION = 3600; // 1 hour

export const cacheMiddleware = (duration: number = DEFAULT_EXPIRATION) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);
      res.json = ((data: any) => {
        redisClient.setEx(key, duration, JSON.stringify(data))
          .catch(err => logger.error('Redis cache error:', err));
        return originalJson(data);
      }) as any;

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}; 