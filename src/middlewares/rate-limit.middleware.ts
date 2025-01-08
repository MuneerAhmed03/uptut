import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";
import { logger } from "../utils/logger";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests within the window
  message?: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${req.ip}`;

    try {
      const requests = await redisClient.get(key);
      const currentCount = requests ? parseInt(requests) : 0;

      if (currentCount >= config.max) {
        return res.status(429).json({
          status: "error",
          message:
            config.message || "Too many requests, please try again later.",
        });
      }

      if (currentCount === 0) {
        await redisClient.setEx(key, Math.floor(config.windowMs / 1000), "1");
      } else {
        await redisClient.incr(key);
      }

      res.setHeader("X-RateLimit-Limit", config.max);
      res.setHeader("X-RateLimit-Remaining", config.max - (currentCount + 1));

      next();
    } catch (error) {
      logger.error("Rate limiter error:", error);
      next();
    }
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message:
    "Too many authentication attempts. Please try again after 15 minutes.",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many requests. Please try again after a minute.",
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: "Search rate limit exceeded. Please try again after a minute.",
});
