import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UISkeleton, UISkeletonText } from "@/ui";

type PostCardSkeletonProps = {
  /** stacked copies, e.g. a screenful while the feed loads */
  count?: number;
};

// a placeholder post, shaped like PostCard: author, title, body and a photo
export const PostCardSkeleton = ({ count = 1 }: PostCardSkeletonProps) => (
  <View style={styles.list}>
    {Array.from({ length: count }, (_, index) => (
      <View key={index} style={styles.card}>
        <View style={styles.inset}>
          <View style={styles.author}>
            <UISkeleton width={32} height={32} borderRadius={16} />
            <UISkeleton width="40%" height={12} borderRadius={6} />
          </View>
          <UISkeleton width="70%" height={24} borderRadius={8} />
          <UISkeletonText lines={3} />
        </View>
        <UISkeleton height={180} borderRadius={16} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  list: { gap: theme.vs(12) },
  // PostCard's surface
  card: {
    gap: theme.vs(16),
    paddingHorizontal: theme.s(6),
    paddingVertical: theme.vs(10),
    borderRadius: theme.vs(24),
    borderWidth: 1,
    borderColor: theme.colors.white14,
    backgroundColor: theme.colors.white3,
  },
  inset: {
    gap: theme.vs(14),
    paddingHorizontal: theme.s(4),
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(8),
  },
}));
