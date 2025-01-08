import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { db } from './config/db/database';
import { apiRateLimiter } from './middlewares/rate-limit.middleware';
import redisClient from './config/redis';
import { requestLogger } from './middlewares/request-logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import userRoutes from './routes/user.routes';
import borrowRoutes from './routes/borrow.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';

const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use('/api', apiRateLimiter);

app.get('/', (req,res) => {
    res.send('healthy');
});


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

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
