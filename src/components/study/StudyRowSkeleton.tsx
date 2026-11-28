import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIGlass, UISkeleton } from "@/ui";

type StudyRowSkeletonProps = {
  /** stacked copies, e.g. a screenful while the list loads */
  count?: number;
};

// a placeholder course or professor card: name, details, then the average and your stars
export const StudyRowSkeleton = ({ count = 1 }: StudyRowSkeletonProps) => (
  <View>
    {Array.from({ length: count }, (_, index) => (
      <View key={index} style={styles.cell}>
        <UIGlass radius={16} style={styles.card}>
          <View style={styles.text}>
            <UISkeleton width="60%" height={14} borderRadius={7} />
            <UISkeleton width="40%" height={10} borderRadius={5} />
          </View>
          <View style={styles.rating}>
            <UISkeleton width={90} height={24} borderRadius={8} />
            <UISkeleton width={120} height={24} borderRadius={8} />
          </View>
        </UIGlass>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  // StudyRow's spacing
  cell: { paddingBottom: theme.vs(8) },
  card: { padding: theme.s(12), gap: theme.vs(12) },
  text: { gap: theme.vs(8) },
  rating: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
