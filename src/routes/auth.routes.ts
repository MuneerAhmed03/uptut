import { Router } from 'express';
import { register, login, verifyEmail } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/verify-email', authRateLimiter, verifyEmail);

export default router; 