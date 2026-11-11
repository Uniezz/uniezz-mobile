import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Professor } from "@/@types/study";
import { getProfessor, getProfessors, rateProfessor } from "@/api";

export function useProfessors(universityId: string | undefined) {
  return useInfiniteQuery({
    enabled: !!universityId,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["study", "professors", universityId],
    queryFn: ({ pageParam }) => getProfessors(universityId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useProfessor(id: string) {
  return useQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    queryKey: ["study", "professor", id],
    queryFn: () => getProfessor(id),
  });
}

export function useRateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "professor_rate" },
    mutationFn: rateProfessor,
    onSuccess: (professor) => {
      queryClient.setQueryData<Professor>(
        ["study", "professor", professor.id],
        professor,
      );
      return queryClient.invalidateQueries({
        queryKey: ["study", "professors"],
      });
    },
  });
}
