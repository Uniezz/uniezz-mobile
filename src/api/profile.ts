import type { Profile, ProgrammeInput, UpdateProfileInput } from "@/@types";
import { api } from "./client";

export async function getMyProfile(): Promise<Profile> {
  const { data } = await api.GET("/profile/me");
  return data!;
}

// finished or skipped: sets onboardedAt once, and the student joins the student list
export async function completeMyOnboarding() {
  await api.PUT("/profile/onboarding");
}

export async function deleteMyProfile() {
  await api.DELETE("/profile/me");
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

export async function getProfiles(q?: string, cursor?: string) {
  const { data } = await api.GET("/profiles", {
    params: { query: { q, cursor } },
  });

  return data!;
}

export async function getPublicProfile(id: string) {
  const { data } = await api.GET("/profiles/{id}", {
    params: { path: { id } },
  });

  return data!;
}

export async function followProfile(id: string) {
  await api.PUT("/profiles/{id}/follow", { params: { path: { id } } });
}

export async function unfollowProfile(id: string) {
  await api.DELETE("/profiles/{id}/follow", { params: { path: { id } } });
}

export async function getProfileFollowers(id: string, cursor?: string) {
  const { data } = await api.GET("/profiles/{id}/followers", {
    params: { path: { id }, query: { cursor } },
  });
  return data!;
}

export async function getProfileFollowing(id: string, cursor?: string) {
  const { data } = await api.GET("/profiles/{id}/following", {
    params: { path: { id }, query: { cursor } },
  });
  return data!;
}

export async function getMyFollowers(cursor?: string) {
  const { data } = await api.GET("/profile/me/followers", {
    params: { query: { cursor } },
  });
  return data!;
}

export async function getMyFollowing(cursor?: string) {
  const { data } = await api.GET("/profile/me/following", {
    params: { query: { cursor } },
  });
  return data!;
}

export async function deleteMyAvatar() {
  await api.DELETE("/profile/avatar");
}

export async function deleteMyBanner() {
  await api.DELETE("/profile/banner");
}

export async function getMyProfilePhotos() {
  const { data } = await api.GET("/profile/photos");
  return data!;
}

export async function addMyProfilePhoto(mediaId: string) {
  await api.POST("/profile/photos", { body: { mediaId } });
}

export async function deleteMyProfilePhoto(id: string) {
  await api.DELETE("/profile/photos/{id}", {
    params: { path: { id } },
  });
}
