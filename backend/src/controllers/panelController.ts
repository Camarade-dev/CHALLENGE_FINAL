/**
 * PanelController : requêtes HTTP pour les panneaux.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { panelService } from "../services/panelService";
import {
  createPanelSchema,
  updatePanelSchema,
  panelIdParamSchema,
  checkPanelSchema,
  checkIdParamSchema,
} from "../dto/panel.dto";
import { validate } from "../middlewares/validate";

async function findAll(_req: Request, res: Response): Promise<void> {
  const panels = await panelService.findAll();
  res.json({ success: true, data: panels });
}

async function findById(req: Request, res: Response): Promise<void> {
  const panel = await panelService.findById(req.params.id);
  res.json({ success: true, data: panel });
}

async function create(req: Request, res: Response): Promise<void> {
  const panel = await panelService.create(req.body);
  res.status(201).json({ success: true, data: panel });
}

async function update(req: Request, res: Response): Promise<void> {
  const panel = await panelService.update(req.params.id, req.body);
  res.json({ success: true, data: panel });
}

async function check(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const panel = await panelService.check(req.params.id, userId, req.body);
  res.json({ success: true, data: panel });
}

async function remove(req: Request, res: Response): Promise<void> {
  const result = await panelService.delete(req.params.id);
  res.json({ success: true, data: result });
}

async function listPendingChecks(_req: Request, res: Response): Promise<void> {
  const checks = await panelService.findPendingChecks();
  res.json({ success: true, data: checks });
}

async function listMyPendingPanelIds(req: Request, res: Response): Promise<void> {
  const ids = await panelService.findMyPendingCheckPanelIds(req.user!.userId);
  res.json({ success: true, data: ids });
}

async function validateCheck(req: Request, res: Response): Promise<void> {
  const panel = await panelService.validateCheck(req.params.id);
  res.json({ success: true, data: panel });
}

export const panelController = {
  findAll: asyncHandler(findAll),
  findById: asyncHandler(findById),
  create: asyncHandler(create),
  update: asyncHandler(update),
  check: asyncHandler(check),
  remove: asyncHandler(remove),
  listPendingChecks: asyncHandler(listPendingChecks),
  listMyPendingPanelIds: asyncHandler(listMyPendingPanelIds),
  validateCheck: asyncHandler(validateCheck),
};

export const panelValidation = {
  create: validate(createPanelSchema),
  update: validate(updatePanelSchema),
  idParam: validate(panelIdParamSchema),
  check: validate(checkPanelSchema),
  checkIdParam: validate(checkIdParamSchema),
};
