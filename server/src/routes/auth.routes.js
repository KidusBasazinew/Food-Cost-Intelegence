import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../validations/auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/add-staff", authMiddleware, authController.addStaff);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh", validate(refreshSchema), authController.refresh);
authRouter.get("/me", authMiddleware, authController.me);
