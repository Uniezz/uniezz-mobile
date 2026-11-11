import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { StudyFileFilters } from "@/@types/study";
import { deleteStudyFile, getCourseFiles, searchStudyFiles } from "@/api";

// file urls are short-lived links, so lists refresh often
export function useStudyFiles(filters: StudyFileFilters = {}) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["study", "files", filters],
    queryFn: ({ pageParam }) => searchStudyFiles(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useCourseFiles(courseId: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryKey: ["study", "files", "course", courseId],
    queryFn: ({ pageParam }) => getCourseFiles(courseId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useDeleteStudyFile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "study_file_delete" },
    mutationFn: deleteStudyFile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["study", "files"] }),
  });
}
