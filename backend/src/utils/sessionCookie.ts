/**
 * Utilitaire pour le cookie de session JWT.
 * Nom du cookie : panneaux_session (HttpOnly pour la sécurité).
 */

import { Response } from "express";
import { config } from "../config";

export const SESSION_COOKIE_NAME = "panneaux_session";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: config.sessionCookieMaxAge,
};

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
}
