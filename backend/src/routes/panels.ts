/**
 * Routes API pour les panneaux de la ville.
 */

import { Router } from "express";
import { panelController, panelValidation } from "../controllers/panelController";

const router = Router();

router.get("/", panelController.findAll);
router.get("/:id", panelValidation.idParam, panelController.findById);
router.post("/", panelValidation.create, panelController.create);
router.patch("/:id", panelValidation.idParam, panelValidation.update, panelController.update);
router.post("/:id/check", panelValidation.check, panelController.check);
router.delete("/:id", panelValidation.idParam, panelController.remove);

export default router;
