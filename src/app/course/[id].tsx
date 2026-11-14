import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import ExpoQuickLook from "@magrinj/expo-quick-look";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CommentFormValues } from "@/@types/feed";
import type { CourseComment } from "@/@types/study";
import { CommentComposer } from "@/components/feed";
import { ReportSheet } from "@/components/report";
import {
  CourseCommentItem,
  CourseFormSheet,
  RatingInput,
  StudyRow,
} from "@/components/study";
import {
  useAddCourseComment,
  useCourseComments,
  useDeleteCourseComment,
} from "@/hooks/useCourseComments";
import { useCourse, useRateCourse } from "@/hooks/useCourses";
import { useCourseFiles } from "@/hooks/useStudyFiles";
import { commentSchema } from "@/schemas";
import {
  Icon,
  UICollapsingHeader,
  UIGlass,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { FILE_TYPES, HEADER_COMPACT_OFFSET } from "@/utils";
import { captureAction } from "@/utils/analytics";
import { getStudyFile } from "@/api";
import { apiErrorKey } from "@/utils/apiErrorKey";

// shortcut: shows the first page of files only; add "show more" once courses carry many files
export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { data: course, isPending, isError, refetch } = useCourse(id);
  const { data: filePages } = useCourseFiles(id);
  const {
    data: commentPages,
    isPending: areCommentsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCourseComments(id);
  const { mutateAsync: rate, isPending: isRating } = useRateCourse();
  const { mutateAsync: addComment, isPending: isSending } =
    useAddCourseComment();
  const { mutateAsync: deleteComment } = useDeleteCourseComment(id);
  const reportRef = useRef<BottomSheetModal>(null);
  const editRef = useRef<BottomSheetModal>(null);
  // the API does not return the student's own rating, so it starts empty
  const [myRating, setMyRating] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [composerHeight, setComposerHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);
  const files = filePages?.pages[0]?.items ?? [];
  const comments =
    commentPages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
    mode: "onChange",
  });

  const showError = (error: unknown) => toast.error(t(apiErrorKey(error)));
  const handleBackPress = () => router.back();
  const handleReportPress = () => reportRef.current?.present();
  const handleEditPress = () => editRef.current?.present();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleComposerLayout = (event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
  };
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRatingChange = async (rating: number) => {
    setMyRating(rating);
    try {
      await rate({ id, rating });
    } catch (error) {
      setMyRating(0);
      showError(error);
    }
  };
  const handleSendPress = handleSubmit(
    async ({ content }) => {
      try {
        await addComment({ id, content });
        reset();
      } catch (error) {
        showError(error);
      }
    },
    () => captureAction(posthog, "course_comment_form", "validation_failed"),
  );
  const handleDeletePress = (comment: CourseComment) => {
    const confirmDelete = () =>
      deleteComment(comment.id).catch(() => toast.error(t("apiState.error")));
    Alert.alert(t("study.deleteCommentTitle"), undefined, [
      { text: t("postComposer.cancel"), style: "cancel" },
      { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
    ]);
  };

  const headerActions = course ? (
    <>
      {course.isMine ? (
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("study.editCourse")}
          onPress={handleEditPress}
        >
          <Icon name="pencil" size={18} />
        </UIIconButton>
      ) : null}
      <UIIconButton
        accessibilityRole="button"
        accessibilityLabel={t("report.course")}
        onPress={handleReportPress}
      >
        <Icon name="flag" size={18} />
      </UIIconButton>
    </>
  ) : null;

  return (
    <UIPage>
      <UICollapsingHeader
        title={course?.name ?? ""}
        isCompact={isHeaderCompact || isKeyboardVisible}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <KeyboardAvoidingView
        behavior="position"
        style={styles.listViewport}
        contentContainerStyle={styles.keyboardContent}
      >
        <FlashList
          data={course ? comments : []}
          keyExtractor={(comment) => comment.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list(headerHeight, composerHeight)}
          onEndReached={handleEndReached}
          ListHeaderComponent={
            isPending ? (
              <UISkeleton height={220} />
            ) : isError ? (
              <UIQueryError message={t("apiState.error")} onRetry={refetch} />
            ) : (
              <View style={styles.page}>
                <UIGlass radius={16} style={styles.card}>
                  <UIText color="secondary">
                    {`${course.subject} · ${course.faculty} · ${t("study.semesterShort", { semester: course.semester })}`}
                  </UIText>
                  <UIText color="soft">
                    {t("study.difficultyValue", {
                      difficulty: course.difficulty,
                    })}
                  </UIText>
                  {course.description ? (
                    <UIText style={styles.description}>
                      {course.description}
                    </UIText>
                  ) : null}
                  <UIText weight="semibold">
                    {course.ratingAverage > 0
                      ? t("study.ratingSummary", {
                          rating: course.ratingAverage.toFixed(1),
                          votes: course.ratingCount,
                        })
                      : t("study.noRatings")}
                  </UIText>
                  <UIText size="sm" color="secondary">
                    {t("study.yourRating")}
                  </UIText>
                  <RatingInput
                    value={myRating}
                    onChange={handleRatingChange}
                    disabled={isRating}
                  />
                </UIGlass>
                {files.length ? (
                  <View style={styles.section}>
                    <UIText size="md" weight="semibold">
                      {t("study.files")}
                    </UIText>
                    {files.map((file) => {
                      const label = FILE_TYPES[file.type];
                      const handlePress = async () => {
                        try {
                          const { url } = await getStudyFile(file.id);
                          await ExpoQuickLook.previewFile({
                            uri: url,
                            editingMode: "disabled",
                          });
                        } catch {
                          toast.error(t("apiState.error"));
                        }
                      };
                      return (
                        <StudyRow
                          key={file.id}
                          title={file.title}
                          subtitle={t(label)}
                          onPress={handlePress}
                        />
                      );
                    })}
                  </View>
                ) : null}
                <UIText size="md" weight="semibold">
                  {t("study.comments")}
                </UIText>
                {areCommentsPending ? <UISkeleton height={56} /> : null}
                {!areCommentsPending && comments.length === 0 ? (
                  <UIText color="secondary">{t("study.noComments")}</UIText>
                ) : null}
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? <UISkeleton height={56} /> : null
          }
          renderItem={({ item }) => (
            <CourseCommentItem
              comment={item}
              onDeletePress={handleDeletePress}
            />
          )}
        />
      </KeyboardAvoidingView>
      {course ? (
        // UIPage already lifts the composer off the home indicator; above the keyboard that gap is dropped
        <KeyboardStickyView
          style={styles.composer}
          onLayout={handleComposerLayout}
        >
          <CommentComposer
            control={control}
            isSendDisabled={isSending || !isValid}
            onSendPress={handleSendPress}
          />
        </KeyboardStickyView>
      ) : null}
      <ReportSheet ref={reportRef} targetId={id} targetType="course" />
      {course?.isMine ? (
        <CourseFormSheet ref={editRef} course={course} />
      ) : null}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  listViewport: { flex: 1 },
  keyboardContent: { flex: 1 },
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number, composerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: composerHeight + theme.vs(16),
  }),
  page: {
    paddingBottom: theme.vs(4),
    gap: theme.vs(16),
  },
  card: {
    padding: theme.s(16),
    gap: theme.vs(8),
  },
  description: { lineHeight: theme.vs(22) },
  section: { gap: theme.vs(4) },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.ink,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(12),
  },
}));
