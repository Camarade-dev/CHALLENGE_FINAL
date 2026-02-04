-- =============================================================================
-- Schéma MEL (collègue) — intégré dans le projet sous le schéma "mel"
-- Ne remplace pas le schéma principal (users, panels, reports, panel_checks).
-- À exécuter après schema.sql si besoin : psql $env:DATABASE_URL -f db/schema_mel.sql
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS mel;

-- 1. Types de base et domaines
CREATE DOMAIN mel.D_eMailAddress AS TEXT
   CHECK (VALUE LIKE '%@%.%');

CREATE TYPE mel.gps_point AS (
    lat NUMERIC(9,6),
    lon NUMERIC(9,6)
);

CREATE DOMAIN mel.D_localisation AS mel.gps_point
CHECK (
    (VALUE).lat >= -90 AND (VALUE).lat <= 90 AND
    (VALUE).lon >= -180 AND (VALUE).lon <= 180
);

-- 2. Tables principales
CREATE TABLE mel."UserAccount" (
    "accountID" integer GENERATED ALWAYS AS IDENTITY,
    "eMailAddress" mel.D_eMailAddress
        CONSTRAINT nn_UserAccount_eMailAddress NOT NULL
        CONSTRAINT uk_UserAccount_eMailAddress UNIQUE,
    "hashPassword" text
        CONSTRAINT nn_UserAccount_hashPassword NOT NULL,
    "MEL_member" boolean
        CONSTRAINT nn_UserAccount_MEL_member NOT NULL,
    "pointsTotal" integer DEFAULT 0
        CONSTRAINT nn_UserAccount_pointsTotal NOT NULL,
    age integer,
    "lastName" varchar(100),
    "firstName" varchar(100),
    CONSTRAINT pk_UserAccount PRIMARY KEY("accountID")
);

-- 3. Fonction de vérification
CREATE OR REPLACE FUNCTION mel.is_mel_member(id_user integer)
RETURNS boolean AS $$
    SELECT "MEL_member" FROM mel."UserAccount" WHERE "accountID" = id_user;
$$ LANGUAGE sql;

-- 4. Table MELProperty
CREATE TABLE mel."MELProperty" (
    localisation mel.D_localisation,
    "lastReport" date DEFAULT CURRENT_DATE
        CONSTRAINT nn_MELProperty_lastReport NOT NULL,
    "naturalSpace" boolean
        CONSTRAINT nn_MEL_Property_naturalSpace NOT NULL,
    "pointsValue" integer
        CONSTRAINT nn_MELProperty_pointsValue NOT NULL,
    "numberOfSigns" integer
        CONSTRAINT nn_MELProperty_numberOfSigns NOT NULL,
    creator integer
        CONSTRAINT nn_MELProperty_creator NOT NULL,
    CONSTRAINT pk_MELProperty PRIMARY KEY (localisation),
    CONSTRAINT fk_MELProperty_creator FOREIGN KEY (creator) REFERENCES mel."UserAccount"("accountID"),
    CONSTRAINT ck_MELProperty_creator CHECK (mel.is_mel_member(creator))
);

-- 5. Rapports et signalétique
CREATE TABLE mel."Report" (
    "userAccount" integer,
    "melProperty" mel.D_localisation,
    CONSTRAINT fk_Report_userAccount FOREIGN KEY ("userAccount") REFERENCES mel."UserAccount"("accountID"),
    CONSTRAINT fk_Report_melProperty FOREIGN KEY ("melProperty") REFERENCES mel."MELProperty"(localisation),
    CONSTRAINT pk_Report PRIMARY KEY ("userAccount", "melProperty")
);

CREATE TABLE mel."SignType" (
    "signType" varchar(100),
    CONSTRAINT pk_SignType PRIMARY KEY ("signType")
);

CREATE TABLE mel."Sign" (
    "signID" integer GENERATED ALWAYS AS IDENTITY,
    tagged boolean DEFAULT false CONSTRAINT nn_Sign_tagged NOT NULL,
    "deterioratedInfo" boolean DEFAULT false CONSTRAINT nn_Sign_deterioratedInfo NOT NULL,
    "hiddenByEnvironment" boolean DEFAULT false CONSTRAINT nn_Sign_hiddenByEnvironment NOT NULL,
    standing boolean DEFAULT true CONSTRAINT nn_Sign_standing NOT NULL,
    present boolean DEFAULT true CONSTRAINT nn_Sign_present NOT NULL,
    "componentTotal" integer DEFAULT 0 CONSTRAINT nn_Sign_componentTotal NOT NULL,
    "signType" varchar(100) CONSTRAINT nn_Sign_signType NOT NULL,
    localisation mel.D_localisation CONSTRAINT nn_Sign_localisation NOT NULL,
    CONSTRAINT fk_Sign_signType FOREIGN KEY ("signType") REFERENCES mel."SignType"("signType"),
    CONSTRAINT fk_Sign_localisation FOREIGN KEY (localisation) REFERENCES mel."MELProperty"(localisation),
    CONSTRAINT pk_Sign PRIMARY KEY ("signID")
);

-- 6. Composants et contenu
CREATE TABLE mel."SignComponent" (
    "signComponentID" integer GENERATED ALWAYS AS IDENTITY,
    "textContent" text,
    "associatedSign" integer CONSTRAINT nn_SignComponent_associatedSign NOT NULL,
    CONSTRAINT fk_SignComponent_associatedSign FOREIGN KEY ("associatedSign") REFERENCES mel."Sign"("signID"),
    CONSTRAINT pk_SignComponent PRIMARY KEY ("signComponentID")
);

CREATE TABLE mel."Pictogram" (
    caracterisation varchar(100),
    CONSTRAINT pk_Pictogram PRIMARY KEY (caracterisation)
);

CREATE TABLE mel."Logo" (
    "logoName" varchar(100),
    CONSTRAINT pk_Logo PRIMARY KEY ("logoName")
);

CREATE TABLE mel."PeutContenir1" (
    "signComponent" integer,
    pictogram varchar(100),
    CONSTRAINT fk_PeutContenir1_signComponent FOREIGN KEY ("signComponent") REFERENCES mel."SignComponent"("signComponentID"),
    CONSTRAINT fk_PeutContenir1_pictogram FOREIGN KEY (pictogram) REFERENCES mel."Pictogram"(caracterisation),
    CONSTRAINT pk_PeutContenir1 PRIMARY KEY ("signComponent", pictogram)
);

CREATE TABLE mel."PeutContenir2" (
    "signComponent" integer,
    logo varchar(100),
    CONSTRAINT fk_PeutContenir2_signComponent FOREIGN KEY ("signComponent") REFERENCES mel."SignComponent"("signComponentID"),
    CONSTRAINT fk_PeutContenir2_logo FOREIGN KEY (logo) REFERENCES mel."Logo"("logoName"),
    CONSTRAINT pk_PeutContenir2 PRIMARY KEY ("signComponent", logo)
);
