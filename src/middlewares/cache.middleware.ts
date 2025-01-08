import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";
import { logger } from "../utils/logger";

export const cacheMiddleware = (ttl: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const data = await redisClient.get(key);
      if (data) {
        return res.json(JSON.parse(data));
      }

      const originalJson = res.json.bind(res);

      res.json = ((data: any) => {
        redisClient
          .setEx(key, ttl, JSON.stringify(data))
          .catch((err) => logger.error("Redis cache error:", err));
        return originalJson(data);
      }) as any;

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      next();
    }
  };
};
