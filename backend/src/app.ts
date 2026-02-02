/**
 * Point d'entrée Express : middlewares globaux et montage des routes.
 */

import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

app.use(errorHandler);

export default app;
