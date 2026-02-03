/**
 * Point d'entrée Express : middlewares globaux et montage des routes.
 */

import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    credentials: false,
  })
);
app.use(express.json());

app.use("/api", routes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

app.use(errorHandler);

export default app;
