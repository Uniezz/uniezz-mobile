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
      <UIText
        size="sm"
        weight={selected ? "semibold" : undefined}
        color={selected ? "white" : "secondary"}
      >
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
    paddingHorizontal: theme.s(13),
    borderRadius: theme.vs(8),
    backgroundColor: selected ? theme.colors.brand : theme.colors.white,
    borderWidth: theme.vs(1),
    borderColor: selected ? theme.colors.brand : theme.colors.graySoft,
  }),
}));
