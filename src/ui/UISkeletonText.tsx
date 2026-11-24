import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UISkeleton } from "./UISkeleton";

type UISkeletonTextProps = {
  /** lines of text; the last is shorter, as a paragraph's last line */
  lines?: number;
  /** stacked copies, e.g. several comments while they load */
  count?: number;
};

// placeholder text lines, shaped like the paragraph they stand in for
export function UISkeletonText({ lines = 2, count = 1 }: UISkeletonTextProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, block) => (
        <View key={block} style={styles.block}>
          {Array.from({ length: lines }, (_, line) => (
            <UISkeleton
              key={line}
              height={12}
              borderRadius={6}
              width={line === lines - 1 && lines > 1 ? "60%" : "100%"}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { gap: theme.vs(20) },
  block: { gap: theme.vs(8) },
}));
