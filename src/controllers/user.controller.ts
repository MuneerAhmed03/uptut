import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { updateProfileSchema, updateUserRoleSchema } from '../models/user.schema';

const userService = new UserService();

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const user = await userService.getProfile(userId);

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(userId, validatedData);

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await userService.deactivateAccount(userId);

    res.json({
      status: 'success',
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
}; 

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const validatedData = updateUserRoleSchema.parse(req.body);
    const updatedUser = await userService.updateUserRole(userId, validatedData.role, req.user!.id);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};