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
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProfessors(universityId, query);
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
