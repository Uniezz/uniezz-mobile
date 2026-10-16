import type { ExchangeLoginCodeBody, IssuedSession } from "@/@types/auth";
import { api } from "./client";

export async function exchangeLoginCode(
  body: ExchangeLoginCodeBody,
): Promise<IssuedSession> {
  const { data, error } = await api.POST("/auth/exchange", { body });

  if (error) {
    throw new Error(error.error);
  }

  if (!data) {
    throw new Error("Login code exchange returned no session.");
  }

  return data;
}
