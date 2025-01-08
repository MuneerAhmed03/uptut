import { Router } from 'express';
import {
  getMostBorrowedBooks,
  getMonthlyReport,
  getOverdueStats,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/most-borrowed', cacheMiddleware(3600), getMostBorrowedBooks); 
router.get('/monthly-report', cacheMiddleware(21600), getMonthlyReport);
router.get('/overdue-stats', cacheMiddleware(3600*12), getOverdueStats);

export default router; 