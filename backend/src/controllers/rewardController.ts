/**
 * RewardController : catalogue des récompenses, points, échange.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { rewardService } from "../services/rewardService";
import { validate } from "../middlewares/validate";
import { claimRewardSchema } from "../dto/reward.dto";

async function getCatalog(_req: Request, res: Response): Promise<void> {
  const rewards = await rewardService.getCatalog();
  res.json({ success: true, data: rewards });
}

async function getMyPoints(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const points = await rewardService.getUserPoints(userId);
  res.json({ success: true, data: { points } });
}

async function getMyClaims(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const claims = await rewardService.getMyClaims(userId);
  res.json({ success: true, data: claims });
}

async function claimReward(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { rewardId } = req.body as { rewardId: string };
  const claim = await rewardService.claimReward(userId, rewardId);
  res.status(201).json({ success: true, data: claim });
}

export const rewardController = {
  getCatalog: asyncHandler(getCatalog),
  getMyPoints: asyncHandler(getMyPoints),
  getMyClaims: asyncHandler(getMyClaims),
  claimReward: asyncHandler(claimReward),
};

export const rewardValidation = {
  claim: validate(claimRewardSchema),
};
