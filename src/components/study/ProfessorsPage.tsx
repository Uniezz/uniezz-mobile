import { router } from "expo-router";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { Professor } from "@/@types";
import { useProfessors } from "@/hooks";
import { StudyList } from "./StudyList";
import { ProfessorRow } from "./ProfessorRow";

type ProfessorsPageProps = {
  universityId?: string;
  query: string;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function ProfessorsPage({
  universityId,
  query,
  headerHeight,
  onScroll,
}: ProfessorsPageProps) {
  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProfessors(universityId, query);
  const professors = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  // a tapped professor opens their page with the reviews
  const handleProfessorPress = (professor: Professor) =>
    router.push(`/professor/${professor.id}`);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderProfessor = (professor: Professor) => {
    return (
      <ProfessorRow professor={professor} onPress={handleProfessorPress} />
    );
  };

  return (
    <StudyList
      items={professors}
      renderItem={renderProfessor}
      isPending={isPending}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      onRefresh={handleRefresh}
      onEndReached={handleEndReached}
      headerHeight={headerHeight}
      onScroll={onScroll}
    />
  );
}
