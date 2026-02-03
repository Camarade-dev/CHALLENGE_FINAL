/**
 * Routes API pour les panneaux de la ville.
 * GET : public. POST/PATCH/DELETE : admin. POST :id/check : utilisateur (crée PENDING).
 * GET checks/pending : admin. GET checks/my-pending : user. PATCH checks/:id/validate : admin.
 */

import { Router } from "express";
import { panelController, panelValidation } from "../controllers/panelController";
import { authMiddleware } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", panelController.findAll);

router.get("/checks/pending", authMiddleware, requireAdmin, panelController.listPendingChecks);
router.get("/checks/my-pending", authMiddleware, panelController.listMyPendingPanelIds);
router.patch("/checks/:id/validate", authMiddleware, requireAdmin, panelValidation.checkIdParam, panelController.validateCheck);

router.get("/:id", panelValidation.idParam, panelController.findById);

router.post("/", authMiddleware, requireAdmin, panelValidation.create, panelController.create);
router.patch("/:id", authMiddleware, requireAdmin, panelValidation.idParam, panelValidation.update, panelController.update);
router.delete("/:id", authMiddleware, requireAdmin, panelValidation.idParam, panelController.remove);

router.post("/:id/check", authMiddleware, panelValidation.check, panelController.check);

export default router;
