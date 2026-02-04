/**
 * Route d'upload de photo pour les contrôles de panneaux.
 * POST /api/upload/check-photo : multipart, champ "photo", retourne { url }.
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "check-photos");
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // ignore
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext.toLowerCase()) ? ext : ".jpg";
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP."));
    }
  },
});

async function uploadCheckPhoto(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Aucun fichier envoyé. Utilisez le champ 'photo'." });
    return;
  }
  // Retourner un chemin relatif pour que le frontend charge l'image via la même origine (proxy)
  const url = `/uploads/check-photos/${req.file.filename}`;
  res.json({ success: true, data: { url } });
}

const router = Router();
router.post("/check-photo", authMiddleware, upload.single("photo"), asyncHandler(uploadCheckPhoto));

export default router;
