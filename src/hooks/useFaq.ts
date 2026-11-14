import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { createFaqProposal, getFaqEntries } from "@/api";

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

// a proposal waits for a moderator, so the published list does not change
export function useCreateFaqProposal() {
  return useMutation({
    meta: { analyticsAction: "faq_propose" },
    mutationFn: createFaqProposal,
  });
}
