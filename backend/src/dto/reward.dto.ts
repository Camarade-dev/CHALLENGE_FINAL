import { z } from "zod";

export const claimRewardSchema = z.object({
  body: z.object({
    rewardId: z.string().min(1, "ID de récompense requis"),
  }),
});

export type ClaimRewardDto = z.infer<typeof claimRewardSchema>["body"];
