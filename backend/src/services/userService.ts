/**
 * UserService : création et recherche d'utilisateurs (auth).
 */

import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import * as db from "../config/database";
import { UnauthorizedError } from "../utils/errors";
import type { RegisterDto } from "../dto/auth.dto";
import type { User, UserPublic } from "../types/db";

const SALT_ROUNDS = 10;

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT id, email, password, name, role, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    if (!row) return null;
    return {
      id: row.id as string,
      email: row.email as string,
      password: row.password as string,
      name: row.name as string | null,
      role: row.role as "USER" | "ADMIN",
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  },

  async findById(id: string): Promise<(UserPublic & { role: string }) | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT id, email, name, role FROM users WHERE id = $1`,
      [id]
    );
    if (!row) return null;
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string | null,
      role: row.role as string,
    };
  },

  async create(data: RegisterDto, role: "USER" | "ADMIN" = "USER"): Promise<UserPublic & { role: string }> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new UnauthorizedError("Un compte existe déjà avec cet email.");
    }
    const id = randomUUID();
    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    await db.query(
      `INSERT INTO users (id, email, password, name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, data.email.toLowerCase().trim(), hashed, data.name ?? null, role]
    );
    const user = await this.findById(id);
    if (!user) throw new Error("User not found after create");
    return user;
  },

  async verifyPassword(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Email ou mot de passe incorrect.");
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedError("Email ou mot de passe incorrect.");
    }
    return user;
  },
};
