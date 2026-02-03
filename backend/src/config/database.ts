/**
 * Couche d'accès PostgreSQL : pool de connexions et helper de requêtes.
 * Pas d'ORM — requêtes SQL manuelles via pg.
 *
 * Supabase : utilise DATABASE_POOLER_URL (Session Pooler, port 6543) de préférence
 * pour éviter de saturer les connexions directes (port 5432).
 */

import { Pool, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_POOLER_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL ou DATABASE_POOLER_URL doit être défini dans .env"
  );
}

const needsSSL =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("neon.tech");

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

/**
 * Exécute une requête paramétrée et retourne les lignes.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/**
 * Exécute une requête et retourne la première ligne ou undefined.
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

/**
 * Pool exposé pour les cas où on a besoin de transactions (client).
 */
export { pool };

export default { query, queryOne, pool };
