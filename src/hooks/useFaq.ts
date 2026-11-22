import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createFaqProposal, getFaqEntries, getMyFaqProposals } from "@/api";

export function useFaqEntries() {
  return useInfiniteQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["faq"],
    queryFn: ({ pageParam }) => getFaqEntries(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useMyFaqProposals() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["faq", "proposals"],
    queryFn: ({ pageParam }) => getMyFaqProposals(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

// a proposal waits for a moderator, so only the student's own proposals change
export function useCreateFaqProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "faq_propose" },
    mutationFn: createFaqProposal,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["faq", "proposals"] }),
  });
}
