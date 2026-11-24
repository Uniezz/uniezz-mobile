import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteMyProfessorReview,
  getProfessor,
  getProfessorReviews,
  getProfessors,
  rateProfessor,
  reviewProfessor,
} from "@/api";

export function useProfessors(universityId?: string, query?: string) {
  return useInfiniteQuery({
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["study", "professors", universityId, query],
    queryFn: ({ pageParam }) => getProfessors(universityId, pageParam, query),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useRateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "professor_rate" },
    mutationFn: rateProfessor,
    onSuccess: (professor) => {
      queryClient.setQueryData(["study", "professor", professor.id], professor);
      queryClient.setQueriesData<
        InfiniteData<Awaited<ReturnType<typeof getProfessors>>>
      >(
        { queryKey: ["study", "professors"] },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => {
              if (!page.items?.some((item) => item.id === professor.id)) {
                return page;
              }

              return {
                ...page,
                items: page.items.map((item) =>
                  item.id === professor.id ? professor : item,
                ),
              };
            }),
          },
      );
    },
  });
}

// the professor page's header; not under ["study", "professors"], which holds list pages
export function useProfessor(id: string) {
  return useQuery({
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["study", "professor", id],
    queryFn: () => getProfessor(id),
  });
}

// not under ["study", "professors"]: useRateProfessor patches every query there as a professor page
export function useProfessorReviews(id: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["study", "professor-reviews", id],
    queryFn: ({ pageParam }) => getProfessorReviews(id, pageParam),
    enabled: id !== "",
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

// writing again replaces the student's review, so the list refetches rather than adding a row
export function useReviewProfessor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "professor_review" },
    mutationFn: (content: string) => reviewProfessor({ id, content }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["study", "professor-reviews", id],
      }),
  });
}

export function useDeleteMyProfessorReview(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "professor_review_delete" },
    mutationFn: () => deleteMyProfessorReview(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["study", "professor-reviews", id],
      }),
  });
}
