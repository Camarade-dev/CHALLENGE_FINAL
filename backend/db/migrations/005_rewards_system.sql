-- Système de points et récompenses
-- Points attribués selon ancienneté du dernier état des lieux (100 points = 1€)

-- Points sur les utilisateurs
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- Points attribués par contrôle validé (éviter double attribution)
ALTER TABLE panel_checks ADD COLUMN IF NOT EXISTS points_attributed INTEGER;

-- Historique des transactions de points
CREATE TABLE IF NOT EXISTS point_transactions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);

-- Catalogue des récompenses
CREATE TABLE IF NOT EXISTS rewards (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  partners        TEXT,
  services_mel    TEXT,
  value_eur       INTEGER NOT NULL,
  points_required INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Récompenses échangées par les utilisateurs
CREATE TABLE IF NOT EXISTS reward_claims (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id  TEXT NOT NULL REFERENCES rewards(id),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON reward_claims(user_id);

-- Insertion du catalogue des récompenses (données fournies)
INSERT INTO rewards (id, name, partners, services_mel, value_eur, points_required) VALUES
  ('r1', 'Places de Spectacles ou de concerts', 'Théâtre Sébastopole, Opéra, Le Splendide, Zénith, ...', 'Culture & Loisirs (Le "C''art")', 20, 2000),
  ('r2', 'Réductions sur des places de foot', 'Le LOSC (Lille Olympique Sporting Club)', 'Direction Sports : Piscine olympique Weppes, Patinoire Wasquehal', 20, 2000),
  ('r3', 'Pass culturels (LA C''ART)', 'Hello Lille (Agence d''Attractivité)', NULL, 40, 4000),
  ('r4', 'Équipements de randonnée ou de vélo', 'Decathlon, boutiques locales', NULL, 40, 4000),
  ('r5', 'Réduction sur les prix de tickets de transport', 'Ilévia', NULL, 10, 1000),
  ('r6', 'Goodies (Gourdes, Tote Bag)', '...', NULL, 5, 500),
  ('r7', 'Abonnements V''Lille (journées gratuites)', 'Ilévia', 'Direction de la mobilité', 7, 700),
  ('r8', 'Visites privées "Coulisses" (Stade Pierre Mauroy)', 'Eiffage (Gestionnaire du Stade)', 'Direction du Rayonnement Métropolitain', 45, 4500),
  ('r9', 'Activités sportives : piscine des Weppes, patinoire Serge-Charles', 'Piscine des Weppes, Patinoire Serge-Charles', NULL, 10, 1000),
  ('r10', 'Bons d''achat en ressourceries locales', 'Abej Solidarité / Réseau des Ressourceries', 'Direction de l''Économie Circulaire', 15, 1500),
  ('r11', 'Stages d''initiation sportive (Voile, Équitation)', 'Centres de plein air (ex: Val de Marque)', 'Direction des Sports', 60, 6000),
  ('r12', 'Abonnement V''Lille (1 an)', 'Ilévia', 'Direction de la mobilité', 36, 3600),
  ('r13', 'Lille City Pass', NULL, NULL, 35, 3500),
  ('r14', 'Espaces naturels payants', NULL, NULL, 7, 700)
ON CONFLICT (id) DO NOTHING;
