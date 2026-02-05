/**
 * Routes API pour les récompenses et points.
 */

import { Router } from "express";
import { rewardController, rewardValidation } from "../controllers/rewardController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Catalogue : public (ou auth pour cohérence)
router.get("/catalog", rewardController.getCatalog);

// Points et récompenses : utilisateur connecté
router.get("/me/points", authMiddleware, rewardController.getMyPoints);
router.get("/me/claims", authMiddleware, rewardController.getMyClaims);
router.post("/claim", authMiddleware, rewardValidation.claim, rewardController.claimReward);

export default router;
