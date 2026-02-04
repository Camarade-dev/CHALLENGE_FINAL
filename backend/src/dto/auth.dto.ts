import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Minimum 6 caractères"),
    name: z.string().max(200).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    age: z.coerce.number().int().min(0).max(150).optional().nullable(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis"),
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>["body"];
export type LoginDto = z.infer<typeof loginSchema>["body"];
