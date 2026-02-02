/**
 * Démarrage du serveur HTTP.
 * Charge les variables d'environnement et lance Express.
 */

import "dotenv/config";
import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Serveur démarré sur http://localhost:${config.port}`);
  console.log(`API : http://localhost:${config.port}/api`);
});
