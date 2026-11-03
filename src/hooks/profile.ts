import {
  createMyProgramme,
  deleteMyProgramme,
  getMyProfile,
  replaceMyProgramme,
  updateMyProfile,
} from "@/api/profile";
import type { ProgrammeInput, ProfileInput } from "@/api/profile";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

export const MY_PROFILE_QUERY_KEY = ["profile", "me"] as const;

export async function clearMyProfileCache(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.cancelQueries({ queryKey: MY_PROFILE_QUERY_KEY });
  queryClient.removeQueries({ queryKey: MY_PROFILE_QUERY_KEY });
}

export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
    staleTime: 60 * 1000,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) => updateMyProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(MY_PROFILE_QUERY_KEY, profile);
    },
  });
}

export function useCreateMyProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProgrammeInput) => createMyProgramme(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
    },
  });
}

export function useReplaceMyProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProgrammeInput }) =>
      replaceMyProgramme(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
    },
  });
}

export function useDeleteMyProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMyProgramme(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
    },
  });
}
