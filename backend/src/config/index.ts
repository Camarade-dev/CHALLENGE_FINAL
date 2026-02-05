/**
 * Configuration centralisée : variables d'environnement et accès DB.
 * Charge .env via dotenv (appelé au démarrage dans server.ts).
 */

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwt: {
    secret: process.env.JWT_SECRET ?? "change-me-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  /** Durée du cookie de session (ms) - aligné sur JWT */
  sessionCookieMaxAge: 7 * 24 * 60 * 60 * 1000,
};

export type Config = typeof config;
