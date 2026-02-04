/**
 * Routes API MEL : propriétés, signes, types de signes, signalements.
 * Lecture : utilisateur connecté. Écriture admin : propriétés, signes, types. Signalements : tout utilisateur.
 */

import { Router } from "express";
import { melController, melValidation } from "../controllers/melController";
import { authMiddleware, requireAdmin } from "../middlewares/auth";

const router = Router();

router.use(authMiddleware);

// ——— Propriétés MEL
router.get("/properties", melController.listProperties);
router.get("/properties/:lat/:lon", melValidation.propertyLocParam, melController.getProperty);
router.post("/properties", requireAdmin, melValidation.createProperty, melController.createProperty);
router.patch("/properties/:lat/:lon", requireAdmin, melValidation.propertyLocParam, melValidation.updatePropertyBody, melController.updateProperty);
router.delete("/properties/:lat/:lon", requireAdmin, melValidation.propertyLocParam, melController.deleteProperty);

// ——— Signes
router.get("/signs", melController.listSigns);
router.get("/signs/:id", melValidation.signIdParam, melController.getSign);
router.post("/signs", requireAdmin, melValidation.createSign, melController.createSign);
router.patch("/signs/:id", requireAdmin, melValidation.signIdParam, melValidation.updateSignBody, melController.updateSign);
router.delete("/signs/:id", requireAdmin, melValidation.signIdParam, melController.deleteSign);

// ——— Types de signes
router.get("/sign-types", melController.listSignTypes);
router.post("/sign-types", requireAdmin, melValidation.createSignType, melController.createSignType);
router.delete("/sign-types/:signType", requireAdmin, melValidation.signTypeParam, melController.deleteSignType);

// ——— Signalements (utilisateur : créer + mes signalements ; admin : tous)
router.post("/reports", melValidation.createReport, melController.createReport);
router.get("/reports/my", melController.myReports);
router.get("/reports", requireAdmin, melController.allReports);

export default router;
