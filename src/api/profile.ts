import type { components } from "@/@types/schema";
import { api } from "./client";

export async function getMyProfile(): Promise<
  components["schemas"]["Profile"]
> {
  const { data, error } = await api.GET("/profile/me");
  if (error) throw new Error(error.error);
  if (!data) throw new Error("Missing profile response");
  return data;
}

export async function updateMyProfile(
  body: components["schemas"]["UpdateMeInputBody"],
) {
  const { data, error } = await api.PATCH("/profile/me", { body });
  if (error) throw new Error(error.error);
  if (!data) throw new Error("Missing profile response");
  return data;
}

export async function addMyProgramme(
  body: components["schemas"]["ProgrammeRequest"],
) {
  const { data, error } = await api.POST("/profile/programmes", { body });
  if (error) throw new Error(error.error);
  if (!data) throw new Error("Missing programme response");
  return data;
}

export async function replaceMyProgramme(
  id: string,
  body: components["schemas"]["ProgrammeRequest"],
) {
  const { data, error } = await api.PUT("/profile/programmes/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) throw new Error(error.error);
  if (!data) throw new Error("Missing programme response");
  return data;
}

export async function deleteMyProgramme(id: string) {
  const { error, response } = await api.DELETE("/profile/programmes/{id}", {
    params: { path: { id } },
  });
  if (error && response.status !== 404) throw new Error(error.error);
}
