/**
 * ReportController : gestion des requêtes HTTP liées aux signalements.
 * Délègue la logique métier au ReportService ; ne fait que requête / réponse.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reportService } from "../services/reportService";
import {
  createReportSchema,
  updateReportSchema,
  reportIdParamSchema,
  listReportsQuerySchema,
} from "../dto/report.dto";
import { validate } from "../middlewares/validate";

// Réutilisation du middleware validate dans les routes ; ici on expose les handlers.

async function create(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const data = req.body;
  const report = await reportService.create(userId, data);
  res.status(201).json({ success: true, data: report });
}

async function findAll(req: Request, res: Response): Promise<void> {
  const filters = req.query as { type?: string; status?: string; userId?: string };
  const reports = await reportService.findAll(filters);
  res.json({ success: true, data: reports });
}

async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const report = await reportService.findById(id);
  res.json({ success: true, data: report });
}

async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "ADMIN";
  const data = req.body;
  const report = await reportService.update(id, userId, data, isAdmin);
  res.json({ success: true, data: report });
}

async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "ADMIN";
  const result = await reportService.delete(id, userId, isAdmin);
  res.json({ success: true, data: result });
}

// Export des handlers wrappés + schémas pour les routes
export const reportController = {
  create: asyncHandler(create),
  findAll: asyncHandler(findAll),
  findById: asyncHandler(findById),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
};

export const reportValidation = {
  create: validate(createReportSchema),
  update: validate(updateReportSchema),
  idParam: validate(reportIdParamSchema),
  listQuery: validate(listReportsQuerySchema),
};
