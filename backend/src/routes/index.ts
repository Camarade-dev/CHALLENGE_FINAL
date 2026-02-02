/**
 * Agrégation des routes API.
 */

import { Router } from "express";
import reportsRouter from "./reports";
import panelsRouter from "./panels";

const router = Router();

router.use("/reports", reportsRouter);
router.use("/panels", panelsRouter);

// Santé de l'API
router.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API signalement citoyen" });
});

export default router;
