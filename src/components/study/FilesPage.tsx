import ExpoQuickLook from "@magrinj/expo-quick-look";
import { useTranslation } from "react-i18next";
import {
  Alert,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { CourseFile } from "@/@types/study";
import { getStudyFile } from "@/api";
import { toast } from "sonner-native";
import { useDeleteStudyFile, useStudyFiles } from "@/hooks/useStudyFiles";
import { Icon, UIIconButton } from "@/ui";
import { FILE_TYPES } from "@/utils";
import { StudyList } from "./StudyList";
import { StudyRow } from "./StudyRow";

type FilesPageProps = {
  /** the submitted search */
  query: string;
  universityId?: string;
  semester?: number;
  headerHeight: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function FilesPage({
  query,
  universityId,
  semester,
  headerHeight,
  onScroll,
}: FilesPageProps) {
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
  } = useStudyFiles({
    q: query || undefined,
    universityId,
    semester,
    mine: true,
  });
  const { mutateAsync: deleteFile } = useDeleteStudyFile();
  const files = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRefresh = () => refetch();
  const renderFile = (file: CourseFile) => {
    const label = FILE_TYPES[file.type];
    const handlePress = async () => {
      try {
        const { url } = await getStudyFile(file.id);
        await ExpoQuickLook.previewFile({ uri: url, editingMode: "disabled" });
      } catch {
        toast.error(t("apiState.error"));
      }
    };
    // every file here is the student's own, so each row can delete it, as on the web
    const handleDeletePress = () => {
      const confirmDelete = async () => {
        try {
          await deleteFile(file.id);
          toast.success(t("study.fileDeleted"));
        } catch {
          toast.error(t("apiState.error"));
        }
      };
      Alert.alert(
        t("study.deleteFileTitle"),
        t("study.deleteFileDescription"),
        [
          { text: t("postComposer.cancel"), style: "cancel" },
          {
            text: t("app.remove"),
            style: "destructive",
            onPress: confirmDelete,
          },
        ],
      );
    };
    return (
      <StudyRow
        title={file.title}
        subtitle={t(label)}
        onPress={handlePress}
        action={
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("study.deleteFile")}
            onPress={handleDeletePress}
          >
            <Icon
              name="trash"
              size={18}
              uniProps={(theme) => ({ color: theme.colors.red })}
            />
          </UIIconButton>
        }
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
