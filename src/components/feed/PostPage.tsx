import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
  View,
} from "react-native";
import { EaseView } from "react-native-ease";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import type { FeedComment } from "@/@types/feed";
import { useFeedPost } from "@/hooks/useFeed";
import { useFeedComments } from "@/hooks/useFeedComments";
import { useMyProfile } from "@/hooks/useMyProfile";
import { UIEmpty, UIQueryError, UISkeleton, UIText } from "@/ui";
import { HEADER_TRANSITION } from "@/utils";
import { CommentItem } from "./CommentItem";
import { PostCard } from "./PostCard";
import { PostSummary } from "./PostSummary";

// lifts the visible comments with the keyboard, so the one being read stays in view;
// the list ends above the home indicator (UIPage pads it), which the keyboard already covers.
// `freeze` (passed through FlashList) keeps the off-screen pages from reacting to the keyboard.
const CommentsScrollView = (props: ScrollViewProps & { freeze?: boolean }) => {
  const { bottom } = useSafeAreaInsets();
  return <KeyboardChatScrollView {...props} offset={bottom} />;
};

type PostPageProps = {
  id: string;
  /** the page on screen; only it follows the keyboard */
  isCurrent: boolean;
  width: number;
  height: number;
  /** the composer floats over the list's end, so the list reserves its height */
  composerHeight: number;
  onReply: (comment: FeedComment) => void;
  onReport: (comment: FeedComment) => void;
};

// one post in the post pager: its card, then its comments
export const PostPage = ({
  id,
  isCurrent,
  width,
  height,
  composerHeight,
  onReply,
  onReport,
}: PostPageProps) => {
  const { t } = useTranslation();
  const { data: post, isPending, isError, refetch } = useFeedPost(id);
  const { data: profile } = useMyProfile();
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
  const listRef = useRef<FlashListRef<FeedComment>>(null);
  // once the full card has scrolled away, a compact summary of the post is pinned at the top
  const [cardHeight, setCardHeight] = useState(0);
  const [isSummaryShown, setIsSummaryShown] = useState(false);

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
    <View style={styles.page(width, height)}>
      <FlashList
        ref={listRef}
        renderScrollComponent={CommentsScrollView}
        // FlashList forwards these to its scroll component; a typed prop for it doesn't exist
        overrideProps={{ freeze: !isCurrent }}
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
            <UIEmpty message={t("app.empty")} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={64} /> : null
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            myId={profile?.id}
            onReply={onReply}
            onReport={onReport}
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
  );
};

const styles = StyleSheet.create((theme) => ({
  page: (width: number, height: number) => ({
    width,
    height,
  }),
  list: (composerHeight: number) => ({
    // lets the empty-state cat fill the space under the header and centre in it
    flexGrow: 1,
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
}));
