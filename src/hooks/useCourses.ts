import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Course, CourseFilters } from "@/@types/study";
import { createCourse, getCourse, getCourses, rateCourse } from "@/api";

export function useCourses(
  filters: CourseFilters = {},
  { enabled = true } = {},
) {
  return useInfiniteQuery({
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["study", "courses", filters],
    queryFn: ({ pageParam }) => getCourses(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

export function useCourse(id: string) {
  return useQuery({
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    queryKey: ["study", "course", id],
    queryFn: () => getCourse(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_create" },
    mutationFn: createCourse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["study", "courses"] }),
  });
}

export function useRateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_rate" },
    mutationFn: rateCourse,
    onSuccess: (course) => {
      queryClient.setQueryData<Course>(["study", "course", course.id], course);
      queryClient.setQueriesData<
        InfiniteData<Awaited<ReturnType<typeof getCourses>>>
      >({ queryKey: ["study", "courses"] }, (data) => {
        if (!data) return data;

        let updated = false;
        const pages = data.pages.map((page) => {
          if (!page.items?.some((item) => item.id === course.id)) {
            return page;
          }

          updated = true;
          return {
            ...page,
            items: page.items.map((item) =>
              item.id === course.id ? course : item,
            ),
          };
        });

        return updated ? { ...data, pages } : data;
      });
    },
  });
}
