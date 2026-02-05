/**
 * PanelService : logique métier des panneaux de la ville.
 */

import { randomUUID } from "crypto";
import * as db from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { CreatePanelDto, UpdatePanelDto, CheckPanelDto } from "../dto/panel.dto";
import type { Panel, PanelCheckWithDetails } from "../types/db";

function mapRow(row: Record<string, unknown>): Panel {
  return {
    id: row.id,
    name: row.name,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    lastCheckedAt: row.last_checked_at ? new Date(row.last_checked_at as string) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Panel;
}

export const panelService = {
  async findAll(): Promise<Panel[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT id, name, latitude, longitude, last_checked_at, created_at, updated_at
       FROM panels
       ORDER BY last_checked_at ASC NULLS FIRST, name ASC`
    );
    return rows.map(mapRow);
  },

  async findById(id: string): Promise<Panel> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT id, name, latitude, longitude, last_checked_at, created_at, updated_at
       FROM panels WHERE id = $1`,
      [id]
    );
    if (!row) throw new NotFoundError("Panneau");
    return mapRow(row);
  },

  async create(data: CreatePanelDto): Promise<Panel> {
    const id = randomUUID();
    await db.query(
      `INSERT INTO panels (id, name, latitude, longitude)
       VALUES ($1, $2, $3, $4)`,
      [id, data.name, data.latitude, data.longitude]
    );
    return this.findById(id);
  },

  async update(id: string, data: UpdatePanelDto): Promise<Panel> {
    await this.findById(id);
    const updates: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (data.name !== undefined) {
      updates.push(`name = $${i++}`);
      params.push(data.name);
    }
    if (data.latitude !== undefined) {
      updates.push(`latitude = $${i++}`);
      params.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      updates.push(`longitude = $${i++}`);
      params.push(data.longitude);
    }
    if (updates.length === 0) return this.findById(id);
    updates.push(`updated_at = NOW()`);
    params.push(id);
    await db.query(
      `UPDATE panels SET ${updates.join(", ")} WHERE id = $${i}`,
      params
    );
    return this.findById(id);
  },

  /** Soumettre un contrôle (utilisateur) : créé en PENDING, last_checked_at non mis à jour. */
  async check(id: string, userId: string, data: CheckPanelDto): Promise<Panel> {
    await this.findById(id);
    const checkId = randomUUID();
    await db.query(
      `INSERT INTO panel_checks (id, panel_id, user_id, state, comment, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [checkId, id, userId, data.state, data.comment ?? null, data.photoUrl ?? null]
    );
    return this.findById(id);
  },

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    await this.findById(id);
    await db.query("DELETE FROM panels WHERE id = $1", [id]);
    return { deleted: true, id };
  },

  /** Liste des contrôles en attente (admin). */
  async findPendingChecks(): Promise<PanelCheckWithDetails[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT c.id, c.panel_id AS "panelId", c.user_id AS "userId",
              c.checked_at AS "checkedAt", c.status, c.state, c.comment, c.photo_url AS "photoUrl",
              p.name AS "panelName", u.email AS "userEmail"
       FROM panel_checks c
       JOIN panels p ON p.id = c.panel_id
       JOIN users u ON u.id = c.user_id
       WHERE c.status = 'PENDING'
       ORDER BY c.checked_at ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      panelId: r.panelId,
      userId: r.userId,
      checkedAt: r.checkedAt,
      status: r.status,
      state: r.state,
      comment: r.comment ?? null,
      photoUrl: r.photoUrl ?? null,
      panelName: r.panelName,
      userEmail: r.userEmail,
    })) as PanelCheckWithDetails[];
  },

  /** Contrôles en attente soumis par l'utilisateur connecté (pour afficher "En cours de vérification"). */
  async findMyPendingCheckPanelIds(userId: string): Promise<string[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT panel_id FROM panel_checks WHERE user_id = $1 AND status = 'PENDING'`,
      [userId]
    );
    return rows.map((r) => r.panel_id as string);
  },

  /** Valider un contrôle (admin) : attribution des points, status → VALIDATED, mise à jour last_checked_at. */
  async validateCheck(checkId: string): Promise<Panel> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT panel_id FROM panel_checks WHERE id = $1 AND status = 'PENDING'`,
      [checkId]
    );
    if (!row) throw new NotFoundError("Contrôle en attente");
    const panelId = row.panel_id as string;

    // 1. Attribuer les points AVANT de mettre à jour last_checked_at (utilise l'ancienneté actuelle)
    const { rewardService } = await import("./rewardService");
    await rewardService.attributePointsForValidatedCheck(checkId);

    // 2. Valider le contrôle (status → VALIDATED)
    await db.query(
      `UPDATE panel_checks SET status = 'VALIDATED' WHERE id = $1`,
      [checkId]
    );
    // 3. Mettre à jour last_checked_at du panneau
    await db.query(
      `UPDATE panels SET last_checked_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [panelId]
    );

    return this.findById(panelId);
  },
};
