import { Router } from 'express';
import {
  getFines,
  payFine,
  getPaymentHistory,
  generateInvoice,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/fines', getFines);
router.post('/fines/:id/pay', payFine);
router.get('/history', getPaymentHistory);
router.get('/invoice/:transactionId', generateInvoice);

export default router; 