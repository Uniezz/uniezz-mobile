import type { ComponentProps } from "react";
import { TextInput } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Icon } from "./icons";
import { UIGlass } from "./UIGlass";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

export function UISearch(
  props: Omit<ComponentProps<typeof TextInput>, "style">,
) {
  return (
    <UIGlass radius={999} style={styles.container}>
      <Icon
        name="search"
        size={17}
        uniProps={(theme) => ({ color: theme.colors.white60 })}
      />
      <ThemedTextInput
        {...props}
        accessibilityRole="search"
        autoCorrect={false}
        style={styles.input}
      />
    </UIGlass>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.s(10),
    paddingHorizontal: theme.s(14),
    height: theme.vs(44),
  },
  input: {
    flex: 1,
    height: "100%",
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
  },
}));
