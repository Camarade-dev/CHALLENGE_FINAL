/**
 * DTOs et schémas de validation (Zod) pour les panneaux.
 */

import { z } from "zod";

export const createPanelSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Le nom est requis").max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const updatePanelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

export const panelIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID du panneau requis"),
  }),
});

const checkStateEnum = z.enum(["OK", "DAMAGED", "MISSING", "OTHER"]);

export const checkPanelSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID du panneau requis"),
  }),
  body: z.object({
    state: checkStateEnum,
    comment: z.string().max(2000).optional(),
    photoUrl: z.string().url().optional().nullable(),
  }),
});

export const checkIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID du contrôle requis"),
  }),
});

export type CreatePanelDto = z.infer<typeof createPanelSchema>["body"];
export type UpdatePanelDto = z.infer<typeof updatePanelSchema>["body"];
export type CheckPanelDto = z.infer<typeof checkPanelSchema>["body"];
