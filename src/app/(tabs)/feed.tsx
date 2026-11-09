import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet } from "react-native-unistyles";
import { FeaturedPosts, FeedFilters, FeedPostCard } from "@/components/feed";
import type { FeedFilterValues } from "@/@types/feed";
import { useFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIBottomSheet,
  UICollapsingHeader,
  UIEmpty,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISearchOverlay,
  UISkeleton,
} from "@/ui";
import {
  DATE_PRESETS,
  datePresetFrom,
  HEADER_COMPACT_OFFSET,
  HEADER_TRANSITION,
  toSearchQuery,
} from "@/utils";

export default function FeedScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  // the feed filters by `query`, applied only on submit; `search` is the text being typed
  const [query, setQuery] = useState("");
  const handleSearchSubmit = () => {
    setQuery(search);
    Keyboard.dismiss();
  };
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<FeedFilterValues>({
    type: "all",
    university: null,
    date: "any",
  });
  const { data: profile } = useMyProfile();
  const filtersRef = useRef<BottomSheetModal>(null);
  // the header floats over the list; the list starts below it and turns the header compact once scrolled
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderCompact(
      event.nativeEvent.contentOffset.y > HEADER_COMPACT_OFFSET,
    );
  };
  const handleHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  // the search field only exists while the keyboard is up; blurring it closes it, the query stays
  const handleSearchPress = () => setIsSearching(true);
  const handleSearchBlur = () => setIsSearching(false);
  const handleFiltersPress = () => filtersRef.current?.present();
  const handleProfilePress = () => router.push("/profile");
  const handleNewPostPress = () => router.push("/feed/new");
  const isNewPostShown = isHeaderCompact || Boolean(query);
  const feedFilters = {
    q: toSearchQuery(query),
    type: filters.type === "all" ? undefined : filters.type,
    university: filters.university ?? undefined,
    from: datePresetFrom(
      DATE_PRESETS.find(([date]) => date === filters.date)?.[2] ?? null,
    ),
  };
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useFeedPosts(feedFilters);
  const posts = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const headerActions = (
    <>
      <View style={styles.actions}>
        {/* stands in for the "Add event" tile once it has scrolled away (or is hidden by a search);
            positioned outside the row, so the expanded header keeps its full title width */}
        <EaseView
          animate={{
            opacity: isNewPostShown ? 1 : 0,
            scale: isNewPostShown ? 1 : 0.6,
          }}
          transition={HEADER_TRANSITION}
          pointerEvents={isNewPostShown ? "auto" : "none"}
          accessibilityElementsHidden={!isNewPostShown}
          importantForAccessibility={
            isNewPostShown ? "auto" : "no-hide-descendants"
          }
          style={styles.newPost}
        >
          <UIIconButton
            accessibilityRole="button"
            accessibilityLabel={t("app.newPost")}
            onPress={handleNewPostPress}
          >
            <Icon name="plus" size={18} />
          </UIIconButton>
        </EaseView>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("topbar.search")}
          onPress={handleSearchPress}
        >
          <Icon name="search" size={18} />
        </UIIconButton>
        <UIIconButton
          accessibilityRole="button"
          accessibilityLabel={t("feed.filtersTitle")}
          onPress={handleFiltersPress}
        >
          <Icon name="sliders-horizontal" size={18} />
        </UIIconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("app.profile")}
          onPress={handleProfilePress}
        >
          <UIAvatar imageSrc={profile?.avatarUrl} />
        </Pressable>
      </View>
    </>
  );

  return (
    <UIPage>
      <UICollapsingHeader
        title={t("tabs.feed")}
        subtitle={t("app.feedSubtitle")}
        isCompact={isHeaderCompact}
        actions={headerActions}
        onLayout={handleHeaderLayout}
      />
      <FlashList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        progressViewOffset={headerHeight}
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list(headerHeight)}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
        }}
        ListHeaderComponent={
          query ? null : (
            <View style={styles.header}>
              <FeaturedPosts />
            </View>
          )
        }
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={180} />
          ) : isError ? (
            <UIQueryError message={t("apiState.error")} onRetry={refetch} />
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={110} /> : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FeedPostCard post={item} filters={feedFilters} />
          </View>
        )}
      />
      {/* beside the list, not inside it, so the cat centres on the screen like every other empty state */}
      {!isPending && !isError && posts.length === 0 ? (
        <UIEmpty isScreenCentred message={t("app.empty")} />
      ) : null}
      <UISearchOverlay
        isOpen={isSearching}
        value={search}
        onChangeText={setSearch}
        onSubmit={handleSearchSubmit}
        onClose={handleSearchBlur}
        placeholder={t("feed.search")}
        submitLabel={t("topbar.search")}
      />
      <UIBottomSheet ref={filtersRef} title={t("feed.filtersTitle")}>
        <BottomSheetView style={styles.filtersSheet}>
          <FeedFilters value={filters} onChange={setFilters} />
        </BottomSheetView>
      </UIBottomSheet>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // same spacing as the header row the actions sit in
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
  newPost: {
    position: "absolute",
    right: "100%",
    marginRight: theme.s(8),
  },
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
  header: {
    paddingBottom: theme.vs(20),
  },
  filtersSheet: {
    paddingBottom: rt.insets.bottom + theme.vs(16),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
}));
