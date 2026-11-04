import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiFeedPost } from "@/@types/feed";
import { UIAvatar, UIGlass, UIImage, UIText } from "@/ui";
import { authorName, postDate } from "@/utils";

type FeedPostCardProps = {
  post: ApiFeedPost;
};

export const FeedPostCard = ({ post }: FeedPostCardProps) => {
  const { t, i18n } = useTranslation();
  const cover = post.type === "question" ? undefined : post.mediaUrls?.[0];
  const date = postDate(post, i18n.resolvedLanguage ?? "en");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("app.viewPost")}: ${post.title}`}
      onPress={() =>
        router.push({ pathname: "/feed/post/[id]", params: { id: post.id } })
      }
    >
      <UIGlass radius={20}>
        {cover ? (
          <View style={styles.cover}>
            <UIImage
              source={{ uri: cover }}
              fallback={undefined}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.chip}>
              <UIText size="xs" weight="semibold">
                {date}
              </UIText>
            </View>
          </View>
        ) : null}
        <View style={styles.body}>
          <View style={styles.author}>
            <UIAvatar size="xxs" imageSrc={post.author.avatarUrl} />
            <UIText
              size="xs"
              color="soft"
              numberOfLines={1}
              style={styles.name}
            >
              {authorName(post.author) || t("apiState.student")} ·{" "}
              {post.author.universityId.toUpperCase()}
              {cover ? "" : ` · ${date}`}
            </UIText>
          </View>
          <UIText weight="semibold" style={styles.title}>
            {post.title}
          </UIText>
          {cover ? null : (
            <UIText
              size="sm"
              color="secondary"
              numberOfLines={4}
              style={styles.preview}
            >
              {post.content}
            </UIText>
          )}
        </View>
      </UIGlass>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  cover: {
    height: theme.vs(120),
    padding: theme.s(10),
    alignItems: "flex-start",
  },
  chip: {
    paddingVertical: theme.vs(4),
    paddingHorizontal: theme.s(9),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.white20,
    backgroundColor: theme.colors.ink40,
  },
  body: {
    gap: theme.vs(8),
    padding: theme.s(12),
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
  },
  name: {
    flex: 1,
  },
  title: {
    lineHeight: theme.vs(15 * 1.3),
  },
  preview: {
    lineHeight: theme.vs(13 * 1.4),
  },
}));
