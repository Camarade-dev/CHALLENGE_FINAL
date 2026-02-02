/**
 * Routes API pour les signalements (CRUD).
 */

import { Router } from "express";
import { reportController, reportValidation } from "../controllers/reportController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Liste et détail publics (sans auth) pour affichage carte
router.get("/", reportValidation.listQuery, reportController.findAll);
router.get("/:id", reportValidation.idParam, reportController.findById);

// Création, modification, suppression : authentification requise
router.post(
  "/",
  authMiddleware,
  reportValidation.create,
  reportController.create
);
router.patch(
  "/:id",
  authMiddleware,
  reportValidation.idParam,
  reportValidation.update,
  reportController.update
);
router.delete(
  "/:id",
  authMiddleware,
  reportValidation.idParam,
  reportController.remove
);

export default router;
