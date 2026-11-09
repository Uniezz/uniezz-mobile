import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AccessibilityActionEvent,
  Alert,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type {
  CommentFormValues,
  FeedComment,
  FeedFilters,
} from "@/@types/feed";
import { CommentComposer, PostPage } from "@/components/feed";
import { ReportSheet } from "@/components/report";
import { useDeleteFeedPost, useFeedPost, useFeedPosts } from "@/hooks/useFeed";
import { useCreateComment } from "@/hooks/useFeedComments";
import { commentSchema } from "@/schemas";
import { captureAction } from "@/utils/analytics";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Icon, UIIconButton, UIPage, UIText } from "@/ui";

export default function PostScreen() {
  const { id, ...filters } = useLocalSearchParams<
    Omit<FeedFilters, "limit"> & { id: string }
  >();
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { width } = useWindowDimensions();
  const { data: post } = useFeedPost(id);
  const { data: profile } = useMyProfile();
  // the pager pages through the list the post was opened from (its filters come along in the params),
  // already cached by that screen; a post outside it (e.g. a featured event) gets a single page
  const {
    data: feedPages,
    isPending: isFeedPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeedPosts(filters);
  const feedIds =
    feedPages?.pages.flatMap(
      (page) => page.items?.map((item) => item.id) ?? [],
    ) ?? [];
  const ids = feedIds.includes(id) ? feedIds : [id];
  const index = ids.indexOf(id);
  const previousId = ids[index - 1] ?? "";
  const nextId = ids[index + 1] ?? "";

  const { createComment, isPending: isSending } = useCreateComment();
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
  const { mutateAsync: deletePost, isPending: isDeleting } =
    useDeleteFeedPost();
  const pagerRef = useRef<FlashListRef<string>>(null);
  const postReportRef = useRef<BottomSheetModal>(null);
  const commentReportRef = useRef<BottomSheetModal>(null);
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [reportTarget, setReportTarget] = useState<FeedComment | null>(null);
  const isAuthor = Boolean(post && profile?.id === post.author.id);
  const [composerHeight, setComposerHeight] = useState(0);
  // a horizontal list doesn't stretch its pages, so each gets the pager's measured height
  const [pagerHeight, setPagerHeight] = useState(0);
  const handlePagerLayout = (event: LayoutChangeEvent) => {
    setPagerHeight(event.nativeEvent.layout.height);
  };
  const { bottom: bottomInset } = useSafeAreaInsets();
  const handleComposerLayout = (event: LayoutChangeEvent) => {
    setComposerHeight(event.nativeEvent.layout.height);
  };

  const handleBackPress = () => router.back();
  // swaps the post in place (no navigation), so back still returns to the list
  const openPost = (postId: string) => {
    if (!postId || postId === id) return;
    router.setParams({ id: postId });
    reset();
    setReplyTo(null);
  };
  const handlePagerEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handlePageSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    openPost(ids[Math.round(event.nativeEvent.contentOffset.x / width)] ?? "");
  // VoiceOver/TalkBack can't swipe the pager, so the title offers the same moves as actions
  const navigationActions = [
    ...(previousId
      ? [{ name: "previous", label: t("feed.previousPost") }]
      : []),
    ...(nextId ? [{ name: "next", label: t("feed.nextPost") }] : []),
  ];
  const handleNavigationAction = ({
    nativeEvent,
  }: AccessibilityActionEvent) => {
    const toNext = nativeEvent.actionName === "next";
    pagerRef.current?.scrollToIndex({ index: index + (toNext ? 1 : -1) });
    openPost(toNext ? nextId : previousId);
  };
  const handleEditPress = () =>
    router.push({ pathname: "/post/edit/[id]", params: { id } });
  const handleReportPress = () => postReportRef.current?.present();
  const handleCommentReport = (comment: FeedComment) => {
    setReportTarget(comment);
    commentReportRef.current?.present();
  };
  const handleCancelReply = () => setReplyTo(null);
  const handleSendPress = handleSubmit(
    async ({ content }) => {
      try {
        await createComment({
          id,
          content,
          replyToCommentId: replyTo?.id,
        });
        reset();
        setReplyTo(null);
        toast.success(t("apiState.commentSent"));
      } catch {
        toast.error(t("apiState.error"));
      }
    },
    () => captureAction(posthog, "comment_form", "validation_failed"),
  );

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
          <UIText
            size="md"
            weight="semibold"
            style={styles.grow}
            accessibilityActions={navigationActions}
            onAccessibilityAction={handleNavigationAction}
          >
            {t("postComposer.post")}
          </UIText>
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
        <View style={styles.grow} onLayout={handlePagerLayout}>
          {/* waits for the list, so the pager opens on this post's page */}
          {pagerHeight && !isFeedPending ? (
            <FlashList
              ref={pagerRef}
              horizontal
              pagingEnabled
              data={ids}
              initialScrollIndex={index}
              onEndReached={handlePagerEndReached}
              // in screen widths, i.e. posts: the next feed page starts loading 5 posts before the end
              onEndReachedThreshold={5}
              keyExtractor={(postId) => postId}
              extraData={{ composerHeight, id }}
              // renders the neighbour pages before they scroll into view
              drawDistance={width}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handlePageSettled}
              renderItem={({ item }) => (
                // keyed so a page never shows another post's scroll position or summary state
                <PostPage
                  key={item}
                  id={item}
                  isCurrent={item === id}
                  width={width}
                  height={pagerHeight}
                  composerHeight={composerHeight}
                  onReply={setReplyTo}
                  onReport={handleCommentReport}
                />
              )}
            />
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
              control={control}
              isSendDisabled={isSending || !isValid}
              onSendPress={handleSendPress}
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
  grow: {
    flex: 1,
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
