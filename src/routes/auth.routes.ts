import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../models/auth.schema";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  authController.register,
);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);

export default router;
