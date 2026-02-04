/**
 * Contrôleur MEL : propriétés, signes, types de signes, signalements.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import {
  createMelPropertySchema,
  updateMelPropertySchema,
  melPropertyLocParamSchema,
  createSignTypeSchema,
  signTypeParamSchema,
  createMelSignSchema,
  updateMelSignSchema,
  melSignIdParamSchema,
  createMelReportSchema,
} from "../dto/mel.dto";
import { userService } from "../services/userService";
import { melPropertyService } from "../services/melPropertyService";
import { melSignService } from "../services/melSignService";
import { melSignTypeService } from "../services/melSignTypeService";
import { melReportService } from "../services/melReportService";
import { ForbiddenError } from "../utils/errors";

// ——— Propriétés (admin: CRUD ; user: lecture)
async function listProperties(_req: Request, res: Response): Promise<void> {
  const list = await melPropertyService.findAll();
  res.json({ success: true, data: list });
}

async function getProperty(req: Request, res: Response): Promise<void> {
  const lat = Number(req.params.lat);
  const lon = Number(req.params.lon);
  const prop = await melPropertyService.findByLocalisation(lat, lon);
  if (!prop) {
    res.status(404).json({ success: false, message: "Propriété MEL non trouvée" });
    return;
  }
  res.json({ success: true, data: prop });
}

async function createProperty(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const melId = await userService.getMelAccountId(userId);
  if (melId == null) {
    throw new ForbiddenError("Compte MEL non lié. Contactez l’administrateur.");
  }
  await userService.setMelMember(userId, true);
  const created = await melPropertyService.create(req.body, melId);
  res.status(201).json({ success: true, data: created });
}

async function updateProperty(req: Request, res: Response): Promise<void> {
  const lat = Number(req.params.lat);
  const lon = Number(req.params.lon);
  const updated = await melPropertyService.update(lat, lon, req.body);
  res.json({ success: true, data: updated });
}

async function deleteProperty(req: Request, res: Response): Promise<void> {
  const lat = Number(req.params.lat);
  const lon = Number(req.params.lon);
  const result = await melPropertyService.delete(lat, lon);
  res.json({ success: true, data: result });
}

// ——— Signes (admin: CRUD ; user: lecture)
async function listSigns(req: Request, res: Response): Promise<void> {
  const lat = req.query.lat != null ? Number(req.query.lat) : undefined;
  const lon = req.query.lon != null ? Number(req.query.lon) : undefined;
  const list =
    lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)
      ? await melSignService.findByProperty(lat, lon)
      : await melSignService.findAll();
  res.json({ success: true, data: list });
}

async function getSign(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const sign = await melSignService.findById(id);
  if (!sign) {
    res.status(404).json({ success: false, message: "Panneau MEL non trouvé" });
    return;
  }
  res.json({ success: true, data: sign });
}

async function createSign(req: Request, res: Response): Promise<void> {
  const created = await melSignService.create(req.body);
  res.status(201).json({ success: true, data: created });
}

async function updateSign(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const updated = await melSignService.update(id, req.body);
  res.json({ success: true, data: updated });
}

async function deleteSign(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const result = await melSignService.delete(id);
  res.json({ success: true, data: result });
}

// ——— Types de signes (admin: CRUD ; user: lecture)
async function listSignTypes(_req: Request, res: Response): Promise<void> {
  const list = await melSignTypeService.findAll();
  res.json({ success: true, data: list });
}

async function createSignType(req: Request, res: Response): Promise<void> {
  const created = await melSignTypeService.create(req.body);
  res.status(201).json({ success: true, data: created });
}

async function deleteSignType(req: Request, res: Response): Promise<void> {
  const signType = String(Array.isArray(req.params.signType) ? req.params.signType[0] : req.params.signType);
  await melSignTypeService.delete(signType);
  res.json({ success: true, data: { deleted: true, signType } });
}

// ——— Signalements (user: créer le sien ; admin: liste)
async function createReport(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const melId = await userService.getMelAccountId(userId);
  if (melId == null) {
    throw new ForbiddenError("Compte MEL non lié. Contactez l’administrateur.");
  }
  const created = await melReportService.create(req.body, melId);
  res.status(201).json({ success: true, data: created });
}

async function myReports(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const melId = await userService.getMelAccountId(userId);
  if (melId == null) {
    res.json({ success: true, data: [] });
    return;
  }
  const list = await melReportService.findByUser(melId);
  res.json({ success: true, data: list });
}

async function allReports(_req: Request, res: Response): Promise<void> {
  const list = await melReportService.findAll();
  res.json({ success: true, data: list });
}

export const melController = {
  listProperties: asyncHandler(listProperties),
  getProperty: asyncHandler(getProperty),
  createProperty: asyncHandler(createProperty),
  updateProperty: asyncHandler(updateProperty),
  deleteProperty: asyncHandler(deleteProperty),
  listSigns: asyncHandler(listSigns),
  getSign: asyncHandler(getSign),
  createSign: asyncHandler(createSign),
  updateSign: asyncHandler(updateSign),
  deleteSign: asyncHandler(deleteSign),
  listSignTypes: asyncHandler(listSignTypes),
  createSignType: asyncHandler(createSignType),
  deleteSignType: asyncHandler(deleteSignType),
  createReport: asyncHandler(createReport),
  myReports: asyncHandler(myReports),
  allReports: asyncHandler(allReports),
};

export const melValidation = {
  createProperty: validate(createMelPropertySchema),
  propertyLocParam: validate(melPropertyLocParamSchema),
  updatePropertyBody: validate(updateMelPropertySchema),
  createSignType: validate(createSignTypeSchema),
  signTypeParam: validate(signTypeParamSchema),
  createSign: validate(createMelSignSchema),
  signIdParam: validate(melSignIdParamSchema),
  updateSignBody: validate(updateMelSignSchema),
  createReport: validate(createMelReportSchema),
};
