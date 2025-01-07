import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';
import { loginSchema, registerSchema, emailVerificationSchema, passwordResetRequestSchema, passwordResetSchema } from '../models/auth.schema';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData.body);
      res.json(result);
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await this.authService.register(validatedData.body);
      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = emailVerificationSchema.parse(req.query);
      const token = validatedData.token;
      if (!token || typeof token !== 'string') {
        throw new Error('Verification token is required');
      }
      await this.authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error: any) {
      logger.error('Email verification error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = passwordResetRequestSchema.parse(req.body);
      const email = validatedData.email;
      if (!email) {
        throw new Error('Email is required');
      }
      await this.authService.resendVerificationEmail(email);
      res.json({ message: 'Verification email sent successfully' });
    } catch (error: any) {
      logger.error('Resend verification email error:', error);
      res.status(400).json({ error: error.message });
    }
  };
} 