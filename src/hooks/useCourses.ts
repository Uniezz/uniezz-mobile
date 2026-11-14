import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Course, CourseFilters } from "@/@types/study";
import {
  createCourse,
  getCourse,
  getCourses,
  rateCourse,
  updateCourse,
} from "@/api";

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

// puts a course the API returned into its detail query and every list that holds it
const replaceCourse = (queryClient: QueryClient, course: Course) => {
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
};

export function useRateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_rate" },
    mutationFn: rateCourse,
    onSuccess: (course) => replaceCourse(queryClient, course),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { analyticsAction: "course_update" },
    mutationFn: updateCourse,
    onSuccess: (course) => replaceCourse(queryClient, course),
  });
}
