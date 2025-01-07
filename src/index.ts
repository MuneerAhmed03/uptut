import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import redisClient from './config/redis';
import { SchedulerService } from './services/scheduler.service';


import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import userRoutes from './routes/user.routes';
import borrowRoutes from './routes/borrow.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

redisClient.connect().catch((err) => {
  logger.error('Redis connection error:', err);
});

const scheduler = new SchedulerService();
scheduler.startJobs();

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});


process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');

  scheduler.stopJobs();

  await redisClient.quit();

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
