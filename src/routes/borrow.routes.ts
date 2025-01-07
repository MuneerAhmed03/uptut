import { Router } from 'express';
import {
  borrowBook,
  returnBook,
  getBorrowingHistory,
} from '../controllers/borrow.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', borrowBook);
router.post('/:isbn/return', returnBook);
router.get('/history', getBorrowingHistory);

export default router; 