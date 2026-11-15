import type { RedeemInviteInput } from "@/@types";
import { api } from "./client";

export async function getMyInviteCode() {
  const { data } = await api.GET("/auth/invites/me");

  return data!;
}

export async function redeemInvite(body: RedeemInviteInput) {
  const { data } = await api.POST("/auth/invites/redeem", { body });

  return data!;
}
