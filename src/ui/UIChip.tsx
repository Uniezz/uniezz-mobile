import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";
type UIChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const UIChip = ({ label, selected = false, onPress }: UIChipProps) => {
  return (
    <Pressable onPress={onPress} style={styles.chip({ selected })}>
      <UIText size="sm" weight="semibold" color={selected ? "black" : "soft"}>
        {label}
      </UIText>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: ({ selected }: { selected: boolean }) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(7),
    paddingHorizontal: theme.s(14),
    borderRadius: theme.vs(999),
    backgroundColor: selected ? theme.colors.white : theme.colors.white5,
    borderWidth: 1,
    borderColor: selected ? theme.colors.white : theme.colors.white10,
  }),
}));
