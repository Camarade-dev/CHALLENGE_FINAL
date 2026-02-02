/**
 * Middleware d'authentification JWT.
 * Décode le token et attache l'utilisateur (id, role) à req.user.
 * À implémenter complètement avec jsonwebtoken + UserService.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError } from "../utils/errors";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    next(new UnauthorizedError("Token manquant"));
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Token invalide ou expiré"));
  }
}

/** Optionnel : exige le rôle ADMIN. */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "ADMIN") {
    next(new UnauthorizedError("Rôle administrateur requis"));
    return;
  }
  next();
}
