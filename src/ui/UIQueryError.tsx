import { View } from "react-native";
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
    <View
      accessible
      accessibilityRole="alert"
      style={{ gap: 12, alignItems: "center", padding: 20 }}
    >
      <UIText color="secondary">{message}</UIText>
      <UIButton type="secondary" disabled={retrying} onPress={() => onRetry()}>
        <UIText>{retrying ? "Retrying…" : "Retry"}</UIText>
      </UIButton>
    </View>
  );
}
