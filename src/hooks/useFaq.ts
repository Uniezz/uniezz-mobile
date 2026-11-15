import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiRequestError,
  approveFaqProposal,
  createFaqProposal,
  getFaqEntries,
  getMyFaqProposals,
  getPendingFaqProposals,
} from "@/api";

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

// only FAQ publishers may list pending proposals; everyone else gets 403, which hides the tab
export function usePendingFaqProposals() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["faq", "pending"],
    queryFn: ({ pageParam }) => getPendingFaqProposals(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    retry: (failureCount, error) =>
      !(error instanceof ApiRequestError && error.status === 403) &&
      failureCount < 3,
  });
}

// publishing moves the entry from pending to the public list; the coins go to the author, not the publisher
export function useApproveFaqProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "faq_approve" },
    mutationFn: approveFaqProposal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faq"] }),
  });
}
