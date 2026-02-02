/**
 * ReportService : logique métier des signalements.
 * Couche d'accès : PostgreSQL via notre abstraction (query / queryOne).
 */

import { randomUUID } from "crypto";
import * as db from "../config/database";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import type { CreateReportDto, UpdateReportDto, ReportFilters } from "../dto/report.dto";
import type { ReportWithUser, ReportStatus, ReportType } from "../types/db";

const REPORT_COLUMNS = `
  r.id, r.title, r.description, r.type, r.latitude, r.longitude,
  r.photo_url AS "photoUrl", r.status, r.created_at AS "createdAt",
  r.updated_at AS "updatedAt", r.user_id AS "userId"
`;

const USER_SELECT = `
  json_build_object('id', u.id, 'email', u.email, 'name', u.name) AS user
`;

function mapRow(row: Record<string, unknown>): ReportWithUser {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as ReportType,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoUrl: row.photoUrl as string | null,
    status: row.status as ReportStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userId: row.userId,
    user: typeof row.user === "object" && row.user !== null && "id" in row.user
      ? (row.user as { id: string; email: string; name: string | null })
      : { id: "", email: "", name: null },
  } as ReportWithUser;
}

export const reportService = {
  /**
   * Créer un signalement (utilisateur connecté).
   */
  async create(userId: string, data: CreateReportDto) {
    const id = randomUUID();
    await db.query(
      `INSERT INTO reports (id, title, description, type, latitude, longitude, photo_url, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        data.title,
        data.description,
        data.type,
        data.latitude,
        data.longitude,
        data.photoUrl ?? null,
        userId,
      ]
    );
    return this.findById(id);
  },

  /**
   * Récupérer tous les signalements (avec filtres optionnels).
   */
  async findAll(filters?: ReportFilters) {
    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let i = 1;
    if (filters?.type) {
      conditions.push(`r.type = $${i++}`);
      params.push(filters.type);
    }
    if (filters?.status) {
      conditions.push(`r.status = $${i++}`);
      params.push(filters.status);
    }
    if (filters?.userId) {
      conditions.push(`r.user_id = $${i++}`);
      params.push(filters.userId);
    }

    const sql = `
      SELECT ${REPORT_COLUMNS}, ${USER_SELECT}
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY r.created_at DESC
    `;
    const rows = await db.query<Record<string, unknown>>(sql, params);
    return rows.map(mapRow);
  },

  /**
   * Récupérer un signalement par ID.
   */
  async findById(id: string) {
    const sql = `
      SELECT ${REPORT_COLUMNS}, ${USER_SELECT}
      FROM reports r
      JOIN users u ON u.id = r.user_id
      WHERE r.id = $1
    `;
    const row = await db.queryOne<Record<string, unknown>>(sql, [id]);
    if (!row) {
      throw new NotFoundError("Signalement");
    }
    return mapRow(row);
  },

  /**
   * Mettre à jour un signalement (propriétaire ou admin).
   */
  async update(id: string, userId: string, data: UpdateReportDto, isAdmin: boolean) {
    const report = await this.findById(id);
    if (report.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Vous ne pouvez modifier que vos propres signalements.");
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (data.title !== undefined) {
      updates.push(`title = $${i++}`);
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${i++}`);
      params.push(data.description);
    }
    if (data.type !== undefined) {
      updates.push(`type = $${i++}`);
      params.push(data.type);
    }
    if (data.photoUrl !== undefined) {
      updates.push(`photo_url = $${i++}`);
      params.push(data.photoUrl);
    }
    if (data.status !== undefined && isAdmin) {
      updates.push(`status = $${i++}`);
      params.push(data.status);
    }
    if (updates.length === 0) {
      return report;
    }
    updates.push(`updated_at = NOW()`);
    params.push(id);
    await db.query(
      `UPDATE reports SET ${updates.join(", ")} WHERE id = $${i}`,
      params
    );
    return this.findById(id);
  },

  /**
   * Supprimer un signalement (propriétaire ou admin).
   */
  async delete(id: string, userId: string, isAdmin: boolean) {
    const report = await this.findById(id);
    if (report.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Vous ne pouvez supprimer que vos propres signalements.");
    }
    await db.query("DELETE FROM reports WHERE id = $1", [id]);
    return { deleted: true, id };
  },
};
