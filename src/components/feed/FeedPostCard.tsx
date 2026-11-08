import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiFeedPost, FeedNavigationFilters } from "@/@types/feed";
import { UIAvatar, UIGlass, UIImage, UIText } from "@/ui";
import { authorName, postDate } from "@/utils";

type FeedPostCardProps = {
  post: ApiFeedPost;
  // Active list filters, so previous/next on the post screen stays inside this list.
  filters?: FeedNavigationFilters;
};

export const FeedPostCard = ({ post, filters }: FeedPostCardProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const cover = post.type === "question" ? undefined : post.mediaUrls?.[0];
  const hasCover = Boolean(cover);
  const createdAt = postDate(
    { eventDate: null, createdAt: post.createdAt },
    locale,
  );
  const eventDate = post.eventDate ? postDate(post, locale) : "";
  const handlePress = () =>
    router.push({
      pathname: "/post/[id]",
      params: { ...filters, id: post.id },
    });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("app.viewPost")}: ${post.title}`}
      onPress={handlePress}
    >
      <UIGlass radius={24} style={styles.card(hasCover)}>
        <View style={styles.author}>
          <UIAvatar size="sm" imageSrc={post.author.avatarUrl} />
          <UIText size="sm" color="soft" numberOfLines={1} style={styles.name}>
            {authorName(post.author) || t("apiState.student")} ·{" "}
            {post.author.universityId.toUpperCase()} · {createdAt}
          </UIText>
        </View>
        <View style={styles.body}>
          <UIText weight="semibold" style={styles.title}>
            {post.title}
          </UIText>
          {hasCover ? null : (
            <UIText color="secondary" numberOfLines={4} style={styles.preview}>
              {post.content}
            </UIText>
          )}
        </View>
        {cover ? (
          <View style={styles.cover}>
            <UIImage
              source={{ uri: cover }}
              fallback={undefined}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            {eventDate ? (
              <View style={styles.chip}>
                <UIText size="xs" weight="semibold">
                  {eventDate}
                </UIText>
              </View>
            ) : null}
          </View>
        ) : null}
      </UIGlass>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  // the cover sits 6pt from the card edge; text is indented 10pt more, so every card's text lines up at 16pt
  card: (hasCover: boolean) => ({
    gap: theme.vs(16),
    paddingTop: theme.vs(16),
    paddingBottom: hasCover ? theme.s(6) : theme.vs(16),
    paddingHorizontal: theme.s(6),
    borderColor: theme.colors.white14,
    backgroundColor: theme.colors.white3,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.white5}, ${theme.colors.white0} 70%)`,
  }),
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    paddingHorizontal: theme.s(10),
  },
  name: {
    flex: 1,
  },
  body: {
    gap: theme.vs(10),
    paddingHorizontal: theme.s(10),
  },
  title: {
    fontSize: theme.vs(19),
    lineHeight: theme.vs(19 * 1.35),
    letterSpacing: -0.2,
  },
  preview: {
    lineHeight: theme.vs(15 * 1.5),
  },
  cover: {
    height: theme.vs(208),
    padding: theme.s(10),
    alignItems: "flex-start",
    borderRadius: theme.vs(12),
    overflow: "hidden",
  },
  chip: {
    paddingVertical: theme.vs(4),
    paddingHorizontal: theme.s(9),
    borderRadius: theme.vs(999),
    borderWidth: 1,
    borderColor: theme.colors.white20,
    backgroundColor: theme.colors.ink40,
  },
}));
