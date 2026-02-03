-- Schéma PostgreSQL - Application de signalement citoyen
-- À exécuter une fois : psql $env:DATABASE_URL -f db/schema.sql
-- Ou via un client (DBeaver, pgAdmin, etc.)

-- ---------------------------------------------------------------------------
-- Utilisateurs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ---------------------------------------------------------------------------
-- Signalements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('INCIDENT', 'POLLUTION', 'INFRASTRUCTURE', 'OTHER')),
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  photo_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON reports(latitude, longitude);

-- ---------------------------------------------------------------------------
-- Panneaux de la ville (contrôle / dernier check)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS panels (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  last_checked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panels_coords ON panels(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_panels_last_checked ON panels(last_checked_at);

-- Historique des contrôles (formulaire : état, commentaire, photo)
-- status : PENDING = soumis par utilisateur (en cours de vérification), VALIDATED = validé par admin
CREATE TABLE IF NOT EXISTS panel_checks (
  id         TEXT PRIMARY KEY,
  panel_id   TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status     TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALIDATED')),
  state      TEXT NOT NULL CHECK (state IN ('OK', 'DAMAGED', 'MISSING', 'OTHER')),
  comment    TEXT,
  photo_url  TEXT
);
CREATE INDEX IF NOT EXISTS idx_panel_checks_panel_id ON panel_checks(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_checks_checked_at ON panel_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_panel_checks_status ON panel_checks(status);
