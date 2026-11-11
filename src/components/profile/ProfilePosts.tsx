import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilters } from "@/@types/feed";
import { FeedPostCard } from "@/components/feed";
import {
  useFeedPosts,
  useLikedFeedPosts,
  useSavedFeedPosts,
} from "@/hooks/useFeed";
import { UIQueryError, UISkeleton, UIText } from "@/ui";

type PostsQuery = ReturnType<typeof useFeedPosts>;

type PostListProps = {
  query: PostsQuery;
  emptyMessage: string;
  /** the feed filters the posts were loaded with, so a like updates this list */
  filters?: FeedFilters;
};

// one profile tab's posts, inside the collapsible tabs container
function PostList({ query, emptyMessage, filters }: PostListProps) {
  const { t } = useTranslation();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = query;
  const posts = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRetry = () => refetch();

  return (
    <Tabs.FlashList
      data={posts}
      keyExtractor={(post) => post.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      onEndReached={handleEndReached}
      ListEmptyComponent={
        isPending ? (
          <UISkeleton height={120} />
        ) : isError ? (
          <UIQueryError message={t("apiState.error")} onRetry={handleRetry} />
        ) : (
          <UIText color="secondary">{emptyMessage}</UIText>
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? <UISkeleton height={110} /> : null
      }
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <FeedPostCard post={item} filters={filters} />
        </View>
      )}
    />
  );
}

export function OwnPosts({ authorId }: { authorId: string }) {
  const { t } = useTranslation();
  const filters = { authorId };
  const query = useFeedPosts(filters);
  return (
    <PostList
      query={query}
      emptyMessage={t("students.noPosts")}
      filters={filters}
    />
  );
}

export function LikedPosts() {
  const { t } = useTranslation();
  const query = useLikedFeedPosts();
  return <PostList query={query} emptyMessage={t("students.noLikedPosts")} />;
}

export function SavedPosts() {
  const { t } = useTranslation();
  const query = useSavedFeedPosts();
  return <PostList query={query} emptyMessage={t("students.noSavedPosts")} />;
}

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingTop: theme.vs(16),
    paddingHorizontal: theme.s(20),
    paddingBottom: theme.vs(60),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
}));
