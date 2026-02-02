/**
 * Script local pour tester la connexion à PostgreSQL.
 * Utilise soit DATABASE_URL, soit HOST / USER / PASSWORD / DATABASE / PORT.
 * Logs détaillés pour diagnostiquer les échecs de connexion.
 *
 * Usage : npm run db:test
 * Ou     npx ts-node scripts/test-db.ts
 */

import "dotenv/config";
import * as dns from "dns";
import { promisify } from "util";
import { Pool } from "pg";

const dnsLookup = promisify(dns.lookup);

function getConnectionConfig(): {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
} {
  // Même priorité que l'app : Session Pooler (Supabase port 6543) puis connexion directe
  const url = process.env.DATABASE_POOLER_URL ?? process.env.DATABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      const useSSL = host?.includes("supabase.co") || host?.includes("neon.tech") || host?.includes("pooler.supabase.com") || process.env.PG_SSL === "true";
      return {
        connectionString: url,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
      };
    } catch {
      return { connectionString: url };
    }
  }
  const host = process.env.PG_HOST ?? process.env.HOST ?? "localhost";
  // Supabase Session Pooler : port 6543 (pooler.supabase.com) ; sinon 5432
  const defaultPort = host.includes("pooler.supabase.com") ? 6543 : 5432;
  const port = parseInt(process.env.PG_PORT ?? String(defaultPort), 10);
  const user = process.env.PG_USER ?? process.env.USER ?? process.env.DB_USER;
  const password = process.env.PG_PASSWORD ?? process.env.PASSWORD ?? process.env.DB_PASSWORD;
  const database = process.env.PG_DATABASE ?? process.env.DATABASE ?? process.env.DB_NAME ?? "signalement_citoyen";
  const useSSL = host.includes("supabase.co") || host.includes("neon.tech") || process.env.PG_SSL === "true";

  if (!user || !password) {
    throw new Error(
      "Variables manquantes. Utilisez DATABASE_URL ou (PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE, PG_PORT)."
    );
  }
  return {
    host,
    port,
    user,
    password,
    database,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  };
}

function getHostForDiagnostic(config: ReturnType<typeof getConnectionConfig>): string | null {
  if (config.host) return config.host;
  if (config.connectionString) {
    try {
      return new URL(config.connectionString).hostname;
    } catch {
      return null;
    }
  }
  return null;
}

function logError(err: unknown): void {
  console.error("\n--- Détails de l'erreur ---");
  if (err instanceof Error) {
    console.error("Message :", err.message);
    console.error("Code    :", (err as NodeJS.ErrnoException).code ?? "(aucun)");
    if (err.cause) {
      console.error("Cause   :", err.cause);
    }
    console.error("\nInterprétation :");
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND") {
      console.error("  → Le nom d'hôte (DNS) n'a pas pu être résolu. Vérifiez :");
      console.error("    - Connexion Internet");
      console.error("    - Orthographe du host dans .env");
      console.error("    - Projet Supabase actif (pas en pause) si vous utilisez Supabase");
    } else if (code === "ECONNREFUSED") {
      console.error("  → Connexion refusée. Le serveur PostgreSQL n'accepte pas les connexions sur ce port.");
    } else if (code === "ETIMEDOUT" || code === "ECONNRESET") {
      console.error("  → Délai dépassé ou connexion coupée. Vérifiez le réseau / pare-feu.");
    } else if (code === "SELF_SIGNED_CERTIFICATE" || (err.message && err.message.includes("SSL"))) {
      console.error("  → Problème SSL. Essayez d'ajouter ?sslmode=require à l'URL ou PG_SSL=true.");
    }
    if (process.env.DEBUG) {
      console.error("\nStack :", err.stack);
    }
  } else {
    console.error(err);
  }
  console.error("----------------------------\n");
}

async function main(): Promise<void> {
  console.log("Test de connexion à PostgreSQL...\n");

  const config = getConnectionConfig();
  const host = getHostForDiagnostic(config);

  if (config.connectionString) {
    const source = process.env.DATABASE_POOLER_URL ? "DATABASE_POOLER_URL (Session Pooler)" : "DATABASE_URL";
    console.log("Config :", source, "(masqué)");
    if (host) {
      console.log("Host extrait :", host);
      try {
        const port = new URL(config.connectionString).port || "5432";
        console.log("Port :", port);
      } catch {
        console.log("Port : (dans l'URL)");
      }
      console.log("SSL :", config.ssl ? "oui" : "non");
    }
  } else {
    console.log("Config :", {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      password: config.password ? "***" : "(vide)",
      ssl: config.ssl ? "oui" : "non",
    });
  }

  // Étape 1 : résolution DNS (pour diagnostiquer ENOTFOUND)
  if (host) {
    console.log("\n[1/2] Résolution DNS de", host, "...");
    try {
      const resolved = await dnsLookup(host);
      console.log("      → Résolu :", resolved.address);
    } catch (dnsErr) {
      console.error("      → Échec DNS :", dnsErr instanceof Error ? dnsErr.message : dnsErr);
      console.error("      La connexion va probablement échouer (même cause).");
    }
  }

  // Étape 2 : connexion PostgreSQL
  console.log("\n[2/2] Connexion au serveur PostgreSQL...");
  const pool = new Pool(config);

  try {
    const result = await pool.query("SELECT 1 AS ok, current_database() AS db, version() AS version");
    console.log("      → Connexion OK.");
    console.log("\nBase    :", result.rows[0].db);
    console.log("Version :", (result.rows[0].version as string).split("\n")[0]);
  } catch (err) {
    console.error("      → Échec.");
    logError(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
