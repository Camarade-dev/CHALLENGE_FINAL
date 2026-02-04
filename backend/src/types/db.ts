/**
 * Types pour la couche données (Users, Reports).
 * Équivalent des modèles Prisma, pour PostgreSQL brut.
 */

export type Role = "USER" | "ADMIN";

export type ReportType = "INCIDENT" | "POLLUTION" | "INFRASTRUCTURE" | "OTHER";

export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  melAccountId?: number | null;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ReportWithUser extends Report {
  user: UserPublic;
}

export interface Panel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PanelCheckStatus = "PENDING" | "VALIDATED";

export interface PanelCheck {
  id: string;
  panelId: string;
  userId: string;
  checkedAt: Date;
  status: PanelCheckStatus;
  state: string;
  comment: string | null;
  photoUrl: string | null;
}

export interface PanelCheckWithDetails extends PanelCheck {
  panelName: string;
  userEmail: string;
}

// --- Schéma MEL ---

export interface MelLocalisation {
  lat: number;
  lon: number;
}

export interface MelUserAccount {
  accountID: number;
  eMailAddress: string;
  MEL_member: boolean;
  pointsTotal: number;
}

export interface MelProperty {
  localisation: MelLocalisation;
  lastReport: Date;
  naturalSpace: boolean;
  pointsValue: number;
  numberOfSigns: number;
  creator: number;
}

export interface MelSignType {
  signType: string;
}

export interface MelSign {
  signID: number;
  tagged: boolean;
  deterioratedInfo: boolean;
  hiddenByEnvironment: boolean;
  standing: boolean;
  present: boolean;
  componentTotal: number;
  signType: string;
  localisation: MelLocalisation;
}

export interface MelReport {
  userAccount: number;
  melProperty: MelLocalisation;
}
