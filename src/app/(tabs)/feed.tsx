import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedPost, FeedView } from "@/@types/feed";
import { FeedList, PostComposer, PostDetails } from "@/components/feed";
import { UIAvatar, UIPage, UIText } from "@/ui";

const initialPosts: FeedPost[] = [
  {
    type: "EVENT",
    title: "Autumn Welcome Party",
    detail: "Olena Kovalenko, KUL · 9h",
    body: "Meet new people and start the semester together.",
  },
  {
    type: "QUESTION",
    title: "Statistics with dr hab. Nowak: written or oral final?",
    detail: "Campus discussion",
    body: "Does anyone know what the exam format will be this year?",
  },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState(initialPosts);
  const [view, setView] = useState<FeedView>({ screen: "list" });
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const active =
    view.screen === "post"
      ? posts.find((post) => post.title === view.title)
      : undefined;
  const header = (
    <View style={styles.header}>
      <View style={styles.title}>
        <UIText size="sm" color="secondary">
          Today on campus
        </UIText>
        <UIText size="xl" weight="bold">
          What’s happening in Lublin
        </UIText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={() => router.push("/profile")}
      >
        <UIAvatar imageSrc={require("../../../assets/profile-cat.png")} />
      </Pressable>
    </View>
  );
  return (
    <UIPage backdrop="city">
      {view.screen === "list" ? (
        <FeedList
          header={header}
          posts={posts}
          onOpen={(title) => setView({ screen: "post", title })}
          onCreate={() => setView({ screen: "compose" })}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.page}
          showsVerticalScrollIndicator={false}
        >
          {header}
          <Pressable
            accessibilityRole="button"
            onPress={() => setView({ screen: "list" })}
          >
            <UIText color="link">‹ Back to feed</UIText>
          </Pressable>
          {view.screen === "compose" ? (
            <PostComposer
              onPublish={(post) => {
                setPosts((current) => [post, ...current]);
                setView({ screen: "list" });
              }}
            />
          ) : active ? (
            <PostDetails
              key={active.title}
              post={active}
              comments={comments[active.title] ?? []}
              onComment={(comment) =>
                setComments((current) => ({
                  ...current,
                  [active.title]: [...(current[active.title] ?? []), comment],
                }))
              }
            />
          ) : null}
        </ScrollView>
      )}
    </UIPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  page: {
    paddingHorizontal: theme.s(16),
    paddingBottom: theme.vs(100),
    gap: theme.vs(18),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(12),
    paddingTop: theme.vs(8),
  },
  title: { flex: 1, gap: theme.vs(4) },
}));
