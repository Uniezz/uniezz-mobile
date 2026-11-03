import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EventStories, FeedFilters, FeedPostCard } from "@/components/feed";
import type { FeedFilterValues } from "@/@types/feed";
import { useFeedPosts } from "@/hooks/useFeed";
import { useMyProfile } from "@/hooks/useMyProfile";
import {
  Icon,
  UIAvatar,
  UIIconButton,
  UIPage,
  UIQueryError,
  UISearch,
  UISkeleton,
  UIText,
} from "@/ui";
import { DATE_PRESETS, datePresetFrom, matchesSearch } from "@/utils";

export default function FeedScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<FeedFilterValues>({
    type: "all",
    university: null,
    date: "any",
  });
  const { data: profile } = useMyProfile();
  const handleToggleSearch = () => setIsSearching(!isSearching);
  const handleProfilePress = () => router.push("/profile");
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useFeedPosts({
    type: filters.type === "all" ? undefined : filters.type,
    university: filters.university ?? undefined,
    from: datePresetFrom(
      DATE_PRESETS.find(([date]) => date === filters.date)?.[2] ?? null,
    ),
  });
  const posts = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const visible = posts.filter((post) =>
    matchesSearch(
      search,
      post.title,
      post.content,
      post.author.firstName ?? "",
      post.author.lastName ?? "",
      post.university,
      ...(post.tags ?? []),
    ),
  );
  const events = posts.filter(
    (post) => post.type === "event" && post.mediaUrls?.length,
  );

  return (
    <UIPage backdrop="city">
      <FlashList
        data={visible}
        masonry
        numColumns={2}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) return fetchNextPage();
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.title}>
                <UIText size="sm" weight="medium" color="secondary">
                  {t("app.feedSubtitle")}
                </UIText>
                <UIText size="title1" weight="bold" style={styles.h1}>
                  {t("tabs.feed")}
                </UIText>
              </View>
              <UIIconButton
                accessibilityRole="button"
                accessibilityLabel={t("topbar.search")}
                onPress={handleToggleSearch}
              >
                <Icon name="search" size={18} />
              </UIIconButton>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("app.profile")}
                onPress={handleProfilePress}
              >
                <UIAvatar imageSrc={profile?.avatarUrl} />
              </Pressable>
            </View>
            {isSearching ? (
              <View style={styles.searchPanel}>
                <UISearch
                  autoFocus
                  placeholder={t("feed.search")}
                  value={search}
                  onChangeText={setSearch}
                />
                <FeedFilters value={filters} onChange={setFilters} />
              </View>
            ) : null}
            {!isSearching ? <EventStories events={events} /> : null}
          </View>
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
            <FeedPostCard post={item} />
          </View>
        )}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingTop: theme.vs(4),
    paddingHorizontal: theme.s(11),
    paddingBottom: theme.vs(110),
  },
  header: {
    gap: theme.vs(16),
    paddingHorizontal: theme.s(5),
    paddingBottom: theme.vs(16),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.s(8),
  },
  title: {
    flex: 1,
    gap: theme.vs(4),
  },
  h1: {
    letterSpacing: -1,
    lineHeight: theme.vs(26),
  },
  searchPanel: {
    gap: theme.vs(12),
  },
  // masonry has no column gap prop: 5 + 5 cell padding makes the 10pt gap
  cell: {
    paddingHorizontal: theme.s(5),
    paddingBottom: theme.vs(10),
  },
}));
