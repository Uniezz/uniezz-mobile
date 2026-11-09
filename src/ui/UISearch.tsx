import type { ComponentProps } from "react";
import { Pressable, TextInput } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Icon } from "./icons";
import { UIGlass } from "./UIGlass";

const ThemedTextInput = withUnistyles(TextInput, (theme) => ({
  placeholderTextColor: theme.colors.white60,
  selectionColor: theme.colors.white,
}));

type UISearchProps = Omit<ComponentProps<typeof TextInput>, "style"> & {
  /** runs the search; shows a submit button on the right and fires on the keyboard's search key */
  onSubmit?: () => void;
  /** accessibility label of the submit button */
  submitLabel?: string;
};

export function UISearch({ onSubmit, submitLabel, ...props }: UISearchProps) {
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
        onSubmitEditing={onSubmit}
        style={styles.input}
      />
      {onSubmit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          onPress={onSubmit}
          style={styles.submit}
        >
          <Icon
            name="arrow-up"
            size={16}
            uniProps={(theme) => ({ color: theme.colors.ink })}
          />
        </Pressable>
      ) : null}
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
  submit: {
    width: theme.vs(30),
    height: theme.vs(30),
    marginRight: -theme.s(7),
    borderRadius: theme.vs(15),
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    color: theme.colors.white,
    fontFamily: theme.fonts.Geist,
    fontSize: theme.vs(15),
  },
}));
