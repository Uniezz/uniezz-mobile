import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIGlass, UISkeleton } from "@/ui";

type FaqItemSkeletonProps = {
  /** stacked copies, e.g. a screenful while the questions load */
  count?: number;
};

// a placeholder question card, shaped like FaqItem
export const FaqItemSkeleton = ({ count = 1 }: FaqItemSkeletonProps) => (
  <View style={styles.list}>
    {Array.from({ length: count }, (_, index) => (
      <UIGlass key={index} radius={16} style={styles.card}>
        <UISkeleton width="85%" height={14} borderRadius={7} />
        <UISkeleton width="50%" height={14} borderRadius={7} />
      </UIGlass>
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  list: { gap: theme.vs(8) },
  card: { padding: theme.s(14), gap: theme.vs(8) },
}));
