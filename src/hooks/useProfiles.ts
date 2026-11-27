import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PublicProfile } from "@/@types";
import {
  followProfile,
  getMyFollowers,
  getMyFollowing,
  getProfileFollowers,
  getProfileFollowing,
  getProfiles,
  getPublicProfile,
  unfollowProfile,
} from "@/api";
import { toSearchQuery } from "@/utils";

export function useProfileSearch(search: string) {
  const q = toSearchQuery(search);
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["profiles", "search", q],
    queryFn: ({ pageParam }) => getProfiles(q, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function usePublicProfile(id: string, isEnabled = true) {
  return useQuery({
    enabled: isEnabled,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["profiles", id],
    queryFn: () => getPublicProfile(id),
  });
}

// the count moves at once; a failed request puts the profile back
export function useFollowProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "profile_follow" },
    mutationFn: ({ id, follow }: { id: string; follow: boolean }) =>
      follow ? followProfile(id) : unfollowProfile(id),
    onMutate: async ({ id, follow }) => {
      await queryClient.cancelQueries({ queryKey: ["profiles", id] });
      const previous = queryClient.getQueryData<PublicProfile>([
        "profiles",
        id,
      ]);
      queryClient.setQueryData<PublicProfile>(["profiles", id], (profile) =>
        profile && profile.followedByMe !== follow
          ? {
              ...profile,
              followedByMe: follow,
              followersCount: profile.followersCount + (follow ? 1 : -1),
            }
          : profile,
      );
      return { previous };
    },
    onError: (_error, { id }, context) => {
      queryClient.setQueryData(["profiles", id], context?.previous);
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profiles", id] }),
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["follows"] }),
      ]),
  });
}

// followers of a student, or of the signed-in student when profileId is missing
export function useFollowers(profileId?: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["follows", profileId ?? "me", "followers"],
    queryFn: ({ pageParam }) =>
      profileId
        ? getProfileFollowers(profileId, pageParam)
        : getMyFollowers(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

// students a student follows, or the signed-in student follows when profileId is missing
export function useFollowing(profileId?: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["follows", profileId ?? "me", "following"],
    queryFn: ({ pageParam }) =>
      profileId
        ? getProfileFollowing(profileId, pageParam)
        : getMyFollowing(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}
