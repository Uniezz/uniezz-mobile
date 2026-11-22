import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { launchImageLibraryAsync } from "expo-image-picker";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { apiErrorKey, captureAction, patchFeedAuthor } from "@/utils";
import { useUploadImages } from "./useMedia";
import {
  addMyProfilePhoto,
  addMyProgramme,
  deleteMyAvatar,
  deleteMyBanner,
  deleteMyProfile,
  deleteMyProfilePhoto,
  deleteMyProgramme,
  getMyProfile,
  getMyProfilePhotos,
  replaceMyProgramme,
  updateMyProfile,
} from "@/api";
import type { Profile, ProfilePhotosList, ProgrammeInput } from "@/@types";

export function useMyProfile() {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
  });
}

export function useDeleteMyProfile() {
  return useMutation({
    meta: { analyticsAction: "profile_delete" },
    mutationFn: deleteMyProfile,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "profile_update" },
    mutationFn: updateMyProfile,
    onSuccess: (profile, change) => {
      queryClient.setQueryData(["profile", "me"], profile);
      const authorPatch = {
        ...(change.firstName !== undefined
          ? { firstName: profile.firstName }
          : {}),
        ...(change.lastName !== undefined
          ? { lastName: profile.lastName }
          : {}),
        ...(change.avatarMediaId !== undefined
          ? { avatarUrl: profile.avatarUrl }
          : {}),
      };
      if (Object.keys(authorPatch).length > 0) {
        patchFeedAuthor(queryClient, profile.id, authorPatch);
      }
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rewards"] }),
        // the avatar leads the photo strip
        change.avatarMediaId !== undefined
          ? queryClient.invalidateQueries({ queryKey: ["profile", "photos"] })
          : undefined,
      ]);
    },
  });
}

export function useAddMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "programme_add" },
    mutationFn: addMyProgramme,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useReplaceMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "programme_update" },
    mutationFn: ({ id, body }: { id: string; body: ProgrammeInput }) =>
      replaceMyProgramme(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useDeleteMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "programme_delete" },
    mutationFn: deleteMyProgramme,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useDeleteMyAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "avatar_delete" },
    mutationFn: deleteMyAvatar,
    onSuccess: () => {
      queryClient.setQueryData<Profile>(
        ["profile", "me"],
        (current) => current && { ...current, avatarUrl: null },
      );
      const profile = queryClient.getQueryData<Profile>(["profile", "me"]);
      if (profile) {
        patchFeedAuthor(queryClient, profile.id, { avatarUrl: null });
      }
      return queryClient.invalidateQueries({ queryKey: ["profile", "photos"] });
    },
  });
}

export function useMyProfilePhotos() {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["profile", "photos"],
    queryFn: getMyProfilePhotos,
  });
}

export function useDeleteMyProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "profile_photo_delete" },
    mutationFn: deleteMyProfilePhoto,
    onSuccess: (_, id) =>
      queryClient.setQueryData<ProfilePhotosList>(
        ["profile", "photos"],
        (current) =>
          current && {
            photos: (current.photos ?? []).filter((photo) => photo.id !== id),
          },
      ),
  });
}

// picks photos into the free slots, uploads them and adds them in the picked order, toasting the outcome
export function usePickProfilePhotos(freeSlots: number) {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadImages("avatar");
  const { mutateAsync: addPhotos, isPending: isSaving } = useMutation({
    meta: { analyticsAction: "profile_photo_add" },
    mutationFn: async (mediaIds: string[]) => {
      for (const mediaId of mediaIds) await addMyProfilePhoto(mediaId);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "photos"] }),
  });

  const pickPhotos = async () => {
    captureAction(posthog, "profile_photos_pick", "attempted");
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: freeSlots,
      quality: 0.8,
    }).catch((error: unknown) => {
      captureAction(posthog, "profile_photos_pick", "failed");
      throw error;
    });
    if (result.canceled) {
      captureAction(posthog, "profile_photos_pick", "cancelled");
      return;
    }
    captureAction(posthog, "profile_photos_pick", "succeeded");
    const picked = result.assets
      .slice(0, freeSlots)
      .map(({ uri, mimeType, fileSize }) => ({ uri, mimeType, fileSize }));
    if (picked.length === 0) return;
    // one toast: it shows the work, then turns into the outcome
    const toastId = toast.loading(t("app.processingPhotos"));
    try {
      await addPhotos(await uploadImages(picked));
      toast.success(t("app.saved"), { id: toastId });
    } catch (error) {
      toast.error(t(apiErrorKey(error, "apiState.profileSaveError")), {
        id: toastId,
      });
    }
  };

  return { pickPhotos, isPending: isUploading || isSaving };
}

export function useDeleteMyBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "banner_delete" },
    mutationFn: deleteMyBanner,
    onSuccess: () =>
      queryClient.setQueryData<Profile>(
        ["profile", "me"],
        (profile) => profile && { ...profile, bannerUrl: null },
      ),
  });
}

const PROFILE_IMAGE_ASPECTS = {
  avatar: [1, 1],
  banner: [3, 1],
} as const;

// picks, uploads and saves the avatar or banner, toasting the outcome
export function usePickProfileImage(kind: keyof typeof PROFILE_IMAGE_ASPECTS) {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadImages(kind);
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateMyProfile();

  const pickImage = async () => {
    captureAction(posthog, `${kind}_pick`, "attempted");
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [...PROFILE_IMAGE_ASPECTS[kind]],
      quality: 0.8,
    }).catch((error: unknown) => {
      captureAction(posthog, `${kind}_pick`, "failed");
      throw error;
    });
    if (result.canceled) {
      captureAction(posthog, `${kind}_pick`, "cancelled");
      return;
    }
    captureAction(posthog, `${kind}_pick`, "succeeded");
    if (!result.assets[0]) return;
    const { uri, mimeType, fileSize } = result.assets[0];
    // one toast: it shows the work, then turns into the outcome
    const toastId = toast.loading(t("app.processingPhotos"));
    try {
      const [mediaId] = await uploadImages([{ uri, mimeType, fileSize }]);
      await updateProfile(
        kind === "avatar"
          ? { avatarMediaId: mediaId }
          : { bannerMediaId: mediaId },
      );
      toast.success(t("app.saved"), { id: toastId });
    } catch (error) {
      toast.error(t(apiErrorKey(error, "apiState.profileSaveError")), {
        id: toastId,
      });
    }
  };

  return { pickImage, isPending: isUploading || isSaving };
}
