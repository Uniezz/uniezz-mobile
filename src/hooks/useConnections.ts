import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ConnectionPreferences,
  DiscoverDeck,
  DiscoverFilters,
} from "@/@types/connections";
import {
  actOnCandidate,
  ApiRequestError,
  deleteConnection,
  getConnectionPreferences,
  getConnections,
  getDiscoverCards,
  setStudentBlocked,
  updateConnectionPreferences,
} from "@/api";

export function useDiscoverCards(filters: DiscoverFilters) {
  return useQuery({
    // a deck has no cursor; each fetch issues new candidate ids, so it is not refetched on focus
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    queryKey: ["connections", "discover", filters],
    queryFn: () => getDiscoverCards(filters),
    placeholderData: keepPreviousData,
  });
}

export function useActOnCandidate(filters: DiscoverFilters) {
  const queryClient = useQueryClient();
  const dropCard = (id: string) =>
    queryClient.setQueryData<DiscoverDeck>(
      ["connections", "discover", filters],
      (deck) =>
        deck && {
          items: deck.items?.filter((card) => card.candidateId !== id) ?? null,
        },
    );

  return useMutation({
    meta: { analyticsAction: "connection_act" },
    mutationFn: actOnCandidate,
    onSuccess: (result, { id }) => {
      dropCard(id);
      if (result.matched) {
        return queryClient.invalidateQueries({
          queryKey: ["connections", "list"],
        });
      }
    },
    // an expired card cannot be acted on again
    onError: (error, { id }) => {
      if (error instanceof ApiRequestError && error.status === 404) {
        dropCard(id);
      }
    },
  });
}

export function useConnections() {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["connections", "list"],
    queryFn: ({ pageParam }) => getConnections(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "connection_delete" },
    mutationFn: deleteConnection,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["connections", "list"] }),
  });
}

export function useConnectionPreferences() {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["connections", "me"],
    queryFn: getConnectionPreferences,
  });
}

export function useUpdateConnectionPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "connection_preferences_update" },
    mutationFn: updateConnectionPreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData<ConnectionPreferences>(
        ["connections", "me"],
        preferences,
      );
      // the decks depend on which modes the student is open to
      return queryClient.invalidateQueries({
        queryKey: ["connections", "discover"],
      });
    },
  });
}

export function useBlockStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "student_block" },
    mutationFn: (id: string) => setStudentBlocked({ id, blocked: true }),
    // a block hides both students from each other everywhere
    onSuccess: () =>
      Promise.all(
        [["connections"], ["profiles"], ["feed"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}
