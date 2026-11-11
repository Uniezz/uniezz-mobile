import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addCourseComment,
  deleteCourseComment,
  getCourseComments,
} from "@/api";

export function useCourseComments(courseId: string) {
  return useInfiniteQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["study", "comments", courseId],
    queryFn: ({ pageParam }) => getCourseComments(courseId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useAddCourseComment() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_comment_create" },
    mutationFn: addCourseComment,
    onSuccess: (comment) =>
      queryClient.invalidateQueries({
        queryKey: ["study", "comments", comment.courseId],
      }),
  });
}

export function useDeleteCourseComment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_comment_delete" },
    mutationFn: deleteCourseComment,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["study", "comments", courseId],
      }),
  });
}
