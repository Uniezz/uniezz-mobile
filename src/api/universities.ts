import { api } from "./client";

export async function getUniversities() {
  const { data, error } = await api.GET("/auth/universities");

  if (error) {
    throw new Error(error.error);
  }

  return data ?? [];
}
