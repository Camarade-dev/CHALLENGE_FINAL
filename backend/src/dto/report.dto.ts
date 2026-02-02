/**
 * DTOs et schémas de validation (Zod) pour les signalements.
 */

import { z } from "zod";

const reportTypeEnum = z.enum(["INCIDENT", "POLLUTION", "INFRASTRUCTURE", "OTHER"]);
const reportStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]);

export const createReportSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Le titre est requis").max(200),
    description: z.string().min(1, "La description est requise").max(2000),
    type: reportTypeEnum,
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z.string().url().optional().nullable(),
  }),
});

export const updateReportSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    type: reportTypeEnum.optional(),
    photoUrl: z.string().url().optional().nullable(),
    status: reportStatusEnum.optional(),
  }),
});

export const reportIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID du signalement requis"),
  }),
});

export const listReportsQuerySchema = z.object({
  query: z.object({
    type: reportTypeEnum.optional(),
    status: reportStatusEnum.optional(),
    userId: z.string().optional(),
  }),
});

export type CreateReportDto = z.infer<typeof createReportSchema>["body"];
export type UpdateReportDto = z.infer<typeof updateReportSchema>["body"];
export type ReportFilters = z.infer<typeof listReportsQuerySchema>["query"];
