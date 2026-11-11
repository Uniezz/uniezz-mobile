import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMyProgramme,
  deleteMyAvatar,
  deleteMyBanner,
  deleteMyProgramme,
  getMyProfile,
  replaceMyProgramme,
  updateMyProfile,
} from "@/api/profile";
import type { ProgrammeInput } from "@/@types/profile";

export function useMyProfile() {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "profile_update" },
    mutationFn: updateMyProfile,
    onSuccess: (profile) =>
      queryClient.setQueryData(["profile", "me"], profile),
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
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useDeleteMyBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "banner_delete" },
    mutationFn: deleteMyBanner,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}
