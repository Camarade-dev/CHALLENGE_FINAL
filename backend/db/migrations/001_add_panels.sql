-- À exécuter si la table panels n'existe pas encore (base déjà créée avec users/reports).
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
