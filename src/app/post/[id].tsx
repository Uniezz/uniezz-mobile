import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
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
import { EaseView } from "react-native-ease";
import {
  KeyboardChatScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { FeedComment, FeedNavigationFilters } from "@/@types/feed";
import {
  CommentComposer,
  CommentItem,
  PostCard,
  PostSummary,
} from "@/components/feed";
import { ReportSheet } from "@/components/report";
import {
  useDeleteFeedPost,
  useFeedPost,
  useFeedPostNavigation,
} from "@/hooks/useFeed";
import { useFeedComments } from "@/hooks/useFeedComments";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISkeleton,
  UIText,
} from "@/ui";
import { HEADER_TRANSITION } from "@/utils";

// lifts the visible comments with the keyboard, so the one being read stays in view;
// the list ends above the home indicator (UIPage pads it), which the keyboard already covers
const CommentsScrollView = (props: ScrollViewProps) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} offset={bottom} />;
};

export default function PostScreen() {
  const { id, ...filters } = useLocalSearchParams<
    FeedNavigationFilters & { id: string }
  >();
  const { t } = useTranslation();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { data: profile } = useMyProfile();
  const { data: navigation } = useFeedPostNavigation(id, filters);
  const {
    data: commentPages,
    isPending: areCommentsPending,
    isError: areCommentsError,
    refetch: refetchComments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeedComments(id);
  const comments =
    commentPages?.pages.flatMap((page) => page.items ?? []) ?? [];
  const { mutateAsync: deletePost, isPending: isDeleting } =
    useDeleteFeedPost();
  const listRef = useRef<FlashListRef<FeedComment>>(null);
  const postReportRef = useRef<BottomSheetModal>(null);
  const commentReportRef = useRef<BottomSheetModal>(null);
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [reportTarget, setReportTarget] = useState<FeedComment | null>(null);
  // once the full card has scrolled away, a compact summary of the post is pinned under the header
  const [cardHeight, setCardHeight] = useState(0);
  const [isSummaryShown, setIsSummaryShown] = useState(false);
  const isAuthor = Boolean(post && profile?.id === post.author.id);
  // the composer floats over the list's end, so the list reserves its height
  const [composerHeight, setComposerHeight] = useState(0);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const handleComposerLayout = (event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
  };

  const handleBackPress = () => router.back();
  // replace, not push: back from any neighbour returns to the list.
  const openPost = (postId: string) =>
    router.replace({
      pathname: "/post/[id]",
      params: { ...filters, id: postId },
    });
  const handlePreviousPress = () =>
    navigation?.previousId && openPost(navigation.previousId);
  const handleNextPress = () =>
    navigation?.nextId && openPost(navigation.nextId);
  const handleEditPress = () =>
    router.push({ pathname: "/post/edit/[id]", params: { id } });
  const handleReportPress = () => postReportRef.current?.present();
  const handleCommentReport = (comment: FeedComment) => {
    setReportTarget(comment);
    commentReportRef.current?.present();
  };
  const handleCancelReply = () => setReplyTo(null);

  const handleCardLayout = (event: LayoutChangeEvent) => {
    setCardHeight(event.nativeEvent.layout.height);
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsSummaryShown(
      cardHeight > 0 && event.nativeEvent.contentOffset.y > cardHeight,
    );
  };
  const handleSummaryPress = () =>
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };

  const confirmDelete = async () => {
    try {
      await deletePost(id);
      toast.success(t("apiState.postDeleted"));
      router.back();
    } catch {
      toast.error(t("apiState.error"));
    }
  };
  const handleDeletePress = () =>
    Alert.alert(
      t("apiState.deletePostTitle"),
      t("apiState.deletePostDescription"),
      [
        { text: t("postComposer.cancel"), style: "cancel" },
        { text: t("app.remove"), style: "destructive", onPress: confirmDelete },
      ],
    );

  const listHeader = isPending ? (
    <UISkeleton height={260} />
  ) : isError || !post ? (
    <UIQueryError message={t("apiState.error")} onRetry={refetch} />
  ) : (
    <View style={styles.listHeader}>
      <View onLayout={handleCardLayout}>
        <PostCard post={post} />
      </View>
      <View style={styles.commentsHeading}>
        <UIText size="title3" weight="semibold">
          {t("app.comments")}
        </UIText>
        <UIText size="sm" color="secondary">
          {post.commentsCount}
        </UIText>
      </View>
    </View>
  );

  return (
    <UIPage>
      <View style={styles.screen}>
        <View style={styles.header}>
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.back")}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={18} />
          </UIIconButton>
          <UIText size="md" weight="semibold" style={styles.grow}>
            {t("postComposer.post")}
          </UIText>
          {navigation ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("feed.previousPost")}
              disabled={!navigation.previousId}
              onPress={handlePreviousPress}
              style={styles.navButton(Boolean(navigation.previousId))}
            >
              <Icon name="chevron-up" size={18} />
            </UIIconButton>
          ) : null}
          {navigation ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("feed.nextPost")}
              disabled={!navigation.nextId}
              onPress={handleNextPress}
              style={styles.navButton(Boolean(navigation.nextId))}
            >
              <Icon name="chevron-down" size={18} />
            </UIIconButton>
          ) : null}
          {isAuthor ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("apiState.editPost")}
              onPress={handleEditPress}
            >
              <Icon name="pencil" size={18} />
            </UIIconButton>
          ) : null}
          {isAuthor ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("app.remove")}
              disabled={isDeleting}
              onPress={handleDeletePress}
            >
              <Icon name="trash" size={18} />
            </UIIconButton>
          ) : null}
          {post && !isAuthor ? (
            <UIIconButton
              accessibilityRole="button"
              accessibilityLabel={t("report.post")}
              onPress={handleReportPress}
            >
              <Icon name="flag" size={18} />
            </UIIconButton>
          ) : null}
        </View>
        <View style={styles.grow}>
          <FlashList
            ref={listRef}
            renderScrollComponent={CommentsScrollView}
            data={post ? comments : []}
            keyExtractor={(comment) => comment.id}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list(composerHeight)}
            onEndReached={handleEndReached}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              !post ? null : areCommentsPending ? (
                <UISkeleton height={64} />
              ) : areCommentsError ? (
                <UIQueryError
                  message={t("apiState.error")}
                  onRetry={refetchComments}
                />
              ) : (
                <UIText color="secondary">{t("app.empty")}</UIText>
              )
            }
            ListFooterComponent={
              isFetchingNextPage ? <UISkeleton height={64} /> : null
            }
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                myId={profile?.id}
                onReply={setReplyTo}
                onReport={handleCommentReport}
              />
            )}
          />
          {post ? (
            <EaseView
              animate={{
                opacity: isSummaryShown ? 1 : 0,
                translateY: isSummaryShown ? 0 : -8,
              }}
              transition={HEADER_TRANSITION}
              pointerEvents={isSummaryShown ? "auto" : "none"}
              style={styles.summary}
            >
              <PostSummary post={post} onPress={handleSummaryPress} />
            </EaseView>
          ) : null}
        </View>
        {post ? (
          // UIPage already lifts the composer off the home indicator; above the keyboard that gap is dropped
          <KeyboardStickyView
            offset={{ opened: bottomInset }}
            style={styles.composer}
            onLayout={handleComposerLayout}
          >
            <CommentComposer
              postId={id}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
            />
          </KeyboardStickyView>
        ) : null}
      </View>
      <ReportSheet ref={postReportRef} targetId={id} targetType="post" />
      <ReportSheet
        ref={commentReportRef}
        targetId={reportTarget?.id ?? ""}
        targetType="comment"
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    height: theme.vs(44),
    marginTop: theme.vs(8),
    marginBottom: theme.vs(12),
    paddingHorizontal: theme.s(16),
  },
  navButton: (enabled: boolean) => ({
    opacity: enabled ? 1 : 0.3,
  }),
  grow: {
    flex: 1,
  },
  list: (composerHeight: number) => ({
    paddingHorizontal: theme.s(16),
    paddingBottom: composerHeight + theme.vs(16),
  }),
  listHeader: {
    gap: theme.vs(16),
    paddingBottom: theme.vs(16),
  },
  commentsHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.s(8),
  },
  summary: {
    position: "absolute",
    top: 0,
    left: theme.s(16),
    right: theme.s(16),
  },
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
