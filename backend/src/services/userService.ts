/**
 * UserService : création et recherche d'utilisateurs (auth).
 * Crée et lie un compte mel."UserAccount" à chaque utilisateur (mel_account_id).
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
      `SELECT id, email, password, name, role, created_at, updated_at, mel_account_id
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
      melAccountId: row.mel_account_id as number | null ?? undefined,
    };
  },

  async findById(id: string): Promise<(UserPublic & { role: string; melAccountId?: number | null }) | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT id, email, name, role, mel_account_id FROM users WHERE id = $1`,
      [id]
    );
    if (!row) return null;
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string | null,
      role: row.role as string,
      melAccountId: row.mel_account_id != null ? (row.mel_account_id as number) : null,
    };
  },

  /** Retourne l'ID du compte MEL (mel."UserAccount"."accountID") pour l'utilisateur, ou null. */
  async getMelAccountId(userId: string): Promise<number | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT mel_account_id FROM users WHERE id = $1`,
      [userId]
    );
    const id = row?.mel_account_id;
    return id != null ? (id as number) : null;
  },

  /** Met à jour MEL_member pour le compte MEL de l'utilisateur (ex: promotion admin). */
  async setMelMember(userId: string, melMember: boolean): Promise<void> {
    const melId = await this.getMelAccountId(userId);
    if (melId == null) return;
    await db.query(
      `UPDATE mel."UserAccount" SET "MEL_member" = $1 WHERE "accountID" = $2`,
      [melMember, melId]
    );
  },

  async create(data: RegisterDto, role: "USER" | "ADMIN" = "USER"): Promise<UserPublic & { role: string }> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new UnauthorizedError("Un compte existe déjà avec cet email.");
    }
    const id = randomUUID();
    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    const emailNorm = data.email.toLowerCase().trim();
    const isMelMember = role === "ADMIN";

    const displayName = data.name?.trim() || [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || null;
    const melFirstName = data.firstName?.trim() || null;
    const melLastName = data.lastName?.trim() || null;
    const melAge = data.age != null && data.age >= 0 && data.age <= 150 ? data.age : null;

    const client = await db.pool.connect();
    try {
      const melRow = await client.query<{ accountID: number }>(
        `INSERT INTO mel."UserAccount" ("eMailAddress", "hashPassword", "MEL_member", "firstName", "lastName", age)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING "accountID"`,
        [emailNorm, hashed, isMelMember, melFirstName, melLastName, melAge]
      );
      const melAccountId = melRow.rows[0]?.accountID;
      if (melAccountId == null) throw new Error("UserAccount MEL insert failed");

      await client.query(
        `INSERT INTO users (id, email, password, name, role, mel_account_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, emailNorm, hashed, displayName, role, melAccountId]
      );
    } finally {
      client.release();
    }

    const user = await this.findById(id);
    if (!user) throw new Error("User not found after create");
    return { id: user.id, email: user.email, name: user.name, role };
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
