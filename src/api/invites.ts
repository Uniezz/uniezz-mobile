import { api } from "./client";

export async function getMyInviteCode() {
  const { data } = await api.GET("/auth/invites/me");

  return data!;
}
