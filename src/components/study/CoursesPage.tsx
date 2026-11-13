import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { toast } from "sonner-native";
import type { Course } from "@/@types/study";
import { useCourses, useRateCourse } from "@/hooks/useCourses";
import { useUniversities } from "@/hooks/useUniversities";
import { apiErrorKey } from "@/utils/apiErrorKey";
import { StudyList } from "./StudyList";
import { StudyRow } from "./StudyRow";

type CoursesPageProps = {
  query: string;
  universityId?: string;
  semester?: number;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function CoursesPage({
  query,
  universityId,
  semester,
  headerHeight,
  onScroll,
}: CoursesPageProps) {
  const { t } = useTranslation();
  const { data: universities = [] } = useUniversities();
  const { mutateAsync: rateCourse, isPending: isRating } = useRateCourse();
  const {
    data,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useCourses({
    universityId,
    semester,
    subject: query || undefined,
  });
  const courses = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const handleCourseRating = async (id: string, rating: number) => {
    try {
      await rateCourse({ id, rating });
    } catch (error) {
      toast.error(t(apiErrorKey(error)));
    }
  };
  const renderCourse = (course: Course) => {
    const handlePress = () => router.push(`/course/${course.id}`);
    const handleRatingChange = (rating: number) =>
      handleCourseRating(course.id, rating);
    return (
      <StudyRow
        title={course.name}
        subtitle={`${course.subject} · ${t("study.semesterShort", { semester: course.semester })}`}
        university={
          universities.find(({ id }) => id === course.universityId)?.name ??
          course.universityId
        }
        difficulty={course.difficulty}
        rating={course.ratingAverage}
        ratingCount={course.ratingCount}
        onRate={handleRatingChange}
        isRating={isRating}
        onPress={handlePress}
      />
    );
  };

  return (
    <StudyList
      items={courses}
      renderItem={renderCourse}
      isPending={isPending}
      isError={isError}
      isRefetching={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      onRefresh={handleRefresh}
      onEndReached={handleEndReached}
      headerHeight={headerHeight}
      onScroll={onScroll}
    />
  );
}
