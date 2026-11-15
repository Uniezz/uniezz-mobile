import {
  useInfiniteQuery,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { getMyCoinGrants, getMyDailyQuests, getMyInviteCode } from "@/api";

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
