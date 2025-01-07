import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { db } from './config/database';
import { apiRateLimiter } from './middlewares/rate-limit.middleware';
import redisClient from './config/redis';
import { requestLogger } from './middlewares/request-logger.middleware';

import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import userRoutes from './routes/user.routes';
import borrowRoutes from './routes/borrow.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(requestLogger);

app.use('/api', apiRateLimiter);

app.get('/', (req,res) =>{
    res.send('healthy')
})
    
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: JSON.parse((err as any).message)
    });
  }
  next(err);
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const startServer = async () => {
  try {
    await db.connect();
    await redisClient.connect();
    
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};


process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await redisClient.quit();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await redisClient.quit();
  await db.disconnect();
  process.exit(0);
});

startServer();
