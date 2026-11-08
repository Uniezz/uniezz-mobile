import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIButton } from "./UIButton";
import { UIText } from "./UIText";

export function UIQueryError({
  message,
  onRetry,
  retrying = false,
}: {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <View accessible accessibilityRole="alert" style={styles.container}>
      <UIText color="secondary">{message}</UIText>
      <UIButton type="secondary" disabled={retrying} onPress={() => onRetry()}>
        <UIText>{retrying ? "Retrying…" : "Retry"}</UIText>
      </UIButton>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.vs(12),
    alignItems: "center",
    padding: theme.s(20),
  },
}));
