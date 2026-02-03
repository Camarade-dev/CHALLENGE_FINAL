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

  // Déballer AggregateError (pg-pool peut regrouper plusieurs erreurs)
  const raw = err as Error & { errors?: Error[] };
  const firstCause = Array.isArray(raw.errors)?.[0];
  const causeMessage = firstCause?.message ?? err.message;
  const fullMessage = causeMessage || (firstCause ? String(firstCause) : err.stack || "Erreur inconnue");

  console.error("[API Error]", causeMessage || err.message);
  if (firstCause?.stack) console.error(firstCause.stack);
  else if (process.env.NODE_ENV !== "production" && err.stack) console.error(err.stack);

  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Erreur interne du serveur"
      : fullMessage;

  res.status(statusCode).json({
    success: false,
    code: "INTERNAL_ERROR",
    message,
  });
}
