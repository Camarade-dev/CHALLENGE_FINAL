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
