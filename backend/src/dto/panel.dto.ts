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

export const checkPanelSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID du panneau requis"),
  }),
});

export type CreatePanelDto = z.infer<typeof createPanelSchema>["body"];
export type UpdatePanelDto = z.infer<typeof updatePanelSchema>["body"];
