import type {
  AvatarContentType,
  Profile,
  ProfileInput,
  Programme,
  ProgrammeInput,
} from "@/@types/profile";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { MAX_AVATAR_SIZE_BYTES, requireApiData } from "@/utils";
import { api } from "./client";

export async function getMyProfile(): Promise<Profile> {
  const { data, error } = await api.GET("/profile/me");
  return requireApiData(data, error, "profile");
}

export async function updateMyProfile(input: ProfileInput): Promise<Profile> {
  const { data, error } = await api.PATCH("/profile/me", { body: input });
  return requireApiData(data, error, "profile update");
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
  const upload = requireApiData(data, error, "avatar upload");
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
  return requireApiData(data, error, "programme creation");
}

export async function replaceMyProgramme(
  id: string,
  input: ProgrammeInput,
): Promise<Programme> {
  const { data, error } = await api.PUT("/profile/programmes/{id}", {
    params: { path: { id } },
    body: input,
  });
  return requireApiData(data, error, "programme update");
}

export async function deleteMyProgramme(id: string): Promise<void> {
  const { error } = await api.DELETE("/profile/programmes/{id}", {
    params: { path: { id } },
  });
  if (error) {
    throw new Error(error.error);
  }
}
