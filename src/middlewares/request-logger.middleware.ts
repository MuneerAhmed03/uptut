import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  logger.info('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
  });

  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - startTime;

    logger.info('Outgoing Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });

    return originalSend.call(this, body);
  };

  next();
}; 