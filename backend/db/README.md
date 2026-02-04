# Base de données

## Schémas

### 1. Schéma principal (application actuelle)

- **Fichier** : `schema.sql`
- **Tables** : `users`, `reports`, `panels`, `panel_checks` (schéma `public`)
- Utilisé par l’API Node (auth, panneaux, contrôles).

**Ordre d’exécution si besoin** : `schema.sql` puis éventuellement les fichiers dans `migrations/` (000 à 004) si la base existait déjà. La migration `004_mel_account_id.sql` ajoute la colonne `mel_account_id` à `users` pour lier chaque utilisateur à un compte `mel."UserAccount"`.

### 2. Schéma MEL (collègue)

- **Fichier** : `schema_mel.sql`
- **Schéma PostgreSQL** : `mel`
- **Contenu** : types/domaines (`D_eMailAddress`, `gps_point`, `D_localisation`), `UserAccount`, `MELProperty`, `Report`, `SignType`, `Sign`, `SignComponent`, `Pictogram`, `Logo`, `PeutContenir1`, `PeutContenir2`.

Les tables MEL sont préfixées par le schéma `mel` (ex. `mel."UserAccount"`, `mel."MELProperty"`), donc **aucun conflit** avec le schéma principal.

**Exécution** (après `schema.sql`) :

```bash
psql $env:DATABASE_URL -f db/schema_mel.sql
```

Ou dans Supabase / pgAdmin : exécuter le contenu de `schema_mel.sql`.

## Liaison users ↔ mel."UserAccount"

À l’inscription, l’API crée automatiquement une entrée dans `mel."UserAccount"` (même email, même mot de passe hashé, `MEL_member = false` pour les utilisateurs, `true` pour les admins) et enregistre l’`accountID` dans `users.mel_account_id`. Les fonctionnalités MEL (propriétés, signes, signalements) utilisent ce lien. Pour un utilisateur existant créé avant cette évolution, exécuter la migration 004 puis éventuellement créer manuellement un `UserAccount` et mettre à jour `users.mel_account_id`.

## Récap

| Schéma   | Fichier      | Usage                    |
|----------|--------------|---------------------------|
| public   | schema.sql   | App actuelle (API Node)  |
| mel      | schema_mel.sql | Modèle MEL (collègue)  |
