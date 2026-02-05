/**
 * Agrégation des routes API.
 */

import { Router } from "express";
import reportsRouter from "./reports";
import panelsRouter from "./panels";
import authRouter from "./auth";
import melRouter from "./mel";
import rewardsRouter from "./rewards";

const router = Router();

router.use("/auth", authRouter);
router.use("/reports", reportsRouter);
router.use("/panels", panelsRouter);
router.use("/mel", melRouter);
router.use("/rewards", rewardsRouter);

// Santé de l'API
router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API signalement citoyen" });
});

export default router;
