import { api } from "./client";

export async function getMyCoinGrants(cursor?: string) {
  const { data } = await api.GET("/rewards/me/grants", {
    params: { query: { cursor, limit: 20 } },
  });

  return data!;
}

export async function getMyDailyQuests() {
  const { data } = await api.GET("/rewards/me/quests");

  return data!;
}
