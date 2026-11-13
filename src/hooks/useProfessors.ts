import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getProfessors, rateProfessor } from "@/api";

export function useProfessors(universityId?: string) {
  return useInfiniteQuery({
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["study", "professors", universityId],
    queryFn: ({ pageParam }) => getProfessors(universityId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useRateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "professor_rate" },
    mutationFn: rateProfessor,
    onSuccess: (professor) =>
      queryClient.setQueryData<
        InfiniteData<Awaited<ReturnType<typeof getProfessors>>>
      >(
        ["study", "professors", undefined],
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items:
                page.items?.map((item) =>
                  item.id === professor.id ? professor : item,
                ) ?? null,
            })),
          },
      ),
  });
}
