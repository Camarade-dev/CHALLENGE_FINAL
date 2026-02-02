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
};

export type Config = typeof config;
