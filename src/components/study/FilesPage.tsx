import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { CourseFile } from "@/@types/study";
import { useStudyFiles } from "@/hooks/useStudyFiles";
import { FILE_TYPES } from "@/utils";
import { StudyList } from "./StudyList";
import { StudyRow } from "./StudyRow";

type FilesPageProps = {
  /** the submitted search */
  query: string;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function FilesPage({ query, headerHeight, onScroll }: FilesPageProps) {
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
  } = useStudyFiles({ q: query || undefined });
  const files = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderFile = (file: CourseFile) => {
    const [label, icon] = FILE_TYPES[file.type];
    const handlePress = () => WebBrowser.openBrowserAsync(file.url);
    return (
      <StudyRow
        icon={icon}
        title={file.title}
        subtitle={t(label)}
        onPress={handlePress}
      />
    );
  };

  return (
    <StudyList
      items={files}
      renderItem={renderFile}
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
