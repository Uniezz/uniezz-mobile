import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { Course } from "@/@types/study";
import { useCourses } from "@/hooks/useCourses";
import { StudyList } from "./StudyList";
import { StudyRow } from "./StudyRow";

type CoursesPageProps = {
  universityId: string | undefined;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function CoursesPage({
  universityId,
  headerHeight,
  onScroll,
}: CoursesPageProps) {
  const { t } = useTranslation();
  const {
    data,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useCourses({ universityId }, { enabled: !!universityId });
  const courses = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderCourse = (course: Course) => {
    const handlePress = () => router.push(`/course/${course.id}`);
    return (
      <StudyRow
        icon="graduation-cap"
        title={course.name}
        subtitle={`${course.subject} · ${t("study.semesterShort", { semester: course.semester })}`}
        rating={course.ratingAverage}
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
