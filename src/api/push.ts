import { api } from "./client";

// one token per session: a new one replaces the old, and one another session held moves here
export async function registerMyPushToken(token: string) {
  await api.PUT("/push/tokens/me", { body: { token } });
}
