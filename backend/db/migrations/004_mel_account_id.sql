-- Liaison users (public) ↔ mel."UserAccount"
-- À exécuter après schema.sql et schema_mel.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mel_account_id INTEGER;

-- Optionnel : contrainte FK (désactivée si UserAccount peut être créé après users)
-- ALTER TABLE users ADD CONSTRAINT fk_users_mel_account
--   FOREIGN KEY (mel_account_id) REFERENCES mel."UserAccount"("accountID");

CREATE INDEX IF NOT EXISTS idx_users_mel_account_id ON users(mel_account_id);

COMMENT ON COLUMN users.mel_account_id IS 'Référence vers mel."UserAccount"("accountID") pour les fonctionnalités MEL';
