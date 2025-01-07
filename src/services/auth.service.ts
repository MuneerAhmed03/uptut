import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '.prisma/client';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class AuthService {
  async login({ email, password }: LoginCredentials): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User account is deactivated');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async register(data: RegisterData): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyEmail(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
} 