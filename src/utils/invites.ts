// the API applies an invitation code only in an account's first days
const INVITE_REDEEM_DAYS = 7;

export const canRedeemInvite = (createdAt: string, now = Date.now()) =>
  now - Date.parse(createdAt) < INVITE_REDEEM_DAYS * 24 * 60 * 60_000;

export const REDEEM_INVITE_CODES: Record<string, string> = {
  invalid_referral_code: "rewards.redeemInvalid",
  referral_already_set: "rewards.redeemAlreadySet",
  referral_window_closed: "rewards.redeemWindowClosed",
};
