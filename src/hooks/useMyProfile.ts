import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMyProgramme,
  deleteMyAvatar,
  deleteMyBanner,
  deleteMyProfile,
  deleteMyProgramme,
  getMyProfile,
  replaceMyProgramme,
  updateMyProfile,
} from "@/api";
import type { Profile, ProgrammeInput } from "@/@types";

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
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile", "me"], profile);
      // completing the profile pays coins once; the returned profile already carries the balance
      return queryClient.invalidateQueries({ queryKey: ["rewards"] });
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
    onSuccess: () =>
      queryClient.setQueryData<Profile>(
        ["profile", "me"],
        (profile) => profile && { ...profile, avatarUrl: null },
      ),
  });
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
