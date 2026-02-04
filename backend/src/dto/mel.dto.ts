/**
 * DTOs et schémas de validation (Zod) pour les entités MEL.
 */

import { z } from "zod";

const localisationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

// ——— MELProperty ———
export const createMelPropertySchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    naturalSpace: z.boolean(),
    pointsValue: z.number().int().min(0),
    numberOfSigns: z.number().int().min(0),
  }),
});

export const updateMelPropertySchema = z.object({
  body: z.object({
    naturalSpace: z.boolean().optional(),
    pointsValue: z.number().int().min(0).optional(),
    numberOfSigns: z.number().int().min(0).optional(),
  }),
});

export const melPropertyLocParamSchema = z.object({
  params: z.object({
    lat: z.string(),
    lon: z.string(),
  }),
}).refine(
  (data) => {
    const lat = Number(data.params.lat);
    const lon = Number(data.params.lon);
    return !Number.isNaN(lat) && !Number.isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },
  { message: "lat/lon invalides", path: ["params"] }
);

export type CreateMelPropertyDto = z.infer<typeof createMelPropertySchema>["body"];
export type UpdateMelPropertyDto = z.infer<typeof updateMelPropertySchema>["body"];

// ——— SignType ———
export const createSignTypeSchema = z.object({
  body: z.object({
    signType: z.string().min(1).max(100),
  }),
});

export type CreateSignTypeDto = z.infer<typeof createSignTypeSchema>["body"];

// ——— Sign ———
export const createMelSignSchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    signType: z.string().min(1).max(100),
    tagged: z.boolean().optional(),
    deterioratedInfo: z.boolean().optional(),
    hiddenByEnvironment: z.boolean().optional(),
    standing: z.boolean().optional(),
    present: z.boolean().optional(),
    componentTotal: z.number().int().min(0).optional(),
  }),
});

export const updateMelSignSchema = z.object({
  body: z.object({
    signType: z.string().min(1).max(100).optional(),
    tagged: z.boolean().optional(),
    deterioratedInfo: z.boolean().optional(),
    hiddenByEnvironment: z.boolean().optional(),
    standing: z.boolean().optional(),
    present: z.boolean().optional(),
    componentTotal: z.number().int().min(0).optional(),
  }),
});

export const melSignIdParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateMelSignDto = z.infer<typeof createMelSignSchema>["body"];
export type UpdateMelSignDto = z.infer<typeof updateMelSignSchema>["body"];

// ——— Report (signalement d'une propriété MEL par un utilisateur) ———
export const createMelReportSchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
});

export type CreateMelReportDto = z.infer<typeof createMelReportSchema>["body"];

export const signTypeParamSchema = z.object({
  params: z.object({
    signType: z.string().min(1).max(100),
  }),
});
