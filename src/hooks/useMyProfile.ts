import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMyProgramme,
  deleteMyProgramme,
  getMyProfile,
  replaceMyProgramme,
  updateMyProfile,
} from "@/api/profile";
import type { components } from "@/@types/schema";

export function useMyProfile() {
  return useQuery({ queryKey: ["profile", "me"], queryFn: getMyProfile });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (profile) =>
      queryClient.setQueryData(["profile", "me"], profile),
  });
}

export function useAddMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMyProgramme,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useReplaceMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: components["schemas"]["ProgrammeRequest"];
    }) => replaceMyProgramme(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}

export function useDeleteMyProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyProgramme,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}
