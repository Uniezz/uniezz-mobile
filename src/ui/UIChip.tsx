import { Platform, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UIText } from "./UIText";
import { Icon } from "./icons";
import { Label } from "expo-router/build/react-navigation";
import { boolean } from "zod/v3";
import { check } from "zod";

type UIChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const UIChip = ({ label, selected = false, onPress }: UIChipProps) => {
  const isOS = Platform.OS === "ios";

  return (
    <Pressable
      onPress={onPress}
      style={styles.chip({ selected, isIOS: isOS })}
    >
      {selected && !isOS ? (
        <View style={styles.check}>
          <Icon name="check" size={12} color="white" />
        </View>
      ) : null}
      <UIText
        size="sm"
        weight={selected ? "semibold" : undefined}
        color={selected ? (isOS ? "brand" : "white") : "secondary"}
      >
        {label}
      </UIText>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  chip: ({ selected, isIOS }: { selected: boolean; isIOS: boolean }) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(6),
    paddingVertical: theme.vs(7),
    paddingHorizontal: theme.s(13),
    borderRadius: isIOS ? 999 : theme.vs(8),
    backgroundColor: selected ? theme.colors.brand : theme.colors.white,
    borderWidth: selected ? 0 : theme.vs(1),
    borderColor: theme.colors.graySoft,
  }),
  check: {
    width: theme.s(14),
    height: theme.vs(14),
    borderRadius: theme.vs(7),
    backgroundColor: theme.colors.brandDeep,
    alignItems: "center",
    justifyContent: "center",
  },
}));
