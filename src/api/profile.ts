import type { components } from "@/@types/schema";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { api } from "./client";

export type Profile = components["schemas"]["Profile"];
export type Programme = components["schemas"]["Programme"];
export type ProgrammeInput = components["schemas"]["ProgrammeRequest"];
export type ProfileInput = components["schemas"]["UpdateMeInputBody"];
export type AvatarContentType =
  components["schemas"]["CreateUploadInputBody"]["contentType"];

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

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

export async function uploadMyAvatar(
  uri: string,
  contentType: AvatarContentType,
): Promise<string> {
  const file = new File(uri);
  const size = file.size;
  if (size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Avatar images must be 5 MiB or smaller.");
  }

  const { data, error } = await api.POST("/media/uploads", {
    body: { kind: "avatar", contentType, size },
  });
  const upload = requireData(data, error);
  const response = await expoFetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Avatar upload failed with status ${response.status}.`);
  }

  return upload.mediaId;
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
