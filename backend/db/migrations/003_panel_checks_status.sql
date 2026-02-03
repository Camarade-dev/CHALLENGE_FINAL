-- Statut des contrôles : PENDING (soumis par utilisateur) → VALIDATED (validé par admin).
ALTER TABLE panel_checks
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING'
  CHECK (status IN ('PENDING', 'VALIDATED'));

CREATE INDEX IF NOT EXISTS idx_panel_checks_status ON panel_checks(status);
