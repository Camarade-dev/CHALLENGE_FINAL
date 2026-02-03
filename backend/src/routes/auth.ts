import { Router } from "express";
import { authController, authValidation } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register", authValidation.register, authController.register);
router.post("/login", authValidation.login, authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
