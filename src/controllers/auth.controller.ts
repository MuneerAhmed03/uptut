import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import {
  loginSchema,
  registerSchema,
  emailVerificationSchema,
  passwordResetRequestSchema,
} from "../models/auth.schema";
import { AppError } from "../middlewares/errorHandler.middleware";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = loginSchema.parse({ body: req.body });
      const result = await this.authService.login(validatedData.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = registerSchema.parse({
        body: req.body,
      });
      const user = await this.authService.register(validatedData.body);
      res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = emailVerificationSchema.parse(req.query);
      const token = validatedData.token;
      if (!token || typeof token !== "string") {
        throw new AppError(400, "Verification token is required");
      }
      await this.authService.verifyEmail(token);
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = passwordResetRequestSchema.parse(req.body);
      const email = validatedData.email;
      if (!email) {
        throw new AppError(400, "Email is required");
      }
      await this.authService.resendVerificationEmail(email);
      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      next(error);
    }
  };
}
