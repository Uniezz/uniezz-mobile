import {
  FlashList,
  type FlashListRef,
  type ListRenderItemInfo,
} from "@shopify/flash-list";
import type { ReactElement, Ref } from "react";
import { useTranslation } from "react-i18next";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedFilters } from "@/@types/feed";
import type { ProfileListItem } from "@/@types/profile";
import { FeedPostCard } from "@/components/feed";
import { useFeedPosts } from "@/hooks/useFeed";
import { UIEmpty, UIQueryError, UISkeleton } from "@/ui";

type PostsQuery = ReturnType<typeof useFeedPosts>;

type ProfilePostListProps = {
  ref?: Ref<FlashListRef<ProfileListItem>>;
  index: number;
  query: PostsQuery;
  emptyMessage: string;
  filters?: FeedFilters;
  overview: ReactElement;
  renderTabBar: (isPinned: boolean) => ReactElement;
  headerOffset: number;
  tabBarHeight: number;
  isActive: boolean;
  onScroll: (index: number, offset: number) => void;
};

export function ProfilePostList({
  ref,
  index,
  query,
  emptyMessage,
  filters,
  overview,
  renderTabBar,
  headerOffset,
  tabBarHeight,
  isActive,
  onScroll,
}: ProfilePostListProps) {
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
  const items: ProfileListItem[] = ["overview", "tabs", ...posts];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    onScroll(index, event.nativeEvent.contentOffset.y);
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
  };
  const handleRetry = () => refetch();

  const renderItem = ({ item, target }: ListRenderItemInfo<ProfileListItem>) =>
    item === "overview" ? (
      overview
    ) : item === "tabs" ? (
      renderTabBar(target === "StickyHeader")
    ) : (
      <View style={styles.cell}>
        <FeedPostCard post={item} filters={filters} />
      </View>
    );

  return (
    <FlashList
      ref={ref}
      data={items}
      keyExtractor={(item) => (typeof item === "string" ? item : item.id)}
      getItemType={(item) => (typeof item === "string" ? item : "post")}
      renderItem={renderItem}
      stickyHeaderIndices={[1]}
      stickyHeaderConfig={{ offset: headerOffset }}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onEndReached={handleEndReached}
      showsVerticalScrollIndicator={false}
      pointerEvents={isActive ? "auto" : "none"}
      style={styles.list(isActive)}
      contentContainerStyle={styles.content}
      ListFooterComponent={
        <View
          style={styles.footer(
            posts.length === 0 ? headerOffset + tabBarHeight : null,
          )}
        >
          {isPending || isFetchingNextPage ? (
            <UISkeleton height={120} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={handleRetry} />
          ) : posts.length === 0 ? (
            <UIEmpty message={emptyMessage} />
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  list: (isActive: boolean) => ({
    ...StyleSheet.absoluteFillObject,
    opacity: isActive ? 1 : 0,
  }),
  content: {
    paddingBottom: theme.vs(60),
  },
  cell: {
    paddingTop: theme.vs(16),
    paddingHorizontal: theme.s(20),
  },
  footer: (coveredHeight: number | null) => ({
    minHeight:
      coveredHeight === null
        ? undefined
        : rt.screen.height - rt.insets.top - rt.insets.bottom - coveredHeight,
    paddingTop: theme.vs(16),
    paddingHorizontal: theme.s(20),
  }),
}));
