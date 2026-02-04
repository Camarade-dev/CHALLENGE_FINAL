/**
 * Service MEL : propriétés (mel."MELProperty").
 * Localisation = clé primaire (lat, lon) ; créateur = compte MEL (MEL_member = true).
 */

import * as db from "../config/database";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import type { MelProperty, MelLocalisation } from "../types/db";
import type { CreateMelPropertyDto, UpdateMelPropertyDto } from "../dto/mel.dto";

function rowToLocalisation(row: Record<string, unknown>, prefix = ""): MelLocalisation {
  const latKey = prefix ? `${prefix}lat` : "lat";
  const lonKey = prefix ? `${prefix}lon` : "lon";
  return {
    lat: Number(row[latKey] ?? row.lat),
    lon: Number(row[lonKey] ?? row.lon),
  };
}

function mapRow(row: Record<string, unknown>): MelProperty {
  return {
    localisation: rowToLocalisation(row),
    lastReport: row.lastReport ? new Date(row.lastReport as string) : new Date(row.last_report as string),
    naturalSpace: Boolean(row.naturalSpace ?? row.natural_space),
    pointsValue: Number(row.pointsValue ?? row.points_value),
    numberOfSigns: Number(row.numberOfSigns ?? row.number_of_signs),
    creator: Number(row.creator),
  };
}

export const melPropertyService = {
  async findAll(): Promise<MelProperty[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT (localisation).lat AS lat, (localisation).lon AS lon,
              "lastReport" AS "lastReport", "naturalSpace" AS "naturalSpace",
              "pointsValue" AS "pointsValue", "numberOfSigns" AS "numberOfSigns", creator
       FROM mel."MELProperty"
       ORDER BY "lastReport" DESC`
    );
    return rows.map(mapRow);
  },

  async findByLocalisation(lat: number, lon: number): Promise<MelProperty | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT (localisation).lat AS lat, (localisation).lon AS lon,
              "lastReport" AS "lastReport", "naturalSpace" AS "naturalSpace",
              "pointsValue" AS "pointsValue", "numberOfSigns" AS "numberOfSigns", creator
       FROM mel."MELProperty"
       WHERE localisation = ROW($1, $2)::mel.gps_point`,
      [lat, lon]
    );
    return row ? mapRow(row) : null;
  },

  async getOrThrow(lat: number, lon: number): Promise<MelProperty> {
    const p = await this.findByLocalisation(lat, lon);
    if (!p) throw new NotFoundError("Propriété MEL");
    return p;
  },

  async create(data: CreateMelPropertyDto, creatorAccountId: number): Promise<MelProperty> {
    const existing = await this.findByLocalisation(data.lat, data.lon);
    if (existing) throw new ForbiddenError("Une propriété existe déjà à cette localisation.");
    await db.query(
      `INSERT INTO mel."MELProperty" (localisation, "naturalSpace", "pointsValue", "numberOfSigns", creator)
       VALUES (ROW($1, $2)::mel.gps_point, $3, $4, $5, $6)`,
      [data.lat, data.lon, data.naturalSpace, data.pointsValue, data.numberOfSigns, creatorAccountId]
    );
    return this.getOrThrow(data.lat, data.lon);
  },

  async update(lat: number, lon: number, data: UpdateMelPropertyDto): Promise<MelProperty> {
    await this.getOrThrow(lat, lon);
    const updates: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (data.naturalSpace !== undefined) {
      updates.push(`"naturalSpace" = $${i++}`);
      params.push(data.naturalSpace);
    }
    if (data.pointsValue !== undefined) {
      updates.push(`"pointsValue" = $${i++}`);
      params.push(data.pointsValue);
    }
    if (data.numberOfSigns !== undefined) {
      updates.push(`"numberOfSigns" = $${i++}`);
      params.push(data.numberOfSigns);
    }
    if (updates.length === 0) return this.getOrThrow(lat, lon);
    params.push(lat, lon);
    await db.query(
      `UPDATE mel."MELProperty" SET ${updates.join(", ")} WHERE localisation = ROW($${i}, $${i + 1})::mel.gps_point`,
      params
    );
    return this.getOrThrow(lat, lon);
  },

  async delete(lat: number, lon: number): Promise<{ deleted: true; localisation: MelLocalisation }> {
    await this.getOrThrow(lat, lon);
    await db.query(
      `DELETE FROM mel."MELProperty" WHERE localisation = ROW($1, $2)::mel.gps_point`,
      [lat, lon]
    );
    return { deleted: true, localisation: { lat, lon } };
  },
};
