import { router } from "expo-router";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { Professor } from "@/@types/study";
import { useProfessors } from "@/hooks/useProfessors";
import { UNIVERSITY_SHORT_NAMES } from "@/utils";
import { StudyList } from "./StudyList";
import { StudyRow } from "./StudyRow";

type ProfessorsPageProps = {
  universityId: string | undefined;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function ProfessorsPage({
  universityId,
  headerHeight,
  onScroll,
}: ProfessorsPageProps) {
  const {
    data,
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProfessors(universityId);
  const professors = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderProfessor = (professor: Professor) => {
    const handlePress = () => router.push(`/professor/${professor.id}`);
    return (
      <StudyRow
        icon="users"
        title={professor.name}
        subtitle={
          professor.degree ??
          UNIVERSITY_SHORT_NAMES[professor.universityId] ??
          professor.universityId
        }
        rating={professor.ratingAverage}
        onPress={handlePress}
      />
    );
  };

  return (
    <StudyList
      items={professors}
      renderItem={renderProfessor}
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
