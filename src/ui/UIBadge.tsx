import { View } from "react-native";
import { UIText } from "./UIText";
import { StyleSheet } from "react-native-unistyles";

export function UIBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <View style={styles.badge} accessibilityLabel={`${count} unread`}>
      <UIText size="xs" weight="bold">
        {count > 99 ? "99+" : count}
      </UIText>
    </View>
  );
}
const styles = StyleSheet.create((theme) => ({
  badge: {
    minWidth: theme.s(20),
    height: theme.vs(20),
    borderRadius: theme.vs(10),
    backgroundColor: theme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.s(4),
  },
}));
