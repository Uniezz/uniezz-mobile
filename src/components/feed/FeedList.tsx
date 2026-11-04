import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIChip, UIGlass, UIInput, UIText } from "@/ui";
import type { FeedPost } from "@/@types/feed";

const stories = [
  "Your story",
  "Coffee & code",
  "Rowing open day",
  "Bread workshop",
];
const storyImages = [
  require("../../../assets/feed-coffee.jpg"),
  require("../../../assets/feed-rowing.jpg"),
  require("../../../assets/feed-bread.jpg"),
];

export function FeedList({
  header,
  posts,
  onOpen,
  onCreate,
}: {
  header: ReactNode;
  posts: FeedPost[];
  onOpen: (title: string) => void;
  onCreate: () => void;
}) {
  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const visible = posts.filter(
    (post) =>
      (selected === "All" ||
        post.type === selected.slice(0, -1).toUpperCase()) &&
      `${post.title} ${post.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <FlashList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={visible}
      masonry
      numColumns={2}
      optimizeItemArrangement={false}
      keyExtractor={(post) => post.title}
      extraData={liked}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          {header}
          <View style={styles.searchRow}>
            <View style={styles.search}>
              <UIInput
                placeholder="Search posts"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Pressable accessibilityRole="button" onPress={onCreate}>
              <UIText color="link" weight="semibold">
                + Post
              </UIText>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stories}
          >
            {stories.map((story, index) => (
              <View key={story} style={styles.story}>
                <View
                  style={[
                    styles.storyArt,
                    index % 2 ? styles.storyBlue : styles.storyViolet,
                  ]}
                >
                  {index > 0 && (
                    <Image
                      source={storyImages[index - 1]}
                      contentFit="cover"
                      style={styles.storyImage}
                    />
                  )}
                  <UIText size="lg">{index ? "✦" : "+"}</UIText>
                </View>
                <UIText size="xs" numberOfLines={2}>
                  {story}
                </UIText>
              </View>
            ))}
          </ScrollView>
          <View style={styles.filters}>
            {["All", "Events", "Questions"].map((filter) => (
              <UIChip
                key={filter}
                label={filter}
                selected={selected === filter}
                onPress={() => setSelected(filter)}
              />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <UIText color="secondary">No posts match your search.</UIText>
      }
      renderItem={({ item: post }) => (
        <View style={styles.postCell}>
          <UIGlass style={styles.card}>
            <View style={styles.cardTop}>
              <UIText
                size="xs"
                weight="bold"
                style={
                  post.type === "EVENT"
                    ? styles.eventLabel
                    : styles.questionLabel
                }
              >
                {post.type}
              </UIText>
              <UIText size="xs" color="secondary">
                {post.detail}
              </UIText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpen(post.title)}
            >
              <UIText size="md" weight="bold">
                {post.title}
              </UIText>
            </Pressable>
            <UIText color="soft">{post.body}</UIText>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setLiked((current) =>
                  current.includes(post.title)
                    ? current.filter((item) => item !== post.title)
                    : [...current, post.title],
                )
              }
            >
              <UIText
                color={liked.includes(post.title) ? "error" : "secondary"}
              >
                {liked.includes(post.title) ? "♥ Liked" : "♡ Like"}
              </UIText>
            </Pressable>
          </UIGlass>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { flex: 1 },
  listContent: { paddingHorizontal: theme.s(11), paddingBottom: theme.vs(100) },
  listHeader: {
    gap: theme.vs(18),
    paddingHorizontal: theme.s(5),
    paddingTop: theme.vs(8),
    paddingBottom: theme.vs(18),
  },
  postCell: { paddingHorizontal: theme.s(5), paddingBottom: theme.vs(10) },
  searchRow: { flexDirection: "row", alignItems: "center", gap: theme.s(12) },
  search: { flex: 1 },
  stories: { gap: theme.s(10) },
  story: { width: theme.s(96), gap: theme.vs(6) },
  storyArt: {
    height: theme.vs(136),
    borderRadius: theme.vs(18),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storyImage: { position: "absolute", width: "100%", height: "100%" },
  storyBlue: { backgroundColor: theme.colors.blue40 },
  storyViolet: { backgroundColor: theme.colors.violet20 },
  filters: { flexDirection: "row", gap: theme.s(8) },
  card: { padding: theme.s(12), gap: theme.vs(10) },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.s(8),
  },
  eventLabel: { color: theme.colors.amber },
  questionLabel: { color: theme.colors.sky },
}));
