import {prisma} from '../config/db/database';
import { AppError } from '../middlewares/errorHandler.middleware';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        _count: {
          select: {
            borrowedBooks: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError(400, 'Current password is required to set new password');
      }

      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError(401, 'Current password is incorrect');
      }

      data.newPassword = await bcrypt.hash(data.newPassword, 10);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError(409, 'Email already in use');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.newPassword && { password: data.newPassword }),
        ...(data.email && { isEmailVerified: false }), 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }

  async deactivateAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        borrowedBooks: {
          where: {
            returnedAt: null,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.borrowedBooks.length > 0) {
      throw new AppError(400, 'Cannot deactivate account while having borrowed books');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });
  }

  async updateUserRole(userId: string, newRole: UserRole, adminId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new AppError(403, 'Only administrators can change user roles');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new AppError(404, 'User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }
} 