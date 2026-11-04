import { api } from "./client";

export async function getUniversities() {
  const { data } = await api.GET("/auth/universities");

  return data!;
}
