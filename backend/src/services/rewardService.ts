/**
 * RewardService : système de points et récompenses.
 * Points attribués selon l'ancienneté du dernier état des lieux (voir tableau).
 * 100 points = 1€
 */

import { randomUUID } from "crypto";
import * as db from "../config/database";
import { NotFoundError } from "../utils/errors";

/** Grille des points selon ancienneté du dernier état des lieux */
function getPointsForAge(monthsSinceLastCheck: number | null, hasPhoto: boolean): number {
  if (!hasPhoto) return 0; // Photo non exploitable
  // last_checked_at null = jamais contrôlé = considéré > 12 mois
  if (monthsSinceLastCheck == null) return 40;
  if (monthsSinceLastCheck < 1) return 5;
  if (monthsSinceLastCheck < 3) return 10;
  if (monthsSinceLastCheck < 6) return 20;
  if (monthsSinceLastCheck < 12) return 30;
  return 40;
}

export interface Reward {
  id: string;
  name: string;
  partners: string | null;
  servicesMel: string | null;
  valueEur: number;
  pointsRequired: number;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  rewardName: string;
  claimedAt: Date;
}

export const rewardService = {
  /** Catalogue des récompenses */
  async getCatalog(): Promise<Reward[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT id, name, partners, services_mel AS "servicesMel",
              value_eur AS "valueEur", points_required AS "pointsRequired"
       FROM rewards ORDER BY points_required ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      partners: r.partners != null ? (r.partners as string) : null,
      servicesMel: r.servicesMel != null ? (r.servicesMel as string) : null,
      valueEur: Number(r.valueEur),
      pointsRequired: Number(r.pointsRequired),
    })) as Reward[];
  },

  /** Points de l'utilisateur */
  async getUserPoints(userId: string): Promise<number> {
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT points FROM users WHERE id = $1`,
      [userId]
    );
    return row ? Number(row.points) : 0;
  },

  /** Historique des transactions de points (optionnel) */
  async getPointTransactions(userId: string, limit = 20): Promise<Array<{ amount: number; reason: string; createdAt: Date }>> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT amount, reason, created_at AS "createdAt"
       FROM point_transactions WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return rows.map((r) => ({
      amount: Number(r.amount),
      reason: r.reason as string,
      createdAt: r.createdAt as Date,
    }));
  },

  /** Récompenses réclamées par l'utilisateur */
  async getMyClaims(userId: string): Promise<RewardClaim[]> {
    const rows = await db.query<Record<string, unknown>>(
      `SELECT c.id, c.reward_id AS "rewardId", r.name AS "rewardName", c.claimed_at AS "claimedAt"
       FROM reward_claims c
       JOIN rewards r ON r.id = c.reward_id
       WHERE c.user_id = $1
       ORDER BY c.claimed_at DESC`,
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      rewardId: r.rewardId,
      rewardName: r.rewardName,
      claimedAt: r.claimedAt,
    })) as RewardClaim[];
  },

  /** Attribuer des points lors de la validation d'un contrôle conforme (appelé avant mise à jour last_checked_at). */
  async attributePointsForValidatedCheck(checkId: string): Promise<{ userId: string; points: number }> {
    const checkRow = await db.queryOne<Record<string, unknown>>(
      `SELECT c.user_id AS "userId", c.checked_at AS "checkedAt", c.photo_url AS "photoUrl",
              c.points_attributed AS "pointsAttributed",
              p.last_checked_at AS "panelLastCheckedAt"
       FROM panel_checks c
       JOIN panels p ON p.id = c.panel_id
       WHERE c.id = $1 AND c.status = 'PENDING'`,
      [checkId]
    );
    if (!checkRow) throw new NotFoundError("Contrôle");
    if (checkRow.pointsAttributed != null) {
      return { userId: checkRow.userId as string, points: checkRow.pointsAttributed as number };
    }

    const userId = checkRow.userId as string;
    const checkedAt = new Date(checkRow.checkedAt as string);
    const photoUrl = checkRow.photoUrl as string | null;
    const panelLastCheckedAt = checkRow.panelLastCheckedAt ? new Date(checkRow.panelLastCheckedAt as string) : null;

    const hasPhoto = !!photoUrl && photoUrl.trim().length > 0;
    let monthsSinceLastCheck: number | null = null;
    if (panelLastCheckedAt) {
      const diffMs = checkedAt.getTime() - panelLastCheckedAt.getTime();
      monthsSinceLastCheck = diffMs / (1000 * 60 * 60 * 24 * 30.44); // approximation mois
    }

    const points = getPointsForAge(monthsSinceLastCheck, hasPhoto);

    if (points > 0) {
      await db.query(
        `UPDATE users SET points = points + $1 WHERE id = $2`,
        [points, userId]
      );
      const txId = randomUUID();
      await db.query(
        `INSERT INTO point_transactions (id, user_id, amount, reason, reference_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [txId, userId, points, "Contrôle conforme validé", checkId]
      );
      await db.query(
        `UPDATE panel_checks SET points_attributed = $1 WHERE id = $2`,
        [points, checkId]
      );
    }

    return { userId, points };
  },

  /** Échanger des points contre une récompense */
  async claimReward(userId: string, rewardId: string): Promise<RewardClaim> {
    const reward = await db.queryOne<Record<string, unknown>>(
      `SELECT id, name, points_required AS "pointsRequired" FROM rewards WHERE id = $1`,
      [rewardId]
    );
    if (!reward) throw new NotFoundError("Récompense");

    const pointsRequired = Number(reward.pointsRequired);
    const userRow = await db.queryOne<Record<string, unknown>>(
      `SELECT points FROM users WHERE id = $1`,
      [userId]
    );
    const userPoints = userRow ? Number(userRow.points) : 0;
    if (userPoints < pointsRequired) {
      throw new Error("Points insuffisants pour cette récompense.");
    }

    const claimId = randomUUID();
    await db.query(
      `UPDATE users SET points = points - $1 WHERE id = $2`,
      [pointsRequired, userId]
    );
    await db.query(
      `INSERT INTO reward_claims (id, user_id, reward_id) VALUES ($1, $2, $3)`,
      [claimId, userId, rewardId]
    );
    await db.query(
      `INSERT INTO point_transactions (id, user_id, amount, reason, reference_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), userId, -pointsRequired, `Échange : ${reward.name}`, rewardId]
    );

    return {
      id: claimId,
      rewardId,
      rewardName: reward.name as string,
      claimedAt: new Date(),
    };
  },
};
