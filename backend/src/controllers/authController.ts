/**
 * AuthController : inscription, connexion, profil.
 */

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { userService } from "../services/userService";
import { config } from "../config";
import { registerSchema, loginSchema } from "../dto/auth.dto";
import { validate } from "../middlewares/validate";
import type { JwtPayload } from "../middlewares/auth";

async function register(req: Request, res: Response): Promise<void> {
  const user = await userService.create(req.body, "USER");
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: "USER" } as JwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, role: "USER" }, token },
  });
}

async function login(req: Request, res: Response): Promise<void> {
  const user = await userService.verifyPassword(req.body.email, req.body.password);
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as JwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    },
  });
}

async function me(req: Request, res: Response): Promise<void> {
  const payload = req.user!;
  const user = await userService.findById(payload.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
  }
  res.json({
    success: true,
    data: { user: { ...user, role: (req.user as JwtPayload).role } },
  });
}

export const authController = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  me: asyncHandler(me),
};

export const authValidation = {
  register: validate(registerSchema),
  login: validate(loginSchema),
};
