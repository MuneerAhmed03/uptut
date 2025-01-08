import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getProfile,
  updateProfile,
  deactivateAccount,
  updateUserRole,
} from "../controllers/user.controller";
import { cacheMiddleware } from "../middlewares/cache.middleware";

const router = Router();

router.use(authenticate);

router.get("/profile", cacheMiddleware(900), getProfile);

router.put("/profile", updateProfile);

router.post("/deactivate", deactivateAccount);

router.put("/:userId/role", authorize("ADMIN"), updateUserRole);

export default router;
