import ExpoQuickLook from "@magrinj/expo-quick-look";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { CourseFile } from "@/@types/study";
import { getStudyFile } from "@/api";
import { toast } from "sonner-native";
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
  } = useStudyFiles({ q: query || undefined, mine: true });
  const files = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderFile = (file: CourseFile) => {
    const [label, icon] = FILE_TYPES[file.type];
    const handlePress = async () => {
      try {
        const { url } = await getStudyFile(file.id);
        await ExpoQuickLook.previewFile({ uri: url, editingMode: "disabled" });
      } catch {
        toast.error(t("apiState.error"));
      }
    };
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
