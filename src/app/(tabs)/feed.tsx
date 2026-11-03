import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native-unistyles";
import { useFeedPosts } from "@/hooks/useFeed";
import { FEED_TYPES, matchesSearch } from "@/utils";
import {
  UIChip,
  UIGlass,
  UIPage,
  UIQueryError,
  UISearch,
  UISkeleton,
  UIText,
} from "@/ui";

export default function FeedScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<(typeof FEED_TYPES)[number]>("all");
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useFeedPosts(type === "all" ? {} : { type });
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
            <UIText size="xl" weight="bold">
              {t("feed.title")}
            </UIText>
            <UISearch
              placeholder="Search posts"
              value={search}
              onChangeText={setSearch}
            />
            <View style={styles.filters}>
              {FEED_TYPES.map((item) => (
                <UIChip
                  key={item}
                  label={item}
                  selected={type === item}
                  onPress={() => setType(item)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <UISkeleton height={180} />
          ) : isError ? (
            <UIQueryError message="Couldn’t load posts" onRetry={refetch} />
          ) : (
            <UIText color="secondary">No posts found</UIText>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? <UISkeleton height={110} /> : null
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/feed/post/[id]",
                params: { id: item.id },
              })
            }
            style={styles.cell}
          >
            <UIGlass style={styles.card}>
              <UIText size="xs" color="link">
                {item.type.toUpperCase()}
              </UIText>
              <UIText size="md" weight="semibold">
                {item.title}
              </UIText>
              <UIText size="sm" color="secondary" numberOfLines={4}>
                {item.content}
              </UIText>
              <UIText size="xs" color="secondary">
                {item.author.firstName} {item.author.lastName} ·{" "}
                {item.university}
              </UIText>
            </UIGlass>
          </Pressable>
        )}
      />
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { paddingHorizontal: theme.s(12), paddingBottom: theme.vs(100) },
  header: { gap: theme.vs(14), padding: theme.s(8) },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: theme.s(8) },
  cell: { padding: theme.s(5) },
  card: { padding: theme.s(14), gap: theme.vs(8) },
}));
