/**
 * Service MEL : signalements de propriétés (mel."Report").
 * Un utilisateur (via son compte MEL) peut signaler une propriété MEL.
 */

import * as db from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { MelReport, MelLocalisation } from "../types/db";
import type { CreateMelReportDto } from "../dto/mel.dto";

function mapRow(row: Record<string, unknown>): MelReport {
  return {
    userAccount: Number(row.userAccount ?? row.user_account),
    melProperty: {
      lat: Number(row.prop_lat ?? row.mel_prop_lat),
      lon: Number(row.prop_lon ?? row.mel_prop_lon),
    },
  };
}

export const melReportService = {
  async create(data: CreateMelReportDto, userAccountId: number): Promise<MelReport> {
    const propExists = await db.queryOne(
      `SELECT 1 FROM mel."MELProperty" WHERE localisation = ROW($1, $2)::mel.gps_point`,
      [data.lat, data.lon]
    );
    if (!propExists) throw new NotFoundError("Propriété MEL");

    await db.query(
      `INSERT INTO mel."Report" ("userAccount", "melProperty")
       VALUES ($1, ROW($2, $3)::mel.gps_point)
       ON CONFLICT ("userAccount", "melProperty") DO NOTHING`,
      [userAccountId, data.lat, data.lon]
    );

    await db.query(
      `UPDATE mel."MELProperty" SET "lastReport" = CURRENT_DATE WHERE localisation = ROW($1, $2)::mel.gps_point`,
      [data.lat, data.lon]
    );

    return { userAccount: userAccountId, melProperty: { lat: data.lat, lon: data.lon } };
  },

  async findByUser(userAccountId: number): Promise<MelReport[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT "userAccount" AS "userAccount", (r."melProperty").lat AS prop_lat, (r."melProperty").lon AS prop_lon
       FROM mel."Report" r
       WHERE r."userAccount" = $1`,
      [userAccountId]
    );
    return rows.map(mapRow);
  },

  async findAll(): Promise<MelReport[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT r."userAccount" AS "userAccount", (r."melProperty").lat AS prop_lat, (r."melProperty").lon AS prop_lon
       FROM mel."Report" r
       ORDER BY r."userAccount"`
    );
    return rows.map(mapRow);
  },

  async findByProperty(lat: number, lon: number): Promise<MelReport[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT r."userAccount" AS "userAccount", (r."melProperty").lat AS prop_lat, (r."melProperty").lon AS prop_lon
       FROM mel."Report" r
       WHERE r."melProperty" = ROW($1, $2)::mel.gps_point`,
      [lat, lon]
    );
    return rows.map(mapRow);
  },
};
