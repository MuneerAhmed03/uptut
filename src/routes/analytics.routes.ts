import { Router } from 'express';
import {
  getMostBorrowedBooks,
  getMonthlyReport,
  getOverdueStats,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();


router.use(authenticate, authorize('ADMIN'));

router.get('/most-borrowed', getMostBorrowedBooks);
router.get('/monthly-report', getMonthlyReport);
router.get('/overdue-stats', getOverdueStats);

export default router; 