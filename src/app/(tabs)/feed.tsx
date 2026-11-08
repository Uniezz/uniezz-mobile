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
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import {
  FeaturedPosts,
  FeedFilters,
  FeedHeader,
  FeedPostCard,
} from "@/components/feed";
import type { FeedFilterValues } from "@/@types/feed";
import { useFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  UIBottomSheet,
  UIPage,
  UIQueryError,
  UISearch,
  UISkeleton,
  UIText,
} from "@/ui";
import {
  DATE_PRESETS,
  datePresetFrom,
  FEED_HEADER_COMPACT_OFFSET,
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
      event.nativeEvent.contentOffset.y > FEED_HEADER_COMPACT_OFFSET,
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

  return (
    <UIPage>
      <FeedHeader
        isCompact={isHeaderCompact}
        avatarUrl={profile?.avatarUrl}
        onLayout={handleHeaderLayout}
        onSearchPress={handleSearchPress}
        onFiltersPress={handleFiltersPress}
        onProfilePress={handleProfilePress}
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
          ) : (
            <UIText color="secondary">{t("app.empty")}</UIText>
          )
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
      {isSearching ? (
        // blurs the feed while typing; touching it (tap or scroll) dismisses the keyboard
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.searchBackdrop}
          onTouchStart={Keyboard.dismiss}
        >
          <BlurView intensity={40} tint="dark" style={styles.searchBlur} />
        </Animated.View>
      ) : null}
      {isSearching ? (
        <KeyboardStickyView style={styles.searchBar}>
          <UISearch
            autoFocus
            returnKeyType="search"
            placeholder={t("feed.search")}
            value={search}
            onChangeText={setSearch}
            onSubmit={handleSearchSubmit}
            submitLabel={t("topbar.search")}
            onBlur={handleSearchBlur}
          />
        </KeyboardStickyView>
      ) : null}
      <UIBottomSheet ref={filtersRef} title={t("feed.filtersTitle")}>
        <BottomSheetView style={styles.filtersSheet}>
          <FeedFilters value={filters} onChange={setFilters} />
        </BottomSheetView>
      </UIBottomSheet>
    </UIPage>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // UIPage already pads the status bar; the rest of the header height is added here
  list: (headerHeight: number) => ({
    paddingTop: Math.max(headerHeight - rt.insets.top, 0),
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(110),
  }),
  header: {
    paddingBottom: theme.vs(20),
  },
  // above the pinned header (zIndex 1), so search blurs the whole screen
  searchBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  // shortcut: Android shows only the ink tint (no BlurTargetView around the feed), add one if Android needs real blur
  searchBlur: {
    flex: 1,
    backgroundColor: theme.colors.ink40,
  },
  // pinned to the bottom, so the keyboard lifts it to sit just above the keys
  searchBar: {
    position: "absolute",
    zIndex: 3,
    left: theme.s(16),
    right: theme.s(16),
    bottom: theme.vs(8),
  },
  filtersSheet: {
    paddingBottom: rt.insets.bottom + theme.vs(16),
  },
  cell: {
    paddingBottom: theme.vs(16),
  },
}));
