import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getProfile, updateProfile, deactivateAccount } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRole } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

type AuthHandler = RequestHandler & {
  (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response>;
};

const router = Router();
const userService = new UserService();

router.use(authenticate);

router.get('/profile', getProfile);

router.patch('/profile', updateProfile);

router.post('/deactivate', deactivateAccount);


router.patch(
  '/:userId/role',
  authorize('ADMIN'),
  (async (req: AuthenticatedRequest, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ 
          code: 400, 
          message: 'Invalid role specified' 
        });
      }

      const updatedUser = await userService.updateUserRole(
        userId, 
        role as UserRole, 
        req.user.id
      );
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }) as AuthHandler
);

export default router; 