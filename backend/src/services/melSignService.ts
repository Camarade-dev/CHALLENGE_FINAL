/**
 * Service MEL : panneaux de signalisation (mel."Sign").
 */

import * as db from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { MelSign, MelLocalisation } from "../types/db";
import type { CreateMelSignDto, UpdateMelSignDto } from "../dto/mel.dto";

function mapRow(row: Record<string, unknown>): MelSign {
  return {
    signID: Number(row.signID ?? row.sign_id),
    tagged: Boolean(row.tagged),
    deterioratedInfo: Boolean(row.deterioratedInfo ?? row.deteriorated_info),
    hiddenByEnvironment: Boolean(row.hiddenByEnvironment ?? row.hidden_by_environment),
    standing: Boolean(row.standing),
    present: Boolean(row.present),
    componentTotal: Number(row.componentTotal ?? row.component_total),
    signType: (row.signType ?? row.sign_type ?? "") as string,
    localisation: {
      lat: Number(row.lat),
      lon: Number(row.lon),
    },
  };
}

export const melSignService = {
  async findAll(): Promise<MelSign[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT "signID" AS "signID", tagged, "deterioratedInfo" AS "deterioratedInfo",
              "hiddenByEnvironment" AS "hiddenByEnvironment", standing, present,
              "componentTotal" AS "componentTotal", "signType" AS "signType",
              (localisation).lat AS lat, (localisation).lon AS lon
       FROM mel."Sign"
       ORDER BY "signID"`
    );
    return rows.map(mapRow);
  },

  async findByProperty(lat: number, lon: number): Promise<MelSign[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT "signID" AS "signID", tagged, "deterioratedInfo" AS "deterioratedInfo",
              "hiddenByEnvironment" AS "hiddenByEnvironment", standing, present,
              "componentTotal" AS "componentTotal", "signType" AS "signType",
              (localisation).lat AS lat, (localisation).lon AS lon
       FROM mel."Sign"
       WHERE localisation = ROW($1, $2)::mel.gps_point`,
      [lat, lon]
    );
    return rows.map(mapRow);
  },

  async findById(id: number): Promise<MelSign | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT "signID" AS "signID", tagged, "deterioratedInfo" AS "deterioratedInfo",
              "hiddenByEnvironment" AS "hiddenByEnvironment", standing, present,
              "componentTotal" AS "componentTotal", "signType" AS "signType",
              (localisation).lat AS lat, (localisation).lon AS lon
       FROM mel."Sign" WHERE "signID" = $1`,
      [id]
    );
    return row ? mapRow(row) : null;
  },

  async getOrThrow(id: number): Promise<MelSign> {
    const s = await this.findById(id);
    if (!s) throw new NotFoundError("Panneau MEL");
    return s;
  },

  async create(data: CreateMelSignDto): Promise<MelSign> {
    const res = await db.queryOne<Record<string, unknown>>(
      `INSERT INTO mel."Sign" (localisation, "signType", tagged, "deterioratedInfo", "hiddenByEnvironment", standing, present, "componentTotal")
       VALUES (ROW($1, $2)::mel.gps_point, $3, $4, $5, $6, $7, $8, $9)
       RETURNING "signID", (localisation).lat AS lat, (localisation).lon AS lon`,
      [
        data.lat,
        data.lon,
        data.signType,
        data.tagged ?? false,
        data.deterioratedInfo ?? false,
        data.hiddenByEnvironment ?? false,
        data.standing ?? true,
        data.present ?? true,
        data.componentTotal ?? 0,
      ]
    );
    const signID = res?.signID ?? res?.sign_id;
    if (signID == null) throw new Error("Sign insert failed");
    return this.getOrThrow(Number(signID));
  },

  async update(id: number, data: UpdateMelSignDto): Promise<MelSign> {
    await this.getOrThrow(id);
    const updates: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (data.signType !== undefined) {
      updates.push(`"signType" = $${i++}`);
      params.push(data.signType);
    }
    if (data.tagged !== undefined) {
      updates.push(`tagged = $${i++}`);
      params.push(data.tagged);
    }
    if (data.deterioratedInfo !== undefined) {
      updates.push(`"deterioratedInfo" = $${i++}`);
      params.push(data.deterioratedInfo);
    }
    if (data.hiddenByEnvironment !== undefined) {
      updates.push(`"hiddenByEnvironment" = $${i++}`);
      params.push(data.hiddenByEnvironment);
    }
    if (data.standing !== undefined) {
      updates.push(`standing = $${i++}`);
      params.push(data.standing);
    }
    if (data.present !== undefined) {
      updates.push(`present = $${i++}`);
      params.push(data.present);
    }
    if (data.componentTotal !== undefined) {
      updates.push(`"componentTotal" = $${i++}`);
      params.push(data.componentTotal);
    }
    if (updates.length === 0) return this.getOrThrow(id);
    params.push(id);
    await db.query(
      `UPDATE mel."Sign" SET ${updates.join(", ")} WHERE "signID" = $${i}`,
      params
    );
    return this.getOrThrow(id);
  },

  async delete(id: number): Promise<{ deleted: true; signID: number }> {
    await this.getOrThrow(id);
    await db.query(`DELETE FROM mel."Sign" WHERE "signID" = $1`, [id]);
    return { deleted: true, signID: id };
  },
};
