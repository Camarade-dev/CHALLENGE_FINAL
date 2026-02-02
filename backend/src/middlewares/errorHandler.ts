/**
 * Middleware global de gestion des erreurs.
 * Centralise les réponses d'erreur (AppError, Validation Zod, erreurs Express).
 */

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erreur métier (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...("details" in err && err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Erreur de validation Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Données invalides",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Erreur générique (ne pas exposer les détails en production)
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Erreur interne du serveur"
      : err.message;

  res.status(statusCode).json({
    success: false,
    code: "INTERNAL_ERROR",
    message,
  });
}
