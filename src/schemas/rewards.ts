import * as z from "zod";

export const redeemInviteSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{7}$/, "rewards.redeemInvalid"),
});
