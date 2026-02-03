-- Historique des contrôles (formulaire : état, commentaire, photo).
CREATE TABLE IF NOT EXISTS panel_checks (
  id         TEXT PRIMARY KEY,
  panel_id   TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  state      TEXT NOT NULL CHECK (state IN ('OK', 'DAMAGED', 'MISSING', 'OTHER')),
  comment    TEXT,
  photo_url  TEXT
);
CREATE INDEX IF NOT EXISTS idx_panel_checks_panel_id ON panel_checks(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_checks_checked_at ON panel_checks(checked_at);
