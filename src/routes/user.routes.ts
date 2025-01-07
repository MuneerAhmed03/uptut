import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getProfile, updateProfile, deactivateAccount } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);

router.patch('/profile', updateProfile);

router.post('/deactivate', deactivateAccount);

export default router; 