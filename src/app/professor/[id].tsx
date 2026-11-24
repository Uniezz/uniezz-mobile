import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  View,
} from "react-native";
import {
  KeyboardChatScrollView,
  KeyboardStickyView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { ProfessorReview } from "@/@types";
import { ReportSheet } from "@/components/report";
import {
  ProfessorReviewForm,
  ProfessorReviewItem,
  ProfessorRow,
} from "@/components/study";
import {
  useDeleteMyProfessorReview,
  useProfessor,
  useProfessorReviews,
} from "@/hooks";
import {
  UICollapsingHeader,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { HEADER_COMPACT_OFFSET } from "@/utils";

// as on the course page: the keyboard pads the list instead of pushing it off screen
const ReviewsScrollView = (props: ScrollViewProps) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} offset={bottom} />;
};

// a professor's reviews, as on the web: anonymous, newest first; the stars stay on the list row.
// Your review lists with the others, without actions: you change or remove it in the form pinned
// at the bottom, whose field holds it
export default function ProfessorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: professor, isPending, isError, refetch } = useProfessor(id);
  const {
    data: reviewPages,
    isPending: areReviewsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfessorReviews(id);
  const { mutateAsync: deleteReview } = useDeleteMyProfessorReview(id);
  const reportRef = useRef<BottomSheetModal>(null);
  const [reportedReviewId, setReportedReviewId] = useState("");
  const [headerHeight, setHeaderHeight] = useState(0);
  const [formHeight, setFormHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);
  const reviews = reviewPages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const myReview = reviews.find((item) => item.isMine);

  const handleBackPress = () => router.back();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const handleFormLayout = (event: LayoutChangeEvent) => {
    setFormHeight(event.nativeEvent.layout.height);
  };
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleDeletePress = () => {
    const confirmDelete = async () => {
      try {
        await deleteReview();
        toast.success(t("study.reviewDeleted"));
      } catch {
        toast.error(t("apiState.error"));
      }
    };
    Alert.alert(
      t("study.deleteReviewTitle"),
      t("study.deleteReviewDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
      ],
    );
  };
  const handleReportPress = (item: ProfessorReview) => {
    setReportedReviewId(item.id);
    reportRef.current?.present();
  };

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("study.reviews")}
        isCompact={isHeaderCompact || isKeyboardVisible}
        onBackPress={handleBackPress}
        backLabel={t("app.back")}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        renderScrollComponent={ReviewsScrollView}
        keyboardShouldPersistTaps="handled"
        data={professor ? reviews : []}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list(
          headerHeight,
          professor ? formHeight : 0,
        )}
        onEndReached={handleEndReached}
        ListHeaderComponent={
          isPending ? (
            <UISkeleton height={120} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : (
            <View style={styles.page}>
              {/* the same card as in the list: average, and your stars to rate */}
              <ProfessorRow professor={professor} />
              {!areReviewsPending && reviews.length === 0 ? (
                <UIText color="secondary">{t("study.noReviews")}</UIText>
              ) : null}
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={56} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProfessorReviewItem
              review={item}
              onReportPress={handleReportPress}
            />
          </View>
        )}
      />
      {professor ? (
        // UIPage already lifts the form off the home indicator; above the keyboard that gap is dropped
        <KeyboardStickyView style={styles.form} onLayout={handleFormLayout}>
          <ProfessorReviewForm
            // a new form when your saved review changes, so the field starts from it
            key={myReview?.content ?? ""}
            professorId={id}
            myReviewContent={myReview?.content}
            onDeletePress={handleDeletePress}
          />
        </KeyboardStickyView>
      ) : null}
      <ReportSheet
        ref={reportRef}
        targetId={reportedReviewId}
        targetType="professor_review"
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number, formHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: formHeight + theme.vs(16),
  }),
  page: {
    paddingBottom: theme.vs(12),
    gap: theme.vs(16),
  },
  item: {
    paddingBottom: theme.vs(18),
  },
  form: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.ink,
    paddingHorizontal: theme.s(16),
    paddingTop: theme.vs(12),
    paddingBottom: theme.vs(12),
  },
}));
