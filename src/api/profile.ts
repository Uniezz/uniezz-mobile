import type { components } from "@/@types/schema";
import { api } from "./client";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type ProfileInput = components["schemas"]["UpdateMeInputBody"];

function requireData<T>(
  data: T | undefined,
  error: { error: string } | undefined,
): T {
  if (error) {
    throw new Error(error.error);
  }
  if (data === undefined) {
    throw new Error("The profile API returned no data.");
  }
  return data;
}

export async function getMyProfile(): Promise<Profile> {
  const { data, error } = await api.GET("/profile/me");
  return requireData(data, error);
}

export async function updateMyProfile(input: ProfileInput): Promise<Profile> {
  const { data, error } = await api.PATCH("/profile/me", { body: input });
  return requireData(data, error);
}

export async function createMyProgramme(
  input: ProgrammeInput,
): Promise<Programme> {
  const { data, error } = await api.POST("/profile/programmes", {
    body: input,
  });
  return requireData(data, error);
}

export async function replaceMyProgramme(
  id: string,
  input: ProgrammeInput,
): Promise<Programme> {
  const { data, error } = await api.PUT("/profile/programmes/{id}", {
    params: { path: { id } },
    body: input,
  });
  return requireData(data, error);
}

export async function deleteMyProgramme(id: string): Promise<void> {
  const { error } = await api.DELETE("/profile/programmes/{id}", {
    params: { path: { id } },
  });
  if (error) {
    throw new Error(error.error);
  }
}
