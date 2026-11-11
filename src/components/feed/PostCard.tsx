import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiFeedPost } from "@/@types/feed";
import { Icon, UIText } from "@/ui";
import { postDate } from "@/utils";
import { AuthorRow } from "./AuthorRow";
import { LikeButton } from "./LikeButton";
import { PostMedia } from "./PostMedia";
import { PostTag } from "./PostTag";
import { SaveButton } from "./SaveButton";

type PostCardProps = {
  post: ApiFeedPost;
};

// the full post on its own screen: author, title, body, media, tags, likes and audience
// (the comment count is in the "Comments" heading below it)
export const PostCard = ({ post }: PostCardProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  const createdAt = postDate(
    { eventDate: null, createdAt: post.createdAt },
    locale,
  );
  const eventDate = post.eventDate ? postDate(post, locale) : "";

  return (
    <View style={styles.card}>
      <AuthorRow author={post.author} meta={createdAt} style={styles.inset} />
      <View style={styles.text}>
        <UIText weight="semibold" style={[styles.title, styles.inset]}>
          {post.title}
        </UIText>
        {post.type === "event" && eventDate ? (
          <View style={[styles.row, styles.inset]}>
            <Icon
              name="calendar"
              size={14}
              uniProps={(theme) => ({ color: theme.colors.white60 })}
            />
            <UIText size="sm" color="secondary">
              {eventDate}
            </UIText>
          </View>
        ) : null}
        {post.content ? (
          <UIText size="rg" color="soft" style={[styles.body, styles.inset]}>
            {post.content}
          </UIText>
        ) : null}
      </View>
      {post.mediaUrls?.length ? <PostMedia urls={post.mediaUrls} /> : null}
      {post.tags?.length ? (
        <View style={[styles.tags, styles.inset]}>
          {post.tags.map((tag) => (
            <PostTag key={tag} tag={tag} />
          ))}
        </View>
      ) : null}
      <View style={[styles.stats, styles.inset]}>
        <LikeButton
          id={post.id}
          kind="post"
          liked={post.likedByMe}
          count={post.likesCount}
        />
        <View style={[styles.row, styles.grow]}>
          <Icon
            name="users"
            size={14}
            uniProps={(theme) => ({ color: theme.colors.iconMuted })}
          />
          <UIText size="sm" color="soft">
            {post.university === "all"
              ? t("feed.allStudents")
              : post.university.toUpperCase()}
          </UIText>
        </View>
        <SaveButton id={post.id} saved={post.savedByMe} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  // same surface as the feed cards: faint fill, top highlight, 24pt corners
  card: {
    gap: theme.vs(16),
    paddingHorizontal: theme.s(6),
    paddingVertical: theme.vs(10),
    borderRadius: theme.vs(24),
    borderWidth: 1,
    borderColor: theme.colors.white14,
    backgroundColor: theme.colors.white3,
    experimental_backgroundImage: `linear-gradient(to bottom, ${theme.colors.white5}, ${theme.colors.white0} 65%)`,
    overflow: "hidden",
  },
  // text sits 10pt in from the card; media runs closer to its edge
  inset: {
    paddingHorizontal: theme.s(4),
  },
  // title, event date and body read as one block
  text: {
    gap: theme.vs(8),
  },
  title: {
    fontSize: theme.vs(26),
    lineHeight: theme.vs(26 * 1.25),
    letterSpacing: -0.6,
  },
  body: {
    lineHeight: theme.vs(16 * 1.55),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(5),
  },
  grow: {
    flex: 1,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.s(8),
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(14),
    paddingTop: theme.vs(12),
    borderTopWidth: 1,
    borderTopColor: theme.colors.white8,
  },
}));
