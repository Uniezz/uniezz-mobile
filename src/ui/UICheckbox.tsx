import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";

export function UICheckbox({
  checked,
  label,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={styles.box(checked)}>
        {checked ? <UIText size="sm">✓</UIText> : null}
      </View>
      <UIText>{label}</UIText>
    </Pressable>
  );
}
const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: theme.vs(44),
    gap: theme.s(10),
  },
  box: (checked: boolean) => ({
    width: theme.s(22),
    height: theme.s(22),
    borderRadius: theme.s(6),
    borderWidth: 1,
    borderColor: checked ? theme.colors.blue : theme.colors.white40,
    backgroundColor: checked ? theme.colors.blue : theme.colors.white5,
    alignItems: "center",
    justifyContent: "center",
  }),
}));
