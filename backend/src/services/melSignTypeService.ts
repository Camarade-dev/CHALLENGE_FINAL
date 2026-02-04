/**
 * Service MEL : types de panneaux (mel."SignType").
 */

import * as db from "../config/database";
import { NotFoundError } from "../utils/errors";
import type { MelSignType } from "../types/db";
import type { CreateSignTypeDto } from "../dto/mel.dto";

export const melSignTypeService = {
  async findAll(): Promise<MelSignType[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT "signType" AS "signType" FROM mel."SignType" ORDER BY "signType"`
    );
    return rows.map((r) => ({ signType: r.signType as string }));
  },

  async findByName(signType: string): Promise<MelSignType | null> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT "signType" FROM mel."SignType" WHERE "signType" = $1`,
      [signType]
    );
    return row ? { signType: row.signType as string } : null;
  },

  async create(data: CreateSignTypeDto): Promise<MelSignType> {
    const existing = await this.findByName(data.signType);
    if (existing) throw new Error("Ce type de panneau existe déjà.");
    await db.query(
      `INSERT INTO mel."SignType" ("signType") VALUES ($1)`,
      [data.signType]
    );
    return { signType: data.signType };
  },

  async delete(signType: string): Promise<void> {
    const existing = await this.findByName(signType);
    if (!existing) throw new NotFoundError("Type de panneau");
    await db.query(`DELETE FROM mel."SignType" WHERE "signType" = $1`, [signType]);
  },
};
