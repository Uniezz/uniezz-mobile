import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
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

// like Instagram: a tap flips the button and the count at once. Taps queue one request each, one
// after another (scope), so the last tap wins; a failed one refetches, which puts the button back
export function useFollowProfile(id: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ["profiles", id];
  const mutationKey = ["profiles", "follow", id];
  return useMutation({
    meta: { analyticsAction: "profile_follow" },
    mutationKey,
    scope: { id: `profiles-follow-${id}` },
    mutationFn: (follow: boolean) =>
      follow ? followProfile(id) : unfollowProfile(id),
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<PublicProfile>(queryKey, (profile) =>
        profile && profile.followedByMe !== follow
          ? {
              ...profile,
              followedByMe: follow,
              followersCount: profile.followersCount + (follow ? 1 : -1),
            }
          : profile,
      );
    },
    onError: () => toast.error(t("apiState.error")),
    // a refetch while more taps wait would flip the button back, so only the last one refetches
    onSettled: () =>
      queryClient.isMutating({ mutationKey }) === 1 &&
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
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
