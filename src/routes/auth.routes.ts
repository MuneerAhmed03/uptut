import { Router } from 'express';
import { register, login, verifyEmail } from '../controllers/auth.controller';
import { rateLimiter } from '../middlewares/auth.middleware';

const router = Router();

router.use(rateLimiter);


router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

export default router; 