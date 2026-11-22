import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getMyChallenges,
  getMyCoinGrants,
  getMyDailyQuests,
  getMyInviteCode,
  redeemInvite,
} from "@/api";

export function useMyInviteCode() {
  return useQuery({
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    queryKey: ["rewards", "inviteCode"],
    queryFn: getMyInviteCode,
  });
}

export function useMyDailyQuests() {
  return useQuery({
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    queryKey: ["rewards", "quests"],
    queryFn: getMyDailyQuests,
  });
}

// shortcut: only the first page; switch to useInfiniteQuery once there are more running challenges than a page holds
export function useMyChallenges() {
  return useQuery({
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    queryKey: ["rewards", "challenges"],
    queryFn: getMyChallenges,
  });
}

export function useMyCoinGrants() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["rewards", "grants"],
    queryFn: ({ pageParam }) => getMyCoinGrants(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

// for mutations that can pay coins: the quests, the history and the balance on the profile change
export const invalidateRewards = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["rewards"] }),
    queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  ]);

// the provider's coin toast shows what it paid; the balance and history change with it
export function useRedeemInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "invite_redeem" },
    mutationFn: redeemInvite,
    onSuccess: () => invalidateRewards(queryClient),
  });
}
