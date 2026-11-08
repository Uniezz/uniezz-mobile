import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ApiFeedPost } from "@/@types/feed";
import { UIAvatar, UIGlass, UIText } from "@/ui";
import { authorName } from "@/utils";

type PostSummaryProps = {
  post: ApiFeedPost;
  /** e.g. scroll back up to the full post */
  onPress: () => void;
};

// compact post context pinned under the header once the full card has scrolled away
export const PostSummary = ({ post, onPress }: PostSummaryProps) => {
  const { t } = useTranslation();

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <UIGlass radius={14} style={styles.card}>
        <UIAvatar size="xs" imageSrc={post.author.avatarUrl} />
        <View style={styles.text}>
          <UIText size="xs" weight="semibold" color="soft" numberOfLines={1}>
            {authorName(post.author) || t("apiState.student")} ·{" "}
            {post.author.universityId.toUpperCase()}
          </UIText>
          <UIText size="sm" weight="semibold" numberOfLines={2}>
            {post.title}
          </UIText>
        </View>
      </UIGlass>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.s(10),
    paddingVertical: theme.vs(8),
    paddingHorizontal: theme.s(12),
    borderColor: theme.colors.white12,
  },
  text: {
    flex: 1,
    gap: theme.vs(4),
  },
}));
