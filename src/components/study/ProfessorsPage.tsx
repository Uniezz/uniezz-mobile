import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { Professor } from "@/@types/study";
import { useProfessors } from "@/hooks/useProfessors";
import { StudyList } from "./StudyList";
import { ProfessorRow } from "./ProfessorRow";

type ProfessorsPageProps = {
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function ProfessorsPage({
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
  } = useProfessors();
  const professors = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderProfessor = (professor: Professor) => {
    return <ProfessorRow professor={professor} />;
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
