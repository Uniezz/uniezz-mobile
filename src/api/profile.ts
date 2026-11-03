import type {
  Profile,
  ProgrammeInput,
  UpdateProfileInput,
} from "@/@types/profile";
import { api } from "./client";

export async function getMyProfile(): Promise<Profile> {
  const { data } = await api.GET("/profile/me");
  return data!;
}

export async function updateMyProfile(body: UpdateProfileInput) {
  const { data } = await api.PATCH("/profile/me", { body });
  return data!;
}

export async function addMyProgramme(body: ProgrammeInput) {
  const { data } = await api.POST("/profile/programmes", {
    body,
  });

  return data!;
}

export async function replaceMyProgramme(id: string, body: ProgrammeInput) {
  const { data } = await api.PUT("/profile/programmes/{id}", {
    params: { path: { id } },
    body,
  });

  return data!;
}

export async function deleteMyProgramme(id: string) {
  await api.DELETE("/profile/programmes/{id}", {
    params: { path: { id } },
  });
}

export async function getProfiles(name: string, cursor?: string) {
  const { data } = await api.GET("/profiles", {
    params: { query: { name: name || undefined, cursor } },
  });

  return data!;
}

export async function getPublicProfile(id: string) {
  const { data } = await api.GET("/profiles/{id}", {
    params: { path: { id } },
  });

  return data!;
}

export async function deleteMyAvatar() {
  await api.DELETE("/profile/avatar");
}
